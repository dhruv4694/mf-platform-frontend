# MF Platform — Frontend

React 18 + Vite frontend for the Mutual Fund Platform.

## Prerequisites
- Node.js 18+
- The Spring Boot backend running on `localhost:8080`

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Architecture

Single-file SPA (`src/App.jsx`) — no routing library needed for a project of this size.
All pages, components, and API calls in one file for easy reading.

**Auth:** JWT stored in localStorage. `AuthContext` provides `api()` helper
that automatically injects the Authorization header on every request.

**Proxy:** Vite proxies `/api/*` to `localhost:8080` in dev — no CORS issues.

## Pages by role

### INVESTOR
- **Dashboard** — portfolio summary, asset allocation, holdings table
- **Portfolio** — full per-folio breakdown with returns
- **Schemes** — browse available schemes
- **Transactions** — history + new purchase form
- **SIP Mandates** — register, pause, resume, cancel

### DISTRIBUTOR
- **Dashboard** — quick status message
- **My Clients** — full book summary (AUM, returns, SIP count per client)
- **Schemes** — browse
- **Transactions** — full client book transaction history

### ADMIN
- **Dashboard**
- **Schemes** — browse + create new schemes
- **Investors** — all investors with KYC status
- **Distributors** — all distributors with verification status
- **Import NAV** — single import or bulk historical simulation
- **Transactions** — all transactions

## Design system

Token-based, defined in the `T` object at the top of `App.jsx`:
- Navy `#0F172A` — sidebar, headers
- Emerald `#10B981` — positive returns, success states
- Rose `#F43F5E` — negative returns, danger actions
- Gold `#F59E0B` — SIP highlights, distributor actions
- Tabular-nums on all financial figures so columns align
- Sharp corners on nav, rounded (12px) on content cards
