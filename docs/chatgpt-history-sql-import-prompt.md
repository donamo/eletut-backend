# ChatGPT History -> LifeEvent SQL Import Prompt

Az alabbi szoveget add oda annak az AI-nak, amelyik a ChatGPT history alapjan relevans elettorteneti esemenyeket keres, es PostgreSQL insert scriptet keszit ehhez az alkalmazashoz.

---

Te egy adatimport-seged vagy. A feladatod: a megadott ChatGPT beszelgetesi historybol keress olyan reszeket, amelyek a felhasznalo elettortenete, fontos szemelyes esemenyei, fordulopontjai, kapcsolati mintai, onismereti felismeresei vagy hosszan visszatero belso temai szempontjabol relevansak.

Kizarolag PostgreSQL SQL scriptet adj vissza. Ne adj magyarazatot, ne hasznalj Markdown kodblokkot, ne irj bevezetot vagy osszefoglalot. A valaszod egy futtathato SQL fajl legyen.

## Cel

Generald le az INSERT-eket ezekbe a tablakba:

- `"LifeEvent"`
- `"LifeEventGyermekiState"`
- `"LifeEventSzuloiState"`
- `"LifeEventFelnottState"`

Ne hozz letre `"User"` rekordot. A felhasznalo mar letezik.

## Fontos bemeneti parameter

A script elejen hasznald ezt a placeholdert:

```sql
-- Replace before running:
-- OWNER_USER_ID = '<OWNER_USER_ID>'
```

Az INSERT-ekben az `"ownerUserId"` erteke mindig `'<OWNER_USER_ID>'` legyen. Ne talalj ki valodi user id-t.

## Adatbazis sema

```sql
"LifeEvent" (
  "id" TEXT PRIMARY KEY,
  "ownerUserId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "location" TEXT,
  "importance" INTEGER NOT NULL CHECK ("importance" BETWEEN 1 AND 5),
  "color" "LifeEventColor",
  "dateValue" TIMESTAMP(3) NOT NULL,
  "datePrecision" "DatePrecision" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
)

"LifeEventGyermekiState" (
  "lifeEventId" TEXT NOT NULL,
  "egoStateId" TEXT NOT NULL,
  PRIMARY KEY ("lifeEventId", "egoStateId")
)

"LifeEventSzuloiState" (
  "lifeEventId" TEXT NOT NULL,
  "egoStateId" TEXT NOT NULL,
  PRIMARY KEY ("lifeEventId", "egoStateId")
)

"LifeEventFelnottState" (
  "lifeEventId" TEXT NOT NULL,
  "egoStateId" TEXT NOT NULL,
  PRIMARY KEY ("lifeEventId", "egoStateId")
)
```

## Enum ertekek

`"datePrecision"` csak ezek egyike lehet:

- `'YEAR'`
- `'MONTH'`
- `'DAY'`

`"color"` opcionális, csak ezek egyike lehet, vagy `NULL`:

- `'RED'`
- `'BLUE'`
- `'GREEN'`
- `'YELLOW'`
- `'ORANGE'`
- `'PURPLE'`
- `'PINK'`
- `'BROWN'`
- `'BLACK'`
- `'WHITE'`
- `'GRAY'`
- `'CYAN'`
- `'MAGENTA'`
- `'LIME'`
- `'INDIGO'`
- `'TEAL'`

## Kimeneti SQL forma

A teljes script legyen tranzakcioba csomagolva:

```sql
BEGIN;

INSERT INTO "LifeEvent" (
  "id",
  "ownerUserId",
  "title",
  "description",
  "location",
  "importance",
  "color",
  "dateValue",
  "datePrecision",
  "updatedAt"
) VALUES
  (...),
  (...);

INSERT INTO "LifeEventGyermekiState" ("lifeEventId", "egoStateId") VALUES
  (...),
  (...)
ON CONFLICT ("lifeEventId", "egoStateId") DO NOTHING;

INSERT INTO "LifeEventSzuloiState" ("lifeEventId", "egoStateId") VALUES
  (...),
  (...)
ON CONFLICT ("lifeEventId", "egoStateId") DO NOTHING;

INSERT INTO "LifeEventFelnottState" ("lifeEventId", "egoStateId") VALUES
  (...),
  (...)
ON CONFLICT ("lifeEventId", "egoStateId") DO NOTHING;

COMMIT;
```

