import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, CheckCircle2, Flame, Award, X, Sparkles } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill } from "@/components/ui-bits";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — digital literacy lessons & badges — SHILPSETU" },
      {
        name: "description",
        content:
          "Short voice-led lessons that teach photos, pricing, payments and buyer replies. Earn badges as you go.",
      },
      { property: "og:title", content: "Learn — digital literacy for artisans — SHILPSETU" },
      { property: "og:description", content: "Gamified 5-minute lessons in your own language." },
    ],
  }),
  component: Learn,
});

const LESSON_DETAILS: Record<
  string,
  { summary: string; tips: string[]; quiz: { q: string; opts: string[]; ans: number } }
> = {
  l1: {
    summary:
      "Good photography builds trust before buyers even touch your craft. Diffused early morning daylight reveals real glaze and textures.",
    tips: [
      "Shoot near an open window or verandah, never direct harsh sun",
      "Wipe your phone lens with a clean cotton cloth before clicking",
      "Include one close-up shot showing hand stitches or clay texture",
    ],
    quiz: {
      q: "Where should you take photos of your handmade crafts?",
      opts: [
        "Under harsh midday sunlight",
        "Near a window in soft morning daylight",
        "In a pitch black room with flash",
      ],
      ans: 1,
    },
  },
  l2: {
    summary:
      "Buyers love genuine stories. When speaking into the mic, name the village, the natural raw materials and the time it took.",
    tips: [
      "Speak clearly in your own mother tongue — ShilpSetu understands all Indian languages",
      "Mention if materials are natural, GI tagged, or lead-free",
      "State how many pieces you have ready to ship today",
    ],
    quiz: {
      q: "What detail makes buyers pay 20-30% more?",
      opts: [
        "Heritage story and days of handwork",
        "Copy-pasting factory descriptions",
        "Giving zero measurements",
      ],
      ans: 0,
    },
  },
  l3: {
    summary:
      "UPI payments credit directly to your bank account without middlemen commissions. Never enter your UPI PIN to RECEIVE money.",
    tips: [
      "To receive payment, show your QR code or mobile number",
      "You NEVER need to enter your PIN to receive money",
      "Check the green SMS or soundbox confirmation before handing goods",
    ],
    quiz: {
      q: "Do you ever enter your UPI PIN to receive money?",
      opts: ["Yes, always", "Never! PIN is only to send money", "Only on holidays"],
      ans: 1,
    },
  },
  l4: {
    summary:
      "Artisans frequently underprice their time. Always include raw material cost, transport, and a living hourly wage.",
    tips: [
      "Track how many hours or days you spend per piece",
      "Include fuel, wood, glaze, and bubble wrap costs",
      "Compare online marketplace sales before giving discounts",
    ],
    quiz: {
      q: "What is the cost floor for any handcrafted item?",
      opts: [
        "Only raw material cost",
        "Materials + your labor hours + packing costs",
        "Whatever the buyer wants to pay",
      ],
      ans: 1,
    },
  },
  l5: {
    summary:
      "Break-free packing saves you refund disputes. Use crumpled newspaper, straw, and double-walled cartons for fragile pottery and metalcraft.",
    tips: [
      "Wrap fragile pottery in straw or crumpled paper before carton",
      "Leave no empty rattling space inside the outer box",
      "Affix the waterproof dispatch label clearly on top",
    ],
    quiz: {
      q: "What prevents damage during courier transit?",
      opts: [
        "Tightly packing without empty loose space",
        "Putting items loose in a plastic bag",
        "No padding",
      ],
      ans: 0,
    },
  },
  l6: {
    summary:
      "Bulk buyers look for reliability and production capacity. Always suggest a tiered counter-rate rather than accepting lowball offers.",
    tips: [
      "Never accept an offer below your raw material and labor floor",
      "Quote a realistic delivery timeline that accounts for firing and curing",
      "Request 30-50% advance for raw materials on large custom orders",
    ],
    quiz: {
      q: "What should you do if a bulk buyer offers below your cost floor?",
      opts: [
        "Counter with an AI suggested fair rate with reasons",
        "Accept it and lose money",
        "Ignore customer forever",
      ],
      ans: 0,
    },
  },
};

