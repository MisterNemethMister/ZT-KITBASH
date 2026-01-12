import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNetworkStore } from '../store/networkStore';
import SearchModal from './SearchModal';
import TourModal from './TourModal';

const Toggle = ({ enabled, onChange, label, description, id, highlighted }) => (
  <div id={id} className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg transition-all ${highlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}>
    <div>
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      {description ? <div className="text-xs text-gray-600 mt-0.5">{description}</div> : null}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const SelectField = ({ label, description, value, onChange, options, id, highlighted }) => (
  <div id={id} className={`py-3 px-2 -mx-2 rounded-lg transition-all ${highlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        {description ? <div className="text-xs text-gray-600 mt-0.5">{description}</div> : null}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const TextField = ({ label, description, value, onChange, placeholder, id, highlighted }) => (
  <div id={id} className={`py-3 px-2 -mx-2 rounded-lg transition-all ${highlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}>
    <div className="text-sm font-semibold text-gray-900 mb-1">{label}</div>
    {description ? <div className="text-xs text-gray-600 mb-2">{description}</div> : null}
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
    />
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{title}</div>
    <div className="divide-y divide-gray-100">{children}</div>
  </div>
);

const SettingsView = () => {
  const {
    appView,
    setAppView,
    ztnaSettings,
    setZtnaSettings,
    accounts,
    currentAccountId,
    highlightedItem,
    accountTeamNames,
    setAccountTeamName,
  } = useNetworkStore();

  const currentAccount = accounts?.find((a) => a.id === currentAccountId) || accounts?.[0];
  const teamName = accountTeamNames?.[currentAccountId] || 'My Team';
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  React.useEffect(() => {
    const checkNarrow = () => setIsNarrow(window.innerWidth < 900);
    checkNarrow();
    window.addEventListener('resize', checkNarrow);
    return () => window.removeEventListener('resize', checkNarrow);
  }, []);

  const updateSetting = (key, value) => {
    setZtnaSettings({ ...ztnaSettings, [key]: value });
  };

  React.useEffect(() => {
    if (highlightedItem?.type === 'setting' && highlightedItem?.id) {
      const el = document.getElementById(`setting-${highlightedItem.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedItem]);

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-20 bg-gray-50 px-6 pt-6 pb-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-stretch gap-2">
          <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-1 flex items-center" title="Cloudflare Zero Trust">
            <img src="/cloudflare-logo.png" alt="Cloudflare" className="h-8 w-auto px-2" />
          </div>
          <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-1 flex items-center">
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              <button
                onClick={() => setAppView('account')}
                title={isNarrow ? `Account: ${currentAccount?.name || 'Account'}` : "View account details and settings"}
                className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                  appView === 'account'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icons.Building2 className="w-4 h-4 flex-shrink-0" />
                {!isNarrow && <span>Account: {currentAccount?.name || 'Account'}</span>}
              </button>
              <button
                onClick={() => setAppView('activity')}
                title={isNarrow ? 'Activity' : "View real-time network activity and metrics"}
                className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
                  appView === 'activity'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icons.Activity className="w-4 h-4" />
                {!isNarrow && 'Activity'}
              </button>
              <button
                onClick={() => setAppView('objects')}
                title={isNarrow ? 'Objects' : "View and manage network objects"}
                className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
                  appView === 'objects'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icons.Box className="w-4 h-4" />
                {!isNarrow && 'Objects'}
              </button>
              <button
                onClick={() => setAppView('settings')}
                title={isNarrow ? 'Settings' : "Configure global ZTNA settings"}
                className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
                  appView === 'settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icons.Settings className="w-4 h-4" />
                {!isNarrow && 'Settings'}
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowTour(true)}
            title="See what's new in this view"
            className="bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg px-3"
          >
            <Icons.Map className="w-4 h-4" />
            {!isNarrow && <span className="text-sm font-bold">New!</span>}
          </button>
          <div className="bg-indigo-100 rounded-lg shadow-lg border-2 border-indigo-200 p-1 flex items-center">
            <button
              onClick={() => setShowSearchModal(true)}
              title="Search for objects, settings, and more"
              className="px-3 py-2 flex items-center gap-2 hover:bg-indigo-200 rounded-md transition-colors"
            >
              <Icons.Search className="w-4 h-4 text-indigo-600" />
              {!isNarrow && <span className="text-sm font-semibold text-indigo-700">Search...</span>}
            </button>
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

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Global Settings</h1>
          <p className="text-sm text-gray-600 mb-6">
            Configure global settings for this account
          </p>

          <Section title="General">
            <TextField
              id="setting-teamName"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'teamName'}
              label="Team Name"
              description="Display name for your ZTNA team"
              value={teamName}
              onChange={(v) => setAccountTeamName(currentAccountId, v)}
              placeholder="My Team Name"
            />
            <TextField
              id="setting-orgDomain"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'orgDomain'}
              label="Organization Domain"
              description="Your organization's primary domain"
              value={ztnaSettings.orgDomain || ''}
              onChange={(v) => updateSetting('orgDomain', v)}
              placeholder="example.com"
            />
          </Section>

          <Section title="Authentication">
            <SelectField
              id="setting-defaultIdp"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'defaultIdp'}
              label="Default Identity Provider"
              description="Primary IdP for user authentication"
              value={ztnaSettings.defaultIdp || 'okta'}
              onChange={(v) => updateSetting('defaultIdp', v)}
              options={[
                { value: 'okta', label: 'Okta' },
                { value: 'azure_ad', label: 'Azure AD' },
                { value: 'google', label: 'Google Workspace' },
                { value: 'onelogin', label: 'OneLogin' },
                { value: 'ping', label: 'Ping Identity' },
              ]}
            />
            <SelectField
              id="setting-sessionDuration"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'sessionDuration'}
              label="Session Duration"
              description="How long user sessions remain valid"
              value={ztnaSettings.sessionDuration || '24h'}
              onChange={(v) => updateSetting('sessionDuration', v)}
              options={[
                { value: '1h', label: '1 hour' },
                { value: '8h', label: '8 hours' },
                { value: '24h', label: '24 hours' },
                { value: '7d', label: '7 days' },
                { value: '30d', label: '30 days' },
              ]}
            />
            <Toggle
              id="setting-requireMfa"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'requireMfa'}
              label="Require MFA"
              description="Enforce multi-factor authentication for all users"
              enabled={ztnaSettings.requireMfa ?? true}
              onChange={(v) => updateSetting('requireMfa', v)}
            />
            <Toggle
              id="setting-allowServiceTokens"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'allowServiceTokens'}
              label="Allow Service Tokens"
              description="Enable service token authentication for automated systems"
              enabled={ztnaSettings.allowServiceTokens ?? true}
              onChange={(v) => updateSetting('allowServiceTokens', v)}
            />
          </Section>

          <Section title="Access Policies">
            <SelectField
              id="setting-defaultPolicyAction"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'defaultPolicyAction'}
              label="Default Policy Action"
              description="Action when no policy matches"
              value={ztnaSettings.defaultPolicyAction || 'block'}
              onChange={(v) => updateSetting('defaultPolicyAction', v)}
              options={[
                { value: 'allow', label: 'Allow' },
                { value: 'block', label: 'Block' },
                { value: 'bypass', label: 'Bypass' },
              ]}
            />
            <Toggle
              id="setting-geoRestrictions"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'geoRestrictions'}
              label="Enable Geo-Restrictions"
              description="Restrict access based on geographic location"
              enabled={ztnaSettings.geoRestrictions ?? false}
              onChange={(v) => updateSetting('geoRestrictions', v)}
            />
            <Toggle
              id="setting-devicePosture"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'devicePosture'}
              label="Device Posture Checks"
              description="Require device posture compliance before access"
              enabled={ztnaSettings.devicePosture ?? true}
              onChange={(v) => updateSetting('devicePosture', v)}
            />
            <Toggle
              id="setting-browserIsolation"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'browserIsolation'}
              label="Browser Isolation"
              description="Enable remote browser isolation for risky destinations"
              enabled={ztnaSettings.browserIsolation ?? false}
              onChange={(v) => updateSetting('browserIsolation', v)}
            />
          </Section>

          <Section title="Gateway & Tunnels">
            <Toggle
              id="setting-warpRequired"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'warpRequired'}
              label="WARP Client Required"
              description="Require Cloudflare WARP client for access"
              enabled={ztnaSettings.warpRequired ?? true}
              onChange={(v) => updateSetting('warpRequired', v)}
            />
            <Toggle
              id="setting-splitTunneling"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'splitTunneling'}
              label="Split Tunneling"
              description="Allow split tunneling for specific destinations"
              enabled={ztnaSettings.splitTunneling ?? false}
              onChange={(v) => updateSetting('splitTunneling', v)}
            />
            <SelectField
              id="setting-tunnelProtocol"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'tunnelProtocol'}
              label="Tunnel Protocol"
              description="Default protocol for tunnel connections"
              value={ztnaSettings.tunnelProtocol || 'quic'}
              onChange={(v) => updateSetting('tunnelProtocol', v)}
              options={[
                { value: 'quic', label: 'QUIC (recommended)' },
                { value: 'http2', label: 'HTTP/2' },
                { value: 'auto', label: 'Auto' },
              ]}
            />
          </Section>

          <Section title="Logging & Analytics">
            <Toggle
              id="setting-activityLogging"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'activityLogging'}
              label="Activity Logging"
              description="Log all access requests and policy decisions"
              enabled={ztnaSettings.activityLogging ?? true}
              onChange={(v) => updateSetting('activityLogging', v)}
            />
            <SelectField
              id="setting-logRetention"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'logRetention'}
              label="Log Retention"
              description="How long to retain activity logs"
              value={ztnaSettings.logRetention || '30d'}
              onChange={(v) => updateSetting('logRetention', v)}
              options={[
                { value: '7d', label: '7 days' },
                { value: '30d', label: '30 days' },
                { value: '90d', label: '90 days' },
                { value: '1y', label: '1 year' },
              ]}
            />
            <Toggle
              id="setting-realTimeAlerts"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'realTimeAlerts'}
              label="Real-time Alerts"
              description="Send real-time alerts for security events"
              enabled={ztnaSettings.realTimeAlerts ?? true}
              onChange={(v) => updateSetting('realTimeAlerts', v)}
            />
            <TextField
              id="setting-alertEmail"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'alertEmail'}
              label="Alert Email"
              description="Email address for security alerts"
              value={ztnaSettings.alertEmail || ''}
              onChange={(v) => updateSetting('alertEmail', v)}
              placeholder="security@example.com"
            />
          </Section>

          <Section title="Advanced">
            <Toggle
              id="setting-apiAccess"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'apiAccess'}
              label="API Access"
              description="Enable API access for programmatic management"
              enabled={ztnaSettings.apiAccess ?? true}
              onChange={(v) => updateSetting('apiAccess', v)}
            />
            <Toggle
              id="setting-auditMode"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'auditMode'}
              label="Audit Mode"
              description="Log policy violations without enforcing (dry run)"
              enabled={ztnaSettings.auditMode ?? false}
              onChange={(v) => updateSetting('auditMode', v)}
            />
            <SelectField
              id="setting-tlsMinVersion"
              highlighted={highlightedItem?.type === 'setting' && highlightedItem?.id === 'tlsMinVersion'}
              label="TLS Minimum Version"
              description="Minimum TLS version for connections"
              value={ztnaSettings.tlsMinVersion || '1.2'}
              onChange={(v) => updateSetting('tlsMinVersion', v)}
              options={[
                { value: '1.0', label: 'TLS 1.0' },
                { value: '1.1', label: 'TLS 1.1' },
                { value: '1.2', label: 'TLS 1.2 (recommended)' },
                { value: '1.3', label: 'TLS 1.3' },
              ]}
            />
          </Section>
        </div>
      </div>

      {showTour && (
        <TourModal page="settings" onClose={() => setShowTour(false)} />
      )}
    </div>
  );
};

export default SettingsView;
