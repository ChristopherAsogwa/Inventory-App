# Stock Manager — Demo Narration Script
> Screen recording with iPhone microphone. Read at a calm, confident pace.
> Each `[ACTION]` cue tells you what to do on screen before or while speaking.

---

## INTRO (approx. 20 sec)

[ACTION: Show the app icon or home screen before opening the app]

> "Hi, I'm going to walk you through Stock Manager — a mobile inventory management app I built as part of my graduate project.
> The app is designed for small business owners who need a simple way to track their products, monitor stock levels, record sales, and understand their revenue and profit — all from their phone.
> Let me show you how it works from the very beginning."

---

## SECTION 1 — AUTHENTICATION (approx. 60 sec)

### 1a. Sign Up

[ACTION: Show the Sign Up screen]

> "When a new user opens the app for the first time, they land on the sign-in screen. Since we're starting fresh, I'll tap 'Create Account'."

[ACTION: Tap 'Create Account' — navigate to sign-up screen]

> "The sign-up screen asks for an email address and a password — minimum eight characters. The app validates the fields in real time so the user gets instant feedback before they even tap submit."

[ACTION: Type an email address — pause to show inline validation]

[ACTION: Type a password — pause to show helper text / validation]

> "Once the details are filled in, I tap 'Create Account'."

[ACTION: Tap Create Account]

### 1b. Email Verification

[ACTION: Show the email verification code screen]

> "The app uses Clerk for authentication, which means every new account is protected with email verification. A six-digit code is sent to the email address, and the user enters it here to confirm their identity."

[ACTION: Enter the 6-digit code]

> "That's it — the account is verified and the user is now authenticated."

---

## SECTION 2 — ONBOARDING (approx. 45 sec)

[ACTION: The app transitions to the onboarding screen — Step 1]

> "First-time users are taken through a quick two-step onboarding to personalise the app for their business."

> "Step one is simply naming the store. Whatever name is entered here shows up on the dashboard as the business title."

[ACTION: Type a store name — e.g. 'TechHub Store' — tap Continue]

[ACTION: Step 2 appears — low stock threshold input]

> "Step two sets a default low stock alert threshold. This tells the app: 'if any product falls below this quantity, flag it.' Every product can also have its own individual threshold, but this is the sensible default for the whole store."

[ACTION: Type a threshold number — e.g. '5' — tap 'Get Started']

> "And with that, the user is set up and taken straight to their dashboard."

---

## SECTION 3 — DASHBOARD (approx. 75 sec)

[ACTION: Dashboard loads — pause to let it render]

> "The dashboard is the home screen of the app. At the top, it greets the owner with their store name and today's date."

[ACTION: Point to / highlight the header and hero card]

> "The hero card at the top shows today's revenue and profit at a glance — so from the moment you open the app, you know how today is going."

[ACTION: Scroll down slightly to the This Month section]

> "Below that are the 'This Month' KPI cards — revenue, profit, number of sales, and average revenue per sale. These update in real time as new sales are recorded."

[ACTION: Scroll down to show the Stock Alerts section — if any low-stock items exist]

> "If any products are running low, they appear here in the Stock Alerts section. The count turns amber as a warning. We'll come back to this in a moment."

[ACTION: Scroll down to show Recent Sales]

> "And at the bottom, the five most recent sales are listed so the owner can keep track of what's been selling."

[ACTION: Scroll back to top, point to '+ Sale' button]

> "The '+ Sale' button in the top right is a quick way to record a new sale without switching tabs — we'll use that in a moment too."

> "The dashboard also supports pull-to-refresh, so all data stays up to date."

---

## SECTION 4 — PRODUCTS (approx. 90 sec)

[ACTION: Tap the Products tab]

> "The Products tab is where the owner manages their entire product catalogue."

[ACTION: Show the product list — scroll through a few cards]

> "Each product card shows the product name, SKU, category, selling price, current stock quantity, and — importantly — the profit margin. The margin badge turns red if a product is actually costing more than it's selling for, which is a useful signal for a business owner."

