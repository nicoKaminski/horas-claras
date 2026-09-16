import { useState, useRef, useEffect, RefObject } from "react";

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

interface UseWorkLogFieldSyncProps {
  defaultDate: string;
  defaultStartTime: string;
  defaultEndTime: string;
}

interface UseWorkLogFieldSyncReturn {
  dateValue: string;
  startTimeVal: string;
  endTimeVal: string;
  setDateValue: (v: string) => void;
  setStartTimeVal: (v: string) => void;
  setEndTimeVal: (v: string) => void;
  isDirty: boolean;
  formRef: RefObject<HTMLFormElement | null>;
  handleFormChange: () => void;
}

export function useWorkLogFieldSync({
  defaultDate,
  defaultStartTime,
  defaultEndTime,
}: UseWorkLogFieldSyncProps): UseWorkLogFieldSyncReturn {
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

  const handleFormChange = () => {
    if (!formRef.current || initialFormSnapshotRef.current === null) return;
    setIsDirty(getFormSnapshot(formRef.current) !== initialFormSnapshotRef.current);
  };

  return {
    dateValue,
    startTimeVal,
    endTimeVal,
    setDateValue,
    setStartTimeVal,
    setEndTimeVal,
    isDirty,
    formRef,
    handleFormChange,
  };
}
