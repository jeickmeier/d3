import { useRef, useCallback } from "react";

/**
 * Returns a debounced version of the provided callback function.
 * The callback will only be called after the specified delay has elapsed
 * since the last invocation.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 500,
): (...args: Parameters<T>) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  return debouncedCallback;
}
