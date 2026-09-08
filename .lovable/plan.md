# SplitSnap — frontend build plan

A complete, production-quality frontend for SplitSnap: snap a bill, review what the AI read, assign items to people, and get a fair split with tax and service charge distributed by actual consumption.

Look and feel: the "Molten Obsidian" direction you picked — dark charcoal surfaces, warm gold accent, receipt-style monospace numbers, dotted leader lines, green/amber/red confidence badges.

## What gets built

**App shell**
- Left sidebar: SplitSnap logo with "Snap · Assign · Split", links for Dashboard, Bills, People, Activity, and a bottom section with Settings, Help, and the user chip.
- Top bar with search, notifications, avatar.
- On phones the sidebar becomes a bottom bar with large tap targets; camera upload stays one tap away.

**Screens**
1. Home — hero "Split bills without the headache.", Upload a Bill / Add Manually, and an animated Receipt → Extract → Review → Assign → Fair Split strip.
2. Dashboard — "Your Bills", four stat tiles (bills, total, pending, people), recent bill cards.
3. Upload — drag-and-drop zone, Take a Photo / Choose File, quality tips, "enter manually instead" link.
4. Processing — receipt preview beside a five-step pipeline that advances on a timer, so it reads as real analysis.
5. Review — receipt on the left, editable fields and items table on the right, a confidence badge on every field, low-confidence rows highlighted with "please verify", totals block, "Confirm & Continue" gate. Nothing is calculated before this is confirmed.
6. Add People — add/remove 2–20 people with initials avatars.
7. Assign Items — each item row with person chips (one, several, or Everyone), live "shared by 2 · ₹300 each" feedback, and a modal for equal / custom-amount / percentage splits that refuses to save unless allocations add up to the item total.
8. Charges — subtotal, discount, tax, service charge, other charges, total, plus an expandable "How was this calculated?" showing the proportional maths.
9. Summary — big total card and an expandable per-person card (items, tax share, service share, total).
10. Settlement — who paid (one or several payers), and a clear "Aman owes Rahul ₹300" list.
11. Bill Details — receipt, items with who had them, calculation, settlement.
12. Bill History — search plus category filters (Food, Groceries, Shopping, Transport, Hotel, Other) and a status column.
13. People — person cards with bill count and amount shared.
14. Activity — timeline of uploads, reviews, splits, pending settlements.
15. Manual Entry — full bill form feeding the exact same split flow.
16. Settings and Help pages.

**Split maths (the core)**
- Items assigned to one person, several, or everyone; shared items split equally, by custom amount, or by percentage.
- Tax, service charge, other charges and discounts are spread in proportion to each person's own consumption — never divided equally.
- Payer and consumer are kept separate, so the person who paid gets what they're owed back.
- Rounding is balanced so the per-person totals always add up to the bill total exactly.
- Money shown as ₹ with Indian grouping (₹18,450).

**States and errors**
Friendly screens for unreadable or blurry bills, unsupported files, partial extraction, missing total, arithmetic that doesn't add up, duplicate items, allocations that don't match, and no people added — each with "Try Another Photo" / "Enter Bill Manually" style recovery. Plus empty states, skeleton loaders, toasts, confirm dialogs, tooltips, and form validation.

**Realistic demo data**
Urban Spice restaurant bill (Biryani ×2 ₹600, Pizza ₹900, Coke ×2 ₹160, Water ×2 ₹100) with tax, service charge and discount, four people (Rahul, Aman, Priya, Salaj), pre-made assignments, plus grocery, cab and other bills for history. All flows work end to end on this data.

## Technical notes

- All application code in `.jsx` / `.js` — components, pages, services, mock data. No TypeScript files authored. The one auto-generated router index file that ships with the project stays untouched.
- Structure follows your requested layout: `src/components/{layout,dashboard,upload,review,people,split,settlement,common}`, `src/pages`, `src/services/{api,billService,splitService}.js`, `src/data/{mockBills,mockPeople}.js`.
- Routing uses the project's built-in file router; each screen is a thin route file rendering its page component from `src/pages`, so pages stay portable.
- `services/api.js` centralises fetch calls behind promise-returning functions with simulated latency, so swapping in FastAPI endpoints later is a one-file change (base URL + real fetch); `splitService.js` is pure functions, framework-independent.
- Multi-step flow state (bill draft, people, assignments) held in a React context so each step reads and writes one source of truth.
- Design tokens (obsidian/panel/ink/muted/gold/high/mid/low, Manrope + JetBrains Mono, radii) go into the global stylesheet as semantic tokens; components use those tokens, never hardcoded colours. Fonts loaded via a link tag in the root document.
- Motion kept restrained: drop-zone pulse, staggered pipeline steps, card hover lift, modal fade, numbers easing in after calculation.
- Responsive checks at 1440 / 1024 / 768 / 390; accessible labels, keyboard-usable forms and dialogs, focus states.
- Per-page titles and descriptions for sharing.

## Build order

1. Tokens, fonts, shell (sidebar, header, mobile nav), common components.
2. Mock data + split engine + API service layer.
3. Home, Dashboard, History, People, Activity.
4. Upload → Processing → Review → People → Assign → Charges → Summary → Settlement flow.
5. Bill Details, Manual Entry, Settings, Help.
6. Error/empty/loading states, responsive and accessibility pass.
