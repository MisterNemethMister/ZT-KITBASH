import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { NODE_TYPES, OOUX_DEFINITIONS } from '../data/oouxModel';

const initialNodes = [
  // Users
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: {
      nodeType: NODE_TYPES.USER,
      label: 'Admin User',
      attributes: {
        email: 'admin@company.com',
        name: 'Admin User',
        groups: ['admins', 'engineering'],
        mfa_enabled: true,
        status: 'active'
      }
    }
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 100, y: 300 },
    data: {
      nodeType: NODE_TYPES.USER,
      label: 'Developer',
      attributes: {
        email: 'dev@company.com',
        name: 'Jane Developer',
        groups: ['engineering', 'developers'],
        mfa_enabled: true,
        status: 'active'
      }
    }
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 100, y: 500 },
    data: {
      nodeType: NODE_TYPES.USER,
      label: 'Sales Rep',
      attributes: {
        email: 'sales@company.com',
        name: 'Bob Sales',
        groups: ['sales'],
        mfa_enabled: false,
        status: 'active'
      }
    }
  },
  // Devices
  {
    id: '4',
    type: 'custom',
    position: { x: 350, y: 50 },
    data: {
      nodeType: NODE_TYPES.DEVICE,
      label: 'Admin MacBook Pro',
      attributes: {
        device_id: 'dev-001',
        device_name: 'Admin MacBook Pro',
        os: 'macOS',
        warp_enabled: true,
        posture_check: 'passed'
      }
    }
  },
  {
    id: '5',
    type: 'custom',
    position: { x: 350, y: 180 },
    data: {
      nodeType: NODE_TYPES.DEVICE,
      label: 'Admin iPhone',
      attributes: {
        device_id: 'dev-002',
        device_name: 'Admin iPhone',
        os: 'iOS',
        warp_enabled: true,
        posture_check: 'passed'
      }
    }
  },
  {
    id: '6',
    type: 'custom',
    position: { x: 350, y: 280 },
    data: {
      nodeType: NODE_TYPES.DEVICE,
      label: 'Dev Laptop',
      attributes: {
        device_id: 'dev-003',
        device_name: 'Dev Laptop',
        os: 'Linux',
        warp_enabled: true,
        posture_check: 'passed'
      }
    }
  },
  {
    id: '7',
    type: 'custom',
    position: { x: 350, y: 380 },
    data: {
      nodeType: NODE_TYPES.DEVICE,
      label: 'Dev Workstation',
      attributes: {
        device_id: 'dev-004',
        device_name: 'Dev Workstation',
        os: 'Windows',
        warp_enabled: true,
        posture_check: 'passed'
      }
    }
  },
  {
    id: '8',
    type: 'custom',
    position: { x: 350, y: 500 },
    data: {
      nodeType: NODE_TYPES.DEVICE,
      label: 'Sales Laptop',
      attributes: {
        device_id: 'dev-005',
        device_name: 'Sales Laptop',
        os: 'Windows',
        warp_enabled: true,
        posture_check: 'pending'
      }
    }
  },
  {
    id: '9',
    type: 'custom',
    position: { x: 350, y: 600 },
    data: {
      nodeType: NODE_TYPES.DEVICE,
      label: 'Sales iPad',
      attributes: {
        device_id: 'dev-006',
        device_name: 'Sales iPad',
        os: 'iOS',
        warp_enabled: false,
        posture_check: 'failed'
      }
    }
  },
  // Identity Provider
  {
    id: '10',
    type: 'custom',
    position: { x: 100, y: 700 },
    data: {
      nodeType: NODE_TYPES.IDENTITY_PROVIDER,
      label: 'Okta SSO',
      attributes: {
        provider_name: 'Okta SSO',
        type: 'Okta',
        client_id: 'okta-client-123',
        status: 'active'
      }
    }
  },
  // Gateway
  {
    id: '11',
    type: 'custom',
    position: { x: 600, y: 300 },
    data: {
      nodeType: NODE_TYPES.GATEWAY,
      label: 'CF Gateway',
      attributes: {
        gateway_name: 'CF Gateway',
        dns_filtering: true,
        http_filtering: true,
        network_filtering: true,
        logging_enabled: true
      }
    }
  },
  // Access Policies
  {
    id: '12',
    type: 'custom',
    position: { x: 850, y: 100 },
    data: {
      nodeType: NODE_TYPES.ACCESS_POLICY,
      label: 'Admin Policy',
      attributes: {
        policy_name: 'Admin Policy',
        decision: 'allow',
        rules: ['email ends with @company.com', 'MFA required', 'Device posture passed'],
        priority: 1,
        enabled: true
      }
    }
  },
  {
    id: '13',
    type: 'custom',
    position: { x: 850, y: 250 },
    data: {
      nodeType: NODE_TYPES.ACCESS_POLICY,
      label: 'Developer Policy',
      attributes: {
        policy_name: 'Developer Policy',
        decision: 'allow',
        rules: ['group is developers', 'MFA required'],
        priority: 2,
        enabled: true
      }
    }
  },
  {
    id: '14',
    type: 'custom',
    position: { x: 850, y: 400 },
    data: {
      nodeType: NODE_TYPES.ACCESS_POLICY,
      label: 'Sales Policy',
      attributes: {
        policy_name: 'Sales Policy',
        decision: 'allow',
        rules: ['group is sales', 'Device WARP enabled'],
        priority: 3,
        enabled: true
      }
    }
  },
  // Tunnels
  {
    id: '15',
    type: 'custom',
    position: { x: 600, y: 500 },
    data: {
      nodeType: NODE_TYPES.TUNNEL,
      label: 'Production Tunnel',
      attributes: {
        tunnel_id: 'tunnel-prod-001',
        tunnel_name: 'Production Tunnel',
        status: 'active',
        connector_id: 'conn-001',
        routes: ['10.0.0.0/24']
      }
    }
  },
  {
    id: '16',
    type: 'custom',
    position: { x: 600, y: 650 },
    data: {
      nodeType: NODE_TYPES.TUNNEL,
      label: 'Dev Tunnel',
      attributes: {
        tunnel_id: 'tunnel-dev-001',
        tunnel_name: 'Dev Tunnel',
        status: 'active',
        connector_id: 'conn-002',
        routes: ['10.1.0.0/24']
      }
    }
  },
  // Applications
  {
    id: '17',
    type: 'custom',
    position: { x: 1100, y: 100 },
    data: {
      nodeType: NODE_TYPES.APPLICATION,
      label: 'Admin Dashboard',
      attributes: {
        app_name: 'Admin Dashboard',
        domain: 'admin.company.com',
        type: 'web',
        port: 443,
        session_duration: '8h'
      }
    }
  },
  {
    id: '18',
    type: 'custom',
    position: { x: 1100, y: 250 },
    data: {
      nodeType: NODE_TYPES.APPLICATION,
      label: 'Dev Portal',
      attributes: {
        app_name: 'Dev Portal',
        domain: 'dev.company.com',
        type: 'web',
        port: 443,
        session_duration: '24h'
      }
    }
  },
  {
    id: '19',
    type: 'custom',
    position: { x: 1100, y: 400 },
    data: {
      nodeType: NODE_TYPES.APPLICATION,
      label: 'CRM System',
      attributes: {
        app_name: 'CRM System',
        domain: 'crm.company.com',
        type: 'web',
        port: 443,
        session_duration: '12h'
      }
    }
  },
  {
    id: '20',
    type: 'custom',
    position: { x: 1100, y: 550 },
    data: {
      nodeType: NODE_TYPES.APPLICATION,
      label: 'SSH Server',
      attributes: {
        app_name: 'SSH Server',
        domain: 'ssh.company.com',
        type: 'ssh',
        port: 22,
        session_duration: '4h'
      }
    }
  },
  // Networks
  {
    id: '21',
    type: 'custom',
    position: { x: 850, y: 600 },
    data: {
      nodeType: NODE_TYPES.NETWORK,
      label: 'Production Network',
      attributes: {
        network_name: 'Production Network',
        cidr: '10.0.0.0/24',
        location: 'US-East',
        vlan_id: 100
      }
    }
  },
  {
    id: '22',
    type: 'custom',
    position: { x: 850, y: 750 },
    data: {
      nodeType: NODE_TYPES.NETWORK,
      label: 'Dev Network',
      attributes: {
        network_name: 'Dev Network',
        cidr: '10.1.0.0/24',
        location: 'US-West',
        vlan_id: 200
      }
    }
  },
  // Service Token
  {
    id: '23',
    type: 'custom',
    position: { x: 1100, y: 700 },
    data: {
      nodeType: NODE_TYPES.SERVICE_TOKEN,
      label: 'CI/CD Token',
      attributes: {
        token_name: 'CI/CD Token',
        client_id: 'service-token-001',
        expires_at: '2026-12-31',
        status: 'active'
      }
    }
  }
];

