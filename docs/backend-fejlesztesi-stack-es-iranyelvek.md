# Backend fejlesztesi stack es iranyelvek

Ez a dokumentum egy uj, hasonlo backend projekt gyors osszerakasahoz ad alap stacket, fejlesztesi iranyokat es szabalyokat. A minta az `eletut-backend` projektben kialakitott megoldasokra epul.

## Cel

Olyan backend alapot erdemes epiteni, amely:

- TypeScript alapu
- modulokra bontott
- GraphQL-first domain API-t ad
- REST-et csak ott hasznal, ahol tenyleg praktikus, peldaul auth callback vagy health endpoint
- Postgres adatbazist hasznal
- Prisma migraciokkal verziozza a DB semat
- e2e tesztekkel, kulon teszt DB-vel ellenorizheto
- Docker compose-szal telepitheto
- reverse proxy mogott productionben is jol kezeli a session cookie-t
- user whitelist/admin engedelyezesi modellt tud kezelni
- alap biztonsagi vedelmeket tartalmaz

## Alap stack

- Node.js 22
- TypeScript
- NestJS
- Apollo GraphQL
- Prisma
- PostgreSQL
- Passport
- Google OpenID/OAuth login
- `express-session`
- `connect-pg-simple` Postgres session store
- `class-validator` es `class-transformer`
- Jest + Supertest e2e tesztek
- Docker + docker compose
- nginx-proxy / LetsEncrypt proxy integracio

## Projekt struktura

Javasolt modulstruktura:

```text
src/
  app.module.ts
  main.ts
  bootstrap.ts
  auth/
  common/
  prisma/
  users/
  <domain-module>/
  <master-data-module>/
```

Szabalyok:

- Minden domain terulet kulon Nest modul legyen.
- A PrismaService globalis modulban legyen.
- Auth, user, session es security helper kod ne keveredjen domain service-ekbe.
- GraphQL modellek, input DTO-k es resolverek legyenek modulon belul.
- Shared decoratorok, guardok, middleware-ek a `common/` alatt legyenek.

## API tervezes

Alap irany:

- Domain muveletek GraphQL-en menjenek.
- REST csak auth callback, logout, current-user vagy infrastruktura jellegu endpointokra maradjon.
- A frontendnek generalt dokumentacio keszuljon:
  - `docs/generated/schema.graphql`
  - `docs/generated/openapi.yaml`

Javasolt parancs:

```bash
npm run docs:generate
```

GraphQL nevadas:

- Query: tobbes szam listahoz, egyes szam egy rekordhoz.
- Mutation: konkret parancsnev, peldaul `createLifeEvent`, `updateLabel`.
- Input DTO-k mindig `Input` suffixet kapjanak.
- Domain objektumok mindig explicit GraphQL `@ObjectType()` modellek legyenek.

## Adatbazis es Prisma

Alap:

- DB: PostgreSQL
- Migracio: Prisma migrations
- Prisma Client generalas minden schema valtozas utan kotelezo.

Parancsok:

```bash
npm run prisma:generate
npx prisma validate
npx prisma migrate deploy
```

Szabalyok:

- Schema valtozashoz mindig keszuljon migracio.
- Torszadat mehet migracioba, ha stabil es verziozott adat.
- Userhez kotott entitasoknal mindig legyen `ownerUserId`.
- User sajat adataihoz `@@unique([ownerUserId, ...])` tipusu egyediseg kell.
- Torlesnel owner check legyen service szinten, ne csak controller/resolver szinten.
- Join tablaknal kompozit primary key legyen, peldaul `@@id([lifeEventId, labelId])`.
- Olyan string kulcsoknal, ahol user input jon, legyen normalizalas.

Pelda label szabaly:

- A label neve userenkent kulcs.
- A kulcs normalizalt: `trim()` + kisbetusites.
- `Family`, ` family ` es `FAMILY` ugyanaz a label.
- Default label szin: `GRAY`.

## Auth es session

Javasolt megoldas:

- Google OpenID/OAuth Passport strategy
- `express-session`
- Postgres session store
- session cookie:
  - `HttpOnly`
  - `SameSite=Lax`
  - productionben `Secure`

Production reverse proxy mogott kotelezo:

```env
TRUST_PROXY="1"
```

Enelkul a backend nem feltetlenul latja, hogy az eredeti keres HTTPS volt, es a `Secure` cookie nem biztos, hogy kimegy.

Session store:

```env
SESSION_STORE="postgres"
SESSION_TTL_SECONDS="1209600"
```

Multi-node backendhez Postgres session store hasznalhato, mert minden node ugyanazt a session tablat eri el.

### User whitelist es admin

Ha zart vagy kontrollalt MVP-t epitesz, a user tablat whitelistkent is erdemes hasznalni.

Javasolt `User` mezok:

```prisma
model User {
  id            String  @id @default(cuid())
  googleSubject String  @unique
  email         String
  displayName   String?
  isEnabled     Boolean @default(false)
}
```

