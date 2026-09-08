# Snap Split

Build a polished, production-quality frontend for a web application called "SplitSnap".

IMPORTANT TECHNOLOGY REQUIREMENT:

- Use React.js ONLY.

- Use .jsx files, NOT TypeScript.

- Do NOT create .tsx files.

- Do NOT convert the project to TypeScript.

- Use React functional components and hooks.

- Use a clean component-based architecture.

- The frontend should be ready to connect to a FastAPI backend later.

- For now, use realistic mock data/API service functions where backend endpoints are not available.

- Do not build the backend.

- Do not use a generic template-looking UI.

==================================================

CORE PROBLEM STATEMENT

==================================================

The application solves this problem:

"Split the Bill From a Photograph"

A group of people has a bill where different people consumed different items. For example, several people may share one food item, one person may have a drink, someone may leave early, and the bill may contain service charges and GST.

The user should be able to photograph or upload the bill, extract the bill information, identify who consumed which items, and calculate the correct amount each person owes.

The important part is NOT simply dividing the total bill equally.

The application must support:

1. Uploading/photographing a bill.

2. Extracting structured bill information.

3. Line items with:

   - item name

   - quantity

   - unit price

   - total price

4. Subtotal.

5. Taxes/GST.

6. Service charge.

7. Discounts.

8. Final total.

9. Assigning each item to:

   - one person

   - multiple people

   - everyone

10. Splitting shared items proportionally.

11. Distributing GST/tax proportionally according to each person's actual consumption.

12. Distributing service charges proportionally according to actual consumption.

13. Showing confidence for every extracted field.

14. Providing a review screen where a human can correct OCR/model mistakes BEFORE calculations happen.

15. Showing a detailed final breakdown of what each person owes.

IMPORTANT:

Do NOT make the UI specific to "trips", "travel", "Goa", or "group trips".

This is a GENERAL BILL-SPLITTING APPLICATION.

It can be used for:

- Restaurant bills

- Dinner

- Grocery bills

- Shopping

- Hotel bills

- Cab bills

- Party expenses

- Event expenses

- Household purchases

- Any receipt/bill that needs to be divided among people

The interface should therefore use words like:

"Bill", "Expense", "People", "Members", "Split", "Receipt", "Summary"

rather than forcing everything into a "Trip" concept.

==================================================

BRAND

==================================================

Application name:

SplitSnap

Tagline:

"Snap. Assign. Split."

Secondary description:

"Turn any bill into a fair, transparent split."

Create a modern visual identity around:

- smart bill processing

- fairness

- transparency

- simplicity

- AI/OCR

- expense splitting

The design should feel like a modern SaaS product, not a college project.

==================================================

DESIGN DIRECTION

==================================================

Create a beautiful, premium, modern SaaS interface.

Visual style:

- Minimal

- Clean

- Modern

- Professional

- Slightly playful

- High-quality fintech/productivity app aesthetic

- Strong typography

- Spacious layouts

- Beautiful cards

- Subtle shadows

- Rounded corners

- Smooth transitions

- Excellent empty states

- Excellent loading states

- Responsive design

Avoid:

- Overly colorful childish UI

- Excessive gradients

- Huge unnecessary illustrations

- Generic dashboard templates

- Clutter

- Too many cards everywhere

- Trip/travel imagery

- Stock-photo-heavy design

Use a consistent design system.

Primary visual focus should be the BILL and the SPLITTING PROCESS.

==================================================

GLOBAL NAVIGATION

==================================================

Create a responsive sidebar/navigation.

Logo:

SplitSnap

Snap. Assign. Split.

Navigation:

Dashboard

Bills

People

Activity

Bottom section:

Settings

Help

Top/right:

- Search

- Notifications

- User avatar/profile

On mobile:

- Use a bottom navigation or collapsible sidebar.

==================================================

SCREEN 1 — LANDING / HOME

==================================================

Create a beautiful home/dashboard screen.

Hero heading:

"Split bills without the headache."

Subtitle:

"Snap a bill, assign what everyone had, and let SplitSnap calculate exactly what each person owes."

Primary CTA:

