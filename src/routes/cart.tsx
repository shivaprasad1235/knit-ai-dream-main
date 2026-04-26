import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Loader2, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, useOrders, formatPrice } from "@/lib/store";
import * as api from "@/lib/api-client";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Loop & Bloom" }] }),
  component: CartPage,
});

function CartPage() {
  const { cart, total, updateQty, remove, clear } = useCart();
  const { create } = useOrders();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse the studio or imagine something new in the AI Studio.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/shop"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Shop
          </Link>
          <Link
            to="/generator"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold"
          >
            AI Studio
          </Link>
        </div>
      </div>
    );
  }

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address) return;

    setError("");
    if (!api.isAuthenticated()) {
      setError("Please sign in before placing an order.");
      return;
    }

    setSubmitting(true);
    const isCustom = cart.some((i) => i.customDesignId);
    try {
      const order = await api.createOrder(
        cart.map((item) => ({
          product_id: item.customDesignId ? `custom-${item.customDesignId}` : item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        [form.name, form.email, form.address, form.notes ? `Notes: ${form.notes}` : ""]
          .filter(Boolean)
          .join("\n"),
        isCustom,
        cart.find((i) => i.customDesignId)?.customDesignId,
      );
      clear();
      navigate({ to: "/orders", search: { just: order.id } });
    } catch (err) {
      const localOrder = create({
        items: cart,
        total,
        customer: form,
        isCustom,
      });
      clear();
      setError(err instanceof Error ? err.message : "Backend order failed; saved locally.");
      navigate({ to: "/orders", search: { just: localOrder.id } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <h1 className="font-display text-4xl font-semibold md:text-5xl">Your cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {cart.map((item) => (
            <li
              key={`${item.productId}-${item.customDesignId ?? ""}`}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight">
                      {item.name}
                    </h3>
                    {item.customDesignId && (
                      <p className="text-xs font-medium text-primary">AI custom design</p>
                    )}
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() =>
                        updateQty(item.productId, item.quantity - 1, item.customDesignId)
                      }
                      className="grid h-8 w-8 place-items-center hover:bg-muted rounded-l-full"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() =>
                        updateQty(item.productId, item.quantity + 1, item.customDesignId)
                      }
                      className="grid h-8 w-8 place-items-center hover:bg-muted rounded-r-full"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.productId, item.customDesignId)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <form
          onSubmit={submitOrder}
          className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] h-fit"
        >
          <h2 className="font-display text-2xl font-semibold">Checkout</h2>
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="mt-4 space-y-3">
            {(["name", "email", "address"] as const).map((field) => (
              <div key={field}>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {field}
                </label>
                <input
                  required
                  type={field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notes (optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-semibold">{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Placing order..." : "Place order"}
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Payment collection is disabled in this local build.
          </p>
        </form>
      </div>
    </div>
  );
}
