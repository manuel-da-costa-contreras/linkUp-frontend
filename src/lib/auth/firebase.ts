import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  getAuth,
  onIdTokenChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const defaultOrgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID ?? "acme";
const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false";

type AuthClaims = {
  orgId: string;
  role: string;
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let persistenceInitialized = false;

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function getFirebaseConfig() {
  return {
    apiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    appId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
    messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  };
}

function ensureFirebaseApp() {
  if (appInstance) {
    return appInstance;
  }

  const config = getFirebaseConfig();
  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase config: ${missingKeys.join(", ")}.`);
  }

  appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
  return appInstance;
}

export function isAuthEnabled() {
  return authEnabled;
}

export function getDefaultOrgId() {
  return defaultOrgId;
}

export function getFirebaseAuth() {
  if (!authEnabled || typeof window === "undefined") {
    return null;
  }

  if (authInstance) {
    return authInstance;
  }

  authInstance = getAuth(ensureFirebaseApp());
  return authInstance;
}

export async function initFirebaseAuthPersistence() {
  const auth = getFirebaseAuth();
  if (!auth || persistenceInitialized) {
    return;
  }

  await setPersistence(auth, browserLocalPersistence);
  persistenceInitialized = true;
}

export async function signInWithGooglePopup() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Authentication is disabled.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  await signInWithPopup(auth, provider);
}

export async function signOutFromFirebase() {
  const auth = getFirebaseAuth();
  if (!auth) {
    return;
  }

  await signOut(auth);
}

export function subscribeToIdTokenChanges(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onIdTokenChanged(auth, callback);
}

export async function getCurrentIdToken(forceRefresh = false) {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser ?? null;

  if (!user) {
    return null;
  }

  return user.getIdToken(forceRefresh);
}

export async function readUserClaims(user: User): Promise<AuthClaims> {
  const tokenResult = await user.getIdTokenResult();
  const claims = tokenResult.claims as Record<string, unknown>;

  const claimOrgId = firstString(claims, ["orgId", "org_id"]);
  const claimRole = firstString(claims, ["role", "orgRole", "org_role"]);

  return {
    orgId: claimOrgId || defaultOrgId,
    role: claimRole || "USER",
  };
}

function firstString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}
