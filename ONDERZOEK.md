# Luma: onderzoek en ontwerpkeuzes

6 september 2026. Dit document maakt onderscheid tussen academisch onderzoek, terugblikken van makers en de ontwerpkeuzes voor deze game. Geen van de bronnen bewijst een formule voor een App Store-hit. Luma zelf heeft nog geen consumentenonderzoek, retentiemeting of onafhankelijke designbeoordeling ondergaan.

## 1. Wat de vroege mobiele ervaring bijzonder maakte

Apple beschrijft in zijn terugblik op de eerste tien App Store-jaren hoe Multi-Touch en onderweg kunnen spelen gaming toegankelijker maakten. Het noemt onder andere Angry Birds, Super Monkey Ball en Temple Run, en bevat het perspectief van Nintendo op bediening met een hand. Dit is een historische, promotionele terugblik van het platform, geen gecontroleerd onderzoek naar de oorzaken van verkoopsucces.

**Vertaling naar Luma:** geen virtuele joystick of handleiding vooraf. De hele kernhandeling is een tik op een tegel. De eerste puzzel is met een enkele tik opgelost. De game begint zonder account. Acties geven direct visuele en auditieve feedback.

Bron: Apple, *The App Store turns 10* (2018), onderdelen I en III.
https://www.apple.com/newsroom/2018/07/app-store-turns-10/

## 2. Competentie en autonomie boven opgelegde druk

Ryan, Rigby en Przybylski onderzochten in vier studies de motivatie om games te spelen. Ervaren competentie en autonomie hangen in hun onderzoek samen met plezier en voorkeur voor games. Ook intuïtieve bediening en ervaren onderdompeling komen terug. Dat is geen specifiek onderzoek naar moderne mobiele puzzelgames en geen bewijs dat een bepaalde knop retentie veroorzaakt.

**Vertaling naar Luma:** een rustige introductie, meteen kunnen zien welk pad licht krijgt, ongedaan maken, een gerichte hint en vrije levelkeuze. De campagne heeft een optionele draaierichtlijn. In vrij spelen verdwijnt die scoreprikkel. Er zijn geen levens, wachttijden of verplicht te onderhouden streaks.

Bron: Ryan, R. M., Rigby, C. S., & Przybylski, A. (2006). *The Motivational Pull of Video Games: A Self-Determination Theory Approach*. Motivation and Emotion, 30, 344-360. DOI: 10.1007/s11031-006-9051-8.
https://link.springer.com/article/10.1007/s11031-006-9051-8

Open auteurskopie van het artikel:
https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf

## 3. Een duidelijke lus van doel, actie en feedback

Sweetser en Wyeth bundelen in GameFlow factoren voor spelplezier, waaronder duidelijke doelen, feedback, controle en een passende verhouding tussen uitdaging en vaardigheden. Het is een ontwerpkader, in het oorspronkelijke artikel toegepast op twee strategiespellen; het is geen gevalideerde omzetvoorspeller voor een mobiele game.

**Vertaling naar Luma:** een zichtbaar doel, een eenvoudige handeling en onmiddellijke feedback. Donkere paden worden gekleurd, aangesloten bloemen openen en de muziek krijgt meer leven. Grotere borden, vaste tegels, vertakkingen en lichtpoorten geven nieuwe variatie zonder de basisbediening te veranderen. De generator garandeert een bekende oplossing. De feitelijke moeilijkheid voor mensen is nog niet gemeten.

Bron: Sweetser, P., & Wyeth, P. (2005). *GameFlow: A Model for Evaluating Player Enjoyment in Games*. Computers in Entertainment, 3(3). DOI: 10.1145/1077246.1077253. Gelezen via de beschikbare artikelweergave:
https://www.academia.edu/36679492/GameFlow_A_Model_for_Evaluating_Player_Enjoyment_in_Games

## 4. Een samenhangende wereld in plaats van meer functies

De makers van Monument Valley beschrijven toegankelijkheid, verwondering, afwezigheid van grind en een afgeronde mobiele ervaring als belangrijke ontwerpkeuzes. In de beschrijving van Ken Wongs GDC-sessie ligt het accent op een mooie ervaring, niet op het opstapelen van spelregels. Monument Valley verscheen later dan de eerste App Store-generatie; het is hier bewust een aanvullende kwaliteitsreferentie, geen lanceertitel uit 2008. Van de GDC-bron is de sessiebeschrijving geraadpleegd, niet beweerd dat de volledige video is bekeken.

