"use client";

import { useCallback, useEffect, useRef, useId } from "react";
import { FiX } from "react-icons/fi";
import styles from "./AppModal.module.css";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeDisabled?: boolean;
  discardConfirmation?: {
    isOpen: boolean;
    onContinueEditing: () => void;
    onDiscard: () => void;
  };
}

export default function AppModal({
  isOpen,
  onClose,
  title,
  children,
  closeDisabled = false,
  discardConfirmation,
}: AppModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const continueEditingButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const discardTitleId = useId();
  const isDiscardConfirmationOpen = discardConfirmation?.isOpen === true;

  const handleCloseAttempt = useCallback(() => {
    if (closeDisabled) return;

    if (isDiscardConfirmationOpen) {
      discardConfirmation?.onContinueEditing();
      return;
    }

    onClose();
  }, [closeDisabled, discardConfirmation, isDiscardConfirmationOpen, onClose]);

  // Mantener la versión más reciente del handler de cierre sin re-ejecutar efectos de foco
  const handleCloseAttemptRef = useRef(handleCloseAttempt);
  handleCloseAttemptRef.current = handleCloseAttempt;

  // Manejo de eventos de teclado (Escape y Tab trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseAttemptRef.current();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusTarget = isDiscardConfirmationOpen
          ? modalRef.current.querySelector<HTMLElement>(`[aria-labelledby="${discardTitleId}"]`)
          : modalRef.current;
        if (!focusTarget) return;

        const focusableElements = focusTarget.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

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
  }, [discardTitleId, isDiscardConfirmationOpen, isOpen]);

  // Bloqueo de scroll y foco inicial únicamente al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    // Enfocar elemento inicial solo si el foco no está ya dentro del modal
    const timer = setTimeout(() => {
      if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex="0"]'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";

      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Foco específico cuando se abre el diálogo de confirmación de descarte
  useEffect(() => {
    if (isDiscardConfirmationOpen) {
      continueEditingButtonRef.current?.focus();
    }
  }, [isDiscardConfirmationOpen]);

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
        <header className={styles.header} aria-hidden={isDiscardConfirmationOpen}>
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
        <div
          className={styles.content}
          aria-hidden={isDiscardConfirmationOpen}
          inert={isDiscardConfirmationOpen}
        >
          {children}
        </div>
        {isDiscardConfirmationOpen && discardConfirmation && (
          <section
            className={styles.discardConfirmation}
            aria-labelledby={discardTitleId}
          >
            <div className={styles.discardConfirmationContent}>
              <h3 id={discardTitleId} className={styles.discardConfirmationTitle}>
                ¿Descartar los cambios?
              </h3>
              <p className={styles.discardConfirmationMessage}>
                Tenés información sin guardar. Si cerrás el formulario, se perderá.
              </p>
              <div className={styles.discardConfirmationActions}>
                <button
                  ref={continueEditingButtonRef}
                  type="button"
                  className={styles.continueEditingBtn}
                  onClick={discardConfirmation.onContinueEditing}
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  className={styles.discardChangesBtn}
                  onClick={discardConfirmation.onDiscard}
                >
                  Descartar cambios
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
