import { useQuery } from "@tanstack/react-query";
import { Upload, Search, Scissors, Clock, CheckCircle2, Activity as ActivityIcon } from "lucide-react";
import { api } from "@/services/api";
import { timeAgo, cx } from "@/lib/format";

const ICONS = {
  upload: Upload,
  review: Search,
  split: Scissors,
  settlement: Clock,
};

const COLORS = {
  upload: "bg-primary/12 text-primary",
  review: "bg-mid/12 text-mid",
  split: "bg-high/12 text-high",
  settlement: "bg-low/12 text-low",
};

export default function ActivityPage() {
  const { data: activity = [], isLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: () => api.listActivity(),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel-card h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recent activity across your bills and settlements.
        </p>
      </div>

      {activity.length === 0 ? (
        <div className="panel-card p-12 text-center rise">
          <ActivityIcon className="w-10 h-10 text-faint mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No activity yet</h3>
          <p className="text-sm text-muted-foreground">
            Your bill activity will show up here.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-3 bottom-3 w-px bg-border" />

          <div className="space-y-1">
            {activity.map((item, i) => {
              const Icon = ICONS[item.type] ?? CheckCircle2;
              return (
                <div
                  key={item.id}
                  className="relative flex items-start gap-4 p-3 rounded-xl hover:bg-card/50 transition-colors rise"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className={cx(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10",
                      COLORS[item.type] ?? COLORS.upload
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-[11px] text-faint pt-1.5 shrink-0">
                    {timeAgo(item.at)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
