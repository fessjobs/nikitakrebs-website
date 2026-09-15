# KREBS PERFORMANCE

Statische One-Page-Landing für eine (fiktive) Tuning-Manufaktur, im Aufbau
einer Veredler-Seite: Leistungsstufen, Produktbereiche, Referenzfahrzeuge.
Technisch unverändert GSAP + ScrollTrigger + Lenis via CDN.

- `index.html` / `style.css` / `main.js` – die Seite
- `assets/car/` – die Fahrzeug-Zeichnungen (SVG), erzeugt von `assets/car/_build.py`
- `assets/img/`, `assets/logos/`, `assets/gallery/`, `assets/video/` – Bestand
  früherer Versionen, von der Seite aktuell nicht referenziert
- Lokal: `python3 -m http.server 5190` und http://127.0.0.1:5190
- Deploy: `npx vercel --prod --yes`

## Fahrzeug-Zeichnungen

Alle Autos auf der Seite sind ein einziges parametrisches Seitenprofil.
Jedes Modell ist als Silhouette in normierten Koordinaten hinterlegt
(u = Fahrzeuglänge, v = 0 an der Schwelle, 1 am Dach); Radstand, Überhänge,
Raddurchmesser und Höhe werden daraus wie in einer Paketzeichnung abgeleitet.

Darüber liegen vier Ausbaustufen (`TUNE`): Stufe 0 ist Serie, die Stufen 1–3
senken die Karosserie gegenüber den Rädern ab, vergrößern die Felge, verengen
den Radhausspalt und ergänzen Bremssattel, Schweller, Splitter, Diffusor und
Heckflügel.

    python3 assets/car/_build.py

erzeugt 3 Modelle × 6 Lackierungen × (Serie + Vollausbau), je eine technische
Linienzeichnung pro Modell, die drei Stufen am selben Wagen und fünf
Detail-Ausschnitte — 47 SVG-Dateien. Neue Farbe: in `PAINTS` ergänzen und das
Skript erneut laufen lassen.

## Hinweis

Marke, Pakete, Preise und technische Daten sind erfunden. Impressum und
Datenschutz nennen weiterhin den tatsächlichen Betreiber der Domain — vor
einem echten Livegang müssen beide auf den wirklichen Anbieter angepasst
werden.
