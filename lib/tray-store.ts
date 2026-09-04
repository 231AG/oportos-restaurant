import type { CartLine } from "./cart-types";

/**
 * The tray lives in a tiny external store rather than component state.
 *
 * It has to survive a page navigation (Next keeps the provider mounted, but the
 * localStorage read has to happen exactly once) and it has to be readable by
 * `useSyncExternalStore`, which is what lets the provider skip the
 * read-in-an-effect-then-setState dance and the extra render it causes.
 */

const STORAGE_KEY = "oportos.tray.v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode or blocked storage: the tray simply doesn't persist.
  }
}

function hydrate() {
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    lines = parsed.filter(
      (line): line is CartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as CartLine).id === "string" &&
        typeof (line as CartLine).price === "number" &&
        typeof (line as CartLine).quantity === "number",
    );
    emit();
  } catch {
    lines = EMPTY;
  }
}

export function subscribe(listener: () => void) {
  if (!hydrated) hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  return lines;
}

export function getServerSnapshot() {
  return EMPTY;
}

function commit(next: CartLine[]) {
  lines = next;
  persist();
  emit();
}

export function addLine(line: Omit<CartLine, "quantity">, quantity = 1) {
  const existing = lines.find((entry) => entry.id === line.id);
  commit(
    existing
      ? lines.map((entry) =>
          entry.id === line.id
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry,
        )
      : [...lines, { ...line, quantity }],
  );
}

export function incrementLine(id: string) {
  commit(
    lines.map((entry) =>
      entry.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry,
    ),
  );
}

export function decrementLine(id: string) {
  commit(
    lines.flatMap((entry) => {
      if (entry.id !== id) return [entry];
      if (entry.quantity <= 1) return [];
      return [{ ...entry, quantity: entry.quantity - 1 }];
    }),
  );
}

export function removeLine(id: string) {
  commit(lines.filter((entry) => entry.id !== id));
}

export function clearLines() {
  commit(EMPTY);
}
