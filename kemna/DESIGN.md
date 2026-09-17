# DESIGN.md — KEMNA

Relaunch-Konzept für die KEMNA-Gruppe: Verkehrswegebau, Asphaltproduktion und
Rohstoffgewinnung, gegründet 1867, Hauptverwaltung Pinneberg. Diese Datei ist
die visuelle Sprache der Seite im [DESIGN.md](https://getdesign.md/what-is-design-md)-Format
— Token, Regel und Begründung an einer Stelle — damit ein Design-Agent neue
Unterseiten oder Microsites bauen kann, die zum Rest passen.

**Stimme:** Deutsch, Wir-Form, sachlich. Kurze Sätze, konkrete Vorgänge, keine
Bauträger-Lyrik. Das Unternehmen redet als „wir", nicht über sich in der dritten
Person. Zahlen werden genannt, nicht behauptet.

**Lebende Referenz:** `index.html`, `style.css`, `main.js` in diesem Ordner.
Wenn Seite und Datei sich widersprechen, gewinnt die Seite und diese Datei wird
nachgezogen.

---

## 1. Thema & Atmosphäre

Industriell und geerdet, nicht verspielt. Die Seite ist aus Asphalt, Beton und
Markenrot gebaut: ein fast schwarzer Hero mit Straßenperspektive, dann
ein warmes Betongrau als Arbeitsfläche, dazwischen dunkle Kapitel. Der Kontrast
zwischen riesiger Condensed-Versalie und kleinem, ruhigem Fließtext trägt die
ganze Seite.

Ein Foto trägt den Hero: die Mischanlage bei Dämmerung, unter Straßenlinien
und Wortmarke, mit einem Verlauf von unten und einer Abdunklung hinter dem
Text. Der Text steht immer vorn. Alle anderen Bildelemente sind aus Code
erzeugte SVG: Höhenlinien eines Steinbruchs, eine Punktwolke als
Asphaltkörnung, der Schichtaufbau einer Straße. Sie erklären, sie dekorieren
nicht. Logos von Gruppe und Partnern liegen als Karten auf Weiß in einem
laufenden Band, gleich hoch, gleich breit, Logo auf höchstens 64 % der Karte.

Dichte: niedrig. Ein Gedanke pro Bildschirm. Die Sektionen wechseln bewusst
zwischen hell und dunkel wie Kapitel.

## 2. Farben

| Token | Hex | Rolle |
|---|---|---|
| `--paper` | `#F1EFE9` | Standard-Hintergrund, Betongrau mit Wärme |
| `--paper-2` | `#E6E3DB` | abgesetzte Flächen (Gruppen-Sektion) |
| `--ink` | `#111214` | Text, Rahmen, Icons |
| `--ink-2` | `#55575B` | Fließtext, Labels auf Weiß |
| `--ink-3` | `#8C8E92` | nur Deko, **nie für Text** (3,28:1) |
| `--accent` | `#B5163F` | Markenrot aus dem Logo als **Fläche**: Buttons, Karriere-Sektion, Bänder; Text darauf ist `--paper` |
| `--accent-2` | `#8F1132` | dunkleres Rot für Rahmen und Tiefe von `--accent` |
| `--accent-light` | `#FF5C6C` | helles Rot für **Schrift und Akzente auf dunklem Grund** (6,3:1) |
| `--accent-text` | `#A3123A` | rote **Schrift** auf hellem Grund (6,5:1) |
| `--dark` | `#101214` | dunkle Sektionen, Hero, Footer |
| `--dark-2` | `#1A1D21` | Flächen in dunklen Sektionen |

Regeln, die hier zweimal falsch gemacht wurden:

1. `--accent` und `--accent-2` sind **Flächenfarben**. Als Text auf `--paper`
   fallen sie durch die Kontrastprüfung. Für rote Schrift auf Hell gibt es
   `--accent-text`. Auf `--dark` darf `--accent` Text sein (11,3:1).
2. `--ink-3` ist zu hell für Text. Labels auf Weiß nehmen `--ink-2`.
3. Jede Sektion braucht `data-nav-theme="light|dark"`, sonst bleibt die
   Navigation auf dem Zustand der Sektion davor. Die rote Karriere-Sektion
   trägt zusätzlich `data-nav-accent="ink"`, weil der rote CTA sonst in ihr
   verschwindet.

## 3. Typografie

Zwei Familien, ein Google-Fonts-Link.

| Token | Familie | Einsatz |
|---|---|---|
| `--display` | Barlow Condensed 600–900 | Headlines, Buttons, Zahlen, Navigation — **immer uppercase** |
| `--body` | Barlow 400–700 | Fließtext, Labels, Listen |
| `--mono` | SF Mono / Menlo | nur die Sektions-Tags |

Größen kommen aus `clamp()`, nicht aus Media Queries:

| Element | Größe | Laufweite |
|---|---|---|
| Hero-Wortmarke | `clamp(100px,22vw,420px)` | `line-height:.8`, `-.03em`, `white-space:nowrap` |
| Sektions-Headline `.sec-h` | `clamp(52px,8vw,130px)` | `line-height:.95`, `-.015em` |
| Callout / Karriere | `clamp(60px,10vw,190px)` | `line-height:.88`, `-.02em` |
| Sub-Headline `h3` | `clamp(26px,2.6vw,56px)` | `line-height:.95` |
| Lead | `clamp(16px,1.3vw,19px)` | `line-height:1.6` |
| Fließtext | `15–15.5px` | `line-height:1.6–1.65` |
| Eyebrow / Label | `11–12px`, 700 | `letter-spacing:.12–.2em`, uppercase |

- Headlines laufen eng und negativ, Labels weit und positiv. Dieser Gegensatz
  **ist** das Typosystem.
- Display-Typo ist ausnahmslos Versal. Gemischte Schreibweise in einer Headline
  liest sich wie ein Fehler.
- Alle Headlines tragen `text-wrap:balance`, Absätze `text-wrap:pretty`. Damit
  regelt der Browser den Flattersatz, nicht ein handgesetztes `<br>`.
- Umbrüche in Headlines werden trotzdem dort gesetzt (`<br>`), wo sie inhaltlich
  gehören — der Hero-Claim und die Sektionstitel.
- Zahlen in den Kennzahlen laufen `font-variant-numeric:tabular-nums`, sonst
  zappeln die Ziffern beim Hochzählen.
- Neue Schnitte müssen in den Fonts-Link, sonst rendert der Browser synthetisch
  fett.

## 4. Komponenten

**Buttons** — `.btn`: `--display`, 800, uppercase, `20px`, `padding:16px 26px`,
`border-radius:12px`. Hover nur hinter `@media (hover:hover) and (pointer:fine)`,
Druckfeedback über `:active{transform:scale(.97)}` in `160ms var(--ease-out)`.

- `.btn--accent`: rote Fläche, `2px solid var(--accent-2)`, Schrift `--paper`. Der Haupt-CTA.
- `.btn--ink`: dunkle Fläche, für helle und rote Sektionen.
- `.btn--outline`: nur Rahmen, als zweite Option neben einem gefüllten Button.
- `.btn--lg`: `24px`, `padding:20px 32px` — Call-to-Action auf Seitenebene.

**Tags** (`.tag`): Mono, `13px`, Rahmen statt Fläche, sitzen über jeder
Sektions-Headline und benennen das Kapitel.

**Karten** (`.project`, `.callout__card`): weiße Fläche, `1px solid rgba(17,18,20,.12)`,
`border-radius:18px`. Hover hebt `translateY(-8px)` in `250ms` — nicht länger,
das ist ein Alltagszustand.

**Erklärgrafiken**: SVG mit `viewBox="0 0 800 600"` in einem `aspect-ratio:4/3`-
Rahmen auf Weiß. Beschriftungen bleiben links vom rechten viewBox-Rand mit
Sicherheitsabstand — bei Ersatzschriften laufen sie sonst heraus.

**Listen mit Quadrat** (`.field__list`): `10px` rotes Quadrat statt Punkt.
Das Quadrat ist die einzige Aufzählungsform der Seite.

## 5. Layout

- Seitenrand ist ein Token: `--gutter: clamp(20px,3vw,48px)`. Jede Sektion nutzt ihn.
- Vertikaler Rhythmus: `clamp(90px,10vw,150px)`, bis `clamp(110px,14vw,200px)` für den Kontakt-Callout.
- Hero, Intro und die gepinnte Kette füllen `100svh` mit `100vh`-Fallback davor.
- Maß: `1100–1300px` für zentrierte Blöcke, `440–540px` für Absätze neben Medien.
- Raster: Zickzack `120px 1fr 1.15fr` für die Leistungen (gespiegelt bei geraden
  Zeilen), drei Spalten für die Einsatzbereiche mit einer doppelt breiten
  Referenzkarte, ein horizontal gepinntes Band für die Wertschöpfungskette.
- Weißraum trennt, nicht Linien. Wo Linien nötig sind: `1px rgba(17,18,20,.15)`.
- Ankerziele tragen `scroll-margin-top:clamp(80px,12vh,120px)`, damit sie nicht
  unter der Navigation landen.

## 6. Tiefe

Die Fläche ist flach. Tiefe entsteht aus Größe, Überlappung und Bewegung.

| Einsatz | Wert |
|---|---|
| Karten-Hover | `0 40px 70px -40px rgba(17,18,20,.5)` |
| Aktiver Punkt an der Kette | `0 0 0 6px rgba(242,183,5,.18), 0 0 26px 8px rgba(242,183,5,.45)` |
| Fokusring | `outline:3px solid var(--ink)`, auf Dunkel `var(--accent)`, `outline-offset:3px` |

Radien: `8px` Tags, `12px` Buttons, `14px` (`--r`) Medien, `18px` Karten,
`50%` Punkte. Rahmen sind entweder haarfein (`1px rgba(17,18,20,.12)`) oder
Plakat (`1.5–2px solid var(--ink)`). Dazwischen nichts.

## 7. Bewegung

Zwei Easing-Tokens, mehr braucht die Seite nicht:

```css
--ease-out:cubic-bezier(.23,1,.32,1);      /* Ein- und Austritte, Druckfeedback */
--ease-in-out:cubic-bezier(.77,0,.175,1);  /* Bewegung auf dem Schirm */
```

In GSAP entsprechen sie `power4.out` und `power3.inOut`. Reveals laufen
`power3.out`, das Intro `power4.out`, Zustandswechsel `power2.inOut`.

- **Marketing darf lang sein.** Scroll-Reveals von 0,8 bis 1,3 Sekunden sind hier
  richtig. Die 300-ms-Regel gilt nur für Bedienelemente: Burger, Buttons, Hover.
- **Hover und Druck sind schnell**: 160–250 ms. Der Kartenlift bleibt bei 250 ms.
- **Austritte sind schneller als Eintritte.** Das Menü schließt mit `timeScale(1.6)`.
- **Nie aus `scale(0)`.** Die Asphaltkörnung wächst ab `0.4`, die Karriere-Streifen
  ab `scaleY 0.08` aus ihrer Grundlinie.
- **Endlosschleifen pausieren**, sobald ihre Sektion aus dem Bild ist
  (`loopWhileVisible` in `main.js`).
- **Keine Layout-Eigenschaften animieren.** Nur `transform` und `opacity`.
- **`will-change` nur auf dauerhaft bewegten Elementen**: Hero-Wortmarke, die
  beiden Laufbänder, die Kette, die Navigation.
- Die Navigation weicht beim Runterscrollen nach oben und kommt beim Hochscrollen
  zurück. Eine dauerhaft sichtbare Leiste verdeckt sonst in jeder Sektion die
  obere rechte Ecke.

## 8. Drei Zustände, die immer funktionieren müssen

| Zustand | Klasse | Verhalten |
|---|---|---|
| Kein JS, CDN blockiert | `.no-js` | Alles sichtbar. Die Kette rendert als Liste statt horizontal gepinnt. |
| JS-Fehler zur Laufzeit | `.js-failed` | Der betroffene Block fällt aus, der Rest läuft weiter, versteckte Inhalte werden aufgedeckt. |
| Bewegung reduzieren | `.rm` | Keine Pins, keine Scrub-Sequenzen, keine Endlosschleifen. Farb- und Deckkraftwechsel bleiben. |

Jeder Block in `main.js` läuft in `safe()`. Kein Element darf dauerhaft
unsichtbar bleiben, weil eine Animation nicht gelaufen ist. Konkret heißt das:
kritische Inhalte — Telefonnummer, Anschrift, Rechtstexte — bekommen **nie** ein
`data-reveal`.

## 9. Responsive

- Breakpoints: `1024px` (Layout bricht um), `900px`, `760px` (Handy). Desktop ist
  die Basis, Media Queries schrauben nach unten. Dazu `@media (max-height:620px)`
  für das Menü im Querformat.
- Bei `≤1024px` wird der Zickzack zu `90px 1fr` mit Medien unter dem Text.
- Bei `≤760px` ist alles einspaltig, die Rauschtextur im Hero entfällt, die
  Hero-Metazeile verschwindet, der Telefon-CTA wird zum Icon-Button.
- `100svh`, nie `100vh` allein. `viewport-fit=cover` plus `env(safe-area-inset-*)`
  für Navigation, Hero-Ecken und Footer.
- Touch-Ziele mindestens 44px, Navigationselemente 52–60px.
- Hover-Regeln ausnahmslos hinter `@media (hover:hover) and (pointer:fine)`,
  sonst kleben sie nach dem Tippen.

## 10. Prompts, die mit dieser Datei auf System bleiben

- „Baue eine Referenzseite für ein Autobahnprojekt mit diesem Designsystem:
  dunkler Hero mit Kennzahlen, dreispaltiger Bauablauf, Kontakt-Callout."
- „Ergänze eine Standortübersicht. Betongrauer Grund, eine weiße Karte je
  Niederlassung, Rot nur als Akzent auf der Kartenmarkierung."
- „Entwirf die Karriere-Unterseite: gleiches Typosystem, Rot als Grundfläche,
  Stellenliste als Karten, ohne neue Farben."
- „Schreib die Mobilregeln für diese Sektion" — erwartet Umbruchreihenfolge,
  Seitenrand, Touch-Ziele und Reduced-Motion-Verhalten.

Wo diese Datei nichts hergibt, gilt die ruhigere Variante: weniger Chrome,
weniger Farben, mehr Raum, längere Bewegung.
