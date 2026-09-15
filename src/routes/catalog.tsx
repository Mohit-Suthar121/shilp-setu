import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Trash2, Check } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { BigButton, Card, Pill } from "@/components/ui-bits";
import { MicField } from "@/components/MicInput";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "My catalog — SHILPSETU" },
      {
        name: "description",
        content: "Every craft you make, with fair price bands, stock and sync status.",
      },
      { property: "og:title", content: "My catalog — SHILPSETU" },
      { property: "og:description", content: "Manage listings, prices and stock offline." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { products, updateProduct, deleteProduct } = useApp();
  const [q, setQ] = useState("");
  const [nudgeApproved, setNudgeApproved] = useState(false);

  const list = products.filter((p) =>
    (p.name + p.craft + p.material).toLowerCase().includes(q.toLowerCase()),
  );

  const liveCount = products.filter((p) => p.status === "Live").length;

  const handleApproveNudge = () => {
    // Find Kantha stole or first product to nudge
    const kantha = products.find((p) => p.name.toLowerCase().includes("kantha") || p.id === "p4");
    if (kantha) {
      updateProduct(kantha.id, { price: 1980, status: "Live" });
    }
    setNudgeApproved(true);
  };

  return (
    <AppShell title="My catalog" subtitle={`${products.length} products · ${liveCount} live`}>
      <div className="flex gap-2">
        <div className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search my products by name, craft, or material…"
            className="w-full bg-transparent text-base outline-none"
          />
        </div>
        <Link to="/create">
          <BigButton className="min-h-12 px-4">
            <Plus className="size-5" />
          </BigButton>
        </Link>
      </div>

      <Section
        title="Products"
        action={
          <span className="text-xs text-muted-foreground font-medium">{list.length} shown</span>
        }
      >
        {list.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm font-semibold">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try another search or speak to add a new craft.
            </p>
            <Link to="/create" className="inline-block mt-4">
              <BigButton className="text-sm">
                <Plus className="size-4" /> Add your first craft
              </BigButton>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((p) => (
              <Card key={p.id} className="space-y-3">
                <div className="flex gap-3">
                  <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-marigold/35 to-primary/20 text-4xl shadow-inner">
                    {p.emoji || "🏺"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.craft}</p>
                    <p className="mt-1 font-display text-lg font-bold">
                      ₹{p.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Fair band ₹{p.low}–₹{p.high} · {p.stock} in stock
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Pill
                    tone={
                      p.status === "Live"
                        ? "success"
                        : p.status === "Pending sync"
                          ? "warn"
                          : "muted"
                    }
                  >
                    {p.status}
                  </Pill>
                  <SpeakButton
                    text={`${p.name}. Price ${p.price} rupees. ${p.stock} pieces in stock.`}
                    label="Listen"
                  />
                </div>

                <details className="rounded-2xl bg-accent p-3 text-sm">
                  <summary className="min-h-11 cursor-pointer font-semibold text-primary">
                    View &amp; Edit Details
                  </summary>
                  <div className="mt-3 space-y-3 border-t border-border/40 pt-3">
                    <MicField
                      label="Product Name"
                      value={p.name}
                      sample={p.name}
                      onChange={(nv) => updateProduct(p.id, { name: nv })}
                    />
                    <MicField
                      label="Craft / Category"
                      value={p.craft}
                      sample={p.craft}
                      onChange={(nv) => updateProduct(p.id, { craft: nv })}
                    />
                    <MicField
                      label="Material"
                      value={p.material}
                      sample={p.material}
                      onChange={(nv) => updateProduct(p.id, { material: nv })}
                    />
                    <MicField
                      label="Price (₹)"
                      value={String(p.price)}
                      sample={String(p.price)}
                      onChange={(nv) => {
                        const num = Number(nv);
                        if (num > 0) updateProduct(p.id, { price: num });
                      }}
                    />
                    <MicField
                      label="Stock Quantity"
                      value={String(p.stock)}
                      sample={String(p.stock)}
                      onChange={(nv) => {
                        const num = Number(nv);
                        if (num >= 0) updateProduct(p.id, { stock: num });
                      }}
                    />
                    <MicField
                      label="Heritage Story"
                      value={p.story}
                      sample={p.story}
                      onChange={(nv) => updateProduct(p.id, { story: nv })}
                    />

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove "${p.name}" from your catalog?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline p-1 font-medium"
                      >
                        <Trash2 className="size-3.5" /> Remove product
                      </button>
                    </div>
                  </div>
                </details>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Card className="bg-marigold/20 border border-marigold/30">
        <p className="text-sm font-semibold">AI Price nudge</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Kantha stoles and embroidered items like yours sold at an average ₹2,050 in the last 30
          days. Raising ₹1,850 → ₹1,980 is still inside the fair band and yields +₹130 profit per
          unit.
        </p>
        <div className="mt-3 flex gap-2">
          {nudgeApproved ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-success-ink bg-success/20 px-3 py-2 rounded-2xl">
              <Check className="size-4" /> Price updated to ₹1,980 ✓
            </div>
          ) : (
            <>
              <BigButton className="min-h-11 flex-1 text-sm" onClick={handleApproveNudge}>
                Approve new price (₹1,980)
              </BigButton>
              <BigButton
                variant="outline"
                className="min-h-11 text-sm"
                onClick={() => setNudgeApproved(true)}
              >
                Keep as is
              </BigButton>
            </>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
