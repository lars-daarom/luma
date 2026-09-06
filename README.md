# Luma
## Kleine draai. Groot gevoel.

Een complete, Nederlandstalige, mobile-first HTML5-puzzelgame. Draai verbindingen met een tik. Laat het licht van de zon door het hele netwerk stromen en breng bloemen tot leven.

Versie 1.0 / 6 september 2026. Creatieve werktitel; de beschikbaarheid van de naam voor een publieke lancering is niet onderzocht. Luma heeft geen Apple Design Award gewonnen en is niet verbonden aan Apple.

## Meteen spelen

Open het apart meegeleverde bestand **Luma.html** in een desktopbrowser. Het bevat de volledige game, illustraties, textures, muziekcode en geluidseffecten. Geen installatie, account, API-sleutel of internetverbinding nodig voor deze zelfstandige versie. Op sommige telefoons toont de bestandsviewer alleen een preview; gebruik daar de gehoste webapp zoals hieronder.

Het geluid start bij de eerste tik of toetsaanslag. Via het luidsprekericoon zet je alles stil. Muziek en effecten hebben ook afzonderlijke instellingen.

## Als mobiele webapp publiceren

Plaats `index.html`, `manifest.webmanifest`, `sw.js` en de hele map `icons` bij elkaar op een statische HTTPS-host. De bestanden werken zowel in de hoofdmap als in een submap. Er is geen backend en geen buildstap nodig om deze uitgepakte versie te publiceren.

Open het HTTPS-adres op de telefoon. Op iPhone: open in Safari en gebruik het deelmenu om de site op het beginscherm te zetten. Op ondersteunde andere browsers staat de installatieknop in Instellingen of het browsermenu. De game bevat uitleg voor beide routes.

De serviceworker bewaart de appbestanden na een succesvolle eerste online laadbeurt. Offline gebruik via de geinstalleerde webapp is geimplementeerd maar nog niet op een echte telefoon en een echte HTTPS-host gevalideerd. `Luma.html` zelf heeft geen serviceworker nodig.

Lokaal een webserver starten voor ontwikkeling:

```sh
cd luma
python3 -m http.server 8080
```

Open daarna `http://localhost:8080` op dezelfde computer. Een telefoon die naar het LAN-IP van je computer gaat gebruikt geen localhost; voor de installatie/offlinefuncties op die telefoon is een geschikte beveiligde host nodig. Zie de officiele serviceworker-documentatie in ONDERZOEK.md.

Bij een nieuwe release: verhoog de cacheversie in `sw.js` en publiceer alle bestanden samen.

## Wat er in zit

- 72 campagnepuzzels in zes werelden, met drie korte introductiepuzzels en borden van 3x3 tot 6x6.
- Ochtendgloren, Zachte golven, Bloementuin, Avondrood, Maanlicht en Noorderlicht: eigen kleuren, illustraties en muzikale thema's.
- Vaste tegels, vertakkingen, kringlopen en gepaarde lichtpoorten.
- Een deterministische dagpuzzel per lokale kalenderdatum en vrij spelen met een gekozen bordgrootte.
- Een groeiende lichttuin, maximaal 216 campagnelichtjes, lokale voortgang en hervatten van de huidige puzzel.
- Hints, ongedaan maken, herstartbevestiging, toetsenbordbediening, extra contrast en verminderde beweging.
- Originele procedurele Web Audio-muziek, reactieve geluidslagen en effecten voor draaien, bloemen, hints en afronden.
- Handgeschreven SVG-illustraties, een vectorlogo, eigen appiconen, een lichte papiertextuur en getekende confetti. Geen Unicode-emoji, stockillustraties, externe lettertypen of audiosamples.
- Delen na afronden, met native delen waar beschikbaar en een tekst/klembord-alternatief. Een daadwerkelijk gehoste game deelt ook de level- of dagpuzzellink.

## Spelregels

Een tik draait een beweegbare tegel 90 graden rechtsom. De zon is de lichtbron. Een verbinding geeft alleen licht door wanneer de aansluitingen op twee aangrenzende tegels op elkaar passen. Tegels met een klein ruitje staan vast. De twee zeshoekige lichtpoorten zijn met elkaar verbonden.

Een puzzel is opgelost wanneer **alle actieve tegels** met de lichtbron verbonden zijn en er **geen losse uiteinden** overblijven. Alleen de bloemen laten oplichten is dus niet altijd genoeg.