"Upload a Bill"

Secondary CTA:

"Add Manually"

Below the hero, show a small interactive preview of a bill being processed.

Example visual:

Receipt

↓

AI Extraction

↓

Review

↓

Assign People

↓

Fair Split

Add a small trust statement:

"Your bill. Your rules. A fair split."

==================================================

SCREEN 2 — DASHBOARD

==================================================

Dashboard should NOT be trip-specific.

Heading:

"Your Bills"

Subtitle:

"Manage bills, people and outstanding splits in one place."

Top statistics:

Total Bills

Total Amount

Pending Settlements

People

Example:

12 Bills

₹18,450

₹3,200 Pending

8 People

Main CTA:

"+ Split a New Bill"

Secondary CTA:

"Add Manually"

Recent Bills section.

Each bill card should show:

Restaurant Dinner

₹2,400

4 people

Paid by Rahul

Food

2 min ago

Another:

Grocery Shopping

₹3,850

3 people

Paid by Priya

Groceries

Another:

Cab Ride

₹900

3 people

Paid by Aman

Transport

DO NOT call these trips.

==================================================

SCREEN 3 — UPLOAD BILL

==================================================

This should be one of the most polished screens.

Heading:

"Upload your bill"

Subtitle:

"Take a photo or upload an existing receipt. We'll extract the details for you."

Large drag-and-drop upload area.

Inside:

Camera icon

"Drop your bill here"

"or click to browse"

"JPG, PNG or PDF"

Button:

"Take a Photo"

Secondary:

"Choose File"

Show helpful tips:

For better results:

✓ Keep the entire bill visible

✓ Avoid glare

✓ Use good lighting

✓ Keep the camera straight

Also include a small link:

"Enter bill manually instead"

==================================================

SCREEN 4 — OCR PROCESSING

==================================================

After upload, show a beautiful processing state.

Heading:

"Reading your bill..."

Animated progress UI.

Steps:

✓ Image uploaded

✓ Detecting text

● Extracting items

○ Identifying charges

○ Preparing for review

Show the uploaded bill preview on the left.

On the right show:

"AI is analyzing your receipt"

"Finding items, prices, taxes and charges."

Do NOT instantly jump to results.

Make this feel like a real AI processing pipeline.

==================================================

SCREEN 5 — REVIEW EXTRACTED BILL

==================================================

THIS IS ONE OF THE MOST IMPORTANT SCREENS.

The problem statement specifically requires a human review step before arithmetic happens.

Create a two-column layout.

LEFT:

Original receipt image.

RIGHT:

Extracted structured bill.

Header:

"Review your bill"

Subtitle:

"Check the extracted information before we calculate the split."

Show a confidence indicator for EVERY extracted field.

Example:

Merchant

ABC Restaurant

High confidence ✓ 98%

Date

08 Sep 2026

High confidence ✓ 96%

Subtotal

₹2,160

Medium confidence ⚠ 81%

GST

₹240

High confidence ✓ 94%

Service Charge

₹500

Low confidence ⚠ 67%

Total

₹2,400

High confidence ✓ 99%

Allow every field to be edited.

For low-confidence fields, visually highlight them and display:

"Please verify this value."

==================================================

EXTRACTED ITEMS TABLE

==================================================

Create a beautiful editable table.

Columns:

Item

Qty

Unit Price

Total

Confidence

Example:

Biryani

2

₹300

₹600

98%

Pizza

1

₹900

₹900

94%

Coke

2

₹80

₹160

72%

Allow:

- Edit item

- Edit quantity

- Edit price

- Delete item

- Add item

Button:

"+ Add Item"

At bottom:

Subtotal

GST

Service Charge

Discount

Total

Make sure the total is visually prominent.

Primary button:

"Confirm & Continue"

Do NOT perform the split until the user confirms this screen.

==================================================

SCREEN 6 — ADD PEOPLE

==================================================

After confirming the bill:

Heading:

"Who's splitting this bill?"

Subtitle:

"Add the people involved in this bill."

Allow 2–20 people.

Example:

Rahul

Aman

Priya

Salaj

Each person should have:

- avatar/initial

