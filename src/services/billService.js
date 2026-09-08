/** Bill-shaped helpers used by pages: totals, validation, summaries. */

import { round2 } from "@/lib/format";
import { mockPeople } from "@/data/mockPeople";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const MAX_FILE_MB = 12;

export function validateReceiptFile(file) {
  if (!file) return { ok: false, code: "missing", message: "Choose a file to continue." };
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      ok: false,
      code: "unsupported",
      message: "That file type isn't supported. Use a JPG, PNG or PDF.",
    };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return {
      ok: false,
      code: "too_large",
      message: `This file is larger than ${MAX_FILE_MB} MB. Try a smaller photo.`,
    };
  }
  return { ok: true };
}

export function recalcSubtotal(items = []) {
  return round2(items.reduce((acc, item) => acc + (Number(item.total) || 0), 0));
}

export function recalcTotal(bill) {
  return round2(
    (Number(bill.subtotal) || 0) +
      (Number(bill.tax) || 0) +
      (Number(bill.serviceCharge) || 0) +
      (Number(bill.otherCharges) || 0) -
      (Number(bill.discount) || 0),
  );
}

export function emptyBill() {
  return {
    id: `bill_${Date.now()}`,
    name: "",
    merchant: "",
    date: new Date().toISOString().slice(0, 10),
    category: "Other",
    items: [],
    subtotal: 0,
    tax: 0,
    serviceCharge: 0,
    discount: 0,
    otherCharges: 0,
    total: 0,
    confidence: {},
    manual: true,
  };
}

export function newItem(overrides = {}) {
  return {
    id: `it_${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    qty: 1,
    unitPrice: 0,
    total: 0,
    confidence: 100,
    ...overrides,
  };
}

export function lowConfidenceFields(bill) {
  const out = [];
  Object.entries(bill?.confidence ?? {}).forEach(([field, score]) => {
    if (Number(score) < 80) out.push({ field, score: Number(score) });
  });
  (bill?.items ?? []).forEach((item) => {
    if (Number(item.confidence) < 80) out.push({ field: item.name || "Item", score: Number(item.confidence) });
  });
  return out;
}

export function peopleByIds(ids = [], people = mockPeople) {
  return ids
    .map((id) => people.find((p) => p.id === id) ?? { id, name: id })
    .filter(Boolean);
}

export function billStats(bills = []) {
  const total = bills.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
  const pending = bills
    .filter((b) => b.status === "pending")
    .reduce((acc, b) => acc + (Number(b.total) || 0), 0);
  const people = new Set();
  bills.forEach((b) => (b.people ?? []).forEach((p) => people.add(p)));
  return { count: bills.length, total, pending, people: people.size };
}

export function categoryTotals(bills = []) {
  const map = new Map();
  bills.forEach((bill) => {
    const key = bill.category ?? "Other";
    map.set(key, round2((map.get(key) ?? 0) + (Number(bill.total) || 0)));
  });
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
