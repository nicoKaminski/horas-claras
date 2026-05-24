"use client";

import { useActionState } from "react";
import { FiClock } from "react-icons/fi";
import { markWorkLogAsJiraLoadedAction } from "@/backend/work-logs/actions";
import styles from "./MarkJiraLoadedButton.module.css";

interface MarkJiraLoadedButtonProps {
  logId: string;
}

export default function MarkJiraLoadedButton({ logId }: MarkJiraLoadedButtonProps) {
  const [state, formAction, isPending] = useActionState(
    markWorkLogAsJiraLoadedAction,
    {}
  );

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="id" value={logId} />
      <button
        type="submit"
        className={styles.button}
        disabled={isPending}
        aria-label="Marcar este registro como cargado en Jira"
        title="Marcar como cargado en Jira"
      >
        {isPending ? (
          <div className={styles.spinner} />
        ) : (
          <>
            <FiClock className={styles.badgeIcon} size={12} />
            <span>Pendiente</span>
          </>
        )}
      </button>
      {state?.error && (
        <span className={styles.error} role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}
