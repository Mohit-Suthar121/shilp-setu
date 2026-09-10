import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
  Square,
  MapPin,
  Loader2,
  Volume2,
} from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill, Stat } from "@/components/ui-bits";
import { useApp } from "@/lib/app-state";
import { LANGUAGES, CRAFTS, ORDERS, BULK } from "@/lib/mock";
import { cn } from "@/lib/utils";

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

/* ============================================================
   Shared: tiny inline mic button for text fields
   ============================================================ */
function InlineMic({
  onResult,
  sample,
  ms = 1500,
}: {
  onResult: (v: string) => void;
  sample: string;
  ms?: number;
}) {
  const [listening, setListening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const toggle = () => {
    if (listening) {
      setListening(false);
      if (timer.current) clearTimeout(timer.current);
      return;
    }
    setListening(true);
    timer.current = setTimeout(() => {
      setListening(false);
      onResult(sample);
    }, ms);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop listening" : "Speak"}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl border border-border transition",
        listening
          ? "animate-pulse bg-destructive text-white"
          : "bg-card text-primary hover:bg-accent",
      )}
    >
      {listening ? <Square className="size-4" /> : <Mic className="size-5" />}
    </button>
  );
}

/* ============================================================
   Step 0 — Name + Phone with inline mic buttons
   ============================================================ */
function Step0Name({
  name, setName, phone, setPhone, onNext,
}: {
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  onNext: () => void;
}) {
  const [listeningPhone, setListeningPhone] = useState(false);
  const phoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (phoneTimer.current) clearTimeout(phoneTimer.current); }, []);

  const startPhone = () => {
    if (listeningPhone) {
      setListeningPhone(false);
      if (phoneTimer.current) clearTimeout(phoneTimer.current);
      return;
    }
    setListeningPhone(true);
    phoneTimer.current = setTimeout(() => { setListeningPhone(false); setPhone("9876543210"); }, 1500);
  };

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Tell us who you are</h2>

      {/* Name field with mic */}
      <label className="block text-sm font-medium">
        Your name / आपका नाम
        <div className="mt-1 flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sunita Devi"
            className="min-h-11 w-full rounded-2xl border border-border bg-background px-4 text-base"
          />
          <InlineMic onResult={setName} sample="Sunita Devi" />
        </div>
      </label>

      {/* Phone field with mic */}
      <label className="block text-sm font-medium">
        Mobile number / मोबाइल नंबर
        <div className="mt-1 flex items-center gap-2">
          <div className="flex min-h-11 flex-1 items-center rounded-2xl border border-border bg-background px-4">
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
          <button
            type="button"
            onClick={startPhone}
            aria-label={listeningPhone ? "Stop" : "Speak phone number"}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl border border-border transition",
              listeningPhone
                ? "animate-pulse bg-destructive text-white"
                : "bg-card text-primary hover:bg-accent",
            )}
          >
            {listeningPhone ? <Square className="size-4" /> : <Mic className="size-5" />}
          </button>
        </div>
        {listeningPhone && (
          <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
            <Mic className="size-3 animate-pulse" /> Listening… say your 10-digit number
          </p>
        )}
      </label>

      <p className="text-xs text-muted-foreground">
        We send a one-time SMS code. Works on 2G — no smartphone data plan needed.
      </p>
      <BigButton className="w-full" disabled={name.length < 2 || phone.length !== 10} onClick={onNext}>
        Continue <ArrowRight className="size-5" />
      </BigButton>
    </Card>
  );
}

/* ============================================================
   Step 1 — Voice-activated language selection with greeting
   ============================================================ */
function Step1Language({
  lang, setLang, onBack, onNext,
}: {
  lang: string; setLang: (v: string) => void;
  onBack: () => void; onNext: () => void;
}) {
  const [listening, setListening] = useState(false);
  const [greetingText, setGreetingText] = useState<string | null>(null);
  const [playingGreeting, setPlayingGreeting] = useState(false);
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (listenTimer.current) clearTimeout(listenTimer.current);
    if (greetTimer.current) clearTimeout(greetTimer.current);
  }, []);

  // Auto-trigger voice recognition on mount
  useEffect(() => {
    triggerVoiceListen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playGreeting = (code: string) => {
    const langObj = LANGUAGES.find((l) => l.code === code);
    if (!langObj) return;
    setGreetingText(langObj.greeting);
    setPlayingGreeting(true);
    try {
      const s = window.speechSynthesis;
      if (s) {
        s.cancel();
        const utt = new SpeechSynthesisUtterance(langObj.greeting);
        utt.lang = code;
        s.speak(utt);
      }
    } catch { /* ignore */ }
    if (greetTimer.current) clearTimeout(greetTimer.current);
    greetTimer.current = setTimeout(() => {
      setPlayingGreeting(false);
      setGreetingText(null);
    }, 3200);
  };

  const selectLang = (code: string) => {
    setLang(code);
    playGreeting(code);
  };

  const triggerVoiceListen = () => {
    if (listenTimer.current) clearTimeout(listenTimer.current);
    setListening(true);
    listenTimer.current = setTimeout(() => {
      setListening(false);
      // Simulate detecting the currently-selected language
      selectLang(lang);
    }, 1800);
  };

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Choose your language</h2>
      <p className="text-sm text-muted-foreground">
        The whole app, your buyer replies and voice assistant will speak this language.
      </p>

      {/* Voice listening banner */}
      {listening && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3">
          <Mic className="size-5 animate-pulse text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Listening…</p>
            <p className="text-xs text-muted-foreground">Say your language — हिन्दी, English, বাংলা…</p>
          </div>
        </div>
      )}

      {/* Greeting preview after detection */}
      {greetingText && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
          <Volume2 className={cn("mt-0.5 size-5 text-primary", playingGreeting && "animate-pulse")} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Language confirmed ✓</p>
            <p className="mt-0.5 text-base font-medium">{greetingText}</p>
          </div>
        </div>
      )}

      {/* Language grid */}
      <div className="grid grid-cols-2 gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => selectLang(l.code)}
            className={cn(
              "min-h-14 rounded-2xl border px-3 text-left transition",
              lang === l.code
                ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <span className="block text-base font-semibold">{l.label}</span>
            <span className="block text-xs text-muted-foreground">{l.en}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={triggerVoiceListen}
          className={cn(
            "flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-medium transition",
            listening ? "bg-destructive/10 text-destructive" : "bg-card text-primary hover:bg-accent",
          )}
        >
          <Mic className={cn("size-4", listening && "animate-pulse")} />
          {listening ? "Listening…" : "Try voice"}
        </button>
        <BigButton variant="outline" onClick={onBack}>Back</BigButton>
        <BigButton className="flex-1" onClick={onNext}>
          Continue <ArrowRight className="size-5" />
        </BigButton>
      </div>
    </Card>
  );
}

