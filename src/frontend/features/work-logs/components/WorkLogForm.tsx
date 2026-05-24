"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createWorkLogAction } from "@/backend/work-logs/actions";
import { Profile } from "@/shared/types/profile";
import styles from "./WorkLogForm.module.css";

interface WorkLogFormProps {
  currentProfile: Profile;
}

export default function WorkLogForm({ currentProfile }: WorkLogFormProps) {
  const [state, formAction, isPending] = useActionState(
    createWorkLogAction,
    {}
  );

  const isAdmin = currentProfile.role === "admin";

  return (
    <form action={formAction} className={styles.form}>
      {/* 1. Selección de desarrollador (Admin) o indicador estático (User) */}
      {isAdmin ? (
        <div className={styles.field}>
          <label htmlFor="developer_name">Desarrollador</label>
          <select
            id="developer_name"
            name="developer_name"
            className={styles.select}
            defaultValue={currentProfile.developer_name}
            disabled={isPending}
          >
            <option value="dev">dev</option>
            <option value="compa">compa</option>
          </select>
          {state.errors?.general && (
            <p className={styles.fieldError} role="alert">
              {state.errors.general}
            </p>
          )}
        </div>
      ) : (
        <div className={styles.field}>
          <label htmlFor="developer_name_display">Desarrollador</label>
          <input
            type="text"
            id="developer_name_display"
            className={styles.input}
            value={currentProfile.developer_name}
            disabled
          />
          <input
            type="hidden"
            name="developer_name"
            value={currentProfile.developer_name}
          />
        </div>
      )}

      {/* 2. Fila con Fecha y Horas */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="date">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            className={styles.input}
            required
            disabled={isPending}
          />
          {state.errors?.date && (
            <p className={styles.fieldError} role="alert">
              {state.errors.date}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="start_time">Hora Inicio</label>
          <input
            type="time"
            id="start_time"
            name="start_time"
            className={styles.input}
            required
            disabled={isPending}
          />
          {state.errors?.start_time && (
            <p className={styles.fieldError} role="alert">
              {state.errors.start_time}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="end_time">Hora Fin</label>
          <input
            type="time"
            id="end_time"
            name="end_time"
            className={styles.input}
            required
            disabled={isPending}
          />
          {state.errors?.end_time && (
            <p className={styles.fieldError} role="alert">
              {state.errors.end_time}
            </p>
          )}
        </div>
      </div>

      {/* 3. Título de Tarea */}
      <div className={styles.field}>
        <label htmlFor="task_title">Título de la Tarea (Jira Ticket)</label>
        <input
          type="text"
          id="task_title"
          name="task_title"
          className={styles.input}
          placeholder="Ej: HC-123 Solucionar bug de login"
          required
          disabled={isPending}
        />
        {state.errors?.task_title && (
          <p className={styles.fieldError} role="alert">
            {state.errors.task_title}
          </p>
        )}
      </div>

      {/* 4. Descripción */}
      <div className={styles.field}>
        <label htmlFor="description">Descripción del Trabajo</label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          placeholder="Detalle detallado de lo que se realizó..."
          required
          disabled={isPending}
        />
        {state.errors?.description && (
          <p className={styles.fieldError} role="alert">
            {state.errors.description}
          </p>
        )}
      </div>

      {/* 5. Error general de acción */}
      {state.error && (
        <div className={styles.generalError} role="alert">
          {state.error}
        </div>
      )}

      {/* 6. Acciones */}
      <div className={styles.actions}>
        <Link href="/registros" className={styles.buttonCancel}>
          Cancelar
        </Link>
        <button
          type="submit"
          className={styles.buttonSubmit}
          disabled={isPending}
        >
          {isPending ? "Registrando..." : "Registrar horas"}
        </button>
      </div>
    </form>
  );
}
