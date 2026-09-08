/**
 * The split engine. Pure functions — no React, no network.
 *
 * Core rules:
 *  - an item belongs to one person, several people, or everyone
 *  - shared items split equally, by custom amount, or by percentage
 *  - taxes / service / other charges / discounts are spread in proportion to
 *    each person's ACTUAL consumption, never divided equally
 *  - payer and consumer are separate concepts
 */

import { round2 } from "@/lib/format";

export const SPLIT_METHODS = [
  { id: "equal", label: "Equal", hint: "Everyone selected pays the same" },
  { id: "custom", label: "Custom amounts", hint: "Type exact rupee amounts" },
  { id: "percentage", label: "Percentage", hint: "Split by share of the item" },
];

export function emptyAssignment() {
  return { people: [], method: "equal", shares: {} };
}

/** Amounts owed for a single item, keyed by person id. */
export function itemShares(item, assignment) {
  const total = Number(item?.total) || 0;
  const people = assignment?.people ?? [];
  if (people.length === 0) return {};

  const method = assignment.method ?? "equal";
  const shares = assignment.shares ?? {};

  if (method === "custom") {
    const out = {};
    people.forEach((id) => {
      out[id] = round2(Number(shares[id]) || 0);
    });
    return out;
  }

  if (method === "percentage") {
    const out = {};
    people.forEach((id) => {
      out[id] = round2((total * (Number(shares[id]) || 0)) / 100);
    });
    return balanceTo(out, total);
  }

  const even = total / people.length;
  const out = {};
  people.forEach((id) => {
    out[id] = round2(even);
  });
  return balanceTo(out, total);
}

/** Nudge the largest share so rounded parts add up exactly to `target`. */
function balanceTo(map, target) {
  const ids = Object.keys(map);
  if (ids.length === 0) return map;
  const sum = ids.reduce((acc, id) => acc + map[id], 0);
  const drift = round2(target - sum);
  if (drift === 0) return map;
  const biggest = ids.reduce((a, b) => (map[a] >= map[b] ? a : b));
  return { ...map, [biggest]: round2(map[biggest] + drift) };
}

export function assignmentIsValid(item, assignment) {
  const people = assignment?.people ?? [];
  if (people.length === 0) return true; // unassigned is a separate warning
  const method = assignment.method ?? "equal";
  const total = Number(item?.total) || 0;
  if (method === "custom") {
    const sum = people.reduce((acc, id) => acc + (Number(assignment.shares?.[id]) || 0), 0);
    return Math.abs(sum - total) < 0.01;
  }
  if (method === "percentage") {
    const sum = people.reduce((acc, id) => acc + (Number(assignment.shares?.[id]) || 0), 0);
    return Math.abs(sum - 100) < 0.01;
  }
  return true;
}

