import { useCallback, useEffect, useState } from 'react';

/**
 * Bounds how many items of a long, unpaginated list are mounted at once,
 * growing the count as the user scrolls near the end of the currently
 * rendered items — an "infinite scroll" reveal instead of literal pagination
 * (no page numbers/"load more" button, it just keeps extending as you scroll).
 *
 * Pass a `resetKey` that changes whenever the underlying filtered list
 * changes identity (e.g. active category or search query) so the count
 * restarts from `step`.
 */
export function useRevealMore(resetKey: unknown, step = 16) {
  const [count, setCount] = useState(step);
  // A callback ref (rather than a plain useRef) so the observer effect below
  // re-runs whenever the sentinel element actually mounts — the sentinel only
  // exists in some of the views this hook is used from (e.g. it isn't present
  // in the "all categories" overview), so a mount-once effect would find it
  // null the first time and never get another chance to attach.
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinel(node);
  }, []);

  useEffect(() => {
    setCount(step);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setCount((c) => c + step);
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinel]);

  return { count, sentinelRef };
}
