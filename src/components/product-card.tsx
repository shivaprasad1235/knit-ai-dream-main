import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/shop/$productId" params={{ productId: product.id }} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-muted aspect-square">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
          {product.category}
        </span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.tagline}</p>
        </div>
        <span className="shrink-0 font-display text-base font-semibold">
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}
