import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Flame, LayoutDashboard, BarChart3, FolderOpen, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NbButton } from "@/components/nb";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/categories", label: "Categories", icon: FolderOpen },
] as const;

export function AppNav() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const onSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-nb-ink bg-nb-cream/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center nb-border rounded-md bg-nb-yellow nb-shadow-sm">
            <Flame className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">HabitForge</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "inline-flex items-center gap-2 nb-border rounded-md px-3 py-2 text-xs font-bold uppercase",
                  active ? "bg-nb-yellow nb-shadow-sm" : "bg-white hover:nb-shadow-sm",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <NbButton tone="white" size="sm" onClick={onSignOut} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </NbButton>
      </div>

      {/* Mobile nav */}
      <div className="border-t-[3px] border-nb-ink px-4 py-2 md:hidden">
        <div className="flex gap-2 overflow-x-auto">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 nb-border rounded-md px-3 py-1.5 text-xs font-bold uppercase",
                  active ? "bg-nb-yellow nb-shadow-sm" : "bg-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
