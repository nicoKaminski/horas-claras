# Setup local

Guia detallada para levantar Horas Claras en desarrollo local.

## Requisitos

- Node.js 18+ recomendado
- npm

## Instalacion

Instalar dependencias:

```bash
npm install
```

Crear el archivo de entorno local copiando `.env.example`:

```bash
cp .env.example .env.local
```

Completar en `.env.local` las variables publicas de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No agregar claves privadas, tokens, passwords ni `service_role` al frontend. `.env.local` no debe versionarse.

## Desarrollo

Levantar la app:

```bash
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

## Validaciones

Ejecutar lint:

```bash
npm run lint
```

Ejecutar typecheck:

```bash
npm run typecheck
```

Ejecutar build:

```bash
npm run build
```
