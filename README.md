# 🧾 SplitSnap — AI Receipt OCR & Smart Bill Splitting Engine

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS_v4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Split bills fairly, not equally.** Upload a receipt photograph, let AI extract line items automatically, assign who ate what, and calculate each person's exact share with proportional tax, service charges, discounts, and optimized debt settlements.

---

## 🌟 Key Features

- 📸 **AI-Powered Receipt OCR**: Upload any receipt (PNG, JPG, WEBP) or paste raw bill text to extract structured line items, prices, quantities, taxes, and service charges.
- 🍕 **Itemized Individual & Shared Splitting**: Assign dishes to one person or split shared appetizers/pitchers evenly among select group members.
- ⚖️ **Proportional Tax & Surcharge Distribution**: Taxes, tips, delivery fees, and discounts are distributed proportionally based on each person's spend—no unfair equal tax divisions.
- 💳 **Smart Debt Simplification**: Built-in Min-Cash-Flow settlement algorithm calculates the minimum number of direct peer-to-peer transfers required to settle the bill.
- 📊 **Dashboard & Analytics**: Track expense history, spending breakdowns, pending balances, and settlement receipts.
- 📱 **Modern Responsive UI**: Built with React 19, Tailwind CSS, Radix UI primitives, Lucide icons, and Recharts.

---

## 🚀 Quick Start

### 1. Backend (FastAPI Python Service)

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run development server
python run.py
# Or with uvicorn:
uvicorn app.main:app --reload --port 8000
```
Backend API will run at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 2. Frontend (React 19 + Vite)

```bash
# In the repository root
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```plaintext
bill-snap-fair/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py           # FastAPI entry point & CORS
│   │   ├── config.py         # App configuration & env variables
│   │   ├── routers/          # API routes (bills, ocr, splits, people, activity)
│   │   ├── services/         # OCR AI engine & split calculation services
│   │   ├── models/           # Pydantic schemas (bill, split, person, etc.)
│   │   └── utils/            # Windows OCR & Receipt text parsers
│   ├── tests/                # Pytest test suite
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Server launcher script
├── src/                      # React Frontend
│   ├── components/           # UI components (common, layout, dialogs, forms)
│   ├── pages/                # Main application views
│   ├── services/             # API connector & split math services
│   ├── context/              # SplitFlowContext global state
│   └── styles.css            # Global CSS tokens and theme
├── package.json              # Frontend dependencies and scripts
├── vite.config.ts            # Vite configuration
└── .gitattributes            # Language and repository configurations
```

---

## 🧮 How the Proportional Split Works

When splitting extra charges (GST, VAT, service charges, delivery fees, discounts):

$$\text{Person Share} = \text{Personal Items Total} + \left( \frac{\text{Personal Items Total}}{\text{Items Subtotal}} \times \text{Shared Taxes \& Fees} \right) - \left( \frac{\text{Personal Items Total}}{\text{Items Subtotal}} \times \text{Discounts} \right)$$

This ensures that someone who only ordered a $5 coffee does **not** pay an equal share of tax for someone who ordered a $50 steak.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

Distributed under the MIT License.
