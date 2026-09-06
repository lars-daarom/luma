# Luma 5.0

Kleine draai. Nieuwe richting.

Een statische HTML5-puzzelgame met 72 campagnelevels, zes werelden, dagpuzzels, vrije puzzels en originele procedurele muziek. Versie 5 vervangt de mascottes door abstracte speelstukken en een helder flat-designsysteem.

## De app

`index.html` laadt `assets/engine.js`, `assets/studio-art.js`, `assets/studio.js` en `assets/studio.css`. Er zijn geen externe fonts, afbeeldingen, trackers of runtimepakketten nodig. Muziek begint na een gebruikershandeling.

Terug maakt een draai ongedaan. Hint toont een volgende stap. Vonk laat je een tegel kiezen die automatisch goed wordt gezet. Hint en Vonk zijn onbeperkt; hulp levert 1 ster voor die poging op. Een eerder behaalde hogere score blijft bewaard. Alle levels zijn vrij te kiezen.

## Publiceren

De bestaande GitHub Pages-publicatie vanaf `main` en `/ (root)` kan blijven staan. `.nojekyll` voorkomt verwerking door Jekyll. Wissel niet opnieuw naar `/docs`. Deze repository heeft geen dubbele docs-versie.

`.github/workflows/check.yml` controleert broncode, puzzels en alle releasebestanden; de workflow wijzigt geen Pages-instellingen en schrijft geen code terug. Het tijdelijke artifact `luma-5.0-preview` bevat de geverifieerde site.

`controle.html` vergelijkt gepubliceerde bestanden met `release.json`. De Git-blobhashes zijn bedoeld om gemengde versies en ontbrekende bestanden te herkennen, niet als digitale handtekening.

## Ontwikkelen en controleren

Gebruik Node 22 of nieuwer en een eenvoudige HTTP-server.

```sh
node --test tests/*.test.cjs
node scripts/prepare-pages.mjs
python -m http.server 8000
```

Na wijzigingen aan runtimebestanden:

```sh
node scripts/build-icons.mjs  # alleen nodig na aanpassing van de icoonvorm
node scripts/update-release.mjs
node --test tests/*.test.cjs
```

De test-API `window.LumaTest` wordt alleen beschikbaar wanneer een test vooraf `window.LUMA_TEST = true` instelt. In normaal gebruik is die API afwezig.

## Voortgang en updates

De bestaande sleutel `luma.save.v1` en alle 72 oorspronkelijke puzzelindelingen blijven intact. Instellingen bevat export/import; import voegt de beste scores samen. Wis geen websitegegevens om te verversen. Nieuwe serviceworkers activeren na afsluiten van oude tabs of via de updateknop wanneer beschikbaar.

De oude bestanden `assets/app.js`, `assets/app.css`, `assets/worlds.js` en eerdere branding blijven als regressiereferentie aanwezig, maar worden niet door de nieuwe app geladen. `tests/art.test.cjs` en `tests/symbols.test.cjs` testen uitsluitend die oudere bronnen. De nieuwe vormgeving wordt getest in `tests/studio.test.cjs`.

Zie `DESIGN.md`, `QA.md` en `START-HIER.md` voor ontwerpkeuzes, testgrenzen en publicatiecontrole.
