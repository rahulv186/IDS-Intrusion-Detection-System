# MQTT Security Monitoring Dashboard

A full-featured React dashboard for MQTT security monitoring with dark/light mode, glassmorphism UI, live charts, and auto-refreshing data.

## Features

- **Responsive layout** – Works on desktop and mobile
- **Dark/Light mode** – Toggle with transitions
- **Dashboard** – Stat cards, device table, threats table, charts
- **Stat cards** – Connected devices, threats, vulnerabilities, broker status (glassmorphism)
- **Device table** – Sortable, searchable; disconnected devices highlighted in red
- **Threats table** – Paginated; critical threats highlighted in red
- **Charts** – Pie (vulnerability distribution), Line (threats over time) via Recharts
- **API integration** – Auto-refresh every 5–10 seconds
- **Collapsible sidebar** – Dashboard, Devices, Threats, Logs links

## Tech Stack

- React 18 + Vite
- TailwindCSS
- React Router
- Recharts (no paid UI libraries)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## API Endpoints

The app expects these endpoints (fallback mock data if unavailable):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard/stats` | GET | Stats for main cards (connectedDevices, totalThreats, totalVulnerabilities, brokerStatus) |
| `/api/devices` | GET | Device list (deviceId, ip, status, lastSeen) |
| `/api/threats` | GET | Threats (threatId, attackType, client, severity, timestamp); chart data (threatsOverTime, vulnerabilityDistribution) |

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/client.js          # API fetch helpers
├── components/
│   ├── StatCard.jsx       # Glassmorphism stat cards
│   ├── DeviceTable.jsx    # Devices with sort/search
│   ├── ThreatsTable.jsx   # Threats with pagination
│   ├── VulnerabilityPieChart.jsx
│   ├── ThreatsLineChart.jsx
│   ├── Sidebar.jsx
│   ├── Layout.jsx
│   └── LoadingSpinner.jsx
├── context/ThemeContext.jsx
├── hooks/useApiPoll.js    # Auto-refresh API hooks
├── pages/
│   ├── DashboardPage.jsx
│   ├── DevicesPage.jsx
│   ├── ThreatsPage.jsx
│   └── LogsPage.jsx
├── App.jsx
├── main.jsx
└── index.css
```
