import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { AppWindow, Copy, ExternalLink } from "lucide-react";
import { formatDate } from "../../../helpers/formatDate";
import type { FirebaseWebApp } from "../../api/listApps";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { toast } from "sonner";

const ProjectsUI = ({
    isLoading,
    error,
    totalApps,
    apps,
}: {
    isLoading: boolean;
    error: string | null;
    totalApps: number;
    apps: FirebaseWebApp[];
}) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Projects Management
                    </h1>
                    <p className="text-muted-foreground">
                        Central registry of Firebase web apps from your API.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading projects...</p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {!isLoading && !error && totalApps === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No apps were returned by the API.
                </p>
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
                        <Card key={id} className="flex min-w-0 flex-col">
                            <CardHeader className="overflow-hidden">
                                <div className="flex flex-col gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <AppWindow className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <CardTitle className="line-clamp-2 wrap-break-word text-base">
                                                {appName}
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <div className="break-all text-xs text-muted-foreground">
                                                    {app.appId ?? "No app ID"}
                                                </div>
                                                <Copy
                                                    onClick={() => {
                                                        if (app.appId) {
                                                            void window.navigator.clipboard.writeText(app.appId);
                                                            toast.success('Copied to clipboard')
                                                        }
                                                    }}
                                                    className="size-4 cursor-pointer hover:text-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Badge
                                        className={`w-fit shrink-0 text-white ${status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}
                                        variant={status === "ACTIVE" ? "outline" : "destructive"}
                                    >
                                        {status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-[auto,1fr] items-start gap-x-3">
                                        <span className="text-muted-foreground">Project</span>
                                        <span className="min-w-0 break-all text-right">
                                            {app.projectId ?? "N/A"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-[auto,1fr] items-start gap-x-3">
                                        <span className="text-muted-foreground">Platform</span>
                                        <span className="min-w-0 break-all text-right">
                                            {app.platform ?? "WEB"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-[auto,1fr] items-start gap-x-3">
                                        <span className="text-muted-foreground">Expires</span>
                                        <span className="min-w-0 break-all text-right">
                                            {formatDate(app.expireTime)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/50 p-4">
                                {consoleUrl ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start overflow-hidden text-xs"
                                        asChild
                                    >
                                        <a href={consoleUrl} target="_blank" rel="noreferrer">
                                            <ExternalLink className="mr-2 h-3 w-3 shrink-0" />
                                            <span className="truncate">Open in Firebase</span>
                                        </a>
                                    </Button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        Console link unavailable
                                    </span>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectsUI;
