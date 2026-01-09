import React, { useState, useMemo, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useNetworkStore } from '../store/networkStore';

const RECENT_QUERIES_KEY = 'ztna_recent_queries';

const getRecentQueries = () => {
  try {
    const stored = localStorage.getItem(RECENT_QUERIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentQuery = (query) => {
  if (!query.trim()) return;
  const recent = getRecentQueries();
  const filtered = recent.filter((q) => q.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...filtered].slice(0, 10);
  localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(updated));
};

const SearchModal = ({ onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [recentQueries, setRecentQueries] = useState([]);
  
  const {
    nodes,
    accounts,
    setHighlightedItem,
    currentAccountId,
    ztnaSettings,
    accountTeamNames,
  } = useNetworkStore();

  useEffect(() => {
    setRecentQueries(getRecentQueries());
  }, []);

  const currentAccount = accounts?.find((a) => a.id === currentAccountId) || accounts?.[0];

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    const results = [];

    // Search objects (nodes)
    nodes.forEach((node) => {
      const label = node.data?.label || '';
      const nodeType = node.data?.nodeType || '';
      const attributes = node.data?.attributes || {};
      
      const matchesLabel = label.toLowerCase().includes(q);
      const matchesType = nodeType.toLowerCase().includes(q);
      const matchesAttr = Object.values(attributes).some(
        (v) => String(v).toLowerCase().includes(q)
      );
      
      if (matchesLabel || matchesType || matchesAttr) {
        results.push({
          type: 'object',
          category: 'Objects',
          id: node.id,
          title: label,
          subtitle: nodeType.replace(/_/g, ' '),
          icon: Icons.Box,
          action: () => onNavigate('objects', { nodeId: node.id }),
        });
      }
    });

    // Search metrics
    const metrics = [
      { key: 'requests', title: 'Requests/min', subtitle: 'Activity metric' },
      { key: 'throughput', title: 'Throughput', subtitle: 'Activity metric' },
      { key: 'errors', title: 'Error Rate', subtitle: 'Activity metric' },
      { key: 'blocks', title: 'Block Rate', subtitle: 'Activity metric' },
      { key: 'latency', title: 'Latency (P50/P95)', subtitle: 'Activity metric' },
    ];
    
    metrics.forEach((m) => {
      if (m.title.toLowerCase().includes(q) || m.key.toLowerCase().includes(q)) {
        results.push({
          type: 'metric',
          category: 'Metrics',
          id: m.key,
          title: m.title,
          subtitle: m.subtitle,
          icon: Icons.Activity,
          action: () => onNavigate('activity', { metric: m.key }),
        });
      }
    });

    // Search settings
    const settingsItems = [
      { key: 'orgDomain', title: 'Organization Domain', value: ztnaSettings?.orgDomain },
      { key: 'defaultIdp', title: 'Default Identity Provider', value: ztnaSettings?.defaultIdp },
      { key: 'sessionDuration', title: 'Session Duration', value: ztnaSettings?.sessionDuration },
      { key: 'requireMfa', title: 'Require MFA', value: ztnaSettings?.requireMfa ? 'Yes' : 'No' },
      { key: 'allowServiceTokens', title: 'Allow Service Tokens', value: ztnaSettings?.allowServiceTokens ? 'Yes' : 'No' },
      { key: 'defaultPolicyAction', title: 'Default Policy Action', value: ztnaSettings?.defaultPolicyAction },
      { key: 'geoRestrictions', title: 'Geo Restrictions', value: ztnaSettings?.geoRestrictions ? 'Enabled' : 'Disabled' },
      { key: 'devicePosture', title: 'Device Posture', value: ztnaSettings?.devicePosture ? 'Enabled' : 'Disabled' },
      { key: 'browserIsolation', title: 'Browser Isolation', value: ztnaSettings?.browserIsolation ? 'Enabled' : 'Disabled' },
      { key: 'warpRequired', title: 'WARP Required', value: ztnaSettings?.warpRequired ? 'Yes' : 'No' },
      { key: 'splitTunneling', title: 'Split Tunneling', value: ztnaSettings?.splitTunneling ? 'Enabled' : 'Disabled' },
      { key: 'tunnelProtocol', title: 'Tunnel Protocol', value: ztnaSettings?.tunnelProtocol },
      { key: 'activityLogging', title: 'Activity Logging', value: ztnaSettings?.activityLogging ? 'Enabled' : 'Disabled' },
      { key: 'logRetention', title: 'Log Retention', value: ztnaSettings?.logRetention },
      { key: 'realTimeAlerts', title: 'Real-time Alerts', value: ztnaSettings?.realTimeAlerts ? 'Enabled' : 'Disabled' },
      { key: 'apiAccess', title: 'API Access', value: ztnaSettings?.apiAccess ? 'Enabled' : 'Disabled' },
      { key: 'auditMode', title: 'Audit Mode', value: ztnaSettings?.auditMode ? 'Enabled' : 'Disabled' },
      { key: 'tlsMinVersion', title: 'TLS Minimum Version', value: ztnaSettings?.tlsMinVersion },
    ];
    
    settingsItems.forEach((s) => {
      if (s.title.toLowerCase().includes(q) || s.key.toLowerCase().includes(q) || (s.value && String(s.value).toLowerCase().includes(q))) {
        results.push({
          type: 'setting',
          category: 'Settings',
          id: s.key,
          title: s.title,
          subtitle: `Current: ${s.value || 'Not set'}`,
          icon: Icons.Settings,
          action: () => onNavigate('settings', { setting: s.key }),
        });
      }
    });

    // Search account items
    const accountItems = [
      { key: 'name', title: 'Account Name', value: currentAccount?.name },
      { key: 'type', title: 'Account Type', value: currentAccount?.type },
      { key: 'plan', title: 'Plan', value: currentAccount?.plan },
      { key: 'status', title: 'Account Status', value: currentAccount?.status },
      { key: 'region', title: 'Region', value: currentAccount?.region },
      { key: 'teamName', title: 'Team Name', value: accountTeamNames?.[currentAccountId] },
      { key: 'users', title: 'Users', value: `${currentAccount?.users} / ${currentAccount?.userLimit}` },
      { key: 'applications', title: 'Applications', value: `${currentAccount?.applications} / ${currentAccount?.applicationLimit}` },
      { key: 'tunnels', title: 'Tunnels', value: `${currentAccount?.tunnels} / ${currentAccount?.tunnelLimit}` },
      { key: 'policies', title: 'Policies', value: `${currentAccount?.policies} / ${currentAccount?.policyLimit}` },
      { key: 'supportPlan', title: 'Support Plan', value: currentAccount?.supportPlan },
      { key: 'billingEmail', title: 'Billing Email', value: currentAccount?.billingEmail },
    ];
    
    accountItems.forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.key.toLowerCase().includes(q) || (a.value && String(a.value).toLowerCase().includes(q))) {
        results.push({
          type: 'account',
          category: 'Account',
          id: a.key,
          title: a.title,
          subtitle: `${a.value || 'Not set'}`,
          icon: Icons.Building2,
          action: () => onNavigate('account', { item: a.key }),
        });
      }
    });

    // Search other accounts
    accounts?.forEach((account) => {
      if (account.id !== currentAccountId) {
        if (account.name.toLowerCase().includes(q) || account.type.toLowerCase().includes(q)) {
          results.push({
            type: 'account',
            category: 'Other Accounts',
            id: account.id,
            title: account.name,
            subtitle: account.type,
            icon: Icons.Building2,
            action: () => onNavigate('account', { switchTo: account.id }),
          });
        }
      }
    });

    return results;
  }, [query, nodes, accounts, currentAccountId, currentAccount, ztnaSettings, accountTeamNames, onNavigate]);

  const groupedResults = useMemo(() => {
    const groups = {};
    searchResults.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [searchResults]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const handleResultClick = (result) => {
    saveRecentQuery(query);
    setRecentQueries(getRecentQueries());
    setHighlightedItem({ type: result.type, id: result.id });
    result.action();
    onClose();
  };

  const handleRecentClick = (recentQuery) => {
    setQuery(recentQuery);
  };

  const clearRecentQueries = () => {
    localStorage.removeItem(RECENT_QUERIES_KEY);
    setRecentQueries([]);
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Icons.Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search objects, metrics, settings, accounts..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Icons.X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.trim() ? (
            searchResults.length > 0 ? (
              <div className="p-2">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                      {category}
                    </div>
                    {items.map((result, idx) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={`${result.type}-${result.id}-${idx}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg text-left transition-colors"
                        >
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {result.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {result.subtitle}
                            </div>
                          </div>
                          <Icons.ArrowRight className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Icons.SearchX className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No results found for "{query}"</p>
              </div>
            )
          ) : (
            <div className="p-4">
              {recentQueries.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Recent Searches
                    </div>
                    <button
                      onClick={clearRecentQueries}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  {recentQueries.map((recent, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRecentClick(recent)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <Icons.Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{recent}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Icons.Map className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Type to search across the application</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Objects • Metrics • Settings • Accounts
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">↵</kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
