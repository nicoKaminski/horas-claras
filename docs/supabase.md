# Supabase

Notas detalladas para configurar Supabase en Horas Claras.

## Autenticacion

Horas Claras usa Supabase Auth con email y password.

Para el MVP se trabaja internamente con dos identidades de usuario:

- `dev` (mostrado en la interfaz como `dev-admin`, con rol `admin`).
- `compa` (mostrado en la interfaz como `dev-user`, con rol `user`).

Los usuarios se crean manualmente desde Supabase Auth. No se deben documentar ni versionar emails reales, passwords reales, tokens ni claves privadas.

Configuracion esperada para desarrollo:

- Signup publico desactivado.
- Confirm email desactivado para facilitar el entorno local.
- Usuarios `dev` y `compa` creados manualmente.

## Profiles

La app usa una tabla `profiles` relacionada 1 a 1 con `auth.users`.

Perfiles esperados para el MVP:

- `dev` con rol `admin`.
- `compa` con rol `user`.

Estos perfiles se crean manualmente para desarrollo, usando los IDs reales generados por Supabase Auth en el proyecto local o de prueba. No versionar UUIDs reales.

## Migracion inicial

La migracion inicial vive en:

```txt
supabase/migrations/001_initial_schema.sql
```

Esa migracion define el esquema base de Horas Claras y se aplica manualmente en Supabase. Incluye las tablas:

- `profiles`
- `work_logs`

Tambien define indices, triggers de `updated_at`, funciones auxiliares, policies RLS y grants para usuarios autenticados.

## Permisos y RLS

Row Level Security es la fuente real de permisos. La UI puede ocultar acciones, pero la base debe rechazar operaciones no permitidas.

Reglas conceptuales principales:

- `dev` puede gestionar todos los registros.
- `compa` solo puede gestionar sus propios registros segun las reglas de negocio.
- Solo `dev` puede marcar registros como cargados en Jira.
- Los registros ya cargados en Jira no deben ser modificados por `compa`.

Funciones principales definidas por la migracion:

- `get_current_user_role()`
- `is_admin()`
- `get_profile_developer_name(uuid)`
- `prevent_non_admin_work_log_restricted_changes()`

## Variables y secretos

Variables publicas esperadas para frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No subir secretos al repositorio. No usar `service_role` en frontend.

## Verificacion conceptual

Despues de aplicar la migracion en Supabase, verificar conceptualmente que:

- Existe la tabla `profiles`.
- Existe la tabla `work_logs`.
- RLS esta habilitado para las tablas protegidas.
- Existen policies para lectura, creacion, edicion y borrado segun rol.
- Existen funciones y triggers definidos por la migracion inicial.
- Los perfiles manuales corresponden a `dev/admin` y `compa/user`.

No incluir en documentacion publica datos reales, emails reales, UUIDs reales ni valores sensibles del proyecto Supabase.

## Carga Histórica Manual

Se ha documentado un procedimiento seguro para la carga de datos históricos de horas en la base de datos de Supabase. Este procedimiento utiliza transacciones controladas con `ROLLBACK`/`COMMIT` y comprobaciones previas para evitar duplicados. Para más información, consulta la guía completa en [Carga Histórica Manual](./carga-historica.md).
