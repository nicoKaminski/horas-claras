# Horas Claras · Reglas extendidas para agentes

Este archivo complementa `AGENTS.md`.

`AGENTS.md` debe seguir siendo la entrada principal y compacta. Este documento contiene reglas extendidas para tareas de implementación, auditoría y generación de prompts para agentes locales.

---

## 1. Rol del agente

El agente debe actuar como ejecutor técnico controlado dentro del repositorio de **Horas Claras**.

Debe:

- leer primero las instrucciones del proyecto;
- confirmar el repositorio, la rama, los cambios locales y los archivos reales antes de editar;
- trabajar con alcance mínimo;
- modificar solo lo necesario;
- no inventar contratos ni arquitectura;
- reportar claramente qué hizo y qué no pudo validar.

`dev` es la rama habitual, no una obligación para todas las tareas. Respetar la rama indicada en cada prompt y no cambiar de rama. `main` requiere un pull request desde cualquier rama. `AGENTS.md` sigue siendo la entrada obligatoria y define las reglas raíz.

Cuando el trabajo se pueda separar sin compartir archivos de escritura, delegar responsabilidades en subagentes, asignarles alcances exclusivos y auditar el resultado integrado.

---

## 2. Prohibido asumir o inventar

El agente no puede asumir ni inventar:

- rutas;
- archivos;
- componentes;
- hooks;
- servicios;
- server actions;
- route handlers;
- tipos;
- validaciones;
- columnas;
- tablas;
- policies;
- funciones SQL;
- variables de entorno;
- respuestas de Supabase;
- comportamiento de Next.js;
- comportamiento de auth;
- permisos;
- reglas de negocio.

Si algo no se puede comprobar leyendo el repo o las instrucciones explícitas del developer, debe frenar y avisar.

---

## 3. Alcance estricto

El agente debe concentrarse solo en la tarea pedida.

Prohibido:

- convertir una tarea chica en un refactor grande;
- modificar vistas no relacionadas;
- cambiar estilos globales sin necesidad;
- crear abstracciones prematuras;
- mover carpetas sin aprobación;
- cambiar convenciones del repo;
- agregar dependencias sin autorización;
- cambiar contratos entre capas sin explicarlo.

Si una modificación fuera de alcance parece necesaria, debe reportarla antes de hacerla.

No agregar, quitar ni actualizar dependencias sin autorización. No hacer refactors amplios o cambios de comportamiento que no estén en el alcance aprobado.

---

## 4. Honestidad técnica

El agente debe señalar de forma directa:

- riesgos reales;
- inconsistencias;
- deuda técnica;
- instrucciones peligrosas;
- dependencias faltantes;
- validaciones no ejecutadas;
- contratos no verificados;
- archivos que no pudo encontrar;
- puntos donde el repo contradice la documentación.

No debe suavizar ni ocultar problemas para dar una respuesta más agradable.

---

## 5. Seguridad y datos sensibles

Tratar todos los archivos versionados como contenido público. No incorporar secretos, tokens, contraseñas, cookies, claves privadas o credenciales de servicios. Tampoco incluir datos reales de trabajo, usuarios, registros de horas, tarifas, tickets o información interna. Solo se admiten las identidades ficticias `dev` y `compa`.

Prohibido:

- subir secretos;
- imprimir secretos;
- crear `.env.local` con valores reales;
- copiar claves reales en documentación;
- usar service role key en frontend;
- exponer claves `service_role` o equivalentes en el navegador;
- guardar passwords propias si se usa Supabase Auth;
- crear seeds con datos personales reales;
- usar nombres reales de personas en código, documentación, mocks o UI.
- incluir información privada en logs, errores, capturas o documentación.

Mantener separadas las variables públicas de Supabase con prefijo `NEXT_PUBLIC_` y las credenciales privadas de servidor. Mantener `.env.example` versionado y sin secretos; no cambiar `.gitignore` si ya protege los archivos reales de entorno y permite ese ejemplo.

---

## 6. Supabase y RLS

Toda regla sensible debe estar respaldada por RLS o lógica server-side segura.

No alcanza con:

- ocultar botones;
- filtrar en frontend;
- confiar en una ruta visual;
- asumir que el usuario no llamará manualmente a Supabase.

