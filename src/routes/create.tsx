import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, Camera, IndianRupee, ScrollText, CheckCircle2, ArrowRight, ArrowLeft, Square, Sparkles, Volume2, Plus, Minus } from "lucide-react";
import { AppShell, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill } from "@/components/ui-bits";
import { MicButton, MicField, useDictation } from "@/components/MicInput";
import { useApp } from "@/lib/app-state";
import { VOICE_SCRIPT, VOICE_SCRIPT_EN } from "@/lib/mock";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a listing by voice — SHILPSETU" },
      {
        name: "description",
        content: "Speak in your language, add a photo, and SHILPSETU turns it into a priced, story-rich listing.",
      },
      { property: "og:title", content: "Create a listing by voice — SHILPSETU" },
      { property: "og:description", content: "Voice to structured listing with fair pricing and heritage story." },
    ],
  }),
  component: CreateFlow,
});

const STEPS = ["Speak", "Photo", "Details", "Price", "Story", "Approve"];

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  category: "Category",
  material: "Material",
  size: "Size",
  time: "Time to make",
  stock: "Stock",
  care: "Care",
};

const SPOKEN_FIELDS: Record<string, string> = {
  name: "Jaipur Blue Pottery Water Jug",
  category: "Home & Kitchen › Pottery",
  material: "Quartz clay with cobalt oxide glaze",
  size: "8 inch height, 1.2 litre",
  time: "14 days",
  stock: "6",
  care: "Hand wash, avoid direct flame",
};

