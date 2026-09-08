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

## 🚀 Quick Start (Frontend)

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```plaintext
bill-snap-fair/
├── src/
│   ├── components/       # UI components (common, layout, dialogs, forms)
│   ├── pages/            # Main application views:
│   │   ├── LandingPage.jsx       # Welcome & intro
│   │   ├── DashboardPage.jsx     # Overview & statistics
│   │   ├── UploadBillPage.jsx    # Receipt image upload & preview
│   │   ├── ReviewBillPage.jsx    # Line item verification & editing
│   │   ├── AddPeoplePage.jsx     # Add friends & assign avatars
│   │   ├── AssignItemsPage.jsx   # Interactive item-to-person assigner
│   │   ├── BillChargesPage.jsx   # Tax, tip, discount & surcharge inputs
│   │   ├── BillSummaryPage.jsx   # Finalized breakdown per person
│   │   ├── SettlementPage.jsx    # Min-cash-flow payment transfers
│   │   ├── BillHistoryPage.jsx   # Past bills list
│   │   └── ActivityPage.jsx      # Recent activity log
│   ├── services/         # API connector & mock calculation engine
│   ├── context/          # Application global state (SplitFlowContext)
│   └── styles.css        # Global CSS tokens and theme
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
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