[ACTION: Tap the search bar and type a product name or SKU]

> "Products are searchable by name, SKU, or category. This makes it easy to find a specific item quickly even with a large catalogue."

[ACTION: Clear the search — tap the '+' FAB button]

> "To add a new product, I tap the plus button."

[ACTION: CreateProductModal opens — scroll through the form fields]

> "The form captures everything needed: the product name, a SKU for stock keeping, the selling price, the cost price — which is used to calculate profit — the current quantity, the category, and an optional low stock threshold specific to this product."

> "There's also an optional supplier name and contact — this is the field that powers one of the smarter features of the app, which I'll show shortly."

[ACTION: Fill in a product and tap 'Add Product']

> "Once saved, the product appears instantly in the list."

[ACTION: Tap an existing product to open EditProductModal]

> "Tapping any product opens the edit modal where you can update any field. There's also a delete option with a confirmation step to prevent accidents."

---

## SECTION 5 — RECORDING A SALE (approx. 60 sec)

[ACTION: Navigate to the Sales tab — tap the '+' FAB]

> "To record a sale, I tap the plus button on the Sales tab — or the '+ Sale' button on the dashboard."

[ACTION: RecordSaleModal opens — show the product search]

> "The record sale modal shows all products that currently have stock. I can search by name or SKU to find the right item quickly."

[ACTION: Select a product — show the quantity input appearing]

> "Once I select a product, a quantity field appears. The app knows the available stock and won't let me enter more than what's available."

[ACTION: Enter a quantity — show the preview card]

> "As I type the quantity, a live preview card calculates the total revenue and profit for this sale — so the owner can see the numbers before confirming."

[ACTION: Tap 'Confirm Sale']

> "Confirming the sale does three things: it records the sale to the database, it updates the product's stock quantity automatically, and the sale appears on the dashboard and in the sales history immediately."

---

## SECTION 6 — SALES HISTORY & ANALYTICS (approx. 75 sec)

[ACTION: Show the Sales tab with sales listed]

> "The Sales tab gives a full history of every sale, grouped by date so it's easy to scan."

[ACTION: Point to the summary bar at the top]

> "At the top, a summary bar shows the total revenue, profit, and number of sales for the selected period."

[ACTION: Tap the filter pills — Today, This Week, This Month, All Time]

> "These period pills let the owner filter the view — today's sales, this week, this month, or all time. The summary bar updates instantly."

[ACTION: Scroll through section headers showing per-day totals]

> "Each date section also shows its own revenue and profit subtotal, so it's easy to compare day by day."

[ACTION: Long-press a sale card to trigger delete confirmation]

> "If a sale was recorded by mistake, long-pressing opens a delete confirmation. The app is careful to note that deleting a sale does not automatically restore the product stock."

[ACTION: Tap 'Export CSV' button at the top]

> "For reporting or sharing with an accountant, the Export CSV button generates a file with all the sales data in the selected period — ready to open in Excel or Google Sheets."

---

## SECTION 7 — LOW STOCK ALERTS & SUPPLIER RECOMMENDATIONS (approx. 90 sec)

[ACTION: Navigate back to the Dashboard — tap a product in the Stock Alerts section]

> "Now let me show one of the more intelligent features of the app: low stock alerts with supplier recommendations."

[ACTION: LowStockAlert modal opens — point to the drag handle and status bar]

> "When a product falls below its threshold — or runs out completely — tapping it opens this alert sheet. The colour bar at the top immediately tells you the severity: amber for low stock, red for out of stock."

[ACTION: Point to the current supplier card]

> "If a supplier was recorded when the product was added, it shows here — their name, contact, and the cost price per unit. There's a direct contact button that opens a phone call or email, so the owner can reorder in one tap."

[ACTION: Scroll down to show 'Better Price Available' section — if visible]

