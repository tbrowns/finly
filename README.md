# Hesabu — Financial Controller (Frontend)

> Catch financial problems **before** they become business crises.

Hesabu is a financial controller built for Kenyan SMEs. Founders and investors often discover financial problems too late — by the time something shows up in a monthly report, the damage is already done. Hesabu connects to your Zoho Books, runs structured accounting checks tuned for Kenyan businesses, and writes a plain-language risk report from real evidence.

This repository contains **only the frontend** (React + Vite + TypeScript + Tailwind + shadcn). All business logic, integrations, and persistence live in the FastAPI backend.

## The edge

Most finance tools guess at what's suspicious. We don't. We run structured checks tuned for Kenyan SMEs:

- Mixed M-Pesa / personal payments
- Round-number cash withdrawals (10k / 20k / 50k)
- Missing ETR (KRA) receipts
- Unreconciled petty cash
- Duplicate payments
- Vendor concentration
- Stale suspense accounts
- Cash runway and collections ratio

We write the narrative report from that structured evidence. The output is more accurate and **auditable** — every claim points back to a real check.

## API setup

The frontend talks to a FastAPI backend over JSON. Configure the base URL with an env var:

```bash
# .env.local
VITE_API_URL=http://localhost:8000

# Optional — enables real Google Identity Services on the login/signup pages.
# The frontend obtains a Google ID token, and FastAPI verifies it server-side.
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

Every authenticated request sends `Authorization: Bearer <token>` automatically:

```ts
// src/lib/api.ts (excerpt)
const res = await fetch(`${BASE_URL}${path}`, {
  headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
  body: body !== undefined ? JSON.stringify(body) : undefined,
});
```

Endpoint groups used by the UI:

| Group   | Endpoints |
|---------|-----------|
| Auth    | `POST /api/v1/auth/{signup,login,google}`, `GET /api/v1/auth/me` |
| Companies | `POST/GET /api/v1/companies`, `GET/PATCH /api/v1/companies/{id}` |
| Zoho    | `GET /api/v1/zoho/{company_id}/authorize-url`, `POST /api/v1/zoho/{company_id}/sync` |
| Reviews | `POST /api/v1/reviews/{company_id}/run`, `GET /api/v1/reviews/{company_id}`, `GET /api/v1/reviews/{company_id}/{review_id}`, `GET …/pdf` |
| Jobs    | `POST /api/v1/jobs/monthly/{company_id}?period=YYYY-MM` |

OAuth callbacks for Zoho are handled **entirely server-side**. The frontend redirects to the URL returned by `authorize-url`, then surfaces the connection state when the user lands back on `/companies/:id/zoho`.

## Running locally

```bash
bun install
bun dev
```

Then point your browser at the printed URL.

## Demo flow

1. **Landing (`/`)** — explains the problem, the solution, and the Kenyan edge.
2. **Sign up (`/signup`)** — email + password, or Google.
3. **Create company (`/companies/new`)** — name, currency, optional Zoho org ID, founder/accountant email, WhatsApp, Google Sheet.
4. **Connect Zoho (`/companies/:id/zoho`)** — one click, redirects to Zoho OAuth.
5. **Run review (`/companies/:id/reviews`)** — pick a month, hit *Run monthly review*.
6. **Review detail (`/companies/:id/reviews/:reviewId`)** — risk cards, tabs (Overview, Cash Flow, Fraud, Mixing, Reconciliation, Action List, AI Report), PDF download, Google Sheets link.

## Screenshots

> Drop final screenshots into `docs/screenshots/` and reference them here.

- `docs/screenshots/landing.png` — Landing page
- `docs/screenshots/dashboard.png` — Workspace overview
- `docs/screenshots/review.png` — Monthly review detail with risk cards + action list

## Design direction

Serious fintech SaaS dashboard: dark navy / slate shell, clean white cards, restrained charts. GREEN / AMBER / RED severity badges throughout. The action list is built as a workflow table (source, severity, evidence, amount, owner, status) so a founder or accountant can walk it to closure each month — not just read a static report.

## Project structure

```
src/
  lib/
    api.ts          # Typed fetch client + endpoint helpers
    auth.tsx        # AuthProvider, useAuth, token storage
    format.ts       # Currency / date / period helpers
  components/
    AppShell.tsx    # Dark sidebar + page header
    RequireAuth.tsx # Route guard
    SeverityBadge.tsx
    GoogleSignInButton.tsx
  pages/
    Landing.tsx
    Login.tsx / Signup.tsx
    Dashboard.tsx
    NewCompany.tsx
    CompanySettings.tsx
    ZohoConnect.tsx
    Reviews.tsx
    ReviewDetail.tsx
```

No backend, database, or auth is implemented in this repo by design — it all lives in the FastAPI service behind `VITE_API_URL`.
