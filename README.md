# 📡 Network Packet Analyser

A professional, full-stack network traffic analysis and telemetry monitoring dashboard built with **Node.js, Express, MongoDB (Mongoose), Socket.IO, and React (Vite)**.

---

## 🌟 Complete Feature Roadmap (Days 1–10)

| Phase | Key Features Implemented |
| :--- | :--- |
| **Day 1: Scaffolding** | Full-stack architecture (`/backend` Express + `/frontend` React/Vite), Mongoose setup, health checks, environment configs. |
| **Day 2: Data Models** | Mongoose `Packet` and `CaptureSession` schemas with indexing and realistic 50-packet database seed script. |
| **Day 3: Capture Service** | Autonomous packet capture simulation engine (300–800ms) with native PCAP library extensibility. |
| **Day 4: REST API** | Robust Express REST endpoints with pagination, query filtering, and MongoDB aggregation analytics pipeline. |
| **Day 5: Real-Time Stream** | Full Socket.IO integration for live `new-packet` and `capture-status` event broadcasting. |
| **Day 6: Core UI Layout** | Fixed Sidebar, Topbar, `ProtocolBadge`, `StatCard`, `PacketTable`, and cybersecurity dark theme design tokens. |
| **Day 7: REST API Hookup** | `axiosInstance` & `packetApi` connection, filterable `PacketHistory`, and real-time `Dashboard` data sync. |
| **Day 8: Live Capture & Charts** | Real-time `LiveCapture` streaming buffer with animations, and Recharts-powered `Stats` (Donut, Bar, Timeline). |
| **Day 9: Robustness & Errors** | Input validation on all routes, Express global error handler, React `ErrorBoundary`, and custom Toast alert system. |
| **Day 10: Polish & Deployment**| Loading skeletons, dark/light theme toggle, SPA redirect rules, Procfile, and cloud deployment guides. |

---

## 📁 Repository Structure

```text
Network Packet Analyser/
├── backend/
│   ├── models/
│   │   ├── CaptureSession.js         # Mongoose schema for capture sessions
│   │   └── Packet.js                 # Mongoose schema for network packets
│   ├── routes/
│   │   └── packetRoutes.js           # Validated REST API endpoints (/api/packets, /api/stats, etc.)
│   ├── scripts/
│   │   └── seedPackets.js            # Seed script populating sample session and 50 realistic packets
│   ├── services/
│   │   └── packetCaptureService.js   # Packet capture simulation & Socket.IO real-time broadcast engine
│   ├── .env.example                  # Backend environment configuration template
│   ├── .env                          # Local environment file
│   ├── package.json                  # Backend dependencies and scripts
│   ├── Procfile                      # Process file for Render / Railway
│   └── server.js                     # Express HTTP + Socket.IO server entrypoint
├── frontend/
│   ├── public/
│   │   └── _redirects                # Netlify / Cloudflare SPA redirect rule
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js      # Configured Axios instance with error interceptors
│   │   │   ├── packetApi.js          # REST API functions
│   │   │   └── socket.js             # Socket.IO client instance
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx     # Global error catcher for React render crashes
│   │   │   ├── PacketDetailsModal.jsx# Deep packet inspection modal with raw hex/ASCII dump
│   │   │   ├── PacketTable.jsx       # Reusable packet table with skeletons & animations
│   │   │   ├── ProtocolBadge.jsx     # Color-coded protocol tags (TCP, UDP, HTTP, DNS, etc.)
│   │   │   ├── Sidebar.jsx           # Responsive fixed navigation sidebar
│   │   │   ├── StatCard.jsx          # Metric cards with loading skeletons
│   │   │   ├── ToastContainer.jsx    # Custom animated toast alerts container
│   │   │   └── Topbar.jsx            # Top navbar with capture toggle and theme switcher
│   │   ├── context/
│   │   │   ├── CaptureContext.jsx    # Global state for capture status, active session, and stats
│   │   │   └── ToastContext.jsx      # Application-wide toast notifications
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # System overview, key metrics, and 10 recent packets
│   │   │   ├── LiveCapture.jsx       # Real-time WebSocket streaming feed with pause/resume
│   │   │   ├── PacketHistory.jsx     # Filterable/searchable packet history with pagination
│   │   │   └── Stats.jsx             # Recharts visualizations (Protocol Donut, Bandwidth Bar, Timeline)
│   │   ├── styles/
│   │   │   └── index.css             # Design system with dark/light themes, skeletons, and glassmorphism
│   │   ├── App.jsx                   # Application router & layout orchestration
│   │   └── main.jsx
│   ├── index.html                    # HTML shell with favicon & typography
│   ├── package.json                  # Frontend dependencies
│   ├── vercel.json                   # Vercel SPA rewrites
│   └── vite.config.js                # Vite configuration with backend proxy
├── .gitignore
└── README.md
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **MongoDB**: Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

---

### 2. Backend Setup
```bash
cd backend
npm install

# (Optional) Seed the database with sample packets
npm run seed

# Run the development server with auto-reload
npm run dev
```
The backend will launch at: **`http://localhost:5000`** (Health check: `http://localhost:5000/api/health`).

---

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Vite development server
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**.

---

## 🌐 Production Deployment Guide

### Deploy Backend (Render / Railway)
1. Push this repository to GitHub.
2. In **Render** or **Railway**, create a new Web Service pointing to the root directory with the root directory set to `backend`.
3. Set the build command to `npm install` and the start command to `node server.js` (or use the included `Procfile`).
4. Set the following environment variables:
   - `PORT` = `5000`
   - `MONGO_URI` = `<Your MongoDB Atlas connection URI>`
   - `CLIENT_URL` = `https://<your-frontend-domain>.vercel.app`
   - `NODE_ENV` = `production`

---

### Deploy Frontend (Vercel / Netlify)
1. Create a new project in **Vercel** or **Netlify** with the root directory set to `frontend`.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add the following environment variable in the dashboard:
   - `VITE_API_URL` = `https://<your-backend-domain>.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://<your-backend-domain>.onrender.com`
4. Deploy! The included `vercel.json` and `public/_redirects` will automatically handle SPA client-side routing.
