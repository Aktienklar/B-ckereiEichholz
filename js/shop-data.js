/**
 * Zentrale Produktdaten für den Shop. Einzige Quelle für Name, Variante,
 * Preis, Füllmenge, Zutaten und Bild je Produkt - shop.js rendert das
 * Produktraster daraus, cart.js zeigt Warenkorb-Positionen daraus an.
 *
 * Felder je Produkt:
 *   id          eindeutig, identisch mit dem Schlüssel in worker.js
 *   name        Produktname
 *   variant     optional, z.B. bei Sorten desselben Produkts
 *   unit        Füllmenge/Verkaufseinheit ("200 g", "Stück")
 *   priceCents  Preis in Cent für eine Einheit
 *   ingredients Zutatenliste (Array, wird auf der Karte kommasepariert
 *               ausgegeben)
 *   image       Bildpfad oder null (dann erscheint "Foto folgt")
 *
 * WICHTIG: Diese Preise sind nur für die Anzeige. Der tatsächlich
 * berechnete Preis wird beim Checkout serverseitig aus der PRODUCTS-Map
 * in stripe-worker/worker.js gelesen - beide Listen müssen beim Anlegen
 * oder Ändern eines Produkts manuell synchron gehalten werden (gleiche
 * ids, gleiche Preise).
 *
 * Neues Produkt ergänzen: Objekt unten im Array hinzufügen UND das
 * gleiche Produkt (gleiche id!) in stripe-worker/worker.js eintragen.
 * Varianten eines Produkts bekommen jeweils eine eigene id (siehe
 * American Cookies), damit Warenkorb und Checkout sie auseinanderhalten.
 * Foto ergänzen: image auf den Bildpfad setzen, sonst erscheint ein
 * Platzhalter ("Foto folgt").
 */
window.EICHHOLZ_PRODUCTS = [
  {
    id: 'spritzplaetzchen',
    name: 'Spritzplätzchen',
    unit: '200 g',
    priceCents: 420,
    image: null,
    ingredients: ['Weizenmehl', 'Margarine', 'Zucker', 'Ei', 'Aroma']
  },
  {
    id: 'american-cookies-schoko',
    name: 'American Cookies',
    variant: 'Schokoladenversion (mit Schokoladenstückchen)',
    unit: 'Stück',
    priceCents: 185,
    image: null,
    ingredients: [
      'Zucker',
      'Rohrzucker',
      'Margarine',
      'Weizenmehl',
      'Salz',
      'Backpulver',
      'Ei',
      'Schokoladenstückchen'
    ]
  },
  {
    id: 'american-cookies-nuss',
    name: 'American Cookies',
    variant: 'Nussversion (mit Hasel- u. Walnüssen)',
    unit: 'Stück',
    priceCents: 185,
    image: null,
    ingredients: [
      'Zucker',
      'Rohrzucker',
      'Margarine',
      'Weizenmehl',
      'Salz',
      'Backpulver',
      'Ei',
      'Haselnüsse',
      'Walnüsse'
    ]
  },
  {
    id: 'deckelplaetzchen',
    name: 'Deckelplätzchen',
    unit: '200 g',
    priceCents: 420,
    image: null,
    ingredients: ['Ei', 'Zucker', 'Weizenmehl', 'Aroma']
  },
  {
    id: 'schwarz-weiss-plaetzchen',
    name: 'Schwarz/Weiß Plätzchen',
    unit: '200 g',
    priceCents: 420,
    image: null,
    ingredients: ['Zucker', 'Margarine', 'Weizenmehl', 'Kakao']
  },
  {
    id: 'nussplaetzchen',
    name: 'Nussplätzchen',
    unit: '200 g',
    priceCents: 420,
    image: null,
    ingredients: ['Zucker', 'Margarine', 'Weizenmehl', 'Haselnüsse']
  },
  {
    id: 'vanillekipferl',
    name: 'Vanillekipferl',
    unit: '200 g',
    priceCents: 465,
    image: null,
    ingredients: [
      'Zucker',
      'Margarine',
      'Weizenmehl',
      'Haselnuss',
      'Vanillezucker',
      'Puderzucker'
    ]
  },
  {
    id: 'nougatmuscheln',
    name: 'Nougatmuscheln',
    unit: 'Stück',
    priceCents: 200,
    image: null,
    ingredients: ['Margarine', 'Zucker', 'Ei', 'Weizenmehl', 'Nougat', 'Milchpulver']
  },
  {
    id: 'strassburger',
    name: 'Straßburger',
    unit: 'Stück',
    priceCents: 130,
    image: null,
    ingredients: ['Margarine', 'Zucker', 'Wasser', 'Weizenmehl', 'Maisstärke']
  },
  {
    id: 'kokosmakronen',
    name: 'Kokosmakronen',
    unit: '200 g',
    priceCents: 470,
    image: null,
    ingredients: ['Kokosraspeln', 'Puderzucker', 'Ei', 'Wasser']
  },
  {
    id: 'muerbteigplaetzchen',
    name: 'Mürbteigplätzchen',
    unit: '200 g',
    priceCents: 420,
    image: null,
    ingredients: ['Margarine', 'Zucker', 'Weizenmehl', 'Hagelzucker']
  },
  {
    id: 'zimtplaetzchen',
    name: 'Zimtplätzchen',
    unit: '200 g',
    priceCents: 420,
    image: null,
    ingredients: ['Margarine', 'Zucker', 'Weizenmehl', 'Zimt']
  }
];