const initialEdges = [
  // Users to Devices
  { id: 'e1-4', source: '1', target: '4', label: 'owns', animated: true },
  { id: 'e1-5', source: '1', target: '5', label: 'owns', animated: true },
  { id: 'e2-6', source: '2', target: '6', label: 'owns', animated: true },
  { id: 'e2-7', source: '2', target: '7', label: 'owns', animated: true },
  { id: 'e3-8', source: '3', target: '8', label: 'owns', animated: true },
  { id: 'e3-9', source: '3', target: '9', label: 'owns', animated: true },
  
  // Users to Identity Provider
  { id: 'e1-10', source: '1', target: '10', label: 'authenticates', animated: true },
  { id: 'e2-10', source: '2', target: '10', label: 'authenticates', animated: true },
  { id: 'e3-10', source: '3', target: '10', label: 'authenticates', animated: true },
  
  // Devices to Gateway
  { id: 'e4-11', source: '4', target: '11', label: 'connects', animated: true },
  { id: 'e5-11', source: '5', target: '11', label: 'connects', animated: true },
  { id: 'e6-11', source: '6', target: '11', label: 'connects', animated: true },
  { id: 'e7-11', source: '7', target: '11', label: 'connects', animated: true },
  { id: 'e8-11', source: '8', target: '11', label: 'connects', animated: true },
  { id: 'e9-11', source: '9', target: '11', label: 'connects', animated: true },
  
  // Gateway to Tunnels
  { id: 'e11-15', source: '11', target: '15', label: 'routes', animated: true },
  { id: 'e11-16', source: '11', target: '16', label: 'routes', animated: true },
  
  // Identity Provider to Policies
  { id: 'e10-12', source: '10', target: '12', label: 'enforces', animated: true },
  { id: 'e10-13', source: '10', target: '13', label: 'enforces', animated: true },
  { id: 'e10-14', source: '10', target: '14', label: 'enforces', animated: true },
  
  // Policies to Applications
  { id: 'e12-17', source: '12', target: '17', label: 'protects', animated: true },
  { id: 'e13-18', source: '13', target: '18', label: 'protects', animated: true },
  { id: 'e13-20', source: '13', target: '20', label: 'protects', animated: true },
  { id: 'e14-19', source: '14', target: '19', label: 'protects', animated: true },
  
  // Tunnels to Networks
  { id: 'e15-21', source: '15', target: '21', label: 'connects', animated: true },
  { id: 'e16-22', source: '16', target: '22', label: 'connects', animated: true },
  
  // Tunnels to Applications
  { id: 'e15-17', source: '15', target: '17', label: 'routes_to', animated: true },
  { id: 'e15-19', source: '15', target: '19', label: 'routes_to', animated: true },
  { id: 'e16-18', source: '16', target: '18', label: 'routes_to', animated: true },
  { id: 'e16-20', source: '16', target: '20', label: 'routes_to', animated: true },
  
  // Applications to Networks
  { id: 'e17-21', source: '17', target: '21', label: 'hosted_on', animated: true },
  { id: 'e18-22', source: '18', target: '22', label: 'hosted_on', animated: true },
  { id: 'e19-21', source: '19', target: '21', label: 'hosted_on', animated: true },
  { id: 'e20-22', source: '20', target: '22', label: 'hosted_on', animated: true },
  
  // Service Token to Application
  { id: 'e23-20', source: '23', target: '20', label: 'authenticates', animated: true }
];