- name

- remove button

Input:

"Enter a name"

Button:

"+ Add Person"

Primary CTA:

"Continue"

Also allow:

"Skip & add later"

Do NOT call this a trip or trip members.

Use "People".

==================================================

SCREEN 7 — ASSIGN ITEMS

==================================================

This should be the most interactive screen.

Heading:

"Who had what?"

Subtitle:

"Assign each item to the people who consumed it."

Show bill items as cards/table rows.

Example:

Biryani

₹600

[ Rahul ] [ Aman ] [ Priya ] [ Salaj ]

Allow selecting:

- one person

- multiple people

- everyone

When multiple people are selected:

Show:

"Shared by 2 people"

"₹300 each"

For example:

Biryani ₹600

Rahul ✓

Aman ✓

Automatically calculate:

₹300 Rahul

₹300 Aman

For Coke:

Coke ₹160

Rahul

Aman

Priya ✓

Show:

"₹160 assigned to Priya"

Also provide quick action:

"Everyone"

==================================================

SHARED ITEM SPLITTING

==================================================

If an item is shared by multiple people, allow:

Equal split

Custom split

Percentage split

Example:

Biryani ₹600

Equal:

Rahul ₹300

Aman ₹300

Custom:

Rahul ₹400

Aman ₹200

Percentage:

Rahul 66.67%

Aman 33.33%

Create a clean modal for custom allocation.

Validate that allocations equal the item total.

==================================================

SCREEN 8 — BILL CHARGES

==================================================

Create a dedicated section for:

Subtotal

Discount

GST / Tax

Service Charge

Other Charges

Final Total

Explain visually:

"Taxes and service charges are distributed proportionally based on each person's actual consumption."

Example:

Food consumed:

Rahul ₹600

Aman ₹300

Priya ₹260

GST:

₹120

Automatically distribute:

Rahul ₹51.43

Aman ₹25.71

Priya ₹42.86

Do NOT divide GST equally among everyone.

This is a core requirement.

Add an expandable "How was this calculated?" section.

==================================================

SCREEN 9 — FINAL CALCULATION

==================================================

Heading:

"Your split is ready"

Show a large summary card:

Total Bill

₹2,400

People

4

Then each person's result:

Rahul

Items: ₹600

GST: ₹51.43

Service: ₹XX

Total: ₹XXX

Aman

Items: ₹300

GST: ₹XX

Service: ₹XX

Total: ₹XXX

Priya

Items: ₹260

GST: ₹XX

Service: ₹XX

Total: ₹XXX

Salaj

Items: ₹XXX

GST: ₹XX

Service: ₹XX

Total: ₹XXX

Make each person's card expandable.

==================================================

SCREEN 10 — PAYMENT / SETTLEMENT

==================================================

If one person paid the full bill, support:

"Who paid?"

Example:

Paid by:

Rahul

Then calculate:

Rahul paid:

₹2,400

Rahul's actual share:

₹600

Rahul should receive:

₹1,800

Show settlement clearly.

Example:

Aman owes Rahul ₹300

Priya owes Rahul ₹260

Salaj owes Rahul ₹240

Create a visually appealing "Who owes whom" section.

Also support situations where multiple people paid.

==================================================

SCREEN 11 — BILL DETAILS

==================================================

Create a detailed bill page.

Header:

Restaurant Dinner

₹2,400

Food

Paid by Rahul

4 people

Sections:

Receipt

Items

People

Calculation

Settlement

Receipt preview.

Items:

Biryani

₹600

Rahul + Aman

Pizza

₹900

Everyone

Coke

₹160

Priya

Then:

Subtotal

Discount

GST

Service Charge

Total

Then individual breakdown.

==================================================

SCREEN 12 — BILL HISTORY

==================================================

Heading:

"Bill History"

Search bar:

"Search bills..."

Filters:

All

Food

Groceries

Shopping

Transport

Hotel

Other

Each row:

Bill Name

Date

Amount

People

Paid By

Status

Example:

Dinner

08 Sep

₹2,400

4 people

Rahul

Settled

Grocery

07 Sep

₹3,850

