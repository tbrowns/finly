export function formatCurrency(value?: number | null, currency = "KES") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}

export function formatNumber(v?: number | null) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return new Intl.NumberFormat("en-KE").format(v);
}

export function formatPercent(v?: number | null) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const num = v > 1 ? v : v * 100;
  return `${num.toFixed(0)}%`;
}

export function formatDate(s?: string | null) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return s; }
}

export function currentPeriod(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function previousPeriod(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
