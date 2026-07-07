#!/usr/bin/env node
/**
 * Capture full-page screenshots (desktop 1440 + mobile 390) and rendered HTML
 * of every humanmargin.eu page. Used for clone extraction and visual QA.
 *
 * Usage: node scripts/capture-pages.mjs [--base https://humanmargin.eu] [--out docs/design-references/humanmargin.eu]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};

const BASE = getArg("--base", "https://humanmargin.eu");
const OUT = getArg("--out", "docs/design-references/humanmargin.eu");
const HTML_OUT = getArg("--html-out", "docs/research/humanmargin.eu/html");
const ONLY = getArg("--only", null); // comma-separated slugs

const SLUGS = [
  "", // home
  "team-op-maat", "hoog-risico-op-maat", "aick-sprint", "aick-de-kit", "aick-aanbieder",
  "elementor-828", "bio", "over-mij", "op-het-podium", "bij-anderen",
  "in-de-marge", "in-mensentaal", "op-de-leestafel", "leeszaal",
  "ai-reality-check", "doe-de-ai-reality-check", "manifest", "neem-actie",
  "contact", "affiliate", "linkjes", "weggever", "salespage",
  "bedankt-aanmelden-in-de-marge", "cookiebeleid-eu", "sample-page",
];

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

mkdirSync(OUT, { recursive: true });
mkdirSync(HTML_OUT, { recursive: true });

const slugs = ONLY ? ONLY.split(",") : SLUGS;
const browser = await chromium.launch({ channel: "chrome", headless: true });

for (const slug of slugs) {
  const url = slug ? `${BASE}/${slug}/` : `${BASE}/`;
  const name = slug || "home";
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      // cookie-banner (Complianz) verbergen zodat screenshots schoon zijn
      await page.addStyleTag({ content: "#cmplz-cookiebanner-container{display:none!important}" }).catch(() => {});
      // lazy-loaded media forceren
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = () => {
            y += 800;
            window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(step, 120);
            else { window.scrollTo(0, 0); setTimeout(resolve, 400); }
          };
          step();
        });
      });
      await page.screenshot({ path: join(OUT, `${name}-${vp.name}.png`), fullPage: true });
      if (vp.name === "desktop-1440") {
        const html = await page.content();
        writeFileSync(join(HTML_OUT, `${name}.html`), html);
      }
      console.log(`ok  ${name} @ ${vp.name}`);
    } catch (err) {
      console.error(`FAIL ${name} @ ${vp.name}: ${err.message}`);
    } finally {
      await page.close();
    }
  }
}

await browser.close();
console.log("done");
