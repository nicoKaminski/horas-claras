# Decisiones

Decisiones tecnicas y de producto para el MVP de Horas Claras.

## Repositorio

El proyecto vive en un solo repositorio.

Next.js vive en la raiz del repositorio.

La separacion interna del codigo se hace dentro de `src`.

## Usuarios del MVP

El MVP trabaja internamente con dos identificadores de usuario (`username` / `developer_name`):

- `dev`
- `compa`

`dev` representa al usuario administrador y se muestra en la interfaz (UI) como `dev-admin`.

`compa` representa al usuario común y se muestra en la interfaz (UI) como `dev-user`.

Esto mantiene los valores de base de datos y políticas de seguridad (RLS) intactos mientras mejora el branding y la legibilidad en el frontend.

## Autenticacion

El login usa email y password gestionados por Supabase Auth.

La app no guarda passwords propias ni implementa hashing manual.

La identidad visible dentro de Horas Claras usa `username` y `developer_name` con los valores `dev` o `compa`.

## Roles

Roles del MVP:

- `dev` tiene rol `admin`.
- `compa` tiene rol `user`.

`dev` puede crear registros propios y tambien registros en nombre de `compa`.

## Registros de horas

La entidad principal es `work_logs`.

`work_logs.user_id` representa el dueno real del registro.

`work_logs.created_by` audita que usuario creo el registro.

Cuando `dev` crea un registro para `compa`:

- `user_id` debe ser el ID real de `compa`.
- `developer_name` debe ser `compa`.
- `created_by` debe ser el ID real de `dev`.

## Evolucion futura

El modelo puede escalar mas adelante a multiples usuarios con rol `user`, manteniendo el criterio de que `user_id` define el dueno real del registro y `created_by` conserva la auditoria de creacion.

## Frontend

La UI usa CSS Modules.

No se usa Tailwind.

## Backend

Para el MVP no se crea un backend separado con Express, Nest u otro framework.

La app vive en Next.js y la seguridad de datos sensibles debe estar respaldada por Supabase RLS.
