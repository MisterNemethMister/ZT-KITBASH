export const NODE_TYPES = {
  USER: 'user',
  DEVICE: 'device',
  APPLICATION: 'application',
  TUNNEL: 'tunnel',
  ACCESS_POLICY: 'access_policy',
  IDENTITY_PROVIDER: 'identity_provider',
  GATEWAY: 'gateway',
  NETWORK: 'network',
  SERVICE_TOKEN: 'service_token'
};

export const OOUX_DEFINITIONS = {
  [NODE_TYPES.USER]: {
    name: 'User',
    description: 'End user accessing resources through Cloudflare Access',
    color: '#3b82f6',
    icon: 'User',
    attributes: [
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'groups', label: 'Groups', type: 'array', required: false },
      { key: 'mfa_enabled', label: 'MFA Enabled', type: 'boolean', required: false },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'suspended'], required: true }
    ],
    relations: ['device', 'access_policy', 'identity_provider'],
    callsToAction: ['authenticate', 'request_access', 'revoke_access', 'update_profile']
  },
  [NODE_TYPES.DEVICE]: {
    name: 'Device',
    description: 'User device with WARP client for secure connectivity',
    color: '#8b5cf6',
    icon: 'Laptop',
    attributes: [
      { key: 'device_id', label: 'Device ID', type: 'text', required: true },
      { key: 'device_name', label: 'Device Name', type: 'text', required: true },
      { key: 'os', label: 'Operating System', type: 'select', options: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'], required: true },
      { key: 'warp_enabled', label: 'WARP Enabled', type: 'boolean', required: true },
      { key: 'posture_check', label: 'Posture Check', type: 'select', options: ['passed', 'failed', 'pending'], required: false }
    ],
    relations: ['user', 'tunnel', 'gateway', 'access_policy'],
    callsToAction: ['connect', 'disconnect', 'check_posture', 'update_client']
  },
  [NODE_TYPES.APPLICATION]: {
    name: 'Application',
    description: 'Protected application or resource behind Cloudflare Access',
    color: '#10b981',
    icon: 'Globe',
    attributes: [
      { key: 'app_name', label: 'Application Name', type: 'text', required: true },
      { key: 'domain', label: 'Domain', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['web', 'ssh', 'rdp', 'vnc', 'smb'], required: true },
      { key: 'port', label: 'Port', type: 'number', required: false },
      { key: 'session_duration', label: 'Session Duration', type: 'text', required: false }
    ],
    relations: ['access_policy', 'tunnel', 'network'],
    callsToAction: ['configure', 'enable', 'disable', 'test_connection']
  },
  [NODE_TYPES.TUNNEL]: {
    name: 'Cloudflare Tunnel',
    description: 'Secure tunnel connecting private resources to Cloudflare network',
    color: '#f59e0b',
    icon: 'Network',
    attributes: [
      { key: 'tunnel_id', label: 'Tunnel ID', type: 'text', required: true },
      { key: 'tunnel_name', label: 'Tunnel Name', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'degraded'], required: true },
      { key: 'connector_id', label: 'Connector ID', type: 'text', required: false },
      { key: 'routes', label: 'Routes', type: 'array', required: false }
    ],
    relations: ['application', 'network', 'device', 'gateway'],
    callsToAction: ['create_route', 'update_config', 'restart', 'monitor']
  },
  [NODE_TYPES.ACCESS_POLICY]: {
    name: 'Access Policy',
    description: 'Zero Trust policy controlling access to resources',
    color: '#ef4444',
    icon: 'Shield',
    attributes: [
      { key: 'policy_name', label: 'Policy Name', type: 'text', required: true },
      { key: 'decision', label: 'Decision', type: 'select', options: ['allow', 'deny', 'bypass'], required: true },
      { key: 'rules', label: 'Rules', type: 'array', required: true },
      { key: 'priority', label: 'Priority', type: 'number', required: true },
      { key: 'enabled', label: 'Enabled', type: 'boolean', required: true }
    ],
    relations: ['application', 'user', 'device', 'identity_provider'],
    callsToAction: ['create_rule', 'update_rule', 'delete_rule', 'test_policy', 'enable', 'disable']
  },
  [NODE_TYPES.IDENTITY_PROVIDER]: {
    name: 'Identity Provider',
    description: 'IdP for user authentication (Okta, Azure AD, Google, etc.)',
    color: '#06b6d4',
    icon: 'Key',
    attributes: [
      { key: 'provider_name', label: 'Provider Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Okta', 'Azure AD', 'Google', 'OneLogin', 'SAML', 'OIDC'], required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', required: false },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], required: true }
    ],
    relations: ['user', 'access_policy'],
    callsToAction: ['configure', 'test_connection', 'sync_users', 'update_credentials']
  },
  [NODE_TYPES.GATEWAY]: {
    name: 'Cloudflare Gateway',
    description: 'Secure web gateway for DNS, HTTP, and network filtering',
    color: '#ec4899',
    icon: 'ShieldCheck',
    attributes: [
      { key: 'gateway_name', label: 'Gateway Name', type: 'text', required: true },
      { key: 'dns_filtering', label: 'DNS Filtering', type: 'boolean', required: true },
      { key: 'http_filtering', label: 'HTTP Filtering', type: 'boolean', required: true },
      { key: 'network_filtering', label: 'Network Filtering', type: 'boolean', required: true },
      { key: 'logging_enabled', label: 'Logging Enabled', type: 'boolean', required: true }
    ],
    relations: ['device', 'tunnel', 'network'],
    callsToAction: ['configure_filters', 'view_logs', 'update_rules', 'test_policy']
  },
  [NODE_TYPES.NETWORK]: {
    name: 'Private Network',
    description: 'Private network segment accessible through ZTNA',
    color: '#14b8a6',
    icon: 'Network',
    attributes: [
      { key: 'network_name', label: 'Network Name', type: 'text', required: true },
      { key: 'cidr', label: 'CIDR Range', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text', required: false },
      { key: 'vlan_id', label: 'VLAN ID', type: 'number', required: false }
    ],
    relations: ['tunnel', 'application', 'gateway'],
    callsToAction: ['add_route', 'remove_route', 'configure', 'monitor']
  },
  [NODE_TYPES.SERVICE_TOKEN]: {
    name: 'Service Token',
    description: 'Machine-to-machine authentication token',
    color: '#a855f7',
    icon: 'KeyRound',
    attributes: [
      { key: 'token_name', label: 'Token Name', type: 'text', required: true },
      { key: 'client_id', label: 'Client ID', type: 'text', required: true },
      { key: 'expires_at', label: 'Expires At', type: 'date', required: false },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'expired', 'revoked'], required: true }
    ],
    relations: ['application', 'access_policy'],
    callsToAction: ['generate', 'revoke', 'rotate', 'view_usage']
  }
};

export const RELATION_TYPES = {
  AUTHENTICATES: 'authenticates',
  CONNECTS_TO: 'connects_to',
  PROTECTS: 'protects',
  ROUTES_THROUGH: 'routes_through',
  ENFORCES: 'enforces',
  BELONGS_TO: 'belongs_to',
  FILTERS: 'filters'
};
