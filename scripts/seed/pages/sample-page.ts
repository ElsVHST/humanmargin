/**
 * PageSeed: sample-page — de standaard WordPress-voorbeeldpagina van
 * humanmargin.eu/sample-page/. Hello Elementor default-pagina: entry-title
 * "Sample Page" + lopende tekst met twee wp-block-quote-citaten (ingesprongen,
 * rechtop) en een link naar het dashboard.
 */
import { link, paragraph, quote, richText, text } from "../lexical";
import { type PageSeed } from "../media-map";

const layout: PageSeed["layout"] = [
  {
    blockType: "pageTitle" as const,
    title: "Sample Page",
    body: richText([
      "This is an example page. It’s different from a blog post because it will stay in one place and will show up in your site navigation (in most themes). Most people start with an About page that introduces them to potential site visitors. It might say something like this:",
      quote(
        "Hi there! I’m a bike messenger by day, aspiring actor by night, and this is my website. I live in Los Angeles, have a great dog named Jack, and I like piña coladas. (And gettin’ caught in the rain.)",
      ),
      "…or something like this:",
      quote(
        "The XYZ Doohickey Company was founded in 1971, and has been providing quality doohickeys to the public ever since. Located in Gotham City, XYZ employs over 2,000 people and does all kinds of awesome things for the Gotham community.",
      ),
      paragraph([
        text("As a new WordPress user, you should go to "),
        link("your dashboard", "https://humanmargin.eu/wp-admin/"),
        text(" to delete this page and create new pages for your content. Have fun!"),
      ]),
    ]),
  },
];

const page: PageSeed = {
  title: "Sample Page",
  slug: "sample-page",
  layout,
  meta: {
    title: "Sample Page - Human Margin",
    description:
      "This is an example page. It's different from a blog post because it will stay in one place and will show up in your site navigation (in most themes). Most",
  },
};

export default page;
