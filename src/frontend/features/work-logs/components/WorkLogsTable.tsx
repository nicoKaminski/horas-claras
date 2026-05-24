"use client";

import { useState } from "react";
import { FiEdit2, FiCheck, FiClock } from "react-icons/fi";
import { WorkLog } from "@/shared/types/work-log";
import { Profile } from "@/shared/types/profile";
import MarkJiraLoadedButton from "./MarkJiraLoadedButton";
import DeleteWorkLogButton from "./DeleteWorkLogButton";
import styles from "./WorkLogsTable.module.css";

interface WorkLogsTableProps {
  logs: WorkLog[];
  currentProfile: Profile;
  onEdit: (log: WorkLog) => void;
}

const formatTime = (timeStr: string | null) => {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default function WorkLogsTable({ logs, currentProfile, onEdit }: WorkLogsTableProps) {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Pre-calcular horas totales por fecha y desarrollador
  const totalHoursByDateAndDev = logs.reduce((acc, log) => {
    const key = `${log.date}_${log.developer_name}`;
    acc[key] = (acc[key] || 0) + log.duration_hours;
    return acc;
  }, {} as Record<string, number>);

  const isAdmin = currentProfile.role === "admin";

  const getCanEdit = (log: WorkLog) => {
    const isOwner = log.user_id === currentProfile.id;
    const isPending = !log.jira_loaded;
    return isAdmin || (isOwner && isPending);
  };

  return (
    <div className={styles.wrapper}>
      {/* Vista de Tabla Desktop */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Desarrollador</th>
              <th>Horario</th>
              <th>Horas</th>
              <th>Total Día</th>
              <th>Tarea</th>
              <th>Descripción</th>
              <th>Estado Jira</th>
              <th className={styles.actionsHeader}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const key = `${log.date}_${log.developer_name}`;
              const dailyTotal = Math.round((totalHoursByDateAndDev[key] || 0) * 100) / 100;
              const isExpanded = !!expandedLogs[log.id];
              const isLong = log.description.length > 70;
              const displayText = isLong && !isExpanded
                ? `${log.description.substring(0, 70)}...`
                : log.description;
              const canEdit = getCanEdit(log);

              return (
                <tr key={log.id}>
                  <td className={styles.dateCell}>{formatDate(log.date)}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        log.developer_name === "dev" ? styles.badgeDev : styles.badgeCompa
                      }`}
                    >
                      {log.developer_name}
                    </span>
                  </td>
                  <td className={styles.timeCell}>
                    {formatTime(log.start_time)} - {formatTime(log.end_time)}
                  </td>
                  <td className={styles.hoursCell}>{log.duration_hours} hs</td>
                  <td className={styles.totalHoursCell}>{dailyTotal} hs</td>
                  <td className={styles.taskCell}>{log.task_title}</td>
                  <td className={styles.descCell}>
                    <div className={styles.descText}>
                      {displayText}
                      {isLong && (
                        <button
                          type="button"
                          className={styles.expandBtn}
                          onClick={() => toggleExpand(log.id)}
                        >
                          {isExpanded ? "Ver menos" : "Ver más"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    {log.jira_loaded ? (
                      <span className={`${styles.jiraBadge} ${styles.jiraBadgeLoaded}`}>
                        <FiCheck className={styles.badgeIcon} />
                        <span>Cargado</span>
                      </span>
                    ) : (
                      <div className={styles.jiraPendingWrapper}>
                        {isAdmin ? (
                          <MarkJiraLoadedButton logId={log.id} />
                        ) : (
                          <span className={`${styles.jiraBadge} ${styles.jiraBadgePending}`}>
                            <FiClock className={styles.badgeIcon} />
                            <span>Pendiente</span>
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actionsContainer}>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(log)}
                          className={styles.editBtn}
                          title="Editar registro"
                          aria-label="Editar este registro"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      )}
                      {(isAdmin || (!log.jira_loaded && log.user_id === currentProfile.id)) && (
                        <DeleteWorkLogButton logId={log.id} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas Mobile */}
      <div className={styles.cardsContainer}>
        {logs.map((log) => {
          const key = `${log.date}_${log.developer_name}`;
          const dailyTotal = Math.round((totalHoursByDateAndDev[key] || 0) * 100) / 100;
          const isExpanded = !!expandedLogs[log.id];
          const isLong = log.description.length > 100;
          const displayText = isLong && !isExpanded
            ? `${log.description.substring(0, 100)}...`
            : log.description;
          const canEdit = getCanEdit(log);

          return (
            <article key={log.id} className={styles.mobileCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                  <h3 className={styles.cardTask}>{log.task_title}</h3>
                  <span
                    className={`${styles.badge} ${
                      log.developer_name === "dev" ? styles.badgeDev : styles.badgeCompa
                    }`}
                  >
                    {log.developer_name}
                  </span>
                </div>
                <div className={styles.cardTimeRow}>
                  <span>{formatDate(log.date)}</span>
                  <span>
                    {formatTime(log.start_time)} - {formatTime(log.end_time)}
                  </span>
                </div>
              </div>

              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Duración:</span>
                  <strong className={styles.statValue}>{log.duration_hours} hs</strong>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total del día:</span>
                  <strong className={styles.statValue}>{dailyTotal} hs</strong>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p>{displayText}</p>
                {isLong && (
                  <button
                    type="button"
                    className={styles.expandBtn}
                    onClick={() => toggleExpand(log.id)}
                  >
                    {isExpanded ? "Ver menos" : "Ver más"}
                  </button>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.cardJiraStatus}>
                  {log.jira_loaded ? (
                    <span className={`${styles.jiraBadge} ${styles.jiraBadgeLoaded}`}>
                      <FiCheck className={styles.badgeIcon} />
                      <span>Cargado</span>
                    </span>
                  ) : (
                    <div className={styles.jiraPendingWrapper}>
                      {isAdmin ? (
                        <MarkJiraLoadedButton logId={log.id} />
                      ) : (
                        <span className={`${styles.jiraBadge} ${styles.jiraBadgePending}`}>
                          <FiClock className={styles.badgeIcon} />
                          <span>Pendiente</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(log)}
                      className={styles.editBtn}
                      aria-label="Editar este registro"
                      title="Editar registro"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  )}
                  {(isAdmin || (!log.jira_loaded && log.user_id === currentProfile.id)) && (
                    <DeleteWorkLogButton logId={log.id} />
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
