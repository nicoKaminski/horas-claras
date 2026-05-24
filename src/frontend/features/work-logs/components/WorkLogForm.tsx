"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { createWorkLogAction, updateWorkLogAction } from "@/backend/work-logs/actions";
import { Profile } from "@/shared/types/profile";
import { getDeveloperDisplayName } from "@/shared/constants/profile-labels";
import styles from "./WorkLogForm.module.css";

interface WorkLogFormProps {
  currentProfile: Profile;
  mode?: "create" | "edit";
  initialValues?: {
    date?: string;
    start_time?: string;
    end_time?: string | null;
    task_title?: string;
    description?: string;
  };
  workLogId?: string;
  isLoadedInJira?: boolean;
  onCancel?: () => void;
}

const formatTimeForInput = (timeStr?: string | null) => {
  if (!timeStr) return "";
  const parts = timeStr.trim().split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
};

export default function WorkLogForm({
  currentProfile,
  mode = "create",
  initialValues = {},
  workLogId,
  isLoadedInJira = false,
  onCancel,
}: WorkLogFormProps) {
  const isEdit = mode === "edit";
  const actionToUse = isEdit ? updateWorkLogAction : createWorkLogAction;

  const [state, formAction, isPending] = useActionState(
    actionToUse,
    {}
  );

  const isAdmin = currentProfile.role === "admin";

  // Resolver valores por defecto priorizando la respuesta del servidor en caso de error
  const defaultDate = state.values?.date ?? initialValues.date ?? "";
  const defaultStartTime = state.values?.start_time ?? formatTimeForInput(initialValues.start_time);
  const defaultEndTime = state.values?.end_time ?? formatTimeForInput(initialValues.end_time);
  const defaultTaskTitle = state.values?.task_title ?? initialValues.task_title ?? "";
  const defaultDescription = state.values?.description ?? initialValues.description ?? "";
  const defaultDevName = state.values?.developer_name ?? currentProfile.developer_name ?? "";

  const [prevDefaultDate, setPrevDefaultDate] = useState(defaultDate);
  const [dateValue, setDateValue] = useState(defaultDate);

  if (defaultDate !== prevDefaultDate) {
    setPrevDefaultDate(defaultDate);
    setDateValue(defaultDate);
  }

  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    try {
      datePickerRef.current?.showPicker();
    } catch {
      // Fallback
    }
  };

  return (
    <form action={formAction} className={styles.form}>
      {/* Input oculto para el ID del registro en modo edición */}
      {isEdit && workLogId && (
        <input type="hidden" name="id" value={workLogId} />
      )}

      {/* 1. Selección de desarrollador (Admin) o indicador estático (User) */}
      {isAdmin && !isEdit ? (
        <div className={styles.field}>
          <label htmlFor="developer_name">Desarrollador</label>
          <select
            id="developer_name"
            name="developer_name"
            className={styles.select}
            defaultValue={defaultDevName}
            disabled={isPending}
          >
            <option value="dev">{getDeveloperDisplayName("dev")}</option>
            <option value="compa">{getDeveloperDisplayName("compa")}</option>
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
            value={getDeveloperDisplayName(currentProfile.developer_name)}
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
          <div className={styles.dateInputContainer}>
            <input
              type="text"
              id="date"
              name="date"
              className={styles.input}
              placeholder="5/4/26, 05/04/2026 o 2026-04-05"
              required
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              disabled={isPending}
            />
            <button
              type="button"
              className={styles.calendarButton}
              onClick={handleCalendarClick}
              disabled={isPending}
              aria-label="Seleccionar fecha del calendario"
            >
              📅
            </button>
            <input
              ref={datePickerRef}
              type="date"
              className={styles.hiddenDatePicker}
              tabIndex={-1}
              value={/^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? dateValue : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setDateValue(e.target.value);
                }
              }}
              disabled={isPending}
            />
          </div>
          <span className={styles.helpText}>
            Podés escribir la fecha o elegirla con el calendario.
          </span>
          {state.errors?.date && (
            <p className={styles.fieldError} role="alert">
              {state.errors.date}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="start_time">Hora Inicio</label>
          <input
            type="text"
            inputMode="numeric"
            id="start_time"
            name="start_time"
            className={styles.input}
            placeholder="08:00 o 8"
            required
            defaultValue={defaultStartTime}
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
            type="text"
            inputMode="numeric"
            id="end_time"
            name="end_time"
            className={styles.input}
            placeholder="17:30 o 17"
            required
            defaultValue={defaultEndTime}
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
          defaultValue={defaultTaskTitle}
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
          defaultValue={defaultDescription}
          disabled={isPending}
        />
        {state.errors?.description && (
          <p className={styles.fieldError} role="alert">
            {state.errors.description}
          </p>
        )}
      </div>

      {/* 5. Advertencia para registros ya cargados en Jira (Admin) */}
      {isEdit && isLoadedInJira && (
        <div className={styles.warningMessage} role="alert">
          Este registro ya estaba cargado en Jira. Si guardás cambios, volverá a quedar pendiente de Jira.
        </div>
      )}

      {/* 6. Error general de acción */}
      {state.error && (
        <div className={styles.generalError} role="alert">
          {state.error}
        </div>
      )}

      {/* 7. Acciones */}
      <div className={styles.actions}>
        {onCancel ? (
          <button
            type="button"
            className={styles.buttonCancel}
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </button>
        ) : (
          <Link href="/registros" className={styles.buttonCancel}>
            Cancelar
          </Link>
        )}
        <button
          type="submit"
          className={styles.buttonSubmit}
          disabled={isPending}
        >
          {isPending
            ? isEdit
              ? "Guardando..."
              : "Registrando..."
            : isEdit
            ? "Guardar cambios"
            : "Registrar horas"}
        </button>
      </div>
    </form>
  );
}
