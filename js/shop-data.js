/**
 * Zentrale Produktdaten für den Shop. Einzige Quelle für Name, Preis,
 * Beschreibung und Bild je Produkt - shop.js rendert das Produktraster
 * daraus, cart.js zeigt Warenkorb-Positionen daraus an.
 *
 * WICHTIG: Diese Preise sind nur für die Anzeige. Der tatsächlich
 * berechnete Preis wird beim Checkout serverseitig aus der PRODUCTS-Map
 * in stripe-worker/worker.js gelesen - beide Listen müssen beim Anlegen
 * oder Ändern eines Produkts manuell synchron gehalten werden (gleiche
 * ids, gleiche Preise).
 *
 * Neues Produkt ergänzen: Objekt unten im Array hinzufügen UND das
 * gleiche Produkt (gleiche id!) in stripe-worker/worker.js eintragen.
 * Foto ergänzen: image auf den Bildpfad setzen, sonst erscheint ein
 * Platzhalter ("Foto folgt").
 */
window.EICHHOLZ_PRODUCTS = [
  {
    id: 'butterplaetzchen',
    name: 'Butterplätzchen',
    unit: '250 g',
    priceCents: 450,
    image: null,
    description: 'Klassische Butterplätzchen nach Familienrezept, von Hand ausgestochen.'
  },
  {
    id: 'vanillekipferl',
    name: 'Vanillekipferl',
    unit: '200 g',
    priceCents: 490,
    image: null,
    description: 'Mürbe Kipferl mit gemahlenen Mandeln, in Vanillezucker gewendet.'
  },
  {
    id: 'zimtsterne',
    name: 'Zimtsterne',
    unit: '200 g',
    priceCents: 490,
    image: null,
    description: 'Saftige Zimtsterne mit knuspriger Zuckerglasur.'
  },
  {
    id: 'spekulatius',
    name: 'Spekulatius',
    unit: '250 g',
    priceCents: 420,
    image: null,
    description: 'Würzige Gewürzplätzchen, dünn und knusprig gebacken.'
  },
  {
    id: 'kokosmakronen',
    name: 'Kokosmakronen',
    unit: '200 g',
    priceCents: 490,
    image: null,
    description: 'Saftige Makronen aus Kokosraspeln, glutenfrei.'
  },
  {
    id: 'lebkuchen',
    name: 'Lebkuchen',
    unit: '300 g',
    priceCents: 550,
    image: null,
    description: 'Traditionelle Lebkuchen mit Honig und Gewürzmischung.'
  },
  {
    id: 'spritzgebaeck',
    name: 'Spritzgebäck',
    unit: '250 g',
    priceCents: 450,
    image: null,
    description: 'Feines Buttergebäck, frisch aus dem Spritzbeutel geformt.'
  },
  {
    id: 'mandelhoernchen',
    name: 'Mandelhörnchen',
    unit: '200 g',
    priceCents: 520,
    image: null,
    description: 'Mit Mandeln bestreute Hörnchen, in Zartbitterschokolade getunkt.'
  },
  {
    id: 'haselnussmakronen',
    name: 'Haselnussmakronen',
    unit: '200 g',
    priceCents: 490,
    image: null,
    description: 'Locker-nussige Makronen aus gerösteten Haselnüssen.'
  },
  {
    id: 'mischung-klassiker',
    name: 'Plätzchen-Mischung „Klassiker"',
    unit: '500 g',
    priceCents: 890,
    image: null,
    description: 'Bunte Auswahl unserer beliebtesten Plätzchensorten in einer Dose.'
  }
];
