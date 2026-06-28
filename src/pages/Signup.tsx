import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { AuthLayout } from "./Login";

export default function Signup() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await AuthApi.signup({ full_name: fullName, email, password });
      signIn(r.access_token, r.user);
      toast.success("Account created");
      navigate("/companies/new");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
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
      title="Create your Hesabu account"
      subtitle="Free to start. Connect Zoho Books in the next step."
      footer={<>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-card text-card-foreground" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-card text-card-foreground" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-card text-card-foreground" />
          <div className="text-xs text-shell-mutedForeground">Minimum 8 characters.</div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
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
