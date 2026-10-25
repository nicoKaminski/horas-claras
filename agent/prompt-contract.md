# Horas Claras · Contrato para prompts de agentes locales

Este documento define cómo deben redactarse y ejecutarse los prompts para agentes locales del IDE.

Aplica cuando el developer pasa una tarea a un agente como Codex, Gemini, Claude, Antigravity u otro ejecutor local.

---

## 1. Objetivo

El agente local debe ejecutar tareas chicas, controladas y auditables dentro del repo **Horas Claras**, sin inventar arquitectura ni ampliar alcance.

---

## 2. Reglas que todo prompt debe incluir

Todo prompt para agente local debe indicar:

1. Repositorio objetivo y rama de trabajo requerida. `dev` es habitual, pero no reemplaza la rama indicada por la tarea.
2. Objetivo, alcance exacto y plan cerrado de implementación o diagnóstico.
3. Archivos o carpetas que debe leer antes de editar, incluyendo `AGENTS.md` y `package.json`.
4. Qué archivos puede modificar y qué queda expresamente fuera de alcance.
5. Restricciones de comandos, dependencias, datos y servicios externos.
6. Validaciones esperadas y cuáles requieren autorización para ejecutarse.
7. Formato obligatorio de entrega.

---

## 3. Plantilla base de prompt

Usar esta plantilla como base y adaptarla a cada tarea.

```md
Trabajá en el repositorio `nicoKaminski/horas-claras`.

Rama requerida: [RAMA]. Confirmá el repositorio, la rama y los cambios locales antes de editar. No cambies de rama. `dev` es la rama habitual si la tarea no indica otra; `main` requiere pull request desde cualquier rama.

Objetivo:
[DESCRIBIR OBJETIVO CONCRETO]

Plan cerrado:
1. [PASO CONCRETO]
2. [PASO CONCRETO]
No ampliar ni reemplazar este plan. Si aparece un bloqueo o una necesidad fuera del alcance, reportarlo sin implementarla.

Alcance:
- Modificar solo los archivos necesarios para esta tarea.
- No hacer refactors generales.
- No cambiar arquitectura.
- No agregar dependencias.
- No modificar contratos no relacionados.
- No crear mocks productivos.
- No usar nombres reales de personas.
- Tratar todos los archivos versionados como públicos: no incluir secretos, credenciales ni datos reales o internos.
- No tocar archivos fuera del alcance salvo que sea estrictamente necesario y lo informes.

Lectura previa obligatoria:
1. Leé `AGENTS.md`.
2. Leé `package.json`.
3. Leé los archivos directamente relacionados con esta tarea:
   - [LISTAR ARCHIVOS/CARPETAS]
4. Si tocás UI, leé `agent/frontend-design.md`.
5. Si tocás reglas de agente/documentación, leé `agent/rules.md`.

Reglas técnicas:
- TypeScript estricto.
- No usar `any`.
- No usar `as any`.
- No dejar imports rotos ni símbolos sin uso.
- No inventar rutas, tipos, helpers, endpoints, tablas, columnas ni policies.
- No hardcodear valores de negocio si no están definidos en el repo o en esta tarea.
- Respetar patrones existentes.
- Si falta contexto, frená y reportalo.

Restricciones de comandos:
- Solo se permite inspección Git de lectura cuando la tarea lo autorice.
- No uses operaciones que escriban o cambien el repositorio: `git add`, `commit`, `push`, `pull`, `fetch`, `merge`, `rebase`, `reset`, `checkout`, `switch`, `restore`, `stash`, `clean` ni equivalentes.
- No instales, elimines ni actualices dependencias; no ejecutes comandos destructivos.
- No ejecutes comandos de instalación, build, lint, dev o tests salvo autorización explícita del developer.
- Si sugerís comandos, usá solo scripts existentes en `package.json`.

Entrega obligatoria:
Al finalizar, reportá:

- Archivos modificados.
- Archivos creados.
- Archivos eliminados.
- Qué cambió en cada archivo.
- Qué no se tocó.
- Validaciones ejecutadas.
- Validaciones pendientes.
- Revisión de seguridad y privacidad realizada cuando corresponda.
- Riesgos o dudas.
- Cambios de contrato, si hubo.
- Próximo paso recomendado.

No declares “listo”, “resuelto” o “sin errores” si no pudiste validar realmente.
```
---

## 4. Prompt para diagnóstico sin modificar código

Usar cuando se necesita auditoría.

```md
Trabajá en el repositorio `nicoKaminski/horas-claras`.

Rama requerida: [RAMA]. Confirmá el repositorio, la rama y los cambios locales. No cambies de rama.

Modo: diagnóstico solamente.

Objetivo:
[DESCRIBIR QUÉ SE QUIERE AUDITAR]

Plan cerrado:
1. Revisar únicamente los archivos relevantes para el diagnóstico.
2. Informar hallazgos y límites de verificación sin implementar cambios.

Instrucciones:
- Leé `AGENTS.md`.
- Leé `package.json`.
- Revisá la estructura actual del repo.
- Revisá únicamente los archivos relacionados con el diagnóstico.
- No modifiques archivos.
- No crees archivos.
- No ejecutes comandos salvo autorización explícita.
- No hagas commits ni acciones de versionado.
- Tratá archivos versionados como públicos; no imprimas ni documentes secretos o datos internos.

Entrega:
- Estado observado.
- Archivos revisados.
- Riesgos detectados.
- Inconsistencias entre documentación y código.
- Preguntas necesarias antes de implementar.
- Plan mínimo recomendado, separado en pasos chicos.
```
---

