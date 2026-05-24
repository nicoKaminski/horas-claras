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
  normalizedValues?: {
    date: string;
    start_time: string;
    end_time: string;
  };
}

export function isValidCalendarDate(day: number, month: number, year: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Leap year check
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (isLeap) {
    daysInMonth[1] = 29;
  }

  return day <= daysInMonth[month - 1];
}

export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  if (clean === "") return null;

  // 1. Check YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const parts = clean.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isValidCalendarDate(day, month, year)) {
      return clean;
    }
    return null;
  }

  // 2. Check D/M/YYYY or DD/MM/YYYY or D-M-YYYY or DD-MM-YYYY
  const match = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (isValidCalendarDate(day, month, year)) {
      const paddedDay = day.toString().padStart(2, "0");
      const paddedMonth = month.toString().padStart(2, "0");
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  }

  return null;
}

export function normalizeTime(timeStr: string): string | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  if (clean === "") return null;

  // Regex matching HH or H
  if (/^\d{1,2}$/.test(clean)) {
    const hours = parseInt(clean, 10);
    if (hours >= 0 && hours <= 23) {
      const paddedHours = hours.toString().padStart(2, "0");
      return `${paddedHours}:00`;
    }
    return null;
  }

  // Regex matching H:mm or HH:mm
  if (/^(\d{1,2}):(\d{2})$/.test(clean)) {
    const match = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const paddedHours = hours.toString().padStart(2, "0");
        const paddedMinutes = minutes.toString().padStart(2, "0");
        return `${paddedHours}:${paddedMinutes}`;
      }
    }
  }

  return null;
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
  let duration = 0;
  let normalizedDate = "";
  let normalizedStart = "";
  let normalizedEnd = "";

  // 1. Fecha
  if (!values.date || values.date.trim() === "") {
    errors.date = "La fecha es obligatoria.";
    isValid = false;
  } else {
    const norm = normalizeDate(values.date);
    if (!norm) {
      errors.date = "Formato de fecha inválido (ej: 06/05/2026 o 2026-05-06).";
      isValid = false;
    } else {
      normalizedDate = norm;
    }
  }

  // 2. Hora Inicio
  if (!values.start_time || values.start_time.trim() === "") {
    errors.start_time = "La hora de inicio es obligatoria.";
    isValid = false;
  } else {
    const norm = normalizeTime(values.start_time);
    if (!norm) {
      errors.start_time = "Formato de hora inválido (ej: 08:00, 8:30 o 8).";
      isValid = false;
    } else {
      normalizedStart = norm;
    }
  }

  // 3. Hora Fin
  if (!values.end_time || values.end_time.trim() === "") {
    errors.end_time = "La hora de fin es obligatoria.";
    isValid = false;
  } else {
    const norm = normalizeTime(values.end_time);
    if (!norm) {
      errors.end_time = "Formato de hora inválido (ej: 17:00, 17:30 o 17).";
      isValid = false;
    } else {
      normalizedEnd = norm;
    }
  }

  // 4. Duración y lógica de horas
  if (isValid && normalizedStart && normalizedEnd) {
    const startMin = parseTimeToMinutes(normalizedStart);
    const endMin = parseTimeToMinutes(normalizedEnd);

    if (endMin <= startMin) {
      errors.end_time = "La hora de fin debe ser posterior a la hora de inicio.";
      isValid = false;
    } else {
      duration = calculateDurationHours(normalizedStart, normalizedEnd);
      if (duration <= 0) {
        errors.general = "La duración de las horas registradas debe ser mayor a 0.";
        isValid = false;
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
    ...(isValid ? { normalizedValues: { date: normalizedDate, start_time: normalizedStart, end_time: normalizedEnd } } : {}),
  };
}
