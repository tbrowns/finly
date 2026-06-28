import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background text-foreground">
      <div className="hidden md:flex flex-col justify-between p-12 bg-shell-elevated border-r border-shell-border relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-50"
             style={{ backgroundImage: "radial-gradient(50% 60% at 20% 10%, hsl(199 89% 48% / 0.18), transparent 70%)" }} />
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary text-primary-foreground font-bold">H</span>
            <div className="leading-tight">
              <div className="font-semibold">Hesabu</div>
            <div className="text-[11px] text-shell-mutedForeground">Financial Controller</div>
          </div>
        </Link>
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight">Built for Kenyan SMEs.</h2>
          <p className="mt-3 text-shell-mutedForeground text-sm">
            We check your books for risks, then write a plain-language report. Connect Zoho Books and get an investor-ready monthly review.
          </p>
        </div>
        <div className="text-xs text-shell-mutedForeground">© {new Date().getFullYear()} Hesabu</div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-shell-mutedForeground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-shell-mutedForeground">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await AuthApi.login({ email, password });
      signIn(r.access_token, r.user);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  const onGoogle = async (id_token: string) => {
    setLoading(true);
    try {
      const r = await AuthApi.google(id_token);
      signIn(r.access_token, r.user);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout
      title="Sign in to Hesabu"
      subtitle="Enter your work email to continue."
      footer={<>Don't have an account? <Link to="/signup" className="text-primary hover:underline">Create one</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.co.ke" className="bg-card text-card-foreground" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-card text-card-foreground" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-shell-border" />
        <div className="text-xs text-shell-mutedForeground">or</div>
        <div className="h-px flex-1 bg-shell-border" />
      </div>
      <GoogleSignInButton onToken={onGoogle} disabled={loading} />
    </AuthLayout>
  );
}
