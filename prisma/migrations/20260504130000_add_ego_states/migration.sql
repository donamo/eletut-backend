-- CreateEnum
CREATE TYPE "EgoStateCategory" AS ENUM ('GYERMEKI', 'SZULOI', 'FELNOTT');

-- CreateTable
CREATE TABLE "EgoState" (
    "id" TEXT NOT NULL,
    "category" "EgoStateCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "essence" TEXT NOT NULL,
    "innerSentence" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EgoState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeEventGyermekiState" (
    "lifeEventId" TEXT NOT NULL,
    "egoStateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeEventGyermekiState_pkey" PRIMARY KEY ("lifeEventId", "egoStateId")
);

-- CreateTable
CREATE TABLE "LifeEventSzuloiState" (
    "lifeEventId" TEXT NOT NULL,
    "egoStateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeEventSzuloiState_pkey" PRIMARY KEY ("lifeEventId", "egoStateId")
);

-- CreateTable
CREATE TABLE "LifeEventFelnottState" (
    "lifeEventId" TEXT NOT NULL,
    "egoStateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeEventFelnottState_pkey" PRIMARY KEY ("lifeEventId", "egoStateId")
);

-- CreateIndex
CREATE UNIQUE INDEX "EgoState_category_name_key" ON "EgoState"("category", "name");

-- CreateIndex
CREATE INDEX "EgoState_category_sortOrder_idx" ON "EgoState"("category", "sortOrder");

-- CreateIndex
CREATE INDEX "LifeEventGyermekiState_egoStateId_idx" ON "LifeEventGyermekiState"("egoStateId");

-- CreateIndex
CREATE INDEX "LifeEventSzuloiState_egoStateId_idx" ON "LifeEventSzuloiState"("egoStateId");

-- CreateIndex
CREATE INDEX "LifeEventFelnottState_egoStateId_idx" ON "LifeEventFelnottState"("egoStateId");

