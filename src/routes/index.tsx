import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  Navigation,
} from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill, Stat } from "@/components/ui-bits";
import { useApp } from "@/lib/app-state";
import { LANGUAGES, CRAFTS } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { detectArtisanLocation, ARTISAN_CLUSTERS } from "@/lib/location";
import {
  useSpeechRecognition,
  matchLanguageFromSpeech,
  matchCraftFromSpeech,
  extractNumberFromSpeech,
  speakText,
} from "@/lib/voice";

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
        content:
          "Voice-first listings, fair pricing, AI buyer replies and bulk negotiation — working fully offline.",
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
   Shared: Real speech recognition inline mic button
   ============================================================ */
function InlineMic({
  onResult,
  sample,
  langCode = "hi",
}: {
  onResult: (v: string) => void;
  sample: string;
  langCode?: string;
}) {
  const { listening, interimText, toggle } = useSpeechRecognition({
    langCode,
    sampleFallback: sample,
    onResult: (text) => {
      if (text) onResult(text);
    },
    onFinal: (text) => {
      if (text) onResult(text);
    },
  });

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop listening" : "Speak into field"}
      title={listening ? `Listening: ${interimText || "speak now"}` : "Tap to speak"}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl border border-border transition active:scale-95 shadow-sm",
        listening
          ? "animate-pulse bg-destructive text-destructive-foreground ring-4 ring-destructive/20"
          : "bg-card text-primary hover:bg-accent",
      )}
    >
      {listening ? <Square className="size-4" /> : <Mic className="size-5" />}
    </button>
  );
}

/* ============================================================
   Step 0 — Name + Phone with real speech recognition
   ============================================================ */
function Step0Name({
  name,
  setName,
  phone,
  setPhone,
  onNext,
}: {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  onNext: () => void;
}) {
  const {
    listening: listeningPhone,
    interimText: interimPhone,
    toggle: togglePhone,
  } = useSpeechRecognition({
    langCode: "hi",
    sampleFallback: "9876543210",
    onResult: (text) => {
      const num = extractNumberFromSpeech(text);
      if (num) {
        setPhone(String(num).slice(0, 10));
      } else {
        const cleaned = text.replace(/\D/g, "").slice(0, 10);
        if (cleaned) setPhone(cleaned);
      }
    },
    onFinal: (text) => {
      const num = extractNumberFromSpeech(text);
      if (num) {
        setPhone(String(num).slice(0, 10));
      } else {
        const cleaned = text.replace(/\D/g, "").slice(0, 10);
        if (cleaned) setPhone(cleaned);
      }
    },
  });

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Tell us who you are</h2>

      {/* Name field with real mic */}
      <label className="block text-sm font-medium">
        Your name / आपका नाम
        <div className="mt-1 flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sunita Devi"
            className="min-h-11 w-full rounded-2xl border border-border bg-background px-4 text-base"
          />
          <InlineMic onResult={setName} sample="Sunita Devi" langCode="hi" />
        </div>
      </label>

      {/* Phone field with real mic */}
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
            onClick={togglePhone}
            aria-label={listeningPhone ? "Stop" : "Speak phone number"}
            title={listeningPhone ? "Stop recording" : "Speak your mobile number"}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl border border-border transition active:scale-95 shadow-sm",
              listeningPhone
                ? "animate-pulse bg-destructive text-destructive-foreground ring-4 ring-destructive/20"
                : "bg-card text-primary hover:bg-accent",
            )}
          >
            {listeningPhone ? <Square className="size-4" /> : <Mic className="size-5" />}
          </button>
        </div>
        {listeningPhone && (
          <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
            <Mic className="size-3 animate-pulse" />{" "}
            {interimPhone ? `Heard: "${interimPhone}"` : "Listening… speak your 10 digits"}
          </p>
        )}
      </label>

      <p className="text-xs text-muted-foreground">
        We send a one-time SMS code. Works on 2G — no smartphone data plan needed.
      </p>
      <BigButton
        className="w-full"
        disabled={name.length < 2 || phone.length !== 10}
        onClick={onNext}
      >
        Continue <ArrowRight className="size-5" />
      </BigButton>
    </Card>
  );
}

/* ============================================================
   Step 1 — Voice-activated language selection with greeting
   ============================================================ */
