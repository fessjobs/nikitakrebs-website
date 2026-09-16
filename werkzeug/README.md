# Eine fremde Seite zu mir bringen

Ich sitze in einer abgeschotteten Umgebung und komme an **keine** fremde
Website heran — weder lamborghini.com noch mtm-online.de. Alles, was von
außen kommt, muss durch dich. Hier stehen die drei Wege, vom genauesten zum
schnellsten.

---

## 1. Zahlen: das Ausleseskript

Am genauesten. Liefert Schriften, Schriftgrade, Zeilenhöhen, Laufweiten,
Farben mit Häufigkeit, Abstandsstaffel, Eckenradien, Schatten und den
Grobaufbau der Seite — also das Gestaltungsraster in Zahlen statt in
Eindrücken.

1. Referenzseite im Browser öffnen
2. **F12** (Chrome, Edge, Firefox) → Reiter **Console**
3. Den gesamten Inhalt von `design-auslesen.js` einfügen, **Enter**
4. Das Ergebnis liegt in der Zwischenablage → hier in den Chat einfügen

Erst bei Breitbild messen, dann das Fenster schmal ziehen und noch einmal —
so bekomme ich beide Fassungen des Rasters.

Das Skript liest nur, was der Browser ohnehin berechnet hat. Es verändert
nichts und lädt nichts nach. Ergebnisgröße: rund 9 000 Zeichen.

> Chrome blockiert das Einfügen in die Konsole beim ersten Mal und verlangt,
> dass man `allow pasting` tippt. Einmal eingeben, dann geht es.

## 2. Aussehen: Bildschirmfotos

Am schnellsten, und für den Aufbau oft genug. **Direkt an eine Nachricht
hängen** — hochladen muss ich sie nicht, ansehen genügt mir.

Nützlich sind vier: Startseite oben, ein Abschnitt weiter unten, das
geöffnete Menü, der Fußbereich. Ein ganzseitiges Bild zeigt den Rhythmus der
Abschnitte am besten (Chrome: F12 → Strg+Umschalt+P → „Capture full size
screenshot").

Aus einem Bild lese ich Anordnung, Proportionen und ungefähre Farben. Was
ich daraus **nicht** bekomme: exakte Farbwerte, Schriftnamen, Abstände in
Pixeln. Dafür ist Weg 1 da.

## 3. Bewegung: beschreiben oder filmen

Was beim Scrollen passiert, steht in keinem Bild. Ein kurzer Satz reicht
meistens — „das Bild bleibt stehen, während der Text darüber weiterläuft".
Eine Bildschirmaufnahme geht auch; die muss dann aber ins Repository, weil
Videos nicht durch den Chat passen.

---

## Wohin mit Dateien

| Art | Weg |
|---|---|
| Bildschirmfoto | direkt an eine Chatnachricht hängen |
| Ausgabe des Skripts | als Text in den Chat einfügen |
| Logo, Fotos, Videos | ins Repository hochladen (`assets/`), Branch beachten |

Der Unterschied ist wichtig: Ein Bild im Chat kann ich **sehen**, aber nicht
speichern. Was in die Website eingebaut werden soll, muss deshalb ins
Repository.

---

## Was übernommen werden darf

Aufbau, Proportionen, Typografie-Ideen, Farbklima und Bewegungsmuster — das
sind Handwerksmittel, daran bedient sich jeder. Nicht übernommen werden:
Bilder, Videos, Schriftdateien, Texte, Logos und der Quelltext einer fremden
Seite. Die gehören ihrem Eigentümer.

Praktisch heißt das: Aus der Lamborghini-Seite lernen wir die Haltung —
ganzflächige Bühne, sehr große Schrift, wenig Bedienelemente, viel Schwarz.
Gebaut wird sie mit MTMs eigenen Mitteln.
