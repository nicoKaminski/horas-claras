# Horas Claras · Guía raíz para agentes

Este archivo es la entrada principal para cualquier agente que trabaje sobre este repositorio.

**Importante:** este documento define reglas, decisiones y objetivo del proyecto. No debe tomarse como evidencia de que una funcionalidad ya está implementada. Antes de modificar código, el agente debe auditar el estado real del repo, leer los archivos afectados y consultar al developer si falta contexto.

La app se llama **Horas Claras**. Es una mini app interna para registrar horas de trabajo, revisar pendientes y marcar qué registros ya fueron cargados en Jira.

El objetivo del repo es doble:

1. Ser una herramienta real de uso interno.
2. Servir como proyecto presentable de portfolio.

---

## 1. Lectura obligatoria antes de trabajar

Antes de editar cualquier archivo, el agente debe leer:

1. `AGENTS.md`
2. `package.json`
3. La estructura actual del repo
4. Solo los archivos relacionados con la tarea
5. Si aplica, los documentos de `agent/`

Documentos auxiliares:

```txt
agent/rules.md
agent/project-state.md
agent/prompt-contract.md
agent/frontend-design.md
```

Skill recomendado para UI:

```txt
.agents/skills/horas-claras-frontend-design/SKILL.md
```

---

## 2. Principios obligatorios

- No asumir información que no esté verificada en el repositorio o indicada explícitamente por el developer.
- No inventar archivos, rutas, contratos, tablas, columnas, tipos, funciones, respuestas de API ni comportamientos.
- Si falta contexto, pedirlo antes de modificar código.
- Si una decisión funcional o técnica no está cerrada, frenar y consultar.
- Actuar con honestidad técnica: marcar riesgos, inconsistencias o enfoques débiles aunque contradigan una idea inicial.
- Priorizar cambios chicos, trazables y fáciles de revisar.
- No hacer refactors amplios si la tarea no los pide.
- No tocar archivos fuera del alcance salvo que sea imprescindible. Si hace falta, explicarlo antes.
- No usar nombres reales de personas. Usar siempre `dev` y `compa`.

---

## 3. Stack y decisiones cerradas

Stack objetivo del proyecto:

- Next.js
- React
- TypeScript
- CSS Modules
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Vercel

Decisiones cerradas:

- Un solo repo.
- Next.js vive en la raíz del repo.
- La separación interna del código debe hacerse dentro de `src`.
- No usar Tailwind.
- No usar Google Sheets como interfaz.
- No usar Google Forms.
- No usar n8n.
- No crear backend Express, Nest u otro backend separado para el MVP.
- No guardar passwords propias en tablas de la app.
- No implementar bcrypt manual si se usa Supabase Auth.
- Login real: email + password gestionado por Supabase Auth.
- Identidad visible dentro de la app: `dev` y `compa`.
- `dev` representa al usuario admin.
- `compa` representa al usuario común.
- `dev` puede hacer todo.
- `compa` solo puede gestionar sus propios registros según reglas de negocio.
- Solo `dev` puede marcar registros como cargados en Jira.

---

## 4. Estructura objetivo del repo

Estructura esperada:

```txt
horas-claras/
├─ public/
├─ src/
│  ├─ app/
│  ├─ frontend/
│  ├─ backend/
│  └─ shared/
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ docs/
├─ agent/
├─ .agents/
│  └─ skills/
├─ .env.example
├─ .gitignore
├─ AGENTS.md
├─ package.json
└─ README.md
```

Responsabilidades:

```txt
src/app
  Rutas de Next.js App Router, layouts, páginas y route handlers si correspondiera.

src/frontend
  Componentes visuales, features de UI, formularios, estilos por módulo y navegación.

src/backend
  Server actions, servicios server-side, helpers de Supabase server-side y lógica segura del lado servidor.

src/shared
  Tipos, constantes, validaciones puras y utilidades compartidas entre frontend y backend.

supabase/migrations
  Migraciones SQL versionadas.

supabase/seed.sql
  Datos iniciales o instrucciones de seed sin secretos ni datos reales sensibles.

agent
  Reglas extendidas, estado del proyecto, contrato de prompts y guía visual.

.agents/skills
  Skills locales o documentación ejecutiva para agentes que soporten skills.
```