function Learn() {
  const { lessons, badges, completeLesson } = useApp();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const done = lessons.filter((l) => l.done).map((l) => l.id);
  const xp = lessons.filter((l) => l.done).reduce((a, b) => a + b.xp, 0);
  const pct = Math.round((done.length / lessons.length) * 100);

  const activeLesson = lessons.find((l) => l.id === activeLessonId);
  const activeDetail = activeLessonId ? LESSON_DETAILS[activeLessonId] : null;

  return (
    <AppShell title="Learn" subtitle="5-minute voice lessons in your language">
      <Card className="space-y-3 bg-gradient-to-br from-marigold/25 to-primary/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-bold">{xp} XP Earned</p>
            <p className="text-sm text-muted-foreground">
              {done.length} of {lessons.length} lessons finished
            </p>
          </div>
          <Pill tone="warn">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Flame className="size-3.5 text-marigold" /> 6-day streak
            </span>
          </Pill>
        </div>
        <div className="h-3 rounded-full bg-background/70 overflow-hidden">
          <div
            className="h-3 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {pct === 100
            ? "All digital literacy badges unlocked! Master Artisan."
            : "Complete lessons to unlock badges and raise your buyer visibility."}
        </p>
      </Card>

      {/* Interactive Lesson Modal / Drawer */}
      {activeLesson && activeDetail && (
        <Card className="border-2 border-primary/50 bg-card shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Pill tone="primary">Lesson in Progress</Pill>
              <h3 className="font-display text-lg font-bold mt-1 text-foreground">
                {activeLesson.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeLesson.mins} mins · Voice audio included
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveLessonId(null);
                setQuizAnswer(null);
              }}
              className="grid size-8 place-items-center rounded-full hover:bg-accent text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="rounded-2xl bg-accent/60 p-4 text-sm leading-relaxed border border-border">
            <p className="font-medium text-foreground">{activeDetail.summary}</p>
            <div className="mt-3">
              <SpeakButton
                text={`${activeLesson.title}. ${activeDetail.summary}`}
                label="Listen to lesson"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Key Action Steps
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
              {activeDetail.tips.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Quick interactive quiz */}
          <div className="space-y-2 rounded-2xl border border-border p-3 bg-muted/20">
            <p className="text-xs font-semibold flex items-center gap-1">
              <Sparkles className="size-3 text-primary" /> Quick Check: {activeDetail.quiz.q}
            </p>
            <div className="space-y-1.5">
              {activeDetail.quiz.opts.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuizAnswer(i)}
                  className={`w-full text-left text-xs p-2.5 rounded-xl border transition ${
                    quizAnswer === i
                      ? i === activeDetail.quiz.ans
                        ? "border-success bg-success/15 text-success-ink font-semibold"
                        : "border-destructive bg-destructive/15 text-destructive"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <BigButton
            className="w-full shadow-sm"
            onClick={() => {
              completeLesson(activeLesson.id);
              setActiveLessonId(null);
              setQuizAnswer(null);
            }}
          >
            <CheckCircle2 className="size-4" /> Complete lesson (+{activeLesson.xp} XP)
          </BigButton>
        </Card>
      )}

      <Section title="Your badges" action={<Award className="size-4 text-primary" />}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-3 text-center transition ${
                b.earned
                  ? "border-primary/40 bg-card shadow-sm"
                  : "border-dashed border-border bg-muted/50 opacity-60"
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <p className="mt-1 text-[11px] font-semibold leading-tight">{b.name}</p>
              <span className="text-[9px] text-muted-foreground">
                {b.earned ? "Unlocked ✓" : "Locked"}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Lessons">
        <div className="space-y-3">
          {lessons.map((l) => {
            const isDone = l.done;

            return (
              <Card key={l.id} className="flex flex-wrap items-center gap-3">
                <div
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl shadow-sm ${
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
                  <BigButton
                    variant={isDone ? "outline" : "default"}
                    className="min-h-11 text-sm"
                    onClick={() => {
                      setActiveLessonId(l.id);
                      setQuizAnswer(null);
                    }}
                  >
                    {isDone ? "Review" : "Start"}
                  </BigButton>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Card className="bg-accent">
        <p className="text-sm font-semibold">Lessons work offline too</p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
          All audio and pictures are cached locally. Your progress and XP save on your phone and
          sync automatically when network returns.
        </p>
      </Card>
    </AppShell>
  );
}