function Step1Language({
  lang,
  setLang,
  onBack,
  onNext,
}: {
  lang: string;
  setLang: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [greetingText, setGreetingText] = useState<string | null>(null);
  const [playingGreeting, setPlayingGreeting] = useState(false);

  const playGreeting = (code: string) => {
    const langObj = LANGUAGES.find((l) => l.code === code);
    if (!langObj) return;
    setGreetingText(langObj.greeting);
    setPlayingGreeting(true);

    speakText(langObj.greeting, code, () => {
      setPlayingGreeting(false);
    });
  };

  const selectLang = (code: string) => {
    setLang(code);
    playGreeting(code);
  };

  // Real Speech Recognition for detecting spoken language
  const { listening, interimText, toggle } = useSpeechRecognition({
    langCode: lang,
    sampleFallback: "हिन्दी",
    onResult: (text) => {
      const matched = matchLanguageFromSpeech(text);
      if (matched) {
        selectLang(matched.code);
      }
    },
    onFinal: (text) => {
      const matched = matchLanguageFromSpeech(text);
      if (matched) {
        selectLang(matched.code);
      }
    },
  });

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Choose your language</h2>
      <p className="text-sm text-muted-foreground">
        The whole app, your buyer replies and voice assistant will speak this language.
      </p>

      {/* Voice listening banner */}
      {listening && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 shadow-inner">
          <Mic className="size-5 animate-pulse text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {interimText ? `Heard: "${interimText}"` : "Listening live…"}
            </p>
            <p className="text-xs text-muted-foreground">
              Say your language out loud — हिन्दी, English, বাংলা, मराठी…
            </p>
          </div>
        </div>
      )}

      {/* Greeting preview after detection */}
      {greetingText && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
          <Volume2
            className={cn("mt-0.5 size-5 text-primary", playingGreeting && "animate-pulse")}
          />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Language confirmed ✓
            </p>
            <p className="mt-0.5 text-base font-medium">{greetingText}</p>
          </div>
        </div>
      )}

      {/* Language grid */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => selectLang(l.code)}
            className={cn(
              "min-h-14 rounded-2xl border px-3 text-left transition active:scale-98",
              lang === l.code
                ? "border-primary bg-primary/15 ring-2 ring-primary/40 font-semibold"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <span className="block text-base">{l.label}</span>
            <span className="block text-xs text-muted-foreground">{l.en}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-medium transition active:scale-95 shadow-sm",
            listening
              ? "bg-destructive text-destructive-foreground ring-2 ring-destructive/30"
              : "bg-card text-primary hover:bg-accent",
          )}
        >
          {listening ? <Square className="size-4" /> : <Mic className="size-4" />}
          {listening ? "Stop mic" : "Speak language"}
        </button>
        <BigButton variant="outline" onClick={onBack}>
          Back
        </BigButton>
        <BigButton className="flex-1" onClick={onNext}>
          Continue <ArrowRight className="size-5" />
        </BigButton>
      </div>
    </Card>
  );
}

/* ============================================================
   Step 2 — Craft pills (icons + voice) + Real GPS/voice location
   ============================================================ */
