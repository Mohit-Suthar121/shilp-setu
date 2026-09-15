import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Handshake, ShieldCheck, TrendingUp, XCircle, CheckCircle2 } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card } from "@/components/ui-bits";
import { MicButton } from "@/components/MicInput";
import { useApp } from "@/lib/app-state";
import { extractNumberFromSpeech } from "@/lib/voice";

export const Route = createFileRoute("/bulk")({
  head: () => ({
    meta: [
      { title: "Bulk opportunities & AI negotiation — SHILPSETU" },
      {
        name: "description",
        content:
          "See bulk enquiries, an AI-recommended counter-offer with reasoning, and approve the final terms yourself.",
      },
      { property: "og:title", content: "Bulk opportunities & AI negotiation — SHILPSETU" },
      { property: "og:description", content: "Never undersell a bulk order again." },
    ],
  }),
  component: Bulk,
});

function Bulk() {
  const { bulkDeals, counterBulkDeal, declineBulkDeal } = useApp();
  const [rates, setRates] = useState<Record<string, number>>(() =>
    Object.fromEntries(bulkDeals.map((b) => [b.id, b.counterRate ?? b.recommend])),
  );

  return (
    <AppShell
      title="Bulk opportunities"
      subtitle={`${bulkDeals.length} live enquiries · ₹3.6L potential`}
    >
      <Section title="Enquiries">
        <div className="space-y-4">
          {bulkDeals.map((b) => {
            const rate = rates[b.id] ?? b.recommend;
            const total = rate * b.qty;
            const belowFloor = rate < b.floor;
            const isCountered = b.status === "countered";
            const isDeclined = b.status === "declined";

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
                    At ₹{b.offer} you would earn ₹{(b.offer * b.qty).toLocaleString("en-IN")} and
                    lose money on materials. At ₹{b.recommend} you earn ₹
                    {(b.recommend * b.qty).toLocaleString("en-IN")} — a fair margin for {b.days}{" "}
                    days of dedicated work.
                  </p>
                </div>

                {!isDeclined && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Your counter rate (type or speak)</span>
                      <span className="font-display text-2xl font-bold">₹{rate}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex min-h-13 w-full min-w-0 items-center gap-1 rounded-2xl border border-border bg-background px-4">
                        <span className="text-lg font-semibold text-muted-foreground">₹</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={rate}
                          disabled={isCountered}
                          onChange={(e) => setRates({ ...rates, [b.id]: Number(e.target.value) })}
                          aria-label={`Counter rate for ${b.buyer}`}
                          className="w-full bg-transparent py-2 font-display text-xl font-bold outline-none disabled:opacity-70"
                        />
                      </div>
                      {!isCountered && (
                        <MicButton
                          sample={String(b.recommend)}
                          label="Speak rate"
                          onResult={(v) => {
                            const num = extractNumberFromSpeech(v);
                            if (num && num > 0) setRates({ ...rates, [b.id]: num });
                          }}
                          className="size-13"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tap the mic and speak your rate (e.g., &ldquo;{b.recommend} rupees&rdquo;), or
                      enter custom amount manually.
                    </p>
                    <p
                      className={`mt-1 text-xs font-medium ${belowFloor ? "text-destructive" : "text-success-ink"}`}
                    >
                      {belowFloor
                        ? "Below your cost floor — you would lose money on this order."
                        : `Order value ₹${total.toLocaleString("en-IN")} · healthy margin`}
                    </p>
                  </div>
                )}

                <SpeakButton
                  text={`${b.buyer} wants ${b.qty} ${b.item} at ${b.offer} rupees each. I suggest countering at ${b.recommend} rupees. Your cost floor is ${b.floor} rupees.`}
                  label="Explain to me"
                />

                {isCountered ? (
                  <div className="rounded-2xl bg-success/15 p-3 text-sm text-success-ink border border-success/30">
                    <p className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> You approved ₹{b.counterRate ?? rate} per
                      piece.
                    </p>
                    <p className="text-xs mt-0.5">
                      Counter-offer saved on your phone and queued for {b.buyer}.
                    </p>
                  </div>
                ) : isDeclined ? (
                  <div className="rounded-2xl bg-muted p-3 text-sm text-muted-foreground flex items-center gap-2">
                    <XCircle className="size-4 text-destructive" />
                    <span>You politely declined this enquiry. Saved offline.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-2xl border border-border p-3 text-xs text-muted-foreground">
                      <ShieldCheck className="size-4 shrink-0 text-primary" />
                      The assistant will never accept, counter or commit a delivery date without
                      this approval.
                    </div>
                    <div className="flex gap-2">
                      <BigButton
                        variant="outline"
                        className="min-h-12 text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => declineBulkDeal(b.id)}
                      >
                        Decline politely
                      </BigButton>
                      <BigButton
                        className="min-h-12 flex-1 text-sm"
                        disabled={belowFloor}
                        onClick={() => counterBulkDeal(b.id, rate)}
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
    <div
      className={`rounded-2xl p-3 ${highlight ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted"}`}
    >
      <p className="text-[11px] opacity-80 font-medium">{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}
