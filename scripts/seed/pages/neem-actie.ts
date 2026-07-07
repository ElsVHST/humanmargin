/**
 * PageSeed: neem-actie — exacte content van humanmargin.eu/neem-actie/
 *
 * De originele pagina is een lege menu-ouder: er staat geen Elementor-content op,
 * alleen de door het Hello Elementor-thema gerenderde paginatitel "Neem actie"
 * (entry-title) is zichtbaar. We tonen enkel die titel via het pageTitle-blok.
 */
import type { PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  {
    blockType: "pageTitle" as const,
    title: "Neem actie",
  },
];

const page: PageSeed = {
  title: "Neem actie",
  slug: "neem-actie",
  layout,
  meta: {
    title: "Neem actie - Human Margin",
  },
};

export default page;