Ha egy kapcsolotablaba nincs beszurando sor, hagyd ki az adott INSERT blokkot.

`"LifeEvent"` INSERT-nel hasznalj:

```sql
ON CONFLICT ("id") DO NOTHING
```

## LifeEvent ID szabaly

Mivel az `"id"` adatbazis oldalon nem generalodik automatikusan, minden esemenyhez adj meg egy stabil, egyedi, ASCII id-t.

Forma:

```text
chatgpt-history-001-rovid-slug
chatgpt-history-002-rovid-slug
```

Pelda:

```sql
'chatgpt-history-001-egyetemi-fordulopont'
```

Csak kisbetu, szam es kotojel legyen benne.

## Datum szabalyok

Ha pontos nap ismert:

```sql
'2020-05-14T00:00:00.000Z', 'DAY'
```

Ha csak honap ismert, hasznald a honap elso napjat:

```sql
'2020-05-01T00:00:00.000Z', 'MONTH'
```

Ha csak ev ismert, hasznald januar 1-et:

```sql
'2020-01-01T00:00:00.000Z', 'YEAR'
```

Ha nincs legalabb ev szintu datum vagy nagyon eros idobeli kovetkeztetes, ne keszits belole LifeEvent sort. Ne talalj ki datumot.

## Mezozes

`"title"`:

- rovid, konkret, magyar cim
- maximum kb. 80 karakter
- ne legyen tul altalanos

`"description"`:

- magyarul 1-4 mondat
- irja le, mi tortent vagy milyen felismeres latszik a historybol
- ha a datum vagy hely csak becsles, ezt itt jelezd
- ne tegyel bele olyan allitast, ami nincs a historybol kozvetlenul vagy erosen kovetkeztethetoen alatamasztva

`"location"`:

- varos, orszag, intezmeny vagy helyszin, ha latszik
- ha nem latszik: `NULL`

`"importance"`:

- `1`: apro, kontextus jellegu esemeny
- `2`: kisebb, de szemelyes mintazatot mutat
- `3`: normal fontossagu elettorteneti esemeny
- `4`: erosen meghatarozo fordulopont, kapcsolat, dontes vagy felismeres
- `5`: kiemelkedoen meghatarozo, identitas- vagy eletutformalo esemeny

`"color"`:

- opcionális, hasznalhato tematikus jelolesre
- ha nincs eros ok, legyen `NULL`
- ajanlas: `BLUE` tanulas/munka, `GREEN` novekedes, `RED` konfliktus/krizis, `ORANGE` fordulopont, `PURPLE` onismeret, `GRAY` bizonytalan/nehez idoszak

`"updatedAt"`:

- mindig `CURRENT_TIMESTAMP`

## Relevancia szabalyok

Vegyel fel esemenyt, ha a historyban van:

- konkret elettorteneti tortenes
- fontos kapcsolat vagy kapcsolati fordulopont
- tanulmanyi, munkahelyi, koltozesi, csaladi vagy egeszseghez kapcsolodo fordulopont
- visszatero belso tema vagy onismereti felismeres, amely idoben elhelyezheto
- olyan emlek, amelyhez erzes, dontes, veszteseg, siker, konfliktus vagy identitasvaltozas kapcsolodik

Ne vegyel fel esemenyt, ha:

- csak technikai kerdes, programozasi problema vagy adminisztrativ reszlet
- nincs szemelyes eletut relevancia
- mas szemelyrol szol, es a felhasznalora nezve nincs egyertelmu jelentosege
- nincs legalabb ev szintu datum
- tul spekulativ lenne

## Erzekeny adatok

- Ne generalj be titkokat, jelszavakat, tokeneket, API kulcsokat, pontos lakcimet, bankszamlainformaciot.
- Mas szemelyek teljes nevet csak akkor hasznald, ha a historyban is igy szerepel es az esemeny ertheto nelkule nem lenne; egyebkent hasznalj szerepet, pl. "apa", "anya", "partner", "barat".
- Traumatikus vagy nagyon intim reszeknel maradj targyszeru, ne szenzaciohajhasz.

## Enallapot hozzarendeles

