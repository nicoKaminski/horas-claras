"use client";

import { useState, useTransition } from "react";
import { upsertMonthlyHourlyRateAction } from "@/backend/monthly-rates/actions";
import { DeveloperName } from "@/shared/types/profile";
import { getDeveloperDisplayName } from "@/shared/constants/profile-labels";
import styles from "./MonthlyRateCard.module.css";

interface MonthlyRateCardProps {
  developerName: DeveloperName;
  hourlyRate: number | null;
  amountToCharge: number | null;
  hasConfiguredRate: boolean;
  totalHours: number;
  year: number;
  month: number;
  isAdmin: boolean;
}

const formatCurrency = (value: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
};

export default function MonthlyRateCard({
  developerName,
  hourlyRate,
  amountToCharge,
  hasConfiguredRate,
  totalHours,
  year,
  month,
  isAdmin,
}: MonthlyRateCardProps) {
  const [isEditing, setIsEditing] = useState(!hasConfiguredRate && isAdmin);
  const [rateInput, setRateInput] = useState(hourlyRate ? String(hourlyRate) : "4500");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rateNum = Number(rateInput);
    if (isNaN(rateNum) || rateNum <= 0) {
      setError("La tarifa debe ser un número positivo.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("developer_name", developerName);
      formData.append("year", String(year));
      formData.append("month", String(month));
      formData.append("hourly_rate", String(rateNum));

      const result = await upsertMonthlyHourlyRateAction(undefined, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
      }
    });
  };

  const handleCancel = () => {
    setError(null);
    setRateInput(hourlyRate ? String(hourlyRate) : "4500");
    setIsEditing(false);
  };

  const displayName = getDeveloperDisplayName(developerName);

  return (
    <div className={styles.rateCard}>
      <div className={styles.header}>
        <div>
          <span className={styles.devLabel}>{displayName}</span>
          <span className={styles.hoursSubtitle}>{totalHours} horas trabajadas</span>
        </div>
        {!isEditing && isAdmin && (
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => setIsEditing(true)}
          >
            {hasConfiguredRate ? "Editar tarifa" : "Configurar tarifa"}
          </button>
        )}
      </div>

      <div className={styles.content}>
        {isEditing ? (
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor={`rate-${developerName}`} className={styles.inputLabel}>
                Valor Hora (ARS)
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.currencyPrefix}>$</span>
                <input
                  id={`rate-${developerName}`}
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className={styles.input}
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.btnRow}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
              {hasConfiguredRate && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelBtn}
                  disabled={isPending}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className={styles.metrics}>
            {hasConfiguredRate ? (
              <>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Valor Hora</span>
                  <strong className={styles.metricValue}>{formatCurrency(hourlyRate)}</strong>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Total a Cobrar</span>
                  <strong className={`${styles.metricValue} ${styles.totalHighlight}`}>
                    {formatCurrency(amountToCharge)}
                  </strong>
                </div>
              </>
            ) : (
              <div className={styles.missingState}>
                <span className={styles.warningText}>Sin tarifa configurada</span>
                {!isAdmin && (
                  <p className={styles.helperText}>
                    Contactá al administrador para configurar tu tarifa de este mes.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
