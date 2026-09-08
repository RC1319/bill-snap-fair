import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Receipt, Filter } from "lucide-react";
import { api } from "@/services/api";
import { CATEGORIES } from "@/data/mockBills";
import { formatMoney, formatShortDate, timeAgo, cx } from "@/lib/format";

const FILTERS = ["All", ...CATEGORIES];

export default function BillHistoryPage() {
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => api.listBills(),
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = bills.filter((b) => {
    if (filter !== "All" && b.category !== filter) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="panel-card h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">Bill History</h1>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 rise" style={{ animationDelay: "80ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bills..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-faint outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cx(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bills list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="panel-card p-8 text-center rise">
            <Receipt className="w-8 h-8 text-faint mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No bills found.</p>
          </div>
        ) : (
          filtered.map((bill, i) => (
            <Link
              key={bill.id}
              to={`/bills/${bill.id}`}
              className="panel-card p-4 flex items-center gap-4 hover:bg-card/80 transition-colors rise"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{bill.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatShortDate(bill.date)} · {(bill.people ?? []).length} people · Paid by {bill.paidBy?.replace("p_", "")}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-foreground">{formatMoney(bill.total)}</p>
                <span className={cx("text-[10px] font-medium", bill.status === "settled" ? "text-high" : "text-mid")}>
                  {bill.status === "settled" ? "Settled" : "Pending"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
