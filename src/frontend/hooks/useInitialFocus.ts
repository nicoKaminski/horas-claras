import { useEffect, useRef, RefObject } from "react";

export function useInitialFocus(containerRef: RefObject<HTMLElement | null>, isOpen: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    // Enfocar elemento inicial solo si el foco no está ya dentro del modal
    const timer = setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex="0"]'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, containerRef]);
}
