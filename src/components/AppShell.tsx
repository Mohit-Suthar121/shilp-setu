import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  PlusCircle,
  Package,
  MessageSquare,
  GraduationCap,
  CloudOff,
  Cloud,
  RefreshCw,
  Volume2,
  User,
  ShoppingBag,
  
  Handshake,
  Store,
} from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "@/lib/app-state";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/catalog", label: "Catalog", icon: Package },
  { to: "/create", label: "Add", icon: PlusCircle },
  { to: "/messages", label: "Chats", icon: MessageSquare },
  { to: "/learn", label: "Learn", icon: GraduationCap },
] as const;

const MORE = [
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/bulk", label: "Bulk deals", icon: Handshake },
  
  { to: "/market", label: "Buyer view", icon: Store },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function OfflineBar() {
  const { online, toggleOnline, queue, syncNow, syncing, lastSync } = useApp();
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs font-medium",
        online ? "bg-success/15 text-success-ink" : "bg-accent text-accent-foreground",
      )}
    >
      {online ? <Cloud className="size-4 shrink-0" /> : <CloudOff className="size-4 shrink-0" />}
      <span>{online ? "Online — safe to sync" : "Working offline — everything is saved on your phone"}</span>
      <span className="rounded-full bg-background/70 px-2 py-0.5 text-foreground">{queue.length} waiting</span>
      <span className="text-muted-foreground">Last sync: {lastSync}</span>
      <div className="ml-auto flex items-center gap-2">
        {online && queue.length > 0 && (
          <button
            onClick={syncNow}
            className="inline-flex min-h-8 items-center gap-1 rounded-full bg-primary px-3 text-primary-foreground"
          >
            <RefreshCw className={cn("size-3.5", syncing && "animate-spin")} />
            {syncing ? "Syncing…" : "Sync now"}
          </button>
        )}
        <button
          onClick={toggleOnline}
          aria-label="Toggle demo network state"
          className="min-h-8 rounded-full border border-border px-3"
        >
          Demo: go {online ? "offline" : "online"}
        </button>
      </div>
    </div>
  );
}

export function SpeakButton({ text, label = "Listen" }: { text: string; label?: string }) {
  const { speak, speaking } = useApp();
  return (
    <button
      onClick={() => speak(text)}
      aria-label={`${label}: ${text.slice(0, 60)}`}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 text-sm font-medium",
        speaking === text ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
      )}
    >
      <Volume2 className="size-4" /> {speaking === text ? "Speaking…" : label}
    </button>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-6xl lg:flex lg:gap-6 lg:px-6 lg:py-6">
        <aside className="hidden lg:block lg:w-60 lg:shrink-0">
          <div className="sticky top-6 space-y-1 rounded-3xl border border-border bg-card p-3">
            <div className="flex items-center gap-3 px-3 py-3">
              <img src="/shilpsetu-logo.jpg" alt="ShilpSetu Logo" className="size-11 rounded-2xl object-cover" />
              <div>
                <p className="font-display text-lg font-bold text-primary">SHILPSETU</p>
                <p className="text-xs text-muted-foreground">Offline-first business manager</p>
              </div>
            </div>
            {[...NAV, ...MORE].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium",
                  path === n.to ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
                )}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur lg:rounded-t-3xl lg:border lg:border-b-0">
            <div className="flex items-center gap-3 px-4 py-3">
              <Link to="/" className="shrink-0 lg:hidden">
                <img src="/shilpsetu-logo.jpg" alt="ShilpSetu Logo" className="size-11 rounded-2xl object-cover" />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate font-display text-base font-bold text-foreground">{title}</h1>
                <p className="truncate text-xs text-muted-foreground">
                  {subtitle ?? (profile ? `${profile.name} · ${profile.village}` : "Artisan workspace")}
                </p>
              </div>
              <Link
                to="/profile"
                aria-label="Profile and settings"
                className="ml-auto grid size-11 place-items-center rounded-full border border-border"
              >
                <User className="size-5" />
              </Link>
            </div>
            <OfflineBar />
          </header>

          <div className="space-y-6 px-4 py-5 lg:rounded-b-3xl lg:border lg:border-t-0 lg:border-border lg:bg-card/40">
            {children}
          </div>

          <div className="mt-4 hidden flex-wrap gap-2 px-4 lg:flex">
            {MORE.map((m) => (
              <Link key={m.to} to={m.to} className="rounded-full border border-border px-3 py-1.5 text-xs">
                {m.label}
              </Link>
            ))}
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card lg:hidden">
        <div className="mx-auto flex max-w-md">
          {NAV.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <n.icon className={cn("size-6", n.label === "Add" && "size-8 text-primary")} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
