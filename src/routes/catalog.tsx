import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill } from "@/components/ui-bits";
import { MicField } from "@/components/MicInput";
import { PRODUCTS } from "@/lib/mock";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "My catalog — SHILPSETU" },
      { name: "description", content: "Every craft you make, with fair price bands, stock and sync status." },
      { property: "og:title", content: "My catalog — SHILPSETU" },
      { property: "og:description", content: "Manage listings, prices and stock offline." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const [q, setQ] = useState("");
  const list = PRODUCTS.filter((p) => (p.name + p.craft).toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell title="My catalog" subtitle={`${PRODUCTS.length} products · 3 live`}>
      <div className="flex gap-2">
        <div className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search my products"
            className="w-full bg-transparent text-base outline-none"
          />
        </div>
        <Link to="/create">
          <BigButton className="min-h-12 px-4">
            <Plus className="size-5" />
          </BigButton>
        </Link>
      </div>

      <Section title="Products">
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((p) => (
            <Card key={p.id} className="space-y-3">
              <div className="flex gap-3">
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-marigold/35 to-primary/20 text-4xl">
                  {p.emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.craft}</p>
                  <p className="mt-1 font-display text-lg font-bold">₹{p.price.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">
                    Fair band ₹{p.low}–₹{p.high} · {p.stock} in stock
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={p.status === "Live" ? "success" : p.status === "Pending sync" ? "warn" : "muted"}>
                  {p.status}
                </Pill>
                <SpeakButton text={`${p.name}. Price ${p.price} rupees. ${p.stock} pieces in stock.`} label="Listen" />
              </div>
              <details className="rounded-2xl bg-accent p-3 text-sm">
                <summary className="min-h-11 cursor-pointer font-medium text-primary">View & Edit Details</summary>
                <div className="mt-3 space-y-3 border-t border-border/40 pt-3">
                  <MicField
                    label="Product Name"
                    value={p.name}
                    sample={p.name}
                    onChange={(nv) => { p.name = nv; }}
                  />
                  <MicField
                    label="Craft / Category"
                    value={p.craft}
                    sample={p.craft}
                    onChange={(nv) => { p.craft = nv; }}
                  />
                  <MicField
                    label="Material"
                    value={p.material}
                    sample={p.material}
                    onChange={(nv) => { p.material = nv; }}
                  />
                  <MicField
                    label="Price (₹)"
                    value={String(p.price)}
                    sample={String(p.price)}
                    onChange={(nv) => { p.price = Number(nv) || p.price; }}
                  />
                  <MicField
                    label="Stock Quantity"
                    value={String(p.stock)}
                    sample={String(p.stock)}
                    onChange={(nv) => { p.stock = Number(nv) || p.stock; }}
                  />
                  <MicField
                    label="Heritage Story"
                    value={p.story}
                    sample={p.story}
                    onChange={(nv) => { p.story = nv; }}
                  />
                </div>
              </details>
            </Card>
          ))}
        </div>
      </Section>

      <Card className="bg-marigold/20">
        <p className="text-sm font-semibold">Price nudge</p>
        <p className="text-sm text-muted-foreground">
          Kantha stoles like yours sold at an average ₹2,050 in the last 30 days. Raising ₹1,850 → ₹1,980 is still
          inside the fair band.
        </p>
        <div className="mt-3 flex gap-2">
          <BigButton className="min-h-11 flex-1 text-sm">Approve new price</BigButton>
          <BigButton variant="outline" className="min-h-11 text-sm">
            Keep as is
          </BigButton>
        </div>
      </Card>
    </AppShell>
  );
}
