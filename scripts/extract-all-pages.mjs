#!/usr/bin/env node
/**
 * Extraheer per pagina de volledige computed-style boom van alle top-level
 * Elementor-secties (desktop 1440). Output: docs/research/humanmargin.eu/pages/<slug>.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = "https://humanmargin.eu";
const OUT = process.env.OUT_DIR ?? "docs/research/humanmargin.eu/pages";
mkdirSync(OUT, { recursive: true });

const ONLY = process.env.ONLY?.split(",").map((s) => s.trim());
const SLUGS = ONLY ?? [
  "team-op-maat", "hoog-risico-op-maat", "aick-sprint", "aick-de-kit", "aick-aanbieder",
  "elementor-828", "bio", "over-mij", "op-het-podium", "bij-anderen",
  "in-de-marge", "in-mensentaal", "op-de-leestafel", "leeszaal",
  "ai-reality-check", "doe-de-ai-reality-check", "manifest", "neem-actie",
  "contact", "affiliate", "linkjes", "weggever", "salespage",
  "bedankt-aanmelden-in-de-marge", "cookiebeleid-eu", "sample-page",
];

const WALKER = `(() => {
  const props = ['fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color','textTransform','textDecorationLine','textAlign','backgroundColor','backgroundImage','backgroundSize','backgroundPosition','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','width','height','maxWidth','minHeight','display','flexDirection','justifyContent','alignItems','flexWrap','gap','gridTemplateColumns','borderRadius','borderTopWidth','borderColor','borderStyle','boxShadow','position','top','left','zIndex','opacity','transform','transition','objectFit','aspectRatio'];
  function styles(el) {
    const cs = getComputedStyle(el); const out = {};
    for (const p of props) { const v = cs[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)' && v !== 'static' && v !== 'visible' && v !== '1') out[p] = v; }
    return out;
  }
  function walk(el, depth) {
    if (depth > 7 || el.nodeType !== 1) return null;
    if (['SCRIPT','STYLE','NOSCRIPT','LINK'].includes(el.tagName)) return null;
    const directText = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(' ');
    const node = {
      tag: el.tagName.toLowerCase(),
      widget: el.getAttribute('data-widget_type') || undefined,
      settings: el.getAttribute('data-settings') || undefined,
      text: directText ? directText.slice(0, 500) : undefined,
      href: el.tagName === 'A' ? el.getAttribute('href') : undefined,
      img: el.tagName === 'IMG' ? { src: el.currentSrc || el.src, alt: el.alt, w: el.naturalWidth, h: el.naturalHeight } : undefined,
      svg: el.tagName === 'svg' ? el.outerHTML.slice(0, 600) : undefined,
      iframe: el.tagName === 'IFRAME' ? { src: el.src || el.dataset.src } : undefined,
      input: ['INPUT','TEXTAREA','SELECT','BUTTON'].includes(el.tagName) ? { type: el.type, placeholder: el.placeholder, name: el.name, value: el.tagName === 'BUTTON' || el.type === 'submit' ? el.value || el.textContent.trim() : undefined } : undefined,
      s: styles(el),
      rect: (() => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; })(),
      kids: el.tagName === 'svg' ? [] : [...el.children].map(k => walk(k, depth + 1)).filter(Boolean)
    };
    return node;
  }
  const root = document.querySelector('[data-elementor-type="wp-page"]');
  if (!root) return JSON.stringify({ error: 'no wp-page root' });
  const sections = [...root.children].map((s, i) => ({ i, id: s.getAttribute('data-id'), tree: walk(s, 0) }));
  return JSON.stringify({ url: location.href, title: document.title, sections });
})()`;

const VW = Number(process.env.VIEWPORT_W ?? 1440);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: VW, height: VW < 500 ? 844 : 900 } });

for (const slug of SLUGS) {
  try {
    await page.goto(`${BASE}/${slug}/`, { waitUntil: "networkidle", timeout: 45000 });
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          y += 900; window.scrollTo(0, y);
          if (y < document.body.scrollHeight) setTimeout(step, 100);
          else { window.scrollTo(0, 0); setTimeout(resolve, 300); }
        };
        step();
      });
    });
    const json = await page.evaluate(WALKER);
    writeFileSync(join(OUT, `${slug}.json`), json);
    console.log(`ok  ${slug} (${(json.length / 1024).toFixed(0)}kB)`);
  } catch (err) {
    console.error(`FAIL ${slug}: ${err.message}`);
  }
}

await browser.close();
console.log("done");
