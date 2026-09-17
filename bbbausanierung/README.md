# bbbausanierung.de

Neuauftritt der BB Bausanierung GmbH (Hamburg-Hummelsbüttel) als statische
One-Page-Landing im Stack von nikitakrebs.de: HTML/CSS/JS ohne Build,
GSAP + ScrollTrigger + Lenis per CDN, Deploy auf Vercel.

- `index.html` / `style.css` / `main.js` – die Seite
- `impressum.html`, `datenschutz.html` – eigenständig, ohne JS
- `assets/img/` – Logo-Mark (SVG), Favicons, OG-Bild
- Lokal: `python3 -m http.server 5190` aus diesem Ordner, dann http://127.0.0.1:5190
- Deploy: eigenes Vercel-Projekt mit **Root Directory `bbbausanierung`**, dann `npx vercel --prod --yes`
- Prüfen: `node ../.claude/skills/qa-deploy/scripts/check-assets.mjs .` (tote Referenzen) und
  `node ../.claude/skills/qa-deploy/scripts/shots.mjs` (Screenshots über 390/768/1440 px)

## Inhalte

Alle Texte stammen von der alten Seite (www.bbbausanierung.de, Stand 2026) und
den Branchenbucheinträgen des Unternehmens: Gründung 2003, Leistungsliste,
Referenzprojekte (Flaßheide, Schemmannstraße, Tornquiststraße, Neuer Luruper
Weg, Oderfelder Straße, Hohenzollernring, Tresckowstraße, Auwiese) und
Kontaktdaten. Der Ablauf-Abschnitt („So arbeiten wir“) ist neu formuliert und
sollte vom Unternehmen freigegeben werden.

## Vor dem Livegang

1. **Impressum**: Geschäftsführung und USt-IdNr. eintragen – die Stellen sind
   in `impressum.html` als gelbe `todo`-Marker sichtbar.
2. **Projektfotos**: Die sechs Referenzkarten in `index.html` haben
   `.ref__media--ph`-Platzhalter. Foto einbauen = Platzhalter-Div durch
   `<div class="ref__media"><img src="assets/img/ref-<slug>.webp" alt="…" loading="lazy" width="1200" height="750"></div>`
   ersetzen (16:10, ~1200 px breit, WebP – siehe Skill `medien-assets`).
3. **Logo**: `assets/img/bb-mark.svg` ist ein neutrales Ziegel-Mark. Liegt ein
   echtes Firmenlogo vor, gleiche Datei ersetzen und `favicon.png`,
   `apple-touch-icon.png` sowie `og.jpg` neu erzeugen.
4. **Domain**: Canonical, `og:url`, Sitemap und robots.txt zeigen auf
   `https://www.bbbausanierung.de/` – bei anderer Domain anpassen.

## Design

Gleiche Typo und Tokens wie nikitakrebs.de (Barlow Condensed / Montserrat /
Instrument Serif, Paper `#F5F4EF`, Ink `#0B0B0C`), Akzent statt Blau ein
warmes Bau-Gelb: `--accent:#F5B331`, `--accent-text:#9A5A06`. Details in
`../DESIGN.md`; die Regeln dort gelten hier unverändert.
