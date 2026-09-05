import { KeyboardEvent, RefObject, useCallback, useEffect, useRef } from "react";

const FOCUSABLE = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useDialogFocus(
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      const preferred = containerRef.current?.querySelector<HTMLElement>("[data-dialog-initial-focus]");
      const first = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (preferred ?? first ?? containerRef.current)?.focus();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      previouslyFocused?.focus();
    };
  }, [containerRef]);

  return useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeRef.current();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...(containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
      .filter((element) => element.offsetParent !== null);
    if (!focusable.length) {
      event.preventDefault();
      containerRef.current?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [containerRef]);
}
