import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { nl } from "@payloadcms/translations/languages/nl";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "@/collections/Media";
import { Pages } from "@/collections/Pages";
import { Subscribers } from "@/collections/Subscribers";
import { Users } from "@/collections/Users";
import { Footer } from "@/globals/Footer";
import { Header } from "@/globals/Header";
import { getServerSideURL } from "@/lib/url";
import { contentCollections } from "@/modules/content";
import { crmCollections } from "@/modules/crm";
import { projectsCollections } from "@/modules/projects";
import { sharedCollections } from "@/modules/shared";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  secret:
    process.env.PAYLOAD_SECRET ??
    (() => {
      throw new Error("PAYLOAD_SECRET is missing from the environment");
    })(),
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "— Human Margin CMS",
      icons: [
        {
          rel: "icon",
          type: "image/png",
          url: "/seo/human-margin-favicon-full-color-rgb-900px-w-72ppi-150x150.png",
        },
      ],
    },
    components: {
      graphics: {
        Logo: "/components/admin/Logo#Logo",
        Icon: "/components/admin/Icon#Icon",
      },
      afterNavLinks: ["/components/admin/DashboardNavLinks#DashboardNavLinks"],
      views: {
        pipeline: {
          Component: "/modules/crm/views/pipeline/PipelineView#PipelineView",
          path: "/pipeline",
        },
        taken: {
          Component: "/modules/projects/views/taken/TakenView#TakenView",
          path: "/taken",
        },
      },
    },
    theme: "light",
  },
  // Els beheert de site in het Nederlands; admin UI valt terug op nl
  i18n: { supportedLanguages: { en, nl }, fallbackLanguage: "nl" },
  collections: [
    Pages,
    Media,
    Users,
    Subscribers,
    ...crmCollections,
    ...projectsCollections,
    ...contentCollections,
    ...sharedCollections,
  ],
  globals: [Header, Footer],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    migrationDir: path.resolve(dirname, "migrations"),
    // Dev/test: schema auto-sync; productie: alleen migraties
    push: process.env.NODE_ENV !== "production",
  }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  plugins: [
    seoPlugin({
      collections: ["pages"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) =>
        doc?.title ? `${doc.title} — Human Margin` : "Human Margin",
      generateURL: ({ doc }) =>
        `${getServerSideURL()}/${doc?.slug === "home" ? "" : (doc?.slug ?? "")}`,
    }),
  ],
});
