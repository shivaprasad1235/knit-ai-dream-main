import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Heart, Package } from "lucide-react";
import hero from "@/assets/hero-crochet.jpg";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loop & Bloom — Handmade Crochet & AI Custom Designs" },
      {
        name: "description",
        content:
          "Browse hand-stitched crochet pieces or design your own with AI. Slow craft, dreamed up with you.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = PRODUCTS.slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Small-batch · Made to order
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
              Slow-stitched crochet,
              <span className="block italic text-primary">dreamed up with you.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Heirloom blankets, pocket-sized amigurumi, and one-of-a-kind designs you imagine —
              brought to life by hand.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                Shop the studio <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/generator"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/5"
              >
                <Sparkles className="h-4 w-4 text-primary" /> Design with AI
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-display text-2xl text-primary">600+</dt>
                <dd className="text-muted-foreground">Pieces stitched</dd>
              </div>
              <div>
                <dt className="font-display text-2xl text-primary">100%</dt>
                <dd className="text-muted-foreground">Natural fibers</dd>
              </div>
              <div>
                <dt className="font-display text-2xl text-primary">∞</dt>
                <dd className="text-muted-foreground">Mended forever</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-[var(--shadow-lift)]">
              <img
                src={hero}
                alt="Cozy flat-lay of handmade crochet items"
                width={1600}
                height={1024}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/90 p-3 backdrop-blur">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <Heart className="h-4 w-4" />
                </span>
                <p className="text-sm">
                  <span className="font-semibold">Made by Maya</span>
                  <span className="text-muted-foreground"> · stitching since 2014</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">The studio</p>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              This week's stitches
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-sm font-medium text-primary hover:underline md:inline"
          >
            See everything →
          </Link>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* AI BAND */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-[var(--gradient-warm)] p-8 md:p-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> The AI Studio
              </span>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
                Imagine it. <em className="text-primary not-italic">We'll stitch it.</em>
              </h2>
              <p className="mt-4 max-w-md text-foreground/80">
                Describe the piece you've always wanted — a cloud-shaped baby mobile, a fox-eared
                beanie — and our AI sketches it instantly with a pattern brief. Love it? Order it
                and it gets queued in the studio.
              </p>
              <Link
                to="/generator"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
              >
                Open the AI Studio <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid gap-3 text-sm">
              {[
                {
                  icon: Sparkles,
                  t: "Prompt → preview",
                  d: "An AI-rendered crochet image in seconds.",
                },
                {
                  icon: Package,
                  t: "Pattern brief",
                  d: "Yarn weight, stitch style, size, difficulty.",
                },
                { icon: Heart, t: "Made for keeps", d: "Order it as a custom commission." },
              ].map((item) => (
                <li
                  key={item.t}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{item.t}</p>
                    <p className="text-muted-foreground">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