// Staging account - smaller setup (fewer objects)
const stagingNodes = [
  // Users (2)
  { id: 's1', type: 'custom', position: { x: 100, y: 100 }, data: { nodeType: NODE_TYPES.USER, label: 'QA Engineer', attributes: { email: 'qa@staging.com', name: 'QA Engineer', groups: ['qa'], mfa_enabled: true, status: 'active' } } },
  { id: 's2', type: 'custom', position: { x: 100, y: 250 }, data: { nodeType: NODE_TYPES.USER, label: 'Test User', attributes: { email: 'test@staging.com', name: 'Test User', groups: ['testers'], mfa_enabled: false, status: 'active' } } },
  // Devices (2)
  { id: 's3', type: 'custom', position: { x: 350, y: 100 }, data: { nodeType: NODE_TYPES.DEVICE, label: 'QA Laptop', attributes: { device_id: 'stg-dev-001', device_name: 'QA Laptop', os: 'macOS', warp_enabled: true, posture_check: 'passed' } } },
  { id: 's4', type: 'custom', position: { x: 350, y: 250 }, data: { nodeType: NODE_TYPES.DEVICE, label: 'Test VM', attributes: { device_id: 'stg-dev-002', device_name: 'Test VM', os: 'Linux', warp_enabled: true, posture_check: 'passed' } } },
  // IdP
  { id: 's5', type: 'custom', position: { x: 100, y: 400 }, data: { nodeType: NODE_TYPES.IDENTITY_PROVIDER, label: 'Google Workspace', attributes: { provider_name: 'Google Workspace', type: 'Google', client_id: 'google-stg-123', status: 'active' } } },
  // Gateway
  { id: 's6', type: 'custom', position: { x: 500, y: 200 }, data: { nodeType: NODE_TYPES.GATEWAY, label: 'Staging Gateway', attributes: { gateway_name: 'Staging Gateway', dns_filtering: true, http_filtering: true, network_filtering: false, logging_enabled: true } } },
  // Policy (1)
  { id: 's7', type: 'custom', position: { x: 700, y: 100 }, data: { nodeType: NODE_TYPES.ACCESS_POLICY, label: 'Staging Policy', attributes: { policy_name: 'Staging Policy', decision: 'allow', rules: ['email ends with @staging.com'], priority: 1, enabled: true } } },
  // Tunnel (1)
  { id: 's8', type: 'custom', position: { x: 500, y: 350 }, data: { nodeType: NODE_TYPES.TUNNEL, label: 'Staging Tunnel', attributes: { tunnel_id: 'stg-tunnel-001', tunnel_name: 'Staging Tunnel', status: 'active', connector_id: 'stg-conn-001', routes: ['10.2.0.0/24'] } } },
  // Application (2)
  { id: 's9', type: 'custom', position: { x: 900, y: 100 }, data: { nodeType: NODE_TYPES.APPLICATION, label: 'Staging App', attributes: { app_name: 'Staging App', domain: 'app.staging.com', type: 'web', port: 443, session_duration: '24h' } } },
  { id: 's10', type: 'custom', position: { x: 900, y: 250 }, data: { nodeType: NODE_TYPES.APPLICATION, label: 'Test API', attributes: { app_name: 'Test API', domain: 'api.staging.com', type: 'web', port: 443, session_duration: '8h' } } },
  // Network (1)
  { id: 's11', type: 'custom', position: { x: 700, y: 350 }, data: { nodeType: NODE_TYPES.NETWORK, label: 'Staging Network', attributes: { network_name: 'Staging Network', cidr: '10.2.0.0/24', location: 'US-East', vlan_id: 300 } } },
];

