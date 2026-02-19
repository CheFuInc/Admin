import { useEffect, useMemo, useState } from "react";
import { listApps, type FirebaseWebApp } from "../api/listApps";
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
import { Badge } from "../components/ui/badge";
import { MoreHorizontal, Plus, Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export function Organizations() {
  const [apps, setApps] = useState<FirebaseWebApp[]>([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listApps(controller.signal);
        if (isMounted) {
          setApps(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load organizations.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const filteredApps = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) {
      return apps;
    }
    return apps.filter((app) =>
      [app.displayName, app.projectId, app.appId, app.name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [apps, filter]);

  const statusBadgeVariant = (state?: string): "default" | "secondary" | "destructive" => {
    if (!state) {
      return "secondary";
    }
    const normalized = state.toLowerCase();
    if (normalized === "active") {
      return "default";
    }
    if (normalized === "deleted" || normalized === "disabled" || normalized === "suspended") {
      return "destructive";
    }
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage all customer organizations and their subscriptions.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter organizations..."
              className="pl-8"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
           {/* Pagination or view options */}
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Projects</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="text-muted-foreground" colSpan={7}>
                  Loading organizations...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell className="text-destructive" colSpan={7}>
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredApps.length === 0 ? (
              <TableRow>
                <TableCell className="text-muted-foreground" colSpan={7}>
                  No organizations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredApps.map((app, index) => (
                <TableRow key={app.name ?? app.appId ?? `${app.projectId ?? "project"}-${index}`}>
                  <TableCell className="font-medium">{app.displayName || app.appId || "Unnamed app"}</TableCell>
                  <TableCell>{app.projectId || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(app.state)}>{app.state || "Unknown"}</Badge>
                  </TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell className="text-right">1</TableCell>
                  <TableCell className="text-right">N/A</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Open in Firebase Console</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
