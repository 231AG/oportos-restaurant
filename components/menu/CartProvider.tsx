"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/cart-types";

const STORAGE_KEY = "oportos.tray.v1";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  /** Set briefly after an add so buttons can confirm without a toast system. */
  lastAdded: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Client-side tray only. There is no checkout and no server: the tray exists so
 * a guest can assemble an order, and the single terminal action hands the whole
 * thing to WhatsApp as text.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLines(JSON.parse(stored) as CartLine[]);
    } catch {
      // Private mode / blocked storage: the tray just doesn't persist.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  useEffect(() => {
    if (!lastAdded) return;
    const id = window.setTimeout(() => setLastAdded(null), 1600);
    return () => window.clearTimeout(id);
  }, [lastAdded]);

  const add = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      setLines((current) => {
        const existing = current.find((entry) => entry.id === line.id);
        if (existing) {
          return current.map((entry) =>
            entry.id === line.id
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry,
          );
        }
        return [...current, { ...line, quantity }];
      });
      setLastAdded(line.id);
    },
    [],
  );

  const increment = useCallback((id: string) => {
    setLines((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry,
      ),
    );
  }, []);

  const decrement = useCallback((id: string) => {
    setLines((current) =>
      current.flatMap((entry) => {
        if (entry.id !== id) return [entry];
        if (entry.quantity <= 1) return [];
        return [{ ...entry, quantity: entry.quantity - 1 }];
      }),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );
    return {
      lines,
      count,
      total,
      open,
      add,
      increment,
      decrement,
      remove,
      clear,
      setOpen,
      lastAdded,
    };
  }, [lines, open, add, increment, decrement, remove, clear, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
