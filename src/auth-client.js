import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};
export const authConfigured = Object.values(config).every(Boolean);
let instance;
export function firebaseAuth() {
  if (!authConfigured)
    throw new Error(
      "Account sign-in is not connected yet. Configure Firebase using docs/AUTHENTICATION.md. You can explore the local demo without an account.",
    );
  if (!instance) instance = getAuth(getApps()[0] || initializeApp(config));
  return instance;
}
export function watchIdentity(callback, onError) {
  return onAuthStateChanged(firebaseAuth(), callback, onError);
}
export async function loginAccount(email, password, remember) {
  const auth = firebaseAuth();
  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence,
  );
  return signInWithEmailAndPassword(auth, email, password);
}
export async function registerAccount(name, email, password) {
  const auth = firebaseAuth();
  await setPersistence(auth, browserSessionPersistence);
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name.trim() });
  return result.user;
}
export function verifyAccount() {
  return sendEmailVerification(firebaseAuth().currentUser);
}
export function resetAccount(email) {
  return sendPasswordResetEmail(firebaseAuth(), email);
}
export function logoutAccount() {
  return signOut(firebaseAuth());
}
export function authMessage(error) {
  return (
    {
      "auth/invalid-credential": "The email or password is incorrect.",
      "auth/email-already-in-use":
        "This email is already registered. Sign in or reset your password.",
      "auth/weak-password":
        "Choose a stronger password (at least 8 characters).",
      "auth/too-many-requests":
        "Too many attempts. Please wait before trying again.",
      "auth/network-request-failed":
        "Unable to reach the account service. Check your internet connection.",
      "auth/operation-not-allowed":
        "Email/password sign-in must be enabled by your Firebase administrator.",
      "auth/invalid-api-key":
        "The Firebase configuration is not valid. Ask the administrator to check it.",
    }[error.code] ||
    "The account request could not be completed. Please try again or contact the administrator."
  );
}
