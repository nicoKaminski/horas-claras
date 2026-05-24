# Horas Claras · Estado del proyecto

> Este documento es una ayuda de contexto, no una verdad absoluta.
>
> Antes de usarlo para implementar, el agente debe auditar el repo real, revisar los archivos actuales, y consultar al developer si algo no coincide.

Última referencia conocida: auditoría completa del repo en mayo 2026.

---

## 1. Objetivo del proyecto

**Horas Claras** es una mini app interna para:

- registrar horas de trabajo;
- revisar registros pendientes;
- marcar qué registros ya fueron cargados en Jira;
- diferenciar permisos entre `dev` y `compa`.

El proyecto también debe servir como portfolio, por lo que la UI debe ser limpia, profesional y presentable.

---

## 2. Stack objetivo

Stack definido para el MVP:

- Next.js
- React
- TypeScript
- CSS Modules
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Vercel

Decisiones cerradas:

- Un solo repositorio.
- Next.js en la raíz del repo.
- Separación interna dentro de `src`.
- No Tailwind.
- No Google Sheets como interfaz.
- No Google Forms.
- No n8n.
- No backend Express/Nest separado para el MVP.
- Supabase Auth gestiona login y credenciales.

---

## 3. Estructura real del repo

```txt
horas-claras/
├─ public/
│  ├─ faviconHorasClarasDark.png
│  └─ logoHorasClarasDark.png
├─ src/
│  ├─ app/
│  │  ├─ dashboard/         Página de dashboard (page.tsx + page.module.css)
│  │  ├─ login/             Página de login (page.tsx + page.module.css)
│  │  ├─ pendientes-jira/   Página de pendientes Jira (page.tsx + page.module.css)
│  │  ├─ registros/
│  │  │  ├─ [id]/           Edición de un registro específico
│  │  │  └─ nuevo/          Creación de registro
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx           Redirige a /dashboard o /login según sesión
│  ├─ frontend/
│  │  ├─ components/
│  │  │  ├─ app-shell/      AppShell.tsx + AppShell.module.css
│  │  │  ├─ modal/          AppModal.tsx + AppModal.module.css
│  │  │  └─ theme/          ThemeToggle.tsx + ThemeToggle.module.css
│  │  ├─ features/
│  │  │  ├─ auth/
│  │  │  │  └─ components/  LoginForm, LogoutButton
│  │  │  ├─ dashboard/
│  │  │  │  └─ components/  DashboardFilters, MonthlyRateCard
│  │  │  └─ work-logs/
│  │  │     ├─ components/  DeleteWorkLogButton, MarkJiraLoadedButton,
│  │  │     │               WorkLogForm, WorkLogsTable, Workspace
│  │  │     ├─ hooks/       useWorkLogFilters, useWorkLogModals,
│  │  │     │               useWorkLogsTableRows, useWorkspacePeriodNavigation
│  │  │     └─ utils/       work-log-table.ts
│  │  ├─ hooks/
│  │  │  └─ useThemePreference.ts
│  │  └─ styles/            (vacío por ahora)
│  ├─ backend/
│  │  ├─ auth/              actions.ts, get-current-session.ts
│  │  ├─ monthly-rates/     actions.ts, get-monthly-rates.ts
│  │  ├─ profiles/          get-current-profile.ts
│  │  ├─ supabase/          browser.ts, server.ts, env.ts, index.ts
│  │  └─ work-logs/         actions.ts, get-dashboard-metrics.ts,
│  │                        get-pending-jira-work-logs.ts, get-work-log-by-id.ts,
│  │                        get-work-logs.ts
│  └─ shared/
│     ├─ constants/         profile-labels.ts
│     ├─ types/             dashboard.ts, monthly-rate.ts, profile.ts, work-log.ts
│     ├─ utils/             (vacío)
│     └─ validations/       work-log.ts
├─ supabase/
│  ├─ migrations/
│  │  ├─ 001_initial_schema.sql
│  │  └─ 002_monthly_hourly_rates.sql
│  └─ seed.sql
├─ docs/
├─ agent/
├─ .agents/skills/
├─ .env.example
├─ .gitignore
├─ AGENTS.md
├─ CLAUDE.md
├─ package.json
└─ README.md
```

---

## 4. Implementado y verificado en archivos

Estado real observado en el repo:

### Infraestructura y configuración
- Proyecto Next.js 16.2.6 con React 19, TypeScript estricto.
- Fuentes: Geist Sans y Geist Mono (next/font/google).
- Favicon real: `faviconHorasClarasDark.png`.
- Logo real: `logoHorasClarasDark.png`.
- Variables de entorno documentadas en `.env.example`.
- `.gitignore` configurado (`.env.local` ignorado, `.env.example` versionado).

### Supabase
- Clientes browser y server implementados en `src/backend/supabase/` usando `@supabase/ssr`.
- Validación segura de variables de entorno en `env.ts`.
- Migración `001_initial_schema.sql`: tablas `profiles` y `work_logs`, índices, triggers, funciones auxiliares, RLS y policies.
- Migración `002_monthly_hourly_rates.sql`: tabla `monthly_hourly_rates`, índice, trigger, RLS y policies.

