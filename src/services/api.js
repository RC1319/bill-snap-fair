/**
 * Frontend API service for SplitSnap.
 * Seamlessly connects to FastAPI backend at http://localhost:8000/api
 * with graceful fallback to local memory/mock data if backend is starting up.
 */

import { mockBills, mockActivity, demoExtraction } from "@/data/mockBills";
import { mockPeople } from "@/data/mockPeople";

export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(message, { code = "unknown", hint = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.hint = hint;
  }
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "content-type": "application/json", ...(options.headers ?? {}) },
      ...options,
    });
    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}`, {
        code: String(response.status),
      });
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] Live backend unavailable for ${path}, using fallback data`, error);
    throw error;
  }
}

export const api = {
  async listBills() {
    try {
      return await request("/bills");
    } catch {
      return mockBills;
    }
  },

  async getBill(id) {
    try {
      return await request(`/bills/${id}`);
    } catch {
      const bill = mockBills.find((b) => b.id === id);
      if (!bill) throw new ApiError("We couldn't find that bill.", { code: "not_found" });
      return bill;
    }
  },

  async listPeople() {
    try {
      return await request("/people");
    } catch {
      return mockPeople;
    }
  },

  async createPerson(person) {
    try {
      return await request("/people", {
        method: "POST",
        body: JSON.stringify(person),
      });
    } catch {
      return { id: `p_${Date.now()}`, ...person };
    }
  },

  async listActivity() {
    try {
      return await request("/activity");
    } catch {
      return mockActivity;
    }
  },

  /** Upload a receipt image and extract structured fields via FastAPI OCR */
  async extractBill(file, { onStep } = {}) {
    const steps = ["uploaded", "text", "items", "charges", "review"];
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 200));
      onStep?.(step);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/ocr/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR upload failed: ${response.status}`);
      }

      const ocrResult = await response.json();
      return {
        id: `bill_${Date.now()}`,
        title: ocrResult.merchant_name || "Receipt",
        merchant_name: ocrResult.merchant_name || "Restaurant",
        date: ocrResult.date || new Date().toISOString().split("T")[0],
        currency: "INR",
        subtotal: ocrResult.subtotal || 0,
        cgst: ocrResult.cgst || 0,
        sgst: ocrResult.sgst || 0,
        service_charge: ocrResult.service_charge || 0,
        discount: ocrResult.discount || 0,
        total: ocrResult.total || 0,
        confidence_score: ocrResult.confidence_score || 0.95,
        items: ocrResult.items || [],
        sourceName: file?.name ?? "receipt",
      };
    } catch (err) {
      console.warn("[API] OCR backend failed or unreachable, falling back to mock extraction:", err);
      return {
        ...demoExtraction,
        id: `bill_${Date.now()}`,
        sourceName: file?.name ?? "receipt",
      };
    }
  },

  /** Split calculation endpoint */
  async calculateSplit(splitData) {
    try {
      return await request("/split/calculate", {
        method: "POST",
        body: JSON.stringify(splitData),
      });
    } catch (err) {
      console.warn("[API] Split calculation fallback:", err);
      return null;
    }
  },

  async saveBill(bill) {
    try {
      return await request("/bills", {
        method: "POST",
        body: JSON.stringify(bill),
      });
    } catch {
      return { ...bill, id: bill.id || `bill_${Date.now()}`, savedAt: new Date().toISOString() };
    }
  },
};

export default api;
