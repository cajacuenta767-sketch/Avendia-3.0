import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_PREFIX = "avendia.scroll.";
const MAX_RESTORE_ATTEMPTS = 6;

function storedPosition(key: string) {
  const value = Number(sessionStorage.getItem(`${STORAGE_PREFIX}${key}`));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function RouteScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const storageKey = `${STORAGE_PREFIX}${location.key}`;
    const target = navigationType === "POP" ? storedPosition(location.key) : 0;
    let cancelled = false;
    let frame = 0;
    let timer = 0;
    let attempts = 0;

    const restore = () => {
      if (cancelled) return;
      window.scrollTo({ top: target, left: 0, behavior: "auto" });
      attempts += 1;
      if (target > 0 && Math.abs(window.scrollY - target) > 2 && attempts < MAX_RESTORE_ATTEMPTS) {
        timer = window.setTimeout(restore, 80);
      }
    };

    frame = window.requestAnimationFrame(restore);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      sessionStorage.setItem(storageKey, String(Math.max(0, window.scrollY)));
      window.history.scrollRestoration = previousRestoration;
    };
  }, [location.key, navigationType]);

  return null;
}
