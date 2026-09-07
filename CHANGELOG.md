# Luma 5.3.0

- Volledige visuele polish van openingsscherm, wereldkaart en speelinterface op basis van de mobiele game-layout die voor Luma is gekozen.
- Alle zes wereldillustraties opnieuw opgebouwd als samenhangende scenes met aparte portrait-composities voor het openingsscherm en de levelkaart; geen generieke opgeplakte route-elementen.
- Openingsscherm vereenvoudigd tot wereldscene, Luma-identiteit, voortgang en één dominante primaire speelactie.
- Verticale wereldkaart opnieuw vormgegeven met duidelijkere levelnummers, sterren, huidige stap, wereldtabs, routecontrast en compacte navigatie.
- Campagnevoortgang is legacy-safe: bestaande niet-aaneengesloten scores en een geldige hervatting sturen een bestaande speler niet terug naar level 1.
- Nieuwe levels blijven vanaf de verste legitieme campagnepositie sequentieel openen; voltooide levels blijven herspeelbaar.
- Speelbord gebruikt de bounding box van de werkelijk actieve tegels, waardoor kleine of onregelmatige puzzels geen enorme lege/donkere bordvlakken meer tonen.
- Opdracht, doelen en hulpmiddelen opnieuw geordend tot een compacte kaart-gebaseerde interface zonder brede iPad-zijbalk.
- Paden, markers en tegels verder aangescherpt met volledig dekkende kleuren, duidelijkere states en betere aansluiting.
- Responsive afmetingen en spacing voor iPhone portrait, iPad portrait en iPad landscape opnieuw afgestemd.
- Versie, manifest en scope-lokale serviceworker-cache naar 5.3.0.
- `luma.save.v1` en alle 72 bestaande campagne-layoutsignatures blijven ongewijzigd.

# Luma 5.2.0

- Campagne veranderd in een sequentiële levelreis: een volgend level opent nadat het huidige is voltooid; behaalde levels blijven herspeelbaar.
- Verticale levelkaart met route, huidige positie, sterren, wereldtabs en compacte navigatie.
- Openingsscherm met wereldillustratie en primaire actie naar de huidige route.
- Geen levens, valuta, energie, timers of winkelzijbalken toegevoegd.

# Luma 5.1.0

- Zes wereldillustraties en app-identiteit vernieuwd.
- Scope-lokale serviceworker-cache en bestaande opslag compatibel gehouden.

# Luma 5.0.0

- Nieuwe flat-designinterface, abstracte speelstukken en wereldcollectie.
- Enkelvoudige, ondoorzichtige lichtpaden met duidelijke bron, doelen, poorten en vaste punten.