**Vertaling naar Luma:** een eigen bloemvormig merkteken, afgeronde geometrische illustraties, zes samenhangende kleurwerelden, subtiele papiertextuur en een lichttuin die je echte voortgang toont. De soundtrack is zelf geprogrammeerd en wordt lokaal gesynthetiseerd. Geen externe muziekfragmenten, stockillustraties of emoji. Anders dan Monument Valley bevat Luma wel een optionele lichtjesscore en vrij spelen; het is geen kopie van dat spel.

Bronnen: ustwo, *Monument Valley*, projectbeschrijving; Ken Wong, *Designing Monument Valley: Less Game, More Experience*, GDC 2015, sessiebeschrijving.
https://ustwo.com/work/monument-valley/
https://www.gdcvault.com/play/1021380/

## 5. De mobiele bediening is onderdeel van het ontwerp

Apple's developersessie *Make your game great with touch* behandelt onder andere flexibele lay-outs, directe bediening en duidelijke visuele reacties op aanraking. Dit is platformadvies, geen bewijs van commerciële impact.

**Vertaling naar Luma:** grote tikdoelen, direct zichtbare gedrukt-states, een mobiele navigatie onderaan en geen hover-afhankelijke kernacties. Tegels blijven in de geteste smalle telefoonformaten minimaal 44 CSS-pixels breed, ook op een 6x6-bord. Op lage schermen krijgt scrollen voorrang boven te kleine tegels. De visuele status wordt ook in toegankelijke labels beschreven. Een volledige screenreader-audit ontbreekt nog.

Bron: Apple Developer, *Make your game great with touch*, WWDC 2026.
https://developer.apple.com/videos/play/wwdc2026/358/

## 6. Terugkomen omdat het fijn is

De dagpuzzel en het groeiende tuinoverzicht zijn ontwerpvoorstellen om een lichte, vrijwillige reden tot terugkomen te geven. Dit effect is niet gemeten. Er worden geen notificaties verstuurd en een gemiste dag kost geen punten. Er is geen fictief spelersaantal, geen nep-ranglijst en geen claim dat andere mensen deze game al massaal spelen.

De campagne heeft 72 vaste, deterministisch gegenereerde puzzels; de eerste drie zijn handmatig opgebouwd. De overige campagnelevels zijn niet stuk voor stuk door menselijke puzzelontwerpers op moeilijkheid gerangschikt. Een constructieoplossing, technische tests en automatische browserdoorloop vervangen geen playtest.

## Praktisch playtestplan voor de volgende iteratie

**Eerst begrijpen.** Laat vijf tot tien mensen die de game niet kennen op hun eigen telefoon beginnen. Geef geen uitleg. Observeer de eerste tik, het oplossen van de eerste puzzel, de betekenis van een vaste tegel en de lichtpoorten. Noteer waar ze aarzelen en wat zij denken dat het doel is. Kleine aantallen zijn bedoeld voor probleemontdekking, niet voor statistische uitspraken over de markt.

**Dan het plezier.** Vraag na een korte sessie waar het bevredigend werd, waar het repetitief werd, welke wereld zij onthouden en of zij zelf nog een puzzel openen. Laat muziek aan/uit en de scoreprikkel bespreken. Leg geen positieve antwoorden in de mond.

**Daarna terugkeer.** Meet bij een vrijwillige testgroep daadwerkelijke terugkeer op een volgende dag en na een week. Vergelijk dat met hun uitspraken na de eerste sessie. Er zijn nu geen gemeten retentiecijfers. Analytics en een onderzoeksbackend zijn niet in deze build opgenomen.

**Beslis op gedrag.** Vereenvoudig onbegrepen signalen, vervang repetitieve levels en pas de generator of levelvolgorde aan op geobserveerde moeilijkheid. Beoordeel een eventuele commerciële release pas daarna. Designprijzen en hitstatus zijn uitkomsten, geen specificaties die met code alleen kunnen worden gegarandeerd.

## Technische documentatie

Voor de platformafhankelijke implementatie zijn ook de officiële browserdocumentaties geraadpleegd. Een HTTPS-context is relevant voor serviceworkers; geluid vraagt rekening houden met browserbeleid voor autoplay.

MDN, *Using Service Workers*:
https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

MDN, *Autoplay guide for media and Web Audio APIs*:
https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
