import { createBrowserRouter } from "react-router";
import { GlobalShell } from "./layout/GlobalShell";
import { Dashboard } from "./pages/Dashboard";
import { Organizations } from "./pages/Organizations";
import { Users } from "./pages/Users";
import { Projects } from "./pages/Projects";
import { Billing } from "./pages/Billing";
import { FeatureFlags } from "./pages/FeatureFlags";

// Placeholder for missing pages
const Placeholder = ({ title }: { title: string }) => (
    <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <span className="text-3xl">🚧</span>
        </div>
        <h2 className="mt-6 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm">
            This page is under construction. It will be part of the final deliverables for the CheFu Admin Control Plane.
        </p>
    </div>
);

export const router = createBrowserRouter([
    {
        path: "/",
        Component: GlobalShell,
        children: [
            {
                index: true,
                Component: Dashboard,
            },
            {
                path: "organizations",
                Component: Organizations,
            },
            {
                path: "users",
                Component: Users,
            },
            {
                path: "projects",
                Component: Projects,
            },
            {
                path: "assignments",
                Component: () => <Placeholder title="Assignments" />,
            },
            {
                path: "billing",
                Component: Billing,
            },
            {
                path: "observability",
                children: [
                    { path: "status", Component: () => <Placeholder title="System Status" /> },
                    { path: "metrics", Component: () => <Placeholder title="Metrics & Performance" /> },
                    { path: "logs", Component: () => <Placeholder title="System Logs" /> },
                ],
            },
            {
                path: "compliance",
                children: [
                    { path: "audit", Component: () => <Placeholder title="Audit Logs" /> },
                    { path: "data-requests", Component: () => <Placeholder title="Data Access Requests" /> },
                ],
            },
            {
                path: "integrations",
                children: [
                    { path: "webhooks", Component: () => <Placeholder title="Webhooks" /> },
                    { path: "api-keys", Component: () => <Placeholder title="API Keys" /> },
                    { path: "providers", Component: () => <Placeholder title="Service Providers" /> },
                ],
            },
            {
                path: "feature-flags",
                Component: FeatureFlags,
            },
            {
                path: "settings",
                children: [
                    { path: "branding", Component: () => <Placeholder title="Branding Settings" /> },
                    { path: "domains", Component: () => <Placeholder title="Domain Management" /> },
                    { path: "email", Component: () => <Placeholder title="Email & SMS" /> },
                ],
            },
            {
                path: "support",
                children: [
                    { path: "impersonation", Component: () => <Placeholder title="User Impersonation" /> },
                    { path: "incidents", Component: () => <Placeholder title="Incident Management" /> },
                ],
            },
            {
                path: "*",
                Component: () => <Placeholder title="404 Not Found" />,
            },
        ],
    },
]);
