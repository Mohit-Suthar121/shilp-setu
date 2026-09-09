import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Volume2, Languages, Download, LogOut, Type } from "lucide-react";
import { AppShell, Section } from "@/components/AppShell";
import { BigButton, Card, Pill, Stat } from "@/components/ui-bits";
import { useApp } from "@/lib/app-state";
import { LANGUAGES } from "@/lib/mock";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & settings — SHILPSETU" },
      { name: "description", content: "Language, voice, text size, offline downloads and your artisan profile." },
      { property: "og:title", content: "Profile & settings — SHILPSETU" },
      { property: "og:description", content: "Accessibility and offline settings for artisans." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { profile, setProfile, queue, lastSync } = useApp();
  const [big, setBig] = useState(false);
  const [voiceFirst, setVoiceFirst] = useState(true);

  if (!profile) return null;

  return (
    <AppShell title="Profile & settings">
      <Card className="flex items-center gap-4">
        <div className="grid size-16 place-items-center rounded-3xl bg-primary text-2xl text-primary-foreground">
          {profile.name[0]}
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold">{profile.name}</p>
          <p className="text-sm text-muted-foreground">
            +91 {profile.phone} · {profile.village}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill tone="primary">{profile.craft}</Pill>
            <Pill tone="success">Verified artisan</Pill>
          </div>
        </div>
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
            <Languages className="size-4" /> App, voice and buyer replies
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setProfile({ ...profile, lang: l.code })}
                className={`min-h-11 rounded-full border px-4 text-sm ${
                  profile.lang === l.code ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {l.label}
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
            body="Every screen reads itself out and accepts spoken commands."
            on={voiceFirst}
            set={setVoiceFirst}
          />
          <Toggle
            icon={<Type className="size-5" />}
            title="Bigger text & buttons"
            body="Larger type and taller touch targets for outdoor light."
            on={big}
            set={setBig}
          />
        </div>
      </Section>

      <Section title="Offline">
        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Download className="size-4" /> Data on this phone
          </div>
          <p className="text-sm text-muted-foreground">
            {queue.length} changes waiting · last sync {lastSync} · 18 MB stored (catalog, lessons, buyer chats)
          </p>
          <BigButton variant="outline" className="w-full">
            Download lessons for offline
          </BigButton>
        </Card>
      </Section>

      <BigButton
        variant="outline"
        className="w-full text-destructive"
        onClick={() => {
          localStorage.removeItem("shilpsetu.profile.v1");
          location.href = "/";
        }}
      >
        <LogOut className="size-5" /> Sign out (restart demo)
      </BigButton>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        SHILPSETU · Smart India Hackathon demonstration prototype. AI, payments and sync are simulated.
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
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">{icon}</div>
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
        <span className={`block size-6 rounded-full bg-card transition ${on ? "translate-x-6" : ""}`} />
      </button>
    </Card>
  );
}
