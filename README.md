# Cloudflare Zero Trust Network Access (ZTNA) Prototype

## Executive Overview

This interactive prototype demonstrates a comprehensive Zero Trust Network Access management dashboard. It provides real-time visibility into network activity, object relationships, and configuration settings across multiple accounts.

---

## Key Capabilities

### 1. Multi-Account Management

**Switch between accounts instantly** - The prototype supports multiple ZTNA accounts with different configurations and scale:

| Account | Type | Objects | Activity Level |
|---------|------|---------|----------------|
| Cloudflare 1 Production | Enterprise | 23 nodes, 35 connections | High traffic |
| Cloudflare 1 Staging | Business | 11 nodes, 13 connections | Moderate traffic |
| Cloudflare 1 Dev | Pro | 6 nodes, 5 connections | Low traffic |

**Features:**
- One-click account switching from any view
- Account name displayed in navigation bar
- Each account maintains its own network topology and activity data
- Account details show usage limits, billing, and Zero Trust configuration status

![Account View](screenshots/account-view.png)
*Account selection and detailed account information*

---

### 2. Real-Time Activity Monitoring

**Live network activity dashboard** with comprehensive metrics and visualizations:

**Key Metrics Displayed:**
- **Requests/min** - Real-time request throughput
- **Throughput** - Data transfer volume
- **Error Rate** - Percentage of failed requests
- **Block Rate** - Policy enforcement actions
- **Latency (P50/P95)** - Response time percentiles

**Features:**
- Live mode with auto-updating metrics
- Playback mode for historical analysis
- Configurable time ranges (1min, 5min, 15min, 1hr, custom)
- Sparkline charts for trend visualization
- Top connections analysis (busiest, most blocked, most errors)

![Activity Dashboard](screenshots/activity-dashboard.png)
*Real-time activity monitoring with metrics and charts*

---

### 3. Playback & Historical Analysis

**Time-travel through network activity** to investigate incidents:

**Features:**
- Scrubber control for precise time navigation
- Adjustable playback speed (0.5x, 1x, 2x, 4x, 8x)
- Continuous loop playback until paused
- Custom date/time range selection
- Export reports as PDF or share via email

![Playback Controls](screenshots/playback-controls.png)
*Playback scrubber and time range controls*

---

### 4. Network Object Visualization

**Two visualization modes** for understanding network topology:

#### Summary View (Default)
- Aggregated view of object types
- Quick overview of network composition
- Object type counts at a glance

#### Expanded View
- Full network topology map
- Interactive node selection
- Connection visualization with traffic flow
- Drag handles for creating new connections
- Zoom, pan, and fit controls

**Object Types Supported:**
- Users
- Devices
- Identity Providers
- Gateways
- Access Policies
- Tunnels
- Applications
- Networks
- Service Tokens

![Objects Summary](screenshots/objects-summary.png)
*Summary view showing object type aggregation*

![Objects Expanded](screenshots/objects-expanded.png)
*Expanded view showing full network topology*

---

### 5. Object Details & Relationships

**Deep-dive into any network object:**

**Features:**
- Click any node to view detailed attributes
- See all connected objects
- Relationship highlighting (green connections)
- Filter by object type
- Edit object properties
- Context-aware calls to action

![Object Details](screenshots/object-details.png)
*Selected object with details and connections highlighted*

---

### 6. Global Settings Management

**Configure ZTNA policies and preferences:**

**Settings Categories:**
- **General** - Team name, organization domain
- **Authentication** - Default IdP, session duration, MFA requirements
- **Access Policies** - Default actions, geo-restrictions, device posture
- **Gateway & Tunnels** - WARP requirements, split tunneling, protocols
- **Logging & Analytics** - Activity logging, retention, real-time alerts
- **Advanced** - API access, audit mode, TLS settings

![Settings View](screenshots/settings-view.png)
*Global ZTNA settings configuration*

---

### 7. Network Health Status

**At-a-glance health monitoring:**

**Status Levels:**
- 🟢 **Healthy** - All systems operational
- 🟡 **Warning** - Elevated error/block rates or latency
- 🔴 **Critical** - Significant issues detected

**Signals Monitored:**
- Error rate thresholds
- Block rate thresholds
- Latency percentiles
- Telemetry freshness

![Status Widget](screenshots/status-widget.png)
*Network health status indicator*

---

## Navigation

The prototype features a unified navigation bar across all views:

```
[ Account Name ] | Activity | Objects | Settings
```

- **Account** - Switch accounts, view account details
- **Activity** - Real-time monitoring and playback
- **Objects** - Network topology visualization
- **Settings** - Global configuration

---

## Technical Highlights

- **React** with modern hooks architecture
- **Zustand** for state management (persistent across views)
- **ReactFlow** for interactive network visualization
- **TailwindCSS** for responsive, modern UI
- **Lucide** icons for consistent iconography

---

## Use Cases Demonstrated

1. **Incident Investigation** - Use playback to review activity during a security event
2. **Capacity Planning** - Compare activity levels across Production/Staging/Dev
3. **Policy Audit** - Review access policies and their protected applications
4. **Compliance Reporting** - Export activity reports for stakeholders
5. **Network Discovery** - Visualize relationships between users, devices, and applications

---

## Next Steps

This prototype demonstrates core ZTNA dashboard capabilities. Potential enhancements:

- Integration with live Cloudflare API
- Advanced filtering and search
- Custom dashboard layouts
- Alert configuration and notifications
- Role-based access control
- Audit logging

---

*Prototype built for demonstration purposes. Data shown is simulated.*

---

## How to Run

```bash
cd /Users/cnemeth/ZT_TEST
npm run dev
```

Access at: **http://localhost:3000**