/* ============================================================
   Step 2 — Craft pills (icons + voice) + GPS/voice location
   ============================================================ */
function Step2Craft({
  craft, setCraft, village, setVillage, onFinish,
}: {
  craft: string; setCraft: (v: string) => void;
  village: string; setVillage: (v: string) => void;
  onFinish: () => void;
}) {
  const [craftListening, setCraftListening] = useState(false);
  const [locating, setLocating] = useState(false);
  const craftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (craftTimer.current) clearTimeout(craftTimer.current); }, []);

  const startCraftVoice = () => {
    if (craftListening) {
      setCraftListening(false);
      if (craftTimer.current) clearTimeout(craftTimer.current);
      return;
    }
    setCraftListening(true);
    craftTimer.current = setTimeout(() => {
      setCraftListening(false);
      // Simulate recognition of currently-selected craft
      const spoken = craft.toLowerCase();
      const matched = CRAFTS.find((c) =>
        c.aliases.some((a) => spoken.includes(a.toLowerCase()) || a.toLowerCase().includes(spoken)),
      );
      if (matched) setCraft(matched.name);
    }, 1800);
  };

  const detectLocation = () => {
    setLocating(true);
    const onDone = () => {
      setTimeout(() => {
        setVillage("Kot Jewar, Jaipur, Rajasthan");
        setLocating(false);
      }, 1000);
    };
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(onDone, onDone, { timeout: 5000 });
    } else {
      onDone();
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Your craft</h2>

      {/* Voice button for craft selection */}
      <div className="flex items-center gap-2">
        <p className="flex-1 text-sm text-muted-foreground">Tap a craft or speak its name</p>
        <button
          type="button"
          onClick={startCraftVoice}
          aria-label={craftListening ? "Stop listening" : "Speak craft name"}
          className={cn(
            "flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-medium transition",
            craftListening
              ? "animate-pulse bg-destructive/10 text-destructive"
              : "bg-card text-primary hover:bg-accent",
          )}
        >
          {craftListening ? <Square className="size-4" /> : <Mic className="size-4" />}
          {craftListening ? "Listening…" : "Speak craft"}
        </button>
      </div>
      {craftListening && (
        <p className="text-xs text-destructive">Say e.g. "Blue Pottery" or "ब्लू पॉटरी"</p>
      )}

      {/* Craft pills with emoji icons */}
      <div className="flex flex-wrap gap-2">
        {CRAFTS.map((c) => (
          <button
            key={c.name}
            onClick={() => setCraft(c.name)}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
              craft === c.name
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <span className="text-base leading-none">{c.icon}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Location: GPS + voice */}
      <label className="block text-sm font-medium">
        Village / town
        <div className="mt-1 flex items-center gap-2">
          <input
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            placeholder="Your village or town"
            className="min-h-11 w-full rounded-2xl border border-border bg-background px-4 text-base"
          />
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            aria-label="Auto-detect location"
            title="Detect my location"
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl border border-border transition",
              locating ? "bg-primary/10 text-primary" : "bg-card text-primary hover:bg-accent",
            )}
          >
            {locating ? <Loader2 className="size-5 animate-spin" /> : <MapPin className="size-5" />}
          </button>
          <InlineMic onResult={setVillage} sample="Kot Jewar, Jaipur" />
        </div>
        {locating && (
          <p className="mt-1 flex items-center gap-1 text-xs text-primary">
            <Loader2 className="size-3 animate-spin" /> Detecting your location…
          </p>
        )}
      </label>

      <div className="rounded-2xl bg-accent p-3 text-xs text-accent-foreground">
        Everything you do is saved on your phone first. When a signal comes, SHILPSETU syncs quietly in the
        background.
      </div>
      <BigButton className="w-full" onClick={onFinish}>
        Start using SHILPSETU
      </BigButton>
    </Card>
  );
}

/* ============================================================
   Onboarding shell
   ============================================================ */
function Onboarding() {
  const { setProfile } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState("hi");
  const [craft, setCraft] = useState("Blue Pottery");
  const [village, setVillage] = useState("Kot Jewar, Jaipur");

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
          <Step0Name
            name={name} setName={setName}
            phone={phone} setPhone={setPhone}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <Step1Language
            lang={lang} setLang={setLang}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2Craft
            craft={craft} setCraft={setCraft}
            village={village} setVillage={setVillage}
            onFinish={() => setProfile({ name, phone, lang, craft, village })}
          />
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
