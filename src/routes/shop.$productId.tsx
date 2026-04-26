import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { getProduct, PRODUCTS } from "@/data/products";
import { useCart, formatPrice } from "@/lib/store";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Loop & Bloom` },
          { name: "description", content: loaderData.product.tagline },
          { property: "og:title", content: `${loaderData.product.name} — Loop & Bloom` },
          { property: "og:description", content: loaderData.product.tagline },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl">We couldn't find that piece</h1>
      <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">
        Back to shop
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded-3xl bg-muted">
          <img
            src={product.image}
            alt={product.name}
            width={800}
            height={800}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            {product.category}
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{product.tagline}</p>

          <p className="mt-6 font-display text-3xl font-semibold text-primary">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 leading-relaxed text-foreground/80">{product.description}</p>

          <dl className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Yarn</dt>
              <dd className="font-medium">{product.yarn}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Lead time</dt>
              <dd className="font-medium">{product.madeIn}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {added ? "Added to cart" : "Add to cart"}
          </button>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-display text-2xl font-semibold">You might also love</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
