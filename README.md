# Bäckerei Eichholz – neue Website

Statischer Ersatz für die bisherige Seite unter `baeckerei-eichholz.de`. Reines
HTML/CSS/JS, keine Datenbank, kein Backend, kein Build-Prozess – läuft auf
jedem normalen Webspace.

## Projektstruktur

```
baeckerei-eichholz-neu/
├── index.html              Startseite
├── ueber-uns.html           Geschichte & Philosophie
├── sortiment.html           Produktsortiment + Torten
├── shop.html                Online-Shop (Plätzchen, Warenkorb, Stripe-Checkout)
├── shop-erfolg.html          Landingpage nach erfolgreicher Zahlung
├── agb.html                  AGB für den Online-Shop
├── oeffnungszeiten.html     Öffnungszeiten + Filialliste
├── kontakt.html             Kontakt + Anfahrt (Google Maps)
├── impressum.html           Impressum
├── datenschutz.html         Datenschutzerklärung
├── 404.html                 Fehlerseite; leitet alte WordPress-Adressen (z. B. /filialen/) auf die neuen Seiten um
├── css/style.css            Gesamtes Styling (inkl. Warenkorb-Icon/Drawer)
├── css/shop.css              Nur Produktraster-Styles (nur auf shop.html/shop-erfolg.html)
├── js/main.js                Mobiles Menü, Sticky-Nav-Scroll-Status, Scroll-Reveal
├── js/shop-data.js           Produktdaten (Name, Variante, Preis, Füllmenge, Zutaten) für den Shop
├── js/cart.js                 Seitenübergreifender Warenkorb (localStorage) + Checkout
├── js/shop.js                 Rendert das Produktraster auf shop.html
├── js/filialen.js            Filialdaten (Adresse, Öffnungszeiten, Fotos) + Detailansicht
├── assets/img/               Logo, Startbild, Icons, Torten- und Inhaberfoto
├── assets/img/produkte/      Produktfotos für den Shop (4:3, 900 px breit)
├── assets/img/filialen/      Filialfotos (<id>-<n>.jpg, max. 1200 px)
├── robots.txt, sitemap.xml   Nennen baeckerei-eichholz.de - greifen erst nach der Domain-Umstellung
└── tools/stamp-assets.py     Versionsstempel fuer js/css (vor jedem Push ausfuehren)
```

## Vor jedem Hochladen: Versionsstempel setzen

```bash
python3 tools/stamp-assets.py
```

GitHub Pages liefert `js/` und `css/` mit `cache-control: max-age=600` aus.
Ohne diesen Schritt sehen Besucher nach einer Änderung bis zu 10 Minuten lang
(offene Tabs noch länger) die alte Fassung – im Shop hieße das, dass ein
geänderter Preis oder der Mindestbestellwert bei ihnen noch nicht gilt.

Das Skript hängt an jede Einbindung einen aus dem Dateiinhalt berechneten
Stempel an (`js/cart.js?v=d7f23869`). Ändert sich die Datei, ändert sich der
Stempel und der Browser lädt sofort neu; ändert sich nichts, bleibt der Cache
wirksam. Ein zweiter Lauf ohne Dateiänderung ändert nichts.

Der Shop-Checkout braucht zusätzlich eine kleine, separat gehostete
Serverless-Funktion (Cloudflare Worker) für die Stripe-Zahlungsabwicklung –
siehe `../stripe-worker/` (Geschwisterordner, nicht Teil des FTP-Uploads,
eigenes Deployment über `wrangler deploy`, Anleitung in
`stripe-worker/DEPLOYMENT.md`).

## Interaktive Effekte

- **Hero-Bereich** (`index.html`): Vollbild-Bild mit dunklem Verlauf-Overlay,
  Text/Buttons darüber, sanfte Eingangsanimation beim Laden.
- **Scroll-Reveal**: Textblöcke, Karten, Galerie- und Tortenbilder blenden
  beim Herunterscrollen sanft ein (`js/main.js`, `IntersectionObserver` +
  CSS-Transition über die Klasse `.reveal`). Bewusst ohne externe Bibliothek
  wie AOS umgesetzt, da das Projekt sonst komplett abhängigkeitsfrei ist –
  so bleibt es bei einem einzigen kleinen Script ohne zusätzlichen Request.
  Respektiert `prefers-reduced-motion`.
- **Sticky Navigation**: Kopfzeile ist zunächst transparent (liegt über dem
  Hero-/Seitenbanner-Bild) und bekommt erst ab ca. 40px Scroll-Position einen
  festen Hintergrund samt Schatten (Klasse `.is-scrolled`).
- **Hover-Effekte**: Karten und Tortenbilder heben sich leicht an und werfen
  einen stärkeren Schatten, Tortenfotos zoomen dezent, Buttons heben sich an.

## Lokal öffnen & testen

Kein Server nötig – einfach `index.html` per Doppelklick im Browser öffnen,
oder für realistischeres Testen (empfohlen, wegen relativer Pfade) einen
einfachen lokalen Server starten:

```bash
cd baeckerei-eichholz-neu
python3 -m http.server 8000
# dann im Browser: http://localhost:8000
```

