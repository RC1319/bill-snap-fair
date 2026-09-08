import { useQuery } from "@tanstack/react-query";
import { UserPlus, Users } from "lucide-react";
import { api } from "@/services/api";
import { formatMoney, initials, cx } from "@/lib/format";

const ACCENT_COLORS = {
  gold: "bg-primary/12 text-primary",
  high: "bg-high/12 text-high",
  mid: "bg-mid/12 text-mid",
  low: "bg-low/12 text-low",
};

export default function PeoplePage() {
  const { data: people = [], isLoading } = useQuery({
    queryKey: ["people"],
    queryFn: () => api.listPeople(),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-end justify-between rise">
        <div>
          <h1 className="text-2xl font-bold text-foreground">People</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep track of people you frequently split bills with.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all">
          <UserPlus className="w-4 h-4" />
          Add Person
        </button>
      </div>

      {people.length === 0 ? (
        <div className="panel-card p-12 text-center rise">
          <Users className="w-10 h-10 text-faint mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No people yet</h3>
          <p className="text-sm text-muted-foreground">
            People you split bills with will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {people.map((person, i) => (
            <div
              key={person.id}
              className="panel-card p-4 flex items-center gap-4 hover:bg-card/80 transition-colors rise"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={cx(
                  "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  ACCENT_COLORS[person.accent] ?? ACCENT_COLORS.gold
                )}
              >
                {initials(person.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {person.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {person.bills} bills · {formatMoney(person.shared)} shared
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
