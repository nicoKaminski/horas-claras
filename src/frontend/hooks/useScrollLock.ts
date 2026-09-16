import { useEffect, useRef } from "react";

export function useScrollLock(isOpen: boolean) {
  const previousOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflowRef.current || "";
    };
  }, [isOpen]);
}
