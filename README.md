# MTM — Motoren Technik Mayer

Statische Landingpage für MTM Motoren-Technik-Mayer GmbH, Wettstetten.
Aufbau nach dem bestehenden Auftritt: schwarze Servicezeile, graues
Navigationsband mit Untermenüs, Slider mit Leistungszahlen, Kachelraster.
Technik: GSAP + ScrollTrigger + Lenis via CDN, sonst keine Abhängigkeiten.

- `index.html` / `style.css` / `main.js` – die Seite
- `impressum.html`, `datenschutz.html`, `agb.html`, `barrierefreiheit.html`
- `assets/car/`, `assets/parts/` – **Blindmuster**, siehe unten
- `assets/foto/` – hier kommen die Originalaufnahmen hinein
- Lokal: `python3 -m http.server 5190` und http://127.0.0.1:5190
- Deploy: `npx vercel --prod --yes`

## Was noch vom Kunden kommen muss

Diese Punkte sind im Quelltext als Platzhalter markiert und müssen vor dem
Livegang ersetzt werden:

1. **Logo.** `assets/img/logo-mtm.svg` ist eine schlichte typografische
   Wortmarke, kein Nachbau des eingetragenen Zeichens. Die Originaldatei
   des Kunden ersetzt sie — dieselbe Datei versorgt Kopfzeile, Vorschalter,
   Favicon und OG-Bild.
2. **Alle Bilder.** Sämtliche Fahrzeug- und Produktaufnahmen sind SVG-
   Zeichnungen aus `assets/car/` und `assets/parts/`. Sie halten die
   Bildplätze offen und ersetzen keine Fotografie. Jedes `alt` beginnt
   deshalb mit „Platzhalter:". Die Originale kommen nach `assets/foto/`;
   das Verfahren steht in `assets/foto/README.md`.
3. **Garantie.** Der Abschnitt `#garantie` enthält nur eine Hilfszeile; die
   Garantiebedingungen im Wortlaut fehlen.
4. **AGB und Barrierefreiheit.** Beide Seiten sind Rümpfe, damit die
   Verlinkung nicht ins Leere läuft.
5. **Impressum und Datenschutz prüfen.** Anschrift, Geschäftsführer,
   Handelsregister und Kontakt wurden aus öffentlich zugänglichen Quellen
   übernommen, nicht von mtm-online.de selbst — die Domain war aus der
   Entwicklungsumgebung nicht erreichbar. Vor dem Livegang gegen das
   eigene Impressum abgleichen. Umsatzsteuer-ID fehlt.
6. **Kennzahlen im Slider.** „8xx PS / 1xxx NM" für den RS5 B10 stammt aus
   dem Entwurf des Kunden und ist bewusst unscharf.

## Zeichnungen

Beide Bildstrecken sind parametrisch erzeugt und lassen sich anpassen,
solange noch keine Fotos vorliegen:

    python3 assets/car/_build.py      # Fahrzeuge, 3 Modelle × 6 Lacke × Serie/Umbau
    python3 assets/parts/_build.py    # 12 Produktkacheln

Die Fahrzeuge sind ein einziges Seitenprofil in normierten Koordinaten;
Radstand, Überhänge, Raddurchmesser und Höhe werden daraus wie in einer
Paketzeichnung abgeleitet. Vier Ausbaustufen senken die Karosserie ab,
vergrößern die Felge und ergänzen Bremssattel, Schweller, Splitter,
Diffusor und Heckflügel.

## Farben

Die Palette liegt in den `:root`-Variablen von `style.css`: Weiß als Grund,
Schwarz und ein Grauband für das Chrom, Rot als Akzent. `--accent-text` ist
der rote Ton für Schrift auf Weiß, `--accent-light` der hellere für Schrift
auf Schwarz — beide braucht es, weil ein Rot nicht auf beiden Gründen
lesbar bleibt. Die Generatoren nehmen den Akzent als Parameter.

## Originalaufnahmen einsetzen

Jeder der 53 Bildplätze trägt im Quelltext ein `data-foto="…"` mit einem
festen Namen. Beim Laden liest die Seite `assets/foto/index.json` und tauscht
jede Zeichnung gegen die Datei, die dort unter demselben Namen steht. Ohne
Eintrag bleibt die Zeichnung; die Bilder können also nach und nach kommen.

    # Aufnahmen nach Bildplatz benannt in assets/foto/ legen, dann:
    python3 assets/foto/_index.py

`assets/foto/README.md` listet alle Plätze mit Motiv und empfohlener Größe,
`assets/foto/slots.json` dasselbe maschinenlesbar. Ein Foto bekommt beim
Einsetzen die Klasse `is-foto` und füllt seinen Platz randlos aus, während
die Zeichnungen mit Innenabstand freigestellt stehen.
