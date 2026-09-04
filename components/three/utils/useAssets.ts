"use client";

import { useEffect } from "react";

interface Disposable {
  dispose?: () => void;
}

/**
 * Disposes every geometry/material in an asset bundle when it is replaced or
 * unmounted. R3F only auto-disposes objects it created itself, so anything
 * built in a `useMemo` and passed in as a prop has to be cleaned up by hand —
 * that is the difference between switching dishes 20 times and leaking 20
 * scenes' worth of GPU buffers.
 */
export function useDispose(assets: Record<string, unknown>) {
  useEffect(
    () => () => {
      Object.values(assets).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((entry) => (entry as Disposable)?.dispose?.());
        } else {
          (value as Disposable)?.dispose?.();
        }
      });
    },
    [assets],
  );
}
