#!/usr/bin/env node
/* Vorschau-Server für die lokale Arbeit. Bildet `cleanUrls: true` aus vercel.json nach,
   damit /impressum und /datenschutz lokal genauso funktionieren wie auf Vercel.
   Start:  node serve.mjs        →  http://127.0.0.1:5190 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname;
const PORT = Number(process.argv[2] || 5190);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

const exists = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = normalize(url).replace(/^(\.\.[/\\])+/, '');
  const candidates = [join(ROOT, rel)];
  if (rel === '/' || rel.endsWith('/')) candidates.push(join(ROOT, rel, 'index.html'));
  else if (!extname(rel)) candidates.push(join(ROOT, rel + '.html'));
  for (const file of candidates) {
    if (!(await exists(file))) continue;
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404');
}).listen(PORT, '127.0.0.1', () => console.log('KEMNA-Vorschau: http://127.0.0.1:' + PORT));
