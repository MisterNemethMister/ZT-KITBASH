# Cloudflare Zero Trust Network Access Dashboard

## One-Liner

**A unified command center for visualizing, monitoring, and managing Zero Trust network security across your entire organization.**

---

## Executive Feature Summary

### WHY

**The Problem We Solve**

- Security teams lack unified visibility across multiple Zero Trust environments
- Investigating incidents requires switching between multiple tools and dashboards
- Understanding network topology and access relationships is complex and time-consuming
- Real-time threat detection and historical analysis are disconnected workflows

**Business Value**

- **Reduced Mean Time to Resolution (MTTR)** — Instant visibility into network activity and relationships
- **Improved Security Posture** — Proactive monitoring with actionable alerts
- **Operational Efficiency** — Single pane of glass for multi-account management
- **Compliance Ready** — Built-in reporting and audit trail capabilities

---

### WHAT

**Core Capabilities**

| Capability | Description |
|------------|-------------|
| **Multi-Account Management** | Switch between Production, Staging, and Dev environments instantly |
| **Real-Time Activity Monitoring** | Live metrics for requests, throughput, errors, blocks, and latency |
| **Interactive Network Topology** | Visual map of users, devices, applications, policies, and their connections |
| **Traffic Flow Visualization** | Sankey charts showing data volume flowing through network objects |
| **Historical Playback** | Time-travel through past activity for incident investigation |
| **Health Status Dashboard** | Traffic-light indicators (Good/OK/Bad) with actionable recommendations |
| **Global Settings Management** | Centralized configuration for authentication, access policies, and logging |
| **Export & Reporting** | Generate compliance reports via PDF or email |

**Key Metrics Tracked**

- Requests per minute
- Data throughput
- Error rate percentage
- Block rate percentage
- Latency (P50 and P95)
- Top traffic edges
- Top blocked connections
- Top error-prone connections

---

### WHEN

**Use Cases by Scenario**

| Scenario | Action |
|----------|--------|
| **Daily Operations** | Monitor Activity view for real-time health status |
| **Incident Response** | Use Playback mode to investigate "what happened at 2pm yesterday" |
| **Capacity Planning** | Analyze traffic patterns across accounts |
| **Access Reviews** | Explore Objects view to audit user-to-application relationships |
| **Compliance Audits** | Export activity reports for specific time ranges |
| **Policy Changes** | Configure settings and immediately see impact on traffic |

---

### WHERE

**Four Integrated Views**

1. **Account View**
   - Select and switch between Zero Trust accounts
   - View account details, plan type, and usage limits
   - See per-account network health status

2. **Activity View**
   - Real-time and historical traffic monitoring
   - Sankey chart for traffic flow visualization
   - Sparkline charts for trend analysis
   - Live/Playback mode toggle
   - Time range selection and custom date ranges

3. **Objects View**
   - **Summary Mode**: Object type counts at a glance (Users, Devices, Applications, Policies, etc.)
   - **Expanded Mode**: Full interactive network topology
   - Click any object to see details and relationships
   - Filter by object type
   - Create new objects and connections

4. **Settings View**
   - Team name and organization domain
   - Authentication settings (IdP, MFA, session duration)
   - Access policy defaults
   - Gateway and tunnel configuration
   - Logging and alerting preferences

---

### HOW

**Technical Implementation**

| Component | Technology |
|-----------|------------|
| Frontend Framework | React 18 |
| State Management | Zustand |
| Network Visualization | ReactFlow |
| Charts & Graphs | D3.js (Sankey), Custom Sparklines |
| Styling | TailwindCSS |
| Icons | Lucide React |
| Build Tool | Vite |

**Responsive Design**

- Adapts to desktop, tablet, and mobile viewports
- Toolbar collapses to icons on narrow screens
- Charts reorient for optimal viewing
- Summary cards stack responsively

**Data Architecture**

- Simulated real-time event generation
- Per-account isolated state
- Persistent team names and settings per account
- Activity event history with configurable time windows

---

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

For production build:
```bash
npm run build
npm run preview
```

---

## Demo Walkthrough

1. **Account Selection** → Start in Account view, select "Production"
2. **Monitor Activity** → Switch to Activity view, observe real-time metrics
3. **Investigate Traffic** → Review Sankey chart for traffic flow patterns
4. **Explore Topology** → Go to Objects view, toggle to Expanded mode
5. **Drill Down** → Click any object to see details and connections
6. **Check Health** → Click Network Status widget for detailed alerts
7. **Configure** → Visit Settings to adjust policies
8. **Compare Environments** → Switch to Staging account, compare metrics

---

*This prototype demonstrates the vision for unified Zero Trust management with simulated data for demonstration purposes.*