Mukodes:

- Google auth utan a user rekord automatikusan jojjon letre.
- Uj user alapbol `isEnabled=false`.
- Az `ADMIN_EMAIL` env-ben megadott email mindig adminnak szamit.
- Az admin akkor is belephet, ha a sajat `isEnabled` erteke false.
- Minden authenticated API hivasnal ellenorizni kell, hogy a user engedelyezett-e vagy admin-e.
- Ha egy usert kesobb tiltasz, a meglevo sessionje a kovetkezo API hivasnal mar ne ferjen hozza az adatokhoz.
- Admin GraphQL API-n legyen user lista es enable/disable mutation.

Admin env:

```env
ADMIN_EMAIL="admin@example.com"
```

Admin GraphQL mintak:

```graphql
query {
  users {
    id
    email
    displayName
    isEnabled
    isAdmin
  }
}
```

```graphql
mutation {
  updateUserEnabled(input: { id: "...", isEnabled: true }) {
    id
    email
    isEnabled
  }
}
```

`me` valaszban legyen:

- `isEnabled`
- `isAdmin`

Fontos: az `isAdmin` szamitott mezokent is jo, nem kell feltetlenul DB oszlopnak lennie. A megbizhato forras az `ADMIN_EMAIL` env legyen.

### Google OAuth hibakereses

Ha a Google callback ilyen hibaval esik el:

```text
TokenError: The provided client secret is invalid.
code: invalid_client
```

az nem whitelist/admin hiba. Ilyenkor a backend meg nem kapott Google profilt, tehat nincs user/email/isEnabled ellenorzes.

Ellenorizendo:

- `GOOGLE_CLIENT_ID` es `GOOGLE_CLIENT_SECRET` ugyanahhoz a Google OAuth Clienthez tartozik-e.
- A futtato kornyezet tenyleg a vart `.env`-et latja-e.
- VS Code/debug launch config nem irja-e felul az env-et.
- Docker kontener ujra lett-e inditva secret valtozas utan.
- A Google Console Authorized redirect URI pontosan egyezik-e:

```text
http://localhost:3000/auth/callback/google
https://api.example.com/auth/callback/google
```

Mindig uj login flow-t indits:

```text
/auth/login/google
```

Ne regi `/auth/callback/google?...code=...` URL-t frissitgess, mert a Google authorization code egyszer hasznalatos es gyorsan lejar.

## Konfiguracio

Minden runtime valtozo `.env`-bol jojjon.

Javasolt alap valtozok:

```env
DATABASE_URL="postgresql://user:password@host:5432/db"
SESSION_SECRET="long-random-secret"
SESSION_STORE="postgres"
SESSION_TTL_SECONDS="1209600"
LOG_LEVEL="debug"
TRUST_PROXY="1"
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="300"
RATE_LIMIT_AUTH_MAX="30"
APP_URL="https://api.example.com"
FRONTEND_URL="https://app.example.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="https://api.example.com/auth/callback/google"
ADMIN_EMAIL="admin@example.com"
```

Szabalyok:

- `.env` soha ne keruljon gitbe.
- `.env.example` tartalmazzon minden kulcsot, de ne tartalmazzon valodi secretet.
- Productionben a `SESSION_SECRET` soha ne legyen default vagy rovid.
- DB jelszo ne legyen `postgres:postgres`.
- Google OAuth secret rotalas utan mindig kell backend restart/redeploy.
- Lokalis fejlesztesnel a Google Console-ban legyen engedelyezve a `http://localhost:3000/auth/callback/google` redirect URI.

## Validacio

Minden input DTO:

