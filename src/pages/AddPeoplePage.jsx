import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, X, Users, ArrowRight, SkipForward } from "lucide-react";
import { useSplitFlow } from "@/context/SplitFlowContext";
import { api } from "@/services/api";
import { initials, cx } from "@/lib/format";

const AVATAR_COLORS = [
  "bg-primary/15 text-primary",
  "bg-high/15 text-high",
  "bg-mid/15 text-mid",
  "bg-low/15 text-low",
  "bg-primary/20 text-primary",
  "bg-high/20 text-high",
];

export default function AddPeoplePage() {
  const navigate = useNavigate();
  const { bill, people, addPerson, addExistingPerson, removePerson } = useSplitFlow();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { data: existingPeople = [] } = useQuery({
    queryKey: ["people"],
    queryFn: () => api.listPeople(),
  });

  if (!bill) {
    navigate({ to: "/new/upload" });
    return null;
  }

  const handleAdd = () => {
    const result = addPerson(name);
    if (!result.ok) {
      setError(result.message);
    } else {
      setName("");
      setError("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleContinue = () => {
    if (people.length < 2) {
      setError("Add at least 2 people to split the bill.");
      return;
    }
    navigate({ to: "/new/assign" });
  };

  // People not already added
  const suggestions = existingPeople.filter(
    (p) => !people.some((added) => added.id === p.id)
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="rise">
        <h1 className="text-2xl font-bold text-foreground">
          Who's splitting this bill?
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add the people involved in this bill.
        </p>
      </div>

      {/* Input */}
      <div className="rise" style={{ animationDelay: "80ms" }}>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter a name"
            className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-faint outline-none focus:border-primary transition-colors"
            maxLength={30}
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Person
          </button>
        </div>
        {error && (
          <p className="text-xs text-low mt-2">{error}</p>
        )}
      </div>

      {/* People list */}
      <div className="space-y-2 rise" style={{ animationDelay: "160ms" }}>
        {people.length === 0 ? (
          <div className="panel-card p-8 text-center">
            <Users className="w-10 h-10 text-faint mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No people added yet. Start typing a name above.
            </p>
          </div>
        ) : (
          people.map((person, i) => (
            <div
              key={person.id}
              className="panel-card p-3 flex items-center gap-3 rise"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={cx(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                )}
              >
                {initials(person.name)}
              </div>
              <span className="text-sm font-medium text-foreground flex-1">
                {person.name}
              </span>
              <button
                onClick={() => removePerson(person.id)}
                className="p-1.5 rounded-lg text-faint hover:text-low hover:bg-low/10 transition-colors"
                aria-label={`Remove ${person.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Quick add from existing */}
      {suggestions.length > 0 && (
        <div className="rise" style={{ animationDelay: "240ms" }}>
          <h3 className="text-xs text-muted-foreground font-medium mb-2">
            Quick add from your contacts
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 8).map((person) => (
              <button
                key={person.id}
                onClick={() => addExistingPerson(person)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <span className="text-muted-foreground">+</span>
                {person.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 rise" style={{ animationDelay: "320ms" }}>
        <button
          onClick={() => navigate({ to: "/new/review" })}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate({ to: "/new/assign" })}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip & add later
          </button>
          <button
            onClick={handleContinue}
            disabled={people.length < 2}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
