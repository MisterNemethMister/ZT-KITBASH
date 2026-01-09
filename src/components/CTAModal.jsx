import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { OOUX_DEFINITIONS } from '../data/oouxModel';

const CTAModal = ({ node, action, onClose, onExecute }) => {
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const definition = OOUX_DEFINITIONS[node.data.nodeType];
  const IconComponent = Icons[definition.icon] || Icons.Circle;

  const actionConfigs = {
    authenticate: {
      title: 'Authenticate User',
      description: 'Initiate authentication flow for this user',
      fields: [
        { key: 'method', label: 'Authentication Method', type: 'select', options: ['SSO', 'MFA', 'Password'] },
        { key: 'redirect_url', label: 'Redirect URL', type: 'text' }
      ],
      icon: 'LogIn'
    },
    request_access: {
      title: 'Request Access',
      description: 'Submit an access request for this user',
      fields: [
        { key: 'resource', label: 'Resource', type: 'text' },
        { key: 'justification', label: 'Justification', type: 'textarea' }
      ],
      icon: 'Key'
    },
    revoke_access: {
      title: 'Revoke Access',
      description: 'Revoke access permissions for this user',
      fields: [
        { key: 'reason', label: 'Reason', type: 'textarea' }
      ],
      icon: 'ShieldOff'
    },
    update_profile: {
      title: 'Update Profile',
      description: 'Update user profile information',
      fields: [
        { key: 'field', label: 'Field to Update', type: 'select', options: ['Email', 'Name', 'Groups'] },
        { key: 'value', label: 'New Value', type: 'text' }
      ],
      icon: 'UserCog'
    },
    connect: {
      title: 'Connect Device',
      description: 'Establish connection for this device',
      fields: [
        { key: 'protocol', label: 'Protocol', type: 'select', options: ['WARP', 'VPN', 'Direct'] }
      ],
      icon: 'Link'
    },
    disconnect: {
      title: 'Disconnect Device',
      description: 'Terminate device connection',
      fields: [
        { key: 'force', label: 'Force Disconnect', type: 'boolean' }
      ],
      icon: 'Unlink'
    },
    check_posture: {
      title: 'Check Device Posture',
      description: 'Run posture check on this device',
      fields: [],
      icon: 'Shield'
    },
    update_client: {
      title: 'Update Client',
      description: 'Push client update to this device',
      fields: [
        { key: 'version', label: 'Version', type: 'text' }
      ],
      icon: 'Download'
    },
    configure: {
      title: 'Configure',
      description: 'Update configuration settings',
      fields: [
        { key: 'setting', label: 'Setting', type: 'text' },
        { key: 'value', label: 'Value', type: 'text' }
      ],
      icon: 'Settings'
    },
    enable: {
      title: 'Enable',
      description: 'Enable this resource',
      fields: [],
      icon: 'ToggleRight'
    },
    disable: {
      title: 'Disable',
      description: 'Disable this resource',
      fields: [
        { key: 'reason', label: 'Reason', type: 'text' }
      ],
      icon: 'ToggleLeft'
    },
    test_connection: {
      title: 'Test Connection',
      description: 'Test connectivity to this resource',
      fields: [],
      icon: 'Activity'
    },
    create_route: {
      title: 'Create Route',
      description: 'Add a new route to this tunnel',
      fields: [
        { key: 'destination', label: 'Destination CIDR', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' }
      ],
      icon: 'Route'
    },
    update_config: {
      title: 'Update Configuration',
      description: 'Modify tunnel configuration',
      fields: [
        { key: 'config_key', label: 'Configuration Key', type: 'text' },
        { key: 'config_value', label: 'Configuration Value', type: 'text' }
      ],
      icon: 'FileEdit'
    },
    restart: {
      title: 'Restart',
      description: 'Restart this service',
      fields: [
        { key: 'graceful', label: 'Graceful Restart', type: 'boolean' }
      ],
      icon: 'RotateCw'
    },
    monitor: {
      title: 'Monitor',
      description: 'View monitoring dashboard',
      fields: [],
      icon: 'Monitor'
    },
    create_rule: {
      title: 'Create Rule',
      description: 'Add a new policy rule',
      fields: [
        { key: 'condition', label: 'Condition', type: 'text' },
        { key: 'action', label: 'Action', type: 'select', options: ['Allow', 'Deny', 'Challenge'] }
      ],
      icon: 'Plus'
    },
    update_rule: {
      title: 'Update Rule',
      description: 'Modify existing policy rule',
      fields: [
        { key: 'rule_id', label: 'Rule ID', type: 'text' },
        { key: 'condition', label: 'New Condition', type: 'text' }
      ],
      icon: 'Edit'
    },
    delete_rule: {
      title: 'Delete Rule',
      description: 'Remove a policy rule',
      fields: [
        { key: 'rule_id', label: 'Rule ID', type: 'text' }
      ],
      icon: 'Trash2'
    },
    test_policy: {
      title: 'Test Policy',
      description: 'Simulate policy evaluation',
      fields: [
        { key: 'test_user', label: 'Test User Email', type: 'text' }
      ],
      icon: 'TestTube'
    },
    sync_users: {
      title: 'Sync Users',
      description: 'Synchronize users from identity provider',
      fields: [],
      icon: 'RefreshCw'
    },
    update_credentials: {
      title: 'Update Credentials',
      description: 'Update IdP credentials',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text' },
        { key: 'client_secret', label: 'Client Secret', type: 'password' }
      ],
      icon: 'KeyRound'
    },
    configure_filters: {
      title: 'Configure Filters',
      description: 'Set up filtering rules',
      fields: [
        { key: 'filter_type', label: 'Filter Type', type: 'select', options: ['DNS', 'HTTP', 'Network'] },
        { key: 'rule', label: 'Rule', type: 'text' }
      ],
      icon: 'Filter'
    },
    view_logs: {
      title: 'View Logs',
      description: 'Access log viewer',
      fields: [
        { key: 'time_range', label: 'Time Range', type: 'select', options: ['Last Hour', 'Last 24 Hours', 'Last 7 Days'] }
      ],
      icon: 'FileText'
    },
    update_rules: {
      title: 'Update Rules',
      description: 'Modify filtering rules',
      fields: [
        { key: 'rule_set', label: 'Rule Set', type: 'text' }
      ],
      icon: 'ListChecks'
    },
    add_route: {
      title: 'Add Route',
      description: 'Add network route',
      fields: [
        { key: 'cidr', label: 'CIDR Range', type: 'text' },
        { key: 'gateway', label: 'Gateway', type: 'text' }
      ],
      icon: 'Plus'
    },
    remove_route: {
      title: 'Remove Route',
      description: 'Remove network route',
      fields: [
        { key: 'route_id', label: 'Route ID', type: 'text' }
      ],
      icon: 'Minus'
    },
    generate: {
      title: 'Generate Token',
      description: 'Generate new service token',
      fields: [
        { key: 'duration', label: 'Duration', type: 'select', options: ['1 day', '7 days', '30 days', '1 year'] }
      ],
      icon: 'Key'
    },
    revoke: {
      title: 'Revoke Token',
      description: 'Revoke service token',
      fields: [],
      icon: 'XCircle'
    },
    rotate: {
      title: 'Rotate Token',
      description: 'Rotate service token',
      fields: [],
      icon: 'RefreshCw'
    },
    view_usage: {
      title: 'View Usage',
      description: 'View token usage statistics',
      fields: [
        { key: 'time_range', label: 'Time Range', type: 'select', options: ['Last Hour', 'Last 24 Hours', 'Last 7 Days'] }
      ],
      icon: 'BarChart'
    }
  };

  const config = actionConfigs[action] || {
    title: action.replace(/_/g, ' '),
    description: `Execute ${action.replace(/_/g, ' ')} action`,
    fields: [],
    icon: 'Zap'
  };

  const ActionIcon = Icons[config.icon] || Icons.Zap;

  const handleSubmit = (e) => {
    e.preventDefault();
    const resultMessage = `Successfully executed "${config.title}" on ${node.data.label}`;
    setResult({ success: true, message: resultMessage, data: formData });
    
    if (onExecute) {
      onExecute(action, formData);
    }
  };

  const handleFieldChange = (key, value, type) => {
    if (type === 'boolean') {
      setFormData({ ...formData, [key]: value === 'true' });
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: definition.color }}
              >
                <ActionIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
                <p className="text-sm text-gray-600">{node.data.label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icons.X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>

        {result ? (
          <div className="flex-1 p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icons.CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Success</span>
              </div>
              <p className="text-sm text-green-700">{result.message}</p>
            </div>
            
            {Object.keys(result.data).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Action Details</h4>
                <div className="space-y-2">
                  {Object.entries(result.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {config.fields.length > 0 ? (
              <div className="space-y-4">
                {config.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <select
                        value={String(formData[field.key] || false)}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : field.type === 'password' ? (
                      <input
                        type="password"
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ActionIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  This action will be executed immediately when you click the button below.
                </p>
              </div>
            )}
          </form>
        )}

        <div className="p-6 border-t border-gray-200 flex gap-3">
          {result ? (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ActionIcon className="w-4 h-4" />
                Execute
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CTAModal;
