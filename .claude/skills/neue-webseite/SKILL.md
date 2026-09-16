---
name: neue-webseite
description: Eine neue statische Website in diesem Stack aufsetzen (HTML/CSS/JS ohne Build, GSAP-Scrollanimationen, Deploy auf Vercel) - Dateistruktur, Grundgerüst, Tokens, Reihenfolge des Vorgehens. Nutze das bei "neue Seite/Website aufsetzen", "Landingpage von Null", "Projekt für Kunde X starten".
---

# Neue Website aufsetzen

Dieser Stack passt für Landingpages, Portfolios und Kundenauftritte bis ~5
Unterseiten: kein Build, keine Abhängigkeiten im Repo, Deploy in Sekunden,
jede Datei direkt lesbar. **Nicht** passend, sobald Inhalte von Nicht-Entwicklern
gepflegt werden, eine Suche, ein Login oder dutzende Seiten dazukommen — dann
Astro, Next oder ein CMS vorschlagen statt dieses Muster zu dehnen.

## Struktur

```
index.html          eine Seite, Sektion für Sektion
style.css           alle Styles, Tokens in :root ganz oben
main.js             eine IIFE, Animationsblöcke mit /* ---------- name ---------- */
assets/img|video|logos|gallery
impressum.html      eigenständig, ohne JS
datenschutz.html
robots.txt  sitemap.xml  vercel.json  README.md
.gitignore  .vercelignore
```

## Reihenfolge

1. **Inhalt vor Technik.** Erst die Sektionsliste und die echten Texte festlegen — Reihenfolge der Sektionen ist die Dramaturgie der Seite.
2. **Gerüst** anlegen (siehe unten), lokal starten: `python3 -m http.server 5190`.
3. **Sektionen** bauen, eine nach der anderen, jeweils HTML → CSS → Motion (`sektion-bauen`).
4. **Assets** erst zum Schluss optimieren, sonst optimierst du Material, das wieder rausfliegt (`medien-assets`).
5. **SEO/Meta**, Impressum und Datenschutz (`seo-meta`) — bei deutschen Kundenseiten von Anfang an einplanen, nicht nachträglich.
6. **Prüfen und deployen** (`qa-deploy`).

## Grundgerüst

`index.html`:

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#F5F4EF">
<title>Titel — Marke</title>
<meta name="description" content="Ein Satz, 150–160 Zeichen.">
<meta property="og:type" content="website">
<meta property="og:title" content="Titel — Marke">
<meta property="og:image" content="https://DOMAIN/assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://DOMAIN/">
<link rel="icon" href="assets/img/favicon.png">
<link rel="stylesheet" href="style.css">
</head>
<body>
<main id="top">
  <!-- ============ HERO ============ -->
  <section class="hero" data-nav-theme="light">…</section>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="main.js"></script>
</body>
</html>
```

`main.js`:

```js
/* <Projekt> — Scroll-Choreografie */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- reveals ---------- */
  $$('[data-reveal]').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
})();
```

`style.css` beginnt mit Tokens — Farben pro Projekt neu, Struktur gleich:

```css
:root{
  --paper:#F5F4EF; --ink:#0B0B0C; --ink-2:#5A5A5C;
  --accent:#6AAEFD; --accent-text:#1F6BD6;
  --display:'Barlow Condensed',Impact,sans-serif; --body:'Montserrat',system-ui,sans-serif;
  --gutter:clamp(20px,3vw,48px); --r:14px;
}
[data-reveal]{opacity:0;transform:translateY(30px)}
.no-js [data-reveal]{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
```

`vercel.json`:

```json
{
  "cleanUrls": true,
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ] }
  ]
}
```

`.gitignore`: `.DS_Store`, `.vercel`, `node_modules`, `.claude/*` mit
`!.claude/skills/`. `.vercelignore`: `.claude`, `README.md`.

## Von Anfang an mitdenken

- **Fallback ohne JS**: Alles, was per `data-reveal` erst eingeblendet wird, ist ohne GSAP unsichtbar. Kritische Inhalte (Kontakt, Impressum, Preise) nie hinter einen Reveal legen — oder `document.documentElement.classList.add('no-js')` per Inline-Skript im Head setzen und bei erfolgreichem GSAP-Load wieder entfernen.
- **Ein Satz Tokens**, keine Ad-hoc-Farben. Später Farben zu vereinheitlichen kostet mehr als es am Anfang kostet, sie festzulegen.
- **Bilder in der finalen Auflösung** bereitstellen, nicht 4000px-Originale ausliefern.
- Die Prüfskripte aus `qa-deploy/scripts/` ins neue Projekt kopieren — sie sind projektunabhängig und brauchen nur eine `index.html` in der Wurzel.
