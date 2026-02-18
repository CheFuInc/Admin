import { NavLink, useLocation } from 'react-router';
import { cn } from '../components/ui/utils';
import { useState } from 'react';

type NavLeafItem = {
    name: string;
    href: string;
    exact?: boolean;
};

type NavParentItem = {
    name: string;
    children: NavLeafItem[];
};

type NavItemType = NavLeafItem | NavParentItem;

type SidebarProps = {
    isMobileOpen: boolean;
    onCloseMobile: () => void;
};

// Icons temporarily removed to debug module loading
const navigation: NavItemType[] = [
    { name: 'Dashboard', href: '/', exact: true },
    { name: 'Organizations', href: '/organizations' },
    { name: 'Users & Access', href: '/users' },
    { name: 'Projects', href: '/projects' },
    { name: 'Assignments', href: '/assignments' },
    { name: 'Billing', href: '/billing' },
    {
        name: 'Observability',
        children: [
            { name: 'Status', href: '/observability/status' },
            { name: 'Metrics', href: '/observability/metrics' },
            { name: 'Logs', href: '/observability/logs' },
        ],
    },
    {
        name: 'Compliance',
        children: [
            { name: 'Audit Logs', href: '/compliance/audit' },
            { name: 'Data Requests', href: '/compliance/data-requests' },
        ],
    },
    {
        name: 'Integrations',
        children: [
            { name: 'Webhooks', href: '/integrations/webhooks' },
            { name: 'API Keys', href: '/integrations/api-keys' },
            { name: 'Providers', href: '/integrations/providers' },
        ],
    },
    { name: 'Feature Flags', href: '/feature-flags' },
    {
        name: 'Settings',
        children: [
            { name: 'Branding', href: '/settings/branding' },
            { name: 'Domains', href: '/settings/domains' },
            { name: 'Email/SMS', href: '/settings/email' },
        ],
    },
    {
        name: 'Support',
        children: [
            { name: 'Impersonation', href: '/support/impersonation' },
            { name: 'Incidents', href: '/support/incidents' },
        ],
    },
];

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
    return (
        <>
            <button
                type="button"
                aria-label="Close sidebar"
                onClick={onCloseMobile}
                className={cn(
                    'fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden',
                    isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
            />
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform lg:static lg:z-auto lg:translate-x-0',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-16 items-center border-b border-sidebar-border px-6">
                    <div className="flex items-center gap-2 text-xl font-bold">CheFu Inc Admin</div>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {navigation.map((item) => (
                            <NavItem key={item.name} item={item} onNavigate={onCloseMobile} />
                        ))}
                    </nav>
                </div>
                <div className="border-t border-sidebar-border p-4">
                    <div className="text-xs text-muted-foreground">
                        <p>v2.4.0 (Build 8921)</p>
                        <a href="#" className="hover:text-foreground">What's new</a>
                    </div>
                </div>
            </aside>
        </>
    );
}

function NavItem({ item, onNavigate }: { item: NavItemType; onNavigate: () => void }) {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = 'children' in item
        ? item.children.some((child) => location.pathname.startsWith(child.href))
        : item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href);
    const isExpanded = isOpen || isActive;

    if ('children' in item) {
        return (
            <div className="space-y-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground'
                    )}
                >
                    <span className="flex-1 text-left">{item.name}</span>
                    <svg
                        className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {isExpanded && (
                    <div className="ml-4 space-y-1 border-l border-sidebar-border pl-2">
                        {item.children.map((child) => (
                            <NavLink
                                key={child.name}
                                to={child.href}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:text-foreground',
                                        isActive ? 'font-medium text-primary' : 'text-muted-foreground'
                                    )
                                }
                            >
                                {child.name}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <NavLink
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground'
                )
            }
        >
            {item.name}
        </NavLink>
    );
}
