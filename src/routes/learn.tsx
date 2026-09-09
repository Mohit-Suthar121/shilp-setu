import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, CheckCircle2, Flame } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill } from "@/components/ui-bits";
import { LESSONS, BADGES } from "@/lib/mock";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — digital literacy lessons & badges — SHILPSETU" },
      { name: "description", content: "Short voice-led lessons that teach photos, pricing, payments and buyer replies. Earn badges as you go." },
      { property: "og:title", content: "Learn — digital literacy for artisans — SHILPSETU" },
      { property: "og:description", content: "Gamified 5-minute lessons in your own language." },
    ],
  }),
  component: Learn,
});

function Learn() {
  const [done, setDone] = useState<string[]>(LESSONS.filter((l) => l.done).map((l) => l.id));
  const xp = LESSONS.filter((l) => done.includes(l.id)).reduce((a, b) => a + b.xp, 0);
  const pct = Math.round((done.length / LESSONS.length) * 100);

  return (
    <AppShell title="Learn" subtitle="5-minute lessons in your language">
      <Card className="space-y-3 bg-gradient-to-br from-marigold/25 to-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-bold">{xp} XP</p>
            <p className="text-sm text-muted-foreground">{done.length} of {LESSONS.length} lessons finished</p>
          </div>
          <Pill tone="warn">
            <span className="inline-flex items-center gap-1">
              <Flame className="size-3.5" /> 6-day streak
            </span>
          </Pill>
        </div>
        <div className="h-3 rounded-full bg-background/70">
          <div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">Finish 2 more lessons to unlock the Bulk Negotiator badge.</p>
      </Card>

      <Section title="Your badges">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-3 text-center ${
                b.earned ? "border-primary/40 bg-card" : "border-dashed border-border bg-muted/50 opacity-60"
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <p className="mt-1 text-[11px] font-medium leading-tight">{b.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Lessons">
        <div className="space-y-3">
          {LESSONS.map((l) => {
            const isDone = done.includes(l.id);
            return (
              <Card key={l.id} className="flex flex-wrap items-center gap-3">
                <div
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                    isDone ? "bg-success/20 text-success-ink" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="size-5" /> : <Play className="size-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{l.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.mins} min · voice + pictures · +{l.xp} XP
                  </p>
                </div>
                <div className="flex gap-2">
                  <SpeakButton text={l.title} label="Listen" />
                  {!isDone && (
                    <BigButton className="min-h-11 text-sm" onClick={() => setDone((d) => [...d, l.id])}>
                      Start
                    </BigButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Card className="bg-accent">
        <p className="text-sm font-semibold">Lessons work offline too</p>
        <p className="text-sm text-muted-foreground">
          All audio and pictures are downloaded once. Your progress and XP save on the phone and sync later.
        </p>
      </Card>
    </AppShell>
  );
}
