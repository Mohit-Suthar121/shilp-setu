import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Handshake, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card } from "@/components/ui-bits";
import { MicButton } from "@/components/MicInput";
import { BULK } from "@/lib/mock";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/bulk")({
  head: () => ({
    meta: [
      { title: "Bulk opportunities & AI negotiation — SHILPSETU" },
      {
        name: "description",
        content: "See bulk enquiries, an AI-recommended counter-offer with reasoning, and approve the final terms yourself.",
      },
      { property: "og:title", content: "Bulk opportunities & AI negotiation — SHILPSETU" },
      { property: "og:description", content: "Never undersell a bulk order again." },
    ],
  }),
  component: Bulk,
});

function Bulk() {
  const { enqueue } = useApp();
  const [approved, setApproved] = useState<string[]>([]);
  const [rates, setRates] = useState<Record<string, number>>(Object.fromEntries(BULK.map((b) => [b.id, b.recommend])));

  return (
    <AppShell title="Bulk opportunities" subtitle="2 live enquiries · ₹3.6L potential">
      <Section title="Enquiries">
        <div className="space-y-4">
          {BULK.map((b) => {
            const rate = rates[b.id] ?? b.recommend;
            const total = rate * b.qty;
            const belowFloor = rate < b.floor;
            const done = approved.includes(b.id);
            return (
              <Card key={b.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
                    <Handshake className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">{b.buyer}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.qty} × {b.item} · needs it in {b.days} days
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <Box label="They offered" value={`₹${b.offer}`} />
                  <Box label="AI suggests" value={`₹${b.recommend}`} highlight />
                  <Box label="Your floor" value={`₹${b.floor}`} />
                </div>

                <div className="rounded-2xl bg-accent p-3 text-sm">
                  <p className="mb-1 flex items-center gap-1 font-semibold text-accent-foreground">
                    <TrendingUp className="size-4" /> Why this counter-offer
                  </p>
                  <p className="text-muted-foreground">{b.note}</p>
                  <p className="mt-2 text-muted-foreground">
                    At ₹{b.offer} you would earn ₹{(b.offer * b.qty).toLocaleString("en-IN")} and lose money on
                    materials. At ₹{b.recommend} you earn ₹{(b.recommend * b.qty).toLocaleString("en-IN")} — a fair
                    margin for {b.days} days of dedicated work.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Your counter rate (type or speak)</span>
                    <span className="font-display text-2xl font-bold">₹{rate}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex min-h-13 w-full min-w-0 items-center gap-1 rounded-2xl border border-border bg-background px-4">
                      <span className="text-lg font-semibold text-muted-foreground">₹</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={rate}
                        onChange={(e) => setRates({ ...rates, [b.id]: Number(e.target.value) })}
                        aria-label={`Counter rate for ${b.buyer}`}
                        className="w-full bg-transparent py-2 font-display text-xl font-bold outline-none"
                      />
                    </div>
                    <MicButton
                      sample={String(b.recommend)}
                      label="Speak rate"
                      onResult={(v) => setRates({ ...rates, [b.id]: Number(v) })}
                      className="size-13"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tap the mic and speak your rate (e.g., &ldquo;{b.recommend} rupees&rdquo;), or enter custom amount manually.
                  </p>
                  <p className={`mt-1 text-xs ${belowFloor ? "text-destructive" : "text-success-ink"}`}>
                    {belowFloor
                      ? "Below your cost floor — you would lose money on this order."
                      : `Order value ₹${total.toLocaleString("en-IN")} · healthy margin`}
                  </p>
                </div>

                <SpeakButton
                  text={`${b.buyer} wants ${b.qty} ${b.item} at ${b.offer} rupees each. I suggest countering at ${b.recommend} rupees. Your cost floor is ${b.floor} rupees.`}
                  label="Explain to me"
                />

                {done ? (
                  <div className="rounded-2xl bg-success/15 p-3 text-sm text-success-ink">
                    <p className="font-semibold">You approved ₹{rate} per piece.</p>
                    <p>Counter-offer saved on your phone and queued for the buyer.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-2xl border border-border p-3 text-xs text-muted-foreground">
                      <ShieldCheck className="size-4 shrink-0 text-primary" />
                      The assistant will never accept, counter or commit a delivery date without this approval.
                    </div>
                    <div className="flex gap-2">
                      <BigButton variant="outline" className="min-h-12 text-sm">
                        Decline politely
                      </BigButton>
                      <BigButton
                        className="min-h-12 flex-1 text-sm"
                        disabled={belowFloor}
                        onClick={() => {
                          setApproved((a) => [...a, b.id]);
                          enqueue(`Counter-offer ₹${rate} to ${b.buyer}`);
                        }}
                      >
                        Approve &amp; send counter-offer
                      </BigButton>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Section>
    </AppShell>
  );
}

function Box({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 ${highlight ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
      <p className="text-[11px] opacity-80">{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}
