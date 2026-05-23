# Deploy en Vercel

Guia detallada para publicar Horas Claras en Vercel.

## Repositorio

Conectar el repositorio publico del proyecto a Vercel desde el panel de Vercel.

Mantener fuera del repositorio:

- `.env.local`
- secretos privados
- tokens
- passwords
- claves `service_role`

## Variables de entorno

Configurar en Vercel las variables publicas necesarias:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No configurar una clave `service_role` para uso de frontend.

## Build

El comando de build esperado es:

```bash
npm run build
```

Vercel debe ejecutar el build usando la configuracion del proyecto Next.js.

## Cambios de variables

Despues de modificar variables de entorno en Vercel, hacer un redeploy para que los cambios impacten en la app publicada.

## Checklist basico de produccion

Antes de considerar listo un deploy publico:

- Variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuradas.
- No hay secretos privados versionados.
- Signup publico revisado segun el entorno.
- Usuarios `dev` y `compa` creados manualmente si el entorno los requiere.
- Perfiles `dev/admin` y `compa/user` creados manualmente.
- Migracion inicial aplicada en Supabase.
- RLS habilitado y policies verificadas.
- `npm run build` ejecuta correctamente.
- Redeploy realizado despues de cambios en variables de entorno.
