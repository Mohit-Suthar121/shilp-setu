import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin } from "lucide-react";
import { AppShell, Section } from "@/components/AppShell";
import { Card, Pill } from "@/components/ui-bits";
import { PRODUCTS } from "@/lib/mock";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Buyer marketplace preview — SHILPSETU" },
      { name: "description", content: "A secondary buyer-facing view showing how artisan listings and stories appear to shoppers." },
      { property: "og:title", content: "Buyer marketplace preview — SHILPSETU" },
      { property: "og:description", content: "How buyers discover verified artisan crafts." },
    ],
  }),
  component: Market,
});

function Market() {
  return (
    <AppShell title="Buyer view" subtitle="Secondary surface · how shoppers see your work">
      <Card className="bg-indigo-craft/10">
        <p className="text-sm font-semibold">This is the buyer&apos;s side</p>
        <p className="text-sm text-muted-foreground">
          Artisans never need to open this. It exists so you can see how your listing and story appear to
          a shopper.
        </p>
      </Card>

      <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-4">
        <Search className="size-4 text-muted-foreground" />
        <input placeholder="Search crafts, regions, materials" className="w-full bg-transparent outline-none" />
      </div>

      <div className="flex flex-wrap gap-2">
        {["Pottery", "Handloom", "Madhubani", "Dokra", "Under ₹1000", "GI tagged", "SHG made"].map((t) => (
          <Pill key={t} tone="muted">
            {t}
          </Pill>
        ))}
      </div>

      <Section title="Discover artisan crafts">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <Card key={p.id} className="space-y-2">
              <div className="grid aspect-4/3 place-items-center rounded-2xl bg-gradient-to-br from-marigold/35 to-primary/20 text-5xl">
                {p.emoji}
              </div>
              <p className="font-semibold leading-tight">{p.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" /> {p.craft}
              </p>
              <p className="font-display text-lg font-bold">₹{p.price.toLocaleString("en-IN")}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{p.story}</p>
              <div className="flex flex-wrap gap-1.5">
                <Pill tone="success">Verified artisan</Pill>
                <Pill tone="primary">Handmade</Pill>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Link to="/" className="block text-center text-sm font-medium text-primary underline">
        Back to the artisan workspace
      </Link>
    </AppShell>
  );
}
