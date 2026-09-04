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
├── agb.html                  AGB (Platzhalter)
├── oeffnungszeiten.html     Öffnungszeiten + Filialliste
├── kontakt.html             Kontakt + Anfahrt (Google Maps)
├── impressum.html           Impressum
├── datenschutz.html         Datenschutzerklärung (Platzhalter)
├── css/style.css            Gesamtes Styling (inkl. Warenkorb-Icon/Drawer)
├── css/shop.css              Nur Produktraster-Styles (nur auf shop.html/shop-erfolg.html)
├── js/main.js                Mobiles Menü, Sticky-Nav-Scroll-Status, Scroll-Reveal
├── js/shop-data.js           Produktdaten (Name, Variante, Preis, Füllmenge, Zutaten) für den Shop
├── js/cart.js                 Seitenübergreifender Warenkorb (localStorage) + Checkout
├── js/shop.js                 Rendert das Produktraster auf shop.html
├── assets/img/               Logo, Fotos & Hero-Platzhalterbild
├── assets/img/produkte/      Produktfotos für den Shop (4:3, 900 px breit)
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
| `oeffnungszeiten.html` | Echte Öffnungszeiten (Mo–Fr, Sa, So/Feiertag) für die Hauptfiliale | Waren auf der alten Website nirgends veröffentlicht |
| `oeffnungszeiten.html` | Ggf. individuelle Öffnungszeiten je der 16 Filialen | Alte Seite listete nur Adressen, keine Zeiten |
| `datenschutz.html` | Vollständige, rechtsgültige Datenschutzerklärung | Aktuell nur ein Platzhaltertext – bitte mit Generator oder Rechtsberatung erstellen |
| `impressum.html` | Prüfung auf Aktualität der übernommenen Pflichtangaben | Daten 1:1 vom alten Impressum übernommen, Stand unbekannt |
| `kontakt.html` | Funktionierendes Kontaktformular (optional) | Reine HTML/CSS/JS-Seite kann Formulare ohne Backend nicht versenden; aktuell nur `mailto:`-Links. Bei Bedarf externen Formular-Dienst (z. B. Formspree, das Formular-Tool des Webhosters) einbinden |
| Social-Media-Links | Nicht eingebaut | Auf der alten Website waren keine Social-Media-Profile verlinkt |
| `shop.html`, `agb.html`, `datenschutz.html` | AGB, rechtskonforme Preisangaben (inkl. USt.-Hinweis, Versandkosten) und Erweiterung der Datenschutzerklärung | Neuer Webshop mit echter Zahlungsabwicklung über Stripe – AGB/Datenschutztext von Anwalt oder Generator (z. B. IT-Recht Kanzlei, Trusted Shops) erstellen/prüfen lassen. Backwaren sind nach § 312g Abs. 2 Nr. 2 BGB als schnell verderbliche Ware i. d. R. vom gesetzlichen Widerrufsrecht ausgenommen – dennoch anwaltlich prüfen lassen |
| `stripe-worker/` | Deployment (Cloudflare + Stripe Account, Secret Key) noch nicht durchgeführt | Muss einmalig vom Websitebetreiber selbst ausgeführt werden, siehe `stripe-worker/DEPLOYMENT.md`. Bis dahin funktioniert der "Zur Kasse"-Button im Shop nicht |
| Fotos von Brot/Brötchen & Backstube | Fehlen komplett | Alle 11 übernommenen Fotos zeigen fertige Torten – auf der alten Seite gab es keine Fotos von Broten, Brötchen oder den Produktionsräumen. Für Startseite/Sortiment wären echte Fotos von Brot, Brötchen und der Backstube wünschenswert |
| Team-/Inhaberfoto | Fehlt | Auf `ueber-uns.html` wäre ein echtes Foto von Jürgen &amp; Susanna Eichholz oder dem Team passender als die aktuell genutzten Tortenfotos |
| `assets/img/hero-placeholder.svg` | Durch echtes Foto ersetzen | Vollbild-Hero auf der Startseite nutzt aktuell eine selbst gestaltete Illustration (Brot-Motiv in den Markenfarben), da kein echtes Foto von Brot/Backstube vorlag. Einfach ein hochauflösendes Foto (mind. 1600×900px, Querformat) unter demselben Dateinamen ablegen oder den Bildpfad in `index.html` (Klasse `hero-media`) anpassen |

## Übernommene Original-Inhalte

Direkt von der alten Website übernommen (kein Platzhalter nötig):

- **Logo**: `assets/img/logo.png`
- **Fotos**: `assets/img/torte-galerie-1.jpg` bis `torte-galerie-8.jpg` sowie `torte-hortensia.jpg`, `torte-kroenchen.jpg`, `torte-2645.jpg` – alles Fotos fertiger Torten aus der bisherigen Bildergalerie bzw. der Torten-Unterseite (keine Brot-/Backstubenfotos vorhanden, siehe Platzhalter-Tabelle oben)
- **Texte**: Firmengeschichte, Sortimentskategorien, Torten-Bestellprozess, alle Adressen der 16 Filialen, Kontaktdaten (Telefon, Fax, E-Mail), Impressum-Pflichtangaben

Alle Bild-Dateien liegen bereits lokal in `assets/img/` – es muss nichts mehr
von der alten Domain nachgeladen werden.
