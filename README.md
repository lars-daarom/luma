# Luma 4.1.0

Een kleine draai. Een wereld die opbloeit.

Een volledige Nederlandse HTML5-puzzelgame met 72 campagnelevels, zes werelden, zeven plantenvrienden, een dagpuzzel, vrij spelen, een groeiende tuin, procedurele muziek en geluidseffecten.

**Online zetten? Begin bij START-HIER.md.** Deze release gebruikt GitHub Actions, met de app in de hoofdmap van het uiteindelijke publicatie-artefact. Er is geen docs-kopie en er wordt geen Jekyll gestart.

## Wat is nieuw?

De karakters houden hun persoonlijkheid in de illustraties en tuin. Op het bord zijn het nu zeven herkenbare botanische symbolen zonder gezichten of lijfjes. Hun silhouetten keren terug in de hoofdstukiconen. De bron heeft een klein lichtzaadje, zodat de spelrol herkenbaar blijft.

De paadjes hebben een volledig dekkende basis en een dekkende lichte inleg. Elke pijp bestaat uit een doorlopende SVG-path per verflaag; ook de T-splitsingen. De rotatie wordt begrensd binnen de tegel en een kleine dekkende aansluitmarge voorkomt haarlijntjes aan tegelranden. Inactief betekent nu een rustigere volle kleur, niet transparantie.

De levelselectie bestaat uit afgeronde rechthoekige kaarten. Voltooide levels houden hun nummer; de aanbevolen tegel heeft een volle achtergrond en een duidelijke status. Een hervat level heeft voorrang binnen de geselecteerde wereld.

Het appicoon is opnieuw gecomponeerd rond het gezicht en een enkel bloem-silhouet. Geen volledig landschap op 60 pixels. De bloemblaadjes delen dezelfde vormbasis met de illustraties en de spelbron.

## Bestanden

- `assets/app.js`: oorspronkelijke puzzelgenerator, audio, besturing, schermen en lokale voortgang.
- `assets/worlds.js`: plantenvrienden, omgevingen, vectorillustraties, botanische symbolen en het appicoon.
- `assets/app.css`: responsieve iPhone/iPad-interface en dekkende bordweergave.
- `sw.js`, `manifest.webmanifest`: installatie- en offline-ondersteuning.
- `controle.html`, `release.json`: online controle van de gepubliceerde bestanden.
- `.github/workflows/pages.yml`, `scripts/prepare-pages.mjs`: echte statische Pages-deployment met voorafgaande controles.
- `branding/`: de eigen SVG-karakters, symbolen en een 1024px appicoon.
- `tests/`: reproduceerbare logica-, publicatie- en UI-tests.
- `QA.md`: uitgevoerde controles, uitslagen en expliciete beperkingen.

Geen externe runtime-afhankelijkheden, trackers of lettertypedownloads. Alle interface-iconen zijn vectoren, geen Unicode-emoji. De beweging kan worden verminderd en geluid kan apart worden uitgezet.

## Voortgang

De opslagcode en sleutel `luma.save.v1` zijn behouden. Alle 72 campagnepuzzels behouden hun oorspronkelijke signatures. Gebruik dezelfde origin en projectroute om eerder opgeslagen voortgang te behouden. Andere browsers, privevensters, domeinen en verwijderde websitegegevens hebben niet automatisch dezelfde opslag. De export/import-functie blijft beschikbaar.

## Technische controle

```
node --test tests/*.test.cjs
node scripts/prepare-pages.mjs
python tests/http-qa.py
```

De optionele Python-browsertests gebruiken Playwright en Chromium. In deze leveringsomgeving is URL-navigatie beperkt. De tests injecteren daarom de daadwerkelijke productieassets in een document en gebruiken expliciet een testopslag-adapter. Die adapter staat NIET in de app of in het gepubliceerde artefact. Lees QA.md voordat je de uitslagen als volledige apparaattests interpreteert.

```
python tests/browser-qa.py
python tests/features-qa.py
python tests/visual-qa.py
```