## 5. Prompt para implementar código

Usar cuando el developer ya decidió avanzar.

```md
Trabajá en el repositorio `nicoKaminski/horas-claras`.

Rama requerida: [RAMA]. Confirmá el repositorio, la rama y los cambios locales antes de editar. No cambies de rama.

Modo: implementación controlada.

Objetivo:
[DESCRIBIR IMPLEMENTACIÓN]

Plan cerrado:
1. [PASO 1]
2. [PASO 2]
3. [PASO 3]

No generes un plan alternativo. Ejecutá este plan. Si encontrás un bloqueo real, frená y reportalo.

Lectura previa:
- `AGENTS.md`
- `package.json`
- [ARCHIVOS RELACIONADOS]

Restricciones:
- No agregar dependencias.
- No tocar archivos fuera del alcance.
- No cambiar contratos no pedidos.
- No inventar helpers ni tipos.
- No usar `any` ni `as any`.
- No usar operaciones Git que escriban o cambien el repositorio (`add`, `commit`, `push`, `pull`, `fetch`, `merge`, `rebase`, `reset`, `checkout`, `switch`, `restore`, `stash`, `clean` ni equivalentes).
- No instalar, eliminar ni actualizar dependencias ni ejecutar comandos destructivos.
- No declarar éxito sin revisión final.

Validación:
- Revisá manualmente los archivos modificados.
- Verificá imports.
- Verificá tipos.
- Verificá que no queden símbolos sin uso.
- Si podés ejecutar validaciones con autorización, usá solo scripts existentes en `package.json`.
- Si no ejecutaste validaciones, informalo como pendiente.

Entrega final obligatoria:
[USAR FORMATO DE CIERRE DE ESTE DOCUMENTO]
```
---

## 6. Prompt para frontend

Usar cuando la tarea toca UI.

```md
Trabajá en el repositorio `nicoKaminski/horas-claras`.

Rama requerida: [RAMA]. Confirmá el repositorio, la rama y los cambios locales. No cambies de rama.

Modo: implementación frontend controlada.

Objetivo:
[DESCRIBIR CAMBIO VISUAL/FUNCIONAL]

Plan cerrado:
1. [PASO CONCRETO]
2. [PASO CONCRETO]
No ampliar el alcance sin informarlo.

Lectura previa:
- `AGENTS.md`
- `agent/frontend-design.md`
- `package.json`
- Archivos CSS Modules y componentes relacionados con la vista.

Reglas UI:
- Usar CSS Modules.
- No usar Tailwind.
- No agregar librerías visuales.
- No usar estilos inline salvo caso mínimo justificado.
- Respetar estética actual.
- No rediseñar toda la app.
- Cuidar responsive.
- Cuidar accesibilidad básica.
- Agregar estados de error/carga/vacío si corresponden al flujo.
- No inventar Figma. Si hay captura o especificación, seguirla; si no, basarse en patrones existentes.

Entrega:
- Archivos modificados.
- Cambios visuales realizados.
- Cambios funcionales realizados.
- Validaciones realizadas o pendientes.
- Riesgos.
```
---

## 7. Prompt para Supabase

Usar cuando la tarea toca base, auth, RLS o migraciones.

```md
Trabajá en el repositorio `nicoKaminski/horas-claras`.

Rama requerida: [RAMA]. Confirmá el repositorio, la rama y los cambios locales antes de editar. No cambies de rama.

Modo: Supabase / seguridad.

Objetivo:
[DESCRIBIR CAMBIO]

Plan cerrado:
1. [PASO CONCRETO]
2. [PASO CONCRETO]
No ampliar el alcance. Si falta contexto o se necesita una acción fuera del plan, reportarlo antes de implementarla.

Lectura previa:
- `AGENTS.md`
- `agent/rules.md`
- `supabase/migrations`
- `supabase/seed.sql`
- archivos server/client relacionados si existen.

Reglas:
- No inventar tablas ni columnas.
- No asumir que una migración fue aplicada.
- No usar service role key en frontend.
- No subir secretos.
- No crear datos reales.
- Verificar RLS.
- No confiar solo en UI.
- Si creás funciones `security definer`, usar `search_path`.
- Si agregás variables, documentarlas en `.env.example`.

Entrega:
- Migraciones tocadas o creadas.
- Tablas/policies/functions afectadas.
- Riesgos de seguridad.
- Validaciones pendientes en Supabase real.
- Pasos manuales para aplicar/verificar.
```
---

## 8. Cierre mínimo aceptable

Una entrega aceptable debe decir explícitamente:

```txt
Archivos modificados:
- ...

Archivos creados:
- ...

Archivos eliminados:
- ...

Qué cambió:
- ...

Qué no se tocó:
- ...

Validaciones ejecutadas:
- ...

Validaciones pendientes:
- ...

Riesgos o dudas:
- ...

Cambios de contrato:
- Ninguno / Detalle

Revisión de seguridad y privacidad:
- Realizada cuando corresponda, con hallazgos o riesgos pendientes explícitos.

Próximo paso recomendado:
- ...
```

Si una entrega no incluye validaciones o riesgos, está incompleta.