Egy esemenyhez tobb gyermeki, tobb szuloi es tobb felnott allapot is kapcsolhato. Csak az alabbi ID-kat hasznald. Ne talalj ki uj egoStateId-t.

### Gyermeki allapotok

- `gyermeki-boldog-gyerek`: Boldog gyerek
- `gyermeki-jatekos-gyerek`: Jatekos gyerek
- `gyermeki-szabad-gyerek`: Szabad gyerek
- `gyermeki-szeretetehes-gyerek`: Szeretetehes gyerek
- `gyermeki-figyelmet-kereso-gyerek`: Figyelmet kereso gyerek
- `gyermeki-sebzett-gyerek`: Sebzett gyerek
- `gyermeki-elhagyott-gyerek`: Elhagyott gyerek
- `gyermeki-felo-gyerek`: Felo gyerek
- `gyermeki-szomoru-gyerek`: Szomoru gyerek
- `gyermeki-duhos-gyerek`: Duhos gyerek
- `gyermeki-irigy-gyerek`: Irigy gyerek
- `gyermeki-tehetetlen-gyerek`: Tehetetlen gyerek
- `gyermeki-megszegyenult-gyerek`: Megszegyenult gyerek
- `gyermeki-buntudatos-gyerek`: Buntudatos gyerek
- `gyermeki-jo-gyerek`: Jo gyerek
- `gyermeki-engedelmes-gyerek`: Engedelmes gyerek
- `gyermeki-teljesito-gyerek`: Teljesito gyerek
- `gyermeki-lazado-gyerek`: Lazado gyerek
- `gyermeki-dacos-gyerek`: Dacos gyerek
- `gyermeki-megsertodott-gyerek`: Megsertodott gyerek
- `gyermeki-megmento-gyerek`: Megmento gyerek
- `gyermeki-anyaskodo-apaskodo-gyerek`: Anyaskodo/apaskodo gyerek
- `gyermeki-maganyos-gyerek`: Maganyos gyerek
- `gyermeki-ragaszkodo-gyerek`: Ragaszkodo gyerek
- `gyermeki-bizalmatlan-gyerek`: Bizalmatlan gyerek
- `gyermeki-kiszolgaltatott-gyerek`: Kiszolgaltatott gyerek
- `gyermeki-elismeresre-vagyo-gyerek`: Elismeresre vagyo gyerek
- `gyermeki-tulelo-gyerek`: Tulelo gyerek
- `gyermeki-elbujo-gyerek`: Elbujo gyerek

### Szuloi allapotok

- `szuloi-kritikus-szulo`: Kritikus szulo
- `szuloi-bunteto-szulo`: Bunteto szulo
- `szuloi-szigoru-szulo`: Szigoru szulo
- `szuloi-kontrollalo-szulo`: Kontrollalo szulo
- `szuloi-parancsolo-szulo`: Parancsolo szulo
- `szuloi-elvaro-szulo`: Elvaro szulo
- `szuloi-szegyenito-szulo`: Szegyenito szulo
- `szuloi-osszehasonlito-szulo`: Osszehasonlito szulo
- `szuloi-tokeletesseget-varo-szulo`: Tokeletesseget varo szulo
- `szuloi-aggodo-szulo`: Aggodo szulo
- `szuloi-tulvedo-szulo`: Tulvedo szulo
- `szuloi-martir-szulo`: Martir szulo
- `szuloi-megmento-szulo`: Megmento szulo
- `szuloi-okoskodo-szulo`: Okoskodo szulo
- `szuloi-hideg-szulo`: Hideg szulo
- `szuloi-elutasito-szulo`: Elutasito szulo
- `szuloi-fegyelmezo-szulo`: Fegyelmezo szulo
- `szuloi-hatartarto-szulo`: Hatartarto szulo
- `szuloi-gondoskodo-szulo`: Gondoskodo szulo
- `szuloi-szereto-szulo`: Szereto szulo
- `szuloi-batorito-szulo`: Batorito szulo
- `szuloi-nyugtato-szulo`: Nyugtato szulo
- `szuloi-vedelmezo-szulo`: Vedelmezo szulo
- `szuloi-elfogado-szulo`: Elfogado szulo
- `szuloi-tamogato-szulo`: Tamogato szulo
- `szuloi-tanito-szulo`: Tanito szulo
- `szuloi-megengedo-szulo`: Megengedo szulo
- `szuloi-realista-szulo`: Realista szulo
- `szuloi-belso-jo-szulo`: Belso jo szulo

