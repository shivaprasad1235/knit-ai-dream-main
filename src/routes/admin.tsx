import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Sparkles, Package2 } from "lucide-react";
import { getProduct } from "@/data/products";
import { useOrders, formatPrice, type CartItem, type Order, type OrderStatus } from "@/lib/store";
import * as api from "@/lib/api-client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Studio Admin — Loop & Bloom" }] }),
  component: Admin,
});

const STATUSES: OrderStatus[] = ["pending", "in_progress", "completed"];
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

function Admin() {
  const { orders, setStatus } = useOrders();
  const [apiOrders, setApiOrders] = useState<api.Order[]>([]);
  const [loading, setLoading] = useState(api.isAuthenticated());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!api.isAuthenticated()) {
      setLoading(false);
      setError("Please sign in with an admin account.");
      return;
    }

    api
      .getAllOrders(0, 100)
      .then(setApiOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load admin orders."))
      .finally(() => setLoading(false));
  }, []);

  const displayOrders: Order[] = useMemo(() => {
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
      customer: { name: order.user_id, email: order.user_id, address: order.shipping_address },
      status: (order.status === "cancelled" ? "pending" : order.status) as OrderStatus,
      isCustom: order.is_custom,
    }));
  }, [apiOrders, orders]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    if (apiOrders.some((order) => order.id === id)) {
      try {
        const updated = await api.updateOrderStatus(id, status);
        setApiOrders((prev) => prev.map((order) => (order.id === id ? updated : order)));
        return;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update order status.");
      }
    }
    setStatus(id, status);
  };

  const stats = {
    total: displayOrders.length,
    custom: displayOrders.filter((o) => o.isCustom).length,
    revenue: displayOrders.reduce((s, o) => s + o.total, 0),
    pending: displayOrders.filter((o) => o.status === "pending").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <header>
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Studio admin</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Maya's workbench</h1>
        <p className="mt-2 text-muted-foreground">
          Every order, every custom request — managed from one cozy desk.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Orders", value: stats.total, icon: Package2 },
          { label: "Custom AI", value: stats.custom, icon: Sparkles },
          { label: "Revenue", value: formatPrice(stats.revenue), icon: Package2 },
          { label: "Pending", value: stats.pending, icon: Package2 },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 font-display text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold">All orders</h2>
      {loading && (
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading admin data...
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && displayOrders.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          No orders yet. Place one from the shop or AI Studio to see it here.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((o) => (
                <tr key={o.id} className="border-t border-border align-top">
                  <td className="px-4 py-4">
                    <p className="font-mono text-xs">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                    {o.isCustom && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <Sparkles className="h-3 w-3" /> Custom
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{o.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer.email}</p>
                    <p className="mt-1 max-w-[200px] truncate text-xs text-muted-foreground">
                      {o.customer.address}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1">
                      {o.items.map((i) => (
                        <li
                          key={`${i.productId}-${i.customDesignId ?? ""}`}
                          className="flex items-center gap-2"
                        >
                          <img src={i.image} alt="" className="h-8 w-8 rounded-md object-cover" />
                          <span className="text-xs">
                            {i.name} × {i.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
