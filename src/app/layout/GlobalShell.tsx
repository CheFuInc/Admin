import { Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toaster } from "../components/ui/sonner";
import { Button } from "../components/ui/button";
import { getFirebaseClientAuth, isFirebaseClientConfigured, shouldEnforceAdminAuth } from "../../lib/firebaseClient";

function isAdminClaims(claims: Record<string, unknown>): boolean {
  const role = typeof claims.role === "string" ? claims.role.toLowerCase() : "";
  return claims.admin === true || role === "admin" || role === "owner";
}

export function GlobalShell() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const enforceAdminAuth = shouldEnforceAdminAuth();
  const location = useLocation();

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!enforceAdminAuth) {
      setIsAdmin(true);
      setIsCheckingAccess(false);
      return;
    }

    if (!isFirebaseClientConfigured()) {
      setIsAdmin(false);
      setIsCheckingAccess(false);
      setAccessError("Missing Firebase client config env vars (VITE_FIREBASE_*).");
      return;
    }

    let active = true;
    const auth = getFirebaseClientAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) {
        return;
      }

      setCurrentUser(user);
      setAccessError(null);

      if (!user) {
        setIsAdmin(false);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult(true);
        if (!active) {
          return;
        }

        setIsAdmin(isAdminClaims(tokenResult.claims));
      } catch (error) {
        if (!active) {
          return;
        }
        setIsAdmin(false);
        setAccessError(error instanceof Error ? error.message : "Failed to validate admin access.");
      } finally {
        if (active) {
          setIsCheckingAccess(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (isCheckingAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h1 className="text-2xl font-semibold">Admin Access Required</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          You must be signed in with an account that has the Admin or Owner role to access this website.
        </p>
        {currentUser ? (
          <Button
            variant="outline"
            onClick={() => {
              void signOut(getFirebaseClientAuth());
            }}
          >
            Sign out
          </Button>
        ) : null}
        {accessError ? <p className="text-xs text-destructive">{accessError}</p> : null}
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full bg-background font-sans">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
