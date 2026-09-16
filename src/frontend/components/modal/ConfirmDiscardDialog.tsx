"use client";

import styles from "./AppModal.module.css";
import { useId, useRef, useEffect } from "react";

interface ConfirmDiscardDialogProps {
  isOpen: boolean;
  onContinueEditing: () => void;
  onDiscard: () => void;
}

export default function ConfirmDiscardDialog({
  isOpen,
  onContinueEditing,
  onDiscard,
}: ConfirmDiscardDialogProps) {
  const discardTitleId = useId();
  const continueEditingButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      continueEditingButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
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
            onClick={onContinueEditing}
          >
            Seguir editando
          </button>
          <button
            type="button"
            className={styles.discardChangesBtn}
            onClick={onDiscard}
          >
            Descartar cambios
          </button>
        </div>
      </div>
    </section>
  );
}
