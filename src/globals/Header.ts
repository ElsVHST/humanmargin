import type { GlobalConfig } from "payload";

export const Header: GlobalConfig = {
  slug: "header",
  label: "Header / Navigatie",
  admin: { group: "Site" },
  access: { read: () => true },
  fields: [
    {
      name: "logo",
      label: "Logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "navItems",
      label: "Menu-items",
      type: "array",
      maxRows: 8,
      defaultValue: [
        { label: "Home", href: "/" },
        { label: "Manifest", href: "/manifest/" },
        {
          label: "Leeszaal",
          href: "/leeszaal/",
          children: [
            { label: "In de marge", href: "/in-de-marge/" },
            { label: "In mensentaal", href: "/in-mensentaal/" },
            { label: "Op de leestafel", href: "/op-de-leestafel/" },
          ],
        },
        {
          label: "Neem actie",
          href: "/neem-actie/",
          children: [
            { label: "AICK - de Kit", href: "/aick-de-kit/" },
            { label: "AICK Sprint", href: "/aick-sprint/" },
            { label: "AICK Aanbieder", href: "/aick-aanbieder/" },
            { label: "TEAM op maat", href: "/team-op-maat/" },
            { label: "Hoog risico op maat", href: "/hoog-risico-op-maat/" },
          ],
        },
        { label: "Over mij", href: "/over-mij/" },
        { label: "Contact", href: "/contact/" },
      ],
      fields: [
        { name: "label", label: "Label", type: "text", required: true },
        { name: "href", label: "Link", type: "text", required: true },
        {
          name: "children",
          label: "Sub-menu",
          type: "array",
          maxRows: 8,
          fields: [
            { name: "label", label: "Label", type: "text", required: true },
            { name: "href", label: "Link", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "cta",
      label: "Call-to-action knop",
      type: "group",
      fields: [
        { name: "label", label: "Knoptekst", type: "text", defaultValue: "AI reality check" },
        { name: "href", label: "Link", type: "text", defaultValue: "/ai-reality-check/" },
        {
          name: "variant",
          label: "Kleur",
          type: "select",
          defaultValue: "blue",
          options: [
            { label: "Blauw", value: "blue" },
            { label: "Geel", value: "yellow" },
          ],
        },
      ],
    },
  ],
};
