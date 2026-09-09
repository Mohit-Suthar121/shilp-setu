import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, PackageCheck } from "lucide-react";
import { AppShell, Section } from "@/components/AppShell";
import { BigButton, Card, Pill, Stat } from "@/components/ui-bits";
import { ORDERS } from "@/lib/mock";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — SHILPSETU" },
      { name: "description", content: "Track, pack and dispatch orders even with no network." },
      { property: "og:title", content: "Orders — SHILPSETU" },
      { property: "og:description", content: "Offline-safe order tracking for artisans." },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { enqueue } = useApp();
  const [packed, setPacked] = useState<string[]>([]);

  return (
    <AppShell title="Orders" subtitle="17 orders · ₹42,300 this month">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="To pack" value="2" />
        <Stat label="In transit" value="1" />
        <Stat label="Paid out" value="₹31,700" />
      </div>

      <Section title="All orders">
        <div className="space-y-3">
          {ORDERS.map((o) => {
            const isPacked = packed.includes(o.id);
            return (
              <Card key={o.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
                    <Truck className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{o.item}</p>
                    <p className="text-xs text-muted-foreground">
                      #{o.id} · {o.buyer} · {o.city} · {o.when}
                    </p>
                  </div>
                  <p className="font-display text-lg font-bold">₹{o.amount.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={o.status === "Delivered" ? "success" : o.status === "To pack" ? "warn" : "primary"}>
                    {isPacked ? "Packed (saved offline)" : o.status}
                  </Pill>
                  {o.status === "To pack" && !isPacked && (
                    <BigButton
                      className="min-h-11 text-sm"
                      onClick={() => {
                        setPacked((p) => [...p, o.id]);
                        enqueue(`Order ${o.id} marked packed`);
                      }}
                    >
                      <PackageCheck className="size-4" /> Mark packed
                    </BigButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Card className="bg-accent">
        <p className="text-sm font-semibold">Working without network?</p>
        <p className="text-sm text-muted-foreground">
          Mark orders packed, print labels and record cash payments offline. Courier pickup requests queue up and go out
          together when the signal returns.
        </p>
      </Card>
    </AppShell>
  );
}
