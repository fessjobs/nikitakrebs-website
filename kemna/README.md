# KEMNA — Relaunch-Konzept

Statische One-Page-Landing für die KEMNA-Gruppe (kemna.de) im Stack von
nikitakrebs.de: HTML/CSS/JS ohne Build, GSAP + ScrollTrigger + Lenis per CDN.
Eigenständig deploybar, keine Abhängigkeit zur Elternseite.

- `index.html` / `style.css` / `main.js` – die Seite
- `impressum.html`, `datenschutz.html` – ohne JS, eigener Style-Block
- `assets/img/` – Favicon, Apple-Touch-Icon, OG-Bild, Rauschtextur (alle aus Code erzeugt)
- `DESIGN.md` – das Designsystem als Datei, für Design-Agenten lesbar
- `serve.mjs` – Vorschau-Server, der `cleanUrls` aus `vercel.json` nachbildet
- Lokal: `node serve.mjs`, dann http://127.0.0.1:5190
- Deploy: `npx vercel --prod --yes` aus diesem Ordner (eigenes Vercel-Projekt)

`python3 -m http.server` funktioniert auch, liefert aber `/impressum` und
`/datenschutz` nicht aus – diese Pfade gibt es nur mit `cleanUrls`.

## Vor dem Livegang

Die Seite ist ein Konzept und trägt deshalb bewusst zwei Bremsen:

1. **`X-Robots-Tag: noindex, nofollow`** in `vercel.json`. Solange das Konzept
   unter einer Vorschau-URL liegt, darf es nicht unter der Marke KEMNA indexiert
   werden. **Beim echten Livegang entfernen**, sonst verschwindet die Seite aus
   der Suche.
2. **Markierte Kästen** in `impressum.html` und `datenschutz.html` – HRB-Nummer,
   Umsatzsteuer-ID, Datenschutzbeauftragter. Mit der Rechtsabteilung abgleichen.

Weiter offen:

- **Kennzahlen bestätigen.** Rund 2.200 Mitarbeitende, über 70 Standorte,
  ISO 50001, EcoVadis Bronze, A 7 Hamburg-Nordwest – Bordesholm. Alles aus
  öffentlichen Quellen (kemna.de, karriere.kemna.de, Wikipedia, Handelsregister),
  nicht vom Unternehmen bestätigt.
- **Subresource Integrity** für die drei CDN-Skripte ergänzen. Die Hashes lassen
  sich nur gegen die echten CDN-Dateien erzeugen:
  `curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A`
  Noch besser: GSAP, ScrollTrigger, Lenis und die Schriften lokal ausliefern –
  dann entfällt auch der Abschnitt 3 der Datenschutzerklärung.
- **Hero-Foto in höherer Auflösung.** `assets/img/hero-1000.*` stammt aus einer
  1000 px breiten Vorlage und wird auf großen Bildschirmen hochskaliert. Für den
  Livegang das Original mit mindestens 2400 px Breite liefern und in
  `hero-1000`/`hero-640` (JPG + WebP) ersetzen; die Größen im `srcset` anpassen.
- **Logos als Vektor.** Die 18 Logos in `assets/img/logos/` sind aus Screenshots
  freigestellt und nur etwa 100 px breit. Für den Livegang SVG oder mindestens
  400 px breite PNG vom jeweiligen Unternehmen einholen. Logo 06 (grünes
  Punkt-Dreieck) ist nicht zugeordnet; `alt`-Text in `index.html` nachtragen.
  Auch die Überschrift „Referenzen & Partner" ist ein Vorschlag.
- **Slider-Texte bestätigen.** Die drei Slides „Mitarbeitende", „Nachhaltigkeit
  & Transparenz" und „Karriere" sind Konzepttexte aus öffentlichen Quellen.
- **Weitere Fotos.** Die übrigen Visuals sind aus Code erzeugte SVG.
  Steinbruch-Höhenlinien, Asphaltkörnung und Schichtaufbau können als
  Erklärgrafiken bleiben.
- **Akzentfarbe.** Markierungsgelb `#F2B705` ist ein Vorschlag. Die Tokens stehen
  oben in `style.css`, ein Tausch gegen die CI-Farbe ist eine Zeile.

## Sektionen

Hero (gepinnt, Werksfoto unter Straßenlinien, Wortmarke schrumpft, gelbes
Band) → Referenzen & Partner (Logo-Band) → Intro + Kennzahlen → Themen-Slider
(Mitarbeitende, Nachhaltigkeit & Transparenz, Karriere; Scroll-Snap, Tasten,
Touch, Pfeiltasten) → Leistungen (Zickzack mit Erklärgrafiken) →
Wertschöpfungskette (horizontal gepinnt, fünf Stationen) → Einsatzbereiche →
Verantwortung (Wort-für-Wort-Scrub) → Geschichte (Zeitlinie) → Gruppe
(Namens-Marquee) → Karriere (gelb) → Kontakt → Footer.

## Robustheit

Drei Zustände sind bewusst gebaut und getestet:

| Zustand | Klasse | Verhalten |
|---|---|---|
| Kein JS / CDN blockiert | `.no-js` | Alles sichtbar, Wertschöpfungskette als Liste statt horizontal gepinnt |
| JS-Fehler zur Laufzeit | `.js-failed` | Der betroffene Block fällt aus, der Rest läuft; versteckte Inhalte werden sichtbar |
| „Bewegung reduzieren" | `.rm` | Keine Pins, keine Scrub-Sequenzen, keine Endlosschleifen; Endzustände sofort |

Jeder Block in `main.js` läuft in `safe()`. Ein Fehler in einem Block kann die
restliche Seite nicht mehr mitreißen – vorher hätte er alle Reveals darunter
unsichtbar gelassen.
