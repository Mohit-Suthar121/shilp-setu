import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkle, Pencil } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill } from "@/components/ui-bits";
import { MESSAGES } from "@/lib/mock";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Buyer messages & AI replies — SHILPSETU" },
      {
        name: "description",
        content: "AI drafts buyer replies in English and your own language — you approve before anything is sent.",
      },
      { property: "og:title", content: "Buyer messages & AI replies — SHILPSETU" },
      { property: "og:description", content: "Artisan-approved AI replies to buyers, offline-safe." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { enqueue } = useApp();
  const [sent, setSent] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => Object.fromEntries(MESSAGES.map((m) => [m.id, m.draft])));

  return (
    <AppShell title="Messages" subtitle="AI writes · you approve · then it sends">
      <Section title="Waiting for your approval" action={<Pill tone="warn">{MESSAGES.length - sent.length} drafts</Pill>}>
        <div className="space-y-4">
          {MESSAGES.map((m) => (
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

              <div className="rounded-2xl rounded-tl-sm bg-muted p-3 text-sm">{m.text}</div>

              <div className="rounded-2xl border border-primary/30 bg-primary/8 p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary">
                  <Sparkle className="size-3.5" /> AI draft reply
                </p>
                {editing === m.id ? (
                  <textarea
                    value={drafts[m.id] ?? ""}
                    onChange={(e) => setDrafts({ ...drafts, [m.id]: e.target.value })}
                    rows={4}
                    className="w-full rounded-2xl border border-border bg-background p-3 text-sm"
                  />
                ) : (
                  <p className="text-sm">{drafts[m.id]}</p>
                )}
                <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                  In your language: {m.draftLocal}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <SpeakButton text={drafts[m.id] ?? ""} label="Read to me" />
                <BigButton variant="outline" className="min-h-11 text-sm" onClick={() => setEditing(editing === m.id ? null : m.id)}>
                  <Pencil className="size-4" /> {editing === m.id ? "Done editing" : "Change words"}
                </BigButton>
                {sent.includes(m.id) ? (
                  <Pill tone="success">Approved &amp; queued</Pill>
                ) : (
                  <BigButton
                    className="min-h-11 flex-1 text-sm"
                    onClick={() => {
                      setSent((s) => [...s, m.id]);
                      enqueue(`Reply to ${m.buyer} approved`);
                    }}
                  >
                    <Send className="size-4" /> Approve &amp; send
                  </BigButton>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Card className="bg-accent">
        <p className="text-sm font-semibold">Nothing is sent on its own</p>
        <p className="text-sm text-muted-foreground">
          The assistant only drafts. Every message carries your approval, and drafts written offline wait safely until
          you are back online.
        </p>
      </Card>
    </AppShell>
  );
}
