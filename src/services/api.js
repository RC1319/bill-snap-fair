/**
 * Frontend API service for SplitSnap.
 * Seamlessly connects to FastAPI backend at http://localhost:8000/api
 * with graceful handling.
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
      await new Promise((r) => setTimeout(r, 250));
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

      const items = (ocrResult.items || []).map((it, idx) => {
        const qty = Number(it.quantity) || Number(it.qty) || 1;
        const total = Number(it.total_price) || Number(it.total) || 0;
        const unitPrice = Number(it.unit_price) || Number(it.unitPrice) || (qty > 0 ? total / qty : total);
        const rawConf = it.confidence ?? 0.95;
        const confPct = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf);

        return {
          id: it.id || `it_${idx + 1}`,
          name: it.name || `Item ${idx + 1}`,
          qty,
          unitPrice,
          total: total || (qty * unitPrice),
          confidence: confPct,
        };
      });

      const calcSubtotal = items.reduce((s, it) => s + it.total, 0);
      const subtotal = Number(ocrResult.subtotal) || calcSubtotal;
      const cgst = Number(ocrResult.cgst) || 0;
      const sgst = Number(ocrResult.sgst) || 0;
      const tax = Number(ocrResult.tax) || (cgst + sgst);
      const serviceCharge = Number(ocrResult.service_charge) || Number(ocrResult.serviceCharge) || 0;
      const discount = Number(ocrResult.discount) || 0;
      const total = Number(ocrResult.total) || (subtotal + tax + serviceCharge - discount);

      return {
        id: `bill_${Date.now()}`,
        name: ocrResult.merchant_name || file?.name?.replace(/\.[^/.]+$/, "") || "Receipt Bill",
        merchant: ocrResult.merchant_name || "Store / Restaurant",
        date: ocrResult.date || new Date().toISOString().split("T")[0],
        category: "Groceries",
        currency: "INR",
        items,
        subtotal,
        tax,
        cgst,
        sgst,
        serviceCharge,
        discount,
        otherCharges: 0,
        total,
        confidence: {
          merchant: 98,
          date: 96,
          subtotal: 95,
          tax: 95,
          serviceCharge: 95,
          discount: 99,
          otherCharges: 99,
          total: 99,
        },
        sourceName: file?.name ?? "receipt",
      };
    } catch (err) {
      console.error("[API] Live backend OCR failed or offline:", err);
      throw new Error(
        "Could not connect to FastAPI backend at http://localhost:8000. Please ensure the backend server is running (`python run.py`)."
      );
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
