import React, { useEffect, useState } from "react";
import {
  Landmark,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  Mail,
  Check,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  authConfigured,
  watchIdentity,
  loginAccount,
  registerAccount,
  resetAccount,
  logoutAccount,
  verifyAccount,
  authMessage,
  firebaseAuth,
} from "./auth-client";
function route() {
  return (
    { "#/register": "register", "#/forgot-password": "reset" }[location.hash] ||
    "login"
  );
}
export default function AuthScreen({ onDemo, theme, onTheme }) {
  const [view, setView] = useState(route),
    [identity, setIdentity] = useState(null),
    [loading, setLoading] = useState(authConfigured),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [show, setShow] = useState(false),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    function changed() {
      setView(route());
      setError("");
      setNotice("");
    }
    window.addEventListener("hashchange", changed);
    let unsubscribe;
    if (authConfigured) {
      try {
        unsubscribe = watchIdentity(
          (user) => {
            setIdentity(user);
            setLoading(false);
          },
          (e) => {
            setError(authMessage(e));
            setLoading(false);
          },
        );
      } catch (e) {
        setError(authMessage(e));
        setLoading(false);
      }
    }
    return () => {
      window.removeEventListener("hashchange", changed);
      unsubscribe?.();
    };
  }, []);
  function go(next) {
    location.hash =
      next === "register"
        ? "/register"
        : next === "reset"
          ? "/forgot-password"
          : "/login";
    setView(next);
    setError("");
    setNotice("");
  }
  async function action(operation, message) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await operation();
      if (message) setNotice(message);
    } catch (e) {
      setError(authMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    if (!authConfigured) {
      setError(
        "Account service is not connected. You can explore the local demo below. See docs/AUTHENTICATION.md for setup.",
      );
      return;
    }
    if (view === "register" && fields.password !== fields.confirm) {
      setError("Passwords do not match.");
      return;
    }
    await action(
      async () => {
        if (view === "reset") await resetAccount(fields.email);
        else if (view === "register") {
          await registerAccount(fields.name, fields.email, fields.password);
          setIdentity(firebaseAuth().currentUser);
          try {
            await verifyAccount();
            setNotice(
              "Account created. Check your email to verify your address. Workspace access still requires administrator approval.",
            );
          } catch {
            setNotice(
              "Account created, but the verification email could not be sent. Use Resend verification email below.",
            );
          }
          return;
        } else
          await loginAccount(
            fields.email,
            fields.password,
            fields.remember === "on",
          );
      },
      view === "reset"
        ? "If this address is registered, a password-reset email has been requested. Check your inbox."
        : "",
    );
  }
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <a className="brand" href="#/login" onClick={() => go("login")}>
          <span className="brand-symbol">
            <Landmark size={24} />
          </span>
          <span>
            qist<span className="brand-dot">.</span>
            <small>BUSINESS, IN BALANCE</small>
          </span>
        </a>
        <div className="auth-story-content">
          <span className="auth-kicker">
            A LITTLE CLARITY. A LOT OF POSSIBILITY.
          </span>
          <h2>
            Your business.
            <br />
            Beautifully
            <br />
            <em>in balance.</em>
          </h2>
          <p>
            A thoughtful workspace for your customers, contracts and
            collections. Built for the way you do business.
          </p>
          <div className="auth-story-card">
            <ShieldCheck size={25} />
            <div>
              <b>Clear terms. Stronger relationships.</b>
              <span>
                Fair installments. No late fees. Every rupee accounted for.
              </span>
            </div>
          </div>
        </div>
        <div className="auth-story-footer">
          Designed for Pakistan <span>PKR · Asia/Karachi</span>
        </div>
      </aside>
      <main className="auth-main">
        <button
          className="icon-btn auth-theme"
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          onClick={onTheme}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className="auth-form-card">
          <span className="eyebrow">YOUR QIST WORKSPACE</span>
          {loading ? (
            <h1>Checking your account…</h1>
          ) : identity ? (
            <>
              <h1>
                {identity.emailVerified
                  ? "You’re signed in."
                  : "Verify your email."}
              </h1>
              <p className="auth-subtitle">{identity.email}</p>
              <div className="auth-connection-note">
                <ShieldCheck size={21} />
                <div>
                  <b>
                    {identity.emailVerified
                      ? "Workspace access needs administrator approval"
                      : "Check your inbox for a verification email"}
                  </b>
                  <p>
                    Your identity is managed by Firebase. The secure
                    business-data gateway is not connected in this version, so
                    signing in does not grant access to customer or payment
                    records.
                  </p>
                </div>
              </div>
              {!identity.emailVerified && (
                <div className="auth-account-actions">
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={() =>
                      action(
                        verifyAccount,
                        "Verification email requested. Check your inbox.",
                      )
                    }
                  >
                    <Mail size={16} /> Resend verification email
                  </button>
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        await identity.reload();
                        setIdentity(firebaseAuth().currentUser);
                        setRevision((n) => n + 1);
                      }, "Verification status refreshed.")
                    }
                  >
                    I have verified my email
                  </button>
                </div>
              )}
              <button
                className="btn auth-submit"
                disabled={busy}
                onClick={() => action(() => logoutAccount(), "Signed out.")}
              >
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <>
              <h1>
                {view === "register"
                  ? "Start with a clearer view."
                  : view === "reset"
                    ? "Let’s get you back in."
                    : "Welcome back."}
              </h1>
              <p className="auth-subtitle">
                {view === "register"
                  ? "Create your account. An administrator must approve business access."
                  : view === "reset"
                    ? "Enter your account email to request a password-reset link."
                    : "Sign in to your business account, or explore the demo."}
              </p>
              {!authConfigured && (
                <div className="auth-setup-note">
                  <ShieldCheck size={17} />
                  <span>
                    Account service not connected yet. Demo access is available
                    below.
                  </span>
                </div>
              )}
              <form key={view} onSubmit={submit}>
                {view === "register" && (
                  <label className="field">
                    <span>Full name</span>
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={100}
                    />
                  </label>
                )}
                <label className="field">
                  <span>Email address</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@business.com"
                    required
                    maxLength={254}
                  />
                </label>
                {view !== "reset" && (
                  <>
                    <label className="field">
                      <span>Password</span>
                      <div className="password-control">
                        <input
                          name="password"
                          type={show ? "text" : "password"}
                          minLength={view === "register" ? 8 : undefined}
                          maxLength={128}
                          autoComplete={
                            view === "register"
                              ? "new-password"
                              : "current-password"
                          }
                          required
                        />
                        <button
                          type="button"
                          aria-label={show ? "Hide password" : "Show password"}
                          onClick={() => setShow(!show)}
                        >
                          {show ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </label>
                    {view === "register" && (
                      <label className="field">
                        <span>Confirm password</span>
                        <input
                          name="confirm"
                          type={show ? "text" : "password"}
                          autoComplete="new-password"
                          minLength={8}
                          maxLength={128}
                          required
                        />
                      </label>
                    )}
                    {view === "login" && (
                      <div className="auth-form-options">
                        <label>
                          <input name="remember" type="checkbox" /> Remember me
                        </label>
                        <button type="button" onClick={() => go("reset")}>
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </>
                )}
                <button className="btn primary auth-submit" disabled={busy}>
                  {busy
                    ? "Please wait…"
                    : view === "register"
                      ? "Create account"
                      : view === "reset"
                        ? "Send reset link"
                        : "Sign in"}
                  <ArrowRight size={17} />
                </button>
              </form>
              <p className="auth-route-link">
                {view === "register"
                  ? "Already have an account?"
                  : view === "reset"
                    ? "Remember your password?"
                    : "New to Qist?"}{" "}
                <button
                  onClick={() => go(view === "login" ? "register" : "login")}
                >
                  {view === "login" ? "Register an account" : "Back to sign in"}
                </button>
              </p>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="auth-notice" role="status">
              <Check size={17} />
              {notice}
            </p>
          )}
          <div className="auth-demo">
            <span>JUST EXPLORING?</span>
            <button className="btn" onClick={onDemo}>
              Explore local demo <ArrowRight size={17} />
            </button>
            <p>
              No account required. Sample data only.
              <br />
              Demo access does not sign you in.
            </p>
          </div>
        </div>
        <div className="auth-footer">
          Qist · A considered workspace for your business.
        </div>
      </main>
    </div>
  );
}
