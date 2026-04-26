import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, RotateCcw, ShoppingBag, AlertCircle } from "lucide-react";
import * as api from "@/lib/api-client";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/generator")({
  head: () => ({
    meta: [
      { title: "AI Studio — Loop & Bloom" },
      {
        name: "description",
        content:
          "Describe a crochet piece and our AI brings it to life with image and pattern brief.",
      },
    ],
  }),
  component: Generator,
});

const SUGGESTIONS = [
  "A cloud-shaped baby mobile in pastel pinks",
  "A forest fox amigurumi with a tiny scarf",
  "A geometric throw pillow in mustard and teal",
  "A lacy summer top in seafoam green",
];

function Generator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<api.AIDesign | null>(null);

  const { add } = useCart();

  const submit = async (overridePrompt?: string) => {
    const usePrompt = (overridePrompt ?? prompt).trim();
    if (!usePrompt) return;

    if (!api.isAuthenticated()) {
      setError("Please log in to generate designs");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const design = await api.generateDesign(usePrompt, style || undefined);
      setResult(design);
      if (overridePrompt) setPrompt(overridePrompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate design. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const orderCustom = () => {
    if (!result?.id) return;
    add({
      productId: `custom-${result.id}`,
      name: "Custom AI Design",
      price: 145,
      image: result.image_url || "https://via.placeholder.com/300x300?text=AI+Design",
      quantity: 1,
      customDesignId: result.id,
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> AI Studio
        </span>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
          Describe it. <em className="text-primary not-italic">We'll dream it up.</em>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Type a few words. Our AI will sketch your piece and write a pattern brief — yarn, stitch,
          size, difficulty. Love it? Order it as a custom commission.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        {/* INPUT */}
        <div className="lg:col-span-2">
          <label htmlFor="prompt" className="text-sm font-semibold">
            Your idea
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            maxLength={500}
            placeholder="e.g. a sage green octopus amigurumi with rainbow tentacles…"
            className="mt-2 w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">{prompt.length}/500</div>

          <div className="mt-4">
            <label htmlFor="style" className="text-sm font-semibold">
              Style (optional)
            </label>
            <input
              id="style"
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. cute, modern, vintage"
              className="mt-2 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="button"
            disabled={loading || prompt.trim().length < 3}
            onClick={() => submit()}
            className={cn(
              "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all",
              "shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Stitching pixels…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate design
              </>
            )}
          </button>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Try an idea
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  disabled={loading}
                  onClick={() => {
                    setPrompt(s);
                    submit(s);
                  }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULT */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="relative aspect-square bg-muted">
              {loading && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-3 font-display text-lg">Bringing your idea to life…</p>
                    <p className="mt-1 text-sm text-muted-foreground">This takes ~10–20 seconds.</p>
                  </div>
                </div>
              )}
              {!loading && result?.image_url && (
                <img
                  src={result.image_url}
                  alt="AI-generated crochet design"
                  className="h-full w-full object-cover"
                />
              )}
              {!loading && !result && !error && (
                <div className="absolute inset-0 grid place-items-center px-6 text-center">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-display text-lg">Your design will appear here</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Describe it on the left to begin.
                    </p>
                  </div>
                </div>
              )}
              {!loading && error && (
                <div className="absolute inset-0 grid place-items-center px-6 text-center">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <p className="mt-3 font-display text-lg">Couldn't generate</p>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {result && !loading && (
              <div className="p-6">
                <div className="mb-4 rounded-lg bg-primary/5 p-3 border border-primary/10">
                  <p className="text-xs font-semibold text-primary mb-2">Pattern Notes</p>
                  <p className="text-xs text-foreground/70">{result.pattern_notes}</p>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {result.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => submit(prompt)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={orderCustom}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Order as custom — $145
                  </button>
                  <Link
                    to="/cart"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Go to cart →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