const stagingEdges = [
  { id: 'se1-3', source: 's1', target: 's3', label: 'owns', animated: true },
  { id: 'se2-4', source: 's2', target: 's4', label: 'owns', animated: true },
  { id: 'se1-5', source: 's1', target: 's5', label: 'authenticates', animated: true },
  { id: 'se2-5', source: 's2', target: 's5', label: 'authenticates', animated: true },
  { id: 'se3-6', source: 's3', target: 's6', label: 'connects', animated: true },
  { id: 'se4-6', source: 's4', target: 's6', label: 'connects', animated: true },
  { id: 'se6-8', source: 's6', target: 's8', label: 'routes', animated: true },
  { id: 'se5-7', source: 's5', target: 's7', label: 'enforces', animated: true },
  { id: 'se7-9', source: 's7', target: 's9', label: 'protects', animated: true },
  { id: 'se7-10', source: 's7', target: 's10', label: 'protects', animated: true },
  { id: 'se8-11', source: 's8', target: 's11', label: 'connects', animated: true },
  { id: 'se9-11', source: 's9', target: 's11', label: 'hosted_on', animated: true },
  { id: 'se10-11', source: 's10', target: 's11', label: 'hosted_on', animated: true },
];

// Dev account - minimal setup (very few objects)
const devNodes = [
  // User (1)
  { id: 'd1', type: 'custom', position: { x: 100, y: 150 }, data: { nodeType: NODE_TYPES.USER, label: 'Dev Admin', attributes: { email: 'admin@dev.local', name: 'Dev Admin', groups: ['devs'], mfa_enabled: false, status: 'active' } } },
  // Device (1)
  { id: 'd2', type: 'custom', position: { x: 350, y: 150 }, data: { nodeType: NODE_TYPES.DEVICE, label: 'Dev Machine', attributes: { device_id: 'dev-001', device_name: 'Dev Machine', os: 'Linux', warp_enabled: true, posture_check: 'passed' } } },
  // IdP
  { id: 'd3', type: 'custom', position: { x: 100, y: 300 }, data: { nodeType: NODE_TYPES.IDENTITY_PROVIDER, label: 'GitHub SSO', attributes: { provider_name: 'GitHub SSO', type: 'GitHub', client_id: 'gh-dev-123', status: 'active' } } },
  // Gateway
  { id: 'd4', type: 'custom', position: { x: 500, y: 150 }, data: { nodeType: NODE_TYPES.GATEWAY, label: 'Dev Gateway', attributes: { gateway_name: 'Dev Gateway', dns_filtering: false, http_filtering: true, network_filtering: false, logging_enabled: true } } },
  // Policy (1)
  { id: 'd5', type: 'custom', position: { x: 650, y: 100 }, data: { nodeType: NODE_TYPES.ACCESS_POLICY, label: 'Dev Allow All', attributes: { policy_name: 'Dev Allow All', decision: 'allow', rules: ['any'], priority: 1, enabled: true } } },
  // Application (1)
  { id: 'd6', type: 'custom', position: { x: 800, y: 150 }, data: { nodeType: NODE_TYPES.APPLICATION, label: 'Local Dev App', attributes: { app_name: 'Local Dev App', domain: 'localhost.dev', type: 'web', port: 3000, session_duration: '72h' } } },
];