function Step2Craft({
  craft,
  setCraft,
  village,
  setVillage,
  onFinish,
}: {
  craft: string;
  setCraft: (v: string) => void;
  village: string;
  setVillage: (v: string) => void;
  onFinish: () => void;
}) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gpsDetected, setGpsDetected] = useState(false);

  // Real Speech Recognition for craft selection
  const {
    listening: craftListening,
    interimText: craftInterim,
    toggle: toggleCraftVoice,
  } = useSpeechRecognition({
    langCode: "hi",
    sampleFallback: "Blue Pottery",
    onResult: (text) => {
      const matched = matchCraftFromSpeech(text);
      if (matched) setCraft(matched.name);
    },
    onFinal: (text) => {
      const matched = matchCraftFromSpeech(text);
      if (matched) setCraft(matched.name);
    },
  });

  // Real browser geolocation + OpenStreetMap reverse geocoding
  const handleDetectLocation = async () => {
    setLocating(true);
    setLocationError(null);

    try {
      const loc = await detectArtisanLocation({ timeoutMs: 10000 });
      setVillage(loc.displayName);
      setGpsDetected(true);
    } catch (err: unknown) {
      console.warn("Location error:", err);
      setLocationError(
        err instanceof Error
          ? err.message
          : "Could not detect GPS location. Please choose a cluster or type.",
      );
      // If failed, default to standard cluster
      if (!village) {
        setVillage("Kot Jewar, Jaipur, Rajasthan");
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Your craft &amp; location</h2>

      {/* Voice button for craft selection */}
      <div className="flex items-center gap-2">
        <p className="flex-1 text-sm text-muted-foreground">Tap a craft or speak its name</p>
        <button
          type="button"
          onClick={toggleCraftVoice}
          aria-label={craftListening ? "Stop listening" : "Speak craft name"}
          className={cn(
            "flex items-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-medium transition active:scale-95 shadow-sm",
            craftListening
              ? "animate-pulse bg-destructive text-destructive-foreground ring-2 ring-destructive/30"
              : "bg-card text-primary hover:bg-accent",
          )}
        >
          {craftListening ? <Square className="size-4" /> : <Mic className="size-4" />}
          {craftListening ? "Stop mic" : "Speak craft"}
        </button>
      </div>

      {craftListening && (
        <p className="text-xs text-destructive animate-pulse">
          {craftInterim
            ? `Heard: "${craftInterim}"`
            : "Say e.g. 'Blue Pottery', 'Terracotta', or 'मधुबनी'"}
        </p>
      )}

      {/* Craft pills with emoji icons */}
      <div className="flex flex-wrap gap-2">
        {CRAFTS.map((c) => (
          <button
            key={c.name}
            onClick={() => setCraft(c.name)}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition active:scale-95",
              craft === c.name
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <span className="text-base leading-none">{c.icon}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Location: GPS + Nominatim reverse geocode + voice */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">Village / town / cluster</label>
          {gpsDetected && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-success-ink">
              <Navigation className="size-3" /> GPS Verified
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={village}
            onChange={(e) => {
              setVillage(e.target.value);
              setGpsDetected(false);
            }}
            placeholder="e.g. Kot Jewar, Jaipur, Rajasthan"
            className="min-h-11 w-full rounded-2xl border border-border bg-background px-4 text-base"
          />
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            aria-label="Auto-detect current location"
            title="Detect my current location via GPS"
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl border border-border transition active:scale-95 shadow-sm",
              locating
                ? "bg-primary/20 text-primary animate-pulse"
                : "bg-card text-primary hover:bg-accent",
            )}
          >
            {locating ? <Loader2 className="size-5 animate-spin" /> : <MapPin className="size-5" />}
          </button>
          <InlineMic onResult={setVillage} sample="Kot Jewar, Jaipur" langCode="hi" />
        </div>

        {locating && (
          <p className="flex items-center gap-1 text-xs text-primary font-medium animate-pulse">
            <Loader2 className="size-3 animate-spin" /> Detecting GPS coordinates &amp;
            reverse-geocoding via OpenStreetMap…
          </p>
        )}

        {locationError && <p className="text-xs text-destructive">{locationError}</p>}

        {/* Quick artisan cluster presets */}
        <div className="pt-1">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
            Or tap a known artisan cluster:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ARTISAN_CLUSTERS.slice(0, 5).map((cl) => (
              <button
                key={cl.name}
                type="button"
                onClick={() => {
                  setVillage(`${cl.name}, ${cl.state}`);
                  setCraft(cl.craft);
                }}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-foreground transition"
              >
                {cl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-accent p-3 text-xs text-accent-foreground">
        Everything you do is saved on your phone first. When a signal comes, SHILPSETU syncs quietly
        in the background.
      </div>

      <BigButton className="w-full" disabled={!craft || !village} onClick={onFinish}>
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
  const [village, setVillage] = useState("Kot Jewar, Jaipur, Rajasthan");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 py-8">
        <div className="mb-6 text-center">
          <img
            src="/shilpsetu-logo.jpg"
            alt="ShilpSetu Logo"
            className="mx-auto size-24 rounded-3xl object-cover shadow-md"
          />
          <h1 className="mt-4 font-display text-3xl font-bold text-primary">SHILPSETU</h1>
          <p className="text-sm text-muted-foreground">
            शिल्पसेतु · your business manager that works without internet
          </p>
          <div className="craft-border mx-auto mt-4 w-32" />
        </div>

        <div className="mb-5 flex gap-2" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <Step0Name
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <Step1Language
            lang={lang}
            setLang={setLang}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2Craft
            craft={craft}
            setCraft={setCraft}
            village={village}
            setVillage={setVillage}
            onFinish={() => setProfile({ name, phone, lang, craft, village })}
          />
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Voice-enabled &amp; GPS-aware · Works offline · Smart India Hackathon Prototype
        </p>
      </div>
    </div>
  );
}

/* ---------------- Home dashboard ---------------- */

function HomeDash() {
  const { profile, queue, online, orders, bulkDeals, products } = useApp();
  const toPackCount = orders.filter((o) => o.status === "To pack").length;
  const pendingBulkCount = bulkDeals.filter((b) => !b.status || b.status === "pending").length;

  const brief = `Namaste ${profile?.name}. You have ${toPackCount} orders to pack, ${pendingBulkCount} bulk enquiry waiting, and ${queue.length} items ready to sync. Your best move today is to approve the bulk counter-offer.`;

  return (
    <AppShell
      title={`Namaste, ${profile?.name?.split(" ")[0]} 🙏`}
      subtitle="Your business manager · today's plan"
    >
      <Card className="space-y-3 border-primary/30 bg-gradient-to-br from-primary/10 to-marigold/15">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkle className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Today&apos;s brief from your manager</p>
            <p className="mt-1 text-sm text-foreground/85 leading-relaxed">{brief}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <SpeakButton text={brief} label="Listen to brief" />
          <Link to="/bulk">
            <BigButton className="min-h-11 px-4 text-sm">
              Open bulk deal <ArrowRight className="size-4" />
            </BigButton>
          </Link>
        </div>
      </Card>

      <Link to="/create" className="block">
        <div className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg transition active:scale-98">
          <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
            <Mic className="size-8" />
          </div>
          <div>
            <p className="font-display text-xl font-bold">Speak to add a product</p>
            <p className="text-sm opacity-90">
              Say it in your language · photo · price · ready in 60 seconds
            </p>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Earnings this month" value="₹42,300" hint="+38% vs last month" />
        <Stat label="Orders" value={String(orders.length)} hint={`${toPackCount} to pack now`} />
        <Stat label="Catalog items" value={String(products.length)} hint="Active listings" />
        <Stat label="Hours saved / week" value="9" hint="AI replies + voice" />
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
            title={`${toPackCount} orders ready to pack`}
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

      <Section
        title="Saved on this phone"
        action={<Pill tone={online ? "success" : "muted"}>{online ? "Online" : "Offline"}</Pill>}
      >
        <Card className="space-y-2">
          {queue.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-success-ink font-medium">
              <CheckCircle2 className="size-4" /> Everything is synced. Nothing pending.
            </p>
          ) : (
            queue.map((q) => (
              <div key={q.id} className="flex items-center gap-3 text-sm">
                <span className="size-2 rounded-full bg-marigold" />
                <span className="flex-1 font-medium">{q.label}</span>
                <span className="text-xs text-muted-foreground">{q.at}</span>
              </div>
            ))
          )}
          <p className="pt-1 text-xs text-muted-foreground">
            Conflict-safe: if a buyer changed something while you were offline, SHILPSETU keeps both
            versions and asks you which one is right — nothing is silently overwritten.
          </p>
        </Card>
      </Section>

      <Section title="Recent orders">
        <div className="space-y-2">
          {orders.slice(0, 3).map((o) => (
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
              <Pill
                tone={
                  o.status === "Delivered" ? "success" : o.status === "Packed" ? "warn" : "primary"
                }
              >
                {o.status}
              </Pill>
            </Card>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/create">
          <Card className="flex h-full flex-col items-center gap-2 py-6 text-center hover:border-primary/40 transition">
            <Camera className="size-7 text-primary" />
            <span className="text-sm font-semibold">Photo &amp; enhance</span>
          </Card>
        </Link>
        <Link to="/bulk">
          <Card className="flex h-full flex-col items-center gap-2 py-6 text-center hover:border-primary/40 transition">
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
