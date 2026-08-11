"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createWorkLogAction, updateWorkLogAction } from "@/backend/work-logs/actions";
import { Profile } from "@/shared/types/profile";
import { getDeveloperDisplayName } from "@/shared/constants/profile-labels";
import { normalizeTime, calculateDurationHours, parseTimeToMinutes, MAX_WORK_LOG_HOURS } from "@/shared/validations/work-log";
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
  workLogDeveloperName?: "dev" | "compa";
  onCancel?: () => void;
  onFormStateChange?: (state: { isDirty: boolean; isPending: boolean }) => void;
}

const TRACKED_FIELD_NAMES = [
  "developer_name",
  "date",
  "start_time",
  "end_time",
  "task_title",
  "description",
] as const;

const getFormSnapshot = (form: HTMLFormElement) => {
  const formData = new FormData(form);

  return JSON.stringify(
    TRACKED_FIELD_NAMES.map((fieldName) => [fieldName, String(formData.get(fieldName) ?? "")])
  );
};

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
  workLogDeveloperName,
  onCancel,
  onFormStateChange,
}: WorkLogFormProps) {
  const isEdit = mode === "edit";
  const actionToUse = isEdit ? updateWorkLogAction : createWorkLogAction;
  const searchParams = useSearchParams();

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
  const defaultDevName = state.values?.developer_name ?? workLogDeveloperName ?? currentProfile.developer_name ?? "";

  const [dateValue, setDateValue] = useState(defaultDate);
  const [startTimeVal, setStartTimeVal] = useState(defaultStartTime);
  const [endTimeVal, setEndTimeVal] = useState(defaultEndTime);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const initialFormSnapshotRef = useRef<string | null>(null);

  // Sincronizar estados locales usando useEffect para evitar setStates en render
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateValue(defaultDate);
  }, [defaultDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartTimeVal(defaultStartTime);
  }, [defaultStartTime]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEndTimeVal(defaultEndTime);
  }, [defaultEndTime]);

  useEffect(() => {
    if (!formRef.current) return;

    initialFormSnapshotRef.current = getFormSnapshot(formRef.current);
  }, []);

  useEffect(() => {
    onFormStateChange?.({ isDirty, isPending });
  }, [isDirty, isPending, onFormStateChange]);

  // Cálculos de duración y advertencias en vivo
  const normStart = normalizeTime(startTimeVal);
  const normEnd = normalizeTime(endTimeVal);

  let liveDuration: number | null = null;
  let liveError: string | null = null;

  if (normStart && normEnd) {
    const startMin = parseTimeToMinutes(normStart);
    const endMin = parseTimeToMinutes(normEnd);

    if (endMin <= startMin) {
      liveError = "La hora de fin debe ser posterior a la hora de inicio.";
    } else {
      liveDuration = calculateDurationHours(normStart, normEnd);
      if (liveDuration > MAX_WORK_LOG_HOURS) {
        liveError = "Un registro no puede superar las 12 horas.";
      }
    }
  }

  const datePickerRef = useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    try {
      datePickerRef.current?.showPicker();
    } catch {
      // Fallback
    }
  };

  const handleFormChange = () => {
    if (!formRef.current || initialFormSnapshotRef.current === null) return;

    setIsDirty(getFormSnapshot(formRef.current) !== initialFormSnapshotRef.current);
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className={styles.form}
      onChange={handleFormChange}
      onInput={handleFormChange}
    >
      {/* Input oculto para el ID del registro en modo edición */}
      {isEdit && workLogId && (
        <input type="hidden" name="id" value={workLogId} />
      )}

      {/* Input oculto para conservar los parámetros de período (mes y año) */}
      <input type="hidden" name="search_params" value={searchParams.toString()} />

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
            aria-invalid={!!state.errors?.general}
            aria-describedby={state.errors?.general ? "developer-error" : undefined}
          >
            <option value="dev">{getDeveloperDisplayName("dev")}</option>
            <option value="compa">{getDeveloperDisplayName("compa")}</option>
          </select>
          {state.errors?.general && (
            <p id="developer-error" className={styles.fieldError} role="alert">
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
            value={getDeveloperDisplayName(workLogDeveloperName || currentProfile.developer_name)}
            disabled
          />
          <input
            type="hidden"
            name="developer_name"
            value={workLogDeveloperName || currentProfile.developer_name}
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
              aria-invalid={!!state.errors?.date}
              aria-describedby={state.errors?.date ? "date-error" : "date-help"}
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
          <span id="date-help" className={styles.helpText}>
            Podés escribir la fecha o elegirla con el calendario.
          </span>
          {state.errors?.date && (
            <p id="date-error" className={styles.fieldError} role="alert">
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
            value={startTimeVal}
            onChange={(e) => setStartTimeVal(e.target.value)}
            disabled={isPending}
            aria-invalid={!!state.errors?.start_time}
            aria-describedby={state.errors?.start_time ? "start-time-error" : undefined}
          />
          {state.errors?.start_time && (
            <p id="start-time-error" className={styles.fieldError} role="alert">
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
            value={endTimeVal}
            onChange={(e) => setEndTimeVal(e.target.value)}
            disabled={isPending}
            aria-invalid={!!state.errors?.end_time}
            aria-describedby={state.errors?.end_time ? "end-time-error" : undefined}
          />
          {state.errors?.end_time && (
            <p id="end-time-error" className={styles.fieldError} role="alert">
              {state.errors.end_time}
            </p>
          )}
        </div>
      </div>

      {/* Duración calculada en vivo y mensajes informativos */}
      {liveDuration !== null && !liveError && (
        <div className={styles.liveDuration}>
          Duración calculada: <strong>{liveDuration} {liveDuration === 1 ? "hora" : "horas"}</strong>
        </div>
      )}

      {liveError && (
        <div className={styles.liveError} role="alert">
          {liveError}
        </div>
      )}

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
          aria-invalid={!!state.errors?.task_title}
          aria-describedby={state.errors?.task_title ? "task-title-error" : undefined}
        />
        {state.errors?.task_title && (
          <p id="task-title-error" className={styles.fieldError} role="alert">
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
          aria-invalid={!!state.errors?.description}
          aria-describedby={state.errors?.description ? "description-error" : undefined}
        />
        {state.errors?.description && (
          <p id="description-error" className={styles.fieldError} role="alert">
            {state.errors.description}
          </p>
        )}
      </div>

      {/* 5. Advertencia para registros ya cargados en Jira (Admin) */}
      {isEdit && isLoadedInJira && isAdmin && (
        <div className={styles.warningMessage} role="alert">
          Este registro ya fue cargado en Jira. Si guardás cambios, volverá a quedar como Pendiente de Jira.
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