### Autenticación y permisos
- Login con email y password vía Supabase Auth.
- Logout implementado.
- Lectura de sesión activa en server-side.
- Redirección automática: `/` redirige a `/dashboard` si hay sesión, a `/login` si no.
- Rutas privadas protegidas.
- Identidad visible: `dev` mostrado como `dev-admin`, `compa` mostrado como `dev-user`.
- Mapeo centralizado en `src/shared/constants/profile-labels.ts`.

### CRUD de registros de horas
- Formulario de creación y edición (`WorkLogForm`).
- Listado de registros con tabla (`WorkLogsTable`).
- Eliminación de registros (`DeleteWorkLogButton`).
- Marcado como cargado en Jira (`MarkJiraLoadedButton`), solo para `dev-admin`.
- Server actions en `src/backend/work-logs/actions.ts`.

### Workspace y filtros
- Componente `Workspace` centralizado con:
  - buscador de texto libre por tarea y descripción;
  - filtro por estado Jira (pendientes / cargados / todos);
  - filtro por desarrollador;
  - filtro por rango de fechas;
  - navegación por período (mes anterior / mes siguiente).
- Hooks extraídos: `useWorkLogFilters`, `useWorkLogModals`, `useWorkLogsTableRows`, `useWorkspacePeriodNavigation`.

### Vista de pendientes Jira
- Página `/pendientes-jira` con listado de registros sin cargar en Jira.
- Marcado de registros disponible solo para `dev-admin`.

### Dashboard
- Página `/dashboard` con:
  - filtros de período y desarrollador (`DashboardFilters`);
  - métricas: total horas, total registros, pendientes Jira, cargados Jira, promedio por registro, porcentaje de carga, top día;
  - gráfico de barras diario (CSS/SVG nativo, sin librería externa);
  - desglose por desarrollador;
  - tarjetas de tarifa y monto a cobrar (`MonthlyRateCard`) con edición inline para admin.

### Tarifas mensuales
- Tabla `monthly_hourly_rates` en base de datos.
- `dev-admin` puede crear y editar tarifas por desarrollador, año y mes.
- `dev-user` puede ver su propia tarifa.
- Monto a cobrar calculado: horas trabajadas × tarifa configurada.
- Estado "Sin tarifa configurada" mostrado si no existe registro para ese período.

### Tema claro/oscuro
- Soporte de tema `light` / `night` con `data-theme` en `<html>`.
- Persistencia en `localStorage`.
- Detección de preferencia del sistema.
- Prevención de flash de hidratación mediante script inline en `layout.tsx`.
- Hook `useThemePreference` en `src/frontend/hooks/`.
- Componente `ThemeToggle` en `src/frontend/components/theme/`.

### AppShell y navegación
- Componente `AppShell` con navegación lateral responsive.
- Muestra identidad del usuario logueado.
- Incluye botón de tema y `LogoutButton`.

### Branding
- Logo y favicon reales aplicados (archivos PNG en `public/`).
- Metadata configurada en `layout.tsx`.

---

## 5. Hitos por estado

### Completado
- Infraestructura y configuración base.
- Clientes Supabase (browser y server).
- Autenticación: login, logout, rutas protegidas.
- Esquema de base de datos: migraciones 001 y 002.
- CRUD de registros de horas.
- Vista de pendientes Jira y marcado.
- Workspace con búsqueda, filtros y navegación de período.
- Dashboard con métricas reales y gráfico.
- Tarifas mensuales por desarrollador.
- Temas claro/oscuro con persistencia.
- AppShell y navegación.
- Branding con logo y favicon reales.
- Documentación (README, roadmap, setup, Supabase, decisiones, carga histórica).

### Pendiente
- Deploy en Vercel (pendiente de conexión y validación del developer).

---

## 6. Observaciones técnicas

- `src/frontend/styles/` existe pero está vacío. Los estilos viven en los CSS Modules junto a cada componente.
- `src/shared/utils/` existe pero está vacío.
- `supabase/seed.sql` existe como placeholder sin datos reales.
- No existe script `npm run typecheck` en `package.json`. Los scripts disponibles son: `dev`, `build`, `start`, `lint`.
- El diseño usa Geist Sans y Geist Mono vía `next/font/google`.
- `react-icons` está instalado como dependencia (versión 5.x).
- El tema `night` (modo oscuro) usa el valor `night` en `localStorage` y `data-theme`, no `dark`.

---

## 7. Regla para agentes

Antes de implementar, el agente debe responder internamente:

1. ¿Qué archivos reales existen?
2. ¿Qué parte de este documento sigue vigente?
3. ¿Qué parte contradice el repo?
4. ¿Qué necesita confirmación del developer?
5. ¿Qué validaciones reales están disponibles en `package.json`?

Si hay duda, no inventar.
