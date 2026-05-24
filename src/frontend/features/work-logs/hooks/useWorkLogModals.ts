import { useState } from "react";
import { WorkLog } from "@/shared/types/work-log";

export function useWorkLogModals() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<WorkLog | null>(null);

  const openCreateModal = () => setIsCreateOpen(true);
  const closeCreateModal = () => setIsCreateOpen(false);

  const handleEditClick = (log: WorkLog) => {
    setLogToEdit(log);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setLogToEdit(null);
    setIsEditOpen(false);
  };

  return {
    isCreateOpen,
    isEditOpen,
    logToEdit,
    openCreateModal,
    closeCreateModal,
    handleEditClick,
    closeEditModal,
  };
}
