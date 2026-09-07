# Luma 5.2.0

- Campagne is nu een sequentiële reis: voltooi het huidige level voordat het volgende opent.
- Eerder behaalde levels blijven opnieuw speelbaar; bestaande `luma.save.v1`-voortgang wordt niet gereset.
- Nieuwe verticale levelkaart per wereld met doorlopende route, huidige marker, sterren en duidelijk vergrendelde toekomstige levels.
- Nieuwe werelden openen op de route in plaats van dat alle 72 levels direct vrij te kiezen zijn.
- Rechtstreekse links naar nog vergrendelde campagnelevels worden geblokkeerd voordat het level wordt gestart.
- Openingsscherm opnieuw opgebouwd als schermvullende wereldscène met één grote primaire actie en toegang tot de kaart.
- Speelscherm compacter gemaakt: opdrachtpaneel boven het bord, gecentreerd speelveld en hulpmiddelen onder het bord; brede zijpaneel-presentatie verwijderd.
- Geen levens, valuta, energie, winkelzijbalk of wachttimers toegevoegd.
- Bestaande zes wereldillustraties, app-identiteit, 72 puzzelindelingen, dagpuzzel, vrij spel, muziek en effecten behouden.
- Nieuwe `journey.js`/`journey.css`-laag, 5.2 offline-cache en regressietests voor level- en wereldontgrendeling.

## Eerdere releases

# Luma 5.1.0

- Zes wereldillustraties opnieuw opgebouwd als samenhangende SVG-taferelen.
- Beeldmerk, logo en appicoon vernieuwd rond één Luma-lichtlus.
- Nieuwe atlas-artlaag en 5.1 offline-cache; bestaande puzzelindelingen en opslag bleven intact.

# Luma 5.0.0

- Volledig nieuwe flat-designinterface en abstract appicoon.
- Mascottes uit de actieve app; tuin vervangen door een wereldcollectie.
- Enkelvoudige, ondoorzichtige lichtpaden; duidelijke bron, doelen, poorten en vaste punten.
- Nieuwe wereldkaarten, levelselectie, mobiele navigatie en iPad-zijbediening.
- Werkende gerichte Vonk naast Hint en Terug, met eerlijke scoring.
- Originele 72 layouts en luma.save.v1 behouden; beschadigde hervatdata worden veilig afgewezen.
- Doorgaan blijft bereikbaar na sluiten van een succesvenster.
- Geversioneerde offlinebestanden, nieuwe iconen en leesbare publicatiecontrole.
- Bestaande Pages-rootpublicatie behouden; .nojekyll en afzonderlijke read-only CI toegevoegd.

# 4.1.0

- Echte workflow in `.github/workflows/pages.yml`, in plaats van alleen een optioneel voorbeeld elders.
- Eenduidige rootbron en een schoon statisch publicatie-artefact; dubbele docs-kopie verwijderd.
- Preflight stopt bij ontbrekende of gemengde runtimebestanden. Online controlepagina vergelijkt SHA-256-waarden.
- Diagnostiek gaat niet via het offline app-shell-cachepad.
- Zeven simpele botanische bordvormen vervangen de volledige karakters op het bord.
- Dekkende doorlopende pijpgeometrie, subtiele volle inleg en een kleine aansluitmarge voorkomen zichtbare alpha-overlap en haarlijnen.
- Afgeronde levelkaarten vervangen ronde levelmarkers. Nummer en voltooiingsstatus blijven leesbaar.
- Appicoon, bloemrozet, hoofdstukiconen en symbolen delen dezelfde vormbasis.
- Campagnegenerator, 72 level-layouts en lokale opslag blijven compatibel.
