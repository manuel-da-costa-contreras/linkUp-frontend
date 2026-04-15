"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentIdToken,
  getFirebaseConfigError,
  getFirebaseConfigValidationError,
  getDefaultOrgId,
  initFirebaseAuthPersistence,
  isAuthEnabled,
  readUserClaims,
  registerWithBackend,
  signInWithEmail,
  signInWithGooglePopup,
  signOutFromFirebase,
  subscribeToIdTokenChanges,
} from "./firebase";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthUser = {
  uid: string;
  name: string;
  email: string;
  orgId: string;
  role: string;
};

const MUTATION_ROLES = ["OWNER", "ADMIN", "MANAGER"] as const;
const JOB_CREATE_ROLES = ["OWNER", "ADMIN", "MANAGER", "VIEWER"] as const;

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  authEnabled: boolean;
  authError: string | null;
  canMutateOrgData: boolean;
  canManageClients: boolean;
  canCreateJobs: boolean;
  canUpdateJobStatus: boolean;
  hasRole: (...roles: string[]) => boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const authEnabled = isAuthEnabled();
  const initialConfigError =
    authEnabled && typeof window !== "undefined" ? getFirebaseConfigValidationError() : null;
  const [status, setStatus] = useState<AuthStatus>(
    authEnabled ? (initialConfigError ? "unauthenticated" : "loading") : "authenticated"
  );
  const [user, setUser] = useState<AuthUser | null>(
    authEnabled
      ? null
      : {
          uid: "local-dev-user",
          name: "Local Admin",
          email: "local@linkup.dev",
          orgId: getDefaultOrgId(),
          role: "ADMIN",
        }
  );
  const [authError, setAuthError] = useState<string | null>(initialConfigError);

  useEffect(() => {
    if (!authEnabled) {
      return;
    }

    let active = true;
    const configError = getFirebaseConfigValidationError() ?? getFirebaseConfigError();
    if (configError) {
      queueMicrotask(() => {
        if (!active) {
          return;
        }

        setAuthError(configError);
        setStatus("unauthenticated");
      });
      return;
    }

    initFirebaseAuthPersistence().catch((error) => {
      if (!active) {
        return;
      }

      setAuthError(error instanceof Error ? error.message : "Could not initialize authentication.");
    });

    const unsubscribe = subscribeToIdTokenChanges(async (firebaseUser) => {
      if (!active) {
        return;
      }

      if (!firebaseUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      try {
        const claims = await readUserClaims(firebaseUser);
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName?.trim() || firebaseUser.email?.trim() || "LinkUP User",
          email: firebaseUser.email ?? "",
          orgId: claims.orgId,
          role: claims.role,
        });
        setStatus("authenticated");
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : "Could not read auth claims.");
        setStatus("unauthenticated");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authEnabled]);

  useEffect(() => {
    if (!authEnabled) {
      return;
    }

    async function handleUnauthorized() {
      try {
        const refreshed = await getCurrentIdToken(true);
        if (!refreshed) {
          await signOutFromFirebase();
        }
      } catch {
        await signOutFromFirebase();
      }
    }

    const listener = () => {
      void handleUnauthorized();
    };

    window.addEventListener("app:unauthorized", listener);
    return () => {
      window.removeEventListener("app:unauthorized", listener);
    };
  }, [authEnabled]);

  async function signInWithGoogle() {
    setAuthError(null);
    await signInWithGooglePopup();
  }

  async function signInWithEmailPassword(email: string, password: string) {
    setAuthError(null);
    await signInWithEmail(email, password);
  }

  async function signUpWithEmailPassword(name: string, email: string, password: string) {
    setAuthError(null);
    await registerWithBackend({
      name,
      email,
      password,
      orgId: getDefaultOrgId(),
    });
    await signInWithEmail(email, password);
  }

  async function signOut() {
    setAuthError(null);
    await signOutFromFirebase();
  }

  async function refreshToken() {
    return getCurrentIdToken(true);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      authEnabled,
      authError,
      canMutateOrgData: user ? MUTATION_ROLES.includes(user.role as (typeof MUTATION_ROLES)[number]) : !authEnabled,
      canManageClients: user ? MUTATION_ROLES.includes(user.role as (typeof MUTATION_ROLES)[number]) : !authEnabled,
      canCreateJobs: user ? JOB_CREATE_ROLES.includes(user.role as (typeof JOB_CREATE_ROLES)[number]) : !authEnabled,
      canUpdateJobStatus: user ? MUTATION_ROLES.includes(user.role as (typeof MUTATION_ROLES)[number]) : !authEnabled,
      hasRole: (...roles) => {
        if (!authEnabled) {
          return true;
        }

        if (!user) {
          return false;
        }

        return roles.includes(user.role);
      },
      signInWithGoogle,
      signInWithEmailPassword,
      signUpWithEmailPassword,
      signOut,
      refreshToken,
    }),
    [status, user, authEnabled, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