function CreateFlow() {
  const { enqueue, online, speak, speaking } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [saved, setSaved] = useState(false);

  const [fields, setFields] = useState<Record<string, string>>({
    name: "Jaipur Blue Pottery Water Jug",
    category: "Home & Kitchen › Pottery",
    material: "Quartz clay with cobalt oxide glaze",
    size: "8 inch height, 1.2 litre",
    time: "14 days",
    stock: "6",
    care: "Hand wash, avoid direct flame",
  });
  const [price, setPrice] = useState(1450);

  const dictateAll = useDictation(() => setFields({ ...SPOKEN_FIELDS }), "all", 1600);

  // simulated speech-to-text
  useEffect(() => {
    if (!recording) return;
    let i = 0;
    const t = setInterval(() => {
      i += 4;
      setTranscript(VOICE_SCRIPT.slice(0, i));
      if (i >= VOICE_SCRIPT.length) {
        clearInterval(t);
        setRecording(false);
      }
    }, 60);
    return () => clearInterval(t);
  }, [recording]);

  // simulate camera capture & immediate auto enhancement
  const takePhoto = () => {
    setCapturing(true);
    setTimeout(() => {
      setCapturing(false);
      setPhotoTaken(true);
      // Auto enhance immediately after artisan clicks picture
      setTimeout(() => setEnhanced(true), 800);
    }, 600);
  };

  const runAI = () => {
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setStep(2);
    }, 1400);
  };

  const handleBack = () => {
    if (step === 0) {
      navigate({ to: "/" });
    } else if (step === 1 && photoTaken) {
      setPhotoTaken(false);
      setEnhanced(false);
    } else {
      setStep((s) => s - 1);
    }
  };

  const fullDetailsText = Object.entries(fields)
    .map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${v}`)
    .join(". ");

  return (
    <AppShell title="Add a product" subtitle="Voice first · almost no typing">
      {/* Top Back Option */}
      <div className="flex items-center justify-between gap-2">
        <BigButton variant="outline" className="min-h-11 px-4 text-sm" onClick={handleBack}>
          <ArrowLeft className="size-4" />{" "}
          {step === 0
            ? "Back to home"
            : step === 1 && photoTaken
              ? "Back to Camera"
              : `Back to ${STEPS[step - 1]}`}
        </BigButton>
        <span className="text-xs font-medium text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-2 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
            <p className={`mt-1 text-[10px] ${i === step ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              {s}
            </p>
          </div>
        ))}
      </div>

      {/* Step 0: Speak */}
      {step === 0 && (
        <Card className="space-y-4 text-center">
          <h2 className="font-display text-xl font-semibold">Describe your product out loud</h2>
          <p className="text-sm text-muted-foreground">
            Say what it is, what it&apos;s made of, how long it took, and how many you have. Any language.
          </p>
          <button
            onClick={() => {
              setTranscript("");
              setRecording(true);
            }}
            aria-label="Start recording"
            className={`mx-auto grid size-32 place-items-center rounded-full text-primary-foreground transition ${
              recording ? "animate-pulse bg-destructive" : "bg-primary"
            }`}
          >
            {recording ? <Square className="size-10" /> : <Mic className="size-12" />}
          </button>
          <p className="text-sm font-medium">{recording ? "Listening… speak now" : "Tap the mic and speak"}</p>

          {transcript && (
            <div className="rounded-2xl bg-accent p-4 text-left">
              <p className="text-xs font-semibold text-accent-foreground">What we heard (हिन्दी)</p>
              <p className="mt-1 text-base">{transcript}</p>
              {!recording && (
                <>
                  <p className="mt-3 text-xs font-semibold text-accent-foreground">Translation</p>
                  <p className="text-sm text-muted-foreground">{VOICE_SCRIPT_EN}</p>
                </>
              )}
            </div>
          )}

          <details className="rounded-2xl border border-border p-3 text-left text-sm">
            <summary className="min-h-11 cursor-pointer font-medium">Can&apos;t speak now? Type instead</summary>
            <textarea
              className="mt-2 w-full rounded-2xl border border-border bg-background p-3"
              rows={3}
              placeholder="Blue pottery jug, handmade…"
              onChange={(e) => setTranscript(e.target.value)}
            />
          </details>

          <BigButton className="w-full" disabled={!transcript || recording} onClick={() => setStep(1)}>
            Next: take a photo <ArrowRight className="size-5" />
          </BigButton>
        </Card>
      )}

      {/* Step 1: Photo (Part A: Capture, Part B: Auto-enhanced side-by-side comparison) */}
      {step === 1 && !photoTaken && (
        <Card className="space-y-4 text-center">
          <h2 className="font-display text-xl font-semibold">Take a photo of your craft</h2>
          <p className="text-sm text-muted-foreground">
            Point your camera at your product. AI will automatically enhance lighting and background once taken.
          </p>

          <button
            onClick={takePhoto}
            aria-label="Click photo"
            disabled={capturing}
            className={`mx-auto grid size-32 place-items-center rounded-full text-primary-foreground transition ${
              capturing ? "animate-ping bg-accent" : "bg-primary hover:bg-primary/90"
            }`}
          >
            <Camera className="size-12" />
          </button>

          <p className="text-sm font-medium">
            {capturing ? "Clicking picture…" : "Tap the camera to click photo"}
          </p>

          <div className="rounded-2xl bg-accent p-3 text-xs text-left text-accent-foreground">
            <Sparkles className="inline size-4 mr-1 shrink-0" />
            Simple camera option — just like the mic option. The AI automatically enhances light and background as soon as you take the photo.
          </div>

          <div className="flex gap-2">
            <BigButton variant="outline" className="flex-1" onClick={handleBack}>
              <ArrowLeft className="size-4" /> Back to Speak
            </BigButton>
          </div>
        </Card>
      )}

      {step === 1 && photoTaken && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">Auto-enhanced comparison</h2>
            <Pill tone={enhanced ? "success" : "warn"}>
              {enhanced ? "AI Enhanced ✓" : "Auto-enhancing photo…"}
            </Pill>
          </div>

          {/* Side by side comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Before — your photo</p>
              <div className="grid aspect-square place-items-center rounded-2xl bg-muted text-5xl grayscale">🏺</div>
              <Pill tone="muted">Original photo</Pill>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">After — AI enhanced</p>
              <div
                className={`grid aspect-square place-items-center rounded-2xl text-5xl transition ${
                  enhanced
                    ? "bg-gradient-to-br from-marigold/40 to-primary/25 shadow-inner"
                    : "animate-pulse bg-muted opacity-50"
                }`}
              >
                🏺
              </div>
              <Pill tone={enhanced ? "success" : "warn"}>
                {enhanced ? "Clean background, true colours" : "Working…"}
              </Pill>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-accent p-3 text-xs text-accent-foreground">
            <Sparkles className="size-4 shrink-0" />
            Every photo is auto-enhanced upon capture. Only light and background are refined — your original craft remains 100% authentic.
          </div>

          <div className="space-y-2">
            <BigButton variant="outline" className="w-full" onClick={() => { setPhotoTaken(false); setEnhanced(false); }}>
              <Camera className="size-5" /> Retake photo
            </BigButton>
            <BigButton className="w-full" disabled={!enhanced} onClick={runAI}>
              {thinking ? "Understanding your words…" : "Let AI fill the details"} <ArrowRight className="size-5" />
            </BigButton>
            <BigButton variant="ghost" className="w-full text-xs text-muted-foreground" onClick={handleBack}>
              <ArrowLeft className="size-4" /> Back to Camera
            </BigButton>
          </div>
        </Card>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Product details</h2>
            <Pill tone="success">Voice &amp; Narrate Enabled</Pill>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border p-3">
            <button
              type="button"
              onClick={dictateAll.start}
              aria-label="Dictate all details"
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                dictateAll.listening ? "animate-pulse bg-destructive text-primary-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              {dictateAll.listening ? <Square className="size-4" /> : <Mic className="size-5" />}
            </button>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold">{dictateAll.listening ? "Listening…" : "Dictate all details"}</p>
              <p className="text-xs text-muted-foreground">Speak to fill all lines at once.</p>
            </div>
            <button
              type="button"
              onClick={() => speak(`Product details: ${fullDetailsText}`)}
              aria-label="Listen to all details"
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-border px-3 text-xs font-semibold ${
                speaking === `Product details: ${fullDetailsText}` ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
              }`}
            >
              <Volume2 className="size-4" /> Narrate all
            </button>
          </div>

          {/* Each field has both Mic & Narrate options */}
          {Object.entries(fields).map(([k, v]) => (
            <MicField
              key={k}
              label={FIELD_LABELS[k] ?? k}
              value={v}
              onChange={(nv) => setFields({ ...fields, [k]: nv })}
              sample={SPOKEN_FIELDS[k] ?? v}
            />
          ))}

          <p className="text-xs text-muted-foreground">
            Tap the mic on any field to speak changes, or tap the speaker icon to listen to what is written.
          </p>

          <div className="space-y-2">
            <BigButton className="w-full" onClick={() => setStep(3)}>
              Next: fair price <ArrowRight className="size-5" />
            </BigButton>
            <BigButton variant="outline" className="w-full" onClick={handleBack}>
              <ArrowLeft className="size-4" /> Back to Photo
            </BigButton>
          </div>
        </Card>
      )}

      {/* Step 3: Price (Manual & Voice Input, No Slider) */}
      {step === 3 && (
        <Card className="space-y-4">
          <h2 className="font-display text-xl font-semibold">A fair price for this</h2>
          <div className="rounded-2xl bg-accent p-4 text-center">
            <p className="text-xs text-accent-foreground">Suggested range</p>
            <p className="font-display text-3xl font-bold">₹1,250 – ₹1,750</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Set your amount (type or speak)</p>
            
            {/* Direct manual number entry + mic button */}
            <div className="flex items-center gap-2">
              <div className="flex min-h-13 w-full min-w-0 items-center rounded-2xl border border-border bg-background px-4">
                <IndianRupee className="size-5 shrink-0 text-muted-foreground" />
                <input
                  type="number"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  aria-label="Your price in rupees"
                  className="w-full bg-transparent py-2 font-display text-2xl font-bold outline-none"
                />
              </div>
              <MicButton sample="1450" label="Speak price" onResult={(v) => setPrice(Number(v))} className="size-13" />
            </div>

            {/* Quick manual price adjustment buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrice((p) => Math.max(0, p - 50))}
                className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-2xl border border-border bg-card text-xs font-semibold hover:bg-accent"
              >
                <Minus className="size-3.5" /> ₹50
              </button>
              <button
                type="button"
                onClick={() => setPrice((p) => p + 50)}
                className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-2xl border border-border bg-card text-xs font-semibold hover:bg-accent"
              >
                <Plus className="size-3.5" /> ₹50
              </button>
              <button
                type="button"
                onClick={() => setPrice((p) => p + 100)}
                className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-2xl border border-border bg-card text-xs font-semibold hover:bg-accent"
              >
                <Plus className="size-3.5" /> ₹100
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tap the mic to speak your price, or type the amount manually.
            </p>
            <p className="text-xs text-muted-foreground">
              {price < 1250
                ? "Below fair range — you may be underselling your 14 days of work."
                : price > 1750
                  ? "Above range — expect slower sales, but premium buyers do pay this."
                  : "Inside the fair range."}
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-border p-3 text-sm">
            <p className="font-semibold">Why this range?</p>
            <Reason label="Material cost" value="₹310" />
            <Reason label="14 days of your work at ₹55/hr" value="₹620" />
            <Reason label="Firing, glaze, packing" value="₹180" />
            <Reason label="Similar jugs sold online (last 60 days)" value="₹1,300 – ₹1,900" />
            <Reason label="Festival demand right now" value="High ↑" />
          </div>

          <SpeakButton
            text="Your fair price range is one thousand two hundred fifty to one thousand seven hundred fifty rupees, because your material cost is three hundred ten rupees and fourteen days of work."
            label="Explain in my language"
          />

          <div className="space-y-2">
            <BigButton className="w-full" onClick={() => setStep(4)}>
              Next: your story <ArrowRight className="size-5" />
            </BigButton>
            <BigButton variant="outline" className="w-full" onClick={handleBack}>
              <ArrowLeft className="size-4" /> Back to Details
            </BigButton>
          </div>
        </Card>
      )}

      {/* Step 4: Story */}
      {step === 4 && (
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <ScrollText className="size-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Heritage story</h2>
          </div>
          <p className="rounded-2xl bg-accent p-4 text-sm leading-relaxed">
            Shaped without a speck of clay — Jaipur blue pottery uses quartz powder, glass and fuller&apos;s earth, a
            technique carried from Persia to Rajasthan in the 14th century. This jug was turned, dried and
            cobalt-glazed by hand over fourteen days in Kot Jewar.
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill tone="primary">GI craft: Blue Pottery of Jaipur</Pill>
            <Pill tone="primary">Village: Kot Jewar</Pill>
            <Pill tone="primary">Natural, lead-free glaze</Pill>
            <Pill tone="primary">Handmade · 14 days</Pill>
          </div>
          <p className="text-xs text-muted-foreground">
            Stories like this lift the price buyers accept by roughly 20–30% in our pilot data.
          </p>
          <div className="space-y-2">
            <BigButton className="w-full" onClick={() => setStep(5)}>
              Review everything <ArrowRight className="size-5" />
            </BigButton>
            <BigButton variant="outline" className="w-full" onClick={handleBack}>
              <ArrowLeft className="size-4" /> Back to Price
            </BigButton>
          </div>
        </Card>
      )}

      {/* Step 5: Approve */}
      {step === 5 && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-display text-xl font-semibold">You approve, then it goes live</h2>
            <div className="flex gap-3">
              <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-marigold/40 to-primary/25 text-4xl">
                🏺
              </div>
              <div>
                <p className="font-semibold">{fields["name"]}</p>
                <p className="text-sm text-muted-foreground">{fields["material"]}</p>
                <p className="mt-1 font-display text-xl font-bold">₹{price}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-accent p-3 text-xs">
              Nothing is published until you tap approve. SHILPSETU never posts, prices or replies on your behalf
              without this step.
            </div>
            <SpeakButton text={`${fields["name"]}, price ${price} rupees, ${fields["stock"]} pieces ready.`} label="Read it back to me" />
            {!saved ? (
              <div className="space-y-2">
                <BigButton
                  className="w-full"
                  onClick={() => {
                    enqueue(`${fields["name"]} — new listing`);
                    setSaved(true);
                  }}
                >
                  <CheckCircle2 className="size-5" /> Approve &amp; publish
                </BigButton>
                <BigButton variant="outline" className="w-full" onClick={handleBack}>
                  <ArrowLeft className="size-4" /> Back to Story
                </BigButton>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl bg-success/15 p-4 text-sm text-success-ink">
                  <p className="font-semibold">Saved on your phone ✓</p>
                  <p>
                    {online
                      ? "You are online — it is syncing to the marketplace now."
                      : "You are offline. It will publish automatically the moment a signal returns. Nothing will be lost."}
                  </p>
                </div>
                <BigButton variant="outline" className="w-full" onClick={() => navigate({ to: "/catalog" })}>
                  See it in my catalog
                </BigButton>
              </div>
            )}
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Reason({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
