import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell, PageHeader, ShellSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompaniesApi, type Company } from "@/lib/api";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

export default function CompanySettings() {
  const { companyId = "" } = useParams();
  const nav = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    CompaniesApi.get(companyId).then(setCompany).catch((e) => toast.error(e.message));
  }, [companyId]);

  if (!company) return <AppShell><ShellSection><div className="text-shell-mutedForeground">Loading…</div></ShellSection></AppShell>;

  const update = (k: keyof Company) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCompany({ ...company, [k]: e.target.value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await CompaniesApi.update(companyId, {
        name: company.name,
        country: company.country,
        currency: company.currency,
        zoho_organization_id: company.zoho_organization_id ?? null,
        founder_email: company.founder_email ?? null,
        accountant_email: company.accountant_email ?? null,
        whatsapp_number: company.whatsapp_number ?? null,
        google_sheet_id: company.google_sheet_id ?? null,
      });
      setCompany(updated);
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally { setSaving(false); }
  };

  return (
    <AppShell>
      <ShellSection>
        <PageHeader
          eyebrow={company.name}
          icon={SettingsIcon}
          title="Company settings"
          subtitle="Notification channels and Zoho organization. These power WhatsApp alerts and the Google Sheets export."
          actions={<Button variant="outline" onClick={() => nav(`/companies/${companyId}/reviews`)}>Reviews</Button>}
        />
        <form onSubmit={save} className="card-surface p-6 md:p-8 max-w-2xl space-y-5">
          <Field label="Company name"><Input value={company.name} onChange={update("name")} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Country"><Input value={company.country} onChange={update("country")} /></Field>
            <Field label="Currency"><Input value={company.currency} onChange={update("currency")} /></Field>
          </div>
          <Field label="Zoho organization ID"><Input value={company.zoho_organization_id ?? ""} onChange={update("zoho_organization_id")} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Founder email"><Input type="email" value={company.founder_email ?? ""} onChange={update("founder_email")} /></Field>
            <Field label="Accountant email"><Input type="email" value={company.accountant_email ?? ""} onChange={update("accountant_email")} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="WhatsApp number"><Input value={company.whatsapp_number ?? ""} onChange={update("whatsapp_number")} placeholder="+2547…" /></Field>
            <Field label="Google Sheet ID"><Input value={company.google_sheet_id ?? ""} onChange={update("google_sheet_id")} /></Field>
          </div>
          <div className="pt-2 flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            <Button type="button" variant="outline" onClick={() => nav(`/companies/${companyId}/zoho`)}>Zoho connection</Button>
          </div>
        </form>
      </ShellSection>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5"><Label>{label}</Label>{children}</div>
  );
}
