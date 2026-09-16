---
name: scroll-motion
description: Scroll-Animationen auf nikitakrebs.de mit GSAP, ScrollTrigger und Lenis - Reveals, Pin-Sektionen, Scrub-Timelines, Parallax, Autoplay-Videos. Nutze das bei Aufgaben wie "Animation hinzufügen/ändern", "Element soll beim Scrollen einfliegen", "Sektion pinnen", "Effekt ruckelt", "Animation springt beim Resize".
---

# Scroll & Motion

Stack (alles per CDN in `index.html`, keine Buildkette):
GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.14, Three.js nur für den Hero.
Der gesamte Code liegt in **einer IIFE** in `main.js`, gegliedert durch
`/* ---------- name ---------- */`-Kommentare. Neue Animation = neuer Block am
passenden Ort, keine zweite Datei, kein Modul-Import.

## Grundregeln

- `$` und `$$` benutzen (oben in der Datei definiert), Selektoren immer über `data-*`.
- Jeder Block startet mit einem Guard: `const el = $('[data-x]'); if (!el) return;`
- Zwei globale Flags stehen bereit:
  - `reduced` — `prefers-reduced-motion`
  - `isTouch` — `(hover: none)`, d.h. Handy/Tablet
- Lenis läuft **nur** auf Desktop ohne `reduced` (`window.__lenis`). Auf Touch scrollt der Browser nativ. Nie `scroll-behavior:smooth` zusätzlich setzen — das kollidiert.
- Programmatisch scrollen: die vorhandene Hilfe im Block *programmatic scroll* nutzen (GSAP-getrieben), nicht `scrollIntoView()`.

## Einfaches Einblenden

Kein JS nötig. `data-reveal` ans Element — der Reveal-Block animiert es bei
`top 88%` auf sichtbar:

```html
<h2 class="sec-h" data-reveal>Überschrift</h2>
```

`[data-reveal]` startet im CSS mit `opacity:0`. **Achtung:** Wenn GSAP nicht lädt
(CDN blockiert, Offline-Demo), bleibt jeder Reveal-Inhalt unsichtbar. Der
CSS-Fallback `.no-js [data-reveal]` existiert, aber niemand setzt die Klasse —
für kritischen Inhalt (Kontaktdaten, rechtliche Hinweise) also kein `data-reveal`
verwenden.

## Scrub-Timeline an einer Sektion

Das Muster der `explain`- und Hero-Sektionen: Timeline hängt am Scroll-Fortschritt.

```js
const tl = gsap.timeline({ scrollTrigger: {
  trigger: sec, start: 'top 80%', end: 'bottom 40%',
  scrub: 0.6, invalidateOnRefresh: true
}});
tl.to(el, { opacity: 1, y: 0, ease: 'none' }, 0);
```

- `scrub: 0.6` gibt der Bewegung Nachlauf; `scrub: true` klebt hart am Scroll.
- Innerhalb einer Scrub-Timeline `ease:'none'` oder sanfte Eases — sonst wirkt es beim Rückwärtsscrollen falsch.
- Standard-Eases im Projekt: `power3.out` für Reveals, `power4.out` für Intro, `power2.inOut` für Zustandswechsel.

## Sektion pinnen

```js
gsap.timeline({ scrollTrigger: {
  trigger: sec, start: 'top top', end: () => isTouch ? '+=100%' : '+=140%',
  pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, fastScrollEnd: true
}});
```

Was hier schiefgeht und wie man es vermeidet:

- **Werte, die von `innerWidth`/`innerHeight` abhängen, als Funktion übergeben** (`width: () => innerWidth * 0.46`), nie als fixe Zahl. Sonst stimmt nach einem Resize oder dem Einblenden der Mobile-Browserleiste nichts mehr.
- `invalidateOnRefresh: true` gehört zu jedem Trigger mit solchen Werten.
- Beim Kombinieren von Scrub und Intro-Animation: Startwerte explizit mit `fromTo(...)` setzen, sonst springt die Timeline beim ersten Rendern (siehe Kommentar in der Hero-Timeline).
- `ScrollTrigger.config({ ignoreMobileResize: true })` ist gesetzt — die Adressleiste soll kein Refresh auslösen.
- Nach dem Nachladen von Medien oder Layout-Änderungen: `ScrollTrigger.refresh()`.

