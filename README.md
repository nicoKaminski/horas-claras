# Horas Claras

Mini app interna para registrar horas de trabajo, revisar pendientes y controlar que registros ya fueron cargados en Jira.

## Objetivo

Horas Claras tiene un objetivo doble:

1. Ser una herramienta real de uso interno.
2. Servir como proyecto presentable de portfolio, con foco en arquitectura simple, permisos claros y documentación cuidada.

## Estado actual

Presente en el repositorio:

- Proyecto Next.js con estructura base.
- Home inicial personalizada.
- Estructura interna preparada en `src/app`, `src/frontend`, `src/backend` y `src/shared`.
- Migracion inicial Supabase en `supabase/migrations/001_initial_schema.sql`.
- Documentacion base para setup, Supabase, deploy, decisiones y agentes.

Pendiente en codigo:

- Integracion del SDK de Supabase.
- Login con email y password.
- Rutas privadas.
- CRUD de registros de horas.
- Vista de pendientes Jira y marcado como cargado.
- Dashboard, filtros y busqueda.
- Deploy en Vercel.

Ver el detalle en [docs/roadmap.md](./docs/roadmap.md).

## Stack

- Next.js
- React
- TypeScript
- CSS Modules
- Supabase Auth
- Supabase PostgreSQL
- Supabase RLS
- Vercel

## Funcionalidades del MVP

- Login con email y password mediante Supabase Auth. Pendiente en codigo.
- Registro de horas de trabajo. Pendiente en codigo.
- Listado, edicion y eliminacion de registros. Pendiente en codigo.
- Vista de registros pendientes de carga en Jira. Pendiente en codigo.
- Marcado de registros como cargados en Jira, solo para `dev`. Pendiente en codigo.
- Dashboard con resumen y metricas. Pendiente en codigo.

## Modelo de permisos

El MVP trabaja con dos identidades visibles:

| Usuario | Rol | Resumen |
| --- | --- | --- |
| `dev` | `admin` | Puede ver todo, gestionar cualquier registro y marcar carga Jira. |
| `compa` | `user` | Gestiona solo sus propios registros no cargados en Jira. |

La seguridad real debe estar respaldada por Supabase RLS, no solo por controles visuales.

Detalle en [docs/decisiones.md](./docs/decisiones.md) y [docs/supabase.md](./docs/supabase.md).

## Estructura del repo

```txt
horas-claras/
├── src/
│   ├── app/        Rutas, layouts y paginas de Next.js
│   ├── frontend/   Componentes visuales y features de UI
│   ├── backend/    Logica server-side y helpers seguros
│   └── shared/     Tipos, constantes y utilidades compartidas
├── supabase/
│   ├── migrations/ Migraciones SQL versionadas
│   └── seed.sql    Seed o notas sin datos sensibles
├── docs/           Documentacion detallada del proyecto
├── agent/          Documentacion auxiliar para agentes
├── AGENTS.md       Reglas obligatorias para agentes
└── README.md       Portada del repo
```

## Setup rapido

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

Guia completa en [docs/setup-local.md](./docs/setup-local.md).

## Scripts

Scripts reales definidos en `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

No hay script `npm run typecheck` definido por ahora.

## Variables de entorno

Variables publicas esperadas para conectar con Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No subir `.env.local`, secretos, tokens, passwords ni claves `service_role`.

Detalle en [docs/setup-local.md](./docs/setup-local.md) y [docs/supabase.md](./docs/supabase.md).

## Documentacion

- [Setup local](./docs/setup-local.md)
- [Supabase](./docs/supabase.md)
- [Deploy en Vercel](./docs/deploy-vercel.md)
- [Decisiones](./docs/decisiones.md)
- [Roadmap](./docs/roadmap.md)
- [Reglas para agentes](./AGENTS.md)
- [Documentacion auxiliar para agentes](./agent/)

## Contacto

[![LinkedIn](https://img.shields.io/badge/LinkedIn-w?logo=inspire&logoColor=white&labelColor=007AB5&color=007AB5)](https://www.linkedin.com/in/nkaminski-profile/) [![Email](https://img.shields.io/badge/eMail-w?logo=gmail&logoColor=white&labelColor=%23EA4335&color=%23EA4335)](mailto:nicokaminski89@gmail.com)

## Licencia

Sin licencia open source definida por el momento.
