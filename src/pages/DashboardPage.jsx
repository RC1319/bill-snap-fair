import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Receipt,
  IndianRupee,
  Clock,
  Users,
  Plus,
  FileText,
  ArrowRight,
} from "lucide-react";
import { api } from "@/services/api";
import { billStats } from "@/services/billService";
import { formatMoney, timeAgo, cx, initials } from "@/lib/format";
import { CATEGORIES } from "@/data/mockBills";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="panel-card p-5 flex items-start gap-4 rise">
      <div
        className={cx(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          accent === "gold"
            ? "bg-primary/12 text-primary"
            : accent === "high"
            ? "bg-high/12 text-high"
            : accent === "mid"
            ? "bg-mid/12 text-mid"
            : "bg-low/12 text-low"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground font-mono leading-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function BillCard({ bill }) {
  const categoryColors = {
    Food: "bg-primary/12 text-primary",
    Groceries: "bg-high/12 text-high",
    Shopping: "bg-mid/12 text-mid",
    Transport: "bg-low/12 text-low",
    Hotel: "bg-primary/12 text-primary",
    Other: "bg-muted text-muted-foreground",
  };

  return (
    <Link
      to={`/bills/${bill.id}`}
      className="panel-card p-4 flex items-center gap-4 hover:bg-card/80 transition-colors group rise"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
        <Receipt className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {bill.name}
          </p>
          <span
            className={cx(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              categoryColors[bill.category] ?? categoryColors.Other
            )}
          >
            {bill.category}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{(bill.people ?? []).length} people</span>
          <span>·</span>
          <span>Paid by {bill.paidBy?.replace("p_", "") ?? "—"}</span>
          <span>·</span>
          <span>{timeAgo(bill.createdAt)}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold font-mono text-foreground">
          {formatMoney(bill.total)}
        </p>
        <span
          className={cx(
            "text-[10px] font-medium",
            bill.status === "settled" ? "text-high" : "text-mid"
          )}
        >
          {bill.status === "settled" ? "Settled" : "Pending"}
        </span>
      </div>
      <ArrowRight className="w-4 h-4 text-faint group-hover:text-muted-foreground transition-colors shrink-0" />
    </Link>
  );
}

export default function DashboardPage() {
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => api.listBills(),
  });

  const stats = billStats(bills);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 rise">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Bills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage bills, people and outstanding splits in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/new/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Split a New Bill
          </Link>
          <Link
            to="/new/manual"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card text-foreground font-medium text-sm hover:bg-card/80 transition-all border border-border"
          >
            <FileText className="w-4 h-4" />
            Add Manually
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Receipt}
          label="Total Bills"
          value={`${stats.count} Bills`}
          accent="gold"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Amount"
          value={formatMoney(stats.total)}
          accent="high"
        />
        <StatCard
          icon={Clock}
          label="Pending Settlements"
          value={`${formatMoney(stats.pending)} Pending`}
          accent="mid"
        />
        <StatCard
          icon={Users}
          label="People"
          value={`${stats.people} People`}
          accent="low"
        />
      </div>

      {/* Recent Bills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Bills
          </h2>
          <Link
            to="/bills"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {bills.map((bill, i) => (
            <div key={bill.id} style={{ animationDelay: `${i * 60}ms` }}>
              <BillCard bill={bill} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
