"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/cart-types";
import {
  addLine,
  clearLines,
  decrementLine,
  getServerSnapshot,
  getSnapshot,
  incrementLine,
  removeLine,
  subscribe,
} from "@/lib/tray-store";

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
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    const id = window.setTimeout(() => setLastAdded(null), 1600);
    return () => window.clearTimeout(id);
  }, [lastAdded]);

  const add = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      addLine(line, quantity);
      setLastAdded(line.id);
    },
    [],
  );

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
      increment: incrementLine,
      decrement: decrementLine,
      remove: removeLine,
      clear: clearLines,
      setOpen,
      lastAdded,
    };
  }, [lines, open, add, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
