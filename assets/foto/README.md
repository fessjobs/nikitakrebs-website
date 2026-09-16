# Bildplätze

Hier kommen die Originalaufnahmen hinein. Jeder Platz auf der Seite hat einen
festen Namen. Eine Datei, die so heißt, ersetzt dort automatisch die Zeichnung.

## So geht es

1. Aufnahme nach ihrem Platz benennen, z. B. `slider-01.jpg` oder `kachel-03.webp`
   (erlaubt: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`)
2. In dieses Verzeichnis legen
3. `python3 assets/foto/_index.py` ausführen

Der letzte Schritt schreibt `index.json` — die Liste, die die Seite beim Laden
liest. Ohne Eintrag bleibt an dem Platz die Zeichnung stehen; es muss also nicht
alles auf einmal da sein. Ein Bild, das sich nicht laden lässt, ändert nichts:
die Zeichnung bleibt.

Die Bildbeschreibungen (`alt`) stehen noch auf „Platzhalter: …“. Sobald die
echten Aufnahmen da sind, gehören sie auf das, was tatsächlich zu sehen ist —
sonst stimmt die Vorlesereihenfolge für Screenreader nicht.

## Die Plätze

### Slider (die fünf großen Aufnahmen ganz oben)
Empfohlen: 1600 × 900 px, quer

| Datei | zeigt |
|---|---|
| `slider-01.jpg` | Fahrzeugaufnahme Audi RS5 B10 |
| `slider-02.jpg` | Fahrzeugaufnahme MTM Audi Bimoto |
| `slider-03.jpg` | Fahrzeugaufnahme Audi S2 RSR Clubsport |
| `slider-04.jpg` | Produktaufnahme Bimoto Felge |
| `slider-05.jpg` | Produktaufnahme Abgasanlage |

### Kachelraster unter dem Slider
Empfohlen: 900 × 600 px, quer

| Datei | zeigt |
|---|---|
| `kachel-01.jpg` | M, F, V, S-Cantronic |
| `kachel-02.jpg` | Antriebstechnik |
| `kachel-03.jpg` | Abgasanlagen |
| `kachel-04.jpg` | Entwicklung |
| `kachel-05.jpg` | Bimoto Felgen |
| `kachel-06.jpg` | Nardo Felge |
| `kachel-07.jpg` | Fahrwerke |
| `kachel-08.jpg` | Bremsanlagen |
| `kachel-09.jpg` | Wartung & Reparatur |
| `kachel-10.jpg` | Individual |
| `kachel-11.jpg` | Leistungssteigerung |
| `kachel-12.jpg` | Teilegutachten |

### Unternehmensgeschichte
Empfohlen: 1600 × 900 px, quer

| Datei | zeigt |
|---|---|
| `unternehmen-01.jpg` | Aufnahme aus der Firmengeschichte |
| `unternehmen-02.jpg` | Aufnahme Audi S2 RSR Clubsport |
| `unternehmen-03.jpg` | Aufnahme MTM Audi Bimoto |
| `unternehmen-04.jpg` | Aufnahme aus der Fertigung |
| `unternehmen-05.jpg` | Aufnahme eines Kundenfahrzeugs |

### Cantronic-Module
Empfohlen: 1200 × 900 px

| Datei | zeigt |
|---|---|
| `modul-01.jpg` | Produktaufnahme M-Cantronic |
| `modul-02.jpg` | Produktaufnahme F-Cantronic |
| `modul-03.jpg` | Produktaufnahme V-Cantronic |

### Abschnitt Leistungssteigerung
Empfohlen: 1200 × 1500 px, hoch

| Datei | zeigt |
|---|---|
| `leistung-01.jpg` | Produktaufnahme Motorentechnik |

### Abschnitt Fahrwerk
Empfohlen: 1200 × 1500 px, hoch

| Datei | zeigt |
|---|---|
| `fahrwerk-01.jpg` | Produktaufnahme Abgasanlage |

### Abschnitt Räder
Empfohlen: 1200 × 1500 px, hoch

| Datei | zeigt |
|---|---|
| `raeder-01.jpg` | Produktaufnahme Bimoto Felge |

### Fahrzeugstrecke (waagerecht scrollend)
Empfohlen: 1600 × 900 px, quer

| Datei | zeigt |
|---|---|
| `fahrzeug-01.jpg` | Fahrzeugaufnahme im Serienzustand |
| `fahrzeug-02.jpg` | dasselbe Fahrzeug nach dem Umbau |
| `fahrzeug-03.jpg` | Produktaufnahme Bimoto Felge |
| `fahrzeug-04.jpg` | Produktaufnahme Nardo Felge |
| `fahrzeug-05.jpg` | Fahrzeugaufnahme MTM Audi Bimoto |
| `fahrzeug-06.jpg` | Produktaufnahme Abgasanlage |
| `fahrzeug-07.jpg` | Produktaufnahme Bremsanlage |
| `fahrzeug-08.jpg` | Fahrzeugaufnahme Audi S2 RSR Clubsport |
| `fahrzeug-09.jpg` | Fahrzeugaufnahme eines Kundenfahrzeugs |
| `fahrzeug-10.jpg` | technische Zeichnung |
| `fahrzeug-11.jpg` | Fahrzeugaufnahme eines Kundenfahrzeugs |

### Abschnitt Entwicklung
Empfohlen: 1600 × 900 px, quer

| Datei | zeigt |
|---|---|
| `entwicklung-01.jpg` | (dekorativ) |
| `entwicklung-02.jpg` | Fahrzeugaufnahme MTM Audi Bimoto |

### Galerie
Empfohlen: 1200 px Breite, Hochformat gemischt

| Datei | zeigt |
|---|---|
| `galerie-01.jpg` | Platzhalter |
| `galerie-02.jpg` | Platzhalter |
| `galerie-03.jpg` | Bimoto Felge |
| `galerie-04.jpg` | Platzhalter |
| `galerie-05.jpg` | Abgasanlage |
| `galerie-06.jpg` | Nardo Felge |
| `galerie-07.jpg` | Platzhalter |
| `galerie-08.jpg` | Bremsanlage |
| `galerie-09.jpg` | Platzhalter |
| `galerie-10.jpg` | Fahrwerk |
| `galerie-11.jpg` | Platzhalter |
| `galerie-12.jpg` | Turbolader |
