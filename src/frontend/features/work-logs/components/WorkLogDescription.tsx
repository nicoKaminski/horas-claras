"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import styles from "./WorkLogDescription.module.css";

interface WorkLogDescriptionProps {
  description: string;
  clampLines?: 2 | 3;
}

export default function WorkLogDescription({
  description,
  clampLines = 2,
}: WorkLogDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const checkOverflow = useCallback(() => {
    const el = textRef.current;
    if (!el) return;

    if (!isExpanded) {
      // scrollHeight es el alto total no restringido; clientHeight es el alto visible con clamp.
      // Se agrega 1px de margen para errores de redondeo de subpíxeles.
      const hasOverflow = el.scrollHeight > el.clientHeight + 1;
      setCanExpand(hasOverflow);
    }
  }, [isExpanded]);

  useEffect(() => {
    checkOverflow();

    const el = textRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      checkOverflow();
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [checkOverflow, description]);

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(description);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = description;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Error al copiar texto:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p
          ref={textRef}
          className={`${styles.text} ${
            !isExpanded
              ? clampLines === 3
                ? styles.clamped3
                : styles.clamped2
              : ""
          }`}
        >
          {description}
        </p>
        {canExpand && (
          <button
            type="button"
            className={styles.expandBtn}
            onClick={handleToggleExpand}
          >
            {isExpanded ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      <button
        type="button"
        className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ""}`}
        onClick={handleCopy}
        title={copied ? "Copiado" : "Copiar descripción"}
        aria-label={copied ? "Descripción copiada" : "Copiar descripción al portapapeles"}
      >
        {copied ? (
          <FiCheck size={14} aria-hidden="true" />
        ) : (
          <FiCopy size={14} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
