# Horas Claras · Estado del proyecto

> Este documento es una ayuda de contexto, no una verdad absoluta.
>
> Antes de usarlo para implementar, el agente debe auditar el repo real, revisar el repomix o los archivos actuales, y consultar al developer si algo no coincide.

Última referencia conocida: auditoría inicial sobre un repomix del proyecto Horas Claras.

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

## 3. Estado observado en repo

Según el repomix auditado, el repo contiene:

```txt
AGENTS.md
CLAUDE.md
README.md
package.json
eslint.config.mjs
next.config.ts
tsconfig.json
src/app/
src/frontend/
src/backend/
src/shared/
supabase/migrations/
supabase/seed.sql
docs/
```

También existen carpetas base con `.gitkeep` para preparar módulos futuros.

---

## 4. Implementado o presente en archivos

Estado observado:

- Proyecto Next.js inicial creado.
- Home mínima en `src/app/page.tsx`.
- Estilos base en `src/app/globals.css`.
- Estilos de landing/home en `src/app/page.module.css`.
- Metadata de la app configurada como Horas Claras.
- Estructura `src/frontend`, `src/backend`, `src/shared` creada con `.gitkeep`.
- Carpeta `supabase/migrations` creada.
- Migración inicial `001_initial_schema.sql` presente.
- `supabase/seed.sql` presente como placeholder.
- `AGENTS.md` presente con reglas iniciales.
- `CLAUDE.md` referencia `@AGENTS.md`.

---

## 5. Puntos que no deben darse por implementados

No asumir como completado sin verificar:

- Proyecto Supabase creado.
- Migración aplicada en Supabase.
- Tablas `profiles` y `work_logs` existentes en la base real.
- RLS activo en la base real.
- Policies funcionando en Supabase real.
- Usuarios `dev` y `compa` creados en Supabase Auth.
- Variables `.env.local` configuradas.
- `.env.example` creado.
- Dependencias de Supabase instaladas.
- Clientes Supabase browser/server creados.
- Login implementado.
- Dashboard implementado.
- CRUD de registros implementado.
- Vista de pendientes Jira implementada.
- Deploy Vercel configurado.
- README actualizado al proyecto real.

---

## 6. Observaciones técnicas importantes

El README observado todavía parece ser el README default generado por Next.js. Debe actualizarse antes de presentar el proyecto como portfolio o entregarlo como documentación real.

El `package.json` observado incluye scripts básicos:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

No asumir que existe `npm run typecheck` si no aparece en `package.json`.

Si todavía no existen dependencias de Supabase, no escribir imports de Supabase hasta instalar/documentar la dependencia o recibir confirmación del developer.

---

## 7. Migración inicial observada

Existe una migración inicial que define conceptualmente:

- `public.profiles`;
- `public.work_logs`;
- índices;
- función `set_updated_at`;
- funciones para rol/admin;
- trigger para cambios restringidos;
- RLS;
- policies de select/insert/update/delete;
- grants.

Esta migración debe auditarse antes de aplicarse o modificarse.

Preguntas a verificar:

- ¿La migración ya fue aplicada en Supabase?
- ¿Las funciones `security definer` son suficientes y seguras?
- ¿Las policies cubren exactamente el flujo `dev`/`compa`?
- ¿Hay algún problema con inserts de perfiles iniciales?
- ¿Cómo se crearán `dev` y `compa` sin usar datos reales en seed?

---

## 8. Hitos tentativos

Los hitos previos pueden estar desactualizados. Usarlos solo como guía.

### Hito A — Preparación manual / infraestructura

- Crear/verificar repo GitHub.
- Verificar proyecto Next.js base.
- Crear proyecto Supabase.
- Configurar Supabase Auth.
- Crear usuarios iniciales.
- Aplicar migraciones.
- Configurar variables locales.
- Crear `.env.example`.
- Configurar Vercel.
- Hacer deploy inicial.

### Hito B — Construcción técnica con agente

- Auditoría real del repo.
- Restaurar/confirmar base mínima Next.js.
- Ordenar estructura interna.
- Definir tipos base.
- Crear/validar migración SQL inicial.
- Crear cliente Supabase browser/server.
- Implementar login.
- Proteger rutas privadas.
- Crear/listar/editar/eliminar registros.
- Agregar filtros.
- Crear vista de pendientes Jira.
- Marcar cargado en Jira.
- Dashboard.
- UX responsive.
- Documentación.
- QA local.
- Deploy Vercel.

---

## 9. Regla para agentes

Antes de implementar, el agente debe responder internamente:

1. ¿Qué archivos reales existen?
2. ¿Qué parte de este documento sigue vigente?
3. ¿Qué parte contradice el repo?
4. ¿Qué necesita confirmación del developer?
5. ¿Qué validaciones reales están disponibles en `package.json`?

Si hay duda, no inventar.
