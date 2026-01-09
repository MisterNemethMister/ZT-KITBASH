import React, { useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import { useNetworkStore } from '../store/networkStore';

const formatPercent = (n) => `${(n || 0).toFixed(1)}%`;

const computeStatus = ({ events, now }) => {
  if (!events || events.length === 0) {
    return {
      level: 'good',
      status: 'Good',
      title: 'Network Status: Good',
      subtitle: 'No telemetry data yet. Enable simulation to generate metrics.',
      alerts: [{ level: 'good', text: 'No issues detected. Awaiting telemetry data.' }],
      req: 0,
      errorRate: 0,
      blockRate: 0,
      p95LatencyMs: 0,
      staleMs: Number.POSITIVE_INFINITY,
    };
  }

  const lastTs = events[events.length - 1]?.ts;
  const staleMs = lastTs ? now - lastTs : Number.POSITIVE_INFINITY;

  const windowMs = 5 * 60 * 1000;
  const start = now - windowMs;
  const inWindow = events.filter((e) => e.ts >= start && e.ts <= now);

  const req = inWindow.length;
  const errors = inWindow.reduce((s, e) => s + (e.status === 'error' ? 1 : 0), 0);
  const blocks = inWindow.reduce((s, e) => s + (e.decision === 'block' ? 1 : 0), 0);
  const latencies = inWindow.map((e) => e.latencyMs).filter((v) => typeof v === 'number');
  latencies.sort((a, b) => a - b);
  const q = (arr, p) => {
    if (!arr.length) return 0;
    const pos = (arr.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    return arr[base + 1] === undefined ? arr[base] : arr[base] + rest * (arr[base + 1] - arr[base]);
  };
  const p95 = q(latencies, 0.95);

  const errorRate = req ? (errors / req) * 100 : 0;
  const blockRate = req ? (blocks / req) * 100 : 0;

  const alerts = [];

  if (staleMs > 2 * 60 * 1000) {
    alerts.push({
      level: 'warning',
      text: 'Telemetry appears stale (no recent events).'
    });
  }

  if (errorRate >= 5) {
    alerts.push({ level: 'critical', text: `High error rate (${formatPercent(errorRate)})` });
  } else if (errorRate >= 1) {
    alerts.push({ level: 'warning', text: `Elevated error rate (${formatPercent(errorRate)})` });
  }

  if (blockRate >= 25) {
    alerts.push({ level: 'critical', text: `High block rate (${formatPercent(blockRate)})` });
  } else if (blockRate >= 10) {
    alerts.push({ level: 'warning', text: `Elevated block rate (${formatPercent(blockRate)})` });
  }

  if (p95 >= 1000) {
    alerts.push({ level: 'critical', text: `High latency p95 (${Math.round(p95)}ms)` });
  } else if (p95 >= 500) {
    alerts.push({ level: 'warning', text: `Elevated latency p95 (${Math.round(p95)}ms)` });
  }

  const hasCritical = alerts.some((a) => a.level === 'critical');
  const hasWarning = alerts.some((a) => a.level === 'warning');

  if (hasCritical) {
    return {
      level: 'bad',
      status: 'Bad',
      title: 'Network Status: Bad',
      subtitle: 'Critical issues require immediate attention',
      alerts,
      req,
      errorRate,
      blockRate,
      p95LatencyMs: p95,
      staleMs,
    };
  }

  if (hasWarning) {
    return {
      level: 'ok',
      status: 'OK',
      title: 'Network Status: OK',
      subtitle: 'Things could be better - review warnings below',
      alerts,
      req,
      errorRate,
      blockRate,
      p95LatencyMs: p95,
      staleMs,
    };
  }

  return {
    level: 'good',
    status: 'Good',
    title: 'Network Status: Good',
    subtitle: `Everything is going great • ${req} events in last 5 min`,
    alerts: [{ level: 'good', text: 'All systems operating normally. No issues detected.' }],
    req,
    errorRate,
    blockRate,
    p95LatencyMs: p95,
    staleMs,
  };
};

const formatStale = (ms) => {
  if (!Number.isFinite(ms)) return 'unknown';
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  return `${m}m`;
};

const buildCallsToAction = (status) => {
  const actions = [];

  if (status.req === 0) {
    actions.push('enable_simulation');
    actions.push('switch_to_activity_view');
    return actions;
  }

  if (status.staleMs > 2 * 60 * 1000) {
    actions.push('check_event_source');
    actions.push('restart_simulation');
  }

  if (status.errorRate >= 1) {
    actions.push('inspect_error_logs');
    actions.push('identify_failing_connection');
  }

  if (status.blockRate >= 10) {
    actions.push('review_policy_blocks');
    actions.push('verify_access_policies');
  }

  if (status.p95LatencyMs >= 500) {
    actions.push('investigate_latency');
    actions.push('check_upstream_health');
  }

  if (actions.length === 0) {
    actions.push('review_recent_changes');
  }

  return Array.from(new Set(actions));
};

const StatusWidget = ({ compact = false, iconOnly = false }) => {
  const activityEvents = useNetworkStore((s) => s.activityEvents);
  const currentAccountId = useNetworkStore((s) => s.currentAccountId);
  const {
    setAppView,
    setActivityEnabled,
    setActivityMode,
    setPlaybackPlaying,
    setPlaybackTime,
    setPlaybackAnchorEnd,
    clearActivityEvents,
    setFilterNodeType,
    clearFilter,
    clearSelection,
    setShowSummaryNodes,
    setAccountStatus,
  } = useNetworkStore((s) => ({
    setAppView: s.setAppView,
    setActivityEnabled: s.setActivityEnabled,
    setActivityMode: s.setActivityMode,
    setPlaybackPlaying: s.setPlaybackPlaying,
    setPlaybackTime: s.setPlaybackTime,
    setPlaybackAnchorEnd: s.setPlaybackAnchorEnd,
    clearActivityEvents: s.clearActivityEvents,
    setFilterNodeType: s.setFilterNodeType,
    clearFilter: s.clearFilter,
    clearSelection: s.clearSelection,
    setShowSummaryNodes: s.setShowSummaryNodes,
    setAccountStatus: s.setAccountStatus,
  }));
  const [showDetails, setShowDetails] = useState(false);

  const status = useMemo(() => {
    const now = Date.now();
    return computeStatus({ events: activityEvents || [], now });
  }, [activityEvents]);

  React.useEffect(() => {
    if (currentAccountId && status) {
      setAccountStatus(currentAccountId, { level: status.level, status: status.status });
    }
  }, [currentAccountId, status, setAccountStatus]);

  const callsToAction = useMemo(() => buildCallsToAction(status), [status]);

  const executeCta = (cta) => {
    const now = Date.now();

    switch (cta) {
      case 'enable_simulation':
        setActivityEnabled(true);
        setActivityMode('live');
        setPlaybackPlaying(false);
        setPlaybackAnchorEnd(now);
        setPlaybackTime(now);
        return;
      case 'restart_simulation':
        clearActivityEvents();
        setActivityEnabled(true);
        setActivityMode('live');
        setPlaybackPlaying(false);
        setPlaybackAnchorEnd(now);
        setPlaybackTime(now);
        return;
      case 'switch_to_activity_view':
        setAppView('activity');
        return;
      case 'review_policy_blocks':
      case 'verify_access_policies':
        setAppView('objects');
        clearSelection();
        setShowSummaryNodes(false);
        setFilterNodeType('access_policy');
        return;
      case 'identify_failing_connection':
        setAppView('objects');
        clearSelection();
        setShowSummaryNodes(false);
        clearFilter();
        return;
      case 'investigate_latency':
      case 'check_upstream_health':
        setAppView('objects');
        clearSelection();
        setShowSummaryNodes(false);
        setFilterNodeType('gateway');
        return;
      case 'inspect_error_logs':
        setAppView('activity');
        setActivityMode('playback');
        setPlaybackPlaying(false);
        return;
      case 'check_event_source':
        setAppView('activity');
        return;
      case 'review_recent_changes':
        setAppView('objects');
        clearSelection();
        return;
      default:
        return;
    }
  };

  const ui = useMemo(() => {
    if (status.level === 'good') {
      return {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50',
        iconBg: 'bg-emerald-600',
        textColor: 'text-emerald-700',
        icon: Icons.CheckCircle2
      };
    }
    if (status.level === 'bad') {
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        iconBg: 'bg-red-600',
        textColor: 'text-red-700',
        icon: Icons.AlertOctagon
      };
    }
    if (status.level === 'ok') {
      return {
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        iconBg: 'bg-amber-500',
        textColor: 'text-amber-700',
        icon: Icons.AlertTriangle
      };
    }
    return {
      border: 'border-gray-200',
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-700',
      textColor: 'text-gray-700',
      icon: Icons.Info
    };
  }, [status.level]);

  const Icon = ui.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDetails(true)}
        title={`Network Status: ${status.status}`}
        className={`rounded-lg border-2 ${ui.border} ${ui.bg} h-12 px-3 hover:opacity-90 transition-opacity ${iconOnly ? '' : 'w-full'}`}
      >
        <div className="flex items-center gap-3 h-full">
          <div className={`p-1.5 rounded ${ui.iconBg}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          {!iconOnly && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Network Status:</span>
                <span className={`text-sm font-bold ${ui.textColor} whitespace-nowrap`}>{status.status}</span>
              </div>
              <div className="flex-1" />
              <span className="text-xs font-semibold text-blue-600 whitespace-nowrap underline">
                View info
              </span>
            </>
          )}
        </div>
      </button>

      {showDetails ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setShowDetails(false)}
            className="absolute inset-0 bg-black/20"
          />

          <div className="absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded ${ui.iconBg}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Network Status</div>
                    <div className={`text-xl font-bold ${ui.textColor}`}>{status.status}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">{status.subtitle}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Icons.X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-600 uppercase">Signals (last 5 minutes)</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs text-gray-600">Events</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{status.req}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs text-gray-600">Latency p95</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{Math.round(status.p95LatencyMs)}ms</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs text-gray-600">Error rate</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{formatPercent(status.errorRate)}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="text-xs text-gray-600">Block rate</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{formatPercent(status.blockRate)}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 col-span-2">
                  <div className="text-xs text-gray-600">Staleness</div>
                  <div className="text-sm font-bold text-gray-900 mt-1">{formatStale(status.staleMs)} since last event</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-600 uppercase">Alerts</div>
              {status.alerts.length === 0 ? (
                <div className="mt-2 text-sm text-gray-700">No alerts.</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {status.alerts.map((a, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-200 p-3">
                      <div className="text-sm font-semibold text-gray-900">{a.level.toUpperCase()}</div>
                      <div className="text-sm text-gray-700 mt-1">{a.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Calls to Action
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {callsToAction.map((cta) => (
                  <button
                    key={cta}
                    type="button"
                    onClick={() => {
                      executeCta(cta);
                      setShowDetails(false);
                    }}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-lg transition-colors font-medium"
                  >
                    {cta.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default StatusWidget;
