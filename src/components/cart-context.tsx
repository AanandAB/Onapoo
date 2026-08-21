"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { lineTotal } from "@/lib/site";

export type CartItem = {
  id: string;
  name: string;
  nameMl: string;
  unit: string;
  price: number;
  qty: number;
  stock?: number; // max qty that can be ordered (captured when added to the cart)
};

type Toast = { nameEn: string; nameMl: string; count: number };

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  toast: Toast | null;
};

const CartContext = createContext<CartCtx | null>(null);

// Clamp a quantity to the available stock (no cap when stock is unknown).
function clampQty(qty: number, stock?: number): number {
  const max = stock ?? Number.POSITIVE_INFINITY;
  return Math.max(0, Math.min(max, qty));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("onam_cart") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {
        /* ignore corrupt cart */
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // never save before the stored cart has loaded
    if (typeof window !== "undefined") {
      window.localStorage.setItem("onam_cart", JSON.stringify(items));
    }
  }, [items, hydrated]);

  const add = (item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const stock = existing.stock ?? item.stock;
        return prev.map((i) =>
          i.id === item.id ? { ...i, stock, qty: clampQty(i.qty + qty, stock) } : i,
        );
      }
      return [...prev, { ...item, qty: clampQty(qty, item.stock) }];
    });
    // Don't open the drawer — show a toast so the customer can keep browsing.
    const currentCount = items.reduce((n, i) => n + i.qty, 0);
    setToast({ nameEn: item.name, nameMl: item.nameMl, count: currentCount + qty });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty, i.stock) } : i)),
    );

  const clear = () => setItems([]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + lineTotal(i.price, i.qty), 0);
    return { items, add, remove, setQty, clear, count, subtotal, open, setOpen, toast };
  }, [items, open, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