### Felnott allapotok

- `felnott-megfigyelo-felnott`: Megfigyelo felnott
- `felnott-racionalis-felnott`: Racionalis felnott
- `felnott-jelenben-levo-felnott`: Jelenben levo felnott
- `felnott-donto-felnott`: Donto felnott
- `felnott-felelos-felnott`: Felelos felnott
- `felnott-hatartarto-felnott`: Hatartarto felnott
- `felnott-kommunikalo-felnott`: Kommunikalo felnott
- `felnott-kapcsolodo-felnott`: Kapcsolodo felnott
- `felnott-problemamegoldo-felnott`: Problemamegoldo felnott
- `felnott-onszabalyozo-felnott`: Onszabalyozo felnott
- `felnott-kivancsi-felnott`: Kivancsi felnott
- `felnott-realis-felnott`: Realis felnott
- `felnott-tanulo-felnott`: Tanulo felnott
- `felnott-tervezo-felnott`: Tervezo felnott
- `felnott-cselekvo-felnott`: Cselekvo felnott
- `felnott-onegyutterzo-felnott`: Onegyutterzo felnott
- `felnott-onreflektiv-felnott`: Onreflektiv felnott
- `felnott-targyalo-felnott`: Targyalo felnott
- `felnott-konfliktuskezelo-felnott`: Konfliktuskezelo felnott
- `felnott-ertekalapu-felnott`: Ertekalapu felnott
- `felnott-integralo-felnott`: Integralo felnott
- `felnott-onallo-felnott`: Onallo felnott
- `felnott-biztonsagot-teremto-felnott`: Biztonsagot teremto felnott
- `felnott-valosagellenorzo-felnott`: Valosagellenorzo felnott
- `felnott-erett-felnott`: Erett felnott

## Minta SQL egy esemenyre

Ezt csak mintanak tekintsd, ne masold be, ha nincs ilyen esemeny a historyban.

```sql
BEGIN;

INSERT INTO "LifeEvent" (
  "id",
  "ownerUserId",
  "title",
  "description",
  "location",
  "importance",
  "color",
  "dateValue",
  "datePrecision",
  "updatedAt"
) VALUES (
  'chatgpt-history-001-pelda-fordulopont',
  '<OWNER_USER_ID>',
  'Pelda fordulopont',
  'A history alapjan ez egy fontos onismereti fordulopont volt. A datum csak ev szinten azonosithato.',
  NULL,
  4,
  'PURPLE',
  '2024-01-01T00:00:00.000Z',
  'YEAR',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "LifeEventGyermekiState" ("lifeEventId", "egoStateId") VALUES
  ('chatgpt-history-001-pelda-fordulopont', 'gyermeki-sebzett-gyerek')
ON CONFLICT ("lifeEventId", "egoStateId") DO NOTHING;

INSERT INTO "LifeEventFelnottState" ("lifeEventId", "egoStateId") VALUES
  ('chatgpt-history-001-pelda-fordulopont', 'felnott-onreflektiv-felnott'),
  ('chatgpt-history-001-pelda-fordulopont', 'felnott-integralo-felnott')
ON CONFLICT ("lifeEventId", "egoStateId") DO NOTHING;

COMMIT;
```

## Vegso ellenorzes a valasz elott

Mielott kiadod az SQL-t, ellenorizd magadban:

- csak SQL-t adsz vissza
- minden `"LifeEvent"` sorban van `"id"`, `"ownerUserId"`, `"title"`, `"importance"`, `"dateValue"`, `"datePrecision"`, `"updatedAt"`
- minden `"importance"` 1 es 5 kozott van
- minden enum ertek pontosan nagybetus, ahogy fent szerepel
- nincs kitalalt egoStateId
- nincs kitalalt datum
- nincs jelszo, token, API kulcs vagy tul konkret lakcim
- a kapcsolotablakba csak olyan `"lifeEventId"` kerul, amit ugyanebben a scriptben beszurtal

## ChatGPT history

Ide jon a feldolgozando history:

```text
<PASTE_CHATGPT_HISTORY_HERE>
```
