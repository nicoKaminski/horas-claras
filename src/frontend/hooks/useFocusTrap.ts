import { useEffect, RefObject } from "react";

export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (!containerRef.current) return;
        
        const focusTarget = containerRef.current;
        const focusableElements = focusTarget.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex="0"]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        // Filter out inert, disabled, or visually hidden elements
        const elementsArray = Array.from(focusableElements).filter(el => {
            if (el.closest("[inert]") || (el as HTMLButtonElement).disabled) return false;
            return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
        });

        if (elementsArray.length === 0) return;

        const firstElement = elementsArray[0];
        const lastElement = elementsArray[elementsArray.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, containerRef]);
}
