import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customDesignId?: string;
};

export type OrderStatus = "pending" | "in_progress" | "completed";

export type Order = {
  id: string;
  createdAt: number;
  items: CartItem[];
  total: number;
  customer: { name: string; email: string; address: string; notes?: string };
  status: OrderStatus;
  isCustom: boolean;
};

export type CustomDesign = {
  id: string;
  prompt: string;
  description: string;
  imageDataUrl: string;
  createdAt: number;
};

const KEYS = {
  cart: "lb_cart",
  orders: "lb_orders",
  designs: "lb_designs",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("lb:store", { detail: { key } }));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string } | undefined;
      if (!detail || detail.key === key) setValue(read<T>(key, fallback));
    };
    window.addEventListener("lb:store", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("lb:store", onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const updated = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, updated);
        return updated;
      });
    },
    [key],
  );

  return [value, set] as const;
}

export function useCart() {
  const [cart, setCart] = useStored<CartItem[]>(KEYS.cart, []);

  const add = (item: CartItem) =>
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.customDesignId === item.customDesignId,
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + item.quantity };
        return copy;
      }
      return [...prev, item];
    });

  const remove = (productId: string, customDesignId?: string) =>
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.customDesignId === customDesignId)),
    );

  const updateQty = (productId: string, quantity: number, customDesignId?: string) =>
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.customDesignId === customDesignId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i,
      ),
    );

  const clear = () => setCart([]);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return { cart, add, remove, updateQty, clear, total, count };
}

export function useOrders() {
  const [orders, setOrders] = useStored<Order[]>(KEYS.orders, []);

  const create = (order: Omit<Order, "id" | "createdAt" | "status">) => {
    const newOrder: Order = {
      ...order,
      id: `LB-${Date.now().toString(36).toUpperCase()}`,
      createdAt: Date.now(),
      status: "pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const setStatus = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  return { orders, create, setStatus };
}

export function useDesigns() {
  const [designs, setDesigns] = useStored<CustomDesign[]>(KEYS.designs, []);

  const save = (d: Omit<CustomDesign, "id" | "createdAt">) => {
    const design: CustomDesign = {
      ...d,
      id: `D-${Date.now().toString(36).toUpperCase()}`,
      createdAt: Date.now(),
    };
    setDesigns((prev) => [design, ...prev]);
    return design;
  };

  const remove = (id: string) => setDesigns((prev) => prev.filter((d) => d.id !== id));

  return { designs, save, remove };
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
