# bbbausanierung.de

Neuauftritt der BB Bausanierung GmbH (Hamburg-Hummelsbüttel) als statische
One-Page-Landing im Stack von nikitakrebs.de: HTML/CSS/JS ohne Build,
GSAP + ScrollTrigger + Lenis, Deploy auf Vercel.

- `index.html` / `style.css` / `main.js` – die Seite
- `impressum.html`, `datenschutz.html` – eigenständig, ohne `main.js`
- `assets/fonts/` – Schriften, `assets/js/` – GSAP/ScrollTrigger/Lenis, `assets/img/` – Logo, Favicons, OG-Bild
- Lokal: `python3 -m http.server 5190` aus diesem Ordner, dann http://127.0.0.1:5190
- Deploy: eigenes Vercel-Projekt mit **Root Directory `bbbausanierung`**, dann `npx vercel --prod --yes`
- Prüfen: `node ../.claude/skills/qa-deploy/scripts/check-assets.mjs .` und
  `node ../.claude/skills/qa-deploy/scripts/shots.mjs`

## Keine fremden Server

Schriften und Skripte liegen **lokal** unter `assets/`. Die Seite baut im Betrieb
keine einzige Verbindung zu Dritten auf — kein Google Fonts, kein CDN. Das ist
Absicht:

- **Rechtlich**: Das dynamische Einbinden von Google Fonts überträgt die IP des
  Besuchers an Google. Das LG München I (20.01.2022 – 3 O 17493/20) hat dafür
  Schadensersatz zugesprochen; ein berechtigtes Interesse wurde ausdrücklich
  verneint, weil die Schriften selbst gehostet werden können. Bei einer
  deutschen Firmenseite ist Selbsthosten daher die sichere Variante — und die
  Datenschutzerklärung wird dadurch kurz und belegbar.
- **Robust**: Die Seite funktioniert auch hinter Adblockern und Firmenproxys,
  die cdnjs oder jsDelivr blockieren.

Schriften sind auf das **latin-Subset** beschnitten (5 Dateien, ~140 KB);
Deutsch braucht kein latin-ext. Montserrat ist eine Variable Font und deckt
400–700 mit einer Datei ab. Neue Zeichen außerhalb von latin (z. B. polnische
oder türkische Namen) brauchen ein neues Subset.

Wenn eine Schriftstärke dazukommt, muss eine passende `@font-face`-Regel her —
sonst rechnet der Browser sie synthetisch hoch und es sieht matschig aus.
Aktuell geladen: Barlow Condensed 800 + 900, Montserrat 400–700 (variabel),
Instrument Serif 400 normal + kursiv.

## Ohne JavaScript lesbar

Das Inline-Skript im `<head>` setzt `class="js"` auf `<html>`. Nur unter `.js`
werden `[data-reveal]`-Inhalte überhaupt versteckt. Fällt `main.js` aus, lädt
GSAP nicht, oder steht „Bewegung reduzieren“ auf an, nimmt das Skript `.js`
wieder weg und die Seite steht sofort vollständig da. So blitzt beim Laden
nichts auf, und ohne JS fehlt nur die Animation, nicht der Inhalt.

`prefers-reduced-motion` schaltet den kompletten Animationspfad ab, nicht nur
die CSS-Transitions: Menü, Nav-Farbwechsel und Ankerlinks funktionieren dann
ohne eine einzige Bewegung.

## Inhalte

Alle Texte der Startseite stammen von der alten Seite (www.bbbausanierung.de)
und den Firmen- und Handelsregistereinträgen: Gründung 2003, Leistungsliste,
Referenzprojekte (Flaßheide, Schemmannstraße, Tornquiststraße, Neuer Luruper
Weg, Oderfelder Straße, Hohenzollernring, Tresckowstraße, Auwiese) und
Kontaktdaten.

