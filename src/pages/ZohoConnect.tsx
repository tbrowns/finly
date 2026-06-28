import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AppShell, PageHeader, ShellSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Plug } from "lucide-react";
import { CompaniesApi, ZohoApi, type Company } from "@/lib/api";
import { toast } from "sonner";

export default function ZohoConnect() {
  const { companyId = "" } = useParams();
  const [params] = useSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    CompaniesApi.get(companyId).then(setCompany).catch((e) => toast.error(e.message));
    if (params.get("status") === "success") toast.success("Zoho Books connected");
    if (params.get("status") === "error") toast.error("Zoho connection failed");
  }, [companyId, params]);

  const connect = async () => {
    setConnecting(true);
    try {
      const r = await ZohoApi.authorizeUrl(companyId);
      window.location.href = r.authorize_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not get authorize URL");
      setConnecting(false);
    }
  };

  const connected = !!company?.zoho_connected || !!company?.zoho_organization_id;

  return (
    <AppShell>
      <ShellSection>
        <PageHeader
          eyebrow={company?.name ?? "Company"}
          icon={Plug}
          title="Zoho Books connection"
          subtitle="We read your monthly transactions, contacts, and bank feeds from Zoho."
        />

        <div className="card-surface p-8 max-w-2xl">
          {connected ? (
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-severity-green-soft text-severity-green-softForeground text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Connected
              </div>
              <h3 className="mt-4 text-xl font-semibold">Zoho Books is linked</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {company?.zoho_organization_id && <>Organization ID <code className="font-mono">{company.zoho_organization_id}</code>. </>}
                You can now run monthly reviews. We will pull your data automatically when a review starts.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" onClick={connect} disabled={connecting}>
                  Reconnect <ExternalLink className="h-4 w-4 ml-1.5" />
                </Button>
                <a href={`/companies/${companyId}/reviews`}><Button>Run a review</Button></a>
              </div>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-severity-amber-soft text-severity-amber-softForeground text-xs font-semibold">
                Not connected
              </div>
              <h3 className="mt-4 text-xl font-semibold">Connect Zoho Books</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You'll sign in on Zoho's website to give us access. We never see or store your Zoho password.
              </p>
              <Button className="mt-6" onClick={connect} disabled={connecting}>
                {connecting ? "Redirecting…" : <>Connect Zoho Books <ExternalLink className="h-4 w-4 ml-1.5" /></>}
              </Button>
            </div>
          )}
        </div>
      </ShellSection>
    </AppShell>
  );
}
