# Horas Claras · Guía de diseño frontend

Este documento define criterios visuales y de UX para Horas Claras.

Debe usarse junto con:

- `AGENTS.md`
- `docs/agent/rules.md`
- `.agents/skills/horas-claras-frontend-design/SKILL.md`

---

## 1. Principio general

Horas Claras debe sentirse como una mini app interna simple, confiable y profesional.

No debe parecer:

- una landing exagerada;
- un dashboard empresarial sobrediseñado;
- una demo genérica de IA;
- un template visual desconectado del objetivo;
- una app con decoración por encima de usabilidad.

Debe priorizar:

- claridad;
- rapidez de uso;
- lectura cómoda;
- acciones evidentes;
- responsive real;
- accesibilidad básica;
- estética presentable de portfolio.

---

## 2. Stack visual

Reglas cerradas:

- Usar CSS Modules.
- No usar Tailwind.
- No usar librerías visuales nuevas sin autorización.
- No usar estilos inline salvo caso mínimo y justificado.
- No cambiar sistema visual global sin aprobación.
- No agregar animaciones complejas sin necesidad.

---

## 3. Fuentes de verdad para UI

Para diseñar o modificar UI, usar este orden:

1. Código existente.
2. CSS Modules existentes.
3. Capturas compartidas por el developer.
4. Especificaciones explícitas del developer.
5. Criterios de este documento.
6. Skill local de diseño frontend.

No inventar Figma.

Si más adelante existe Figma, solo usarlo cuando el developer lo comparta explícitamente para esa tarea.

---

## 4. Tono visual recomendado

Horas Claras debería usar una estética:

- limpia;
- sobria;
- moderna;
- liviana;
- con buen espaciado;
- sin exceso de efectos;
- con contraste suficiente;
- amigable para uso diario.

Evitar:

- gradientes excesivos;
- sombras pesadas;
- colores saturados sin propósito;
- animaciones que molesten;
- cards innecesarias;
- textos demasiado largos en UI;
- iconografía decorativa sin función.

---

## 5. Layout

Recomendaciones:

- Mobile-first.
- Contenedores con ancho máximo razonable.
- Espaciado consistente.
- Formularios en una sola columna en mobile.
- Dashboard claro con accesos rápidos.
- Tablas o listas adaptadas a mobile.
- Acciones principales visibles.
- Acciones destructivas diferenciadas.
- Evitar scroll horizontal.
- Evitar que botones importantes queden ocultos.

---

## 6. Componentes esperados

La app probablemente necesitará:

- pantalla de login;
- shell privado;
- navegación simple;
- dashboard;
- formulario de registro de horas;
- listado de registros;
- filtros;
- vista de pendientes Jira;
- tarjetas de resumen;
- estados vacíos;
- mensajes de error;
- confirmación de eliminación.

Antes de crear componentes nuevos, revisar si ya existe un patrón o componente reutilizable.

---

## 7. Formularios

Todo formulario debe cuidar:

- label visible;
- input asociado al label;
- error por campo cuando aplique;
- mensaje general si falla la acción;
- estado loading en submit;
- disabled cuando corresponde;
- validaciones coherentes con backend/base;
- texto de ayuda solo si aporta;
- foco visible;
- navegación por teclado.

Para Horas Claras, los formularios deben ser rápidos de completar.

Evitar:

- pasos innecesarios;
- campos ambiguos;
- selects con opciones inventadas;
- defaults peligrosos;
- validaciones solo visuales si la regla es sensible.

---

## 8. Estados de UI

Cuando una vista cargue datos, contemplar:

- loading;
- error;
- vacío;
- datos cargados;
- acción en progreso;
- éxito si corresponde;
- permiso insuficiente si corresponde.

No dejar pantallas mudas o sin feedback.

---

## 9. Accesibilidad mínima

Obligatorio:

- contraste razonable;
- foco visible;
- botones con texto o `aria-label`;
- campos con label;
- no depender solo del color para comunicar estado;
- jerarquía semántica correcta;
- `main`, `section`, `nav`, `header` cuando aplique;
- mensajes de error comprensibles.

---

## 10. Contenido y microcopy

La UI debe usar lenguaje claro y directo.

Recomendado:

- “Registrar horas”
- “Pendiente de Jira”
- “Cargado en Jira”
- “Marcar como cargado”
- “Editar registro”
- “Eliminar registro”
- “No hay registros todavía”
- “Revisá los campos marcados”

Prohibido:

- nombres reales de personas;
- emails reales;
- mensajes técnicos crudos para usuarios finales;
- textos largos innecesarios.

---

## 11. Colores y estilos

No cambiar colores globales sin aprobación.

Si se necesita ampliar estilos:

- partir de variables existentes en `globals.css`;
- mantener coherencia con `page.module.css`;
- usar nombres de clases semánticos;
- evitar estilos duplicados;
- preferir escalas simples de spacing.

---

## 12. Criterio portfolio

Como el proyecto también sirve de portfolio, cada pantalla debería mostrar:

- intención clara;
- buen manejo responsive;
- componentes prolijos;
- feedback de interacción;
- consistencia visual;
- código mantenible.

Pero portfolio no significa sobrediseñar. La app debe seguir siendo práctica.

---

## 13. Antes de cerrar una tarea UI

Verificar:

- no hay imports rotos;
- no hay clases CSS sin usar evidentes;
- no hay estilos globales innecesarios;
- no hay overflow horizontal;
- se ve razonable en mobile;
- se ve razonable en desktop;
- estados de error/loading/vacío están cubiertos si aplican;
- botones tienen estado disabled/loading si aplican;
- no se introdujeron datos reales;
- no se agregaron dependencias.
