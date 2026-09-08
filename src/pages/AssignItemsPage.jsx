import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Users, CheckCircle2, ArrowRight, Settings2, Sparkles, RotateCcw } from "lucide-react";
import { useSplitFlow } from "@/context/SplitFlowContext";
import { itemShares, getItemTotal, SPLIT_METHODS } from "@/services/splitService";
import { formatMoney, cx } from "@/lib/format";

function SplitModal({ item, assignment, people, onClose, onSave }) {
  const [method, setMethod] = useState(assignment.method ?? "equal");
  const [shares, setShares] = useState(assignment.shares ?? {});
  const assignedPeople = people.filter((p) => (assignment.people ?? []).includes(p.id));
  const total = getItemTotal(item);

  const updateShare = (personId, value) => {
    setShares((s) => ({ ...s, [personId]: Number(value) || 0 }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="panel-card w-full max-w-md p-6 space-y-5 rise">
        <h3 className="text-lg font-bold text-foreground">
          Split: {item.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Total: {formatMoney(total)} · {assignedPeople.length} people
        </p>

        {/* Method selector */}
        <div className="flex gap-2">
          {SPLIT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cx(
                "flex-1 py-2 rounded-lg text-xs font-medium transition-colors",
                method === m.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Shares input */}
        {method !== "equal" && (
          <div className="space-y-2">
            {assignedPeople.map((person) => (
              <div key={person.id} className="flex items-center gap-3">
                <span className="text-sm text-foreground flex-1">{person.name}</span>
                <div className="flex items-center gap-1">
                  {method === "custom" && <span className="text-xs text-muted-foreground">₹</span>}
                  <input
                    type="number"
                    value={shares[person.id] ?? ""}
                    onChange={(e) => updateShare(person.id, e.target.value)}
                    placeholder={method === "percentage" ? "%" : "0"}
                    className="w-20 px-2 py-1.5 rounded-lg bg-card border border-border text-sm text-foreground text-right font-mono outline-none focus:border-primary"
                  />
                  {method === "percentage" && <span className="text-xs text-muted-foreground">%</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ method, shares })}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssignItemsPage() {
  const navigate = useNavigate();
  const {
    bill,
    people,
    assignments,
    togglePersonOnItem,
    setEveryoneOnItem,
    setAssignment,
  } = useSplitFlow();
  const [modalItem, setModalItem] = useState(null);

  if (!bill) {
    navigate({ to: "/new/upload" });
    return null;
  }

  const items = bill.items ?? [];
  const allPersonIds = people.map((p) => p.id);

  const handleAssignAllToEveryone = () => {
    items.forEach((item) => {
      setAssignment(item.id, { people: allPersonIds, method: "equal", shares: {} });
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      setAssignment(item.id, { people: [], method: "equal", shares: {} });
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header & Quick actions */}
      <div className="rise flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Who had what?</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tap people to assign items, or split everything equally with one click.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAssignAllToEveryone}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors border border-primary/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Split All Equally
          </button>
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card text-muted-foreground text-xs font-medium hover:text-foreground border border-border transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          // If no assignment yet, default display to everyone
          const rawAssignment = assignments[item.id];
          const assignedPeopleIds = rawAssignment?.people && rawAssignment.people.length > 0
            ? rawAssignment.people
            : allPersonIds;
          
          const effectiveAssignment = rawAssignment?.people && rawAssignment.people.length > 0
            ? rawAssignment
            : { people: allPersonIds, method: "equal", shares: {} };

          const itemTotal = getItemTotal(item);
          const qty = item.quantity ?? item.qty ?? 1;

          return (
            <div
              key={item.id}
              className="panel-card p-4 space-y-3 rise"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Item header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    × {qty}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-foreground">
                    {formatMoney(itemTotal)}
                  </span>
                  {assignedPeopleIds.length > 1 && (
                    <button
                      onClick={() => setModalItem(item)}
                      className="p-1 rounded text-faint hover:text-primary transition-colors"
                      title="Custom split options"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Person toggles */}
              <div className="flex flex-wrap gap-2">
                {people.map((person) => {
                  const active = assignedPeopleIds.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => togglePersonOnItem(item.id, person.id)}
                      className={cx(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        active
                          ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                          : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                      )}
                    >
                      {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {person.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => setEveryoneOnItem(item.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-primary transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  Everyone
                </button>
              </div>

              {/* Share breakdown */}
              {assignedPeopleIds.length > 0 && (
                <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1 border-t border-border/30">
                  <span className="text-primary font-medium">
                    Shared by {assignedPeopleIds.length} {assignedPeopleIds.length === 1 ? "person" : "people"}
                  </span>
                  {assignedPeopleIds.length > 1 && effectiveAssignment.method === "equal" && (
                    <span>
                      {" · "}
                      <strong className="text-foreground font-mono">
                        {formatMoney(itemTotal / assignedPeopleIds.length)}
                      </strong>{" "}
                      each
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation actions */}
      <div className="flex items-center justify-between pt-4 rise">
        <button
          onClick={() => navigate({ to: "/new/people" })}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => navigate({ to: "/new/charges" })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Split Modal */}
      {modalItem && (
        <SplitModal
          item={modalItem}
          assignment={assignments[modalItem.id] ?? { people: allPersonIds, method: "equal", shares: {} }}
          people={people}
          onClose={() => setModalItem(null)}
          onSave={(patch) => {
            setAssignment(modalItem.id, patch);
            setModalItem(null);
          }}
        />
      )}
    </div>
  );
}
