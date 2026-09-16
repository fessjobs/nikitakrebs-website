#!/usr/bin/env node
/* Prüft jede lokal referenzierte Datei in HTML und CSS auf Existenz.
   Aufruf:  node .claude/skills/qa-deploy/scripts/check-assets.mjs [projektwurzel]
   Exit 1, wenn eine Referenz ins Leere zeigt. */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] || (existsSync(join(process.cwd(), 'index.html'))
  ? process.cwd()
  : resolve(here, '../../../..')));

if (!existsSync(join(root, 'index.html'))) {
  console.error(`Keine index.html in ${root} — Projektwurzel als Argument übergeben.`);
  process.exit(2);
}

const SKIP_DIRS = new Set(['.git', 'node_modules', '.vercel', 'assets']);
const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.claude') continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(html|css)$/i.test(entry.name)) files.push(p);
  }
})(root);

const isExternal = (v) => /^(?:[a-z]+:|\/\/|#|data:)/i.test(v.trim());
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const refs = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const push = (raw, index) => {
    const value = raw.trim();
    if (!value || isExternal(value)) return;
    refs.push({ file, line: lineOf(text, index), value });
  };

  for (const m of text.matchAll(/\b(?:src|href|poster|data-img|content)\s*=\s*"([^"]*)"/gi)) {
    // content= nur für Meta-Bilder; absolute URLs fallen durch isExternal raus
    if (m[0].startsWith('content') && !/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(m[1])) continue;
    push(m[1], m.index);
  }
  for (const m of text.matchAll(/\bsrcset\s*=\s*"([^"]*)"/gi)) {
    for (const part of m[1].split(',')) push(part.trim().split(/\s+/)[0] || '', m.index);
  }
  for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) push(m[1], m.index);
}

const missing = [];
for (const ref of refs) {
  const clean = ref.value.split(/[?#]/)[0];
  if (!clean) continue;
  const base = clean.startsWith('/') ? join(root, clean) : resolve(dirname(ref.file), clean);
  const candidates = [base];
  // cleanUrls: /impressum → impressum.html, Verzeichnis → index.html
  if (!extname(base)) candidates.push(`${base}.html`, join(base, 'index.html'));
  if (!candidates.some((c) => existsSync(c) && statSync(c).isFile())) missing.push(ref);
}

const rel = (p) => relative(root, p) || p;
for (const m of missing) console.log(`FEHLT  ${rel(m.file)}:${m.line}  ${m.value}`);
console.log(`\n${files.length} Datei(en) geprüft, ${refs.length} lokale Referenzen, ${missing.length} fehlend.`);
process.exit(missing.length ? 1 : 0);
