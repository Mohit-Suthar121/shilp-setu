import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Volume2,
  Languages,
  Download,
  LogOut,
  Type,
  MapPin,
  Edit2,
  Check,
  Loader2,
  Navigation,
} from "lucide-react";
import { AppShell, Section } from "@/components/AppShell";
import { BigButton, Card, Pill, Stat } from "@/components/ui-bits";
import { MicField } from "@/components/MicInput";
import { useApp } from "@/lib/app-state";
import { LANGUAGES, CRAFTS } from "@/lib/mock";
import { detectArtisanLocation, ARTISAN_CLUSTERS } from "@/lib/location";
import { speakText } from "@/lib/voice";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & settings — SHILPSETU" },
      {
        name: "description",
        content: "Language, voice, text size, offline downloads and your artisan profile.",
      },
      { property: "og:title", content: "Profile & settings — SHILPSETU" },
      { property: "og:description", content: "Accessibility and offline settings for artisans." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const {
    profile,
    setProfile,
    queue,
    lastSync,
    bigText,
    setBigText,
    voiceFirst,
    setVoiceFirst,
    lessonsDownloaded,
    downloadLessonsOffline,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState<string | null>(null);

  // Edit draft state
  const [draftName, setDraftName] = useState(profile?.name || "");
  const [draftPhone, setDraftPhone] = useState(profile?.phone || "");
  const [draftVillage, setDraftVillage] = useState(profile?.village || "");
  const [draftCraft, setDraftCraft] = useState(profile?.craft || "");

  if (!profile) return null;

  const handleSaveProfile = () => {
    setProfile({
      ...profile,
      name: draftName,
      phone: draftPhone,
      village: draftVillage,
      craft: draftCraft,
    });
    setEditing(false);
  };

  const handleDetectLocation = async () => {
    setLocating(true);
    setLocationMsg(null);
    try {
      const loc = await detectArtisanLocation({ timeoutMs: 10000 });
      setDraftVillage(loc.displayName);
      setLocationMsg(`Detected: ${loc.displayName}`);
    } catch (err: unknown) {
      setLocationMsg(err instanceof Error ? err.message : "Location access unavailable.");
    } finally {
      setLocating(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    await downloadLessonsOffline();
    setDownloading(false);
  };

  const handleLanguageChange = (code: string) => {
    setProfile({ ...profile, lang: code });
    const langObj = LANGUAGES.find((l) => l.code === code);
    if (langObj) {
      speakText(langObj.greeting, code);
    }
  };

  return (
    <AppShell title="Profile & settings">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-3xl bg-primary text-2xl text-primary-foreground font-bold shadow-md">
              {profile.name[0]}
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold">{profile.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0 text-primary" />
                <span>
                  +91 {profile.phone} · {profile.village}
                </span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill tone="primary">{profile.craft}</Pill>
                <Pill tone="success">Verified artisan ✓</Pill>
              </div>
            </div>
          </div>
          <BigButton
            variant="outline"
            className="min-h-10 px-3 text-xs"
            onClick={() => {
              if (!editing) {
                setDraftName(profile.name);
                setDraftPhone(profile.phone);
                setDraftVillage(profile.village);
                setDraftCraft(profile.craft);
              }
              setEditing(!editing);
            }}
          >
            <Edit2 className="size-3.5" /> {editing ? "Cancel" : "Edit"}
          </BigButton>
        </div>

        {/* Profile editing form with real GPS & voice fields */}
        {editing && (
          <div className="space-y-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Update Artisan Profile &amp; Location
            </p>

            <MicField
              label="Your Name"
              value={draftName}
              onChange={setDraftName}
              sample="Sunita Devi"
            />

            <MicField
              label="Mobile Number"
              value={draftPhone}
              onChange={setDraftPhone}
              sample="9876543210"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Village / Workshop Location
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  {locating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Navigation className="size-3" />
                  )}
                  {locating ? "Detecting GPS…" : "Detect GPS Location"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={draftVillage}
                  onChange={(e) => setDraftVillage(e.target.value)}
                  placeholder="e.g. Kot Jewar, Jaipur, Rajasthan"
                  className="min-h-12 w-full rounded-2xl border border-border bg-background px-4 text-base"
                />
              </div>
              {locationMsg && <p className="text-xs text-muted-foreground">{locationMsg}</p>}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ARTISAN_CLUSTERS.slice(0, 4).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setDraftVillage(`${c.name}, ${c.state}`);
                      setDraftCraft(c.craft);
                    }}
                    className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Craft
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CRAFTS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setDraftCraft(c.name)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      draftCraft === c.name
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <BigButton className="w-full mt-2" onClick={handleSaveProfile}>
              <Check className="size-4" /> Save changes
            </BigButton>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Lifetime earnings" value="₹3.1L" />
        <Stat label="Repeat buyers" value="41%" />
        <Stat label="Rating" value="4.8 ★" />
        <Stat label="Days on app" value="212" />
      </div>

      <Section title="Language">
        <Card>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Languages className="size-4 text-primary" /> App, voice and buyer replies
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium transition ${
                  profile.lang === l.code
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {l.label} ({l.en})
              </button>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Accessibility">
        <div className="space-y-3">
          <Toggle
            icon={<Volume2 className="size-5" />}
            title="Voice-first mode"
            body="Every screen reads itself out and enables active spoken commands."
            on={voiceFirst}
            set={setVoiceFirst}
          />
          <Toggle
            icon={<Type className="size-5" />}
            title="Bigger text & buttons"
            body="Larger font and taller touch targets for outdoor sun and easy tapping."
            on={bigText}
            set={setBigText}
          />
        </div>
      </Section>

      <Section title="Offline storage">
        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Download className="size-4 text-primary" /> Data on this phone
          </div>
          <p className="text-sm text-muted-foreground">
            {queue.length} changes waiting · last sync {lastSync} ·{" "}
            {lessonsDownloaded
              ? "18 MB stored (catalog, all lessons & audio cached)"
              : "12 MB stored (catalog, buyer chats)"}
          </p>
          <BigButton
            variant="outline"
            className="w-full text-sm min-h-11"
            disabled={downloading || lessonsDownloaded}
            onClick={handleDownload}
          >
            {downloading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Downloading offline audio pack…
              </span>
            ) : lessonsDownloaded ? (
              <span className="flex items-center gap-1.5 text-success-ink font-semibold">
                <Check className="size-4" /> Lessons &amp; voice cached offline
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="size-4" /> Download lessons for offline use
              </span>
            )}
          </BigButton>
        </Card>
      </Section>

      <BigButton
        variant="outline"
        className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => {
          if (confirm("Reset demo data and restart from onboarding?")) {
            localStorage.clear();
            location.href = "/";
          }
        }}
      >
        <LogOut className="size-5" /> Sign out (restart demo)
      </BigButton>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        SHILPSETU · Smart India Hackathon prototype · Voice-first, offline-first.
      </p>
    </AppShell>
  );
}

function Toggle({
  icon,
  title,
  body,
  on,
  set,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  on: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <Card className="flex items-center gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={() => set(!on)}
        className={`h-8 w-14 shrink-0 rounded-full p-1 transition ${on ? "bg-primary" : "bg-border"}`}
      >
        <span
          className={`block size-6 rounded-full bg-card shadow-sm transition ${on ? "translate-x-6" : ""}`}
        />
      </button>
    </Card>
  );
}
