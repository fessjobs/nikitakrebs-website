---
name: design-system
description: Farben, Typografie, Buttons, Abstände und Breakpoints von nikitakrebs.de. Nutze das, bevor du CSS schreibst oder änderst, bei Fragen nach Farbwerten, Schriftgrößen, Tokens, Look and Feel, und wenn eine neue Komponente zum Rest der Seite passen soll.
---

# Design-System

Alle Tokens stehen in `:root` ganz oben in `style.css`. Neue Werte kommen dort
hinein oder gar nicht — im Rest der Datei stehen nur `var(--…)`.

## Farben

| Token | Wert | Wofür |
|---|---|---|
| `--paper` | `#F5F4EF` | Standard-Hintergrund (warmes Off-White) |
| `--paper-2` | `#ECEBE4` | abgesetzte Flächen auf hellem Grund |
| `--ink` | `#0B0B0C` | Text, Rahmen, Icons |
| `--ink-2` | `#5A5A5C` | Fließtext, sekundär |
| `--ink-3` | `#8A8A8C` | Meta, Captions, Deko |
| `--accent` | `#6AAEFD` | Flächen: Button-Hintergrund, Highlights, Kacheln |
| `--accent-2` | `#4E9BFC` | Hover/Tiefe von `--accent` |
| `--accent-text` | `#1F6BD6` | **Blaue Schrift auf hellem Grund** |
| `--dark` | `#0C0E12` | dunkle Sektionen |
| `--dark-2` | `#15181F` | Karten/Flächen in dunklen Sektionen |

Zwei Regeln, die immer wieder falsch gemacht werden:

1. `--accent` ist eine **Flächenfarbe**. Als Textfarbe auf `--paper` hat sie zu
   wenig Kontrast — dafür `--accent-text`. Auf dunklem Grund darf `--accent`
   Text sein.
2. Dunkle Sektionen bekommen `data-nav-theme="dark"`, sonst bleibt die Nav
   schwarz auf schwarz. Der Hero-Dunkelzustand nutzt zusätzlich `#1B2540` —
   der Wert steht hart in `main.js` in der Hero-Timeline, nicht in den Tokens.

## Schrift

Vier Familien, alle über einen Google-Fonts-Link im `<head>`:

| Token | Familie | Einsatz |
|---|---|---|
| `--display` | Barlow Condensed 600–900 | Headlines, Buttons, Zahlen — **immer uppercase** |
| `--body` | Montserrat 400–700 | Fließtext, Labels, Navigation |
| `--script` | Caveat 600 | Handschrift-Akzente, Unterschrift |
| `--serif` | Instrument Serif | Kursive Betonungen in Callouts |

Keine fünfte Schrift dazunehmen. Neue Gewichte müssen in den Fonts-Link in
`index.html` — sonst rendert der Browser synthetisch fett und es sieht matschig aus.

Größen kommen aus `clamp()`, nicht aus Media Queries:

```css
.sec-h   { font-size:clamp(52px,8vw,130px) }   /* Sektions-Headline, .sec-h existiert schon */
.intro__h{ font-size:clamp(48px,7.2vw,116px) }
/* Eyebrow über einer Headline: */
.x__eyebrow{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-text)}
/* Fließtext: */
.x__p{font-size:clamp(16px,1.3vw,19px);line-height:1.6;color:var(--ink-2)}
```

Headlines laufen eng: `line-height:.9` bis `1`, `letter-spacing:-.015em`.
Eyebrows laufen weit: `letter-spacing:.14em`.

## Abstände, Radien, Buttons

- `--gutter: clamp(20px,3vw,48px)` — der seitliche Rand der Seite. Jede Sektion nutzt ihn: `padding: … var(--gutter)`.
- `--r: 14px` — Standard-Radius. Karten liegen bei 14–22px, Buttons bei 12–14px.
- Vertikale Sektionsabstände: `clamp(80px,12vh,160px)`.
- Buttons sind fertig, nicht neu bauen: `.btn` + `.btn--accent` (blau, dunkler Rahmen) oder `.btn--ghost` (Outline, für dunklen Grund), `.btn--lg` für Call-to-Actions. Hover hebt um `translateY(-2px)`.

## Breakpoints

`1024px` (Layout-Umbruch), `900px`, `860px`, `760px` (Mobile). Mobile-First wird
hier **nicht** gemacht — Desktop ist die Basis, Media Queries schrauben nach unten.
Prüfe jede Änderung bei 390px Breite.

## Bewegung

`prefers-reduced-motion:reduce` schaltet global alle CSS-Transitions und
-Animationen ab (Block in `style.css`). JS-Animationen respektieren die
`reduced`-Variable in `main.js`. Verlasse dich nicht darauf, dass eine
Animation Inhalt einblendet, der sonst unsichtbar bleibt — Elemente mit
`opacity:0` im CSS brauchen immer einen Pfad, der sie sichtbar macht.
