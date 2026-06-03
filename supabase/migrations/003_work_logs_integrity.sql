-- Migration: 003_work_logs_integrity.sql
-- Description: Enforces integrity constraints on work_logs: duration, overlaps, and daily accumulated hours limits.

-- 1. Create check constraints for max duration of 12 hours and required end_time
ALTER TABLE public.work_logs 
    ADD CONSTRAINT work_logs_duration_hours_max CHECK (duration_hours <= 12.00);

ALTER TABLE public.work_logs 
    ADD CONSTRAINT work_logs_end_time_not_null CHECK (end_time IS NOT NULL);

-- 2. Trigger function to validate all integrity rules with user-friendly error messages
CREATE OR REPLACE FUNCTION public.validate_work_log_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    daily_total numeric(5,2);
    overlapping_exists boolean;
BEGIN
    -- 0. La hora de fin es obligatoria
    IF new.end_time IS NULL THEN
        RAISE EXCEPTION 'La hora de fin es obligatoria.';
    END IF;

    -- 1. Duración máxima por registro (duplicate check inside trigger for custom friendly message)
    IF new.duration_hours > 12.00 THEN
        RAISE EXCEPTION 'Un registro no puede superar las 12 horas.';
    END IF;

    -- 2. Consistencia entre duration_hours y start_time/end_time
    -- end_time debe ser estrictamente posterior a start_time
    IF new.end_time <= new.start_time THEN
        RAISE EXCEPTION 'La hora de fin debe ser posterior a la hora de inicio.';
    END IF;

    IF ABS(new.duration_hours - ROUND((EXTRACT(EPOCH FROM (new.end_time - new.start_time)) / 3600.0)::numeric, 2)) > 0.01 THEN
        RAISE EXCEPTION 'La duración en horas no coincide con la diferencia entre hora de inicio y fin.';
    END IF;

    -- 3. No solapamiento por user_id + date (excluyendo new.id si es update)
    -- Hay solapamiento si: existing.start_time < new.end_time y existing.end_time > new.start_time
    SELECT EXISTS (
        SELECT 1 
        FROM public.work_logs
        WHERE user_id = new.user_id 
          AND date = new.date
          AND id <> COALESCE(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND end_time IS NOT NULL
          AND start_time < new.end_time
          AND end_time > new.start_time
    ) INTO overlapping_exists;

    IF overlapping_exists THEN
        RAISE EXCEPTION 'Ya existe un registro de horas que se superpone con ese horario.';
    END IF;

    -- 4. Total diario por user_id + date no mayor a 20 horas
    SELECT COALESCE(SUM(duration_hours), 0)
    INTO daily_total
    FROM public.work_logs
    WHERE user_id = new.user_id
      AND date = new.date
      AND id <> COALESCE(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF (daily_total + new.duration_hours) > 20.00 THEN
        RAISE EXCEPTION 'El total diario no puede superar las 20 horas.';
    END IF;

    RETURN new;
END;
$$;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS work_logs_integrity_trigger ON public.work_logs;
CREATE TRIGGER work_logs_integrity_trigger
    BEFORE INSERT OR UPDATE ON public.work_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_work_log_integrity();
