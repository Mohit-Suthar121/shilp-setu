import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mic,
  Camera,
  Handshake,
  TrendingUp,
  Package,
  ArrowRight,
  IndianRupee,
  Sparkle,
  CheckCircle2,
} from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill, Stat } from "@/components/ui-bits";
import { useApp } from "@/lib/app-state";
import { LANGUAGES, ORDERS, BULK } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SHILPSETU — Offline-First AI Business Manager for Artisans" },
      {
        name: "description",
        content:
          "SHILPSETU is a voice-first, offline-first virtual business manager that helps Indian artisans list, price, market, negotiate and sell crafts in their own language.",
      },
      { property: "og:title", content: "SHILPSETU — AI Business Manager for Indian Artisans" },
      {
        property: "og:description",
        content: "Voice-first listings, fair pricing, AI buyer replies and bulk negotiation — working fully offline.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { ready, profile } = useApp();
  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!profile) return <Onboarding />;
  return <HomeDash />;
}

/* ---------------- Onboarding ---------------- */

function Onboarding() {
  const { setProfile } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState("hi");
  const [craft, setCraft] = useState("Blue Pottery");
  const [village, setVillage] = useState("Kot Jewar, Jaipur");

  const crafts = ["Blue Pottery", "Madhubani", "Terracotta", "Kantha", "Dokra", "Pattachitra", "Bamboo", "Block Print"];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 py-8">
        <div className="mb-6 text-center">
          <img src="/shilpsetu-logo.jpg" alt="ShilpSetu Logo" className="mx-auto size-24 rounded-3xl object-cover shadow-md" />
          <h1 className="mt-4 font-display text-3xl font-bold text-primary">SHILPSETU</h1>
          <p className="text-sm text-muted-foreground">शिल्पसेतु · your business manager that works without internet</p>
          <div className="craft-border mx-auto mt-4 w-32" />
        </div>

        <div className="mb-5 flex gap-2" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {step === 0 && (
          <Card className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Tell us who you are</h2>
            <label className="block text-sm font-medium">
              Your name / आपका नाम
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sunita Devi"
                className="mt-1 min-h-13 w-full rounded-2xl border border-border bg-background px-4 text-base"
              />
            </label>
            <label className="block text-sm font-medium">
              Mobile number / मोबाइल नंबर
              <div className="mt-1 flex min-h-13 items-center rounded-2xl border border-border bg-background px-4">
                <span className="text-muted-foreground">+91</span>
                <input
                  value={phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="ml-2 w-full bg-transparent text-base outline-none"
                />
              </div>
            </label>
            <p className="text-xs text-muted-foreground">
              We send a one-time SMS code. Works on 2G — no smartphone data plan needed.
            </p>
            <BigButton className="w-full" disabled={name.length < 2 || phone.length !== 10} onClick={() => setStep(1)}>
              Continue <ArrowRight className="size-5" />
            </BigButton>
          </Card>
        )}

        {step === 1 && (
          <Card className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Choose your language</h2>
            <p className="text-sm text-muted-foreground">
              The whole app, your buyer replies and voice assistant will speak this language.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`min-h-14 rounded-2xl border px-3 text-left ${
                    lang === l.code ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <span className="block text-base font-semibold">{l.label}</span>
                  <span className="block text-xs text-muted-foreground">{l.en}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <BigButton variant="outline" onClick={() => setStep(0)}>
                Back
              </BigButton>
              <BigButton className="flex-1" onClick={() => setStep(2)}>
                Continue <ArrowRight className="size-5" />
              </BigButton>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Your craft</h2>
            <div className="flex flex-wrap gap-2">
              {crafts.map((c) => (
                <button
                  key={c}
                  onClick={() => setCraft(c)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                    craft === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium">
              Village / town
              <input
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="mt-1 min-h-13 w-full rounded-2xl border border-border bg-background px-4 text-base"
              />
            </label>
            <div className="rounded-2xl bg-accent p-3 text-xs text-accent-foreground">
              Everything you do is saved on your phone first. When a signal comes, SHILPSETU syncs quietly in the
              background.
            </div>
            <BigButton
              className="w-full"
              onClick={() => setProfile({ name, phone, lang, craft, village })}
            >
              Start using SHILPSETU
            </BigButton>
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Smart India Hackathon demonstration prototype · simulated AI &amp; data
        </p>
      </div>
    </div>
  );
}

/* ---------------- Home dashboard ---------------- */

function HomeDash() {
  const { profile, queue, online } = useApp();
  const brief = `Namaste ${profile?.name}. You have 2 orders to pack, one bulk enquiry for 500 diya sets, and ${queue.length} changes waiting to sync. Your best move today is to approve the bulk counter-offer.`;

  return (
    <AppShell title={`Namaste, ${profile?.name?.split(" ")[0]} 🙏`} subtitle="Your business manager · today's plan">
      <Card className="space-y-3 border-primary/30 bg-gradient-to-br from-primary/10 to-marigold/15">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkle className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Today&apos;s brief from your manager</p>
            <p className="mt-1 text-sm text-foreground/85">{brief}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <SpeakButton text={brief} label="Listen to brief" />
          <Link to="/bulk">
            <BigButton className="min-h-11 px-4 text-sm">
              Open bulk deal <ArrowRight className="size-4" />
            </BigButton>
          </Link>
        </div>
      </Card>

      <Link to="/create" className="block">
        <div className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg">
          <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
            <Mic className="size-8" />
          </div>
          <div>
            <p className="font-display text-xl font-bold">Speak to add a product</p>
            <p className="text-sm opacity-90">Say it in your language · photo · price · ready in 60 seconds</p>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Earnings this month" value="₹42,300" hint="+38% vs last month" />
        <Stat label="Orders" value="17" hint="4 new this week" />
        <Stat label="Avg. price realised" value="₹1,320" hint="+22% after fair pricing" />
        <Stat label="Hours saved / week" value="9" hint="AI replies + listings" />
      </div>

      <Section title="Needs your approval" action={<Pill tone="warn">3 items</Pill>}>
        <div className="space-y-3">
          <ApprovalRow
            icon={<Handshake className="size-5" />}
            title="Counter-offer to Tanishka Home Retail"
            body="AI suggests ₹395/set against their ₹330. Your cost floor is ₹355."
            to="/bulk"
            cta="Review & approve"
          />
          <ApprovalRow
            icon={<Package className="size-5" />}
            title="2 orders ready to pack"
            body="SS-2041 Kochi · SS-2038 Delhi. Labels already drafted."
            to="/orders"
            cta="Open orders"
          />
          <ApprovalRow
            icon={<TrendingUp className="size-5" />}
            title="Price nudge: Kantha Stole"
            body="Similar stoles sold at ₹2,050 in the last 30 days. Raise from ₹1,850?"
            to="/catalog"
            cta="See catalog"
          />
        </div>
      </Section>

      <Section title="Saved on this phone" action={<Pill tone={online ? "success" : "muted"}>{online ? "Online" : "Offline"}</Pill>}>
        <Card className="space-y-2">
          {queue.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-success-ink">
              <CheckCircle2 className="size-4" /> Everything is synced. Nothing pending.
            </p>
          ) : (
            queue.map((q) => (
              <div key={q.id} className="flex items-center gap-3 text-sm">
                <span className="size-2 rounded-full bg-marigold" />
                <span className="flex-1">{q.label}</span>
                <span className="text-xs text-muted-foreground">{q.at}</span>
              </div>
            ))
          )}
          <p className="pt-1 text-xs text-muted-foreground">
            Conflict-safe: if a buyer changed something while you were offline, SHILPSETU keeps both versions and asks
            you which one is right — nothing is silently overwritten.
          </p>
        </Card>
      </Section>

      <Section title="Recent activity">
        <div className="space-y-2">
          {ORDERS.slice(0, 3).map((o) => (
            <Card key={o.id} className="flex items-center gap-3 py-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <IndianRupee className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{o.item}</p>
                <p className="text-xs text-muted-foreground">
                  {o.buyer} · {o.city} · {o.when}
                </p>
              </div>
              <Pill tone={o.status === "Delivered" ? "success" : "primary"}>{o.status}</Pill>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Opportunity waiting">
        <Card className="space-y-2">
          <p className="text-sm font-semibold">
            {BULK[0]!.buyer} · {BULK[0]!.qty} {BULK[0]!.item}
          </p>
          <p className="text-sm text-muted-foreground">
            Potential value ₹{(BULK[0]!.qty * BULK[0]!.recommend).toLocaleString("en-IN")} if you close at the suggested
            rate.
          </p>
          <Link to="/bulk">
            <BigButton variant="outline" className="w-full">
              See AI negotiation plan
            </BigButton>
          </Link>
        </Card>
      </Section>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/create">
          <Card className="flex h-full flex-col items-center gap-2 py-6 text-center">
            <Camera className="size-7 text-primary" />
            <span className="text-sm font-semibold">Photo &amp; enhance</span>
          </Card>
        </Link>
        <Link to="/bulk">
          <Card className="flex h-full flex-col items-center gap-2 py-6 text-center">
            <span className="text-2xl">🤝</span>
            <span className="text-sm font-semibold">Bulk deals</span>
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}

function ApprovalRow({
  icon,
  title,
  body,
  to,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  to: "/bulk" | "/orders" | "/catalog";
  cta: string;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-marigold/30 text-marigold-foreground">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
      </div>
      <Link to={to}>
        <BigButton variant="outline" className="w-full min-h-12 text-sm">
          {cta}
        </BigButton>
      </Link>
    </Card>
  );
}
