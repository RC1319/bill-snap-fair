/**
 * Single place where the frontend talks to the outside world.
 *
 * Today every call resolves from mock data with a little latency so the UI
 * behaves like the real thing. To connect the FastAPI backend later, set
 * VITE_API_BASE_URL and flip USE_MOCKS to false — the function signatures and
 * response shapes stay exactly the same.
 */

import { mockBills, mockActivity, demoExtraction } from "@/data/mockBills";
import { mockPeople } from "@/data/mockPeople";

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";
const USE_MOCKS = true;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  constructor(message, { code = "unknown", hint = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.hint = hint;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "content-type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    throw new ApiError("The server could not complete that request.", {
      code: String(response.status),
    });
  }
  return response.json();
}

export const api = {
  async listBills() {
    if (USE_MOCKS) {
      await delay(320);
      return mockBills;
    }
    return request("/bills");
  },

  async getBill(id) {
    if (USE_MOCKS) {
      await delay(220);
      const bill = mockBills.find((b) => b.id === id);
      if (!bill) throw new ApiError("We couldn't find that bill.", { code: "not_found" });
      return bill;
    }
    return request(`/bills/${id}`);
  },

  async listPeople() {
    if (USE_MOCKS) {
      await delay(200);
      return mockPeople;
    }
    return request("/people");
  },

  async listActivity() {
    if (USE_MOCKS) {
      await delay(200);
      return mockActivity;
    }
    return request("/activity");
  },

  /** Upload a receipt and get back structured, confidence-scored fields. */
  async extractBill(file, { onStep } = {}) {
    if (USE_MOCKS) {
      const steps = ["uploaded", "text", "items", "charges", "review"];
      for (const step of steps) {
        await delay(750);
        onStep?.(step);
      }
      return { ...demoExtraction, id: `bill_${Date.now()}`, sourceName: file?.name ?? "receipt" };
    }
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(`${API_BASE_URL}/bills/extract`, { method: "POST", body });
    if (!response.ok) throw new ApiError("We couldn't read this bill.", { code: "ocr_failed" });
    return response.json();
  },

  async saveBill(bill) {
    if (USE_MOCKS) {
      await delay(400);
      return { ...bill, savedAt: new Date().toISOString() };
    }
    return request("/bills", { method: "POST", body: JSON.stringify(bill) });
  },
};

export default api;
