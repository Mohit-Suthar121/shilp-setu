import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Mic,
  Camera,
  IndianRupee,
  ScrollText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Square,
  Sparkles,
  Volume2,
  Plus,
  Minus,
  Upload,
} from "lucide-react";
import { AppShell, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill } from "@/components/ui-bits";
import { MicButton, MicField } from "@/components/MicInput";
import { useApp } from "@/lib/app-state";
import { VOICE_SCRIPT, VOICE_SCRIPT_EN, Product } from "@/lib/mock";
import { useSpeechRecognition, extractNumberFromSpeech, parseProductFromSpeech } from "@/lib/voice";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a listing by voice — SHILPSETU" },
      {
        name: "description",
        content:
          "Speak in your language, add a photo, and SHILPSETU turns it into a priced, story-rich listing.",
      },
      { property: "og:title", content: "Create a listing by voice — SHILPSETU" },
      {
        property: "og:description",
        content: "Voice to structured listing with fair pricing and heritage story.",
      },
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

function getEmojiForCraft(name: string): string {
  const s = name.toLowerCase();
  if (s.includes("pottery") || s.includes("jug") || s.includes("मिट्टी")) return "🏺";
  if (s.includes("diya") || s.includes("terracotta") || s.includes("दीया")) return "🪔";
  if (s.includes("stole") || s.includes("kantha") || s.includes("silk") || s.includes("sari"))
    return "🧵";
  if (s.includes("madhubani") || s.includes("art") || s.includes("painting")) return "🎨";
  if (s.includes("dokra") || s.includes("bell") || s.includes("brass")) return "🔔";
  if (s.includes("bamboo")) return "🎍";
  if (s.includes("block")) return "🖨️";
  return "✨";
}

