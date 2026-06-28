import { Link, NavLink, useNavigate } from "react-router-dom";
import { Activity, Building2, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/companies/new", label: "New company", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold">H</span>
            <div className="leading-tight">
              <div className="font-semibold text-sidebar-primary-foreground">Hesabu</div>
              <div className="text-[11px] text-sidebar-foreground/70">Financial Controller</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="grid place-items-center h-8 w-8 rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
              {(user?.full_name ?? user?.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm truncate text-sidebar-accent-foreground">{user?.full_name ?? "Account"}</div>
              <div className="text-xs truncate text-sidebar-foreground/70">{user?.email}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => { signOut(); navigate("/login"); }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-shell-border bg-shell-elevated">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid place-items-center h-7 w-7 rounded-md bg-primary text-primary-foreground text-xs font-bold">H</span>
            <span className="font-semibold">Hesabu</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/login"); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, eyebrow, actions, icon: Icon }: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  icon?: typeof Activity;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
      <div className="min-w-0">
        {eyebrow && <div className="text-xs uppercase tracking-wider text-shell-mutedForeground mb-1.5 flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5" />}{eyebrow}
        </div>}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-shell-mutedForeground mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function ShellSection({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("px-6 md:px-10 py-8", className)}>{children}</section>;
}

export { ShieldCheck };
