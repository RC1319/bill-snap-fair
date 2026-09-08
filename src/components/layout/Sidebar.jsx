import { Link, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Activity,
  Settings,
  HelpCircle,
  Scissors,
  ChevronLeft,
} from "lucide-react";
import { cx } from "@/lib/format";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/bills", icon: Receipt, label: "Bills" },
  { to: "/people", icon: Users, label: "People" },
  { to: "/activity", icon: Activity, label: "Activity" },
];

const BOTTOM_ITEMS = [
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/help", icon: HelpCircle, label: "Help" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const router = useRouter();
  const pathname = router.state.location.pathname;

  return (
    <aside
      className={cx(
        "hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Scissors className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden rise">
            <h1 className="text-base font-bold tracking-tight text-foreground leading-tight">
              SplitSnap
            </h1>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Snap. Assign. Split.
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cx(
              "w-4 h-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon
                className={cx(
                  "w-5 h-5 shrink-0 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span className="rise">{item.label}</span>}
              {active && (
                <div className="absolute left-0 w-[3px] h-6 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="py-3 px-3 space-y-1 border-t border-border">
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
    </aside>
  );
}
