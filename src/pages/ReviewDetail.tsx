import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell, PageHeader, ShellSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReviewsApi, getToken, apiUrl, type ActionItem, type Review, type Severity } from "@/lib/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { AlertTriangle, ArrowLeft, Banknote, Clock, Download, ExternalLink, FileText, ListChecks, Receipt, ShieldAlert, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function ReviewDetail() {
  const { companyId = "", reviewId = "" } = useParams();
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const r = await ReviewsApi.get(companyId, reviewId);
        if (!cancel) setReview(r);
        // Poll while running
        if (r.status === "running" || r.status === "pending") {
          setTimeout(load, 3500);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load review");
      }
    };
    void load();
    return () => { cancel = true; };
  }, [companyId, reviewId]);

  const actions = useMemo<ActionItem[]>(() => {
    if (!review) return [];
    if (review.actions?.length) return review.actions;
    const items: ActionItem[] = [];
    const tag = (arr: ActionItem[] | undefined, source: string) =>
      (arr ?? []).map((i) => ({ ...i, source: i.source ?? source }));
    items.push(...tag(review.fraud_result?.items, "Fraud"));
    items.push(...tag(review.fraud_result?.round_withdrawals, "Round withdrawal"));
    items.push(...tag(review.fraud_result?.duplicate_payments, "Duplicate payment"));
    items.push(...tag(review.fraud_result?.vendor_concentration, "Vendor concentration"));
    items.push(...tag(review.mixing_result?.items, "M-Pesa mixing"));
    items.push(...tag(review.reconciliation_result?.items, "Reconciliation"));
    return items;
  }, [review]);

  if (error) {
    return <AppShell><ShellSection><div className="card-surface p-6 text-destructive">{error}</div></ShellSection></AppShell>;
  }
  if (!review) {
    return <AppShell><ShellSection><div className="text-shell-mutedForeground">Loading review…</div></ShellSection></AppShell>;
  }

  const period = review.period_start?.slice(0, 7) ?? "—";
  const downloadPdf = () => {
    const token = getToken();
    const url = apiUrl(`/api/v1/reviews/${companyId}/${reviewId}/pdf`);
    if (!token) { window.open(url, "_blank"); return; }
    // Trigger an authenticated download by fetching then opening a blob URL.
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`PDF download failed (${r.status})`);
        const blob = await r.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `hesabu-review-${period}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      })
      .catch((e) => toast.error(e.message));
  };

  const cf = review.cash_flow_result;
  const fraud = review.fraud_result;
  const mix = review.mixing_result;
  const rec = review.reconciliation_result;

  return (
    <AppShell>
      <ShellSection>
        <div className="mb-4">
          <Link to={`/companies/${companyId}/reviews`} className="inline-flex items-center text-xs text-shell-mutedForeground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to reviews
          </Link>
        </div>
        <PageHeader
          eyebrow={`Period ${period}`}
          icon={Sparkles}
          title="Monthly risk review"
          subtitle={`Status: ${review.status} · Generated ${formatDate(review.created_at)}`}
          actions={
            <>
              {review.sheet_url && (
                <a href={review.sheet_url} target="_blank" rel="noreferrer">
                  <Button variant="outline"><ExternalLink className="h-4 w-4 mr-1.5" /> Google Sheet</Button>
                </a>
              )}
              <Button onClick={downloadPdf}><Download className="h-4 w-4 mr-1.5" /> Download PDF</Button>
            </>
          }
        />

        {review.status === "failed" && review.error_message && (
          <div className="card-surface p-4 mb-6 border-severity-red/40">
            <div className="flex items-center gap-2 text-severity-red font-medium"><AlertTriangle className="h-4 w-4" /> Review failed</div>
            <div className="text-sm text-muted-foreground mt-1">{review.error_message}</div>
          </div>
        )}

        {/* Top risk cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <RiskCard
            icon={ShieldAlert}
            label="Cash-flow rating"
            value={<SeverityBadge severity={cf?.rating as Severity | undefined} />}
            footnote={cf?.notes ?? "Overall cash position"}
          />
          <RiskCard icon={Clock} label="Runway" value={<Big>{cf?.runway_days ?? "—"}<small className="text-base font-normal ml-1 text-muted-foreground">days</small></Big>} />
          <RiskCard icon={Banknote} label="Collections ratio" value={<Big>{formatPercent(cf?.collections_ratio)}</Big>} />
          <RiskCard icon={ListChecks} label="Flagged items" value={<Big>{fraud?.flagged_count ?? actions.length}</Big>} />
          <RiskCard icon={Receipt} label="Missing ETR" value={<Big>{rec?.missing_etr_count ?? "—"}</Big>} />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-shell-elevated border border-shell-border h-auto p-1 flex flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Indicators</TabsTrigger>
            <TabsTrigger value="mixing">Account Mixing</TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            <TabsTrigger value="actions">Action List</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5">
            <div className="grid lg:grid-cols-3 gap-4">
              <SummaryCard title="Cash flow" icon={Banknote}>
                <Row k="Rating" v={<SeverityBadge severity={cf?.rating as Severity | undefined} soft />} />
                <Row k="Net cash" v={formatCurrency(cf?.net_cash)} />
                <Row k="Inflow" v={formatCurrency(cf?.inflow)} />
                <Row k="Outflow" v={formatCurrency(cf?.outflow)} />
                <Row k="Runway" v={cf?.runway_days ? `${cf.runway_days} days` : "—"} />
              </SummaryCard>
              <SummaryCard title="Fraud indicators" icon={ShieldAlert}>
                <Row k="Flagged total" v={fraud?.flagged_count ?? "—"} />
                <Row k="Round withdrawals" v={fraud?.round_withdrawals?.length ?? "—"} />
                <Row k="Duplicate payments" v={fraud?.duplicate_payments?.length ?? "—"} />
                <Row k="Vendor concentration" v={fraud?.vendor_concentration?.length ?? "—"} />
              </SummaryCard>
              <SummaryCard title="Reconciliation" icon={Wallet}>
                <Row k="Missing ETR" v={rec?.missing_etr_count ?? "—"} />
                <Row k="Unreconciled petty cash" v={formatCurrency(rec?.unreconciled_petty_cash)} />
                <Row k="Stale suspense" v={formatCurrency(rec?.stale_suspense_total)} />
                <Row k="Mixed M-Pesa" v={mix?.mixed_payments_count ?? "—"} />
              </SummaryCard>
            </div>
          </TabsContent>

          <TabsContent value="cashflow" className="mt-5">
            <SectionCard title="Cash flow detail" icon={Banknote}>
              {cf ? (
                <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3 max-w-3xl">
                  <Row k="Rating" v={<SeverityBadge severity={cf.rating} />} />
                  <Row k="Runway" v={cf.runway_days ? `${cf.runway_days} days` : "—"} />
                  <Row k="Inflow" v={formatCurrency(cf.inflow)} />
                  <Row k="Outflow" v={formatCurrency(cf.outflow)} />
                  <Row k="Net cash" v={formatCurrency(cf.net_cash)} />
                  <Row k="Collections ratio" v={formatPercent(cf.collections_ratio)} />
                  {cf.notes && <div className="sm:col-span-2 mt-2 text-sm text-muted-foreground">{cf.notes}</div>}
                </div>
              ) : <Empty />}
            </SectionCard>
          </TabsContent>

          <TabsContent value="fraud" className="mt-5">
            <SectionCard title="Fraud indicators" icon={ShieldAlert}>
              <ActionsTable items={[
                ...(fraud?.items ?? []),
                ...(fraud?.round_withdrawals ?? []).map((i) => ({ ...i, source: i.source ?? "Round withdrawal" })),
                ...(fraud?.duplicate_payments ?? []).map((i) => ({ ...i, source: i.source ?? "Duplicate payment" })),
                ...(fraud?.vendor_concentration ?? []).map((i) => ({ ...i, source: i.source ?? "Vendor concentration" })),
              ]} />
            </SectionCard>
          </TabsContent>

          <TabsContent value="mixing" className="mt-5">
            <SectionCard title="Account mixing (M-Pesa)" icon={Wallet}>
              <ActionsTable items={mix?.items ?? []} />
            </SectionCard>
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-5">
            <SectionCard title="Reconciliation" icon={Receipt}>
              <div className="grid sm:grid-cols-3 gap-3 mb-5">
                <Mini label="Missing ETR" value={rec?.missing_etr_count ?? "—"} />
                <Mini label="Unreconciled petty cash" value={formatCurrency(rec?.unreconciled_petty_cash)} />
                <Mini label="Stale suspense total" value={formatCurrency(rec?.stale_suspense_total)} />
              </div>
              <ActionsTable items={rec?.items ?? []} />
            </SectionCard>
          </TabsContent>

          <TabsContent value="actions" className="mt-5">
            <SectionCard title="Action list" icon={ListChecks}>
              <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                Every flagged item, prioritized. Assign an owner and walk it to closure — this is the workflow your team should
                run through every month.
              </p>
              <ActionsTable items={actions} showOwner />
            </SectionCard>
          </TabsContent>

          <TabsContent value="report" className="mt-5">
            <SectionCard title="Report" icon={FileText}>
              {review.ai_report ? (
                <article className="prose prose-sm md:prose-base max-w-none whitespace-pre-wrap text-card-foreground">
                  {review.ai_report}
                </article>
              ) : <Empty label="The report is being prepared. Check back shortly." />}
            </SectionCard>
          </TabsContent>
        </Tabs>
      </ShellSection>
    </AppShell>
  );
}

function Big({ children }: { children: React.ReactNode }) {
  return <div className="text-2xl font-semibold tracking-tight text-card-foreground">{children}</div>;
}

function RiskCard({ icon: Icon, label, value, footnote }: { icon: typeof Banknote; label: string; value: React.ReactNode; footnote?: string }) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-2">{value}</div>
      {footnote && <div className="mt-1 text-xs text-muted-foreground line-clamp-1">{footnote}</div>}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Banknote; children: React.ReactNode }) {
  return (
    <div className="card-surface p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ title, icon: Icon, children }: { title: string; icon: typeof Banknote; children: React.ReactNode }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 last:border-0 pb-2 last:pb-0">
      <div className="text-muted-foreground">{k}</div>
      <div className="font-medium text-card-foreground">{v}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold text-card-foreground">{value}</div>
    </div>
  );
}

function Empty({ label = "No data." }: { label?: string }) {
  return <div className="text-sm text-muted-foreground">{label}</div>;
}

function ActionsTable({ items, showOwner }: { items: ActionItem[]; showOwner?: boolean }) {
  if (!items.length) return <Empty label="Nothing flagged. 🎉" />;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Evidence</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {showOwner && <TableHead>Owner</TableHead>}
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((i, idx) => (
            <TableRow key={i.id ?? idx}>
              <TableCell className="font-medium whitespace-nowrap">{i.source ?? "—"}</TableCell>
              <TableCell><SeverityBadge severity={i.severity} soft /></TableCell>
              <TableCell className="max-w-md text-sm text-muted-foreground">{i.evidence ?? i.description ?? "—"}</TableCell>
              <TableCell className="text-right font-mono text-sm">{i.amount !== undefined ? formatCurrency(i.amount, i.currency ?? "KES") : "—"}</TableCell>
              {showOwner && <TableCell className="text-sm">{i.owner ?? "Unassigned"}</TableCell>}
              <TableCell className="text-sm capitalize">{i.status ?? "open"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
