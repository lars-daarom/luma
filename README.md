# Luma 5.2

Kleine draai. Nieuwe richting.

Een statische HTML5-puzzelgame met 72 campagnelevels verdeeld over zes werelden. Luma 5.2 maakt van de campagne een echte reis: je voltooit het huidige level voordat het volgende level op de route opent. Reeds behaalde levels blijven opnieuw speelbaar.

## Nieuwe reisstructuur

Het openingsscherm is nu een schermvullende wereldillustratie met een duidelijke primaire actie voor je huidige level. De wereldselectie is vervangen door een verticale levelkaart met een doorlopende route, een marker op je huidige positie, sterren op voltooide levels en vergrendelde toekomstige levels. Een nieuwe wereld opent wanneer je de voorgaande route hebt voltooid.

De interface gebruikt verhoogde witte panelen, compacte knoppen en een vaste navigatiedock. Er zijn bewust geen levens, munten, energiemeters, winkelzijbalken of andere wachtdrempels toegevoegd.

## Spelen

De originele 72 puzzelindelingen en de puzzelregels zijn behouden. Het speelscherm gebruikt nu een compacte opdrachtbalk boven het bord, een centraal speelveld en de bestaande hulpmiddelen onder het bord. Terug maakt de laatste draai ongedaan. Hint toont een volgende stap. Vonk laat je een tegel kiezen die automatisch goed wordt gezet.

De campagne is voortaan sequentieel. Alleen je eerstvolgende onvoltooide level en eerder voltooide levels zijn toegankelijk. Oude opgeslagen voortgang blijft geldig: levels die je in een eerdere versie al hebt voltooid blijven opnieuw speelbaar. Rechtstreekse links naar een nog vergrendeld level worden veilig teruggestuurd naar je huidige route.

Dagpuzzels en vrij spel blijven onderdeel van de bestaande engine en opgeslagen sessies kunnen nog worden hervat. De campagnevoortgang gebruikt nog steeds `luma.save.v1`; er is geen migratie of reset van opgeslagen scores nodig.

## Runtime

`index.html` laadt `assets/engine.js`, `assets/studio-art.js`, `assets/atlas-art.js`, `assets/journey.js`, `assets/studio.js` en de bijbehorende stylesheets. `journey.js` beheert alleen de nieuwe reis-/ontgrendellaag en verandert de puzzelgenerator niet.

Er zijn geen externe fonts, trackers of runtimepakketten nodig. Muziek begint pas na een gebruikershandeling.

## Publiceren

GitHub Pages publiceert vanaf `main` en `/ (root)`. `.nojekyll` voorkomt verwerking door Jekyll. Wissel niet naar `/docs`.

`.github/workflows/check.yml` controleert broncode, alle puzzelregressies, sequentiële ontgrendeling en de releasebestanden. De workflow is read-only. Het tijdelijke artifact `luma-5.2-preview` bevat exact de geverifieerde statische site.

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
node scripts/update-release.mjs
node --test tests/*.test.cjs
```

De bestaande sleutel `luma.save.v1` en alle 72 oorspronkelijke puzzelindelingen blijven intact. Wis geen websitegegevens om een nieuwe versie te laden; daarin kan je voortgang staan.
