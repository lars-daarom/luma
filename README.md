# Luma 5.3

Kleine draai. Nieuwe richting.

Luma is een statische HTML5-puzzelgame met 72 campagnelevels, zes werelden, dagpuzzels, vrij spel en procedurele muziek. Versie 5.3 herbouwt de visuele laag rondom een echte reis: een immersief openingsscherm, een verticale levelkaart en een compacter speelbord.

## Spelstructuur

De campagne loopt vanaf 5.2/5.3 sequentieel: een nieuw level opent zodra je huidige route is voltooid. Eerder behaalde levels blijven opnieuw speelbaar. Bestaande `luma.save.v1`-voortgang uit oudere versies wordt niet teruggezet: Luma gebruikt zowel je hoogste behaalde level als een geldige campagne-hervatting om je huidige positie te bepalen.

De oorspronkelijke 72 campagnepuzzels zijn niet gewijzigd. Dagpuzzel en vrij spel blijven beschikbaar. Terug maakt een draai ongedaan, Hint wijst een volgende stap aan en Vonk zet een gekozen tegel goed; hulp telt mee in de sterrenbeoordeling.

## Vormgeving 5.3

- Zes opnieuw opgebouwde wereldillustraties met afzonderlijke composities voor openingsscherm, levelkaart en kleinere kaarten.
- Geen generieke route-overlay of opgeplakte karakterillustraties in de werelden.
- Het openingsscherm is schermvullend en heeft één duidelijke primaire spelactie.
- De levelkaart toont een slingerende route, behaalde sterren, huidige stap en vergrendelde toekomstige levels.
- Het speelbord wordt bij onregelmatige levels tot de werkelijke actieve tegels teruggebracht; lege rijen en kolommen maken het bord niet meer kunstmatig groot.
- Opdracht, doelen en hulpmiddelen zijn geïntegreerd in één compacte mobiele layout zonder brede zijbalk, levens, energie, valuta of winkelinterface.
- iPhone en iPad gebruiken dezelfde visuele hiërarchie met aparte responsive afmetingen.

## Runtime

`index.html` laadt uitsluitend de huidige runtime:

- `assets/engine.js`
- `assets/studio-art.js`
- `assets/atlas-art.js`
- `assets/journey.js`
- `assets/studio.js`
- `assets/studio.css`
- `assets/atlas.css`
- `assets/journey.css`

Er zijn geen externe fonts, trackers of runtimepakketten nodig. Muziek start na een gebruikershandeling.

## Publiceren

GitHub Pages publiceert vanaf `main` en `/ (root)`. `.nojekyll` voorkomt Jekyll-verwerking. `release.json` en `scripts/prepare-pages.mjs` controleren dat alle runtimebestanden exact bij dezelfde release horen. `.github/workflows/check.yml` is read-only en controleert broncode, puzzels, voortgangsregels en het statische Pages-artifact.

Na wijzigingen aan runtimebestanden:

```sh
node scripts/update-release.mjs
node --test tests/*.test.cjs
node scripts/prepare-pages.mjs
```

Wis websitegegevens niet om een update af te dwingen: daarin kan je `luma.save.v1`-voortgang staan. Sluit bij een oude PWA-versie eerst alle oude Luma-tabs of de geïnstalleerde webapp en open hem opnieuw.
