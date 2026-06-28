// Thin typed client for the Hesabu FastAPI backend.
// Base URL comes from VITE_API_URL — e.g. http://localhost:8000

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "b1.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean; raw?: boolean };

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { body, auth = true, raw = false, headers, ...rest } = opts;
  const h = new Headers(headers);
  if (!h.has("Content-Type") && body !== undefined) h.set("Content-Type", "application/json");
  if (auth) {
    const t = getToken();
    if (t) h.set("Authorization", `Bearer ${t}`);
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (raw) return res as unknown as T;
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const msg = (data as { detail?: string; message?: string } | null)?.detail
      ?? (data as { message?: string } | null)?.message
      ?? res.statusText;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

function safeJson(s: string) { try { return JSON.parse(s); } catch { return s; } }

export function apiUrl(path: string) {
  return `${BASE_URL}${path}`;
}

// ---------- Types ----------
export type User = {
  id: string;
  email: string;
  full_name?: string | null;
};

export type AuthResponse = { access_token: string; token_type: string; user: User };

export type Company = {
  id: string;
  name: string;
  country: string;
  currency: string;
  zoho_organization_id?: string | null;
  founder_email?: string | null;
  accountant_email?: string | null;
  whatsapp_number?: string | null;
  google_sheet_id?: string | null;
  zoho_connected?: boolean;
  created_at?: string;
};

export type Severity = "GREEN" | "AMBER" | "RED";

export type ActionItem = {
  id?: string;
  source?: string;
  severity?: Severity | string;
  evidence?: string;
  description?: string;
  amount?: number;
  currency?: string;
  owner?: string;
  status?: string;
};

export type CashFlowResult = {
  rating?: Severity;
  runway_days?: number;
  collections_ratio?: number;
  net_cash?: number;
  inflow?: number;
  outflow?: number;
  notes?: string;
};

export type FraudResult = {
  flagged_count?: number;
  items?: ActionItem[];
  round_withdrawals?: ActionItem[];
  duplicate_payments?: ActionItem[];
  vendor_concentration?: ActionItem[];
};

export type MixingResult = {
  mixed_payments_count?: number;
  items?: ActionItem[];
};

export type ReconciliationResult = {
  missing_etr_count?: number;
  unreconciled_petty_cash?: number;
  stale_suspense_total?: number;
  items?: ActionItem[];
};

export type Review = {
  id: string;
  company_id: string;
  period_start: string;
  period_end: string;
  status: "pending" | "running" | "complete" | "failed" | string;
  cash_flow_result?: CashFlowResult | null;
  fraud_result?: FraudResult | null;
  mixing_result?: MixingResult | null;
  reconciliation_result?: ReconciliationResult | null;
  ai_report?: string | null;
  pdf_path?: string | null;
  sheet_url?: string | null;
  error_message?: string | null;
  created_at: string;
  actions?: ActionItem[];
};

// ---------- Endpoints ----------
export const AuthApi = {
  signup: (body: { full_name: string; email: string; password: string }) =>
    api<AuthResponse>("/api/v1/auth/signup", { method: "POST", body, auth: false }),
  login: (body: { email: string; password: string }) =>
    api<AuthResponse>("/api/v1/auth/login", { method: "POST", body, auth: false }),
  google: (id_token: string) =>
    api<AuthResponse>("/api/v1/auth/google", { method: "POST", body: { id_token }, auth: false }),
  me: () => api<User>("/api/v1/auth/me"),
};

export const CompaniesApi = {
  create: (body: Partial<Company> & { name: string; country: string; currency: string }) =>
    api<Company>("/api/v1/companies", { method: "POST", body }),
  list: () => api<Company[]>("/api/v1/companies"),
  get: (id: string) => api<Company>(`/api/v1/companies/${id}`),
  update: (id: string, body: Partial<Company>) =>
    api<Company>(`/api/v1/companies/${id}`, { method: "PATCH", body }),
};

export const ZohoApi = {
  authorizeUrl: (companyId: string) =>
    api<{ authorize_url: string }>(`/api/v1/zoho/${companyId}/authorize-url`),
  sync: (companyId: string, period: string) =>
    api<{ ok: boolean }>(`/api/v1/zoho/${companyId}/sync`, { method: "POST", body: { period } }),
};

export const ReviewsApi = {
  run: (companyId: string, body: { period: string; notify?: boolean; push_to_sheets?: boolean }) =>
    api<Review>(`/api/v1/reviews/${companyId}/run`, { method: "POST", body }),
  list: (companyId: string) => api<Review[]>(`/api/v1/reviews/${companyId}`),
  get: (companyId: string, reviewId: string) =>
    api<Review>(`/api/v1/reviews/${companyId}/${reviewId}`),
  pdfUrl: (companyId: string, reviewId: string) =>
    apiUrl(`/api/v1/reviews/${companyId}/${reviewId}/pdf`),
  monthly: (companyId: string, period: string) =>
    api<Review>(`/api/v1/jobs/monthly/${companyId}?period=${encodeURIComponent(period)}`, { method: "POST" }),
};