/** Every derived number for a bill: per-person breakdown + settlements. */
export function calculateSplit({ bill, people = [], assignments = {}, payments = {} }) {
  const items = bill?.items ?? [];
  const tax = Number(bill?.tax) || 0;
  const service = Number(bill?.serviceCharge) || 0;
  const other = Number(bill?.otherCharges) || 0;
  const discount = Number(bill?.discount) || 0;

  const consumption = {};
  const itemsByPerson = {};
  people.forEach((p) => {
    consumption[p.id] = 0;
    itemsByPerson[p.id] = [];
  });

  const unassigned = [];
  items.forEach((item) => {
    const assignment = assignments[item.id] ?? emptyAssignment();
    if (!assignment.people || assignment.people.length === 0) {
      unassigned.push(item);
      return;
    }
    const shares = itemShares(item, assignment);
    Object.entries(shares).forEach(([personId, amount]) => {
      if (consumption[personId] === undefined) return;
      consumption[personId] = round2(consumption[personId] + amount);
      itemsByPerson[personId].push({ id: item.id, name: item.name, amount });
    });
  });

  const consumedTotal = round2(
    Object.values(consumption).reduce((acc, value) => acc + value, 0),
  );

  const shareOf = (amount, personId) =>
    consumedTotal <= 0 ? 0 : round2((amount * consumption[personId]) / consumedTotal);

  const perPerson = people.map((person) => {
    const itemsTotal = consumption[person.id] ?? 0;
    const taxShare = shareOf(tax, person.id);
    const serviceShare = shareOf(service, person.id);
    const otherShare = shareOf(other, person.id);
    const discountShare = shareOf(discount, person.id);
    const paid = round2(Number(payments[person.id]) || 0);
    const owes = round2(itemsTotal + taxShare + serviceShare + otherShare - discountShare);
    return {
      person,
      items: itemsByPerson[person.id] ?? [],
      itemsTotal,
      taxShare,
      serviceShare,
      otherShare,
      discountShare,
      total: owes,
      paid,
      net: round2(paid - owes),
      ratio: consumedTotal <= 0 ? 0 : itemsTotal / consumedTotal,
    };
  });

  const billTotal = round2(
    Number(
      bill?.total ??
        consumedTotal + tax + service + other - discount,
    ),
  );
  const allocated = round2(perPerson.reduce((acc, row) => acc + row.total, 0));

  return {
    perPerson,
    consumedTotal,
    billTotal,
    allocated,
    unallocated: round2(billTotal - allocated),
    unassignedItems: unassigned,
    settlements: settleUp(perPerson),
    charges: { tax, service, other, discount, subtotal: consumedTotal },
  };
}

/** Greedy netting: fewest possible transfers between debtors and creditors. */
export function settleUp(perPerson) {
  const debtors = perPerson
    .filter((row) => row.net < -0.009)
    .map((row) => ({ person: row.person, amount: round2(-row.net) }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = perPerson
    .filter((row) => row.net > 0.009)
    .map((row) => ({ person: row.person, amount: round2(row.net) }))
    .sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = round2(Math.min(debtors[i].amount, creditors[j].amount));
    if (amount > 0.009) {
      transfers.push({ from: debtors[i].person, to: creditors[j].person, amount });
    }
    debtors[i].amount = round2(debtors[i].amount - amount);
    creditors[j].amount = round2(creditors[j].amount - amount);
    if (debtors[i].amount <= 0.009) i += 1;
    if (creditors[j].amount <= 0.009) j += 1;
  }
  return transfers;
}

/** Arithmetic sanity checks surfaced to the user during review. */
export function auditBill(bill) {
  const issues = [];
  const items = bill?.items ?? [];
  if (items.length === 0) {
    issues.push({ level: "error", message: "No items were read from this bill." });
  }
  const lineSum = round2(items.reduce((acc, i) => acc + (Number(i.total) || 0), 0));
  if (items.length > 0 && Math.abs(lineSum - (Number(bill.subtotal) || 0)) > 1) {
    issues.push({
      level: "warning",
      message: `Item lines add up to ₹${lineSum.toLocaleString("en-IN")}, but the subtotal reads ₹${(Number(bill.subtotal) || 0).toLocaleString("en-IN")}.`,
    });
  }
  const computed = round2(
    (Number(bill.subtotal) || 0) +
      (Number(bill.tax) || 0) +
      (Number(bill.serviceCharge) || 0) +
      (Number(bill.otherCharges) || 0) -
      (Number(bill.discount) || 0),
  );
  if (!bill.total) {
    issues.push({ level: "error", message: "The total is missing — please enter it." });
  } else if (Math.abs(computed - (Number(bill.total) || 0)) > 1) {
    issues.push({
      level: "warning",
      message: `Subtotal plus charges comes to ₹${computed.toLocaleString("en-IN")}, not the printed total.`,
    });
  }
  const seen = new Map();
  items.forEach((item) => {
    const key = `${(item.name || "").trim().toLowerCase()}|${item.total}`;
    if (seen.has(key)) {
      issues.push({
        level: "warning",
        message: `"${item.name}" appears twice — check it isn't a duplicate.`,
      });
    }
    seen.set(key, true);
  });
  return issues;
}
