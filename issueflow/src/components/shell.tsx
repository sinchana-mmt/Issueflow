"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Columns3,
  FolderKanban,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Tags,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ROLE_LABEL } from "@/lib/constants";
import type { Actor } from "@/lib/permissions";
import { cn } from "@/lib/ui";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/issues", label: "All Issues", icon: List },
  { href: "/my-issues", label: "My Issues", icon: UserRound },
  { href: "/board", label: "Board", icon: Columns3 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tags", label: "Tags", icon: Tags },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Shell({ actor, unread, children }: { actor: Actor; unread: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const title = links.find((link) => (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)))?.label || "IssueFlow";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className={cn("fixed inset-y-0 left-0 z-30 w-[240px] border-r border-line bg-sidebar p-4 transition md:static", open ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
        <div className="mb-6 flex items-center justify-between px-2">
          <Link href="/" className="text-sm font-semibold tracking-tight">IssueFlow</Link>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm text-muted hover:bg-panel hover:text-ink", active && "bg-panel text-ink")}>
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      {open ? <button className="fixed inset-0 z-20 bg-black/50 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur md:px-6">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
          <h1 className="hidden text-sm font-medium sm:block">{title}</h1>
          <form action="/issues" className="mx-auto flex w-full max-w-md items-center gap-2 rounded-[10px] border border-line bg-panel px-3">
            <Search size={15} className="text-faint" />
            <input name="q" placeholder="Search by key or title" className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-faint" />
          </form>
          <Link href="/notifications" className="relative rounded-[10px] p-2 text-muted hover:bg-panel hover:text-ink" aria-label="Notifications">
            <Bell size={18} />
            {unread > 0 ? <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] text-white">{unread}</span> : null}
          </Link>
          <Link href="/settings" className="hidden text-right sm:block">
            <div className="text-sm">{actor.name}</div>
            <div className="text-xs text-faint">{ROLE_LABEL[actor.role]}</div>
          </Link>
          <button
            className="rounded-[10px] p-2 text-muted hover:bg-panel hover:text-ink"
            aria-label="Sign out"
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
              router.refresh();
            }}
          >
            <LogOut size={18} />
          </button>
          <Link href="/issues/new" className="inline-flex h-9 items-center gap-1 rounded-[10px] bg-accent px-3 text-sm font-medium text-white hover:bg-accent-2">
            <Plus size={15} /> Create issue
          </Link>
        </header>
        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
