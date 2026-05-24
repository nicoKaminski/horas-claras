import { logoutAction } from "@/backend/auth/actions";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className={styles.button}>
        Cerrar sesión
      </button>
    </form>
  );
}
