import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  MessageSquareWarning,
  Users,
  TerminalSquare,
  Bot,
  Settings,
  Shield,
  Github,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/messages", label: "Message Queue", icon: MessageSquareWarning },
  { to: "/users", label: "Users", icon: Users },
  { to: "/api-tester", label: "API Tester", icon: TerminalSquare },
  { to: "/discord-bot", label: "Discord Bot", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { pathname } = useLocation();
  const pending = useStore((s) => s.messages.filter((m) => !m.reviewed).length);
  const highRisk = useStore(
    (s) => s.messages.filter((m) => m.warning === "high" && !m.reviewed).length,
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/70 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-shield grid place-items-center shadow-elegant">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-lg tracking-tight leading-none">
              DiscourseGuard
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              ML Moderation
            </div>
          </div>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{label}</span>
                {to === "/messages" && pending > 0 && (
                  <Badge
                    variant={active ? "secondary" : "default"}
                    className="h-5 px-1.5 text-[10px]"
                  >
                    {pending}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="glass-panel rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Model Live
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              Logistic Regression + SMOTE · Macro F1{" "}
              <span className="font-semibold text-foreground">0.74</span> · Acc{" "}
              <span className="font-semibold text-foreground">88%</span>
            </div>
            {highRisk > 0 && (
              <div className="text-[11px] text-destructive font-medium">
                {highRisk} high-risk pending review
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-shield grid place-items-center">
                <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold">DiscourseGuard</span>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
          <nav className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
