import React, { useEffect, useMemo, useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useNetworkStore, accountData } from '../store/networkStore';
import { OOUX_DEFINITIONS } from '../data/oouxModel';
import TeamNameModal from './TeamNameModal';
import StatusWidget from './StatusWidget';
import SearchModal from './SearchModal';
import TourModal from './TourModal';
import SankeyChart from './SankeyChart';

const formatBytes = (bytes) => {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)}GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)}MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)}KB`;
  return `${bytes}B`;
};

const formatNumber = (n) => {
  if (n == null || Number.isNaN(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
};

const quantile = (arr, q) => {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] === undefined) return sorted[base];
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
};

const toDatetimeLocalValue = (ts) => {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const parseDatetimeLocal = (value) => {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : null;
};

const formatTimestampForTitle = (ts) => {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return 'Unknown time';
    return d.toLocaleString();
  } catch {
    return 'Unknown time';
  }
};

const Sparkline = ({ series, stroke = '#111827' }) => {
  const width = 220;
  const height = 50;
  const padding = 4;

  const points = useMemo(() => {
    if (!series || series.length === 0) return '';
    const xs = series.map((_, i) => i);
    const ys = series.map((p) => p.y);

    const minX = 0;
    const maxX = Math.max(1, Math.max(...xs));
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const scaleX = (x) => padding + (x - minX) * ((width - padding * 2) / (maxX - minX || 1));
    const scaleY = (y) => {
      const denom = maxY - minY || 1;
      return height - padding - (y - minY) * ((height - padding * 2) / denom);
    };

    return series
      .map((p, i) => `${scaleX(i).toFixed(1)},${scaleY(p.y).toFixed(1)}`)
      .join(' ');
  }, [series]);

  return (
    <svg width={width} height={height} className="block">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
    </svg>
  );
};

const MetricCard = ({ title, description, value, subtitle, icon: Icon, series, color }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-gray-600 uppercase truncate">{title}</div>
          {description ? <div className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</div> : null}
          <div className="mt-1 text-2xl font-bold text-gray-900 truncate">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-gray-600 truncate">{subtitle}</div> : null}
        </div>
        {Icon ? (
          <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        ) : null}
      </div>
      {series ? (
        <div className="mt-3 overflow-hidden">
          <Sparkline series={series} stroke={color} />
        </div>
      ) : null}
    </div>
  );
};

const ActivityDashboard = () => {
  const {
    appView,
    setAppView,
    accountTeamNames,
    setAccountTeamName,
    nodes,
    edges,
    activityEnabled,
    setActivityEnabled,
    activityMode,
    setActivityMode,
    activityWindowMs,
    setActivityWindowMs,
    playbackTime,
    setPlaybackTime,
    playbackPlaying,
    setPlaybackPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    playbackAnchorEnd,
    setPlaybackAnchorEnd,
    activityEvents,
    addActivityEvent,
    setActivityEvents,
    clearActivityEvents,
    accounts,
    currentAccountId,
    setShowSummaryNodes,
    setSelectedNode,
  } = useNetworkStore();

  const currentAccount = accounts?.find((a) => a.id === currentAccountId) || accounts?.[0];
  const teamName = accountTeamNames?.[currentAccountId] || 'My Team';

  const [showTeamNameModal, setShowTeamNameModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [timeRangeMode, setTimeRangeMode] = useState('preset');
  const [customStart, setCustomStart] = useState(() => toDatetimeLocalValue(Date.now() - 5 * 60_000));
  const [customEnd, setCustomEnd] = useState(() => toDatetimeLocalValue(Date.now()));
  const [showExportReport, setShowExportReport] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportEmails, setReportEmails] = useState('');
  const sankeyContainerRef = useRef(null);
  const [sankeyWidth, setSankeyWidth] = useState(600);
  const [sankeyVertical, setSankeyVertical] = useState(false);
  const [selectedSankeyNode, setSelectedSankeyNode] = useState(null);

  const activityMultiplier = accountData[currentAccountId]?.activityMultiplier ?? 1.0;

  // Measure Sankey container width and determine orientation
  useEffect(() => {
    const updateWidth = () => {
      if (sankeyContainerRef.current) {
        const containerWidth = sankeyContainerRef.current.offsetWidth - 32;
        setSankeyWidth(containerWidth);
        setSankeyVertical(containerWidth < 500);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (!edges || edges.length === 0) return;
    if (activityEvents && activityEvents.length > 0) return;

    const now = Date.now();
    const seedWindowMs = 60 * 60 * 1000;
    const start = now - seedWindowMs;
    const baseStepMs = 1000;
    const stepMs = Math.max(100, Math.round(baseStepMs / activityMultiplier));
    const count = Math.max(1, Math.floor(seedWindowMs / stepMs));

    const seeded = [];
    for (let i = 0; i < count; i++) {
      const ts = start + i * stepMs;
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const allow = Math.random() < 0.92;
      const error = Math.random() < 0.03;

      const latencyBase = 30 + Math.random() * 120;
      const latencyJitter = Math.random() * 80;
      const latencyMs = Math.max(5, Math.round(latencyBase + latencyJitter + (error ? 250 : 0)));
      const bytes = Math.round(500 + Math.random() * 50_000);

      seeded.push({
        id: `seed-${ts}-${i}`,
        ts,
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        decision: allow ? 'allow' : 'block',
        status: error ? 'error' : 'ok',
        latencyMs,
        bytes,
      });
    }

    setActivityEvents(seeded);
    setPlaybackAnchorEnd(now);
    setPlaybackTime(now);
  }, [edges, activityEvents, setActivityEvents, setPlaybackAnchorEnd, setPlaybackTime, activityMultiplier, currentAccountId]);

  useEffect(() => {
    if (!activityEnabled) return undefined;
    if (activityMode !== 'live') return undefined;
    if (!edges || edges.length === 0) return undefined;

    const baseIntervalMs = 350;
    const intervalMs = Math.max(100, Math.round(baseIntervalMs / activityMultiplier));

    const interval = window.setInterval(() => {
      const now = Date.now();
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const allow = Math.random() < 0.92;
      const error = Math.random() < 0.03;

      const latencyBase = 30 + Math.random() * 120;
      const latencyJitter = Math.random() * 80;
      const latencyMs = Math.max(5, Math.round(latencyBase + latencyJitter + (error ? 250 : 0)));

      const bytes = Math.round(500 + Math.random() * 50_000);

      addActivityEvent({
        id: `evt-${now}-${Math.floor(Math.random() * 1_000_000)}`,
        ts: now,
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        decision: allow ? 'allow' : 'block',
        status: error ? 'error' : 'ok',
        latencyMs,
        bytes,
      });

      setPlaybackAnchorEnd(now);
      if (playbackPlaying && activityMode === 'live') {
        setPlaybackTime(now);
      }
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [activityEnabled, activityMode, edges, addActivityEvent, setPlaybackAnchorEnd, playbackPlaying, setPlaybackTime, activityMultiplier]);

  useEffect(() => {
    if (timeRangeMode !== 'custom') return;
    const startTs = parseDatetimeLocal(customStart);
    const endTs = parseDatetimeLocal(customEnd);

    if (!startTs || !endTs || startTs > endTs) {
      const now = Date.now();
      const nextEnd = now;
      const nextStart = now - activityWindowMs;
      setCustomEnd(toDatetimeLocalValue(nextEnd));
      setCustomStart(toDatetimeLocalValue(nextStart));
      setPlaybackAnchorEnd(nextEnd);
      setPlaybackTime(nextEnd);
      return;
    }

    setPlaybackAnchorEnd(endTs);
    if (activityMode === 'playback') {
      setPlaybackTime(startTs);
    }
  }, [timeRangeMode, customStart, customEnd, activityMode, activityWindowMs, setPlaybackAnchorEnd, setPlaybackTime]);

  useEffect(() => {
    if (activityMode !== 'playback') return undefined;
    if (!playbackPlaying) return undefined;

    const rangeEnd = Number.isFinite(playbackAnchorEnd) ? playbackAnchorEnd : Date.now();
    const rangeStart = timeRangeMode === 'custom'
      ? (parseDatetimeLocal(customStart) ?? (rangeEnd - activityWindowMs))
      : (rangeEnd - activityWindowMs);

    const tick = window.setInterval(() => {
      setPlaybackTime((prev) => {
        const next = prev + 250 * playbackSpeed;
        return next > rangeEnd ? rangeStart : next;
      });
    }, 250);

    return () => window.clearInterval(tick);
  }, [activityMode, playbackPlaying, playbackSpeed, playbackAnchorEnd, timeRangeMode, customStart, activityWindowMs, setPlaybackTime]);

  useEffect(() => {
    if (activityMode !== 'playback') return;

    const now = Date.now();
    const rangeEnd = Number.isFinite(playbackAnchorEnd) ? playbackAnchorEnd : now;
    const rangeStart = timeRangeMode === 'custom'
      ? (parseDatetimeLocal(customStart) ?? (rangeEnd - activityWindowMs))
      : (rangeEnd - activityWindowMs);

    const safeTime = Number.isFinite(playbackTime) ? playbackTime : rangeStart;
    const clamped = Math.min(rangeEnd, Math.max(rangeStart, safeTime));

    if (!Number.isFinite(playbackAnchorEnd)) {
      setPlaybackAnchorEnd(rangeEnd);
    }
    if (!Number.isFinite(playbackTime) || clamped !== playbackTime) {
      setPlaybackTime(clamped);
    }
  }, [activityMode, activityWindowMs, playbackAnchorEnd, playbackTime, timeRangeMode, customStart, setPlaybackAnchorEnd, setPlaybackTime]);

  const referenceTime = activityMode === 'live' ? Date.now() : playbackTime;
  const customStartTs = timeRangeMode === 'custom' ? parseDatetimeLocal(customStart) : null;
  const customEndTs = timeRangeMode === 'custom' ? parseDatetimeLocal(customEnd) : null;
  const playbackRangeEnd = activityMode === 'playback'
    ? (Number.isFinite(playbackAnchorEnd) ? playbackAnchorEnd : Date.now())
    : referenceTime;
  const playbackRangeStart = timeRangeMode === 'custom' && customStartTs
    ? customStartTs
    : playbackRangeEnd - activityWindowMs;

  const effectiveEnd = timeRangeMode === 'custom' && customEndTs ? customEndTs : referenceTime;
  const windowStart = activityMode === 'playback'
    ? Math.max(playbackRangeStart, referenceTime - activityWindowMs)
    : (timeRangeMode === 'custom' && customStartTs ? customStartTs : (effectiveEnd - activityWindowMs));
  const effectiveWindowMs = Math.max(1, effectiveEnd - windowStart);

  const inWindowEvents = useMemo(() => {
    const start = windowStart;
    const end = effectiveEnd;
    return (activityEvents || []).filter((e) => e.ts >= start && e.ts <= end);
  }, [activityEvents, effectiveEnd, windowStart]);

  const buckets = useMemo(() => {
    const start = windowStart;
    const end = effectiveEnd;
    const bucketMs = Math.max(5_000, Math.round(effectiveWindowMs / 30));

    const count = Math.max(1, Math.ceil((end - start) / bucketMs));
    const out = Array.from({ length: count }, (_, i) => ({
      t: start + i * bucketMs,
      requests: 0,
      bytes: 0,
      errors: 0,
      blocks: 0,
      latencies: [],
    }));

    for (const e of inWindowEvents) {
      const idx = Math.min(out.length - 1, Math.max(0, Math.floor((e.ts - start) / bucketMs)));
      const b = out[idx];
      b.requests += 1;
      b.bytes += e.bytes || 0;
      if (e.status === 'error') b.errors += 1;
      if (e.decision === 'block') b.blocks += 1;
      if (typeof e.latencyMs === 'number') b.latencies.push(e.latencyMs);
    }

    return { out, bucketMs };
  }, [inWindowEvents, effectiveEnd, windowStart, effectiveWindowMs]);

  const series = useMemo(() => {
    const { out, bucketMs } = buckets;
    const minutesPerBucket = bucketMs / 60_000;

    const rps = out.map((b) => ({ x: b.t, y: (b.requests / (minutesPerBucket || 1)) }));
    const throughput = out.map((b) => ({ x: b.t, y: (b.bytes / (minutesPerBucket || 1)) }));
    const errorRate = out.map((b) => ({ x: b.t, y: b.requests ? (b.errors / b.requests) * 100 : 0 }));
    const blockRate = out.map((b) => ({ x: b.t, y: b.requests ? (b.blocks / b.requests) * 100 : 0 }));
    const p50 = out.map((b) => ({ x: b.t, y: quantile(b.latencies, 0.5) }));
    const p95 = out.map((b) => ({ x: b.t, y: quantile(b.latencies, 0.95) }));

    return { rps, throughput, errorRate, blockRate, p50, p95 };
  }, [buckets]);

  const totals = useMemo(() => {
    const req = inWindowEvents.length;
    const bytes = inWindowEvents.reduce((sum, e) => sum + (e.bytes || 0), 0);
    const errors = inWindowEvents.reduce((sum, e) => sum + (e.status === 'error' ? 1 : 0), 0);
    const blocks = inWindowEvents.reduce((sum, e) => sum + (e.decision === 'block' ? 1 : 0), 0);
    const latencies = inWindowEvents.map((e) => e.latencyMs).filter((v) => typeof v === 'number');

    return {
      req,
      bytes,
      errors,
      blocks,
      errorRate: req ? (errors / req) * 100 : 0,
      blockRate: req ? (blocks / req) * 100 : 0,
      p50: quantile(latencies, 0.5),
      p95: quantile(latencies, 0.95),
    };
  }, [inWindowEvents]);

  const topEdges = useMemo(() => {
    const counts = new Map();
    const blocks = new Map();
    const errors = new Map();

    for (const e of inWindowEvents) {
      const id = e.edgeId;
      counts.set(id, (counts.get(id) || 0) + 1);
      if (e.decision === 'block') blocks.set(id, (blocks.get(id) || 0) + 1);
      if (e.status === 'error') errors.set(id, (errors.get(id) || 0) + 1);
    }

    const edgeById = new Map((edges || []).map((ed) => [ed.id, ed]));

    const toRows = (m) =>
      [...m.entries()]
        .map(([edgeId, c]) => {
          const ed = edgeById.get(edgeId);
          return {
            edgeId,
            source: ed?.source,
            target: ed?.target,
            count: c,
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
      busiest: toRows(counts),
      mostBlocked: toRows(blocks),
      mostErrors: toRows(errors),
    };
  }, [inWindowEvents, edges]);

  const playbackMax = activityMode === 'playback' ? playbackRangeEnd : referenceTime;
  const playbackMin = activityMode === 'playback' ? playbackRangeStart : (playbackMax - activityWindowMs);
  const safePlaybackMax = Number.isFinite(playbackMax) ? playbackMax : Date.now();
  const safePlaybackMin = Number.isFinite(playbackMin) ? playbackMin : (safePlaybackMax - activityWindowMs);
  const safePlaybackTime = Number.isFinite(playbackTime)
    ? Math.min(safePlaybackMax, Math.max(safePlaybackMin, playbackTime))
    : safePlaybackMin;

  useEffect(() => {
    if (!showExportReport) return;
    const ts = safePlaybackTime;
    const defaultName = `Activity report for ${formatTimestampForTitle(ts)}`;
    setReportName((prev) => (prev && prev.trim() ? prev : defaultName));
  }, [showExportReport, safePlaybackTime]);

  const buildReportSummary = useMemo(() => {
    const rangeLabel = `${new Date(windowStart).toLocaleString()} → ${new Date(effectiveEnd).toLocaleString()}`;
    const lines = [
      `Team: ${teamName}`,
      `Mode: ${activityMode === 'live' ? 'Live' : 'Playback'}`,
      `Time range: ${rangeLabel}`,
      `Requests: ${totals.req}`,
      `Throughput (bytes): ${totals.bytes}`,
      `Errors: ${totals.errors} (${(totals.errorRate || 0).toFixed(1)}%)`,
      `Blocked: ${totals.blocks} (${(totals.blockRate || 0).toFixed(1)}%)`,
      `Latency p50: ${Math.round(totals.p50 || 0)}ms`,
      `Latency p95: ${Math.round(totals.p95 || 0)}ms`,
    ];
    return lines.join('\n');
  }, [teamName, activityMode, windowStart, effectiveEnd, totals]);

  const openPrintableReport = () => {
    const title = reportName && reportName.trim() ? reportName.trim() : `Activity report for ${formatTimestampForTitle(safePlaybackTime)}`;
    const rangeLabel = `${new Date(windowStart).toLocaleString()} → ${new Date(effectiveEnd).toLocaleString()}`;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; padding: 32px; color: #111827; }
      h1 { font-size: 22px; margin: 0 0 8px 0; }
      .meta { color: #4b5563; font-size: 12px; margin-bottom: 18px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
      .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 700; }
      .value { font-size: 18px; font-weight: 800; margin-top: 4px; }
      .sub { font-size: 12px; color: #4b5563; margin-top: 4px; }
      .section { margin-top: 18px; }
      .section h2 { font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; color: #374151; margin: 0 0 10px 0; }
      pre { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; font-size: 12px; white-space: pre-wrap; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <h1>${title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</h1>
    <div class="meta">Team: ${teamName.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')} • Mode: ${activityMode === 'live' ? 'Live' : 'Playback'} • Time range: ${rangeLabel}</div>
    <div class="grid">
      <div class="card"><div class="label">Requests</div><div class="value">${totals.req}</div><div class="sub">Visible range total</div></div>
      <div class="card"><div class="label">Throughput (bytes)</div><div class="value">${totals.bytes}</div><div class="sub">Visible range total</div></div>
      <div class="card"><div class="label">Error rate</div><div class="value">${(totals.errorRate || 0).toFixed(1)}%</div><div class="sub">Errors: ${totals.errors}</div></div>
      <div class="card"><div class="label">Block rate</div><div class="value">${(totals.blockRate || 0).toFixed(1)}%</div><div class="sub">Blocked: ${totals.blocks}</div></div>
      <div class="card"><div class="label">Latency p50</div><div class="value">${Math.round(totals.p50 || 0)}ms</div><div class="sub">Median latency</div></div>
      <div class="card"><div class="label">Latency p95</div><div class="value">${Math.round(totals.p95 || 0)}ms</div><div class="sub">Tail latency</div></div>
    </div>
    <div class="section">
      <h2>Summary</h2>
      <pre>${buildReportSummary.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</pre>
    </div>
  </body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      try {
        w.print();
      } catch {
        // ignore
      }
    }, 250);
  };

  const shareReportByEmail = () => {
    const title = reportName && reportName.trim() ? reportName.trim() : `Activity report for ${formatTimestampForTitle(safePlaybackTime)}`;
    const recipients = reportEmails
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(buildReportSummary);
    const to = encodeURIComponent(recipients.join(','));
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex">
      <div className="flex-1 overflow-y-auto relative">
        <div className="sticky top-0 z-10 bg-gray-50 px-4 pt-4 pb-3">
          <div className="flex flex-wrap items-start gap-2">
            <div className="flex flex-wrap items-stretch gap-2">
              <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-1 flex items-center" title="Cloudflare Zero Trust">
                <img src="https://cf-assets.www.cloudflare.com/dzlvafdwdttg/69wNwfiY5mFmgpd9eQFW6j/d5131c08085a977aa70f19e7aada3fa9/1pixel-down__1_.svg" alt="Cloudflare" className="h-8 w-auto px-2" />
              </div>
              <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-1 flex items-center">
                <div className="flex rounded-md border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setAppView('account')}
                    title={sankeyVertical ? `Account: ${currentAccount?.name || 'Account'}` : "View account details and settings"}
                    className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                      appView === 'account'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icons.Building2 className="w-4 h-4 flex-shrink-0" />
                    {!sankeyVertical && <span>Account: {currentAccount?.name || 'Account'}</span>}
                  </button>
                  <button
                    onClick={() => setAppView('activity')}
                    title={sankeyVertical ? 'Activity' : "View real-time network activity and metrics"}
                    className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
                      appView === 'activity'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icons.Activity className="w-4 h-4" />
                    {!sankeyVertical && 'Activity'}
                  </button>
                  <button
                    onClick={() => setAppView('objects')}
                    title={sankeyVertical ? 'Objects' : "View and manage network objects"}
                    className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
                      appView === 'objects'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icons.Box className="w-4 h-4" />
                    {!sankeyVertical && 'Objects'}
                  </button>
                  <button
                    onClick={() => setAppView('settings')}
                    title={sankeyVertical ? 'Settings' : "Configure global ZTNA settings"}
                    className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
                      appView === 'settings'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icons.Settings className="w-4 h-4" />
                    {!sankeyVertical && 'Settings'}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowTour(true)}
                title="See what's new in this view"
                className="bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg px-3"
              >
                <Icons.Map className="w-4 h-4" />
                {!sankeyVertical && <span className="text-sm font-bold">New!</span>}
              </button>
              <div className="bg-indigo-100 rounded-lg shadow-lg border-2 border-indigo-200 p-1 flex items-center">
                <button
                  onClick={() => setShowSearchModal(true)}
                  title="Search for objects, settings, and more"
                  className="px-3 py-2 flex items-center gap-2 hover:bg-indigo-200 rounded-md transition-colors"
                >
                  <Icons.Search className="w-4 h-4 text-indigo-600" />
                  {!sankeyVertical && <span className="text-sm font-semibold text-indigo-700">Search...</span>}
                </button>
              </div>
            </div>
            <div className="flex-1">
              <StatusWidget compact iconOnly={sankeyVertical} />
            </div>
          </div>

          {showSearchModal && (
            <SearchModal
              onClose={() => setShowSearchModal(false)}
              onNavigate={(view, params) => {
                setAppView(view);
                setShowSearchModal(false);
              }}
            />
          )}
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">

          {/* Sankey Traffic Flow Chart */}
          <div ref={sankeyContainerRef} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-600 uppercase">Traffic Flow</div>
              <div className="text-xs text-gray-500 mt-1">Data volume flowing through your team's network objects</div>
            </div>
            <div className="overflow-hidden">
              <SankeyChart
                nodes={nodes}
                edges={edges}
                events={inWindowEvents}
                width={Math.max(300, sankeyWidth)}
                height={sankeyVertical ? 450 : 300}
                vertical={sankeyVertical}
                onNodeClick={(sankeyNode) => {
                  const originalNode = nodes.find(n => n.id === sankeyNode.originalId);
                  if (originalNode) {
                    setSelectedSankeyNode(originalNode);
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <MetricCard
            title="Requests / min"
            description="Number of requests processed per minute"
            value={formatNumber(series.rps[series.rps.length - 1]?.y || 0)}
            subtitle={`Window total: ${formatNumber(totals.req)} req`}
            icon={Icons.ArrowLeftRight}
            series={series.rps}
            color="#2563eb"
          />
          <MetricCard
            title="Throughput / min"
            description="Data transferred per minute in bytes"
            value={`${formatNumber(series.throughput[series.throughput.length - 1]?.y || 0)} B`}
            subtitle={`Window total: ${formatNumber(totals.bytes)} B`}
            icon={Icons.Gauge}
            series={series.throughput}
            color="#7c3aed"
          />
          <MetricCard
            title="Error rate"
            description="Percentage of requests that failed"
            value={`${(totals.errorRate || 0).toFixed(1)}%`}
            subtitle={`p50: ${Math.round(totals.p50)}ms • p95: ${Math.round(totals.p95)}ms`}
            icon={Icons.AlertTriangle}
            series={series.errorRate}
            color="#dc2626"
          />
          <MetricCard
            title="Block rate"
            description="Percentage of requests denied by policy"
            value={`${(totals.blockRate || 0).toFixed(1)}%`}
            subtitle={`Blocked: ${formatNumber(totals.blocks)} of ${formatNumber(totals.req)}`}
            icon={Icons.Shield}
            series={series.blockRate}
            color="#f97316"
          />
          <MetricCard
            title="Latency p50 (ms)"
            description="Median response time for requests"
            value={formatNumber(series.p50[series.p50.length - 1]?.y || 0)}
            subtitle="Median request latency"
            icon={Icons.Timer}
            series={series.p50}
            color="#059669"
          />
          <MetricCard
            title="Latency p95 (ms)"
            description="95th percentile response time"
            value={formatNumber(series.p95[series.p95.length - 1]?.y || 0)}
            subtitle="Tail latency"
            icon={Icons.Activity}
            series={series.p95}
            color="#0ea5e9"
          />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 uppercase">Top Edges by Traffic</div>
                <div className="text-xs text-gray-500 mt-1">Connections with the highest request volume</div>
              </div>
              <div className="space-y-2">
                {topEdges.busiest.map((r) => (
                  <div key={r.edgeId} className="flex items-center justify-between text-sm">
                    <div className="text-gray-700 truncate pr-3">
                      {r.source} → {r.target}
                    </div>
                    <div className="font-semibold text-gray-900">{formatNumber(r.count)}</div>
                  </div>
                ))}
                {topEdges.busiest.length === 0 ? (
                  <div className="text-sm text-gray-600">No activity yet.</div>
                ) : null}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 uppercase">Top Blocked Edges</div>
                <div className="text-xs text-gray-500 mt-1">Connections with the most denied requests</div>
              </div>
              <div className="space-y-2">
                {topEdges.mostBlocked.map((r) => (
                  <div key={r.edgeId} className="flex items-center justify-between text-sm">
                    <div className="text-gray-700 truncate pr-3">
                      {r.source} → {r.target}
                    </div>
                    <div className="font-semibold text-gray-900">{formatNumber(r.count)}</div>
                  </div>
                ))}
                {topEdges.mostBlocked.length === 0 ? (
                  <div className="text-sm text-gray-600">No blocked traffic in window.</div>
                ) : null}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 uppercase">Top Error Edges</div>
                <div className="text-xs text-gray-500 mt-1">Connections experiencing the most failures</div>
              </div>
              <div className="space-y-2">
                {topEdges.mostErrors.map((r) => (
                  <div key={r.edgeId} className="flex items-center justify-between text-sm">
                    <div className="text-gray-700 truncate pr-3">
                      {r.source} → {r.target}
                    </div>
                    <div className="font-semibold text-gray-900">{formatNumber(r.count)}</div>
                  </div>
                ))}
                {topEdges.mostErrors.length === 0 ? (
                  <div className="text-sm text-gray-600">No errors in window.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Network Activity
          </p>
          <button
            onClick={() => setShowTeamNameModal(true)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {teamName}
              </h2>
              <Icons.Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">{nodes.length}</span> objects • <span className="font-semibold">{edges.length}</span> connections
          </p>
        </div>

        {showTeamNameModal && (
          <TeamNameModal
            currentName={teamName}
            onClose={() => setShowTeamNameModal(false)}
            onSave={(name) => setAccountTeamName(currentAccountId, name)}
          />
        )}

        <div className="space-y-4 mb-6">
          <div className="text-xs font-semibold text-gray-600 uppercase">Simulation</div>
          <button
            onClick={() => setActivityEnabled(!activityEnabled)}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
              activityEnabled
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {activityEnabled ? 'Activity: On' : 'Activity: Off'}
          </button>

          <div className="grid grid-cols-2 rounded-lg border-2 border-gray-200 overflow-hidden">
            <button
              onClick={() => {
                setActivityMode('live');
                setPlaybackPlaying(false);
                const now = Date.now();
                setPlaybackAnchorEnd(now);
                setPlaybackTime(now);
              }}
              className={`px-3 py-2 text-sm font-semibold transition-colors ${
                activityMode === 'live'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => {
                setActivityMode('playback');
                setPlaybackPlaying(false);
                const now = Date.now();
                setPlaybackAnchorEnd(now);
                setPlaybackTime(now);
              }}
              className={`px-3 py-2 text-sm font-semibold transition-colors border-l-2 border-gray-200 ${
                activityMode === 'playback'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Playback
            </button>
          </div>

          <div className="text-xs text-gray-600 mt-2">
            {activityMode === 'live'
              ? 'Live updates in real time as events occur. Use this to monitor current network activity and status.'
              : 'Playback lets you scrub through recent history within your selected time range. Use it to investigate spikes, errors, or blocked traffic.'}
          </div>

          </div>

        {activityMode === 'playback' ? (
          <div className="space-y-3 mb-6">
            <div className="text-xs font-semibold text-gray-600 uppercase">Playback</div>
            <button
              onClick={() => setPlaybackPlaying(!playbackPlaying)}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              {playbackPlaying ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4" />}
              {playbackPlaying ? 'Pause' : 'Play'}
            </button>

            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Time Range</div>
              <select
                value={timeRangeMode === 'custom' ? 'custom' : String(activityWindowMs)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'custom') {
                    setTimeRangeMode('custom');
                    setActivityMode('playback');
                    setPlaybackPlaying(false);
                    const now = Date.now();
                    setCustomEnd(toDatetimeLocalValue(now));
                    setCustomStart(toDatetimeLocalValue(now - activityWindowMs));
                    setPlaybackAnchorEnd(now);
                    setPlaybackTime(now);
                  } else {
                    setTimeRangeMode('preset');
                    setActivityWindowMs(Number(v));
                  }
                }}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white"
              >
                <option value={String(60_000)}>1m</option>
                <option value={String(5 * 60_000)}>5m</option>
                <option value={String(15 * 60_000)}>15m</option>
                <option value={String(60 * 60_000)}>1h</option>
                <option value="custom">Custom</option>
              </select>

              {timeRangeMode === 'custom' ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Start</div>
                    <input
                      type="datetime-local"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-2">End</div>
                    <input
                      type="datetime-local"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Playback Speed</div>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>

            <input
              type="range"
              min={safePlaybackMin}
              max={safePlaybackMax}
              value={safePlaybackTime}
              onChange={(e) => setPlaybackTime(Number(e.target.value))}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-gray-600 font-semibold">
              <span>{new Date(safePlaybackMin).toLocaleTimeString()}</span>
              <span>{new Date(safePlaybackMax).toLocaleTimeString()}</span>
            </div>

            <button
              onClick={() => setShowExportReport(true)}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Icons.FileDown className="w-4 h-4" />
              Export Report
            </button>
          </div>
        ) : null}
      </div>

      {showExportReport ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Export Activity Report</h2>
                <button
                  onClick={() => {
                    setShowExportReport(false);
                    setReportEmails('');
                    setReportName('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Generates a report for the currently visible metrics and time range.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Activity report name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Share via email
                </label>
                <input
                  type="text"
                  value={reportEmails}
                  onChange={(e) => setReportEmails(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email1@company.com, email2@company.com"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Enter 1 or more addresses separated by commas.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Preview</div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{buildReportSummary}</pre>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => {
                  openPrintableReport();
                  setShowExportReport(false);
                  setReportEmails('');
                  setReportName('');
                }}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Icons.Printer className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  shareReportByEmail();
                  setShowExportReport(false);
                  setReportEmails('');
                  setReportName('');
                }}
                disabled={!reportEmails.trim()}
                className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  reportEmails.trim()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                <Icons.Send className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showTour && (
        <TourModal page="activity" onClose={() => setShowTour(false)} />
      )}

      {selectedSankeyNode && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setSelectedSankeyNode(null)}
            className="absolute inset-0 bg-black/20"
          />
          <div className="absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: OOUX_DEFINITIONS[selectedSankeyNode.data?.nodeType]?.color || '#6b7280' }}
                >
                  {(() => {
                    const IconComponent = Icons[OOUX_DEFINITIONS[selectedSankeyNode.data?.nodeType]?.icon] || Icons.Circle;
                    return <IconComponent className="w-5 h-5 text-white" />;
                  })()}
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">
                    {OOUX_DEFINITIONS[selectedSankeyNode.data?.nodeType]?.name || 'Object'}
                  </div>
                  <div className="text-lg font-bold text-gray-900">{selectedSankeyNode.data?.label}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSankeyNode(null)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Icons.X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-3">Traffic Summary</div>
                {(() => {
                  const nodeId = selectedSankeyNode.id;
                  const nodeEvents = inWindowEvents.filter(e => e.source === nodeId || e.target === nodeId);
                  const inbound = nodeEvents.filter(e => e.target === nodeId);
                  const outbound = nodeEvents.filter(e => e.source === nodeId);
                  const totalBytes = nodeEvents.reduce((sum, e) => sum + (e.bytes || 0), 0);
                  const errors = nodeEvents.filter(e => e.status === 'error').length;
                  const blocks = nodeEvents.filter(e => e.decision === 'block').length;

                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total requests</span>
                        <span className="font-semibold text-gray-900">{nodeEvents.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Inbound</span>
                        <span className="font-semibold text-gray-900">{inbound.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Outbound</span>
                        <span className="font-semibold text-gray-900">{outbound.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Data volume</span>
                        <span className="font-semibold text-gray-900">{formatBytes(totalBytes)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Errors</span>
                        <span className={`font-semibold ${errors > 0 ? 'text-red-600' : 'text-gray-900'}`}>{errors}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Blocked</span>
                        <span className={`font-semibold ${blocks > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{blocks}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-3">Object Details</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ID</span>
                    <span className="font-mono text-xs text-gray-900">{selectedSankeyNode.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type</span>
                    <span className="font-semibold text-gray-900">{OOUX_DEFINITIONS[selectedSankeyNode.data?.nodeType]?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-3">Connected Objects</div>
                {(() => {
                  const nodeId = selectedSankeyNode.id;
                  const connectedIds = new Set();
                  inWindowEvents.forEach(e => {
                    if (e.source === nodeId && e.target) connectedIds.add(e.target);
                    if (e.target === nodeId && e.source) connectedIds.add(e.source);
                  });
                  const connectedNodes = nodes.filter(n => connectedIds.has(n.id));

                  if (connectedNodes.length === 0) {
                    return <div className="text-sm text-gray-500">No connections in current time window</div>;
                  }

                  return (
                    <div className="space-y-2">
                      {connectedNodes.slice(0, 10).map(n => {
                        const def = OOUX_DEFINITIONS[n.data?.nodeType];
                        const IconComp = Icons[def?.icon] || Icons.Circle;
                        return (
                          <button
                            key={n.id}
                            onClick={() => setSelectedSankeyNode(n)}
                            className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-left"
                          >
                            <div className="p-1 rounded" style={{ backgroundColor: def?.color || '#6b7280' }}>
                              <IconComp className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-900">{n.data?.label}</span>
                          </button>
                        );
                      })}
                      {connectedNodes.length > 10 && (
                        <div className="text-xs text-gray-500">+{connectedNodes.length - 10} more</div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={() => {
                  const nodeId = selectedSankeyNode.id;
                  setShowSummaryNodes(false);
                  setAppView('objects');
                  setSelectedSankeyNode(null);
                  // Delay to wait for ReactFlow to remount after view change
                  setTimeout(() => {
                    setSelectedNode(nodeId);
                  }, 600);
                }}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Icons.ExternalLink className="w-4 h-4" />
                View in Objects Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDashboard;