## Parallax

```js
gsap.fromTo(el, { y: amp * sp }, { y: -amp * sp, ease: 'none',
  scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
```

Amplitude auf Mobile deutlich reduzieren (Collage: 160px Desktop, 36px Mobile) —
sonst schiebt Parallax Inhalte aus dem Bild.

## Videos

Markup: `muted loop playsinline preload="none" data-autoplay poster="…"`.
Der Autoplay-Block startet/pausiert per IntersectionObserver (mit großzügigem
`rootMargin`, damit es auch in gepinnten Horizontal-Sektionen läuft) und hat zwei
Netze: `visibilitychange` und ein 1,5-Sekunden-Intervall. Wenn ein neues Video
nicht spielt, liegt es fast immer an fehlendem `muted` oder `playsinline`, nicht
am Observer.

## Performance

- `will-change` nur auf Elementen, die wirklich dauerhaft animiert werden (Hero-Figur, Menü-Links, Topo-Pfade) — nicht pauschal.
- In `onUpdate`-Callbacks keine Layout-Messungen (`getBoundingClientRect`) und keine Klassen-Toggles ohne Vergleich: die Hero-Timeline prüft erst den aktuellen Wert, bevor sie `theme-color` neu setzt.
- Transformationen animieren (`x`, `y`, `scale`, `opacity`), nicht `top`/`left`/`width` — Ausnahme sind die bewusst gescrubten Frame-Maße im Hero.

## Testen

Nach jeder Motion-Änderung: einmal langsam komplett runter **und wieder hoch**
scrollen, dann Fenster in der Breite ziehen und erneut scrollen. Die meisten
Fehler zeigen sich beim Rückwärtsscrollen oder nach einem Resize. Screenshots
über mehrere Scroll-Positionen: siehe `qa-deploy`.

## Zusammenspiel mit den `animate`-Skills

Im Projekt liegen zusätzlich die Animations-Skills von Emil Kowalski
(`animate`, `review-animations`, `improve-animations`,
`find-animation-opportunities`, `animation-vocabulary`, `apple-design`,
`emil-design-eng`, `mobile-native`). Sie liefern die **Entscheidungen**
(animieren oder nicht, welche Kurve, welche Dauer, welche Eigenschaft),
dieser Skill liefert die **Mechanik für diesen Stack** (GSAP statt CSS/Motion,
ScrollTrigger statt `@starting-style`).

Kurven übersetzen sich so:

| Emils Token | Entspricht | In GSAP |
|---|---|---|
| `--ease-out: cubic-bezier(.23,1,.32,1)` | easeOutQuint | `power4.out` |
| `--ease-in-out: cubic-bezier(.77,0,.175,1)` | easeInOutQuart | `power3.inOut` |
| `--ease-drawer: cubic-bezier(.32,.72,0,1)` | iOS-Drawer | nur über `CustomEase.create()` |

Das Projekt nutzt `power3.out` für Reveals, `power4.out` für das Intro und
`power2.inOut` für Zustandswechsel — das deckt sich mit „starkes ease-out für
Eingänge, nie `ease-in` auf UI".

**Ein Unterschied, der wichtig ist:** Die Regel „UI-Animationen bleiben unter
300 ms" gilt für Interface-Elemente — Dropdowns, Tooltips, Buttons. Diese Seite
ist eine Marketing-Landingpage; die einsekündigen Reveals, die gescrubbte
Hero-Sequenz und die Marquees sind bewusst länger und fallen unter
„Marketing/explanatory: can be longer". Nicht auf 200 ms zusammenkürzen.
Was dagegen auch hier gilt: `transform` und `opacity` statt Layout-Eigenschaften,
nie `scale(0)`, Transform-Origin am Auslöser, und Reduced Motion gehört zur
Animation, nicht in einen Folge-Commit.

Für mobile Eigenheiten (100vh, Tap-Highlight, Safe Areas, hängende
Hover-Zustände) ist `mobile-native` zuständig — die Seite nutzt bereits `100svh`
und `viewport-fit=cover`.
