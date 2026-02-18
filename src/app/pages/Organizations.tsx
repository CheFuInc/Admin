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

const orgs = [
  { id: '1', name: 'Alpha Labs (ZA)', region: 'ZA', status: 'Active', projects: 2, users: 12, plan: 'Enterprise' },
  { id: '2', name: 'Blue Orbit (EU)', region: 'EU', status: 'Trial', projects: 1, users: 4, plan: 'Pro' },
  { id: '3', name: 'Savanna Tech (ZA)', region: 'ZA', status: 'Suspended', projects: 1, users: 1, plan: 'Starter' },
  { id: '4', name: 'DrippyBanks Core', region: 'US', status: 'Active', projects: 3, users: 45, plan: 'Enterprise' },
  { id: '5', name: 'CheFu Academy', region: 'ZA', status: 'Active', projects: 1, users: 890, plan: 'Pro' },
];

export function Organizations() {
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
            <Input placeholder="Filter organizations..." className="pl-8" />
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
            {orgs.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>{org.region}</TableCell>
                <TableCell>
                  <Badge variant={org.status === 'Active' ? 'default' : org.status === 'Trial' ? 'secondary' : 'destructive'}>
                    {org.status}
                  </Badge>
                </TableCell>
                <TableCell>{org.plan}</TableCell>
                <TableCell className="text-right">{org.projects}</TableCell>
                <TableCell className="text-right">{org.users}</TableCell>
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
                      <DropdownMenuItem>Edit organization</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
