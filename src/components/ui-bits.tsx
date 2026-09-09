import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-3xl border border-border bg-card p-4 shadow-sm", className)}>{children}</div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-success-ink">{hint}</p>}
    </div>
  );
}

export function Pill({ tone = "muted", children }: { tone?: "muted" | "success" | "warn" | "primary"; children: ReactNode }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success-ink",
    warn: "bg-marigold/30 text-marigold-foreground",
    primary: "bg-primary/12 text-primary",
  } as const;
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function BigButton({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const v = {
    primary: "bg-primary text-primary-foreground",
    outline: "border border-border bg-card text-foreground",
    ghost: "text-foreground",
  } as const;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition active:scale-[0.98] disabled:opacity-50",
        v[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