const devEdges = [
  { id: 'de1-2', source: 'd1', target: 'd2', label: 'owns', animated: true },
  { id: 'de1-3', source: 'd1', target: 'd3', label: 'authenticates', animated: true },
  { id: 'de2-4', source: 'd2', target: 'd4', label: 'connects', animated: true },
  { id: 'de3-5', source: 'd3', target: 'd5', label: 'enforces', animated: true },
  { id: 'de5-6', source: 'd5', target: 'd6', label: 'protects', animated: true },
];

// Account-specific data map
export const accountData = {
  'acct_cf_001': { nodes: initialNodes, edges: initialEdges, activityMultiplier: 1.0 },
  'acct_cf_002': { nodes: stagingNodes, edges: stagingEdges, activityMultiplier: 0.3 },
  'acct_cf_003': { nodes: devNodes, edges: devEdges, activityMultiplier: 0.1 },
};

export const useNetworkStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  connectedNodeIds: [],
  isCreating: false,
  isEditing: false,
  editingNode: null,
  filterNodeType: null,
  collapsedGroups: {},
  showSummaryNodes: true,
  layoutDirection: 'horizontal',
  appView: 'account',
  pendingFocusNodeId: null,
  
  accountTeamNames: {
    'acct_cf_001': 'Production Team',
    'acct_cf_002': 'Staging Team',
    'acct_cf_003': 'Dev Team',
  },
  
  setAccountTeamName: (accountId, teamName) => {
    set((state) => ({
      accountTeamNames: {
        ...state.accountTeamNames,
        [accountId]: teamName,
      },
    }));
  },

  accounts: [
    {
      id: 'acct_cf_001',
      name: 'Production',
      type: 'Enterprise',
      plan: 'Zero Trust Enterprise',
      status: 'Active',
      created: 'Jan 15, 2024',
      region: 'US - West',
      gateway: true,
      access: true,
      browserIsolation: true,
      casb: true,
      dlp: true,
      users: 1250,
      userLimit: 5000,
      applications: 47,
      applicationLimit: 100,
      tunnels: 12,
      tunnelLimit: 50,
      policies: 89,
      policyLimit: 500,
      supportPlan: 'Enterprise Premier',
      billingEmail: 'billing@cloudflare1.com',
      nextInvoice: 'Feb 1, 2026',
    },
    {
      id: 'acct_cf_002',
      name: 'Staging',
      type: 'Business',
      plan: 'Zero Trust Business',
      status: 'Active',
      created: 'Mar 22, 2024',
      region: 'US - East',
      gateway: true,
      access: true,
      browserIsolation: false,
      casb: false,
      dlp: false,
      users: 85,
      userLimit: 500,
      applications: 12,
      applicationLimit: 50,
      tunnels: 3,
      tunnelLimit: 10,
      policies: 24,
      policyLimit: 100,
      supportPlan: 'Business',
      billingEmail: 'staging-billing@cloudflare1.com',
      nextInvoice: 'Feb 1, 2026',
    },
    {
      id: 'acct_cf_003',
      name: 'Development',
      type: 'Pro',
      plan: 'Zero Trust Pro',
      status: 'Active',
      created: 'Jun 10, 2024',
      region: 'EU - West',
      gateway: true,
      access: true,
      browserIsolation: false,
      casb: false,
      dlp: false,
      users: 15,
      userLimit: 50,
      applications: 5,
      applicationLimit: 20,
      tunnels: 2,
      tunnelLimit: 5,
      policies: 8,
      policyLimit: 25,
      supportPlan: 'Standard',
      billingEmail: 'dev-billing@cloudflare1.com',
      nextInvoice: 'Feb 1, 2026',
    },
  ],
  currentAccountId: 'acct_cf_001',

  ztnaSettings: {
    orgDomain: '',
    defaultIdp: 'okta',
    sessionDuration: '24h',
    requireMfa: true,
    allowServiceTokens: true,
    defaultPolicyAction: 'block',
    geoRestrictions: false,
    devicePosture: true,
    browserIsolation: false,
    warpRequired: true,
    splitTunneling: false,
    tunnelProtocol: 'quic',
    activityLogging: true,
    logRetention: '30d',
    realTimeAlerts: true,
    alertEmail: '',
    apiAccess: true,
    auditMode: false,
    tlsMinVersion: '1.2',
  },

  activityEnabled: false,
  activityMode: 'live',
  activityWindowMs: 5 * 60 * 1000,
  playbackTime: Date.now(),
  playbackPlaying: false,
  playbackSpeed: 1,
  playbackAnchorEnd: Date.now(),
  activityEvents: [],
  
  accountStatuses: {
    'acct_cf_001': { level: 'good', status: 'Good' },
    'acct_cf_002': { level: 'good', status: 'Good' },
    'acct_cf_003': { level: 'good', status: 'Good' },
  },
  
  highlightedItem: null,
  
  setHighlightedItem: (item) => {
    set({ highlightedItem: item });
    if (item) {
      setTimeout(() => {
        set({ highlightedItem: null });
      }, 3000);
    }
  },
  
  setAccountStatus: (accountId, status) => {
    set((state) => ({
      accountStatuses: {
        ...state.accountStatuses,
        [accountId]: status,
      },
    }));
  },

  addNode: (nodeData) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: nodeData.position || { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        nodeType: nodeData.nodeType,
        label: nodeData.label,
        attributes: nodeData.attributes
      }
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      isCreating: false
    }));
  },

  updateNode: (nodeId, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      ),
      isEditing: false,
      editingNode: null
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNode: null
    }));
  },

  addEdge: (edgeData) => {
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: edgeData.source,
      target: edgeData.target,
      label: edgeData.label || 'connects',
      animated: true
    };
    set((state) => ({
      edges: [...state.edges, newEdge]
    }));
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId)
    }));
  },

  setSelectedNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    
    // Find all connected nodes
    const connectedNodeIds = new Set();
    state.edges.forEach(edge => {
      if (edge.source === nodeId) {
        connectedNodeIds.add(edge.target);
      }
      if (edge.target === nodeId) {
        connectedNodeIds.add(edge.source);
      }
    });
    
    set({ 
      selectedNode: node,
      connectedNodeIds: Array.from(connectedNodeIds)
    });
  },

  setPendingFocusNodeId: (nodeId) => {
    set({ pendingFocusNodeId: nodeId });
  },

  clearPendingFocusNodeId: () => {
    set({ pendingFocusNodeId: null });
  },

  clearSelection: () => {
    set({ selectedNode: null, connectedNodeIds: [] });
  },

  setIsCreating: (value) => {
    set({ isCreating: value });
  },

  setIsEditing: (value, node = null) => {
    set({ isEditing: value, editingNode: node });
  },

  setFilterNodeType: (nodeType) => {
    set({ filterNodeType: nodeType });
  },

  clearFilter: () => {
    set({ filterNodeType: null });
  },

  setLayoutDirection: (direction) => {
    set({ layoutDirection: direction });
  },

  toggleLayoutDirection: () => {
    set((state) => ({ layoutDirection: state.layoutDirection === 'horizontal' ? 'vertical' : 'horizontal' }));
  },

  organizeNodes: () => {
    const state = get();
    const nodes = state.nodes;
    
    // Improved hierarchical layout algorithm
    const nodesByType = {};
    nodes.forEach(node => {
      const type = node.data.nodeType;
      if (!nodesByType[type]) {
        nodesByType[type] = [];
      }
      nodesByType[type].push(node);
    });

    const organizedNodes = [];
    let currentY = 150;
    let currentX = 150;
    const typeSpacing = 300;
    const nodeSpacingX = 350;
    const nodeSpacingY = 200;

    // Define a logical order for node types (left to right flow)
    const typeOrder = ['user', 'device', 'identity_provider', 'gateway', 'tunnel', 'access_policy', 'application', 'network', 'service_token'];
    
    const sortedTypes = typeOrder.filter(type => nodesByType[type]);
    const remainingTypes = Object.keys(nodesByType).filter(type => !typeOrder.includes(type));
    const allTypes = [...sortedTypes, ...remainingTypes];

    allTypes.forEach((type) => {
      const typeNodes = nodesByType[type];
      const nodesPerLine = Math.min(4, Math.ceil(Math.sqrt(typeNodes.length)));

      if (state.layoutDirection === 'horizontal') {
        typeNodes.forEach((node, index) => {
          const row = index % nodesPerLine;
          const col = Math.floor(index / nodesPerLine);

          organizedNodes.push({
            ...node,
            position: {
              x: currentX + (col * nodeSpacingX),
              y: 150 + (row * nodeSpacingY)
            }
          });
        });

        const cols = Math.ceil(typeNodes.length / nodesPerLine);
        currentX += (cols * nodeSpacingX) + typeSpacing;
      } else {
        typeNodes.forEach((node, index) => {
          const row = Math.floor(index / nodesPerLine);
          const col = index % nodesPerLine;

          const nodesInRow = Math.min(nodesPerLine, typeNodes.length - (row * nodesPerLine));
          const rowOffset = (nodesPerLine - nodesInRow) * nodeSpacingX / 2;

          organizedNodes.push({
            ...node,
            position: {
              x: 150 + rowOffset + (col * nodeSpacingX),
              y: currentY + (row * nodeSpacingY)
            }
          });
        });

        const rows = Math.ceil(typeNodes.length / nodesPerLine);
        currentY += (rows * nodeSpacingY) + typeSpacing;
      }
    });

    set({ nodes: organizedNodes });
  },

  toggleSummaryNodes: () => {
    set((state) => ({ showSummaryNodes: !state.showSummaryNodes }));
  },

  setShowSummaryNodes: (show) => {
    set({ showSummaryNodes: !!show });
  },

  setAppView: (view) => {
    set({ appView: view });
  },

  toggleGroupCollapse: (nodeType) => {
    set((state) => ({
      collapsedGroups: {
        ...state.collapsedGroups,
        [nodeType]: !state.collapsedGroups[nodeType]
      }
    }));
  },

  expandAllGroups: () => {
    const state = get();
    const nodesByType = {};
    state.nodes.forEach(node => {
      const type = node.data.nodeType;
      if (!nodesByType[type]) {
        nodesByType[type] = 0;
      }
      nodesByType[type]++;
    });

    const newCollapsedGroups = {};
    Object.keys(nodesByType).forEach(type => {
      if (nodesByType[type] > 1) {
        newCollapsedGroups[type] = true; // true means expanded
      }
    });

    set({ collapsedGroups: newCollapsedGroups });
  },

  collapseAllGroups: () => {
    set({ collapsedGroups: {} });
  },

  getVisibleNodes: () => {
    const state = get();
    if (!state.showSummaryNodes) {
      return state.nodes;
    }

    const nodesByType = {};
    state.nodes.forEach(node => {
      const type = node.data.nodeType;
      if (!nodesByType[type]) {
        nodesByType[type] = [];
      }
      nodesByType[type].push(node);
    });

    const visibleNodes = [];
    Object.entries(nodesByType).forEach(([type, nodes]) => {
      if (nodes.length > 1 && !state.collapsedGroups[type]) {
        // Create summary node
        const avgX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;
        const avgY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;
        
        visibleNodes.push({
          id: `summary-${type}`,
          type: 'summary',
          position: { x: avgX, y: avgY },
          data: {
            nodeType: type,
            count: nodes.length,
            nodes: nodes
          }
        });
      } else {
        // Show individual nodes
        visibleNodes.push(...nodes);
      }
    });

    return visibleNodes;
  },

  onNodesChange: (changes) => {
    set((state) => {
      // Apply changes to the base nodes array
      const updatedNodes = applyNodeChanges(changes, state.nodes);
      return { nodes: updatedNodes };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges)
    }));
  },

  onConnect: (connection) => {
    get().addEdge(connection);
  },


  setZtnaSettings: (settings) => {
    set({ ztnaSettings: settings });
  },

  setCurrentAccountId: (id) => {
    const data = accountData[id] || accountData['acct_cf_001'];
    set({ 
      currentAccountId: id,
      nodes: data.nodes,
      edges: data.edges,
      activityEvents: [],
      selectedNode: null,
      connectedNodeIds: [],
      filterNodeType: null,
      showSummaryNodes: true,
    });
  },

  setActivityEnabled: (enabled) => {
    set({ activityEnabled: !!enabled });
  },

  setActivityMode: (mode) => {
    set({ activityMode: mode });
  },

  setActivityWindowMs: (ms) => {
    set({ activityWindowMs: ms });
  },

  setPlaybackTime: (tsOrUpdater) => {
    set((state) => ({
      playbackTime: typeof tsOrUpdater === 'function' ? tsOrUpdater(state.playbackTime) : tsOrUpdater
    }));
  },

  setPlaybackPlaying: (playing) => {
    set({ playbackPlaying: !!playing });
  },

  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: speed });
  },

  setPlaybackAnchorEnd: (ts) => {
    set({ playbackAnchorEnd: ts });
  },

  clearActivityEvents: () => {
    set({ activityEvents: [] });
  },

  setActivityEvents: (events) => {
    const next = Array.isArray(events) ? events : [];
    const maxEvents = 5000;
    const trimmed = next.length > maxEvents ? next.slice(next.length - maxEvents) : next;
    set({ activityEvents: trimmed });
  },

  addActivityEvent: (event) => {
    set((state) => {
      const next = [...state.activityEvents, event];
      const maxEvents = 5000;
      const trimmed = next.length > maxEvents ? next.slice(next.length - maxEvents) : next;
      return { activityEvents: trimmed };
    });
  }
}));
