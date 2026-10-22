# Account sign-in and registration

Login, registration, password visibility, confirmation, remember-me, email verification, password recovery and sign-out use Firebase Authentication's client SDK. No application password database is created. Demo entry is explicitly separate and is not authentication. A demo session marker grants access only to synthetic local browser data, never the Google backend.

## Enable real account actions

1. In the Firebase console, create or select your project and register a Web app.
2. In Authentication → Sign-in method, enable Email/Password. Configure an appropriate password policy and email enumeration protection; use at least eight characters.
3. Add localhost and your final hosting domain in Authentication → Settings → Authorized domains. Customize verification and reset email templates and configure your organization's sender settings.
4. Copy `.env.example` to `.env.local` in the app folder. Fill in the three Firebase **Web app configuration** fields from Project Settings. These are public client configuration, not service-account credentials. Never place admin keys or passwords in VITE\_ variables or chat. The `.env.local` file is ignored by Git.
5. Restart `npm run dev`, or rebuild before deploying. Existing built files do not pick up later environment edits.
6. Register a test account, confirm receipt of a verification email, verify, sign out, sign in, test remember-me and request a reset email. Test disabled accounts and incorrect credentials in your own Firebase project. These live-provider checks have not been executed without your project configuration.

An authenticated Firebase account currently receives an account-status page, **not business-data access**. Registration does not make a user an administrator. To meet the original invitation-only requirement, a trusted backend must validate invitation/approval and deny unapproved identities. If public auth-account creation is undesirable, disable client sign-up and provision accounts through your administrator until that service exists.

## Production business access remains separate

The existing Apps Script foundation uses Google Workspace identity, not a Firebase token supplied by the browser. It ignores demo entry and Firebase user state. Never accept client email, role, local session markers or decoded/unverified Firebase tokens as backend authentication. A trusted gateway using the Firebase Admin SDK must verify ID tokens (including revocation/disabled status), email verification, invitation/active-user status and every operation's authorization before enabling production business data. It must use protected service credentials and give staff no direct spreadsheet permissions. This gateway is not implemented in this patch; staff/real-financial release remains blocked.

## Receipt sharing

In Payment History or Vouchers & receipts, open a receipt. Download PDF creates a real PDF locally. WhatsApp and Email show a preview and open a user-controlled summary composer; they do not automatically send messages or attach files. Share PDF uses the device's native file-share API when supported and otherwise downloads the file with instructions. The user can attach a downloaded PDF manually. WhatsApp/email applications and browser support vary. Automated provider sending and Google document authorization are not enabled.

CNIC is now optional in both local and Apps Script customer registration. Format and duplicate-CNIC blocking have been removed at the user's request. CNIC remains text, is masked in lists when present, and is omitted from receipt sharing. Other required customer fields and phone validation are unchanged. Administrators must review identity duplicates manually before creating real contracts.
