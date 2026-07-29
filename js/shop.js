/**
 * Rendert das Produktraster auf shop.html aus window.EICHHOLZ_PRODUCTS
 * (shop-data.js) und verdrahtet Mengen-Stepper + "In den Warenkorb". Nur
 * auf shop.html geladen - der Warenkorb selbst (Badge/Drawer/Checkout)
 * lebt in cart.js, das seitenübergreifend läuft.
 */
(function () {
  function formatEuro(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('shopGrid');
    if (!grid || !window.EICHHOLZ_PRODUCTS) return;

    grid.innerHTML = window.EICHHOLZ_PRODUCTS.map(function (p) {
      var media = p.image
        ? '<img class="product-photo" src="' + p.image + '" alt="' + p.name + '">'
        : '<div class="product-photo product-photo--placeholder" aria-hidden="true">' +
            '<span>🍪</span><span class="product-photo-label">Foto folgt</span></div>';

      return (
        '<li>' +
        '<div class="card card--product" data-product-id="' + p.id + '">' +
          media +
          '<h3>' + p.name + '</h3>' +
          '<p>' + p.description + '</p>' +
          '<p class="product-price">' + formatEuro(p.priceCents) +
            ' <small>/ ' + (p.unit || 'Stück') + ' · inkl. MwSt., zzgl. Versand</small></p>' +
          '<div class="product-card-footer">' +
            '<div class="qty-stepper" role="group" aria-label="Menge">' +
              '<button type="button" class="qty-btn qty-btn--minus" aria-label="Menge verringern">–</button>' +
              '<span class="qty-value" aria-live="polite">1</span>' +
              '<button type="button" class="qty-btn qty-btn--plus" aria-label="Menge erhöhen">+</button>' +
            '</div>' +
            '<button type="button" class="btn btn--primary add-to-cart-btn">In den Warenkorb</button>' +
          '</div>' +
        '</div>' +
        '</li>'
      );
    }).join('');

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.card--product');
      if (!card) return;
      var qtyEl = card.querySelector('.qty-value');

      if (e.target.closest('.qty-btn--minus')) {
        qtyEl.textContent = String(Math.max(1, parseInt(qtyEl.textContent, 10) - 1));
      } else if (e.target.closest('.qty-btn--plus')) {
        qtyEl.textContent = String(Math.min(20, parseInt(qtyEl.textContent, 10) + 1));
      } else if (e.target.closest('.add-to-cart-btn')) {
        var qty = parseInt(qtyEl.textContent, 10) || 1;
        window.EichholzCart.addItem(card.dataset.productId, qty);
        qtyEl.textContent = '1';
        window.EichholzCart.openDrawer();
      }
    });

    if (location.search.indexOf('checkout=cancelled') !== -1) {
      var notice = document.createElement('div');
      notice.className = 'notice-box';
      notice.textContent = 'Die Zahlung wurde abgebrochen – Ihr Warenkorb ist erhalten geblieben.';
      grid.parentNode.insertBefore(notice, grid);
    }
  });
})();
