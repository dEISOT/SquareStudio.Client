import { useEffect, useRef, useState } from 'react';

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
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(step);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setCount((c) => c + step);
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { count, sentinelRef };
}
