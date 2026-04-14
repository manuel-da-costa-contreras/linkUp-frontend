"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentIdToken,
  getDefaultOrgId,
  initFirebaseAuthPersistence,
  isAuthEnabled,
  readUserClaims,
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

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  authEnabled: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const authEnabled = isAuthEnabled();
  const [status, setStatus] = useState<AuthStatus>(authEnabled ? "loading" : "authenticated");
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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!authEnabled) {
      return;
    }

    let active = true;

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

  async function signIn() {
    setAuthError(null);
    await signInWithGooglePopup();
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
      signIn,
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