Alle Seiten sind responsiv (Desktop/Tablet/Handy) und über die Navigation
oben verlinkt. Das mobile Menü (Hamburger-Icon) erscheint automatisch unter
640px Breite.

## Später hosten

Einfach den kompletten Ordnerinhalt per FTP/SFTP oder über das Kunden-Panel
des Webhosters in das Wurzelverzeichnis (bzw. `public_html`/`htdocs`) hochladen.
Es sind keine serverseitigen Voraussetzungen (PHP, Datenbank o. Ä.) nötig.

Ausnahme: Der Shop-Checkout (Stripe) braucht zusätzlich den separat
gehosteten Cloudflare Worker aus `../stripe-worker/` – der wird **nicht**
mit hochgeladen, sondern einmalig per `wrangler deploy` ausgerollt, siehe
`stripe-worker/DEPLOYMENT.md`.

## Noch zu erledigende Platzhalter

| Datei | Was fehlt | Grund |
|---|---|---|
| Domain | `baeckerei-eichholz.de` zeigt noch auf die alte WordPress-Seite | Die neue Seite läuft bisher nur unter `aktienklar.github.io/B-ckereiEichholz`. DNS beim Domain-Anbieter auf GitHub Pages umstellen und in den Repo-Einstellungen unter Pages die Custom Domain eintragen. Danach im Stripe-Worker die erlaubte Herkunft und die Rücksprung-Adressen von `aktienklar.github.io` auf die Domain umstellen und neu deployen. `robots.txt`, `sitemap.xml` und die Weiterleitungen alter Adressen in `404.html` wirken erst ab dann |
| `js/filialen.js` | Öffnungszeiten der Filiale Bahnhofstraße | Die Zeiten von Karlstraße, Gothaer Straße und Schlösserstraße stammen von den Aushängen an den Filialtüren (Fotos vom 10./11.09.2026, vom Betrieb bestätigt) |
| `datenschutz.html`, `agb.html`, `impressum.html` | **Anwaltliche Prüfung vor dem Live-Betrieb** | Die Texte sind inhaltlich ausformuliert und decken die Pflichtangaben ab (DSGVO Art. 13, § 5 DDG, § 36 VSBG, Widerrufs-Ausnahmen nach § 312g BGB). Sie wurden aber **nicht juristisch geprüft**. Vor dem Verkauf an Verbraucher von Anwalt oder Fachdienst (z. B. IT-Recht Kanzlei, Trusted Shops) prüfen lassen. Dabei auch klären, ob das Instagram-Widget (Behold) auf der Startseite ohne Einwilligung laden darf |
| `impressum.html` | Prüfung auf Aktualität der übernommenen Pflichtangaben | Daten 1:1 vom alten Impressum übernommen, Stand unbekannt |
| `kontakt.html` | Funktionierendes Kontaktformular (optional) | Reine HTML/CSS/JS-Seite kann Formulare ohne Backend nicht versenden; aktuell nur `mailto:`-Links. Bei Bedarf externen Formular-Dienst (z. B. Formspree, das Formular-Tool des Webhosters) einbinden |
| `agb.html` ↔ `stripe-worker/worker.js` | Beträge synchron halten | Die AGB nennen Mindestbestellwert 10 €, Versand 4,90 €, versandkostenfrei ab 40 € und 50 € Tortenanzahlung. Diese Werte stehen im Worker als Env-Variablen (`MIN_ORDER_CENTS`, `SHIPPING_FLAT_CENTS`, `FREE_SHIPPING_THRESHOLD_CENTS`, `CAKE_DEPOSIT_CENTS`). Wird dort etwas geändert, müssen die AGB mitgeändert werden |
| `stripe-worker/` | Echte Testbestellung im Shop und eine Tortenanzahlung | Der Worker ist deployt und antwortet. Offen ist, ob Stripe im Live-Modus läuft und die Bestätigungs-E-Mails ankommen - das lässt sich nur mit einer echten Bestellung prüfen |
| `impressum.html` | Nach dem Inhaberwechsel auf Tim Eichholz prüfen: Berufsbezeichnung „Bäckermeister“ und USt-IdNr. | Beide Angaben stammen noch aus der Zeit von Jürgen Eichholz. Bei einem Einzelunternehmen hängen sie in der Regel an der Person des Inhabers |
## Übernommene Original-Inhalte

Direkt von der alten Website übernommen (kein Platzhalter nötig):

- **Logo**: `assets/img/logo.png`
- **Fotos**: `assets/img/torte-galerie-1.jpg` bis `torte-galerie-8.jpg` sowie `torte-hortensia.jpg`, `torte-kroenchen.jpg`, `torte-2645.jpg` – alles Fotos fertiger Torten aus der bisherigen Bildergalerie bzw. der Torten-Unterseite. Filialfotos und das Inhaberfoto kamen später direkt vom Betrieb
- **Texte**: Firmengeschichte, Sortimentskategorien, Torten-Bestellprozess, Adressen der Filialen (von den 14 auf der alten Seite bestehen noch 5), Kontaktdaten (Telefon, Fax, E-Mail), Impressum-Pflichtangaben

Alle Bild-Dateien liegen bereits lokal in `assets/img/` – es muss nichts mehr
von der alten Domain nachgeladen werden.
