import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { multiFactor, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { LoaderCircle, ShieldAlert, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toaster } from "../components/ui/sonner";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { getFirebaseClientAuth, isFirebaseClientConfigured, shouldEnforceAdminAuth } from "../../lib/firebaseClient";

const ADMIN_ACCESS_ERROR = "This account does not have admin access.";

function isAdminClaims(claims: Record<string, unknown>): boolean {
    const role = typeof claims.role === "string" ? claims.role.toLowerCase() : "";
    return claims.admin === true || role === "admin" || role === "owner";
}

export function GlobalShell() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signInError, setSignInError] = useState<string | null>(null);
    const [accessError, setAccessError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showMfaWarning, setShowMfaWarning] = useState(false);
    const [isMfaBannerDismissed, setIsMfaBannerDismissed] = useState(false);
    const enforceAdminAuth = shouldEnforceAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();

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
                setShowMfaWarning(false);
                setIsCheckingAccess(false);
                return;
            }

            try {
                const tokenResult = await user.getIdTokenResult(true);
                if (!active) {
                    return;
                }

                const hasAdminAccess = isAdminClaims(tokenResult.claims);
                setIsAdmin(hasAdminAccess);
                if (!hasAdminAccess) {
                    setShowMfaWarning(false);
                    setIsMfaBannerDismissed(false);
                    setAccessError(ADMIN_ACCESS_ERROR);
                    void signOut(auth);
                } else {
                    const mfaFactors = multiFactor(user).enrolledFactors;
                    setShowMfaWarning(mfaFactors.length === 0);
                    if (mfaFactors.length > 0) {
                        setIsMfaBannerDismissed(false);
                    }
                }
            } catch (error) {
                if (!active) {
                    return;
                }
                setIsAdmin(false);
                setShowMfaWarning(false);
                setIsMfaBannerDismissed(false);
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
    }, [enforceAdminAuth]);

    const handleSignOut = () => {
        void signOut(getFirebaseClientAuth());
    };

    const handleAdd2FAClick = () => {
        navigate("/account/settings");
    };

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSignInError(null);
        setIsSigningIn(true);

        try {
            const auth = getFirebaseClientAuth();
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (error) {
            setSignInError(error instanceof Error ? error.message : "Sign in failed.");
        } finally {
            setIsSigningIn(false);
            setPassword("");
        }
    };

    if (isCheckingAccess) {
        return (
            <div className="flex h-screen items-center justify-center bg-muted/20 p-6">
                <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Checking access</p>
                            <p className="text-xs text-muted-foreground">
                                Verifying your admin permissions...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        const isConfigured = isFirebaseClientConfigured();

        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
                <h1 className="text-2xl font-semibold">Admin Sign In</h1>
                <p className="max-w-md text-sm text-muted-foreground">
                    Sign in with an account that has the Admin or Owner role to access this website.
                </p>
                {!isConfigured ? (
                    <p className="max-w-md text-xs text-destructive">
                        Missing Firebase client configuration. Set the required `VITE_FIREBASE_*` variables.
                    </p>
                ) : null}
                {!currentUser && isConfigured ? (
                    <form className="mt-2 flex w-full max-w-sm flex-col gap-3 text-left" onSubmit={handleSignIn}>
                        <label className="text-xs font-medium text-muted-foreground" htmlFor="admin-email">
                            Email
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <label className="text-xs font-medium text-muted-foreground" htmlFor="admin-password">
                            Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Button disabled={isSigningIn} type="submit">
                            {isSigningIn ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                ) : null}
                {currentUser ? (
                    <Button variant="outline" onClick={handleSignOut}>
                        Sign out
                    </Button>
                ) : null}
                {signInError ? <p className="text-xs text-destructive">{signInError}</p> : null}
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
                <TopBar
                    onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
                    currentUser={currentUser}
                    onSignOut={handleSignOut}
                />
                {showMfaWarning && !isMfaBannerDismissed ? (
                    <div className="border-b bg-background px-6 py-3">
                        <Alert className="border-amber-200 bg-linear-to-r from-red-500/80 to-background text-white">
                            <ShieldAlert className="text-amber-600" />
                            <AlertTitle>Security notice: enable 2FA</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                <p className="text-white">
                                    This admin account has no second factor enrolled yet. Add 2FA in your account settings to improve security.
                                </p>
                                <Button
                                    size={"sm"}
                                    variant={"secondary"}
                                    onClick={handleAdd2FAClick}
                                    aria-label="Open account security settings to add 2FA"
                                >
                                    Add
                                </Button>
                            </AlertDescription>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-foreground"
                                aria-label="Dismiss security notice"
                                onClick={() => setIsMfaBannerDismissed(true)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </Alert>
                    </div>
                ) : null}
                <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                    <Outlet />
                </main>
            </div>
            <Toaster richColors position="top-right" />
        </div>
    );
}
