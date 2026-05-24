# Roadmap MVP

Roadmap funcional del MVP de Horas Claras. Los items se mantienen como pendientes salvo que exista evidencia concreta en el codigo o en una validacion reportada.

## Fase 1: Integracion Supabase

- [x] Instalar dependencias SDK Supabase.
- [x] Crear cliente browser.
- [x] Crear cliente server.
- [x] Configurar variables locales.
- [x] Validar conexion con Supabase.
- [x] Validar RLS contra casos `dev` y `compa`.

## Fase 2: Autenticacion

- [x] Implementar login con email y password.
- [x] Implementar logout.
- [x] Leer sesion actual.
- [x] Proteger rutas privadas.
- [x] Mostrar identidad visible `dev` o `compa` (mapeada a `dev-admin` o `dev-user` en UI).

## Fase 3: CRUD de registros

- [x] Crear formulario de registro de horas.
- [x] Listar registros.
- [x] Editar registros permitidos.
- [x] Eliminar registros permitidos.
- [x] Validar reglas de negocio en frontend y backend cuando corresponda.
- [x] Respetar restricciones de RLS.

## Fase 4: Pendientes Jira / marcado Jira / filtros

- [x] Mostrar vista de registros pendientes de carga en Jira.
- [x] Permitir marcado como cargado en Jira solo para `dev` (mostrado como `dev-admin`).
- [x] Filtrar por fecha.
- [x] Filtrar por usuario.
- [x] Filtrar por estado Jira.
- [x] Agregar busqueda por tarea o descripcion.

## Fase 5: Dashboard / UX

- [x] Crear dashboard de resumen.
- [x] Mostrar metricas basicas.
- [x] Agregar estados de carga, error y vacio.
- [x] Mejorar responsive.
- [x] Revisar accesibilidad basica.
- [x] Pulir UI para portfolio.

## Fase 6: Deploy

- [ ] Conectar repositorio a Vercel.
- [ ] Configurar variables de entorno publicas.
- [ ] Ejecutar build de produccion.
- [ ] Hacer deploy inicial.
- [ ] Validar flujo basico en entorno publicado.
