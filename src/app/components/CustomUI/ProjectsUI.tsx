import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AppWindow, ExternalLink } from "lucide-react";
import { formatDate } from '../../../helpers/formatDate';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { FirebaseWebApp } from "../../api/listApps";


const ProjectsUI = ({ isLoading, error, totalApps, apps }: {
    isLoading: boolean, error: string | null, totalApps: number, apps: FirebaseWebApp[]
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects Management</h1>
                    <p className="text-muted-foreground">Central registry of Firebase web apps from your API.</p>
                </div>
            </div>

            {isLoading ? <p className="text-sm text-muted-foreground">Loading projects...</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {!isLoading && !error && totalApps === 0 ? (
                <p className="text-sm text-muted-foreground">No apps were returned by the API.</p>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => {
                    const id = app.appId ?? app.name ?? "unknown";
                    const appName = app.displayName ?? app.appId ?? "Unnamed App";
                    const status = app.state ?? "UNKNOWN";
                    const consoleUrl =
                        app.projectId && app.appId
                            ? `https://console.firebase.google.com/project/${app.projectId}/settings/general/web:${app.appId}`
                            : null;

                    return (
                        <Card key={id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <AppWindow className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-base">{appName}</CardTitle>
                                            <div className="text-xs text-muted-foreground">{app.appId ?? "No app ID"}</div>
                                        </div>
                                    </div>
                                    <Badge variant={status === "ACTIVE" ? "secondary" : "destructive"}>{status}</Badge>
                                </div>
                                <CardDescription className="mt-2 line-clamp-2">{app.name ?? "Firebase web app"}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">Project</span>
                                        <span className="truncate">{app.projectId ?? "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">Platform</span>
                                        <span>{app.platform ?? "WEB"}</span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">Expires</span>
                                        <span>{formatDate(app.expireTime)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/50 p-4">
                                {consoleUrl ? (
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs" asChild>
                                        <a href={consoleUrl} target="_blank" rel="noreferrer">
                                            <ExternalLink className="mr-2 h-3 w-3" />
                                            Open in Firebase
                                        </a>
                                    </Button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Console link unavailable</span>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    )
}

export default ProjectsUI