import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell, PageHeader, ShellSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { CompaniesApi, ReviewsApi, type Company, type Review } from "@/lib/api";
import { ArrowUpRight, Building2, Plus, FileText, Activity } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

type Row = { company: Company; latest?: Review };

export default function Dashboard() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const companies = await CompaniesApi.list();
        const enriched = await Promise.all(companies.map(async (c) => {
          try {
            const reviews = await ReviewsApi.list(c.id);
            const latest = reviews.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];
            return { company: c, latest };
          } catch {
            return { company: c };
          }
        }));
        setRows(enriched);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not load dashboard");
        setRows([]);
      }
    })();
  }, []);

  return (
    <AppShell>
      <ShellSection>
        <PageHeader
          eyebrow="Workspace"
          icon={Activity}
          title="Your companies"
          subtitle="Latest monthly review and key risk signals across every Zoho Books workspace you control."
          actions={
            <Link to="/companies/new"><Button><Plus className="h-4 w-4 mr-1.5" /> New company</Button></Link>
          }
        />

        {rows === null && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-surface p-6 h-44 animate-pulse">
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="mt-3 h-3 w-1/3 bg-muted rounded" />
                <div className="mt-8 h-6 w-24 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        )}

        {rows && rows.length === 0 && (
          <div className="card-surface p-10 text-center">
            <Building2 className="h-8 w-8 text-primary mx-auto mb-3" />
            <div className="font-semibold text-lg">No companies yet</div>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
              Create a company workspace to connect Zoho Books and run your first monthly review.
            </p>
            <Link to="/companies/new" className="inline-block mt-5"><Button>Create company</Button></Link>
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map(({ company, latest }) => (
              <Link
                key={company.id}
                to={`/companies/${company.id}/reviews`}
                className="card-surface p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{company.country} · {company.currency}</div>
                    <div className="mt-1 font-semibold truncate">{company.name}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <div className="mt-5 flex items-center gap-2">
                  {latest?.cash_flow_result?.rating ? (
                    <SeverityBadge severity={latest.cash_flow_result.rating} />
                  ) : (
                    <span className="text-xs text-muted-foreground">No review yet</span>
                  )}
                  {latest && (
                    <span className="text-xs text-muted-foreground">· {formatDate(latest.created_at)}</span>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <Stat label="Runway" value={latest?.cash_flow_result?.runway_days ? `${latest.cash_flow_result.runway_days}d` : "—"} />
                  <Stat label="Flagged" value={String(latest?.fraud_result?.flagged_count ?? "—")} />
                  <Stat label="Missing ETR" value={String(latest?.reconciliation_result?.missing_etr_count ?? "—")} />
                </div>
                {latest?.pdf_path && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-primary">
                    <FileText className="h-3.5 w-3.5" /> PDF available
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </ShellSection>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold text-card-foreground">{value}</div>
    </div>
  );
}
