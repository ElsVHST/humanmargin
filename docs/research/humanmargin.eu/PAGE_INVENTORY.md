# Human Margin — Page Inventory (WP REST + Rank Math sitemap, 2026-07-07)

Bron: `https://humanmargin.eu/wp-json/wp/v2/pages` (27 pagina's, alle status=publish, template=default/Elementor) + `page-sitemap.xml` (alle 27 indexeerbaar) + `post-sitemap.xml` (2 posts).

## Pagina's (WP id → slug → titel)

| id | slug | titel | opmerking |
|---|---|---|---|
| 84 | home | Home | → Payload slug `home` |
| 545 | team-op-maat | TEAM op maat | dienst |
| 546 | hoog-risico-op-maat | Hoog risico op maat | dienst |
| 543 | aick-sprint | AICK Sprint | dienst |
| 185 | aick-de-kit | AICK- de Kit | dienst |
| 544 | aick-aanbieder | AICK Aanbieder | dienst |
| 828 | elementor-828 | SAMENWERKEN | let op: slug is `elementor-828` |
| 780 | bio | Bio | |
| 81 | over-mij | Over mij | mogelijk ouder duplicaat van bio |
| 781 | op-het-podium | Op het Podium | |
| 782 | bij-anderen | Bij anderen | |
| 783 | in-de-marge | In de marge | nieuwsbrief |
| 784 | in-mensentaal | In mensentaal | blog-categorie-landing |
| 785 | op-de-leestafel | Op de leestafel | blog-categorie-landing |
| 183 | leeszaal | Leeszaal | |
| 187 | ai-reality-check | AI Reality Check | |
| 469 | doe-de-ai-reality-check | Doe de AI Reality check | |
| 182 | manifest | Manifest | |
| 184 | neem-actie | Neem actie | |
| 43 | contact | Contact | |
| 737 | affiliate | Affiliate | |
| 65 | linkjes | Linkjes | linktree-achtig |
| 68 | weggever | Weggever | lead magnet |
| 58 | salespage | Salespage | ouder/werkpagina |
| 751 | bedankt-aanmelden-in-de-marge | Bedankt aanmelden in de marge | thank-you |
| 799 | cookiebeleid-eu | Cookiebeleid (EU) | juridisch |
| 2 | sample-page | Sample Page | WP-standaard, laag prioriteit |

## Posts (collectie komt later; nu buiten kernscope tenzij gevraagd)

| slug | titel |
|---|---|
| ai-act-zzp | AI Act voor kleine ondernemers: wat moet je écht doen? |
| when-using-ai-leads-to-brain-fry | When Using AI Leads to "Brain Fry" |

## Categorieën
- /category/in-mensentaal/
- /category/op-de-leestafel/

## Media
- 127 items in de WP-mediabibliotheek (`/wp-json/wp/v2/media`)

## Extractie-endpoints
- Content per pagina: `/wp-json/wp/v2/pages/<id>` (`content.rendered` = door Elementor gegenereerde HTML)
- SEO per URL: Rank Math head via pagina-HTML `<head>` (geen open getHead-endpoint aangetroffen — meta uit HTML parsen)
- Media: `/wp-json/wp/v2/media?per_page=100&page=N` → `source_url`, `alt_text`, `media_details`
