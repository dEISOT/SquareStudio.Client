import { useState, useEffect, useRef, useCallback } from 'react';

export function useIdle(timeoutSec: number) {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdle(true), timeoutSec * 1000);
  }, [timeoutSec]);

  const wake = useCallback(() => {
    setIdle(false);
    reset();
  }, [reset]);

  useEffect(() => {
    // Reset timer on any user activity — always, regardless of idle state
    const onActivity = () => reset();
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    reset(); // start the timer
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reset]); // only re-run when timeout duration changes

  return { idle, wake };
}
