"use client";

import { useCallback, useEffect, useRef, useId } from "react";
import { FiX } from "react-icons/fi";
import styles from "./AppModal.module.css";
import { useScrollLock } from "@/frontend/hooks/useScrollLock";
import { useFocusTrap } from "@/frontend/hooks/useFocusTrap";
import { useInitialFocus } from "@/frontend/hooks/useInitialFocus";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeDisabled?: boolean;
}

export default function AppModal({
  isOpen,
  onClose,
  title,
  children,
  closeDisabled = false,
}: AppModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useScrollLock(isOpen);
  useFocusTrap(modalRef, isOpen);
  useInitialFocus(modalRef, isOpen);

  const handleCloseAttempt = useCallback(() => {
    if (closeDisabled) return;
    onClose();
  }, [closeDisabled, onClose]);

  // Mantener la versión más reciente del handler de cierre
  const handleCloseAttemptRef = useRef(handleCloseAttempt);
  useEffect(() => {
    handleCloseAttemptRef.current = handleCloseAttempt;
  }, [handleCloseAttempt]);

  // Manejo de evento Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseAttemptRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleCloseAttempt}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleCloseAttempt}
            aria-label="Cerrar modal"
            disabled={closeDisabled}
          >
            <FiX size={20} />
          </button>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
