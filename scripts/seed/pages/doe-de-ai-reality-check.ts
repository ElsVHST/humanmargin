/**
 * PageSeed: doe-de-ai-reality-check — humanmargin.eu/doe-de-ai-reality-check/
 *
 * Origineel: kop "De AI Reality check" + ingebedde Tally-quiz. Het iframeEmbed-block
 * rendert dezelfde Tally-embed-URL als de live site (b5LLQe, dynamicHeight).
 */
import type { PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  {
    blockType: "iframeEmbed" as const,
    background: "white" as const,
    heading: "De AI Reality check",
    url: "https://tally.so/embed/b5LLQe?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1",
    height: 1200,
    maxWidth: 720,
  },
];

const page: PageSeed = {
  title: "Doe de AI Reality check",
  slug: "doe-de-ai-reality-check",
  layout,
  meta: {
    title: "Doe de AI Reality check - Human Margin",
    description: "De AI Reality check",
  },
};

export default page;
