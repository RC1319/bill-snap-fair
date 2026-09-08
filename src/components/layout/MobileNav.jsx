import { Link, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, Users, Activity, Plus } from "lucide-react";
import { cx } from "@/lib/format";

const TABS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/bills", icon: Receipt, label: "Bills" },
  { to: "/new/upload", icon: Plus, label: "Split", primary: true },
  { to: "/people", icon: Users, label: "People" },
  { to: "/activity", icon: Activity, label: "Activity" },
];

export default function MobileNav() {
  const router = useRouter();
  const pathname = router.state.location.pathname;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {TABS.map((tab) => {
          const active =
            pathname === tab.to || pathname.startsWith(tab.to + "/");

          if (tab.primary) {
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                  <tab.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-[10px] mt-0.5 font-medium text-primary">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cx(
                "flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
