import type { GlobalConfig } from "payload";

export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Footer",
  admin: { group: "Site" },
  access: { read: () => true },
  fields: [
    {
      name: "followLabel",
      label: "Volg-mij label",
      type: "text",
      defaultValue: "Volg mij:",
    },
    {
      name: "socials",
      label: "Social media",
      type: "array",
      labels: { singular: "Social", plural: "Socials" },
      fields: [
        {
          name: "platform",
          label: "Platform",
          type: "select",
          required: true,
          options: [
            { label: "LinkedIn", value: "linkedin" },
            { label: "Instagram", value: "instagram" },
            { label: "X", value: "x" },
            { label: "YouTube", value: "youtube" },
          ],
        },
        { name: "href", label: "Link", type: "text", required: true },
      ],
    },
    {
      name: "menu",
      label: "Menu-links",
      type: "array",
      labels: { singular: "Link", plural: "Links" },
      fields: [
        { name: "label", label: "Label", type: "text", required: true },
        { name: "href", label: "Link", type: "text", required: true },
      ],
    },
    {
      name: "contactLabel",
      label: "Contact-label",
      type: "text",
      defaultValue: "Contact",
    },
    {
      name: "contactEmail",
      label: "Contact e-mailadres",
      type: "email",
    },
    {
      name: "copyright",
      label: "Copyright-tekst",
      type: "text",
    },
    {
      name: "credit",
      label: "Credit (oranje accent)",
      type: "text",
    },
  ],
};
