# eletut-backend

NestJS + Prisma + GraphQL backend az Életvonal MVP-hez.

## Stack

- TypeScript
- NestJS 11
- Apollo GraphQL 5
- Prisma 6
- PostgreSQL fejlesztéshez
- Google OpenID bejelentkezés Passport sessionnel

## Indítás

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

E2E tesztek külön adatbázissal futnak. Alapértelmezett:

```env
E2E_DATABASE_URL="postgresql://postgres:postgres@192.168.1.2:5432/eletut_e2e"
```

Futtatás:

```bash
npm run test:e2e
```

API leírások generálása a frontendhez:

```bash
npm run docs:generate
```

Kimenetek:

- `docs/generated/schema.graphql`
- `docs/generated/openapi.yaml`

Logolás:

```env
LOG_LEVEL="debug"
```

Támogatott szintek: `silent`, `error`, `warn`, `log`/`info`, `debug`/`dev`, `verbose`.

Session store:

```env
SESSION_STORE="postgres"
SESSION_TTL_SECONDS="1209600"
```

Alapértelmezésben a session Postgresben tárolódik a `session` táblában, így több backend node ugyanazt a sessiont tudja használni.

Ha a `dev.home:5432` címre Prisma `P1001` hibát ad, használd közvetlenül az IP-t:

```env
DATABASE_URL="postgresql://postgres:postgres@192.168.1.2:5432/eletut"
```

A GraphQL endpoint alapértelmezetten:

```text
http://localhost:3000/graphql
```

## Fő API-k

Auth REST:

- `GET /auth/login/google`
- `GET /auth/callback/google`
- `POST /auth/logout`
- `GET /me`

GraphQL:

- `me`
- `lifeEvents`
- `lifeEvent(id)`
- `createLifeEvent(input)`
- `updateLifeEvent(input)`
- `deleteLifeEvent(id)`
