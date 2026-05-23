# Roadmap MVP

Roadmap funcional del MVP de Horas Claras. Los items se mantienen como pendientes salvo que exista evidencia concreta en el codigo o en una validacion reportada.

## Fase 1: Integracion Supabase

- [ ] Instalar dependencias SDK Supabase.
- [ ] Crear cliente browser.
- [ ] Crear cliente server.
- [ ] Configurar variables locales.
- [ ] Validar conexion con Supabase.
- [ ] Validar RLS contra casos `dev` y `compa`.

## Fase 2: Autenticacion

- [ ] Implementar login con email y password.
- [ ] Implementar logout.
- [ ] Leer sesion actual.
- [ ] Proteger rutas privadas.
- [ ] Mostrar identidad visible `dev` o `compa`.

## Fase 3: CRUD de registros

- [ ] Crear formulario de registro de horas.
- [ ] Listar registros.
- [ ] Editar registros permitidos.
- [ ] Eliminar registros permitidos.
- [ ] Validar reglas de negocio en frontend y backend cuando corresponda.
- [ ] Respetar restricciones de RLS.

## Fase 4: Pendientes Jira / marcado Jira / filtros

- [ ] Mostrar vista de registros pendientes de carga en Jira.
- [ ] Permitir marcado como cargado en Jira solo para `dev`.
- [ ] Filtrar por fecha.
- [ ] Filtrar por usuario.
- [ ] Filtrar por estado Jira.
- [ ] Agregar busqueda por tarea o descripcion.

## Fase 5: Dashboard / UX

- [ ] Crear dashboard de resumen.
- [ ] Mostrar metricas basicas.
- [ ] Agregar estados de carga, error y vacio.
- [ ] Mejorar responsive.
- [ ] Revisar accesibilidad basica.
- [ ] Pulir UI para portfolio.

## Fase 6: Deploy

- [ ] Conectar repositorio a Vercel.
- [ ] Configurar variables de entorno publicas.
- [ ] Ejecutar build de produccion.
- [ ] Hacer deploy inicial.
- [ ] Validar flujo basico en entorno publicado.
