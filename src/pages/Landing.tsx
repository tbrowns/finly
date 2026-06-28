import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Activity, AlertTriangle, FileText, MessageSquare, Sheet, Banknote, Receipt, Wallet, ListChecks, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-shell-border/60">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2.5">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary text-primary-foreground font-bold">H</span>
            <div className="leading-tight">
              <div className="font-semibold">Hesabu</div>
              <div className="text-[11px] text-shell-mutedForeground">Financial Controller</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-shell-mutedForeground">
            <a href="#problem" className="hover:text-foreground">Problem</a>
            <a href="#solution" className="hover:text-foreground">Solution</a>
            <a href="#edge" className="hover:text-foreground">Kenyan edge</a>
            <a href="#channels" className="hover:text-foreground">Channels</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/signup"><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60"
             style={{ backgroundImage: "radial-gradient(60% 50% at 50% 0%, hsl(199 89% 48% / 0.18) 0%, transparent 70%)" }} />
        <div className="container py-20 md:py-28 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-shell-border bg-shell-elevated px-3 py-1 text-xs text-shell-mutedForeground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Built for Kenyan SMEs · Works with Zoho Books
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Catch financial problems <span className="text-primary">before</span> they become business crises.
          </h1>
          <p className="mt-6 text-lg text-shell-mutedForeground max-w-2xl mx-auto">
            Connects to your Zoho Books, checks for risks that hurt Kenyan SMEs, and writes a plain-language risk
            report your founders and investors can act on the same day.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup"><Button size="lg" className="px-6">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <a href="#solution"><Button size="lg" variant="outline" className="px-6 border-shell-border bg-shell-elevated hover:bg-shell-elevated/80">See how it works</Button></a>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left max-w-3xl mx-auto">
            {[
              ["GREEN / AMBER / RED", "Cash-flow rating"],
              ["Structured", "Accounting checks first"],
              ["Auditable", "Evidence-backed reports"],
              ["WhatsApp + PDF", "Where founders read"],
            ].map(([k, v]) => (
              <div key={k} className="shell-panel px-4 py-3">
                <div className="text-sm font-semibold">{k}</div>
                <div className="text-xs text-shell-mutedForeground mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="container py-20 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary mb-3">The problem</div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">By the time it shows up in a monthly report, the damage is already done.</h2>
            <p className="mt-5 text-shell-mutedForeground">
              Founders and investors discover financial problems too late. The petty cash isn't reconciled. M-Pesa is mixed with
              personal payments. The ETR receipts are missing. By month-end close, money has already left.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: AlertTriangle, t: "Late discovery", d: "Issues surface weeks after they occur." },
              { icon: Banknote, t: "Cash drift", d: "M-Pesa and bank rarely reconcile cleanly." },
              { icon: Receipt, t: "Missing ETR", d: "KRA-compliant receipts go unrecorded." },
              { icon: Wallet, t: "Petty cash gaps", d: "Suspense balances pile up unchecked." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="shell-panel p-5">
                <Icon className="h-5 w-5 text-severity-amber mb-3" />
                <div className="font-medium">{t}</div>
                <div className="text-sm text-shell-mutedForeground mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="border-y border-shell-border/60 bg-shell-elevated/40">
        <div className="container py-20 md:py-24">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-wider text-primary mb-3">The solution</div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">A controller that thinks like a Kenyan accountant.</h2>
            <p className="mt-5 text-shell-mutedForeground">
              We pull your monthly data from Zoho Books, run structured accounting checks, then write the final report
              from real evidence — not from guesses.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Connect Zoho Books", d: "We pull monthly transactions, contacts, and bank feeds." },
              { n: "02", t: "Run structured checks", d: "Cash flow, mixed M-Pesa, round-number withdrawals, missing ETR, petty cash, duplicates, vendor concentration, stale suspense." },
              { n: "03", t: "Generate the risk report", d: "Receive report in plain language." },
            ].map((s) => (
              <div key={s.n} className="card-surface p-6">
                <div className="text-xs font-mono text-primary">{s.n}</div>
                <div className="mt-2 font-semibold">{s.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kenya edge */}
      <section id="edge" className="container py-20 md:py-24">
        <div className="text-xs uppercase tracking-wider text-primary mb-3">The Kenyan edge</div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-3xl">Generic finance tools guess. We check.</h2>
        <p className="mt-4 text-shell-mutedForeground max-w-2xl">
          Every check is built against patterns we see in Kenyan SMEs. We write the narrative from real evidence.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "Mixed M-Pesa personal", d: "Detects founder/owner phone numbers paying business invoices." },
            { t: "Round-number withdrawals", d: "Flags 10k/20k/50k cash-out patterns common in skimming." },
            { t: "Missing ETR receipts", d: "Cross-checks expenses against KRA ETR compliance." },
            { t: "Unreconciled petty cash", d: "Catches recurring suspense balances that never clear." },
            { t: "Duplicate payments", d: "Same vendor, same amount, same week." },
            { t: "Vendor concentration", d: "Single supplier becoming a dependency risk." },
            { t: "Stale suspense accounts", d: "Anything sitting in suspense over 30 days." },
            { t: "Cash runway", d: "Days of cash, collections ratio, inflow vs outflow." },
          ].map((x) => (
            <div key={x.t} className="shell-panel p-5">
              <ShieldCheck className="h-5 w-5 text-severity-green mb-3" />
              <div className="font-medium">{x.t}</div>
              <div className="text-sm text-shell-mutedForeground mt-1">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Channels */}
      <section id="channels" className="border-t border-shell-border/60 bg-shell-elevated/40">
        <div className="container py-20 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-primary mb-3">Output channels</div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Reports where founders actually read them.</h2>
              <p className="mt-4 text-shell-mutedForeground">
                Every monthly review fans out to the channels your team already uses — no new dashboard to remember to log in to.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: FileText, t: "PDF report", d: "Investor-ready monthly review." },
                { icon: MessageSquare, t: "WhatsApp", d: "Headline + action list to the founder." },
                { icon: Sheet, t: "Google Sheets", d: "Action list pushed to a shared sheet." },
                { icon: ListChecks, t: "In-app workflow", d: "Owners, status, and severity tracking." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="shell-panel p-5">
                  <Icon className="h-5 w-5 text-primary mb-3" />
                  <div className="font-medium">{t}</div>
                  <div className="text-sm text-shell-mutedForeground mt-1">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 md:py-28">
        <div className="card-surface p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-50"
               style={{ backgroundImage: "radial-gradient(50% 60% at 50% 0%, hsl(199 89% 48% / 0.15), transparent 70%)" }} />
          <Activity className="h-7 w-7 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Run your first monthly review in minutes.</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Connect Zoho Books, pick a period, and we'll hand you a risk-rated report and an action list ready for your team.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link to="/signup"><Button size="lg" className="px-6">Create account <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="px-6">Sign in</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-shell-border/60">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-shell-mutedForeground">
          <div>© {new Date().getFullYear()} Hesabu Financial Controller</div>
          <div className="flex gap-5">
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
            <Link to="/signup" className="hover:text-foreground">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