- `class-validator` dekoratorokat hasznaljon.
- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`

Peldak:

- kotelezo string: `@IsString()`, `@IsNotEmpty()`, `@MaxLength(...)`
- enum: `@IsEnum(...)`
- integer tartomany: `@IsInt()`, `@Min(...)`, `@Max(...)`
- opcionais mezok: `@IsOptional()`
- tomb: `@IsArray()`, `@ArrayUnique()`, `@IsString({ each: true })`

## Teszteles

E2E teszt legyen az alap biztonsagi halo.

Szabalyok:

- E2E kulon DB-t hasznaljon.
- E2E indulaskor fusson `prisma migrate deploy`.
- Auth reszek mockolhatok teszt middleware-rel.
- Google OAuth ne hivodjon valodi kulso szolgaltataskent e2e alatt.
- REST es GraphQL endpointokat is Supertesttel kell tesztelni.

Javasolt parancs:

```bash
npm run test:e2e
```

E2E minimum:

- anonymous access tiltasa
- session persistencia
- owner scoping
- create/list/update/delete flow
- opcionais mezok nelkuli input
- minden opcionais mezot tartalmazo input
- invalid inputok
- disabled user tiltasa
- admin user whitelist kezelese
- `me` valasz `isAdmin` es `isEnabled` mezoi
- torzsadat query-k
- automatikus torzsadat/label letrehozas

## Logging

Legyen `LOG_LEVEL`:

```env
LOG_LEVEL="debug"
```

Tamadott publikus szerveren fontos log mezok:

- method
- url
- status
- latency
- ip
- env
- session id
- cookie volt-e
- set-cookie ment-e
- user id vagy anonymous

Production 404 eseten hasznos lehet:

- minimalis vagy ures response body
- IP logolas
- opcionális kesleltetett ures 404 valasz, ha bot zajt akarsz lassitani
- rate limit vagy fail2ban melle illesztheto logformat

Figyelem: alkalmazas szinten kapcsolatot nyitva tartani DoS-kockazat. Valodi DROP-ot firewall/nginx/fail2ban szinten erdemes csinalni, nem Node processben.

## Rate limit

App szintu alap rate limit legyen:

```env
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="300"
RATE_LIMIT_AUTH_MAX="30"
```

Szabalyok:

- A rate limit fusson session middleware elott.
- Auth utvonalakra szigorubb limit legyen.
- App szintu rate limit csak egy reteg; nginx/fail2ban/ufw kell melle.

## Security szabalyok

Minimum production szabalyok:

- Postgres ne legyen publikus interneten.
- Postgres compose-ban ne legyen `ports: "5432:5432"` productionben, ha csak containereknek kell elerniuk.
- DB-t csak belso Docker networkon vagy privat halozaton erje el a backend.
- Hoston csak 80, 443 es szukseg szerint szurt 22 legyen nyitva.
- Docker API ne legyen publikus.
- SSH root login tiltas.
- SSH password login tiltasa, kulcsos belepes.
- `fail2ban` SSH-ra es optionally nginx/backend logokra.
- `ufw` vagy nftables szabalyok.
- Secrets rotalasa incidens utan.
- Google OAuth secret, DB jelszo, session secret kulon kezelendo.

Kerulendo:

- `postgres:postgres` productionben.
- `SESSION_SECRET=replace-me`.
- publikus `5432`.
- publikus Prisma Studio.
- hoston feleslegesen publisholt container portok.

Gyors ellenorzes szerveren:

```bash
ss -lntup
docker ps
nmap sajat-domain.example
```

Ha `5432/tcp open postgresql` latszik publikus scanben, azt azonnal zarni kell.

## Docker irany

Backendhez legyen:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`

Compose reverse proxy mogott:

```yaml
services:
  backend:
    build:
      context: .
    image: example-backend:latest
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=3000
      - TRUST_PROXY=${TRUST_PROXY:-1}
      - VIRTUAL_HOST=${VIRTUAL_HOST:-api.example.com}
      - LETSENCRYPT_HOST=${LETSENCRYPT_HOST:-api.example.com}
      - VIRTUAL_PORT=3000
    restart: unless-stopped

networks:
  default:
    name: nginx-proxy
    external: true
```

Szabalyok:

- DB port ne legyen publisholva productionben.
- Backend container ne nyisson host portot, ha nginx-proxy networkon van.
- Migracio indulaskor futhat `prisma migrate deploy` paranccsal.
- Healthcheck legyen egyszeru es ne igenyeljen authot.
- Production compose-ban a DB es backend lehet ugyanazon external/internal networkon, de csak a proxyhoz tartozo HTTP szolgaltatas kapjon publikus host elerest.

## Domain modellezes

Gyakori mintak:

- User-owned entity:
  - `ownerUserId`
  - owner relation
  - owner alapjan listazas es keres
- Master data:
  - kulon model
  - GraphQL query
  - stabil adatok migracioban seedelve
- User-owned label/tag:
  - userenkent egyedi nev
  - normalizalt kulcs
  - default szin
  - join tabla domain entityhez

Peldak:

- `LifeEvent`
- `EgoState`
- `Label`
- `LifeEventLabel`

## Fejlesztesi workflow

Valtoztatas utan javasolt sorrend:

```bash
npm run prisma:generate
npx prisma validate
npm run build
npm run lint
npm run docs:generate
npm run test:e2e
```

DB migracio alkalmazasa:

```bash
npx prisma migrate deploy
```

Dokumentacio frissitese:

```bash
npm run docs:generate
```

## Dontesi elvek

- A legegyszerubb mukodo megoldas legyen az alap.
- Kerulni kell az indokolatlan absztrakciot.
- GraphQL schema legyen frontend-barata.
- User inputot mindig normalizalni kell, ha kulcskent hasznaljuk.
- Owner scoping minden user adaton kotelezo.
- E2E teszt fontosabb, mint a sok unit teszt, ha API-flow-t erint a valtozas.
- Production config mindig reverse proxy es HTTPS mogotti mukodest feltetelezzen.
- Security alapbeallitasok legyenek a projekt reszei, ne utolag keruljenek ra.
