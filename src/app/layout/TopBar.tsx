// import { 
//   Search, 
//   Bell, 
//   HelpCircle, 
//   User as UserIcon, 
//   Menu 
// } from 'lucide-react';
import { useEffect, useRef } from "react";
import { LogOut, Menu, Search } from "lucide-react";
import type { User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from '../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

type TopBarProps = {
  onToggleSidebar: () => void;
  currentUser: User | null;
  onSignOut: () => void;
};

function getInitials(user: User | null): string {
  const name = user?.displayName?.trim();
  if (name) {
    const pieces = name.split(/\s+/).filter(Boolean);
    return pieces.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AD";
  }
  const email = user?.email?.trim();
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "AD";
}

export function TopBar({ onToggleSidebar, currentUser, onSignOut }: TopBarProps) {
  const displayName = currentUser?.displayName || "Admin";
  const email = currentUser?.email || "No email";
  const photoUrl = currentUser?.photoURL || undefined;
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcutKey = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey;
      if (!isShortcutKey || event.key.toLowerCase() !== "k") {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">CheFu Technologies (PTY) LTD</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search organizations, users, projects... (Cmd+K)"
            aria-label="Search organizations, users, and projects (Cmd+K)"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={photoUrl} alt={displayName} />
                <AvatarFallback>{getInitials(currentUser)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
