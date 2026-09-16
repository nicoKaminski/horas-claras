import { normalizeTime, calculateDurationHours, parseTimeToMinutes, MAX_WORK_LOG_HOURS } from "@/shared/validations/work-log";

export function useWorkLogLiveDuration(startTimeVal: string, endTimeVal: string) {
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

  return {
    liveDuration,
    liveError,
  };
}
