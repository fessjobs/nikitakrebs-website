---
name: seo-meta
description: Meta-Tags, Open Graph, Canonical, Sitemap, robots.txt und neue Unterseiten für nikitakrebs.de. Nutze das bei "Titel/Description ändern", "Vorschaubild beim Teilen", "neue Seite anlegen", "Impressum/Datenschutz", "Seite wird nicht gefunden/indexiert", "SEO".
---

# SEO & Meta

Die Seite ist statisch, eine Sprache (`lang="de"`), Domain `https://nikitakrebs.de`.
`vercel.json` setzt `cleanUrls: true` — `/impressum.html` wird auf `/impressum`
umgeleitet. Kanonisch ist also **die URL ohne `.html`**.

## Head einer Seite

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#F5F4EF">
<title>Nikita Krebs — Gründer, Medienproduktion &amp; Software</title>
<meta name="description" content="…">
<meta property="og:type" content="website">
<meta property="og:title" content="…">
<meta property="og:description" content="…">
<meta property="og:url" content="https://nikitakrebs.de/">
<meta property="og:image" content="https://nikitakrebs.de/assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://nikitakrebs.de/">
```

Regeln:

- **Titel** ≤ 60 Zeichen, Marke hinten: `Thema — Nikita Krebs`.
- **Description** 150–160 Zeichen, ein Satz Nutzen, keine Keyword-Liste.
- `og:url` und `canonical` immer **absolut** und ohne `.html`.
- `og:image` absolut, 1200×630 (`assets/img/og.jpg` hat genau das). Eigenes Bild pro Seite nur, wenn es inhaltlich abweicht — sonst das bestehende.
- `theme-color` steht auf dem hellen Papierton; `main.js` schreibt den Wert beim Scrollen live um. Nicht per JS an anderer Stelle anfassen.
- Umlaute und `&` im Markup als Entity (`&amp;`), sonst zerlegt es Validatoren.

## Neue Unterseite anlegen

1. Datei im Root (`leistungen.html`), `lang="de"`, Head wie oben, `canonical` auf `https://nikitakrebs.de/leistungen`.
2. Eintrag in `sitemap.xml` — **ohne** `.html`, passend zu `cleanUrls`:
   ```xml
   <url><loc>https://nikitakrebs.de/leistungen</loc><priority>0.6</priority></url>
   ```
3. Interne Links auf die saubere URL setzen (`href="/leistungen"`), nicht auf `.html` — das spart den 308-Redirect.
4. Footer-Link ergänzen, wenn die Seite dauerhaft erreichbar sein soll.
5. Braucht die Seite die Animationen? Wenn nicht, wie `impressum.html` bauen: eigener `<style>`-Block im Head, nur Montserrat, kein `main.js`, kein GSAP. Das hält Rechtsseiten schnell und unabhängig.

Rechtsseiten (`impressum.html`, `datenschutz.html`) tragen
`<meta name="robots" content="noindex,follow">` — sie sollen erreichbar, aber
nicht indexiert sein. Sie stehen trotzdem in der Sitemap, damit Crawler sie finden.

## Nicht kaputt machen

- `robots.txt` erlaubt alles und verweist auf die Sitemap. Keine `Disallow`-Regeln ergänzen, ohne dass es dafür einen Grund gibt.
- Sektions-IDs (`#weg`, `#ventures`, `#arbeiten`, `#galerie`, `#kontakt`) sind geteilte Links. Beim Umbenennen einer ID prüfen: Menü, Footer, Ankerlinks — und im Zweifel die alte ID als leeres `<span id="alt">` stehen lassen.
- `vercel.json` setzt Security-Header (`X-Frame-Options: DENY`, `nosniff`, Referrer-Policy). Nicht entfernen; wenn eine Einbettung nötig wird, gezielt für die betroffene Route lockern.

## Optional: strukturierte Daten

Für eine Personenmarke lohnt ein JSON-LD-Block im `<head>` von `index.html`:

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Person","name":"Nikita Krebs",
 "url":"https://nikitakrebs.de/","jobTitle":"Gründer",
 "sameAs":["https://www.instagram.com/nikita.krbs/","https://www.linkedin.com/in/nikita-krebs-a7625b337/"]}
</script>
```

Nur einbauen, wenn die Angaben stimmen und gepflegt werden — falsche
strukturierte Daten schaden mehr als keine.

## Prüfen

```bash
node .claude/skills/qa-deploy/scripts/check-assets.mjs   # tote lokale Links/Assets
grep -n '<title>\|name="description"\|canonical' *.html  # Head-Konsistenz
```