No crear otra estructura sin aprobación explícita.

---

## 5. Dominio mínimo

La entidad principal es el registro de horas.

Campos conceptuales mínimos:

```txt
id
user_id
developer_name
created_by
date
start_time
end_time
duration_hours
task_title
description
jira_loaded
jira_loaded_at
created_at
updated_at
```

Reglas:

- Cada registro pertenece a un usuario dueño mediante `user_id`.
- `developer_name` solo puede ser `dev` o `compa`.
- `created_by` registra quién creó el registro.
- Si `dev` crea un registro para `compa`, entonces:
  - `user_id` debe ser el id real de `compa`;
  - `developer_name` debe ser `compa`;
  - `created_by` debe ser el id real de `dev`.
- `compa` puede ver, crear, editar y eliminar solo sus propios registros, mientras las reglas de negocio lo permitan.
- `compa` no puede marcar registros como cargados en Jira.
- `compa` no debe modificar registros ya cargados en Jira salvo que el developer indique otra regla.
- `dev` puede ver todo.
- `dev` puede crear registros para sí mismo y para `compa`.
- `dev` puede editar, eliminar y marcar como cargado en Jira cualquier registro.
- Al marcar como cargado en Jira:
  - `jira_loaded = true`
  - `jira_loaded_at = now()`

La seguridad real debe estar respaldada por Supabase RLS. No alcanza con ocultar botones en frontend.

---

## 6. Autenticación y permisos

Supabase Auth gestiona usuarios, sesiones y credenciales.

No crear una tabla propia de usuarios con password hash para login.

Modelo esperado:

```txt
auth.users
  Gestionado por Supabase.

public.profiles
  Perfil propio de la app relacionado 1 a 1 con auth.users.
```

`profiles` debe representar datos de app como:

```txt
id = auth.users.id
username = dev | compa
developer_name = dev | compa
role = admin | user
created_at
updated_at
```

Reglas:

- `dev` debe tener rol `admin`.
- `compa` debe tener rol `user`.
- No exponer service role key en frontend.
- No usar service role key salvo tarea explícita server-side y con justificación.
- Toda operación sensible debe respetar RLS.
- Las variables públicas de Supabase para browser deben usar prefijo `NEXT_PUBLIC_`.
- No subir `.env.local` ni secretos al repo.

---

## 7. Código

Obligatorio:

- TypeScript estricto.
- No usar `any`.
- No usar `as any`.
- No introducir tipos flojos para evitar errores.
- No dejar imports rotos.
- No referenciar exports inexistentes.
- No dejar código muerto evidente.
- No duplicar lógica si ya existe una utilidad clara.
- Preferir funciones pequeñas y nombradas.
- Mantener componentes `.tsx` simples.
- Separar lógica server-side de componentes visuales cuando corresponda.
- Respetar aliases existentes, especialmente `@/*` si está configurado.
- Seguir patrones existentes antes de proponer uno nuevo.

Prohibido:

- Inventar contratos de Supabase no creados.
- Inventar columnas o policies que no existan.
- Llamar a datos como si existieran sin verificar migraciones/types.
- Usar librerías nuevas sin aprobación.
- Cambiar el stack decidido sin aprobación.

---

## 8. UI y estilos

- Usar CSS Modules.
- No usar Tailwind.
- No usar estilos inline salvo casos mínimos y justificados.
- No hacer rediseños implícitos.
- Mantener una estética simple, limpia, responsive y profesional.
- Priorizar usabilidad sobre decoración.
- No cambiar colores, layout o patrones visuales sin necesidad.
- Si una tarea requiere tocar UI, consultar `agent/frontend-design.md`.

---

## 9. Supabase

