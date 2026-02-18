import { AppWindow, ExternalLink, GitBranch, Plus } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

const projects = [
  {
    id: 'academy',
    name: 'CheFu Academy',
    description: 'Educational platform for cooking and culinary arts.',
    status: 'Operational',
    version: 'v2.4.0',
    health: 99.99,
    maintainers: ['Alice', 'Bob'],
    url: 'academy.chefuinc.com'
  },
  {
    id: 'drippybanks',
    name: 'DrippyBanks',
    description: 'Fintech solution for modern banking.',
    status: 'Degraded',
    version: 'v1.1.2',
    health: 98.50,
    maintainers: ['David'],
    url: 'drippybanks.chefuinc.com'
  },
  {
    id: 'admin',
    name: 'Admin Control Plane',
    description: 'Internal tool for managing CheFu ecosystem.',
    status: 'Operational',
    version: 'v3.0.0-beta',
    health: 100.0,
    maintainers: ['Admin'],
    url: 'admin.chefuinc.com'
  }
];

export function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Registry</h1>
          <p className="text-muted-foreground">
            Central registry of all deployed applications and services.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Register Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <AppWindow className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {project.version}
                    </div>
                  </div>
                </div>
                <Badge variant={project.status === 'Operational' ? 'secondary' : 'destructive'}>
                  {project.status}
                </Badge>
              </div>
              <CardDescription className="mt-2 line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health</span>
                  <span className={project.health > 99 ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                    {project.health}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maintainers</span>
                  <div className="flex -space-x-2">
                    {project.maintainers.map((m, i) => (
                      <div key={i} className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                        {m[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-4">
              <div className="flex w-full justify-between gap-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" asChild>
                  <a href={`https://${project.url}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Visit App
                  </a>
                </Button>
               
              </div>
            </CardFooter>
          </Card>
        ))}
        
        <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">New Project</h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-2">
            Deploy a new application to the CheFu ecosystem.
          </p>
        </Card>
      </div>
    </div>
  );
}