function CreateFlow() {
  const { online, speak, speaking, addProduct, profile } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fields, setFields] = useState<Record<string, string>>({ ...SPOKEN_FIELDS });
  const [price, setPrice] = useState(1450);

  // Real Speech Recognition for product description
  const {
    listening: recording,
    interimText,
    toggle: toggleRecording,
    stop: stopRecording,
  } = useSpeechRecognition({
    langCode: profile?.lang || "hi",
    sampleFallback: VOICE_SCRIPT,
    continuous: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        setTranscript((prev) => (prev ? `${prev} ${text}` : text));
      }
    },
    onFinal: (text) => {
      setTranscript((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  // Real Speech Recognition for "Dictate all details"
  const { listening: dictatingAll, toggle: toggleDictateAll } = useSpeechRecognition({
    langCode: profile?.lang || "hi",
    sampleFallback: VOICE_SCRIPT,
    onFinal: (text) => {
      const parsed = parseProductFromSpeech(text);
      setFields((prev) => ({ ...prev, ...parsed }));
    },
  });

  // Auto-fill fields from transcript when moving to Details step
  const runAI = () => {
    setThinking(true);
    setTimeout(() => {
      if (transcript) {
        const parsed = parseProductFromSpeech(transcript);
        setFields((prev) => ({ ...prev, ...parsed }));
      }
      setThinking(false);
      setStep(2);
    }, 1000);
  };

  const handleUseSampleVoice = () => {
    stopRecording();
    setTranscript(VOICE_SCRIPT);
    const parsed = parseProductFromSpeech(VOICE_SCRIPT);
    setFields((prev) => ({ ...prev, ...parsed }));
  };

  // Camera / photo upload handling
  const takePhoto = () => {
    setCapturing(true);
    setTimeout(() => {
      setCapturing(false);
      setPhotoTaken(true);
      setTimeout(() => setEnhanced(true), 600);
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setPhotoTaken(true);
        setTimeout(() => setEnhanced(true), 600);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      navigate({ to: "/" });
    } else if (step === 1 && photoTaken) {
      setPhotoTaken(false);
      setEnhanced(false);
      setUploadedImage(null);
    } else {
      setStep((s) => s - 1);
    }
  };

  const fullDetailsText = Object.entries(fields)
    .map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${v}`)
    .join(". ");

  const craftVillage = profile?.village || "Kot Jewar, Jaipur, Rajasthan";
  const heritageStory = `Handcrafted with heritage tradition in ${craftVillage}. Every curve, motif and finish is shaped by master hands using time-honored artisanal methods passed down through generations. Authentically made with natural raw materials.`;

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
            <p
              className={`mt-1 text-[10px] ${i === step ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
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
            Say what it is, what it&apos;s made of, how long it took, and how many you have. Any
            Indian language.
          </p>

          <button
            onClick={toggleRecording}
            aria-label={recording ? "Stop recording" : "Start recording"}
            title={recording ? "Tap to stop recording" : "Tap to speak into microphone"}
            className={`mx-auto grid size-32 place-items-center rounded-full text-primary-foreground transition shadow-lg active:scale-95 ${
              recording
                ? "animate-pulse bg-destructive ring-8 ring-destructive/20"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {recording ? <Square className="size-10" /> : <Mic className="size-12" />}
          </button>

          <p className="text-sm font-semibold">
            {recording
              ? "Listening live… speak in your language"
              : "Tap the mic and speak out loud"}
          </p>

          {(transcript || (recording && interimText)) && (
            <div className="rounded-2xl bg-accent p-4 text-left border border-border">
              <p className="text-xs font-semibold text-accent-foreground">
                What we heard {recording && "(speaking…)"}
              </p>
              <p className="mt-1 text-base text-foreground font-medium">
                {transcript}{" "}
                {recording && interimText && (
                  <span className="opacity-60 italic">{interimText}</span>
                )}
              </p>
              {!recording && (
                <>
                  <p className="mt-3 text-xs font-semibold text-accent-foreground">
                    English Translation / Meaning
                  </p>
                  <p className="text-sm text-muted-foreground">{VOICE_SCRIPT_EN}</p>
                </>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleUseSampleVoice}
              className="text-xs text-primary underline underline-offset-4 hover:opacity-80 py-1 px-2"
            >
              Or load sample artisan audio description
            </button>
          </div>

          <details className="rounded-2xl border border-border p-3 text-left text-sm">
            <summary className="min-h-11 cursor-pointer font-medium">
              Can&apos;t speak now? Type instead
            </summary>
            <textarea
              className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-sm"
              rows={3}
              value={transcript}
              placeholder="Blue pottery jug, handmade with quartz clay…"
              onChange={(e) => setTranscript(e.target.value)}
            />
          </details>

          <BigButton
            className="w-full"
            disabled={!transcript && !interimText}
            onClick={() => {
              if (recording) stopRecording();
              setStep(1);
            }}
          >
            Next: take a photo <ArrowRight className="size-5" />
          </BigButton>
        </Card>
      )}

      {/* Step 1: Photo (Part A: Capture/Upload, Part B: Auto-enhanced side-by-side comparison) */}
      {step === 1 && !photoTaken && (
        <Card className="space-y-4 text-center">
          <h2 className="font-display text-xl font-semibold">
            Take or upload a photo of your craft
          </h2>
          <p className="text-sm text-muted-foreground">
            Click a picture or upload from your device. AI will automatically enhance lighting and
            background once taken.
          </p>

          <div className="flex flex-col items-center justify-center gap-3">
            <button
              onClick={takePhoto}
              aria-label="Click photo"
              disabled={capturing}
              className={`grid size-32 place-items-center rounded-full text-primary-foreground transition shadow-lg active:scale-95 ${
                capturing ? "animate-ping bg-accent" : "bg-primary hover:bg-primary/90"
              }`}
            >
              <Camera className="size-12" />
            </button>

            <p className="text-sm font-semibold">
              {capturing ? "Clicking picture…" : "Tap the camera to click photo"}
            </p>

            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-primary hover:bg-accent"
              >
                <Upload className="size-3.5" /> Upload photo from phone gallery
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-accent p-3 text-xs text-left text-accent-foreground">
            <Sparkles className="inline size-4 mr-1 shrink-0" />
            Simple camera option — just like the mic option. The AI automatically enhances light and
            background as soon as you take the photo.
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
              <div className="grid aspect-square place-items-center rounded-2xl bg-muted text-5xl grayscale overflow-hidden">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Original craft"
                    className="size-full object-cover grayscale"
                  />
                ) : (
                  <span>{getEmojiForCraft(fields["name"])}</span>
                )}
              </div>
              <Pill tone="muted">Original photo</Pill>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">After — AI enhanced</p>
              <div
                className={`grid aspect-square place-items-center rounded-2xl text-5xl transition overflow-hidden ${
                  enhanced
                    ? "bg-gradient-to-br from-marigold/40 to-primary/25 shadow-inner"
                    : "animate-pulse bg-muted opacity-50"
                }`}
              >
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Enhanced craft"
                    className="size-full object-cover contrast-110 saturate-125"
                  />
                ) : (
                  <span>{getEmojiForCraft(fields["name"])}</span>
                )}
              </div>
              <Pill tone={enhanced ? "success" : "warn"}>
                {enhanced ? "Clean background, true colours" : "Working…"}
              </Pill>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-accent p-3 text-xs text-accent-foreground">
            <Sparkles className="size-4 shrink-0" />
            Every photo is auto-enhanced upon capture. Only light and background are refined — your
            original craft remains 100% authentic.
          </div>

          <div className="space-y-2">
            <BigButton
              variant="outline"
              className="w-full"
              onClick={() => {
                setPhotoTaken(false);
                setEnhanced(false);
                setUploadedImage(null);
              }}
            >
              <Camera className="size-5" /> Retake photo
            </BigButton>
            <BigButton className="w-full" disabled={!enhanced} onClick={runAI}>
              {thinking ? "Understanding your words…" : "Let AI fill the details"}{" "}
              <ArrowRight className="size-5" />
            </BigButton>
            <BigButton
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={handleBack}
            >
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

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border p-3 bg-muted/20">
            <button
              type="button"
              onClick={toggleDictateAll}
              aria-label="Dictate all details"
              className={`grid size-12 shrink-0 place-items-center rounded-2xl transition shadow-sm active:scale-95 ${
                dictatingAll
                  ? "animate-pulse bg-destructive text-destructive-foreground ring-4 ring-destructive/20"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {dictatingAll ? <Square className="size-4" /> : <Mic className="size-5" />}
            </button>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold">
                {dictatingAll ? "Listening live…" : "Dictate all details"}
              </p>
              <p className="text-xs text-muted-foreground">
                Speak out loud to auto-fill all lines at once.
              </p>
            </div>
            <button
              type="button"
              onClick={() => speak(`Product details: ${fullDetailsText}`)}
              aria-label="Listen to all details"
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-border px-3 text-xs font-semibold ${
                speaking === `Product details: ${fullDetailsText}`
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground"
              }`}
            >
              <Volume2 className="size-4" /> Narrate all
            </button>
          </div>

          {/* Each field has both Mic & Narrate options with real speech recognition */}
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
            Tap the mic on any field to speak changes, or tap the speaker icon to listen to what is
            written.
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

      {/* Step 3: Price */}
      {step === 3 && (
        <Card className="space-y-4">
          <h2 className="font-display text-xl font-semibold">A fair price for this</h2>
          <div className="rounded-2xl bg-accent p-4 text-center">
            <p className="text-xs text-accent-foreground font-semibold">Suggested fair band</p>
            <p className="font-display text-3xl font-bold text-primary">₹1,250 – ₹1,750</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Set your amount (type or speak)</p>

            {/* Direct manual number entry + real mic button */}
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
              <MicButton
                sample="1450"
                label="Speak price"
                onResult={(v) => {
                  const num = extractNumberFromSpeech(v);
                  if (num && num > 0) setPrice(num);
                }}
                className="size-13"
              />
            </div>

            {/* Quick manual price adjustment buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrice((p) => Math.max(0, p - 50))}
                className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-2xl border border-border bg-card text-xs font-semibold hover:bg-accent active:scale-95"
              >
                <Minus className="size-3.5" /> ₹50
              </button>
              <button
                type="button"
                onClick={() => setPrice((p) => p + 50)}
                className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-2xl border border-border bg-card text-xs font-semibold hover:bg-accent active:scale-95"
              >
                <Plus className="size-3.5" /> ₹50
              </button>
              <button
                type="button"
                onClick={() => setPrice((p) => p + 100)}
                className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-2xl border border-border bg-card text-xs font-semibold hover:bg-accent active:scale-95"
              >
                <Plus className="size-3.5" /> ₹100
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tap the mic to speak your price, or tap buttons to adjust.
            </p>
            <p className="text-xs font-medium">
              {price < 1250 ? (
                <span className="text-destructive">
                  Below fair range — you may be underselling your time &amp; craft.
                </span>
              ) : price > 1750 ? (
                <span className="text-marigold-foreground">
                  Above range — premium pricing, ensure high finishing.
                </span>
              ) : (
                <span className="text-success-ink">Inside the fair market range ✓</span>
              )}
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-border p-3 text-sm">
            <p className="font-semibold">Why this range?</p>
            <Reason label="Material cost" value="₹310" />
            <Reason label={`${fields["time"] || "14 days"} of your artisan work`} value="₹620" />
            <Reason label="Firing, glaze & packing" value="₹180" />
            <Reason label="Similar items sold online (last 60 days)" value="₹1,300 – ₹1,900" />
            <Reason label="Festival demand right now" value="High ↑" />
          </div>

          <SpeakButton
            text={`Your fair price range is one thousand two hundred fifty to one thousand seven hundred fifty rupees, based on your material costs and ${fields["time"] || "fourteen days"} of work.`}
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
          <p className="rounded-2xl bg-accent p-4 text-sm leading-relaxed">{heritageStory}</p>
          <div className="flex flex-wrap gap-2">
            <Pill tone="primary">Craft: {fields["category"] || profile?.craft || "Handmade"}</Pill>
            <Pill tone="primary">Origin: {craftVillage}</Pill>
            <Pill tone="primary">Natural, artisan materials</Pill>
            <Pill tone="primary">Time: {fields["time"] || "14 days"}</Pill>
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
              <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-marigold/40 to-primary/25 text-4xl overflow-hidden">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt={fields["name"]}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{getEmojiForCraft(fields["name"])}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{fields["name"]}</p>
                <p className="text-sm text-muted-foreground truncate">{fields["material"]}</p>
                <p className="mt-1 font-display text-xl font-bold">₹{price}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-accent p-3 text-xs">
              Nothing is published until you tap approve. SHILPSETU never posts, prices or replies
              on your behalf without this step.
            </div>
            <SpeakButton
              text={`${fields["name"]}, price ${price} rupees, ${fields["stock"]} pieces ready.`}
              label="Read it back to me"
            />
            {!saved ? (
              <div className="space-y-2">
                <BigButton
                  className="w-full"
                  onClick={() => {
                    const newProduct: Product = {
                      id: `p_${Date.now()}`,
                      name: fields["name"] || "Handmade Artisan Craft",
                      craft: fields["category"] || profile?.craft || "Handicraft",
                      material: fields["material"] || "Handmade natural material",
                      price: price,
                      low: Math.round(price * 0.85),
                      high: Math.round(price * 1.25),
                      stock: Number(fields["stock"]) || 6,
                      status: online ? "Live" : "Pending sync",
                      emoji: getEmojiForCraft(fields["name"]),
                      story: heritageStory,
                    };
                    addProduct(newProduct);
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
                      ? "You are online — it is now added to your catalog and visible in the marketplace!"
                      : "You are offline. It is saved in your local catalog and will sync automatically when signal returns."}
                  </p>
                </div>
                <BigButton
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate({ to: "/catalog" })}
                >
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
