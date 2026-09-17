# KEMNA — Relaunch-Konzept

Statische One-Page-Landing für die KEMNA-Gruppe (kemna.de) im Stack von
nikitakrebs.de: HTML/CSS/JS ohne Build, GSAP + ScrollTrigger + Lenis per CDN.
Eigenständig deploybar, keine Abhängigkeit zur Elternseite.

- `index.html` / `style.css` / `main.js` – die Seite
- `impressum.html`, `datenschutz.html` – ohne JS, eigener Style-Block
- `assets/img/` – Favicon, Apple-Touch-Icon, OG-Bild (alle aus Code erzeugt)
- Lokal: `python3 -m http.server 5190` aus diesem Ordner, dann http://127.0.0.1:5190
- Deploy: `npx vercel --prod --yes` aus diesem Ordner (eigenes Vercel-Projekt)

## Inhalt

Alle Fakten stammen aus öffentlichen Quellen zur KEMNA-Gruppe (kemna.de,
karriere.kemna.de, Wikipedia, Handelsregister): Gründung 1867 in Breslau,
Neuanfang 1945 in Hamburg durch Karl Andreae, Hauptverwaltung Pinneberg,
rund 2.200 Mitarbeitende, mehr als 70 Standorte, drei Geschäftsfelder
(Rohstoffgewinnung, Asphaltproduktion, Verkehrswegebau), A 7 Hamburg-Nordwest –
Bordesholm, ISO 50001, EcoVadis Bronze, Tochtergesellschaften.

Vor dem Livegang mit dem Kunden abgleichen:

- Kennzahlen (Mitarbeitende, Standorte) auf den aktuellen Stand bringen
- Impressum und Datenschutz vervollständigen (markierte Kästen)
- Echte Fotos und Drohnenaufnahmen einsetzen; die SVG-Grafiken
  (Steinbruch-Höhenlinien, Asphaltkörnung, Schichtaufbau) sind als Platzhalter
  und Erklärgrafiken gedacht und können bleiben
- Akzentfarbe: Markierungsgelb `#F2B705` ist ein Konzeptvorschlag. Die
  Tokens stehen oben in `style.css`, ein Tausch gegen die CI-Farbe ist eine
  Zeile

## Sektionen

Hero (gepinnt, Straßenperspektive, Wortmarke schrumpft, gelbes Band) →
Intro + Kennzahlen → Leistungen (Zickzack mit Erklärgrafiken) →
Wertschöpfungskette (horizontal gepinnt, fünf Stationen) → Projekte →
Verantwortung (Wort-für-Wort-Scrub) → Geschichte (Zeitlinie) → Gruppe
(Namens-Marquee) → Karriere (gelb) → Kontakt → Footer.
