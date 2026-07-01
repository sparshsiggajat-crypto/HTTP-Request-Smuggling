# CLZero WebUI – HTTP/1.1 CL.0 Request Smuggling Scanner

An enterprise-grade, full-stack cybersecurity auditing platform designed to wrap around the **CLZero** request smuggling scanner. Built for Security Operations Center (SOC) dashboards and Ethical Hacking labs, CLZero WebUI delivers comprehensive pipeline desynchronization audits, real-time diagnostic logging feeds, interactive SVG risk timeline analytics, and print-ready vulnerability compliance reports.

This project was built to professional grade specifications for a Final Year University / College Capstone project.

---

## 🚀 Key Architectural Advantages

- **Full-Stack Orchestration**: Handled via an **Express + Node.js** microservices backend proxying the **Vite + React** single page application.
- **Embedded Database Registry**: Built around an atomic, robust JSON transactional registry system (`db.json`) maintaining users, historical scan logs, and active settings, fully immune to native C++ driver compile locks.
- **Subprocess Multi-threading Execution**: Standard, independent python evaluation core dispatched securely via Node `child_process.spawn`, streaming standard output logs dynamically via HTTP polling endpoints.
- **Cybersecurity Dark Aesthetic**: Custom-styled display headings, animated network vector canvas, micro-animations, glowing cyber alert meters, and professional monospaced console feeds.

---
live Delpoyment link:
https://clzero-webui-356200851822.asia-southeast1.run.app

---
## 🛠️ Technology Stack

### Frontend UI/UX
- **React 19 & TypeScript 5**
- **Vite 6** (Optimized bundling)
- **Tailwind CSS v4** (Utility class system with native performance)
- **Lucide React** (Vector cyber icon system)

### Backend Services
- **Express API Gateway**
- **Python 3.10+** (Subprocess scan dispatcher)
- **JSON Transactional Database Core** (Lightweight, fully persistent)
- **SHA256 Custom Encryption** (Password hashes & cryptographic token authorizations)

---

## 📁 System Directory Structure

```text
├── scanner.py          # High-performance Python CL.0 Request Smuggling Engine
├── server.ts           # Primary Express Gateway Server (Port 3000)
├── db.json             # Persistent relational SQLite-like local store (Auto-generated)
├── server/
│   ├── auth.ts         # JWT cryptographic session handshake middleware
│   └── db.ts           # DB controller implementing CRUD operators
├── src/
│   ├── App.tsx         # Central layout coordinator and router state machine
│   ├── main.tsx        # React client bootstrapping entry point
│   ├── index.css       # Global Tailwind CSS configurations
│   ├── types.ts        # Shared TypeScript interfaces & types
│   └── components/
│       ├── Sidebar.tsx # Collapsible enterprise navigational sidebar
│       ├── Navbar.tsx  # Dynamic status monitor & global search navbar
│       ├── Terminal.tsx# Real-time typing console logger stream
│       ├── StatsCard.tsx# Premium metric panel with glowing indicators
│       ├── ScanForm.tsx# Advanced smuggler options & target inputs form
│       ├── ResultsView.tsx # Vulnerability deep-dive analysis panel
│       ├── AnalyticsView.tsx # Glowing SVG timeline charts
│       ├── ReportsView.tsx # Compliance document generator & HTML exporter
│       ├── SettingsView.tsx # Thread controls, timeout, & alert settings
│       └── AboutView.tsx # Technical explainer for CL.0 request smuggling
```

---

## 🏃 Local Development Quick-Start

Follow these instructions to spin up the full-stack suite locally:

### Prerequisites
1. **Node.js** (v18+)
2. **Python** (v3.10+)

### Step-by-Step Installation
1. **Clone the project & navigate to the workspace root**:
   ```bash
   cd clzero-webui
   ```
2. **Install all platform dependencies**:
   ```bash
   npm install
   ```
3. **Start the collaborative dev servers**:
   ```bash
   npm run dev
   ```
   The backend gateway will launch on **`http://localhost:3000`** while serving the frontend client concurrently with Hot Module Replacement (HMR).

---

## ☁️ Production Deployment Roadmap

The codebase has been engineered with clean separations, allowing direct, single-command zero-dependency hosting.

### 1. Unified Render Backend Hosting
Deploy the integrated Node.js Express server which automatically compiles and serves the client:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Environment Variables**:
  - `NODE_ENV`: `production`

### 2. Static Vercel/Netlify Frontend (If Hosted Separately)
- **Build Command**: `vite build`
- **Publish Directory**: `dist`

### 3. Immediate Testing / Pre-seeded Operator
To facilitate immediate CAPSTONE testing, the database registry seeds a default active operator profile:
- **Operator Email**: `jat567432spa@gmail.com`
- **Password Key**: `password123`

---

## 🛡️ Educational Ethical Mandate
This application was built for **authorized academic penetration testing, local compliance verification, and educational demonstrations**. Auditing remote servers without explicit written contract agreements is illegal. Play with honor.
