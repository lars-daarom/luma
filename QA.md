# Luma 5.0 - testverslag

## Uitgevoerde controles tijdens ontwikkeling

De nieuwe interface is lokaal in Chromium gecontroleerd. 72 campagnepuzzels zijn via DOM-clicks op de speelstukken opgelost; de oplossingsrichting kwam uit de bekende generatoroplossing. Dit is een functionele regressietest, geen menselijke moeilijkheidstest.

81 scherm-/formaatcombinaties zijn gecontroleerd: home, werelden, collectie en een level uit elk van de zes werelden, op 320x568, 375x667, 390x844, 430x932, 768x1024, 834x1194, 1024x768, 1194x834 en 1366x1024. In deze controles waren er geen horizontale overflows en geen zichtbare knoppen onder 44x44 CSS-pixels (afrondingstolerantie 0,1 px).

Acht aanvullende controles dekten draaien/undo, hint plus gerichte Vonk plus undo, contrast en verminderde beweging, hervatten van versie-1-opslag, vervangingsbevestiging bij dagpuzzels, vrij spel op 6x6, beschadigde hervatdata zonder verlies van voltooide levels, en doorgaan na sluiten van het succesvenster. Geen ongehanteerde JavaScript-fouten gemeld in die run.

Deze lokale browsercontrole gebruikte expliciete testopslag in het geheugen en een history-adapter; de scripts en CSS werden in de browser geinjecteerd. Dit verifieert dus geen werkelijk netwerkverkeer, browser-back-stack, fysieke apparaatopslag of PWA-installatie. Schermbeelden zijn na de intreeanimatie beoordeeld.

## Reproduceerbare Node-controles

`node --test tests/*.test.cjs` omvat 25 tests: oorspronkelijke engine/art-regressies, de releasecatalogus, ontbrekende en gemengde bestanden, relatief Pages-pad, worker-cache-isolatie en de nieuwe studio-vormgeving. De nieuwe generatietest controleert 677 gevallen: 72 campagnelevels, 240 vrije puzzels en 365 dagpuzzels. Alle 72 campagne-indelingen komen exact overeen met de eerdere versies.

De Node-workercontrole is een simulatie van caches en fetch. Het is geen offline browsertest. Oude arttests blijven alleen als regressiereferentie draaien; ze bewijzen niet dat de nieuwe interface die oude mascottes gebruikt.

De workflow Controleer Luma voert de Node-controles uit op de daadwerkelijk gecommitte bestanden en maakt het geverifieerde artifact. De status bij de commit in GitHub is de bron voor het uiteindelijke CI-resultaat.

## Nog niet geverifieerd

Fysieke iPhone/iPad, Safari-balkkleuren, echte beginscherminstallatie, upgrades vanuit elke oude serviceworker, werkelijk offline hervatten en screenreader-gebruik op iOS moeten op apparaten worden nagekeken. Muziek en effecten zijn uit de vorige versie behouden; deze release bevat geen nieuwe meting van het daadwerkelijke audiosignaal.

De live Pages-deployment staat los van deze ontwikkeltests. Controleer de publicatierun bij de merge en gebruik controle.html voor de online bestanden. Geen award-, populariteits- of retentieclaim.
