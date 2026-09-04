"use client";

import { useEffect, useMemo, type DependencyList } from "react";

interface Disposable {
  dispose?: () => void;
}

/**
 * Builds geometries/materials once per dependency change and disposes them on
 * unmount. R3F only auto-disposes objects it created itself, so anything built
 * in a `useMemo` and passed in as a prop has to be cleaned up by hand — that is
 * the difference between switching dishes 20 times and leaking 20 scenes.
 */
export function useAssets<T extends Record<string, unknown>>(
  factory: () => T,
  deps: DependencyList,
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const assets = useMemo(factory, deps);

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

  return assets;
}
