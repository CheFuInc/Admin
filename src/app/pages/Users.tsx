import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search, Filter, ShieldCheck } from "lucide-react";
import { fetchUsers, type ListedUser } from "../api/listUsers";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

function initials(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return "U";
    }

    const parts = trimmed.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

function userRole(user: ListedUser): string {
    const role = user.customClaims?.role;
    return typeof role === "string" && role.trim() ? role : "User";
}

export function Users() {
    const [users, setUsers] = useState<ListedUser[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchUsers(controller.signal);
                setUsers(result.users);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }

                setError(err instanceof Error ? err.message : "Failed to load users.");
            } finally {
                setIsLoading(false);
            }
        };

        void run();

        return () => controller.abort();
    }, []);

    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) {
            return users;
        }

        return users.filter((user) => {
            const name = (user.displayName ?? "").toLowerCase();
            const email = (user.email ?? "").toLowerCase();
            return name.includes(q) || email.includes(q);
        });
    }, [users, search]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users & Access</h1>
                    <p className="text-muted-foreground">
                        Manage user identities, roles, and access controls across all organizations.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite User
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search users by name or email..."
                        className="pl-8"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            {isLoading ? <p className="text-sm text-muted-foreground">Loading users...</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>MFA</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12.5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!isLoading && !error && filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {filteredUsers.map((user) => {
                            const name = user.displayName?.trim() || user.email || user.uid;
                            const email = user.email || user.phoneNumber || "No email";
                            const role = userRole(user);
                            const mfaEnabled = user.providerIds.includes("phone");

                            return (
                                <TableRow key={user.uid}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`/avatars/${user.uid}.png`} />
                                            <AvatarFallback>{initials(name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-medium">{name}</span>
                                            <span className="truncate text-xs text-muted-foreground">{email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {mfaEnabled ? (
                                            <ShieldCheck className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Off</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.disabled ? "secondary" : "default"}>
                                            {user.disabled ? "Disabled" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
