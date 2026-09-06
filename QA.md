# Luma 4.1.0 - Controleverslag

Datum: 6 september 2026. De uitslagen hieronder horen bij deze bundel, niet bij de live GitHub-site.

## Wat daadwerkelijk is uitgevoerd

### Node-tests: 19 tests geslaagd

`node --test tests/*.test.cjs`

- 72 campagnepuzzels: geldige, niet reeds opgeloste startopstelling en bereikbare oplossing.
- 240 gegenereerde puzzels: zes werelden, vier bordformaten, tien seeds.
- 365 dagpuzzels.
- In totaal 677 logisch gecontroleerde puzzelgevallen.
- Alle 72 campagne-layouts vergeleken met de opgeslagen oorspronkelijke signatures. Identiek.
- Zeven verschillende symbolen; geen karaktergezichten of lijfjes in de bordglyphs.
- Doorlopende pijpgeometrie en volledig dekkende kleurlagen in de renderer.
- Zeven plantenvrienden en de omgevingsbasis; voortgangscompatibiliteit en geen Unicode-emoji in de geteste appbronnen.
- Versies en relatieve paden in app, manifest en assets gecontroleerd.
- Worker-simulatie: cache-isolatie per projectroute, nieuwe assets, offline fallback, versiebeveiliging en diagnostiek-bypass.
- Statische publicatie: SHA-256-validatie van 13 runtimebestanden, index op de artefactroot, geen docs- of README-kopie in de publicatie, correct workflowpad en permissies.
- Opzettelijk leeggemaakte en beschadigde testmappen geven een duidelijke preflight-fout. Deze proeven veranderen niet de gebruiker-repository.

### Browserinterface

`python tests/browser-qa.py`

- Alle 72 campagnelevels daadwerkelijk met de productie-DOM-knoppen opgelost. Geen aparte mocks van de spelbesturing.
- Introductie met pointerklik, begroeting, winvenster, score-uitleg, Escape, volgend level, ongedaan maken, hint, herstart annuleren en bevestigen.
- Dagpuzzel en vrije 6x6-puzzel opgelost.
- Download van voortgangsexport, ongeldige import, geldige import, behoud van hogere scores en herladen met bestaande testvoortgang.
- Oriëntatieverandering behoudt de actieve puzzel en draaiingen.
- 77 combinaties: 11 schermformaten en zeven schermen per formaat. Breedtes 320, 375, 393, 430, 620, 768, 834, 1024, 1194 en 1366 CSS-pixels, met twee verschillende hoogtes bij 1024.
- Geen horizontale overflow, geen te kleine knoppen volgens de 43,9px-tolerantie voor een 44px-ontwerpdoel, geen JavaScript-fouten in deze suite.

### Tuin en karakters

`python tests/features-qa.py`

- Derde opgelost level verwelkomt Pippa; drie opgeloste puzzels geven drie gegroeide tuinbedden.
- Verzorging verandert de score/voortgang niet.
- Alle zeven karaktervensters openen en sluiten.
- Tuinbed-raakvlakken overlappen niet bij vijf telefoon-/tabletbreedtes.
- Woestijnlevel gebruikt het cactus-symbool voor bron en begeleiding.
- DOM-waarde van theme-color wisselt met de wereld. Dit is geen meting van de echte Safari-balk.
- Liggend/staand wisselen behoudt de sessie.

### Nieuwe tekenlaag en levelkaarten

`python tests/visual-qa.py`

- Alle zes werelden onderzocht.
- 254 werkelijke SVG-pijplagen hebben opacity 1, stroke-opacity 1, totale voorouderopacity 1 en geen blend/filter. Clipgebied begrenst de draaiende geometrie.
- Geen volledige karakters op het bord.
- Na een draai stijgt de draai-teller; terug in de levelselectie blijft de hervatte tegel aanbevolen.
- De aanbeveling is een afgeronde rechthoek, geen cirkel. Levelnummer blijft zichtbaar.
- Toetsenbordfocus en behoud bij draaien van de tablet als gerichte smoke checks.

### Statische HTTP-publicatie

`python tests/http-qa.py`

Dezelfde `scripts/prepare-pages.mjs` als in de workflow bouwt eerst het artefact. Dat is met een lokale HTTP-server onder `/luma/` aangeboden.

- `/luma/`: HTTP 200 met index van 4.1.0.
- Alle 13 runtimebestanden: HTTP 200, juiste bestandsgrootte en SHA-256.
- `release.json`: HTTP 200, versie 4.1.0.
- De relatieve CSS-, JavaScript-, manifest- en iconlinks uit index werken onder die projectroute.
- Een bewust niet-bestaand bestand geeft HTTP 404, geen misleidende HTML met status 200.
- Workflow-YAML en diagnostische JavaScript syntactisch gecontroleerd.

## Visueel bekeken

De daadwerkelijke gerenderde app is bekeken op iPhone-portraitformaat, iPad portrait en iPad landscape. Appicoon, bloemvorm, bordpaden, nieuwe symbolen en levelkaarten zijn visueel gecontroleerd. De preview bij deze levering bestaat uit werkelijke screenshots plus de meegeleverde vectorbranding, niet uit een gegenereerde interface-afbeelding.

## Belangrijke beperkingen

De Chromium-runner blokkeert URL-navigatie door omgevingsbeleid. De UI-tests laden daarom de werkelijke HTML, CSS en JavaScript inline, met een expliciete test-only localStorage-adapter. De adapter staat uitsluitend in de tests en niet in de app. De lokale HTTP-test gebruikt echte HTTP-verzoeken, maar niet een navigerende Safari- of Chromium-PWA.

NIET uitgevoerd of bevestigd:

- Publicatie op de echte GitHub Actions-runner en de uiteindelijke live Pages-site.
- Fysieke iPhone-/iPad-apparaten, Safari/WebKit, top-/statusbalkkleuren.
- Installatie via het beginscherm en echte offline-herstart na een app-update.
- Echte persistentie onder browserquota, prive-modus, deviceherstart of verwijderde websitegegevens.
- Audit met VoiceOver of volledige WCAG-certificering.
- Een nieuwe audio-luistertest op fysieke apparaten. De bestaande muziek- en geluidscode is behouden.

De repository is niet op afstand aangepast. Er is geen commit, push, instellingenwijziging of live deployment uitgevoerd. De gebruiker moet de bestanden committen en Source op GitHub Actions zetten volgens START-HIER.md.

## Reproduceerbare resultaten

De samenvattingen staan in `qa-results/`. De volledige testscripts zitten in `tests/`. Screenshots van eigen testruns komen in genegeerde outputmappen terecht en worden niet door de workflow gepubliceerd.