3 people

Priya

Pending

==================================================

SCREEN 13 — PEOPLE

==================================================

Create a people management screen.

Heading:

"People"

Subtitle:

"Keep track of people you frequently split bills with."

Person cards:

Rahul

12 bills

₹4,850 shared

Priya

8 bills

₹3,200 shared

Aman

6 bills

₹2,100 shared

Allow:

+ Add Person

But don't overcomplicate this into a social network.

==================================================

SCREEN 14 — ACTIVITY

==================================================

Show recent activity:

Bill uploaded

"Restaurant Dinner"

Bill reviewed

"Restaurant Dinner"

Split completed

"₹2,400 split among 4 people"

Settlement pending

"Priya owes Rahul ₹260"

Use clean timeline cards.

==================================================

IMPORTANT UX FEATURE — CONFIDENCE

==================================================

Confidence should be visible throughout the OCR/review experience.

Use:

High confidence:

✓ 95–100%

Medium:

⚠ 80–94%

Low:

⚠ Below 80%

Do not make confidence just a decorative percentage.

Low-confidence fields should require attention.

For example:

"Service Charge"

₹500

⚠ Low confidence — Please verify

Make the UI communicate that human review is intentionally part of the system.

==================================================

IMPORTANT UX FEATURE — ERROR HANDLING

==================================================

Create polished states for:

1. Invalid image

2. Blurry bill

3. Bill not readable

4. OCR partially failed

5. Missing total

6. Incorrect arithmetic

7. Duplicate items

8. Allocation doesn't equal item total

9. No people added

10. Unsupported file format

Example:

"We couldn't confidently read this bill."

Buttons:

"Try Another Photo"

"Enter Bill Manually"

Never show ugly technical errors.

==================================================

IMPORTANT UX FEATURE — MANUAL ENTRY

==================================================

Create a complete manual bill flow.

Heading:

"Enter bill manually"

Fields:

Bill name

Merchant

Date

Items

Each item:

Name

Quantity

Unit Price

Total

Then:

Discount

GST

Service Charge

Other Charges

Total

Button:

"Continue to Split"

Manual entry must use the same split engine UI as OCR-generated bills.

==================================================

RESPONSIVE DESIGN

==================================================

Desktop:

- Sidebar

- Main content

- Spacious two-column layouts where appropriate

Tablet:

- Collapsible sidebar

Mobile:

- Bottom navigation

- Full-width cards

- Mobile-friendly bill table

- Large touch targets

- Camera upload prominently accessible

The application must look excellent at:

1440px

1024px

768px

390px

==================================================

ANIMATIONS

==================================================

Use subtle animations only.

Examples:

- Upload drop-zone animation

- OCR processing animation

- Progress transitions

- Card hover

- Modal transitions

- Success confirmation

- Split calculation transition

Do NOT overanimate.

==================================================

COMPONENT ARCHITECTURE

==================================================

Use reusable React JSX components.

Suggested structure:

src/

  components/

    layout/

      Sidebar.jsx

      Header.jsx

      MobileNav.jsx

    dashboard/

      StatCard.jsx

      RecentBills.jsx

      BillCard.jsx

      CategorySummary.jsx

    upload/

      BillUploader.jsx

      UploadPreview.jsx

      ProcessingState.jsx

    review/

      BillPreview.jsx

      ExtractedBill.jsx

      ConfidenceBadge.jsx

      EditableField.jsx

      BillItemsTable.jsx

    people/

      PersonCard.jsx

      PersonSelector.jsx

      AddPersonModal.jsx

    split/

      ItemAssignment.jsx

      SplitMethodSelector.jsx

      CustomSplitModal.jsx

      ChargeDistribution.jsx

      CalculationBreakdown.jsx

    settlement/

      SettlementCard.jsx

      WhoOwesWhom.jsx

    common/

      Button.jsx

      Modal.jsx

      Badge.jsx

      EmptyState.jsx

      LoadingState.jsx

      Toast.jsx

  pages/

    Dashboard.jsx

    UploadBill.jsx

    ReviewBill.jsx

    AddPeople.jsx

    AssignItems.jsx

    BillSummary.jsx

    BillDetails.jsx

    BillHistory.jsx

    People.jsx

    Activity.jsx

    Settings.jsx

  services/

    api.js

    billService.js

    splitService.js

  data/

    mockBills.js

    mockPeople.js

  App.jsx

  main.jsx

