import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { calculateSplit, emptyAssignment } from "@/services/splitService";
import { recalcSubtotal, recalcTotal } from "@/services/billService";

const SplitFlowContext = createContext(null);

const STEPS = [
  { id: "upload", label: "Upload", to: "/new/upload" },
  { id: "review", label: "Review", to: "/new/review" },
  { id: "people", label: "People", to: "/new/people" },
  { id: "assign", label: "Assign", to: "/new/assign" },
  { id: "charges", label: "Charges", to: "/new/charges" },
  { id: "summary", label: "Summary", to: "/new/summary" },
  { id: "settlement", label: "Settle", to: "/new/settlement" },
];

/** Single source of truth for the multi-step split flow. */
export function SplitFlowProvider({ children }) {
  const [bill, setBill] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [people, setPeople] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [payments, setPayments] = useState({});

  const startBill = useCallback((nextBill, url = null) => {
    setBill(nextBill);
    setReceiptUrl(url);
    setConfirmed(false);
    setAssignments(
      Object.fromEntries((nextBill?.items ?? []).map((item) => [item.id, emptyAssignment()])),
    );
    setPayments({});
  }, []);

  const patchBill = useCallback((patch) => {
    setBill((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.items) next.subtotal = recalcSubtotal(patch.items);
      next.total = recalcTotal(next);
      return next;
    });
  }, []);

  const setItems = useCallback((items) => patchBill({ items }), [patchBill]);

  const setAssignment = useCallback((itemId, next) => {
    setAssignments((current) => ({
      ...current,
      [itemId]: { ...emptyAssignment(), ...(current[itemId] ?? {}), ...next },
    }));
  }, []);

  const togglePersonOnItem = useCallback((itemId, personId) => {
    setAssignments((current) => {
      const entry = current[itemId] ?? emptyAssignment();
      const has = entry.people.includes(personId);
      const nextPeople = has
        ? entry.people.filter((id) => id !== personId)
        : [...entry.people, personId];
      return {
        ...current,
        [itemId]: { ...entry, people: nextPeople, method: "equal", shares: {} },
      };
    });
  }, []);

  const setEveryoneOnItem = useCallback(
    (itemId) => {
      setAssignments((current) => ({
        ...current,
        [itemId]: { people: people.map((p) => p.id), method: "equal", shares: {} },
      }));
    },
    [people],
  );

  const addPerson = useCallback((name) => {
    const clean = String(name ?? "").trim();
    if (!clean) return { ok: false, message: "Enter a name first." };
    let result = { ok: true };
    setPeople((current) => {
      if (current.length >= 20) {
        result = { ok: false, message: "You can split between at most 20 people." };
        return current;
      }
      if (current.some((p) => p.name.toLowerCase() === clean.toLowerCase())) {
        result = { ok: false, message: `${clean} is already on this bill.` };
        return current;
      }
      return [...current, { id: `p_${clean.toLowerCase()}_${current.length}`, name: clean }];
    });
    return result;
  }, []);

  const addExistingPerson = useCallback((person) => {
    setPeople((current) =>
      current.some((p) => p.id === person.id) ? current : [...current, person],
    );
  }, []);

  const removePerson = useCallback((personId) => {
    setPeople((current) => current.filter((p) => p.id !== personId));
    setAssignments((current) => {
      const next = {};
      Object.entries(current).forEach(([itemId, entry]) => {
        const nextPeople = entry.people.filter((id) => id !== personId);
        const shares = { ...entry.shares };
        delete shares[personId];
        next[itemId] = { ...entry, people: nextPeople, shares };
      });
      return next;
    });
    setPayments((current) => {
      const next = { ...current };
      delete next[personId];
      return next;
    });
  }, []);

  const setPayer = useCallback(
    (personId) => {
      setPayments(personId ? { [personId]: Number(bill?.total) || 0 } : {});
    },
    [bill],
  );

  const reset = useCallback(() => {
    setBill(null);
    setReceiptUrl(null);
    setConfirmed(false);
    setPeople([]);
    setAssignments({});
    setPayments({});
  }, []);

  const result = useMemo(
    () => calculateSplit({ bill, people, assignments, payments }),
    [bill, people, assignments, payments],
  );

  const value = useMemo(
    () => ({
      steps: STEPS,
      bill,
      receiptUrl,
      confirmed,
      people,
      assignments,
      payments,
      result,
      startBill,
      patchBill,
      setItems,
      setConfirmed,
      setAssignment,
      togglePersonOnItem,
      setEveryoneOnItem,
      addPerson,
      addExistingPerson,
      removePerson,
      setPayments,
      setPayer,
      reset,
    }),
    [
      bill,
      receiptUrl,
      confirmed,
      people,
      assignments,
      payments,
      result,
      startBill,
      patchBill,
      setItems,
      setAssignment,
      togglePersonOnItem,
      setEveryoneOnItem,
      addPerson,
      addExistingPerson,
      removePerson,
      setPayer,
      reset,
    ],
  );

  return <SplitFlowContext.Provider value={value}>{children}</SplitFlowContext.Provider>;
}

export function useSplitFlow() {
  const context = useContext(SplitFlowContext);
  if (!context) throw new Error("useSplitFlow must be used inside SplitFlowProvider");
  return context;
}
