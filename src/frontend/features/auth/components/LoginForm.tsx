"use client";

import { useActionState } from "react";
import { loginAction } from "@/backend/auth/actions";
import styles from "./LoginForm.module.css";

interface ActionState {
  error?: string;
}

const initialState: ActionState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="dev@example.com"
          disabled={isPending}
          autoComplete="email"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          disabled={isPending}
          autoComplete="current-password"
        />
      </div>
      {state.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className={styles.button} disabled={isPending}>
        {isPending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