-- AddForeignKey
ALTER TABLE "LifeEventGyermekiState" ADD CONSTRAINT "LifeEventGyermekiState_lifeEventId_fkey" FOREIGN KEY ("lifeEventId") REFERENCES "LifeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeEventGyermekiState" ADD CONSTRAINT "LifeEventGyermekiState_egoStateId_fkey" FOREIGN KEY ("egoStateId") REFERENCES "EgoState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeEventSzuloiState" ADD CONSTRAINT "LifeEventSzuloiState_lifeEventId_fkey" FOREIGN KEY ("lifeEventId") REFERENCES "LifeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeEventSzuloiState" ADD CONSTRAINT "LifeEventSzuloiState_egoStateId_fkey" FOREIGN KEY ("egoStateId") REFERENCES "EgoState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeEventFelnottState" ADD CONSTRAINT "LifeEventFelnottState_lifeEventId_fkey" FOREIGN KEY ("lifeEventId") REFERENCES "LifeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeEventFelnottState" ADD CONSTRAINT "LifeEventFelnottState_egoStateId_fkey" FOREIGN KEY ("egoStateId") REFERENCES "EgoState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SeedData
INSERT INTO "EgoState" ("id", "category", "name", "essence", "innerSentence", "sortOrder") VALUES
('gyermeki-boldog-gyerek', 'GYERMEKI', 'Boldog gyerek', 'Örül, lelkes, kíváncsi, élvezi az életet.', 'De jó! Ezt akarom!', 1),
('gyermeki-jatekos-gyerek', 'GYERMEKI', 'Játékos gyerek', 'Kreatív, spontán, kísérletező.', 'Próbáljuk ki!', 2),
('gyermeki-szabad-gyerek', 'GYERMEKI', 'Szabad gyerek', 'Önazonos, természetes, nem akar megfelelni.', 'Én most ezt érzem.', 3),
('gyermeki-szeretetehes-gyerek', 'GYERMEKI', 'Szeretetéhes gyerek', 'Figyelmet, közelséget, megerősítést keres.', 'Vegyetek már észre!', 4),
('gyermeki-figyelmet-kereso-gyerek', 'GYERMEKI', 'Figyelmet kereső gyerek', 'Szerepel, verseng, lenyomna másokat.', 'Nekem kell fontosabbnak lennem.', 5),
('gyermeki-sebzett-gyerek', 'GYERMEKI', 'Sebzett gyerek', 'Régi fájdalomból reagál.', 'Már megint nem számítok.', 6),
('gyermeki-elhagyott-gyerek', 'GYERMEKI', 'Elhagyott gyerek', 'Magára maradtnak érzi magát.', 'Senki nincs velem.', 7),
('gyermeki-felo-gyerek', 'GYERMEKI', 'Félő gyerek', 'Biztonságot keres, szorong.', 'Baj lesz.', 8),
('gyermeki-szomoru-gyerek', 'GYERMEKI', 'Szomorú gyerek', 'Veszteséget, hiányt él meg.', 'Ez nekem nagyon fáj.', 9),
('gyermeki-duhos-gyerek', 'GYERMEKI', 'Dühös gyerek', 'Tiltakozik, igazságtalanságot érez.', 'Ez nem fair!', 10),
('gyermeki-irigy-gyerek', 'GYERMEKI', 'Irigy gyerek', 'Más figyelmét vagy sikerét fenyegetésként éli meg.', 'Neki miért jut, nekem miért nem?', 11),
('gyermeki-tehetetlen-gyerek', 'GYERMEKI', 'Tehetetlen gyerek', 'Úgy érzi, nincs eszköze.', 'Úgysem tudok mit tenni.', 12),
('gyermeki-megszegyenult-gyerek', 'GYERMEKI', 'Megszégyenült gyerek', 'Azt érzi, vele van baj.', 'Én rossz vagyok.', 13),
('gyermeki-buntudatos-gyerek', 'GYERMEKI', 'Bűntudatos gyerek', 'Mindent magára vesz.', 'Biztos én rontottam el.', 14),
('gyermeki-jo-gyerek', 'GYERMEKI', 'Jó gyerek', 'Megfelel, alkalmazkodik, nem okoz gondot.', 'Legyek jó, akkor szeretnek.', 15),
('gyermeki-engedelmes-gyerek', 'GYERMEKI', 'Engedelmes gyerek', 'Alárendelődik, nem kérdez.', 'Megcsinálom, amit mondanak.', 16),
('gyermeki-teljesito-gyerek', 'GYERMEKI', 'Teljesítő gyerek', 'Eredménnyel akar szeretetet kapni.', 'Ha jól teljesítek, értékes vagyok.', 17),
('gyermeki-lazado-gyerek', 'GYERMEKI', 'Lázadó gyerek', 'Ellenáll, dacból cselekszik.', 'Csak azért sem!', 18),
('gyermeki-dacos-gyerek', 'GYERMEKI', 'Dacos gyerek', 'Makacs, sértett ellenállásban van.', 'Nem érdekel, akkor sem.', 19),
('gyermeki-megsertodott-gyerek', 'GYERMEKI', 'Megsértődött gyerek', 'Visszahúzódik, büntet csenddel.', 'Ha így bánsz velem, nem szólok hozzád.', 20),
('gyermeki-megmento-gyerek', 'GYERMEKI', 'Megmentő gyerek', 'Más problémáján keresztül akar fontossá válni.', 'Majd én megoldom helyetted.', 21),
('gyermeki-anyaskodo-apaskodo-gyerek', 'GYERMEKI', 'Anyáskodó/apáskodó gyerek', 'Túl korán felnőtt szerepbe került.', 'Nekem kell vigyázni mindenkire.', 22),
('gyermeki-maganyos-gyerek', 'GYERMEKI', 'Magányos gyerek', 'Nincs kapcsolódásélménye.', 'Egyedül vagyok ezzel.', 23),
('gyermeki-ragaszkodo-gyerek', 'GYERMEKI', 'Ragaszkodó gyerek', 'Fél az eltávolodástól.', 'Ne menj el!', 24),
('gyermeki-bizalmatlan-gyerek', 'GYERMEKI', 'Bizalmatlan gyerek', 'Nem hiszi el, hogy biztonságban lehet.', 'Úgyis bántani fognak.', 25),
('gyermeki-kiszolgaltatott-gyerek', 'GYERMEKI', 'Kiszolgáltatott gyerek', 'Másoktól várja a biztonságot.', 'Mondd meg, mit csináljak.', 26),
('gyermeki-elismeresre-vagyo-gyerek', 'GYERMEKI', 'Elismerésre vágyó gyerek', 'Dicséretből táplálkozik.', 'Mondd, hogy jó vagyok.', 27),
('gyermeki-tulelo-gyerek', 'GYERMEKI', 'Túlélő gyerek', 'Régi stratégiával védi magát.', 'Valahogy túl kell élni.', 28),
('gyermeki-elbujo-gyerek', 'GYERMEKI', 'Elbújó gyerek', 'Láthatatlanná akar válni.', 'Jobb, ha nem veszek részt.', 29),
('szuloi-kritikus-szulo', 'SZULOI', 'Kritikus szülő', 'Ítél, minősít, hibát keres.', 'Ez kevés.', 1),
('szuloi-bunteto-szulo', 'SZULOI', 'Büntető szülő', 'Megtorlást, szégyent használ.', 'Ezt meg kell fizetned.', 2),
('szuloi-szigoru-szulo', 'SZULOI', 'Szigorú szülő', 'Magas elvárásokat támaszt.', 'Muszáj jól csinálnod.', 3),
('szuloi-kontrollalo-szulo', 'SZULOI', 'Kontrolláló szülő', 'Mindent irányítani akar.', 'Én tudom, mi a helyes.', 4),
('szuloi-parancsolo-szulo', 'SZULOI', 'Parancsoló szülő', 'Utasít, nem kérdez.', 'Csináld, mert ezt kell.', 5),
('szuloi-elvaro-szulo', 'SZULOI', 'Elváró szülő', 'Teljesítményt követel.', 'Legyél erős, pontos, hibátlan.', 6),
('szuloi-szegyenito-szulo', 'SZULOI', 'Szégyenítő szülő', 'A személyt támadja, nem a viselkedést.', 'Veled van baj.', 7),
('szuloi-osszehasonlito-szulo', 'SZULOI', 'Összehasonlító szülő', 'Másokhoz mér.', 'Bezzeg ő jobban csinálja.', 8),
('szuloi-tokeletesseget-varo-szulo', 'SZULOI', 'Tökéletességet váró szülő', 'Hibátlanságot követel.', 'Nem lehet hiba.', 9),
('szuloi-aggodo-szulo', 'SZULOI', 'Aggódó szülő', 'Veszélyt lát mindenhol.', 'Vigyázz, ebből baj lesz.', 10),
('szuloi-tulvedo-szulo', 'SZULOI', 'Túlvédő szülő', 'Nem engedi az önállóságot.', 'Majd én megcsinálom helyetted.', 11),
('szuloi-martir-szulo', 'SZULOI', 'Mártír szülő', 'Áldozatként kontrollál.', 'Én mindent érted teszek.', 12),
('szuloi-megmento-szulo', 'SZULOI', 'Megmentő szülő', 'Átveszi más felelősségét.', 'Nem bírod, majd én elintézem.', 13),
('szuloi-okoskodo-szulo', 'SZULOI', 'Okoskodó szülő', 'Mindig jobban tudja.', 'Majd én elmagyarázom.', 14),
('szuloi-hideg-szulo', 'SZULOI', 'Hideg szülő', 'Érzelemmentes, távolságtartó.', 'Ne hisztizz.', 15),
('szuloi-elutasito-szulo', 'SZULOI', 'Elutasító szülő', 'Nem ad elfogadást.', 'Ezzel ne gyere hozzám.', 16),
('szuloi-fegyelmezo-szulo', 'SZULOI', 'Fegyelmező szülő', 'Kereteket ad, szabályt tartat.', 'Ezt most meg kell állítani.', 17),
('szuloi-hatartarto-szulo', 'SZULOI', 'Határtartó szülő', 'Védő, világos nemet mond.', 'Eddig igen, tovább nem.', 18),
('szuloi-gondoskodo-szulo', 'SZULOI', 'Gondoskodó szülő', 'Támogat, melegséget ad.', 'Itt vagyok veled.', 19),
('szuloi-szereto-szulo', 'SZULOI', 'Szerető szülő', 'Elfogad és kapcsolódik.', 'Fontos vagy nekem.', 20),
('szuloi-batorito-szulo', 'SZULOI', 'Bátorító szülő', 'Erőt ad.', 'Meg tudod csinálni.', 21),
('szuloi-nyugtato-szulo', 'SZULOI', 'Nyugtató szülő', 'Csökkenti a szorongást.', 'Most nehéz, de rendben vagy.', 22),
('szuloi-vedelmezo-szulo', 'SZULOI', 'Védelmező szülő', 'Biztonságot teremt.', 'Nem hagylak egyedül ebben.', 23),
('szuloi-elfogado-szulo', 'SZULOI', 'Elfogadó szülő', 'Nem minősít.', 'Érthető, hogy ezt érzed.', 24),
('szuloi-tamogato-szulo', 'SZULOI', 'Támogató szülő', 'Segít, de nem veszi át az életet.', 'Miben tudok segíteni?', 25),
('szuloi-tanito-szulo', 'SZULOI', 'Tanító szülő', 'Átad tudást, irányt mutat.', 'Mutatok egy jobb módszert.', 26),
('szuloi-megengedo-szulo', 'SZULOI', 'Megengedő szülő', 'Enged teret, szabadságot.', 'Lehet hibázni.', 27),
('szuloi-realista-szulo', 'SZULOI', 'Realista szülő', 'Szeretettel, de józanul keretez.', 'Ez most fáj, de megoldható.', 28),
('szuloi-belso-jo-szulo', 'SZULOI', 'Belső jó szülő', 'Saját magadnak ad biztonságot.', 'Rendben vagyok, nem kell harcolnom.', 29),
('felnott-megfigyelo-felnott', 'FELNOTT', 'Megfigyelő felnőtt', 'Észreveszi, mi történik belül.', 'Most dühöt érzek.', 1),
('felnott-racionalis-felnott', 'FELNOTT', 'Racionális felnőtt', 'Adatokat, tényeket néz.', 'Mi bizonyítható ebből?', 2),
('felnott-jelenben-levo-felnott', 'FELNOTT', 'Jelenben lévő felnőtt', 'Különválasztja a múltat a jelentől.', 'Ez most nem ugyanaz, mint régen.', 3),
('felnott-donto-felnott', 'FELNOTT', 'Döntő felnőtt', 'Választási lehetőségeket mérlegel.', 'Mit akarok most választani?', 4),
('felnott-felelos-felnott', 'FELNOTT', 'Felelős felnőtt', 'Vállalja a saját részét.', 'Ez az én reakcióm, dolgozhatok vele.', 5),
('felnott-hatartarto-felnott', 'FELNOTT', 'Határtartó felnőtt', 'Világosan mond igent vagy nemet.', 'Ez nekem nem fér bele.', 6),
('felnott-kommunikalo-felnott', 'FELNOTT', 'Kommunikáló felnőtt', 'Tisztán, támadás nélkül beszél.', 'Azt szeretném kérni, hogy…', 7),
('felnott-kapcsolodo-felnott', 'FELNOTT', 'Kapcsolódó felnőtt', 'Figyel magára és a másikra is.', 'Értem őt, de magamat sem adom fel.', 8),
('felnott-problemamegoldo-felnott', 'FELNOTT', 'Problémamegoldó felnőtt', 'Lépéseket keres.', 'Mi a következő konkrét lépés?', 9),
('felnott-onszabalyozo-felnott', 'FELNOTT', 'Önszabályozó felnőtt', 'Nem azonnal reagál.', 'Megállok, veszek levegőt.', 10),
('felnott-kivancsi-felnott', 'FELNOTT', 'Kíváncsi felnőtt', 'Nem ítél, hanem megért.', 'Miért aktiválódott ez bennem?', 11),
('felnott-realis-felnott', 'FELNOTT', 'Reális felnőtt', 'Nem nagyít, nem kicsinyít.', 'Ez kellemetlen, de nem katasztrófa.', 12),
('felnott-tanulo-felnott', 'FELNOTT', 'Tanuló felnőtt', 'Tapasztalatot von le.', 'Mit tanulhatok ebből?', 13),
('felnott-tervezo-felnott', 'FELNOTT', 'Tervező felnőtt', 'Előre gondolkodik.', 'Hogyan készüljek erre?', 14),
('felnott-cselekvo-felnott', 'FELNOTT', 'Cselekvő felnőtt', 'Nem csak elemez, hanem lép.', 'Most ezt fogom megtenni.', 15),
('felnott-onegyutterzo-felnott', 'FELNOTT', 'Önegyüttérző felnőtt', 'Kedvesen tartja saját magát.', 'Érthető, hogy ez megérintett.', 16),
('felnott-onreflektiv-felnott', 'FELNOTT', 'Önreflektív felnőtt', 'Rálát saját mintáira.', 'Ez a figyelemhiányos sebem.', 17),
('felnott-targyalo-felnott', 'FELNOTT', 'Tárgyaló felnőtt', 'Egyeztet, keresi a megállapodást.', 'Keressünk működő megoldást.', 18),
('felnott-konfliktuskezelo-felnott', 'FELNOTT', 'Konfliktuskezelő felnőtt', 'Nem menekül és nem támad.', 'Maradok nyugodt, de határozott.', 19),
('felnott-ertekalapu-felnott', 'FELNOTT', 'Értékalapú felnőtt', 'Nem impulzusból, hanem értékből dönt.', 'Milyen emberként akarok jelen lenni?', 20),
('felnott-integralo-felnott', 'FELNOTT', 'Integráló felnőtt', 'Összekapcsolja a belső részeket.', 'Érzem a gyereket, hallom a szülőt, de én döntök.', 21),
('felnott-onallo-felnott', 'FELNOTT', 'Önálló felnőtt', 'Nem más visszajelzéséből él.', 'Akkor is értékes vagyok, ha most nem figyelnek rám.', 22),
('felnott-biztonsagot-teremto-felnott', 'FELNOTT', 'Biztonságot teremtő felnőtt', 'Megadja magának, ami hiányzott.', 'Most már tudok vigyázni magamra.', 23),
('felnott-valosagellenorzo-felnott', 'FELNOTT', 'Valóságellenőrző felnőtt', 'Ellenőrzi a belső történetet.', 'Tényleg elutasítottak, vagy csak ezt érzem?', 24),
('felnott-erett-felnott', 'FELNOTT', 'Érett felnőtt', 'Egyszerre tud érezni és józan maradni.', 'Fáj, de nem kell ebből támadnom.', 25)
ON CONFLICT ("id") DO NOTHING;
