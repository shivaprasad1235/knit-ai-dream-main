import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Loop & Bloom" },
      { name: "description", content: "Hand-stitched crochet pieces, made in small batches." },
    ],
  }),
  component: Shop,
});

const CATEGORIES = ["All", "Home", "Toys", "Accessories", "Decor"] as const;

function Shop() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const products = cat === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Studio shop</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
          Every piece, hand-stitched.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Browse this season's collection. Each item is made to order in our small studio.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70 hover:bg-muted",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
