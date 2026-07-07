/**
 * PageSeed: op-het-podium — humanmargin.eu/op-het-podium/
 * Lege placeholderpagina: enkel de door het Hello Elementor-thema gerenderde
 * paginatitel "Op het Podium" (entry-title) op wit. (WP-extractie gaf "no wp-page root".)
 */
import type { PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  {
    blockType: "pageTitle" as const,
    title: "Op het Podium",
  },
];

const page: PageSeed = {
  title: "Op het Podium",
  slug: "op-het-podium",
  layout,
  meta: {
    title: "Op het Podium - Human Margin",
  },
};

export default page;