**Neu formuliert und noch nicht freigegeben** ist die Sektion „So arbeiten wir“
(Besichtigung → Konzept → Ausführung → Übergabe). Sie beschreibt einen Ablauf,
den das Unternehmen so bestätigen muss.

## Probeweise eingebaut: Streifen "Die Arbeiter"

Über dem Header liegt ein temporärer Block mit drei Fotos
(`assets/img/crew-test-1..3.jpg`). Er ist **nicht freigegeben**:

- Die Vorlagen waren private Aufnahmen bzw. Messenger-Screenshots. Telefon-
  Oberfläche (Statusleiste, Uhrzeit-Bubble, Musik-Sticker) ist weggeschnitten,
  die Bilder auf 900 px Breite gerechnet.
- Die Einwilligung der Abgebildeten nach § 22 KUG liegt laut Auftraggeber vor.
  Das Repository ist öffentlich, die Bilder stehen damit dauerhaft in der
  Git-Historie.
- Das dritte Foto ist mit "Geschäftsführer" beschriftet. Der Name muss zum
  Impressum passen — dort steht derzeit Günter Blöß.
- Inhaltlich zeigen sie kein Handwerk. Für "Die Arbeiter" auf einer
  Sanierungsseite wären Aufnahmen auf der Baustelle das Überzeugende.

**Entfernen:** den Block `CREW (NUR PROBEWEISE)` in `index.html`, den
CSS-Abschnitt `crew` in `style.css` und die drei Dateien
`assets/img/crew-test-*.jpg` löschen.

## Hero-Hintergrundvideo

`assets/video/hero.mp4` liegt hinter dem Hero. Die Datei kam als `.MOV`, ist
aber mp42/isom mit H.264 und AAC, moov vor mdat — also ein normales MP4;
Umbenennen genügte, es wurde nichts umkodiert.

**Sobald das Video läuft, kippt der Hero auf dunkel.** Das ist kein Geschmack,
sondern gemessen: Mit hellem Papier-Schleier braucht die schwarze Schrift eine
Deckkraft von .88, damit sie gegen ein dunkles Video noch 4,5:1 erreicht — bei
.88 ist vom Video nur noch ein grauer Stich übrig. Auf dunklem Grund reicht ein
Schleier von .80, und dort bestehen alle Texte selbst gegen ein rein weißes
Video (min. 5,78:1). Beide Werte stehen als Tokens in `:root`:
`--hero-veil` (hell) und `--hero-veil-dark` (dunkel).

Das Video läuft auf dem Handy genauso wie am Desktop. Es wird nur in vier
Fällen gar nicht erst geladen, und dann bleibt der helle Papier-Hero
unverändert stehen:

- **Datensparmodus oder 2G** (`navigator.connection.saveData`,
  `effectiveType`) — 400 KB Dekoration sind dort nicht zu rechtfertigen.
- **Kein H.264 im Browser** (`canPlayType` leer) — dann wird die Datei nicht
  angefordert, statt sie umsonst zu laden.
- **„Bewegung reduzieren"** und **ohne JavaScript** — der Videoblock liegt im
  Animationspfad und läuft dort nicht an.
- **Ladefehler** oder `NotSupportedError` beim Abspielen — die Ebene entfernt
  sich selbst.

`preload` bleibt auf `none`; `play()` holt die Datei. Erst `preload` auf `auto`
zu setzen **und** `load()` zu rufen, hat sie zweimal geladen.

iOS verweigert Autoplay im Stromsparmodus. Darum wird beim ersten `touchstart`
oder `click` noch einmal `play()` versucht — dann liegt eine Nutzergeste vor.
**Dieser Pfad ist ungetestet**, weil Chromium stummes Autoplay auch mit
`--autoplay-policy=document-user-activation-required` durchlässt.

**Noch offen:** Die Quelle ist 480×854 im Hochformat und 2,23 s lang. Auf einem
1440er Desktop wird sie rund dreifach hochskaliert und stark beschnitten, und
die Schleife springt alle gut zwei Sekunden. Für den Livegang wäre Querformat
ab 1280 px Breite und 8 bis 15 s besser.

