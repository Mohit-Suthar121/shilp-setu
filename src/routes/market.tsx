import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, Volume2 } from "lucide-react";
import { AppShell, Section, SpeakButton } from "@/components/AppShell";
import { Card, Pill } from "@/components/ui-bits";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Buyer marketplace preview — SHILPSETU" },
      {
        name: "description",
        content:
          "A secondary buyer-facing view showing how artisan listings and stories appear to shoppers.",
      },
      { property: "og:title", content: "Buyer marketplace preview — SHILPSETU" },
      { property: "og:description", content: "How buyers discover verified artisan crafts." },
    ],
  }),
  component: Market,
});

const TAGS = ["All", "Pottery", "Handloom", "Madhubani", "Terracotta", "Under ₹1000", "Handmade"];

function Market() {
  const { products } = useApp();
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const filtered = products.filter((p) => {
    const matchQuery =
      !q || (p.name + p.craft + p.material + p.story).toLowerCase().includes(q.toLowerCase());

    if (!matchQuery) return false;

    if (activeTag === "All") return true;
    if (activeTag === "Under ₹1000") return p.price < 1000;
    if (activeTag === "Handmade") return true;

    return (
      p.craft.toLowerCase().includes(activeTag.toLowerCase()) ||
      p.name.toLowerCase().includes(activeTag.toLowerCase())
    );
  });

  return (
    <AppShell title="Buyer view" subtitle="Secondary surface · how shoppers see your work">
      <Card className="bg-indigo-craft/10 border border-indigo-craft/20">
        <p className="text-sm font-semibold text-foreground">This is the buyer&apos;s side</p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
          Artisans never need to open this. It exists so you can see how your products, fair
          pricing, and heritage story appear to shoppers across India.
        </p>
      </Card>

      <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-4 shadow-sm">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search crafts, regions, materials, or stories…"
          className="w-full bg-transparent outline-none text-base"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTag(t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition active:scale-95 ${
              activeTag === t
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Section
        title="Discover artisan crafts"
        action={
          <span className="text-xs text-muted-foreground font-medium">
            {filtered.length} listings
          </span>
        }
      >
        {filtered.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm font-semibold">No crafts matching your filter</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try tapping "All" or searching for a different craft.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Card key={p.id} className="space-y-2.5">
                <div className="grid aspect-4/3 place-items-center rounded-2xl bg-gradient-to-br from-marigold/35 to-primary/20 text-5xl shadow-inner">
                  {p.emoji || "🏺"}
                </div>
                <p className="font-semibold leading-tight">{p.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 text-primary" /> {p.craft}
                </p>
                <p className="font-display text-lg font-bold">₹{p.price.toLocaleString("en-IN")}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                  {p.story}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-border/40">
                  <div className="flex gap-1">
                    <Pill tone="success">Verified artisan ✓</Pill>
                    <Pill tone="primary">Handmade</Pill>
                  </div>
                  <SpeakButton
                    text={`${p.name}. Made by verified artisan. Price ${p.price} rupees. ${p.story}`}
                    label="Listen"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Link
        to="/"
        className="block text-center text-sm font-medium text-primary underline underline-offset-4 pt-2"
      >
        Back to the artisan workspace
      </Link>
    </AppShell>
  );
}
