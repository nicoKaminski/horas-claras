"use client";

import { useActionState, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { deleteWorkLogAction } from "@/backend/work-logs/actions";
import AppModal from "@/frontend/components/modal/AppModal";
import styles from "./DeleteWorkLogButton.module.css";

interface DeleteWorkLogButtonProps {
  logId: string;
}

export default function DeleteWorkLogButton({ logId }: DeleteWorkLogButtonProps) {
  const [state, formAction, isPending] = useActionState(
    deleteWorkLogAction,
    {}
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={styles.button}
        aria-label="Eliminar este registro de horas"
        title="Eliminar registro"
      >
        <FiTrash2 size={16} />
      </button>

      <AppModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Confirmar eliminación"
      >
        <div className={styles.modalContent}>
          <p className={styles.warningText}>
            ¿Estás seguro de que deseas eliminar este registro de horas? Esta acción no se puede deshacer.
          </p>
          <form action={formAction} className={styles.form}>
            <input type="hidden" name="id" value={logId} />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleClose}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.confirmBtn}
                disabled={isPending}
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
            {state?.error && (
              <span className={styles.error} role="alert">
                {state.error}
              </span>
            )}
          </form>
        </div>
      </AppModal>
    </>
  );
}
