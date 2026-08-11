"use client";

import { FiEdit2, FiCheck, FiClock } from "react-icons/fi";
import { WorkLog } from "@/shared/types/work-log";
import { Profile } from "@/shared/types/profile";
import { getDeveloperDisplayName } from "@/shared/constants/profile-labels";
import MarkJiraLoadedButton from "./MarkJiraLoadedButton";
import DeleteWorkLogButton from "./DeleteWorkLogButton";
import { useWorkLogsTableRows } from "../hooks/useWorkLogsTableRows";
import { formatTime, formatDate } from "../utils/work-log-table";
import styles from "./WorkLogsTable.module.css";

interface WorkLogsTableProps {
  logs: WorkLog[];
  currentProfile: Profile;
  onEdit: (log: WorkLog) => void;
}

export default function WorkLogsTable({ logs, currentProfile, onEdit }: WorkLogsTableProps) {
  const {
    expandedLogs,
    toggleExpand,
    checkCanEdit,
  } = useWorkLogsTableRows({ currentProfile });

  const isAdmin = currentProfile.role === "admin";

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
              <th>Tarea</th>
              <th>Descripción</th>
              <th>Estado Jira</th>
              <th className={styles.actionsHeader}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const isExpanded = !!expandedLogs[log.id];
              const isLong = log.description.length > 70;
              const displayText = isLong && !isExpanded
                ? `${log.description.substring(0, 70)}...`
                : log.description;
              const canEdit = checkCanEdit(log);

              return (
                <tr key={log.id}>
                  <td className={styles.dateCell}>{formatDate(log.date)}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        log.developer_name === "dev" ? styles.badgeDev : styles.badgeCompa
                      }`}
                    >
                      {getDeveloperDisplayName(log.developer_name)}
                    </span>
                  </td>
                  <td className={styles.timeCell}>
                    {formatTime(log.start_time)} - {formatTime(log.end_time)}
                  </td>
                  <td className={styles.hoursCell}>{log.duration_hours} hs</td>
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
          const isExpanded = !!expandedLogs[log.id];
          const isLong = log.description.length > 100;
          const displayText = isLong && !isExpanded
            ? `${log.description.substring(0, 100)}...`
            : log.description;
          const canEdit = checkCanEdit(log);

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
                    {getDeveloperDisplayName(log.developer_name)}
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
