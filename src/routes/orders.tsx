import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, PackageCheck, Printer, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { AppShell, Section } from "@/components/AppShell";
import { BigButton, Card, Pill, Stat } from "@/components/ui-bits";
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
  const { orders, markOrderPacked } = useApp();
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  const toPackCount = orders.filter((o) => o.status === "To pack").length;
  const inTransitCount = orders.filter(
    (o) => o.status === "Shipped" || o.status === "Packed",
  ).length;
  const paidTotal = orders
    .filter((o) => o.status === "Delivered" || o.status === "Paid")
    .reduce((acc, o) => acc + o.amount, 0);

  return (
    <AppShell title="Orders" subtitle={`${orders.length} orders · ₹42,300 total volume`}>
      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="To pack"
          value={String(toPackCount)}
          hint={toPackCount > 0 ? "Needs action" : "All packed"}
        />
        <Stat label="In transit" value={String(inTransitCount)} hint="On the way" />
        <Stat
          label="Paid out"
          value={`₹${paidTotal.toLocaleString("en-IN")}`}
          hint="Bank account"
        />
      </div>

      <Section title="All orders">
        <div className="space-y-3">
          {orders.map((o) => {
            const isPacked = o.status === "Packed";
            const showSlip = selectedSlip === o.id;

            return (
              <Card key={o.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-sm">
                    <Truck className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{o.item}</p>
                    <p className="text-xs text-muted-foreground">
                      #{o.id} · {o.buyer} · {o.city} · {o.when}
                    </p>
                  </div>
                  <p className="font-display text-lg font-bold">
                    ₹{o.amount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Pill
                    tone={
                      o.status === "Delivered"
                        ? "success"
                        : isPacked
                          ? "success"
                          : o.status === "To pack"
                            ? "warn"
                            : "primary"
                    }
                  >
                    {isPacked ? "Packed (saved offline)" : o.status}
                  </Pill>

                  {o.status === "To pack" && (
                    <BigButton
                      className="min-h-11 text-sm shadow-sm"
                      onClick={() => markOrderPacked(o.id)}
                    >
                      <PackageCheck className="size-4" /> Mark packed
                    </BigButton>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedSlip(showSlip ? null : o.id)}
                    className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline ml-auto py-1 px-2"
                  >
                    <Printer className="size-3.5" />
                    {showSlip ? "Hide slip" : "View shipping slip"}
                    {showSlip ? (
                      <ChevronUp className="size-3" />
                    ) : (
                      <ChevronDown className="size-3" />
                    )}
                  </button>
                </div>

                {/* Dispatch / Shipping Slip */}
                {showSlip && (
                  <div className="mt-2 rounded-2xl border border-dashed border-border bg-accent/40 p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-border/40 pb-2">
                      <span className="font-bold uppercase tracking-wider text-primary">
                        SHILPSETU Dispatch Slip
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        PKG-{o.id}-INPOST
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div>
                        <span className="block font-semibold text-foreground">Delivery To:</span>
                        <span>{o.buyer}</span>
                        <br />
                        <span>Central Delivery Hub, {o.city}</span>
                      </div>
                      <div>
                        <span className="block font-semibold text-foreground">
                          Courier Partner:
                        </span>
                        <span>India Post SpeedPost / Delhivery</span>
                        <br />
                        <span>Tracking ID: IN-{o.id}-9941</span>
                      </div>
                    </div>
                    <div className="pt-1 text-[11px] text-success-ink font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" />
                      Print-ready offline: barcode generated on device.
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Section>

      <Card className="bg-accent">
        <p className="text-sm font-semibold">Working without network?</p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
          Mark orders packed, view courier dispatch slips and record payments offline. Courier
          pickup requests queue up on your device and sync the moment you are near signal.
        </p>
      </Card>
    </AppShell>
  );
}
