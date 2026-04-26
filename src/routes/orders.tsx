import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Package, Sparkles, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { getProduct } from "@/data/products";
import { useOrders, formatPrice, type CartItem, type OrderStatus } from "@/lib/store";
import * as api from "@/lib/api-client";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Orders — Loop & Bloom" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    just: typeof s.just === "string" ? s.just : undefined,
  }),
  component: OrdersPage,
});

const STATUS_META: Record<OrderStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-foreground" },
  in_progress: {
    label: "In progress",
    icon: Loader2,
    className: "bg-accent/30 text-foreground",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-secondary/40 text-foreground",
  },
};

function OrdersPage() {
  const { orders } = useOrders();
  const { just } = Route.useSearch();
  const [apiOrders, setApiOrders] = useState<api.Order[]>([]);
  const [loading, setLoading] = useState(api.isAuthenticated());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!api.isAuthenticated()) {
      setLoading(false);
      return;
    }

    api
      .getUserOrders(0, 50)
      .then(setApiOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  const displayOrders = useMemo(() => {
    if (apiOrders.length === 0) return orders;
    return apiOrders.map((order) => ({
      id: order.id,
      createdAt: new Date(order.created_at).getTime(),
      items: order.items.map((item): CartItem => {
        const product = getProduct(item.product_id);
        const isCustom = item.product_id.startsWith("custom-");
        return {
          productId: item.product_id,
          name: product?.name ?? (isCustom ? "Custom AI Design" : "Studio item"),
          price: item.price,
          image: product?.image ?? "https://via.placeholder.com/300x300?text=Loop+%26+Bloom",
          quantity: item.quantity,
          customDesignId: isCustom ? item.product_id.replace("custom-", "") : undefined,
        };
      }),
      total: order.total,
      status: (order.status === "cancelled" ? "pending" : order.status) as OrderStatus,
      isCustom: order.is_custom,
    }));
  }, [apiOrders, orders]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
      <h1 className="font-display text-4xl font-semibold md:text-5xl">Your orders</h1>
      <p className="mt-2 text-muted-foreground">
        Track every commission from yarn ball to doorstep.
      </p>

      {just && (
        <div className="mt-6 rounded-2xl border border-secondary/60 bg-secondary/20 p-4 text-sm">
          <p className="font-semibold">Order placed — thank you ✿</p>
          <p className="text-muted-foreground">
            Confirmation sent. You can follow status updates here.
          </p>
        </div>
      )}

      {loading && (
        <div className="mt-10 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading orders...
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && displayOrders.length === 0 ? (
        <div className="mt-16 grid place-items-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-3 font-display text-xl">No orders yet</p>
          <Link
            to="/shop"
            className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Start browsing
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {displayOrders.map((order) => {
            const meta = STATUS_META[order.status];
            const Icon = meta.icon;
            return (
              <li
                key={order.id}
                className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Order {order.id}
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Placed {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {order.isCustom && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        <Sparkles className="h-3 w-3" /> Custom AI
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${order.status === "in_progress" ? "animate-spin" : ""}`}
                      />
                      {meta.label}
                    </span>
                  </div>
                </div>

                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {order.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.customDesignId ?? ""}`}
                      className="flex items-center gap-3 rounded-2xl bg-muted/50 p-2.5"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty {item.quantity} · {formatPrice(item.price)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