Again:

ALL FILES MUST BE .jsx OR .js.

NO .tsx FILES.

NO TypeScript.

==================================================

MOCK DATA

==================================================

Create realistic mock data so the UI feels complete immediately.

Use a restaurant bill as the main demo because it represents the assignment perfectly.

Example:

Restaurant:

"Urban Spice"

Items:

Biryani

Quantity: 2

Unit price: ₹300

Total: ₹600

Pizza

Quantity: 1

Unit price: ₹900

Total: ₹900

Coke

Quantity: 2

Unit price: ₹80

Total: ₹160

Water

Quantity: 2

Unit price: ₹50

Total: ₹100

Include:

Subtotal

GST

Service Charge

Discount

Total

People:

Rahul

Aman

Priya

Salaj

Create realistic assignments.

Example:

Biryani → Rahul + Aman

Coke → Priya

Water → Everyone

Pizza → Rahul + Aman + Priya + Salaj

Use the mock data to demonstrate proportional GST and service-charge calculations.

==================================================

IMPORTANT GENERALIZATION

==================================================

Although the main demonstration can be a restaurant bill, the architecture and UI must NOT be restaurant-specific.

The same UI must support:

Restaurant:

"Who ate what?"

Groceries:

"Who used what?"

Hotel:

"Who stayed?"

Cab:

"Who travelled?"

Shopping:

"Who bought what?"

Party:

"Who consumed what?"

Household:

"Who should share this expense?"

Therefore use a generic concept:

"Who consumed / benefited from this expense?"

Do NOT hard-code restaurant terminology throughout the application.

==================================================

VISUAL DETAILS

==================================================

Create:

- Beautiful empty states

- Skeleton loading

- Toast notifications

- Confirmation dialogs

- Tooltips

- Hover states

- Keyboard-friendly forms

- Accessible labels

- Proper validation

- Clear error states

Currency:

Use Indian Rupees ₹.

Numbers:

Use Indian number formatting.

Example:

₹18,450

₹2,400

==================================================

FINAL USER FLOW

==================================================

The complete UX flow must be:

Dashboard

   ↓

Upload Bill

   ↓

Upload/Camera

   ↓

OCR Processing

   ↓

Extracted Bill

   ↓

Human Review

   ↓

Correct Low Confidence Fields

   ↓

Confirm Bill

   ↓

Add People

   ↓

Assign Items

   ↓

Choose Split Rules

   ↓

Calculate Proportional GST/Charges

   ↓

Final Breakdown

   ↓

Who Owes Whom

   ↓

Save Bill

   ↓

Bill History / Dashboard

==================================================

MOST IMPORTANT PRODUCT PRINCIPLES

==================================================

1. Never blindly trust OCR.

2. Always provide human review.

3. Never simply divide the total by number of people.

4. Items can belong to one, several, or everyone.

5. Shared items can use different split methods.

6. Taxes and service charges should be distributed proportionally based on actual consumption.

7. Payer and consumer are separate concepts.

8. The application should work for ANY type of shared bill.

9. The interface should make the calculation transparent.

10. The user should always understand why they owe a particular amount.

==================================================

FINAL UI QUALITY BAR

==================================================

The result should look like a real startup/SaaS product that could be shown in a placement/project interview.

It should NOT look like:

- a basic CRUD application

- a generic admin dashboard

- a restaurant-only bill splitter

- a simple calculator

- a college assignment template

It SHOULD look like:

"An AI-powered receipt understanding and intelligent expense allocation product."

Prioritize:

UI quality

UX clarity

component reusability

responsive design

accessibility

clean React architecture

realistic mock data

smooth interaction

clear calculation visualization

Build the complete frontend with working navigation and interactions between the screens.

Use React JSX strictly.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/55270eec-39df-4d86-9892-4bde7fbdec32).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
