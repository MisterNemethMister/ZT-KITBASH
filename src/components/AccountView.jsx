import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNetworkStore } from '../store/networkStore';
import SearchModal from './SearchModal';
import TourModal from './TourModal';

const AccountCard = ({ account, isActive, onSelect, systemStatus }) => {
  const statusConfig = {
    good: { color: 'text-emerald-700', icon: Icons.CheckCircle2, iconBg: 'bg-emerald-600' },
    ok: { color: 'text-amber-700', icon: Icons.AlertTriangle, iconBg: 'bg-amber-500' },
    bad: { color: 'text-red-700', icon: Icons.AlertOctagon, iconBg: 'bg-red-600' },
  };
  const config = statusConfig[systemStatus?.level] || statusConfig.good;
  const StatusIcon = config.icon;

  return (
    <button
      onClick={() => onSelect(account.id)}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{account.type}</div>
        {isActive && (
          <div className="p-1 bg-blue-500 rounded">
            <Icons.Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`}>
          <Icons.Building2 className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">{account.name}</div>
          <div className="text-xs text-gray-500">{account.id}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded ${config.iconBg}`}>
          <StatusIcon className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs text-gray-600">Network Status:</span>
        <span className={`text-xs font-bold ${config.color}`}>{systemStatus?.status || 'Good'}</span>
      </div>
    </button>
  );
};

const DetailRow = ({ label, value, icon: Icon, id, highlighted }) => (
  <div id={id} className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg border-b border-gray-100 last:border-0 transition-all ${highlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}>
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </div>
    <div className="text-sm font-semibold text-gray-900">{value}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{title}</div>
    {children}
  </div>
);

const AccountView = () => {
  const { appView, setAppView, accounts, currentAccountId, setCurrentAccountId, accountStatuses, accountTeamNames, setAccountTeamName, highlightedItem } = useNetworkStore();
  const [editingTeamName, setEditingTeamName] = useState(null);
  const [tempTeamName, setTempTeamName] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  React.useEffect(() => {
    const checkNarrow = () => setIsNarrow(window.innerWidth < 900);
    checkNarrow();
    window.addEventListener('resize', checkNarrow);
    return () => window.removeEventListener('resize', checkNarrow);
  }, []);

  React.useEffect(() => {
    if (highlightedItem?.type === 'account' && highlightedItem?.id) {
      const el = document.getElementById(`account-${highlightedItem.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedItem]);

  const currentAccount = accounts.find((a) => a.id === currentAccountId) || accounts[0];
  const currentTeamName = accountTeamNames[currentAccountId] || 'My Team';

  const startEditingTeamName = (accountId) => {
    setEditingTeamName(accountId);
    setTempTeamName(accountTeamNames[accountId] || 'My Team');
  };

  const saveTeamName = () => {
    if (editingTeamName && tempTeamName.trim()) {
      setAccountTeamName(editingTeamName, tempTeamName.trim());
    }
    setEditingTeamName(null);
    setTempTeamName('');
  };

  const cancelEditingTeamName = () => {
    setEditingTeamName(null);
    setTempTeamName('');
  };

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
              if (params?.switchTo) {
                setCurrentAccountId(params.switchTo);
              }
              setShowSearchModal(false);
            }}
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Account</h1>
          <p className="text-sm text-gray-600 mb-6">
            Select a Zero Trust account to manage
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Section title="Your Accounts">
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      isActive={account.id === currentAccountId}
                      onSelect={setCurrentAccountId}
                      systemStatus={accountStatuses[account.id] || { level: 'good', status: 'Good' }}
                    />
                  ))}
                </div>
              </Section>
            </div>

            <div className="lg:col-span-2">
              <Section title="Selected account details">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Icons.Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{currentAccount.name}</div>
                    <div className="text-sm text-gray-500">{currentAccount.id}</div>
                  </div>
                </div>

                <DetailRow id="account-type" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'type'} label="Account Type" value={currentAccount.type} icon={Icons.Tag} />
                <DetailRow id="account-plan" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'plan'} label="Plan" value={currentAccount.plan} icon={Icons.CreditCard} />
                <DetailRow id="account-status" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'status'} label="Status" value={currentAccount.status} icon={Icons.CheckCircle} />
                <DetailRow id="account-created" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'created'} label="Created" value={currentAccount.created} icon={Icons.Calendar} />
                <DetailRow id="account-region" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'region'} label="Region" value={currentAccount.region} icon={Icons.Globe} />
              </Section>

              <Section title="Team Name">
                <div className="flex items-center justify-between py-2">
                  {editingTeamName === currentAccountId ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={tempTeamName}
                        onChange={(e) => setTempTeamName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTeamName();
                          if (e.key === 'Escape') cancelEditingTeamName();
                        }}
                      />
                      <button
                        onClick={saveTeamName}
                        className="px-3 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditingTeamName}
                        className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Icons.Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-900">{currentTeamName}</span>
                      </div>
                      <button
                        onClick={() => startEditingTeamName(currentAccountId)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Icons.Pencil className="w-3 h-3 inline mr-1" />
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </Section>

              <Section title="Zero Trust Configuration">
                <DetailRow id="account-gateway" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'gateway'} label="Gateway Enabled" value={currentAccount.gateway ? 'Yes' : 'No'} icon={Icons.Shield} />
                <DetailRow id="account-access" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'access'} label="Access Enabled" value={currentAccount.access ? 'Yes' : 'No'} icon={Icons.Lock} />
                <DetailRow id="account-browserIsolation" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'browserIsolation'} label="Browser Isolation" value={currentAccount.browserIsolation ? 'Yes' : 'No'} icon={Icons.Monitor} />
                <DetailRow id="account-casb" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'casb'} label="CASB" value={currentAccount.casb ? 'Yes' : 'No'} icon={Icons.Cloud} />
                <DetailRow id="account-dlp" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'dlp'} label="DLP" value={currentAccount.dlp ? 'Yes' : 'No'} icon={Icons.FileSearch} />
              </Section>

              <Section title="Usage & Limits">
                <DetailRow id="account-users" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'users'} label="Users" value={`${currentAccount.users.toLocaleString()} / ${currentAccount.userLimit.toLocaleString()}`} icon={Icons.Users} />
                <DetailRow id="account-applications" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'applications'} label="Applications" value={`${currentAccount.applications} / ${currentAccount.applicationLimit}`} icon={Icons.AppWindow} />
                <DetailRow id="account-tunnels" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'tunnels'} label="Tunnels" value={`${currentAccount.tunnels} / ${currentAccount.tunnelLimit}`} icon={Icons.Network} />
                <DetailRow id="account-policies" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'policies'} label="Policies" value={`${currentAccount.policies} / ${currentAccount.policyLimit}`} icon={Icons.FileText} />
              </Section>

              <Section title="Support & Billing">
                <DetailRow id="account-supportPlan" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'supportPlan'} label="Support Plan" value={currentAccount.supportPlan} icon={Icons.Headphones} />
                <DetailRow id="account-billingEmail" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'billingEmail'} label="Billing Email" value={currentAccount.billingEmail} icon={Icons.Mail} />
                <DetailRow id="account-nextInvoice" highlighted={highlightedItem?.type === 'account' && highlightedItem?.id === 'nextInvoice'} label="Next Invoice" value={currentAccount.nextInvoice} icon={Icons.Receipt} />
              </Section>
            </div>
          </div>
        </div>
      </div>

      {showTour && (
        <TourModal page="account" onClose={() => setShowTour(false)} />
      )}
    </div>
  );
};

export default AccountView;
