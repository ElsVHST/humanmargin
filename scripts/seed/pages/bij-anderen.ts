/**
 * PageSeed: bij-anderen — humanmargin.eu/bij-anderen/
 * Stub-pagina: het origineel heeft géén Elementor-inhoud, alleen de door het
 * Hello Elementor-thema gerenderde paginatitel "Bij anderen" (entry-title) boven
 * de footer. We tonen enkel die titel via het pageTitle-blok.
 */
import { type PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  {
    blockType: "pageTitle" as const,
    title: "Bij anderen",
  },
];

const page: PageSeed = {
  title: "Bij anderen",
  slug: "bij-anderen",
  layout,
  meta: {
    title: "Bij anderen - Human Margin",
  },
};

export default page;
