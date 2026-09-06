# Luma 4.1.0 - Publiceer met GitHub Actions

## Eerst dit: waarom /docs en root allebei misgingen

Bij controle van `lars-daarom/luma` op 6 september 2026 gaf de inhoud van de standaardbranch `main` een lege lijst terug. De laatste commit heette `new version` (34463d08ee9eabbfbdec8fc8d5683ce47101db67). Er was dus geen `docs/index.html`, maar ook geen `index.html` in de hoofdmap. Een Pages-instelling alleen kan ontbrekende bestanden niet herstellen.

Deze bundel gebruikt bewust maar EEN appstructuur. Geen tweede `docs`-kopie, geen Jekyll, geen Sass-build. Een echte workflow controleert de bestanden, zet de app direct in de hoofdmap van het publicatie-artefact en publiceert dat.

## 1. Zet Pages eerst op GitHub Actions

Open de repository. Ga naar **Settings > Pages > Build and deployment > Source** en kies **GitHub Actions**.

Kies niet `Deploy from a branch`, `/docs` of `/(root)`. Maak ook geen extra workflow aan met een voorgesteld Jekyll-template: deze ZIP heeft al de juiste workflow.

## 2. Upload de uitgepakte INHOUD naar main

Pak de ZIP uit. Upload de bestanden en mappen BINNEN de uitgepakte map naar de hoofdmap van je bestaande repository. Upload niet het ZIP-bestand en ook niet een overkoepelende map `Luma-4.1-GitHub-Pages`.

Gebruik **Add file > Upload files** en commit de upload naar **main**. Wis de repository niet eerst. Upload alle onderdelen, waaronder `assets`, `icons`, `scripts`, `tests`, `release.json` en de verborgen map `.github`.

Deze twee paden moeten na het committen echt te openen zijn op de Code-tab:

```
index.html
.github/workflows/pages.yml
```

De hele structuur hoort zo te beginnen:

```
.github/
  workflows/
    pages.yml
assets/
  app.css
  app.js
  worlds.js
  paper.png
icons/
scripts/
tests/
branding/
index.html
controle.html
manifest.webmanifest
release.json
sw.js
START-HIER.md
```

### De verborgen .github-map ontbreekt in je upload

Controleer eerst of je bestandsbeheer verborgen bestanden toont. Je kunt de workflow ook via GitHub zelf toevoegen: **Add file > Create new file**. Vul als volledige bestandsnaam exact `.github/workflows/pages.yml` in. Plak de inhoud van het gelijknamige bestand uit deze ZIP en commit naar main. De volledige workflow staat ook onderaan deze handleiding.

Alleen een `pages.yml` in de hoofdmap of in `deployment/` is GEEN actieve workflow.

## 3. Controleer de publicatie

Open de tab **Actions**. De workflow heet **Publiceer Luma**. Na de commit start die automatisch. Start hem anders via **Run workflow**, branch **main**.

Wacht op een volledig groene run, inclusief de stap **Publiceer webapp**. Open daarna het adres dat GitHub onder Settings > Pages toont. Voor deze repository is dat normaal:

https://lars-daarom.github.io/luma/

De controlepagina staat dan op:

https://lars-daarom.github.io/luma/controle.html

Klik op **Controleer publicatie**. De controle vergelijkt de inhoud van 13 appbestanden met de SHA-256-waarden van release 4.1.0. Een ontbrekend bestand of een oude versie krijgt een duidelijke melding. De controle gebruikt de netwerkbestanden en verandert geen opgeslagen voortgang.

In de app staat bij **Instellingen > Over Luma** versie **4.1.0**.

## Nog een fout?

- **Er staat nog Jekyll of /github/workspace/docs in de nieuwe log:** de oude publicatieroute loopt nog. Controleer Source = GitHub Actions en open de nieuwste run van **Publiceer Luma**, niet een oude mislukte run.
- **Publiceer Luma staat niet bij Actions:** `.github/workflows/pages.yml` is niet op main gecommit, staat op een ander pad, of Actions is uitgeschakeld.
- **Een bestand ontbreekt / heeft de verkeerde versie:** upload dat bestand opnieuw vanuit dezelfde uitgepakte ZIP. De integriteitscontrole stopt bewust voordat een onvolledige release wordt gepubliceerd.
- **404 voordat er een groene run is:** de app is nog niet succesvol gepubliceerd. Een nieuwe browsercache maakt dat niet goed.
- **Groene run maar toch 404:** open de URL van de deployment in GitHub zelf. Controleer eventueel een afwijkend custom domain, repositorynaam en Pages-instellingen. De ZIP wijzigt deze instellingen niet.
- **De app toont een oude versie:** sluit open Luma-tabs, open het gepubliceerde adres opnieuw en herlaad. Controleer ook `controle.html`. Wis geen websitegegevens: daarin kan je voortgang staan. Verwijder geen lokale opslag om een serverfout op te lossen.

## Voor ontwikkelaars

Node.js is alleen nodig voor validatie/publicatie; de webapp zelf draait zonder buildstap of externe bibliotheken.

```
node --test tests/*.test.cjs
node scripts/prepare-pages.mjs
```

Na bewuste wijzigingen aan runtimebestanden moet ook de integriteitscatalogus opnieuw worden gemaakt:

```
node scripts/update-release.mjs
node scripts/prepare-pages.mjs
```

Commit gewijzigde appbestanden en `release.json` samen. Publiceer niet blind door de controle te verwijderen.

De map `_site` wordt lokaal en in Actions gegenereerd. Je hoeft die niet te uploaden. De workflow publiceert alleen de runtimebestanden, niet de bronhandleidingen, testfixtures of brandingexports.

## Bronnen

GitHub: publicatiebron kiezen
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub: custom workflow, artefact en Pages-permissies
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Volledige workflow voor handmatig toevoegen

Maak dit bestand op: `.github/workflows/pages.yml`.

```yaml
# Put this file at .github/workflows/pages.yml in the repository, not in docs/.
# Settings > Pages > Source must be GitHub Actions.
name: Publiceer Luma
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: luma-github-pages
  cancel-in-progress: false
jobs:
  publish:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 10
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Haal de bestanden van main op
        uses: actions/checkout@v6
      - name: Controleer release en maak publicatiemap
        run: node scripts/prepare-pages.mjs
      - name: Controleer JavaScript en regressies
        run: |
          node --check assets/app.js
          node --check assets/worlds.js
          node --check sw.js
          node --test tests/*.test.cjs
      - name: Configureer GitHub Pages
        uses: actions/configure-pages@v5
      - name: Upload uitsluitend de webapp
        uses: actions/upload-pages-artifact@v4
        with:
          path: _site
      - name: Publiceer webapp
        id: deployment
        uses: actions/deploy-pages@v4

```
