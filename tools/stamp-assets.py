#!/usr/bin/env python3
"""
Haengt an jede Einbindung von js/*.js und css/*.css in den HTML-Seiten einen
Versionsstempel an, der aus dem Dateiinhalt berechnet wird:

    <script src="js/cart.js"></script>
 -> <script src="js/cart.js?v=8f3a1c2d"></script>

Warum: GitHub Pages liefert diese Dateien mit `cache-control: max-age=600`
aus. Ohne Stempel sehen Besucher nach einer Aenderung bis zu 10 Minuten lang
(offene Tabs noch laenger) die alte Fassung - im Shop hiesse das, dass etwa
ein geaenderter Preis oder Mindestbestellwert bei ihnen noch nicht gilt.
Aendert sich der Dateiinhalt, aendert sich der Stempel, und der Browser laedt
die Datei sofort neu. Aendert sich nichts, bleibt der Stempel gleich und der
Cache greift weiter.

Vor jedem Hochladen/Pushen einmal ausfuehren:

    python3 tools/stamp-assets.py

Ohne Abhaengigkeiten, kein Build-Prozess - die Dateien selbst bleiben
unveraendert, nur die Verweise in den HTML-Seiten werden aktualisiert.
"""
import hashlib
import pathlib
import re
import sys

WURZEL = pathlib.Path(__file__).resolve().parent.parent
MUSTER = re.compile(r'((?:src|href)=")((?:js|css)/[^"?]+)(?:\?v=[0-9a-f]+)?(")')


def stempel(pfad: pathlib.Path) -> str:
    return hashlib.sha256(pfad.read_bytes()).hexdigest()[:8]


def main() -> int:
    cache: dict[str, str] = {}
    geaendert = []
    fehlend = []

    for seite in sorted(WURZEL.glob("*.html")):
        text = seite.read_text(encoding="utf-8")

        def ersetze(treffer: re.Match) -> str:
            attribut, ziel, schluss = treffer.group(1), treffer.group(2), treffer.group(3)
            datei = WURZEL / ziel
            if not datei.is_file():
                fehlend.append(f"{seite.name} -> {ziel}")
                return treffer.group(0)
            if ziel not in cache:
                cache[ziel] = stempel(datei)
            return f"{attribut}{ziel}?v={cache[ziel]}{schluss}"

        neu = MUSTER.sub(ersetze, text)
        if neu != text:
            seite.write_text(neu, encoding="utf-8")
            geaendert.append(seite.name)

    for ziel, wert in sorted(cache.items()):
        print(f"  {ziel:24s} v={wert}")

    if fehlend:
        print("\nFEHLER - verwiesene Datei existiert nicht:", file=sys.stderr)
        for eintrag in fehlend:
            print(f"  {eintrag}", file=sys.stderr)
        return 1

    print(f"\n{len(geaendert)} Seite(n) aktualisiert" if geaendert else "\nnichts zu tun")
    return 0


if __name__ == "__main__":
    sys.exit(main())
