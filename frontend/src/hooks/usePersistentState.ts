import { useEffect, useState } from "react";

/**
 * React hook that syncs a piece of state to `localStorage`.
 * Falls back gracefully when `window` is undefined (SSR).
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored != null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore quota errors etc. */
    }
  }, [key, state]);

  return [state, setState];
}
