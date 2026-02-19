import { useEffect, useMemo, useState } from "react";
import { Activity, AppWindow, ShieldAlert, Users } from "lucide-react";
import { listApps } from "../api/listApps";
import { fetchUsers, type ListedUser } from "../api/listUsers";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

function parseDate(value?: string): Date | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function timeAgo(value?: string): string {
    const date = parseDate(value);
    if (!date) {
        return "unknown";
    }

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function Dashboard() {
    const [users, setUsers] = useState<ListedUser[]>([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            setIsLoading(true);
            setError(null);
            let didAbort = false;

            try {
                const [usersResult, appsResult] = await Promise.all([
                    fetchUsers(controller.signal),
                    listApps(controller.signal),
                ]);

                setUsers(usersResult.users);
                setTotalProjects(appsResult.length);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    didAbort = true;
                    return;
                }

                setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
            } finally {
                if (!didAbort) {
                    setIsLoading(false);
                }
            }
        };

        void run();

        return () => controller.abort();
    }, []);

    const activeUsers = useMemo(() => users.filter((user) => !user.disabled).length, [users]);
    const disabledUsers = useMemo(() => users.filter((user) => user.disabled).length, [users]);

    const recentActivity = useMemo(() => {
        return [...users]
            .map((user) => {
                const lastSignIn = user.metadata.lastSignInTime;
                const created = user.metadata.creationTime;
                const when = parseDate(lastSignIn) ?? parseDate(created);

                return {
                    uid: user.uid,
                    name: user.displayName ?? user.email ?? user.uid,
                    action: parseDate(lastSignIn) ? "Signed in" : "Account created",
                    when,
                    whenRaw: lastSignIn ?? created,
                };
            })
            .sort((a, b) => (b.when?.getTime() ?? 0) - (a.when?.getTime() ?? 0))
            .slice(0, 5);
    }, [users]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>

            {isLoading ? <p className="text-sm text-muted-foreground">Loading dashboard...</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">From Firebase Auth</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUsers}</div>
                        <p className="text-xs text-muted-foreground">Enabled accounts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disabled Users</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{disabledUsers}</div>
                        <p className="text-xs text-muted-foreground">Needs review</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <AppWindow className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProjects}</div>
                        <p className="text-xs text-muted-foreground">From Firebase apps API</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent activity available.</p>
                        ) : (
                            recentActivity.map((item) => (
                                <div key={item.uid} className="flex items-center gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium leading-none">{item.action}</p>
                                        <p className="truncate text-sm text-muted-foreground">{item.name}</p>
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">{timeAgo(item.whenRaw)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
