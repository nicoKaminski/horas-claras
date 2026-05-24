"use client";

import { useActionState } from "react";
import { deleteWorkLogAction } from "@/backend/work-logs/actions";
import styles from "./DeleteWorkLogButton.module.css";

interface DeleteWorkLogButtonProps {
  logId: string;
}

export default function DeleteWorkLogButton({ logId }: DeleteWorkLogButtonProps) {
  const [state, formAction, isPending] = useActionState(
    deleteWorkLogAction,
    {}
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const confirmed = window.confirm(
      "¿Eliminar este registro de horas? Esta acción no se puede deshacer."
    );
    if (!confirmed) {
      e.preventDefault();
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className={styles.form}>
      <input type="hidden" name="id" value={logId} />
      <button
        type="submit"
        className={styles.button}
        disabled={isPending}
        aria-label="Eliminar este registro de horas"
      >
        {isPending ? "Eliminando..." : "Eliminar"}
      </button>
      {state?.error && (
        <span className={styles.error} role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
