/**
 * PageSeed: when-using-ai-leads-to-brain-fry — blogpost "When Using AI Leads to “Brain Fry”" van humanmargin.eu/when-using-ai-leads-to-brain-fry/.
 * Het single-post-template benaderd met bestaande blocks:
 *  - splitPhotoText (zwart, foto rechts): paginatitel + TL;DR/excerpt + uitgelichte foto.
 *  - content: de volledige artikeltekst via de gedeelde htmlToLexical()-helper.
 * De pagina bestaat zodat /when-using-ai-leads-to-brain-fry werkt (de postCards linken er al naartoe).
 */
import { FORMAT_BOLD, htmlToLexical, paragraph, richText, text } from "../lexical";
import { media, type PageSeed } from "../media-map";

// Ruwe WordPress content.rendered (verbatim). Vlak voor htmlToLexical worden:
//  - interne humanmargin.eu-links relatief gemaakt,
//  - lege <strong>/<em> opgeschoond (behoud spatie),
//  - koppen (h2/h3) omgezet naar bold-paragrafen,
//  - de wp-block-button omgezet naar een <p> met inline link,
// zodat de helper (die op </p> splitst) ze meepakt.
const RAW =
  "\n<h2 class=\"wp-block-heading\">Harvard Business Review, maart 2026</h2>\n\n\n\n<p class=\"wp-block-paragraph\">Een BCG-onderzoek onder bijna 1.500 werknemers naar wat intensief AI-gebruik<br>met je hoofd doet.</p>\n\n\n\n<p class=\"wp-block-paragraph\">De uitkomst is genuanceerder dan de kop doet vermoeden.<br>AI dat saai, repetitief werk overneemt, verlaagt de burn-out.</p>\n\n\n\n<p class=\"wp-block-paragraph\">Maar AI dat je voortdurend moet aansturen en controleren, meerdere tools tegelijk,<br>alles dubbelchecken, doet het tegenovergestelde. Dat maalt je hoofd fijn.</p>\n\n\n\n<p class=\"wp-block-paragraph\">De onderzoekers noemen het &#8220;brain fry&#8221;: mentale mist, tragere beslissingen, meer<br>fouten. Marketeers rapporteren het het vaakst.</p>\n\n\n\n<p class=\"wp-block-paragraph\">En eerlijk gezegd klonk het mij ook bekend in de oren.</p>\n\n\n\n<h2 class=\"wp-block-heading\">In de Marge:</h2>\n\n\n\n<p class=\"wp-block-paragraph\">Hier staat in keurige consultancytaal wat ik blijf herhalen: het probleem is niet AI.<br>Het probleem is dat we onszelf wegcijferen om de machine bij te houden.<br>Het mooiste detail zit in de cijfers: tot drie tools tegelijk word je productiever, daarna<br>stort het in.<br></p>\n\n\n\n<p class=\"wp-block-paragraph\">Er zit dus een grens, en die grens ben jij, niet de techniek.<br>De vraag is niet hoeveel je kunt automatiseren, maar hoeveel je nog wíl overzien.<br></p>\n\n\n\n<p class=\"wp-block-paragraph\">En dat is geen loze vraag, dat is de essentie en wel even om stil bij te staan. Mogelijk<br>de beste beslissing van de dag.</p>\n\n\n\n<div class=\"wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex\">\n<div class=\"wp-block-button\"><a class=\"wp-block-button__link has-black-background-color has-text-color has-background has-link-color wp-element-button\" href=\"https://hbr.org/2026/03/when-using-ai-leads-to-brain-fry\" style=\"border-top-left-radius:0px;border-top-right-radius:0px;border-bottom-left-radius:0px;border-bottom-right-radius:0px;color:#edff00\" target=\"_blank\" rel=\"noreferrer noopener\">Lees het bij HBR →</a></div>\n</div>\n\n\n\n<p class=\"wp-block-paragraph\"></p>\n";

const article = htmlToLexical(
  RAW.replace(/https:\/\/humanmargin\.eu\//g, "/")
    .replace(/<(strong|b|em|i)>(\s*)<\/\1>/gi, "$2")
    .replace(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi, "<p><strong>$1</strong></p>")
    .replace(
      /<div class="wp-block-buttons[^>]*>\s*<div class="wp-block-button">([\s\S]*?)<\/div>\s*<\/div>/gi,
      "<p>$1</p>",
    ),
);

const layout = [
  {
    blockType: "splitPhotoText" as const,
    background: "black" as const,
    imagePosition: "right" as const,
    imageTreatment: "full" as const,
    image: media("https://humanmargin.eu/wp-content/uploads/2026/06/20-1.jpg"),
    heading: "When Using AI Leads to “Brain Fry”",
    headingLevel: "h1" as const,
    body: richText([
    paragraph([text("TL;DR", FORMAT_BOLD)]),
    "Een BCG-onderzoek onder bijna 1.500 werknemers naar wat intensief AI-gebruik met je hoofd doet.",
    "De uitkomst is genuanceerder dan de kop doet vermoeden. AI dat saai, repetitief werk overneemt, verlaagt de burn-out.",
    "Maar AI dat je voortdurend moet aansturen en controleren, meerdere tools tegelijk, alles dubbelchecken, doet het tegenovergestelde. Dat maalt je hoofd fijn.",
    "De onderzoekers noemen het “brain fry”: mentale mist, tragere beslissingen, meerfouten. Marketeers rapporteren het het vaakst.",
    "En eerlijk gezegd klonk het mij ook bekend in de oren.",
    ]),
  },
  { blockType: "content" as const, richText: article },
];

const page: PageSeed = {
  title: "When Using AI Leads to “Brain Fry”",
  slug: "when-using-ai-leads-to-brain-fry",
  layout,
  meta: {
    title: "When Using AI Leads to “Brain Fry” - Human Margin",
    description:
      "Een BCG-onderzoek onder bijna 1.500 werknemers naar wat intensief AI-gebruik met je hoofd doet. De uitkomst is genuanceerder dan de kop doet vermoeden. AI dat saai, repetitief werk overneemt, verlaagt de burn-out. Maar AI dat je voortdurend moet aansturen en controleren, meerdere tools tegelijk, alles dubbelchecken, doet het tegenovergestelde. Dat maalt je hoofd fijn. De onderzoekers noemen het \"brain fry\": mentale mist, tragere beslissingen, meerfouten. Marketeers rapporteren het het vaakst. En eerlijk gezegd klonk het mij ook bekend in de oren.",
  },
};

export default page;
