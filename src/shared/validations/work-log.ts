export interface WorkLogFormValues {
  date: string;
  start_time: string;
  end_time: string;
  task_title: string;
  description: string;
}

export interface WorkLogValidationResult {
  isValid: boolean;
  errors: {
    date?: string;
    start_time?: string;
    end_time?: string;
    task_title?: string;
    description?: string;
    general?: string;
  };
  duration: number;
}

export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(":");
  if (parts.length !== 2) return -1;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return -1;
  }
  return hours * 60 + minutes;
}

export function calculateDurationHours(startTime: string, endTime: string): number {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  if (startMin < 0 || endMin < 0) return 0;
  
  const diff = endMin - startMin;
  if (diff <= 0) return 0;

  const hours = diff / 60;
  return Math.round(hours * 100) / 100;
}

export function validateWorkLog(values: WorkLogFormValues): WorkLogValidationResult {
  const errors: WorkLogValidationResult["errors"] = {};
  let isValid = true;

  // 1. Fecha
  if (!values.date || values.date.trim() === "") {
    errors.date = "La fecha es obligatoria.";
    isValid = false;
  }

  // 2. Hora Inicio
  if (!values.start_time || values.start_time.trim() === "") {
    errors.start_time = "La hora de inicio es obligatoria.";
    isValid = false;
  }

  // 3. Hora Fin
  if (!values.end_time || values.end_time.trim() === "") {
    errors.end_time = "La hora de fin es obligatoria.";
    isValid = false;
  }

  // 4. Duración y lógica de horas
  let duration = 0;
  if (values.start_time && values.end_time) {
    const startMin = parseTimeToMinutes(values.start_time);
    const endMin = parseTimeToMinutes(values.end_time);

    if (startMin < 0) {
      errors.start_time = "La hora de inicio tiene un formato inválido (debe ser HH:mm).";
      isValid = false;
    }

    if (endMin < 0) {
      errors.end_time = "La hora de fin tiene un formato inválido (debe ser HH:mm).";
      isValid = false;
    }

    if (startMin >= 0 && endMin >= 0) {
      if (endMin <= startMin) {
        errors.end_time = "La hora de fin debe ser posterior a la hora de inicio.";
        isValid = false;
      } else {
        duration = calculateDurationHours(values.start_time, values.end_time);
        if (duration <= 0) {
          errors.general = "La duración de las horas registradas debe ser mayor a 0.";
          isValid = false;
        }
      }
    }
  }

  // 5. Tarea
  if (!values.task_title || values.task_title.trim() === "") {
    errors.task_title = "El título de la tarea es obligatorio.";
    isValid = false;
  }

  // 6. Descripción
  if (!values.description || values.description.trim() === "") {
    errors.description = "La descripción de la tarea es obligatoria.";
    isValid = false;
  }

  return {
    isValid,
    errors,
    duration,
  };
}