De eerste puzzel vraagt een enkele tik. Alle campagnelevels zijn vrij te kiezen; er is geen energievoorraad, tijdslimiet of betaalmuur.

Voor een opgeloste campagnepuzzel krijg je een, twee of drie lichtjes. Met een gebruikte hint krijg je een lichtje; zonder hint krijg je twee; zonder hint en binnen de weergegeven draaierichtlijn krijg je drie. De richtlijn komt uit een bekende constructieoplossing en is **geen bewezen globaal minimum**. Andere geldige oplossingen worden ook geaccepteerd. Ongedaan maken verlaagt de draaierteller. De beste score blijft bewaard.

Vrij spelen legt geen draaidoel op. De dagpuzzel is voor dezelfde kalenderdatum overal gelijk, maar spelers in verschillende tijdzones kunnen op een ander moment naar de volgende datum gaan. De dagpuzzelgeschiedenis bewaart maximaal de laatste 100 geladen resultaten.

## Bediening

Tik of klik om een tegel te draaien. Op het toetsenbord: Tab naar het bord, pijltjes om een tegel te kiezen, Enter of spatie om te draaien. Z maakt de vorige draai ongedaan, H geeft een hint, R opent herstartbevestiging en Escape opent instellingen. Systeemvoorkeur voor minder beweging wordt gerespecteerd.

Hints markeren een tegel; je blijft zelf draaien. Alleen de huidige puzzel kan worden hervat. Een andere puzzel beginnen vervangt deze hervatpositie, niet je behaalde scores.

## Opslag en privacy

De app zelf verstuurt geen spelgegevens en gebruikt geen analytics, advertenties of account. Voortgang en instellingen staan lokaal onder `luma.save.v1`. De code vangt geblokkeerde opslag op met een melding; spelen kan dan doorgaan zonder blijvende voortgang. Wissen van browserdata wist ook de scores. Er is geen cloudsynchronisatie of exportfunctie. Een hostingpartij kan uiteraard eigen serverlogs bijhouden.

## Broncode aanpassen

`src/engine.js`: puzzelgenerator, verbindingen en score.

`src/audio.js`: synthesizer, thema's en effecten.

`src/art.js`: logo, iconen, wereldillustraties en bloementuin.

`src/app.js`: schermen, bediening, opslag en toegankelijke labels.

`src/styles.css`: responsive ontwerp, kleuren, animaties en textuur.

`src/template.html`: documentstructuur.

`branding`: losse SVG-uitvoeringen van het logo, de hero-illustratie en zes wereldillustraties.

`icons/icon.svg`: het bewerkbare master-appicoon. De PNG-uitvoeringen zijn al meegeleverd; er zijn geen lettertypebestanden nodig.

Na broncodewijzigingen:

```sh
python3 build.py
```

Dit bouwt `index.html` in deze map en `Luma.html` in de bovenliggende map. Python gebruikt alleen zijn standaardbibliotheek; de uitvoer bevat geen externe runtime-afhankelijkheden.

## Tests

```sh
node tests/engine.test.cjs
node tests/service-worker.test.cjs
```

De browsertest gebruikt Python Playwright en Chromium:

```sh
python3 -m pip install playwright
python3 tests/browser.test.py
```

Pas de browserlocatie in de test aan wanneer Chromium niet op `/usr/bin/chromium` staat. De test bouwt niet automatisch: voer eerst `python3 build.py` uit. De test injecteert HTML en gebruikt een expliciete opslagadapter, omdat de beheerde testbrowser geen lokale bestands- of HTTP-navigatie toeliet. Zie QA.md voor de exacte testgrenzen. Geen van deze beperkingen vraagt een adapter of Playwright voor normale spelers.

## Vervolg voor een publieke release

De eerste release is functioneel, maar is nog geen bewezen consumentenhit. Doe fysiek testen op iPhone/Safari en Android, controleer installatie en offline hervatten op je eigen host, laat nieuwe spelers zonder hulp spelen en scherp daarna de moeilijkheidsopbouw aan. Een Apple Design Award of commerciële doorbraak wordt nergens gegarandeerd. De onderbouwing van de ontwerpkeuzes en een praktisch playtestplan staan in ONDERZOEK.md.
