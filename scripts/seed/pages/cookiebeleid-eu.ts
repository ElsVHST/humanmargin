/**
 * PageSeed: cookiebeleid-eu — de volledige juridische cookieverklaring van
 * humanmargin.eu/cookiebeleid-eu/ (Complianz-document).
 * Eén content-block: koppen als bold-paragrafen, tekst en cookie-overzicht
 * als lopende richText (het content-block heeft alleen een richText-veld).
 */
import { FORMAT_BOLD, FORMAT_ITALIC, link, paragraph, richText, text } from "../lexical";
import { type PageSeed } from "../media-map";

/** Kop als vetgedrukte paragraaf (het content-block kent geen kopveld). */
const heading = (t: string) => paragraph([text(t, FORMAT_BOLD)]);

const body = richText([
  paragraph([
    text(
      "Dit cookiebeleid is voor het laatst geüpdatet op 11 juni 2026 en is van toepassing op burgers en wettelijke permanente inwoners van de Europese Economische Ruimte en Zwitserland.",
      FORMAT_ITALIC,
    ),
  ]),

  heading("1. Introductie"),
  paragraph([
    text("Op onze site, "),
    link("https://humanmargin.eu", "https://humanmargin.eu"),
    text(
      " (hierna: “de site”) wordt gebruikgemaakt van cookies en andere aanverwante technieken. (Hierna geldt dat alle technieken voor het gemak “cookies” worden genoemd). Ook via derden die door ons zijn ingeschakeld, worden cookies geplaatst. In het onderstaande document informeren wij je over het gebruik van cookies op onze site.",
    ),
  ]),

  heading("2. Wat zijn cookies?"),
  "Een cookie is een klein eenvoudig bestand dat samen met pagina's van deze site wordt verzonden en door je browser op de harde schijf van je computer of ander apparaat wordt opgeslagen. De daarin opgeslagen informatie kan tijdens een volgend bezoek terug worden gestuurd naar onze servers of naar de servers van de betreffende derde partijen.",

  heading("3. Wat zijn scripts?"),
  "Een script is een stukje programmacode dat wordt gebruikt om onze site goed te laten functioneren en interactief te maken. Deze code wordt uitgevoerd op onze server, of op je apparatuur.",

  heading("4. Wat is een web beacon?"),
  "Een web beacon (ook pixel tag) is een klein, onzichtbaar stukje tekst of afbeelding op een site dat gebruikt wordt om verkeer op een site in kaart te brengen. Om dit te doen worden er met behulp van web beacons verschillende gegevens van je opgeslagen.",

  heading("5. Cookies"),
  heading("5.1 Technische of functionele cookies"),
  "Sommige cookies zorgen ervoor dat bepaalde onderdelen van de site goed werken en dat je gebruikers voorkeuren bekend blijven. Door het plaatsen van functionele cookies zorgen wij ervoor dat je onze site makkelijker kunt bezoeken. Op deze manier hoef je bijvoorbeeld niet steeds opnieuw dezelfde informatie in te voeren bij een bezoek aan onze site en is het onder andere mogelijk dat de items in je winkelwagen bewaard blijven tot dat je hebt afgerekend. Deze cookies mogen wij plaatsen zonder dat je hier toestemming voor geeft.",
  heading("5.2 Statistieken cookies"),
  "Wij gebruiken statistieken cookies om de beleving voor onze gebruikers te optimaliseren. Wij krijgen door middel van statistieken cookies inzicht in het gebruik van onze site. Wij vragen je toestemming om statistieken cookies te plaatsen.",
  heading("5.3 Marketing/Tracking cookies"),
  "Marketing/tracking cookies zijn cookies of enige andere vorm van lokale opslag, die worden gebruikt om gebruikersprofielen te maken met het doel om advertenties te tonen of om de gebruiker te volgen op deze of verschillende sites voor soortgelijke marketingdoeleinden.",

  heading("6. Geplaatste cookies"),
  heading("Elementor — Statistieken (anoniem)"),
  "Delen van gegevens: Deze data wordt niet gedeeld met derde partijen.",
  "elementor — permanent — Volgen van acties door gebruikers op een webpagina.",

  heading("WordPress — Functioneel"),
  "Delen van gegevens: Deze data wordt niet gedeeld met derde partijen.",
  "wpEmojiSettingsSupports — sessie — Opslaan van browserspecificaties.",

  heading("Complianz — Functioneel"),
  paragraph([
    text(
      "Delen van gegevens: Deze data wordt niet gedeeld met derde partijen. Voor meer informatie, lees de ",
    ),
    link("Complianz Privacyverklaring", "https://complianz.io/legal/privacy-statement/", true),
    text("."),
  ]),
  "cmplz_functional — 365 dagen — Opslaan van cookie voorkeuren.",
  "cmplz_statistics — 365 dagen — Opslaan van cookie voorkeuren.",
  "cmplz_preferences — 365 dagen — Opslaan van cookie voorkeuren.",
  "cmplz_marketing — 365 dagen — Opslaan van cookie voorkeuren.",

  heading("Diversen — Doel wordt onderzocht"),
  "Delen van gegevens: Het delen van gegevens is in afwachting van onderzoek.",
  "wp-settings-time-1, elementor-global-variables, elementor_sidebar_menu_expanded_v2_elementor-custom-elements, calendly-internal-store, e_kit-elements-defaults, *_state, elementor-global-variables-watermark, calendly-store, elementor-global-classes, elementor_sidebar_menu_expanded_v2_elementor-system, wp-settings-time-2, wp-settings-2, e_my_templates_source, __mp_opt_in_out_*, elementor_sidebar_menu_expanded_v2_elementor-templates.",

  heading("7. Toestemming"),
  "Wanneer je onze site voor het eerst bezoekt, tonen wij een pop-up met uitleg over cookies. Zodra je klikt op ‘Voorkeuren opslaan’ geef je ons toestemming om de categorieën cookies en plugins te gebruiken die je hebt geselecteerd in de pop-up en welke zijn omschreven in het cookiebeleid. Je kunt via je browser het plaatsen van cookies uitschakelen, je moet er dan wel rekening mee houden dat onze site dan mogelijk niet meer optimaal werkt.",
  heading("7.1 Beheer je cookie toestemming"),
  heading("Functioneel — Altijd actief"),
  "De technische opslag of toegang is strikt noodzakelijk voor het legitieme doel het gebruik mogelijk te maken van een specifieke dienst waarom de abonnee of gebruiker uitdrukkelijk heeft gevraagd, of met als enig doel de uitvoering van de transmissie van een communicatie over een elektronisch communicatienetwerk.",
  heading("Voorkeuren"),
  "De technische opslag of toegang is noodzakelijk voor het legitieme doel voorkeuren op te slaan die niet door de abonnee of gebruiker zijn aangevraagd.",
  heading("Statistieken"),
  "De technische opslag of toegang die uitsluitend voor statistische doeleinden wordt gebruikt. De technische opslag of toegang die uitsluitend wordt gebruikt voor anonieme statistische doeleinden. Zonder dagvaarding, vrijwillige naleving door je Internet Service Provider, of aanvullende gegevens van een derde partij, kan informatie die alleen voor dit doel wordt opgeslagen of opgehaald gewoonlijk niet worden gebruikt om je te identificeren.",
  heading("Marketing"),
  "De technische opslag of toegang is nodig om gebruikersprofielen op te stellen voor het verzenden van reclame, of om de gebruiker op een site of over verschillende sites te volgen voor soortgelijke marketingdoeleinden.",

  heading("8. Cookies in-/uitschakelen en verwijderen"),
  "Je kunt je internet browser gebruiken om cookies automatisch of handmatig te verwijderen. Je kunt ook aangeven dat bepaalde cookies niet geplaatst mogen worden. Een andere optie is om de instellingen van je internetbrowser zo aan te passen dat je iedere keer dat er een cookie wordt geplaatst een bericht ontvangt. Raadpleeg voor meer informatie over deze opties de instructies in de Hulp sectie van je browser.",
  "Let op: onze site werkt mogelijk niet optimaal als alle cookies zijn uitgeschakeld. Als je wel de cookies in je browser verwijdert, worden ze na je toestemming opnieuw geplaatst bij een nieuw bezoek aan onze site.",

  heading("9. Je rechten met betrekking tot persoonsgegevens"),
  "Je hebt de volgende rechten met betrekking tot je persoonsgegevens:",
  "• Je hebt het recht om te weten waarom je persoonsgegevens nodig zijn, wat ermee gebeurt en hoe lang ze worden bewaard.",
  "• Recht op inzage: je kunt een verzoek indienen om inzage in de gegevens die we van je verwerken.",
  "• Recht op rectificatie en aanvulling: je hebt het recht om je persoonlijke gegevens aan te vullen, te corrigeren, te verwijderen of te blokkeren wanneer je maar wilt.",
  "• Als je ons toestemming geeft om je gegevens te verwerken, heb je het recht om die toestemming in te trekken en je persoonlijke gegevens te laten verwijderen.",
  "• Recht om je gegevens over te dragen: je hebt het recht om al je persoonlijke gegevens op te vragen bij de verwerkingsverantwoordelijke en deze in hun geheel over te dragen aan een andere verwerkingsverantwoordelijke.",
  "• Recht op bezwaar: je kan bezwaar maken tegen de verwerking van je gegevens. Wij komen hieraan tegemoet, tenzij er gegronde redenen voor verwerking zijn.",
  "Om deze rechten uit te oefenen, neem contact met ons op. Verwijs naar de contactgegevens onderaan dit cookiebeleid. Als je een klacht hebt over hoe we met je gegevens omgaan, horen we graag van je, maar je hebt ook het recht om een klacht in te dienen bij de toezichthoudende autoriteit (de Autoriteit Persoonsgegevens).",

  heading("10. Contactinformatie"),
  "Voor vragen en/of opmerkingen met betrekking tot ons cookiebeleid en deze verklaring kun je contact met ons opnemen via de volgende contactinformatie:",
  "Human Margin",
  "Bergsingel 113A",
  "3037GB Rotterdam",
  "Nederland",
  paragraph([text("Site: "), link("https://humanmargin.eu", "https://humanmargin.eu")]),
  paragraph([text("E-mail: "), link("els@humanmargin.eu", "mailto:els@humanmargin.eu")]),
  paragraph([
    text("Dit Cookiebeleid is gesynchroniseerd met "),
    link("cookiedatabase.org", "https://cookiedatabase.org/", true),
    text(" op 12 juni 2026."),
  ]),
]);

const layout = [{ blockType: "content" as const, richText: body }];

const page: PageSeed = {
  title: "Cookiebeleid (EU)",
  slug: "cookiebeleid-eu",
  layout,
  meta: {
    title: "Cookiebeleid (EU) - Human Margin",
    description:
      "Dit cookiebeleid is voor het laatst geüpdatet op 11 juni 2026 en is van toepassing op burgers en wettelijke permanente inwoners van de Europese Economische Ruimte en Zwitserland.",
  },
};

export default page;
