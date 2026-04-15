import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  getAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
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

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  orgId: string;
};

type RegisterErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let persistenceInitialized = false;
let firebaseConfigError: string | null = null;

export class AuthRegistrationError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
    message: string
  ) {
    super(message);
    this.name = "AuthRegistrationError";
  }
}

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
  };
}

function resolveMissingConfigKeys(config: ReturnType<typeof getFirebaseConfig>) {
  return Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function getFirebaseConfigValidationError() {
  const missingKeys = resolveMissingConfigKeys(getFirebaseConfig());
  if (missingKeys.length === 0) {
    return null;
  }

  return `Missing Firebase config: ${missingKeys.join(", ")}.`;
}

function ensureFirebaseApp() {
  if (appInstance) {
    return appInstance;
  }

  const config = getFirebaseConfig();
  const missingKeys = resolveMissingConfigKeys(config);

  if (missingKeys.length > 0) {
    firebaseConfigError = `Missing Firebase config: ${missingKeys.join(", ")}.`;
    throw new Error(firebaseConfigError);
  }

  appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
  firebaseConfigError = null;
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

  try {
    authInstance = getAuth(ensureFirebaseApp());
    return authInstance;
  } catch {
    return null;
  }
}

export function getFirebaseConfigError() {
  return firebaseConfigError;
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

export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Authentication is disabled.");
  }

  await signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithBackend(input: RegisterInput) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (response.ok) {
    return;
  }

  throw await toAuthRegistrationError(response);
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
  const normalizedRole = normalizeRole(claimRole);

  return {
    orgId: claimOrgId || defaultOrgId,
    role: normalizedRole || "VIEWER",
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

function normalizeRole(value: string) {
  const upper = value.trim().toUpperCase();
  if (!upper) {
    return "";
  }

  if (upper === "USER") {
    return "VIEWER";
  }

  return upper;
}

async function toAuthRegistrationError(response: Response) {
  try {
    const payload = (await response.json()) as RegisterErrorPayload;
    const code = payload.error?.code ?? null;
    const message = payload.error?.message ?? payload.message ?? `Request failed with status ${response.status}`;
    return new AuthRegistrationError(response.status, code, message);
  } catch {
    return new AuthRegistrationError(response.status, null, `Request failed with status ${response.status}`);
  }
}
