#!/usr/bin/env node
/* Screenshots über mehrere Breiten und Scroll-Positionen + Konsolenfehler.
   Voraussetzung: lokaler Server läuft (python3 -m http.server 5190).
   Aufruf:  node .claude/skills/qa-deploy/scripts/shots.mjs
            node .../shots.mjs --url=http://127.0.0.1:5190/ --widths=390,1440 --steps=6 --out=.claude/screenshots
   Exit 1, wenn Konsolenfehler oder fehlgeschlagene Requests auftreten. */
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, fallback) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};
const url = arg('url', 'http://127.0.0.1:5190/');
const outDir = arg('out', '.claude/screenshots');
const widths = arg('widths', '390,768,1440').split(',').map(Number);
const steps = Number(arg('steps', 5));

async function loadPlaywright() {
  // lokal installiert, sonst global (npm root -g); CJS kommt als default-Namespace
  const normalize = (mod) => (mod && mod.chromium ? mod : mod && mod.default && mod.default.chromium ? mod.default : null);
  try { const m = normalize(await import('playwright')); if (m) return m; } catch {}
  try {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const m = normalize(await import(pathToFileURL(join(globalRoot, 'playwright', 'index.js')).href));
    if (m) return m;
  } catch {}
  return null;
}

const pw = await loadPlaywright();
if (!pw) {
  console.error('Playwright nicht gefunden. Lokal:  npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });
const browser = await pw.chromium.launch();
const problems = [];

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') problems.push(`[${width}px] console: ${msg.text()}`); });
  page.on('pageerror', (err) => problems.push(`[${width}px] pageerror: ${err.message}`));
  page.on('response', (res) => { if (res.status() >= 400) problems.push(`[${width}px] ${res.status()} ${res.url()}`); });

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(3000); // Preloader + Hero-Intro

  const height = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let i = 0; i < steps; i++) {
    const y = Math.round((height * i) / Math.max(steps - 1, 1));
    // Lenis übernimmt das Scrollen, wenn es aktiv ist — sonst nativ
    await page.evaluate((target) => {
      if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true });
      else window.scrollTo(0, target);
    }, y);
    await page.waitForTimeout(1200);
    const file = join(outDir, `${width}-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: file });
    console.log(`${file}  (y=${y})`);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (overflow) problems.push(`[${width}px] horizontaler Overflow: Seite ist breiter als das Viewport`);
  await context.close();
}

await browser.close();

if (problems.length) {
  console.log('\nProbleme:');
  for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
  if (problems.some((p) => /gsap is not defined|cdnjs|jsdelivr|ERR_TUNNEL|ERR_CERT/.test(p))) {
    console.log('\nHinweis: GSAP/Lenis/Fonts kommen per CDN. Scheitern nur diese Requests,');
    console.log('hat die Umgebung kein Netz — dann bleiben alle [data-reveal]-Elemente unsichtbar.');
    console.log('Das ist kein Seitenfehler; für eine echte Prüfung lokal laufen lassen.');
  }
  process.exit(1);
}
console.log('\nKeine Konsolenfehler, keine fehlgeschlagenen Requests, kein horizontaler Overflow.');