> "Here's where it gets interesting. The app tracks supplier pricing per product SKU. If the same product — same SKU — was ever sourced from a different supplier at a lower price, it surfaces that as a recommendation here."

> "The business owner can see exactly how much they'd save per unit, and contact the cheaper supplier directly from the same screen. This turns a simple stock alert into a cost-saving tool."

[ACTION: Dismiss the modal]

---

## SECTION 8 — SETTINGS (approx. 45 sec)

[ACTION: Navigate to the Settings tab]

> "The Settings tab gives the owner control over their store configuration."

[ACTION: Point to the Store section]

> "They can update the store name and the default low stock threshold at any time. Changes are saved both locally on the device and to the cloud via Appwrite."

[ACTION: Point to the Account section]

> "The account section displays the logged-in email address."

[ACTION: Scroll to and point at the Sign Out button]

> "Signing out securely clears all local data from the device. The next time the user signs back in, the app re-fetches their store and product data from the cloud — so nothing is lost."

---

## SECTION 9 — CLOSING SUMMARY (approx. 40 sec)

[ACTION: Navigate back to Dashboard]

> "So to summarise what this app delivers:"

> "Secure authentication with email verification. A guided onboarding that configures the app for the specific business. Full product management — add, edit, delete, search. Real-time sales recording with stock auto-update. A dashboard that shows today's and this month's revenue and profit at a glance. Sales history with period filtering and CSV export. Intelligent low stock alerts with supplier recommendations to help reduce cost. And cloud-backed data via Appwrite so nothing is tied only to one device."

> "The app is built with Expo and React Native, uses Clerk for authentication, Appwrite for the database, and PostHog for analytics. It targets iOS and Android from a single codebase."

> "Thank you for watching."

---

## APPENDIX A — MVP ASSESSMENT

### Verdict: ✅ MVP Ready for Student Graduate Project

The app satisfies the core criteria for a viable product and a strong graduate submission:

| Criteria | Status |
|---|---|
| Real authentication (not mocked) | ✅ Clerk email/password + verification |
| Persistent cloud database | ✅ Appwrite with user-scoped data |
| Core CRUD operations | ✅ Products and Sales |
| Meaningful analytics | ✅ Revenue, profit, margin, KPI cards |
| Business logic beyond CRUD | ✅ Low stock alerts, supplier recommendations, CSV export |
| Cross-platform mobile | ✅ iOS + Android via Expo |
| Clean, consistent UI | ✅ NativeWind design system |
| Analytics / telemetry | ✅ PostHog event tracking |

---

## APPENDIX B — RECOMMENDED ADDITIONS (Post-MVP / Future Work)

These are not blockers for submission — they are honest suggestions for what would make the app stronger:

### High Value (would strengthen the project score)
1. **Push notifications** — alert the owner on their device when a product goes below threshold, even when the app is closed. Currently alerts only show inside the app.
2. **Barcode scanner** — use the device camera to scan a product barcode when adding/editing. Would replace manual SKU entry.
3. **Product image** — the `imageUrl` field exists on the Product model but image upload isn't surfaced in the create/edit form. Wiring this up would complete the feature.

### Medium Value (nice to demonstrate in discussion)
4. **Stock adjustment history** — a log of when and by how much each product's quantity changed (manual adjustment vs. sale).
5. **Multiple users / roles** — currently one account = one store. Adding staff accounts with view-only access would demonstrate thinking about real-world multi-user scenarios.
6. **Restock purchase recording** — a "restock" transaction type that increases stock and records the cost, giving a complete picture of inventory cost vs. revenue.

### Lower Priority (polish)
7. **Dark mode** — the design system uses semantic colour tokens so it would be relatively straightforward to add a dark theme.
8. **Offline support** — currently requires a network connection for Appwrite reads/writes. A basic offline queue would make the app more resilient.
9. **Currency locale setting** — the currency formatter is currently hardcoded. Allowing the user to select their currency in settings would make it globally usable.
