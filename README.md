# KREBS PERFORMANCE

Statische One-Page-Landing für eine (fiktive) Tuning-Manufaktur, im Aufbau
einer Veredler-Seite: Leistungsstufen, Produktbereiche, Referenzfahrzeuge.
Technisch unverändert GSAP + ScrollTrigger + Lenis via CDN.

- `index.html` / `style.css` / `main.js` – die Seite
- `assets/car/` – die Fahrzeug-Zeichnungen (SVG), erzeugt von `assets/car/_build.py`
- `assets/parts/` – die zwölf Produktkacheln (SVG), erzeugt von `assets/parts/_build.py`
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

## Produktkacheln

    python3 assets/parts/_build.py

zeichnet die zwölf Kacheln des Produktrasters — Steuergerät, Gelenkwelle,
Abgasanlage, Kolben, zwei Räder, Fahrwerk, Bremsanlage, Werkzeug, Sportsitz,
Gutachten und Turbolader. Gleiche Bildsprache wie die Fahrzeuge: flache
Flächen, Stahltöne, Blau als Markenakzent, Rot nur am Bremssattel.

## Farben

Die Palette liegt vollständig in den `:root`-Variablen von `style.css`:
Weiß als Grund, Schwarz und ein Grauband für das Chrom, Rot als Akzent.
`--accent-text` ist der rote Ton für Schrift auf Weiß, `--accent-light` der
hellere für Schrift auf Schwarz — beide braucht es, weil ein Rot nicht auf
beiden Gründen lesbar bleibt. Die Generatoren nehmen den Akzent als
Parameter (`accent`, `ACCENT`), Farbwechsel laufen also durch beide Skripte.

Das Wappen liegt als `assets/img/krebs-wappen.svg`. Es kommt ohne Schrift
aus — das „K" ist aus Flächen gebaut, weil eine über `<img>` eingebundene
SVG keine externen Schriften nachladen kann.

## Hinweis

Der Seitenaufbau — Servicezeile, dunkle Hauptnavigation, Slider mit
Leistungszahlen, Kachelraster — ist an den Aufbau gängiger Veredler-Seiten
angelehnt. Marke, Pakete, Preise, Produktnamen und technische Daten sind
erfunden; Zeichnungen und Texte sind eigene. Impressum und
Datenschutz nennen weiterhin den tatsächlichen Betreiber der Domain — vor
einem echten Livegang müssen beide auf den wirklichen Anbieter angepasst
werden.
