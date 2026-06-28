import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell, PageHeader, ShellSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompaniesApi, ReviewsApi, type Company, type Review } from "@/lib/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CalendarRange, ChevronRight, PlayCircle } from "lucide-react";
import { currentPeriod, formatDate, previousPeriod } from "@/lib/format";
import { toast } from "sonner";

export default function Reviews() {
  const { companyId = "" } = useParams();
  const nav = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [period, setPeriod] = useState<string>(previousPeriod());
  const [running, setRunning] = useState(false);

  useEffect(() => {
    CompaniesApi.get(companyId).then(setCompany);
    ReviewsApi.list(companyId).then((r) => setReviews(r.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)))).catch(() => setReviews([]));
  }, [companyId]);

  const run = async () => {
    setRunning(true);
    try {
      const review = await ReviewsApi.run(companyId, { period, notify: true, push_to_sheets: true });
      toast.success("Review started");
      nav(`/companies/${companyId}/reviews/${review.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start review");
    } finally { setRunning(false); }
  };

  return (
    <AppShell>
      <ShellSection>
        <PageHeader
          eyebrow={company?.name ?? "Company"}
          icon={CalendarRange}
          title="Monthly reviews"
          subtitle="Pick the accounting period to review. We pull your monthly data, run structured checks, and write the report."
          actions={
            <>
              <Link to={`/companies/${companyId}/zoho`}><Button variant="outline">Zoho</Button></Link>
              <Link to={`/companies/${companyId}/settings`}><Button variant="outline">Settings</Button></Link>
            </>
          }
        />

        <div className="card-surface p-6 max-w-2xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="period">Accounting period</Label>
              <Input id="period" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
              <div className="text-xs text-muted-foreground">Format YYYY-MM. Default: previous month ({previousPeriod()}). Current: {currentPeriod()}.</div>
            </div>
            <Button onClick={run} disabled={running || !period}>
              <PlayCircle className="h-4 w-4 mr-1.5" />
              {running ? "Starting…" : "Run monthly review"}
            </Button>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-shell-mutedForeground uppercase tracking-wider mb-3">History</h2>
        {reviews === null && <div className="text-sm text-shell-mutedForeground">Loading…</div>}
        {reviews && reviews.length === 0 && (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">No reviews yet. Run your first one above.</div>
        )}
        {reviews && reviews.length > 0 && (
          <div className="card-surface divide-y divide-border overflow-hidden">
            {reviews.map((r) => (
              <Link
                key={r.id}
                to={`/companies/${companyId}/reviews/${r.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{r.period_start?.slice(0, 7) ?? "—"}</div>
                    <StatusBadge status={r.status} />
                    {r.cash_flow_result?.rating && <SeverityBadge severity={r.cash_flow_result.rating} soft />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Run {formatDate(r.created_at)}
                    {r.fraud_result?.flagged_count !== undefined && <> · {r.fraud_result.flagged_count} flagged</>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </ShellSection>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    complete: "bg-severity-green-soft text-severity-green-softForeground",
    running: "bg-severity-amber-soft text-severity-amber-softForeground",
    pending: "bg-muted text-muted-foreground",
    failed: "bg-severity-red-soft text-severity-red-softForeground",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wide ${map[status] ?? "bg-muted text-muted-foreground"}`}>{status}</span>;
}
