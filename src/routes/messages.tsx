import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkle, Pencil, Mic, CheckCircle2, Volume2 } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill } from "@/components/ui-bits";
import { MicButton } from "@/components/MicInput";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Buyer messages & AI replies — SHILPSETU" },
      {
        name: "description",
        content:
          "AI drafts buyer replies in English and your own language — you approve before anything is sent.",
      },
      { property: "og:title", content: "Buyer messages & AI replies — SHILPSETU" },
      {
        property: "og:description",
        content: "Artisan-approved AI replies to buyers, offline-safe.",
      },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { messages, updateMessageDraft, sendMessageReply, profile } = useApp();
  const [editing, setEditing] = useState<string | null>(null);

  const pendingCount = messages.filter((m) => m.status !== "sent").length;

  return (
    <AppShell title="Messages" subtitle="AI writes · you approve · then it sends">
      <Section
        title="Waiting for your approval"
        action={<Pill tone={pendingCount > 0 ? "warn" : "success"}>{pendingCount} drafts</Pill>}
      >
        <div className="space-y-4">
          {messages.map((m) => {
            const isSent = m.status === "sent";

            return (
              <Card key={m.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-accent-foreground">
                    {m.buyer[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{m.buyer}</p>
                    <p className="text-xs text-muted-foreground">writes in {m.lang}</p>
                  </div>
                </div>

                <div className="rounded-2xl rounded-tl-sm bg-muted p-3 text-sm flex items-start justify-between gap-2">
                  <p className="flex-1">{m.text}</p>
                  <SpeakButton text={m.text} label="Listen" />
                </div>

                <div className="rounded-2xl border border-primary/30 bg-primary/8 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <Sparkle className="size-3.5" /> AI draft reply
                    </p>
                    {editing === m.id && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Mic className="size-3 text-primary" /> Voice dictation ready
                      </span>
                    )}
                  </div>

                  {editing === m.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-start">
                        <textarea
                          value={m.draft}
                          onChange={(e) => updateMessageDraft(m.id, e.target.value)}
                          rows={4}
                          className="w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <MicButton
                          sample={m.draft}
                          label="Speak edit"
                          langCode={profile?.lang || "hi"}
                          onResult={(spoken) => {
                            updateMessageDraft(m.id, `${m.draft} ${spoken}`.trim());
                          }}
                          className="size-11"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Speak into the microphone or type to adjust the reply.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{m.draft}</p>
                  )}

                  <div className="border-t border-border/50 pt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>In your language: {m.draftLocal}</span>
                    <SpeakButton text={m.draftLocal} label="In Hindi" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <SpeakButton text={m.draft} label="Read reply" />

                  {!isSent && (
                    <BigButton
                      variant="outline"
                      className="min-h-11 text-sm"
                      onClick={() => setEditing(editing === m.id ? null : m.id)}
                    >
                      <Pencil className="size-4" />{" "}
                      {editing === m.id ? "Done editing" : "Change words"}
                    </BigButton>
                  )}

                  {isSent ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-success-ink bg-success/15 px-3 py-2 rounded-2xl border border-success/30">
                      <CheckCircle2 className="size-4" /> Approved &amp; queued for dispatch
                    </div>
                  ) : (
                    <BigButton
                      className="min-h-11 flex-1 text-sm shadow-sm"
                      onClick={() => {
                        setEditing(null);
                        sendMessageReply(m.id);
                      }}
                    >
                      <Send className="size-4" /> Approve &amp; send
                    </BigButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Card className="bg-accent">
        <p className="text-sm font-semibold">Nothing is sent on its own</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          The assistant only drafts. Every message carries your approval, and drafts written offline
          wait safely until you are back online.
        </p>
      </Card>
    </AppShell>
  );
}
