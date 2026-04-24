<p align="center">
  <img src="https://img.shields.io/badge/Google%20Solution%20Challenge-2026-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Solution Challenge 2026" />
</p>

<h1 align="center">🧊 MediTrack AI</h1>

<p align="center">
  <strong>Open Intelligent Cold-Chain Supply Chain Platform for Pharmaceutical Logistics</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SDG%203-Good%20Health%20%26%20Well--being-4C9F38?style=flat-square" alt="SDG 3" />
  <img src="https://img.shields.io/badge/SDG%209-Industry%20%26%20Infrastructure-F36D25?style=flat-square" alt="SDG 9" />
  <img src="https://img.shields.io/badge/SDG%2017-Partnerships%20for%20Goals-19486A?style=flat-square" alt="SDG 17" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini%20API-8E75B2?style=flat-square&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Google%20Maps-4285F4?style=flat-square&logo=googlemaps&logoColor=white" alt="Google Maps" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p align="center">
  <a href="#-demo">Demo Video</a> •
  <a href="#-live-url">Live URL</a> •
  <a href="#-problem-statement">Problem</a> •
  <a href="#-solution">Solution</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-team">Team</a>
</p>

---

## 📺 Demo

▶️ **[Watch 2-Minute Demo Video on YouTube](https://youtube.com/your-demo-link)**

## 🌐 Live URL

🔗 **[meditrack-ai.vercel.app](https://meditrack-ai.vercel.app)**

---

## 📌 Problem Statement

Cold-chain pharmaceutical logistics is a global crisis hiding in plain sight.

- **1.5 million children** die annually from vaccine-preventable diseases (WHO)
- **Nearly 50% of vaccines** are wasted before reaching patients, largely due to cold-chain failure
- **$35 billion** lost annually to temperature excursions in healthcare logistics

Current systems suffer from:

- No real-time visibility into shipment conditions during transit
- Inability to predict failures before they happen
- No verifiable trust between manufacturers, carriers, and receivers
- Payment disputes due to missing or tampered delivery evidence
- Poor coordination across multiple stakeholders

**The result:** Medicine spoils. Money is lost. Patients suffer.

---

## 💡 Solution

**MediTrack AI** is an end-to-end intelligent cold-chain management platform that combines real-time monitoring, AI-powered risk prediction, blockchain verification, and conditional payments into a single unified system.

### Core Capabilities

| Capability | Description |
|---|---|
| **Digital Twin Engine** | Real-time simulation of shipment movement with temperature, humidity, speed, and GPS telemetry |
| **AI Risk Engine** | 6-factor risk prediction powered by Google Gemini with natural language explanations |
| **Blockchain Ledger** | Immutable event chain with hash verification and tamper detection |
| **Smart Payments** | Conditional payment release tied to verified delivery conditions |
| **Notification System** | Automated email and in-app alerts on critical events |
| **QR Trust Verification** | Patient-facing QR code to verify medicine safety end-to-end |

### How It Works

```
Shipment Created → Payment Escrowed → Live Tracking Begins
    ↓
Temperature Breach Detected → AI Generates Incident Report
    ↓
Blockchain Logs Event → Payment Auto-Holds → Email Alerts Fire
    ↓
Delivery Confirmed → Conditions Verified → Payment Released
    ↓
QR Code Generated → Patient Scans → "Verified by MediTrack AI ✓"
```

---

## 🎯 UN Sustainable Development Goals

| SDG | Goal | How MediTrack AI Contributes |
|---|---|---|
| **SDG 3** | Good Health & Well-being | Prevents vaccine and medicine spoilage by ensuring cold-chain integrity from manufacturer to patient |
| **SDG 9** | Industry, Innovation & Infrastructure | Builds intelligent, AI-driven logistics infrastructure for pharmaceutical supply chains |
| **SDG 17** | Partnerships for the Goals | Creates an open multi-stakeholder network enabling trust and collaboration across the supply chain |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      MEDITRACK AI                           │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  Digital     │  AI Risk     │  Blockchain  │  Payment      │
│  Twin Engine │  Engine      │  Module      │  Engine       │
│              │  (Gemini)    │              │               │
├──────────────┴──────────────┴──────────────┴───────────────┤
│                    Firebase Firestore                       │
│              (Real-time Event-Driven Database)              │
├─────────────────────────────────────────────────────────────┤
│              Next.js API Routes (Backend)                   │
├─────────────────────────────────────────────────────────────┤
│       Next.js + Tailwind + shadcn/ui (Frontend)            │
├─────────────────────────────────────────────────────────────┤
│                   Vercel (Deployment)                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS + shadcn/ui | Modern responsive dashboard |
| AI | Google Gemini API | Risk analysis, chatbot, reports, recommendations |
| Maps | Google Maps Platform / Leaflet | Live shipment tracking |
| Database | Firebase Firestore | Real-time event-driven data |
| Auth | Firebase Authentication | User management with role-based access |
| Charts | Recharts | Data visualization and analytics |
| QR | qrcode.react | Patient-facing trust verification |
| Deployment | Vercel | Frontend + API routes hosting |

### Google Technology Usage

| Google Tech | Integration Depth | Use Case |
|---|---|---|
| **Gemini API** | Deep — 6 touchpoints | Incident reports, risk recommendations, contextual chatbot, compliance summaries, scenario simulation, QR trust summaries |
| **Google Maps** | Core feature | Real-time shipment tracking with animated movement |
| **Firebase Auth** | Core feature | Multi-role authentication (Manufacturer, Carrier, Hospital, Regulator) |
| **Firebase Firestore** | Foundation | Real-time database powering all event-driven updates |

---

## 🧠 Gemini AI Integration — 6 Touchpoints

MediTrack AI uses Google Gemini not as a chatbot sidebar, but as the intelligence core of the platform.

| # | Touchpoint | What Gemini Does |
|---|---|---|
| 1 | **Auto Incident Reports** | On temperature breach or delay, generates plain-English incident report displayed on dashboard in real-time |
| 2 | **Risk Recommendations** | Analyzes route, weather, delay, and sensor data to recommend rerouting, backup cooling, or schedule changes |
| 3 | **Contextual Chatbot** | Answers queries like "Why is risk high?" with full shipment context — acts as an AI operations officer |
| 4 | **Compliance Reports** | On delivery, auto-generates compliance summary covering temperature adherence, transit time, incident history |
| 5 | **Scenario Simulator** | "What if temp rises 5°C?" — Gemini predicts outcome with risk assessment in natural language |
| 6 | **QR Trust Summary** | Patient-facing QR page shows Gemini-generated plain-English safety summary instead of raw data |

---

## 📊 Dashboard Pages

### Public Pages
- **Landing Page** — Hero, problem statement, SDG badges, feature highlights
- **Sign Up** — Role-based registration (Manufacturer, Carrier, Distributor, Hospital, Regulator)
- **Login** — Authentication with demo quick-access

### Dashboard (Authenticated)
- **Control Tower** — Live map, real-time telemetry, shipment table, risk gauge, alerts
- **AI & Optimization** — Risk breakdown, radar chart, AI recommendations, scenario simulator, Gemini chat
- **Blockchain Ledger** — Visual chain, hash verification, tamper detection, audit trail
- **Payments** — Transaction table, conditional logic, dispute resolution
- **Network** — Participant cards, roles, verification status
- **Notifications** — Alert feed, email logs, severity filters
- **Settings** — Profile, thresholds, preferences
- **Shipment Detail** — Deep dive with tracking, timeline, AI analysis, documents

### Overlays
- **Chatbot** — Floating Gemini-powered assistant on every page
- **Create Shipment** — Modal with full cascade trigger
- **QR Verification** — Public page (no login) showing medicine trust data

---

## 🔐 Multi-Factor Risk Model

| Factor | Weight | Description |
|---|---|---|
| Temperature | 30% | Deviation from required range |
| Traffic / Delay | 20% | Current delay vs expected transit |
| Route Efficiency | 15% | Deviation from optimal path |
| Weather / Disaster | 15% | Severe conditions or road hazards |
| Cooling System | 10% | Battery level, unit performance |
| Time in Transit | 10% | Elapsed time vs product sensitivity |

Gemini interprets the composite score (0–100%) and generates human-readable explanations with actionable recommendations.

---

## 💳 Conditional Payment Logic

```
Shipment Created     → Payment HELD (escrowed)
Breach Detected      → Payment ON HOLD (auto-paused)
Delivery Confirmed   → System checks 4 conditions:
                        ✓ Delivery receipt
                        ✓ Temperature compliance
                        ✓ Blockchain chain verified
                        ✓ Receiver signature
All Conditions Met   → Payment RELEASED (with blockchain proof)
Conditions Failed    → Payment DISPUTED (severity-based recommendation)
```

---

## 📱 QR Trust Verification

After delivery, MediTrack AI generates a QR code for each shipment. Patients or healthcare workers scan it to see:

- Product name and batch
- Temperature compliance graph
- Blockchain verification status
- Gemini-generated plain-English safety summary
- Final verdict: **"Verified by MediTrack AI ✓"**

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Git
- Firebase account
- Google AI Studio API key (for Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/YourUsername/meditrack-ai.git
cd meditrack-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in your actual keys in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

### Deployment

```bash
# Deploy to Vercel
npx vercel
```

---

## 📂 Project Structure

```
meditrack-ai/
├── src/
│   ├── app/
│   │   ├── api/                    # Backend API routes
│   │   │   ├── chat/route.js       # Gemini chatbot endpoint
│   │   │   ├── risk/route.js       # Risk analysis endpoint
│   │   │   ├── simulation/route.js # Simulation engine
│   │   │   ├── verify/route.js     # Blockchain verification
│   │   │   ├── incident/route.js   # Incident report generation
│   │   │   ├── compliance/route.js # Compliance report generation
│   │   │   ├── scenario/route.js   # Scenario simulator
│   │   │   └── qr-summary/route.js # QR trust page data
│   │   ├── page.js                 # Landing page
│   │   ├── login/                  # Login page
│   │   ├── signup/                 # Registration page
│   │   ├── dashboard/              # Dashboard pages
│   │   ├── shipment/               # Shipment detail
│   │   └── verify/[id]/           # QR public verification page
│   ├── components/                 # Reusable UI components
│   ├── lib/                        # Core utilities
│   │   ├── firebase.js             # Firebase configuration
│   │   ├── gemini.js               # Gemini API setup
│   │   └── blockchain.js           # Hash chain logic
├── docs/                           # Documentation
│   ├── data-schema.md              # Database schema
│   └── api-contract.md             # API endpoint contracts
├── seed-data/                      # Demo seed data
├── .env.example                    # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 👥 Team

| Name | Role | Responsibilities |
|---|---|---|
| **Mahi** | Backend & Systems | Firebase setup, API routes, Gemini integration, blockchain logic, simulation engine, deployment |
| **Faizan** | Frontend & Design | Dashboard UI, Google Maps integration, charts, animations, theme system, QR page |

---

## 📄 License

This project is built for the Google Solution Challenge 2026.

---

<p align="center">
  <em>"Every block in our chain is a promise that someone's medicine arrived safe."</em>
</p>

<p align="center">
  <strong>MediTrack AI</strong> — Intelligent Cold-Chain for Pharma
</p>
