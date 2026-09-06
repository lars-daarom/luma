# Luma: kwaliteitscontrole

Build 1.0, 6 september 2026.

## Geslaagde technische tests

**1.157 puzzels gecontroleerd met de pure game-engine.** Dit zijn alle 72 campagnelevels, 365 dagpuzzels uit 2026 en 720 vrije puzzels: zes werelden, vier bordgroottes en dertig seeds per combinatie. De tests controleren de bekende oplossing, een onopgeloste start, determinisme van de campagne, ten minste een bloem, vaste tegels, positieve draaierichtlijn en een geldige poortconfiguratie. Ook rotatie, score en ongeldige input zijn getest.

**Alle 72 campagnelevels via de browserinterface voltooid.** De test berekent benodigde draaien met de engine en activeert de echte tegelknoppen via DOM-click-events. Dit verifieert de inputverwerking, levelafronding en voortgang tot 72/72 en 216 lichtjes. Dit is geen menselijke playtest en bewijst niet dat iedere puzzel leuk of even moeilijk is.

**De introductie met een echte Playwright-pointerklik doorlopen.** De eerste puzzel wordt met een klik opgelost en de drie lichtjes worden geregistreerd. Extra bedieningstests omvatten draaien, ongedaan maken, hint, hervatten, herstart annuleren/bevestigen en toetsenbordbediening met Enter, Z en pijltjes.

**Web Audio technisch gecontroleerd.** De context draait, er worden oscillatoren aangemaakt en de gemeten audiogolf is niet nul. Dit bevestigt werkende audio-uitvoer in Chromium, niet een luistertest op telefoonspeakers of alle autoplay-situaties in Safari.

**Dagpuzzel en vrij spelen gecontroleerd.** Een dagpuzzel kan worden opgelost en opgeslagen. In vrij spelen werkt formaatkeuze 6x6, oplossen en doorgaan met een nieuwe seed.

**Alle vijf instellingen getest.** Muziek, geluidseffecten, verminderde beweging, extra contrast en haptiek wijzigen de opgeslagen voorkeur. De test verifieert de haptiekinstelling, niet fysieke trillingen.

**Vijf schermformaten gecontroleerd:** 320x568, 390x844, 768x1024, 844x390 liggend en 1440x1050. Geen horizontale pagina-overflow in de geteste schermen. Tegels op de smalle 6x6-telefoonborden blijven minimaal 44 CSS-pixels breed. De mobiele ondernavigatie is apart gecontroleerd op plaatsing aan de onderrand van het venster.

**Geen ongehanteerde JavaScript-fouten in de browsertest.** Het gedetailleerde resultaat staat in `tests/browser-results.json`.

**Serviceworker op unitniveau getest.** Met Cache/Fetch API-adapters zijn installatie, opschonen van alleen de eigen cacheversie, ophalen en bewaren van de nieuwste shell, offline terugval, gecachete assets en het negeren van niet-relevante verzoeken gecontroleerd.

**Visuele inspectie.** Desktop- en mobiele start- en spelschermen zijn gerenderd. Gevonden problemen met een getransformeerde voorouder van de vaste navigatie en overlap tussen illustratie en introductietekst zijn gecorrigeerd en opnieuw getest. De voorbeeldafbeeldingen zijn echte renders van deze build, geen apart ontworpen mock-ups.

## Wat deze tests niet dekken

De beheerde Chromium-testomgeving blokkeert directe navigatie naar lokale HTTP- en bestandsadressen. Daarom is de gebouwde HTML via Playwright `set_content` geinjecteerd. Voor opslag is een expliciete Storage API-adapter gebruikt. De save/restore-logica is getest, maar niet de duurzaamheid van opslag op een echte browserorigin.

Er is nog geen fysieke iPhone/Safari- of Android-test, geen werkelijke PWA-installatie op een telefoon, geen echte HTTPS-offline-navigatietest en geen hardwaretest van delen of haptiek. De code daarvoor is aanwezig, maar deze onderdelen moeten op de gekozen host en echte apparaten worden geverifieerd. Native delen heeft een tekstalternatief. De game is niet door deze oplevering publiek gehost.

Er is geen volledige screenreader-, kleurcontrast-, performance- of batterij-audit uitgevoerd. De testomgeving zegt niets over oudere of tragere telefoons. Er is geen gemeten retentie, sessieduur, voorkeur of marktsucces. De overige campagnelevels zijn deterministisch gegenereerd en technisch gecontroleerd, niet op basis van een grote gebruikersstudie op moeilijkheid gecureerd.

## Releasecontrole op echte apparaten

Publiceer de webapp op de beoogde HTTPS-locatie. Test daarna de eerste tik met geluid, dempen en hervatten na vergrendeling; sluit de browser en controleer voortgang; installeer op het beginscherm; open na een eerste online laadbeurt opnieuw in vliegtuigstand; test de 6x6-puzzels in portret en landschap; controleer grotere systeemtekst, VoiceOver/TalkBack, native delen en herstartbevestiging. Laat pas daarna nieuwe spelers de campagne beoordelen.
