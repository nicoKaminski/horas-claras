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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseAttempt();
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

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);

      // Enfocar el primer elemento interactivo (usualmente el botón de cerrar)
      setTimeout(() => {
        if (isDiscardConfirmationOpen) {
          continueEditingButtonRef.current?.focus();
          return;
        }

        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex="0"]'
          );
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      }, 0);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);

      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [discardTitleId, handleCloseAttempt, isDiscardConfirmationOpen, isOpen]);

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
