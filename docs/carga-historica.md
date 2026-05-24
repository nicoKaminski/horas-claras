# Carga Histórica Manual

Este documento detalla el procedimiento general y seguro para realizar cargas históricas manuales de registros en la base de datos de Horas Claras.

> [!IMPORTANT]
> Nunca incluyas datos reales, nombres personales, correos electrónicos, identificadores de producción (UUIDs) ni secretos en la documentación, scripts compartidos o repositorios.

---

## Procedimiento General

### 1. Verificar RLS Activo
Antes de realizar cualquier inserción o cambio directo en la base de datos de producción o desarrollo, asegúrate de que las políticas de seguridad a nivel de fila (Row Level Security - RLS) estén activas en las tablas afectadas (`public.profiles`, `public.work_logs`).
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
```

### 2. Previsualizar Datos Candidatos
Organiza los registros históricos en un formato limpio (por ejemplo, en un script SQL local o archivo JSON) y realiza una previsualización de los campos obligatorios para verificar que cumplen con las restricciones de la base de datos:
- `user_id` (debe existir un perfil válido en la tabla `public.profiles`).
- `developer_name` (debe coincidir con la restricción `dev` o `compa`).
- `duration_hours` (debe ser mayor a 0).
- `date`, `start_time`, `end_time` (formato y orden coherentes).

### 3. Comprobar Duplicados
Antes de insertar, realiza consultas de control para garantizar que no existan registros previos para el mismo desarrollador, fecha y rango horario que puedan generar solapamientos indeseados o duplicados.
```sql
SELECT id, user_id, date, start_time, end_time 
FROM public.work_logs 
WHERE developer_name = 'dev' AND date = '2026-05-01';
```

### 4. Probar Inserción con Transacciones (`ROLLBACK`)
Para evitar corromper la base de datos ante errores imprevistos, ejecuta siempre la inserción de prueba dentro de un bloque de transacción controlada y deshaz los cambios inmediatamente para validar la estructura del query.
```sql
BEGIN;

INSERT INTO public.work_logs (user_id, developer_name, created_by, date, start_time, end_time, duration_hours, task_title, description, jira_loaded)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- ID de ejemplo
  'compa', 
  '00000000-0000-0000-0000-000000000000', -- ID de ejemplo
  '2026-05-01', 
  '09:00:00', 
  '17:00:00', 
  8.00, 
  'HC-XXX Ejemplo', 
  'Descripción genérica de ejemplo sin datos sensibles', 
  false
);

-- Si no hay errores, revertimos para verificar la integridad
ROLLBACK;
```

### 5. Ejecutar Inserción Real (`COMMIT`)
Una vez comprobado que el script se ejecuta correctamente sin errores de constraints ni políticas RLS, ejecuta la inserción real aplicando los cambios permanentemente.
```sql
BEGIN;

-- Sentencias SQL de inserción...

COMMIT;
```

### 6. Verificar Totales por Período
Una vez terminada la carga, ejecuta queries de agregación agrupados por mes y desarrollador para comparar los totales resultantes con tus planillas de origen.
```sql
SELECT 
  developer_name, 
  DATE_TRUNC('month', date) AS mes, 
  SUM(duration_hours) AS total_horas,
  COUNT(*) AS total_registros
FROM public.work_logs
GROUP BY developer_name, DATE_TRUNC('month', date);
```

### 7. Validar en la Aplicación
Inicia sesión en la aplicación Horas Claras en el entorno local o de pruebas y navega por el **Dashboard** y el **Workspace** usando los filtros de fecha, Jira y desarrollador para confirmar que los datos se renderizan correctamente y coinciden exactamente con los totales históricos verificados.
