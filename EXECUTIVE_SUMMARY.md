# ZTNA Dashboard Prototype
## Executive Summary

---

## What It Does

A unified dashboard for managing Cloudflare Zero Trust Network Access across multiple accounts, providing **real-time visibility** into network activity, **interactive topology visualization**, and **centralized configuration**.

---

## Four Core Views

| View | Purpose | Key Value |
|------|---------|-----------|
| **Account** | Switch between accounts | Manage Production, Staging, Dev environments |
| **Activity** | Monitor network traffic | Real-time metrics, playback for investigations |
| **Objects** | Visualize network topology | See users, devices, policies, apps & connections |
| **Settings** | Configure ZTNA policies | Authentication, access rules, logging |

---

## Standout Features

### Multi-Account Support
- **3 sample accounts** with different scales (Enterprise → Pro)
- Each account has unique objects and activity levels
- One-click switching, persistent state

### Real-Time Monitoring
- **6 key metrics**: Requests, Throughput, Errors, Blocks, P50/P95 Latency
- Live auto-updating dashboard
- Sparkline trend charts

### Historical Playback
- **Time-travel** through past activity
- Adjustable speed (0.5x - 8x)
- Custom date ranges
- **Export reports** (PDF/Email)

### Network Visualization
- **Summary view**: Object type counts at a glance
- **Expanded view**: Full interactive topology map
- Click to see object details & relationships
- Create connections via drag handles

### Health Status
- Traffic-light status indicator (🟢🟡🔴)
- Monitors error rates, latency, blocks
- Actionable alerts

---

## Demo Scenarios

1. **"Show me what happened at 2pm yesterday"**
   → Activity view → Playback mode → Set time range → Play

2. **"How is our Production vs Staging traffic?"**
   → Switch accounts → Compare Activity metrics

3. **"What apps can Sales users access?"**
   → Objects view → Expanded → Click Sales user → See connections

4. **"Export a compliance report"**
   → Activity view → Export Report → PDF or Email

---

## Technical Stack

- **React** + **Zustand** (state management)
- **ReactFlow** (network visualization)
- **TailwindCSS** (modern UI)

---

## To Run

```
npm run dev → http://localhost:3000
```

---

*Prototype with simulated data for demonstration purposes.*
