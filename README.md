# Qist — installment business workspace

Responsive React 19 application with light/dark themes, PKR currency, Asia/Karachi dates, a synthetic local demo, and a Google Apps Script foundation. Built from the supplied Advanced Installment Management & Business ERP brief. This is the first testable delivery, not the complete production financial system.

## Run locally

Node.js 24 and npm 11 were used.

```sh
npm ci
npm run dev
```

Open the development server in your own local environment. The cloud onboarding interface does not expose a web preview. Data in local mode is **synthetic, stored only in this browser**. Do not enter real customer identity or financial data. It is not synchronized to Sheets. To clear only the demo records, remove the `qist-demo-v1` localStorage key in browser developer tools. Theme is stored separately as `qist-theme`.

## What works in the browser

- Dashboard derived from actual demo records, collection-period control, collection chart, receivable balances and alerts.
- Customer creation with optional, unrestricted CNIC, required-field/mobile checks, search, pagination and profile views.
- Product/inventory browsing with low-stock indicators (no stock mutations).
- Single-product demo contracts with exact integer-paisa calculations, 6/12/18/24-month schedules and month-end dates.
- Full, partial, advance and settlement demo payments, oldest-first allocation, overpayment rejection, payment history, PDF download, print, WhatsApp/email summary previews and native file sharing with download fallback.
- Receivables aging, payment CSV export, business settings, activity log, mobile drawer, collapsible sidebar and persistent themes.
- Login, registration, email verification, remember-me, password recovery and sign-out pages using configurable Firebase Authentication. Unconfigured account actions explain setup instead of pretending to succeed. Demo entry is separate.
- Clear integration status for services that are not enabled. No simulated backup success, file uploads or external payments.

The demo is single-tab and not a production financial ledger. It does not implement multi-product contracts, reversals, full customer/guarantor profiles, full receipt/statement requirements, attachments, staff management, import, XLSX, automatic PDFs, backup/restore or reminders. The permission matrix and pending phases are documented in [architecture](docs/ARCHITECTURE.md).

## Validate

```sh
npm test
npm run build
# Uses the installed /usr/bin/chromium in this cloud environment.
npm run test:browser
```

For another machine, set `QIST_CHROMIUM_PATH` to your installed Chromium executable. Browser tests use isolated storage and cover both desktop and mobile.

`npm run build` produces `dist/` for the local demo and `.gas-build/` for Apps Script. The latter embeds compiled React/CSS into `Index.html`; no separate hosting or CORS workaround is needed. See [deployment](docs/DEPLOYMENT.md), [schema](docs/SCHEMA.md), and [architecture](docs/ARCHITECTURE.md) before deploying.

## Accounts and receipt sharing

The initial screen is Sign in. Choose **Explore local demo** to continue without an account. Use **Register an account** or **Forgot password?** for the account pages. Real account actions require Firebase Web app configuration in an ignored `.env.local` file; see [account setup](docs/AUTHENTICATION.md). Firebase identities do not authorize business-data access in this phase.

Open **Payment History → Receipt** for Download PDF, Print receipt, WhatsApp, Email and Share PDF. WhatsApp/email open a summary composer after a preview; they do not send automatically or attach the PDF. Download and attach it manually, or use Share PDF on a browser that supports native file sharing.
