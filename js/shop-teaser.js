/**
 * Shop-Teaser auf der Startseite: rendert eine kleine Produktauswahl aus
 * window.EICHHOLZ_PRODUCTS (shop-data.js), damit Namen und Preise nur an
 * einer Stelle gepflegt werden müssen und nicht als Kopie im HTML altern.
 *
 * Bewusst nur Vorschau: Mengenwahl, Warenkorb und Checkout leben auf
 * shop.html (shop.js) - die Karten hier verlinken nur dorthin.
 *
 * Läuft absichtlich sofort (nicht erst auf DOMContentLoaded): das Script
 * steht am Ende des <body>, der Container existiert also bereits, und die
 * Karten stehen damit im DOM, bevor main.js seine Reveal-/Tilt-Effekte
 * verteilt.
 */
(function () {
  // Wunsch-Auswahl für den Teaser; fehlt eine id in shop-data.js, wird
  // vorne aufgefüllt, damit der Teaser nie halb leer bleibt.
  var TEASER_IDS = ['spritzplaetzchen', 'vanillekipferl', 'american-cookies-schoko'];
  var TEASER_COUNT = 3;

  function formatEuro(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  function ingredientsHtml(p) {
    if (!p.ingredients || !p.ingredients.length) return '';
    return '<p class="product-ingredients"><strong>Zutaten:</strong> ' +
      p.ingredients.join(', ') + '</p>';
  }

  function variantHtml(p) {
    if (!p.variant) return '';
    return '<p class="product-variant"><strong>Variante:</strong> ' + p.variant + '</p>';
  }

  function pickProducts(all) {
    var picked = TEASER_IDS
      .map(function (id) {
        return all.filter(function (p) { return p.id === id; })[0];
      })
      .filter(Boolean);

    all.forEach(function (p) {
      if (picked.length < TEASER_COUNT && picked.indexOf(p) === -1) picked.push(p);
    });

    return picked.slice(0, TEASER_COUNT);
  }

  var grid = document.getElementById('shopTeaserGrid');
  if (!grid || !window.EICHHOLZ_PRODUCTS) return;

  grid.innerHTML = pickProducts(window.EICHHOLZ_PRODUCTS).map(function (p) {
    var media = p.image
      ? '<img class="product-photo" src="' + p.image + '" alt="' + p.name + '">'
      : '<div class="product-photo product-photo--placeholder" aria-hidden="true">' +
          '<span>🍪</span><span class="product-photo-label">Foto folgt</span></div>';

    return (
      '<li>' +
      '<a class="card card--product card--teaser" href="shop.html">' +
        media +
        '<h3>' + p.name + '</h3>' +
        variantHtml(p) +
        ingredientsHtml(p) +
        '<p class="product-price">' + formatEuro(p.priceCents) +
          ' <small>/ ' + (p.unit || 'Stück') + ' · inkl. MwSt., zzgl. Versand</small></p>' +
        '<span class="teaser-link">Im Shop ansehen</span>' +
      '</a>' +
      '</li>'
    );
  }).join('');
})();
