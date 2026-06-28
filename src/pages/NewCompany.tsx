import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, ShellSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompaniesApi } from "@/lib/api";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export default function NewCompany() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    country: "KE",
    currency: "KES",
    zoho_organization_id: "",
    founder_email: "",
    accountant_email: "",
    whatsapp_number: "",
    google_sheet_id: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== "")) as typeof form;
      const c = await CompaniesApi.create(payload);
      toast.success("Company created");
      nav(`/companies/${c.id}/zoho`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create company");
    } finally { setLoading(false); }
  };

  return (
    <AppShell>
      <ShellSection>
        <PageHeader
          eyebrow="New workspace"
          icon={Building2}
          title="Create a company"
          subtitle="One workspace per legal entity. Add your Zoho organization ID now or connect later."
        />
        <form onSubmit={submit} className="card-surface p-6 md:p-8 max-w-2xl space-y-5">
          <Field label="Company name" required><Input required value={form.name} onChange={set("name")} placeholder="Acme Limited" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Country"><Input value={form.country} onChange={set("country")} placeholder="KE" /></Field>
            <Field label="Currency"><Input value={form.currency} onChange={set("currency")} placeholder="KES" /></Field>
          </div>
          <Field label="Zoho organization ID" hint="Optional — fill in after connecting Zoho Books.">
            <Input value={form.zoho_organization_id} onChange={set("zoho_organization_id")} placeholder="e.g. 60012345678" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Founder email"><Input type="email" value={form.founder_email} onChange={set("founder_email")} /></Field>
            <Field label="Accountant email"><Input type="email" value={form.accountant_email} onChange={set("accountant_email")} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="WhatsApp number" hint="Include country code, e.g. +254…"><Input value={form.whatsapp_number} onChange={set("whatsapp_number")} placeholder="+2547…" /></Field>
            <Field label="Google Sheet ID"><Input value={form.google_sheet_id} onChange={set("google_sheet_id")} placeholder="1AbCDef…" /></Field>
          </div>
          <div className="pt-2 flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create company"}</Button>
            <Button type="button" variant="outline" onClick={() => nav("/dashboard")}>Cancel</Button>
          </div>
        </form>
      </ShellSection>
    </AppShell>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
