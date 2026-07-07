/**
 * PageSeed: bio — humanmargin.eu/bio/
 * Lege placeholderpagina: enkel de door het Hello Elementor-thema gerenderde
 * paginatitel "Bio" (entry-title) op wit. (WP-extractie gaf "no wp-page root".)
 */
import type { PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  {
    blockType: "pageTitle" as const,
    title: "Bio",
  },
];

const page: PageSeed = {
  title: "Bio",
  slug: "bio",
  layout,
  meta: {
    title: "Bio - Human Margin",
  },
};

export default page;
