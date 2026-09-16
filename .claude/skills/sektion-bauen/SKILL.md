---
name: sektion-bauen
description: Neue Sektion auf der Landingpage bauen oder eine bestehende umbauen (Block in index.html, Styles in style.css, Verhalten in main.js). Nutze das bei Aufgaben wie "neue Sektion", "Abschnitt hinzufügen", "Block einbauen", "Sektion umbauen/verschieben/löschen" auf nikitakrebs.de.
---

# Sektion bauen

Die Seite ist eine One-Page-Landing aus drei Dateien: `index.html` (Markup),
`style.css` (alle Styles), `main.js` (alle Animationen, eine IIFE). Es gibt
keinen Build-Schritt — was im Browser läuft, steht genau so im Repo.

## Reihenfolge

1. **HTML** in `index.html` an die richtige Stelle setzen (Reihenfolge = Scroll-Reihenfolge)
2. **CSS** als eigener Block ans Ende von `style.css`
3. **JS** nur, wenn die Sektion echtes Verhalten braucht — sonst reicht `data-reveal`

## 1. Markup

Jede Sektion folgt diesem Muster:

```html
<!-- ============ NAME ============ -->
<section class="name" id="anker" data-nav-theme="light">
  <div class="name__inner">
    <h2 class="sec-h" data-reveal>Überschrift</h2>
    <p class="name__p" data-reveal>Fließtext.</p>
  </div>
</section>
```

Regeln:

- **Kommentarbalken** `<!-- ============ NAME ============ -->` vor jeder Sektion, Name in Großbuchstaben.
- **BEM**: `block`, `block__element`, `block--modifier`. Kein Utility-Soup, keine Tailwind-Klassen.
- **`data-nav-theme="light|dark"` ist Pflicht.** Daraus schaltet `main.js` die Nav-Farbe (`.nav.is-dark`) und die Safari-Statusleiste (`meta[name=theme-color]`). Fehlt es, bleibt die Nav auf dem Zustand der Sektion davor — auf dunklem Grund heißt das unsichtbares Logo.
- **`id`** nur, wenn die Sektion im Menü oder in einem Anker-Link auftaucht. Bestehende IDs: `weg`, `ventures`, `frame`, `grid`, `venture`, `arbeiten`, `partner`, `galerie`, `kontakt`.
- **`data-reveal`** an jedes Element, das beim Reinscrollen auftauchen soll (siehe `scroll-motion`).
- Text ist Deutsch, Überschriften in `.sec-h` (Barlow Condensed, uppercase), Zeilenumbrüche mit `<br>` sind erlaubt und werden bewusst gesetzt.
- Bilder/Videos immer mit `poster`, `alt`, `width`/`height` — Details in `medien-assets`.

## 2. Menü nachziehen

Wenn die Sektion eine eigene `id` bekommt und ins Menü soll, im `.menu__links`-Block
ergänzen — die Nummerierung ist fortlaufend und muss stimmen:

```html
<a href="#anker" data-menu-link data-img="assets/img/poster-xyz.jpg"><small>06</small>Titel</a>
```

`data-img` ist das Vorschaubild beim Hover und muss existieren (JPG, nicht WebP —
die Menü-Vorschau lädt die JPG-Variante).

## 3. Styles

Neuer Block ans Ende von `style.css`, im Stil der bestehenden:

```css
/* ---------- name ---------- */
.name{padding:clamp(80px,12vh,160px) var(--gutter);background:var(--paper)}
.name__inner{max-width:1200px;margin:0 auto}
@media (max-width:760px){.name__inner{max-width:none}}
```

- **Nur Tokens** (`--paper`, `--ink`, `--accent`, `--display`, `--gutter`, `--r`) — keine losen Hex-Werte. Siehe `design-system`.
- **`clamp()`** für Größen und Abstände statt fixer px und statt vieler Breakpoints.
- Breakpoints im Projekt: `1024px`, `900px`, `860px`, `760px` (Mobile). Media Query direkt im eigenen Block, nicht in den globalen Responsive-Abschnitt weiter oben.
- Style-Datei ist eine Zeile pro Regel, kompakt — dem Stil folgen, nicht neu formatieren.

## 4. Verhalten

Nur wenn nötig. Jede Gruppe in `main.js` lebt in der bestehenden IIFE und beginnt
mit einem Kommentar. Muster:

```js
/* ---------- name ---------- */
$$('[data-name]').forEach((el) => {
  // ...
});
```

- `$` / `$$` sind die Helfer oben in der Datei (`querySelector` / `querySelectorAll` als Array).
- Immer defensiv: `const el = $('[data-name]'); if (!el) return;` — die Datei läuft auch auf Seiten ohne diese Sektion.
- Selektor über `data-*`-Attribut, nie über die CSS-Klasse. Klassen sind für Styles da, `data-*` für JS.
- Animationen: siehe `scroll-motion`.

## Checkliste vor dem Commit

- [ ] `data-nav-theme` gesetzt und passend zum Hintergrund
- [ ] Menü-Eintrag + Nummerierung stimmen (falls Sektion im Menü)
- [ ] `data-reveal` an den sichtbaren Elementen
- [ ] Bilder/Videos: `alt`, `poster`, `width`/`height`, `loading="lazy"` (außer Hero)
- [ ] Bei 390px, 768px und 1440px durchgescrollt, kein horizontaler Overflow
- [ ] Keine Fehler in der Konsole (`qa-deploy` → `check-assets.mjs` und Screenshots)