Antes de tocar Supabase, revisar:

- migraciones existentes;
- tablas reales esperadas;
- funciones SQL;
- policies;
- grants;
- uso de `auth.uid()`;
- separación entre cliente browser y server.

Las funciones `security definer` deben declarar `search_path`.

Antes de cerrar tareas relacionadas, revisar seguridad y privacidad. Las acciones sensibles deben contar con autenticación y autorización real en Supabase/RLS; la interfaz por sí sola no es suficiente.

---

## 7. Frontend

Si la tarea toca frontend, el agente debe:

- usar CSS Modules;
- no usar Tailwind;
- respetar componentes existentes;
- respetar estilos y patrones actuales;
- revisar estados de carga, error y vacío;
- cuidar accesibilidad básica;
- no introducir estilos inline salvo caso mínimo justificado;
- no hacer rediseños implícitos;
- consultar `agent/frontend-design.md`.

Si no hay diseño externo, debe basarse en:

1. código existente;
2. capturas compartidas por el developer;
3. indicaciones explícitas;
4. criterios de usabilidad simple y profesional.

No debe inventar Figma.

---

## 8. Backend interno / server-side

En Horas Claras no debe crearse un backend Express, Nest u otro backend separado para el MVP.

La lógica segura debe ubicarse dentro de la arquitectura Next.js/Supabase definida para el repo.

Antes de crear server actions, route handlers o servicios server-side, verificar:

- patrón existente;
- límites cliente/servidor;
- uso seguro de variables;
- permisos;
- compatibilidad con RLS;
- impacto en imports y bundling.

---

## 9. TypeScript y calidad

Obligatorio:

- no usar `any`;
- no usar `as any`;
- no crear tipos falsos para callar errores;
- no dejar imports sin uso;
- no dejar exports inexistentes;
- no dejar props no conectadas;
- no dejar variables muertas;
- no duplicar lógica si existe una utilidad clara;
- no romper `strict`.

Si TypeScript obliga a resolver un contrato no claro, no inventar: pedir contexto.

---

## 10. Dependencias

Prohibido agregar dependencias nuevas sin autorización explícita.

Antes de proponer una dependencia, justificar:

- por qué es necesaria;
- qué problema resuelve;
- si existe alternativa sin dependencia;
- impacto en bundle;
- mantenimiento;
- compatibilidad con Next.js actual.

---

## 11. Comandos

El agente no puede ejecutar comandos sin autorización explícita del developer. Se permite inspección Git de solo lectura si la tarea lo autoriza.

Prohibido siempre:

```bash
git add
git commit
git push
git pull
git fetch
git merge
git rebase
git reset
git checkout
git switch
git restore
git stash
git clean
```

También se prohíben equivalentes y cualquier operación que cambie el índice, árbol de trabajo, referencias o estado remoto. No instalar, eliminar ni actualizar dependencias y no ejecutar comandos destructivos.

Si necesita validar, debe:

1. revisar `package.json`;
2. sugerir comandos existentes;
3. esperar autorización si el contexto de trabajo lo exige;
4. reportar el resultado real si los ejecuta.

Los scripts disponibles deben confirmarse en `package.json`; cuando exista, incluir `npm run typecheck` junto con lint y build.

---

## 12. Documentación

Actualizar documentación cuando:

- cambia setup;
- cambia una variable de entorno;
- cambia un contrato;
- cambia una decisión técnica;
- cambia el estado real del proyecto;
- el developer lo pide explícitamente.

No documentar features inexistentes como terminadas.

---

## 13. Regla de estado real

La documentación puede estar desactualizada.

Antes de afirmar que algo existe, verificar:

- archivos actuales;
- `package.json`;
- migraciones;
- código fuente;
- respuestas de comandos reportadas por el developer;
- evidencias concretas.

Nunca tratar `agent/project-state.md` como verdad absoluta.

---

## 14. Cierre obligatorio

La entrega final del agente debe incluir:

```txt
Archivos modificados
Archivos creados
Archivos eliminados
Qué cambió
Qué no se tocó
Validaciones ejecutadas
Validaciones pendientes
Riesgos o dudas
Cambios de contrato, si hubo
Próximo paso recomendado
```

No puede declarar “listo”, “resuelto” o “sin errores” si no validó realmente.
