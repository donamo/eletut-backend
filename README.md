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

## Docker telepítés

A repo tartalmaz egy production Dockerfile-t és egy `docker-compose.yml`-t. A konténer induláskor lefuttatja a Prisma migrációkat, majd elindítja a NestJS appot:

```bash
npx prisma migrate deploy && node dist/main.js
```

Előkészítés:

```bash
cp .env.example .env
```

Éles/proxyzott telepítésnél a `.env` értékeit állítsd be a tényleges környezetre:

```env
DATABASE_URL="postgresql://user:password@postgres-host:5432/eletut"
SESSION_SECRET="long-random-secret"
SESSION_STORE="postgres"
TRUST_PROXY="1"
APP_URL="https://eletut-api.donamo.science"
FRONTEND_URL="https://eletut.donamo.science"
GOOGLE_CALLBACK_URL="https://eletut-api.donamo.science/auth/callback/google"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

A compose az `nginx-proxy` external Docker networköt használja. Ha még nincs ilyen network:

```bash
docker network create nginx-proxy
```

Indítás builddel:

```bash
docker compose up -d --build
```

Logok:

```bash
docker compose logs -f backend
```

Leállítás:

```bash
docker compose down
```

A proxy hostok alapértelmezett értékei a `docker-compose.yml`-ben:

```env
VIRTUAL_HOST=eletut-api.donamo.science
LETSENCRYPT_HOST=eletut-api.donamo.science
VIRTUAL_PORT=3000
```

Más domainhez indítás előtt környezeti változóval felülírhatók:

```bash
VIRTUAL_HOST=api.example.com LETSENCRYPT_HOST=api.example.com docker compose up -d --build
```

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

Reverse proxy mögötti production telepítésnél hagyd bekapcsolva:

```env
TRUST_PROXY="1"
```

Ez kell ahhoz, hogy az app felismerje az `X-Forwarded-Proto: https` fejlécet, és a productionben `Secure` session cookie ténylegesen kimenjen a Google callback válaszon.

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
