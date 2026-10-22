# Architecture and acceptance plan

## Scope and phases

This repository starts with React UI and core local demonstration workflows plus a Workspace Apps Script foundation. It is not yet the complete production ERP in the supplied brief. The local adapter uses synthetic data and browser storage; it is explicitly not a Google Sheets mirror and must never be used as a real financial ledger. Deployed mode uses only google.script.run and the Sheets repository, with no local fallback.

1. Architecture/schema/permission design: this document and SCHEMA.md.
2. Apps Script foundation: configuration validation, schema setup, restricted Drive roots, Workspace identity, role checks, repository reads, customer registration, audit records. Requires real Workspace validation before production.
3. React UI: responsive dashboard, search, customers, products/inventory, contract calculator and schedules, collection flow, receipts, reporting, settings.
   4–9. Remaining production work: full server contract activation, recoverable payment ledger and reversals, document storage/branding/PDF, guarantor CRUD, managed staff invitations, report authorization/export, imports, reminders, verified backups/restore, migration adapters, quotas and concurrency testing. Unavailable integrations are presented as such rather than simulated success.

## Security decision before implementation

Use Google Workspace web app deployed as the accessing user within one organization. Session.getActiveUser().getEmail() must be nonempty and match an active Users row; otherwise deny. Never accept an email, role, or token from the client as identity. Admin setup is an editor-only function ending in underscore and uses the active editor identity. Google manages authentication, verification, password recovery and optional MFA. Workspace account administration handles invitations/recovery; there are no app passwords. Apps Script execute-as-user requires authorized operators to have underlying resource permissions: this does not meet the brief's strict no-direct-Sheets-access staff requirement. Therefore production deployment to staff is blocked until a trusted identity-verifying gateway/service account backend is implemented. Do not weaken this by deploying execute-as-owner and trusting client claims. Server RBAC remains mandatory. No demo data or local adapter is used inside Apps Script.

## Permissions

| Operation                                         | Super admin | Admin          | Staff                                                                      |
| ------------------------------------------------- | ----------- | -------------- | -------------------------------------------------------------------------- |
| Authorized dashboard, customers/products read     | Yes         | Yes            | Assigned records only (assignment filtering required before staff release) |
| Customer registration                             | Yes         | Yes            | Yes                                                                        |
| Product/customer edit; draft contract; activation | Yes         | Yes            | No                                                                         |
| Payment posting                                   | Yes         | Yes            | No                                                                         |
| Reversal / restore / integration configuration    | Yes         | No             | No                                                                         |
| Reports/export                                    | Yes         | Yes            | No                                                                         |
| Staff roles, permissions                          | Yes         | Delegated only | No                                                                         |

All permissions are server enforced. Current foundation permits only admin and super admin access until assignment filtering and protected storage are implemented. Local demo is a single synthetic admin workspace, not a role simulator.

## Finance and reliability

Use safe integer paisa, integer basis points and half-up rounding. Reject unsafe magnitudes, negatives and down payments exceeding cash price. Markup is one-time on remaining principal (default 3500 basis points). Distribute rounded installment amounts with a final remainder adjustment. Dates use ISO civil dates with month-end clamping relative to the original first due date. Never apply late fees. Production calculations must be rerun on the server, independent of client previews.

Planned production ledger: immutable activation/receivable events, payments, allocation and compensating reversal events; balances reconstructed from posted events. Payment idempotency key and payload digest must be unique. ScriptLock serializes posting; Sheets cannot guarantee multi-sheet transactions, so a durable journal/commit marker plus startup recovery and reconciliation is required before real posting. Do not expose partially committed rows or blindly retry irreversible actions. Current local demo serializes within one tab and does not provide financial concurrency guarantees. Server payments are deliberately unavailable until this requirement is met.

## Layout

src/: React components, styles, pure finance engine, adapter. apps-script/: server API/auth/setup/schema/repository. scripts/: Apps Script bundle packager. tests/: finance and browser checks. docs/: decisions, schema, deployment.

## Acceptance

Build and pure finance tests must pass. Browser tests cover mobile navigation, theme persistence, customer validation/duplicates, contract schedule sums, payment balance updates and receipt generation. Workspace acceptance additionally requires a real deployment, identity denial, role denial, setup rerun without data loss, restricted Drive permissions and schema mismatch rejection. These Google checks cannot be claimed from the local machine. Later production phases require concurrent/idempotent payment/reversal, crash recovery, import injection, backup/restore, quotas and staff access tests before launch.
