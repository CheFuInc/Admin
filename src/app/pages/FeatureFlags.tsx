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
import { Switch } from "../components/ui/switch";
import { Plus, Search, Filter, Flag, Settings2 } from "lucide-react";
import { Progress } from "../components/ui/progress";

const flags = [
  { 
    key: 'academy.new_curriculum_builder', 
    description: 'Enable the new drag-and-drop curriculum builder.', 
    project: 'CheFu Academy',
    state: 'Active', 
    rollout: 25,
    updated: '2h ago'
  },
  { 
    key: 'drippybanks.faster_payouts', 
    description: 'Enable instant payouts for Pro merchants.', 
    project: 'DrippyBanks',
    state: 'Active', 
    rollout: 100,
    updated: '1d ago'
  },
  { 
    key: 'global.dark_mode_v2', 
    description: 'New high contrast dark mode theme.', 
    project: 'All Projects',
    state: 'Off', 
    rollout: 0,
    updated: '5d ago'
  },
  { 
    key: 'admin.beta_reports', 
    description: 'Beta access to new reporting engine.', 
    project: 'Admin Control Plane',
    state: 'Rolling', 
    rollout: 10,
    updated: '1w ago'
  },
];

export function FeatureFlags() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags & Releases</h1>
          <p className="text-muted-foreground">
            Manage feature rollouts, canary releases, and experimental toggles.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Flag
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search flags by key..." className="pl-8" />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flag Key</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Rollout</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flags.map((flag) => (
              <TableRow key={flag.key}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-medium">{flag.key}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{flag.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{flag.project}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={flag.state !== 'Off'} />
                    <span className="text-sm text-muted-foreground">{flag.state}</span>
                  </div>
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Progress value={flag.rollout} className="h-2" />
                    <span className="text-xs font-medium w-8">{flag.rollout}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {flag.updated}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