**Nicht verifiziert:** Das Chromium dieser Umgebung hat kein H.264, die
Wiedergabe der echten Datei konnte hier nicht geprüft werden. Die Mechanik
(Laden, Abspielen, Schleife, Pause außerhalb des Bildes, Statusleistenfarbe,
Datensparmodus, Codec-Rückfall) wurde bei 390 px und 1440 px mit einem
selbst aufgenommenen Ersatzclip getestet. Die echte Datei muss im Browser
gegengeprüft werden.

## Vor dem Livegang

1. **Impressum prüfen.** Geschäftsführung (Günter Blöß) und USt-IdNr.
   (DE235914888) stammen aus dem Impressum der alten Seite bzw. dem
   Handelsregister und sind **nicht vom Unternehmen bestätigt** — vor dem
   Livegang gegenlesen lassen. Die Berufsbezeichnung nach Handwerksrolle fehlt
   noch und ist im Dokument gelb markiert.
2. **Projektfotos.** Die fünf Referenzkarten zeigen Platzhalterflächen.
   Foto einbauen heißt: das `<div class="ref__media ref__media--ph" …>` durch
   `<div class="ref__media"><img src="assets/img/ref-<slug>.webp" alt="…" loading="lazy" width="1200" height="750"></div>`
   ersetzen (16:10, ~1200 px breit, WebP — siehe Skill `medien-assets`).
3. **Logo.** `assets/img/bb-mark.svg` ist eine neutrale Ziegelmarke. Liegt ein
   echtes Firmenlogo vor, **neue Dateinamen vergeben** (`bb-mark-2.svg`,
   `favicon-2.png`, `apple-touch-icon-2.png`, `og-2.jpg`) und die Referenzen in
   `index.html`, `impressum.html` und `datenschutz.html` mitziehen. `/assets/*`
   wird ein Jahr `immutable` ausgeliefert — eine Datei unter gleichem Namen zu
   ersetzen erreicht wiederkehrende Besucher nicht.
4. **Domain.** Canonical, `og:url`, Sitemap und robots.txt zeigen auf
   `https://www.bbbausanierung.de/`. Die Apex-Domain (ohne `www`) in Vercel auf
   `www` weiterleiten, sonst ist die Seite unter zwei URLs erreichbar.

## Interne Links

`vercel.json` setzt `cleanUrls: true`, deshalb verlinkt die Seite auf
`/impressum` und `/datenschutz` statt auf die `.html`-Dateien — das spart pro
Klick einen 308-Redirect. **Lokal mit `python3 -m http.server` funktionieren
diese Links nicht**; dort direkt `impressum.html` bzw. `datenschutz.html`
aufrufen, oder einen Server mit Clean-URLs nutzen (`npx serve`).

## Design

Gleiche Typo und Tokens wie nikitakrebs.de (Barlow Condensed / Montserrat /
Instrument Serif, Paper `#F5F4EF`, Ink `#0B0B0C`), Akzent statt Blau ein warmes
Bau-Gelb: `--accent:#F5B331` als **Flächenfarbe**, `--accent-text:#9A5A06` für
Schrift auf hellem Grund. Gelb als Text auf Papier hat 1,68:1 und ist damit
unlesbar — dafür gibt es `--accent-text`. Details in `../DESIGN.md`; die Regeln
dort gelten hier unverändert.

## Fremde Software

- GSAP 3.12.5 (`assets/js/gsap.min.js`, `ScrollTrigger.min.js`) — GreenSock
  Standard License, Lizenzhinweis im Dateikopf.
- Lenis 1.1.14 (`assets/js/lenis.min.js`) — MIT, siehe `assets/js/LENIS-LICENSE`.
- Barlow Condensed, Montserrat, Instrument Serif — SIL Open Font License 1.1.
