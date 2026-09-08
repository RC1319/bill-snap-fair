import { Link } from "@tanstack/react-router";
import { Search, Bell, User } from "lucide-react";
import { currentUser } from "@/data/mockPeople";
import { initials } from "@/lib/format";

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-sidebar/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Search"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <button
          className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User avatar */}
        <Link
          to="/settings"
          className="flex items-center gap-2.5 ml-1 pl-3 border-l border-border"
        >
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
            {initials(currentUser.name)}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {currentUser.plan}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