Antes de tocar Supabase, verificar:

- Variables de entorno necesarias.
- Cliente browser vs cliente server.
- Qué operaciones corren en cliente y cuáles en servidor.
- Que no se exponga ninguna clave privada.
- Que las tablas tengan RLS activo.
- Que las policies cubran la regla real, no solo la UI.

Migraciones:

- Deben vivir en `supabase/migrations`.
- Deben ser SQL claro y revisable.
- No deben contener datos reales.
- No deben depender de IDs reales de producción.
- Deben incluir índices razonables cuando aplique.
- Deben incluir `updated_at` si la tabla requiere auditoría.
- Deben evitar funciones inseguras sin `search_path` explícito cuando sean `security definer`.

RLS:

- No confiar solo en filtros de frontend.
- No confiar solo en server actions.
- La base debe rechazar operaciones no permitidas.
- Si se requiere detectar admin/dev, usar una función SQL segura y documentada.

---

## 10. Variables de entorno y secretos

No crear ni modificar `.env.local` con valores reales salvo instrucción explícita del developer.

Permitido crear `.env.example` sin secretos.

Variables esperadas para Supabase en frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Reglas:

- Nunca imprimir secretos en logs.
- Nunca subir service role key.
- Nunca copiar claves reales en README o docs.
- Si se necesita una variable nueva, documentarla en `.env.example` y README/docs.
- Si `.gitignore` ignora `.env*`, asegurar que `.env.example` quede permitido con `!.env.example`.

---

## 11. Comandos y validaciones

El agente no puede ejecutar comandos sin autorización explícita del developer.

Esto incluye:

- comandos de instalación;
- comandos de build;
- comandos de lint;
- comandos de dev;
- comandos de Supabase;
- comandos de Vercel;
- comandos de testing;
- comandos de formateo.

Comandos de Git prohibidos siempre:

```bash
git add
git commit
git push
git rebase
git merge
git reset --hard
git clean
```

Si conviene validar, sugerir solo comandos que existan en `package.json`.

Actualmente, validar contra `package.json` antes de sugerir:

```bash
npm run lint
npm run build
npm run dev
```

No inventar `npm run typecheck` si no existe script.

El agente no debe decir que una tarea quedó técnicamente cerrada si no se ejecutaron o no fueron reportadas las validaciones necesarias.

Debe distinguir entre:

```txt
Implementación realizada.
Validación pendiente.
```

y:

```txt
Implementación realizada y validada.
```

---

## 12. Documentación

Actualizar documentación cuando la tarea lo requiera.

Documentos esperados:

```txt
README.md
.env.example
docs/setup-local.md
docs/supabase.md
docs/deploy-vercel.md
docs/decisiones.md
agent/project-state.md
```

No documentar por documentar en cada cambio chico, salvo que el developer lo pida.

Toda documentación debe:

- No contener secretos.
- No contener nombres reales.
- Ser útil para levantar el proyecto.
- Reflejar decisiones reales tomadas.
- Evitar promesas o features que no existen todavía.

---

## 13. Cierre obligatorio de tarea

Al finalizar una tarea, el agente debe reportar:

```txt
Archivos modificados
Archivos creados
Archivos eliminados
Qué cambió
Qué no se tocó
Validaciones ejecutadas o pendientes
Dudas, riesgos o próximos pasos
```

No ocultar fallos.

Si algo no se pudo verificar, decirlo explícitamente.

Usar también `agent/prompt-contract.md` como contrato de cierre.

---

## 14. Prioridad de instrucciones

Si hay conflicto entre instrucciones:

1. Instrucciones explícitas del developer en la tarea actual.
2. Este `AGENTS.md`.
3. Documentos de `agent/`.
4. Documentación del proyecto.
5. Patrones existentes del repo.
6. Criterio del agente.

Nunca ignorar una instrucción explícita del developer salvo que sea técnicamente peligrosa o contradiga una regla de seguridad. En ese caso, explicar el problema antes de actuar.
