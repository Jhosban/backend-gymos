# GymOS Backend

GymOS es un backend REST para gestión de gimnasios construido con NestJS, TypeScript, PostgreSQL y Prisma. Está pensado para manejar clientes, registrar asistencias y calcular retención de forma centralizada, con una arquitectura modular y lista para crecer.

## Resumen

- Autenticación JWT con registro y login
- CRUD completo de clientes
- Registro e historial de asistencias
- Reglas de retención configurables por entorno
- Validación global con DTOs y class-validator
- Prisma ORM sobre PostgreSQL o Supabase
- Estructura modular y mantenible

## Tecnologías

- NestJS 10
- TypeScript
- PostgreSQL
- Prisma ORM
- Passport JWT
- class-validator / class-transformer

## Estructura del proyecto

```text
src/
├── auth/         Autenticación y JWT
├── clients/      CRUD de clientes
├── attendance/   Registro de asistencia
├── retention/    Lógica de retención
├── prisma/       Servicio de base de datos
├── config/       Configuración centralizada
├── app.module.ts Módulo raíz
└── main.ts       Punto de entrada

prisma/
├── schema.prisma Modelo de datos
└── seed.ts       Datos de ejemplo
```

## Modelos de base de datos

### User

- `id`
- `email`
- `name`
- `password`
- `createdAt`
- `updatedAt`

### Client

- `id`
- `name`
- `email`
- `phone`
- `status` (`ACTIVE`, `AT_RISK`, `INACTIVE`)
- `lastAttendance`
- `createdAt`
- `updatedAt`

### Attendance

- `id`
- `clientId`
- `attendedAt`
- `createdAt`
- `updatedAt`

## Variables de entorno

Copia [`.env.example`](.env.example) a `.env` y ajusta la cadena de conexión de Supabase.

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION=3600
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
RETENTION_AT_RISK_DAYS=7
RETENTION_INACTIVE_DAYS=15
```

El proyecto ya no usa archivos de entorno alternativos: deja solo `.env` local y `.env.example` como plantilla.

## Instalación

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:push
npm run prisma:seed
```

## Ejecución

### Desarrollo

```bash
npm run start:dev
```

### Producción

```bash
npm run build
npm run start:prod
```

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run start:dev` | Arranque en modo desarrollo con watch |
| `npm run build` | Compila el proyecto |
| `npm run start` | Arranque local usando `dist/main.js` |
| `npm run start:prod` | Arranque en producción |
| `npm run prisma:generate` | Genera Prisma Client |
| `npm run db:push` | Sincroniza el esquema con la BD |
| `npm run prisma:seed` | Carga datos de ejemplo |
| `npm run test` | Ejecuta pruebas |
| `npm run lint` | Ejecuta ESLint |

## Endpoints

La API usa el prefijo `api/v1`.

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Clients

- `GET /clients`
- `GET /clients/:id`
- `POST /clients`
- `PATCH /clients/:id`
- `DELETE /clients/:id`

### Attendance

- `POST /attendance`
- `GET /attendance`
- `GET /attendance/client/:id`

### Retention

- `GET /retention/status`
- `POST /retention/recalculate`
- `GET /retention/at-risk`

### Health

- `GET /health`

## Ejemplos rápidos

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gymos.com",
    "password": "admin123"
  }'
```

### Crear cliente

```bash
curl -X POST http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

## Retención

El sistema calcula la retención de forma configurable:

- `ACTIVE`: asistencia reciente
- `AT_RISK`: sin asistencia durante `RETENTION_AT_RISK_DAYS`
- `INACTIVE`: sin asistencia durante `RETENTION_INACTIVE_DAYS`

Al registrar una asistencia, `lastAttendance` se actualiza automáticamente. Luego puedes ejecutar `POST /retention/recalculate` para sincronizar los estados almacenados.

## Supabase

GymOS funciona con Supabase usando PostgreSQL en `DATABASE_URL`.

1. Crea un proyecto en Supabase.
2. Copia la cadena de conexión PostgreSQL desde Settings > Database.
3. Pégala en `DATABASE_URL` dentro de `.env`.
4. Ejecuta:

```bash
npm run prisma:generate
npm run db:push
npm run prisma:seed
```

## Desarrollo local con datos de ejemplo

El seed crea:

- un usuario administrador
- clientes de ejemplo
- asistencias de ejemplo

Credenciales de ejemplo:

- Email: `admin@gymos.com`
- Password: `admin123`

## Documentación adicional

- [Colección Postman](gymos.postman_collection.json)

## Licencia

MIT