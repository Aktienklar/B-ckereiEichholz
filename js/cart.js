/**
 * Seitenübergreifender Warenkorb (localStorage), Cart-Icon-Badge im Header
 * und Slide-in-Drawer mit Kasse-Button. Wird auf jeder Seite geladen (nach
 * shop-data.js), damit der Warenkorb-Zustand egal von welcher Seite aus
 * sichtbar/bedienbar ist - Drawer-Aufbau folgt dem gleichen Muster wie das
 * Filiale-Modal in js/filialen.js (einmalig gebaute Overlay-DOM, per Klasse
 * ein-/ausgeblendet, Fokus-Handling, Scrollbar-Breite kompensiert).
 *
 * WORKER_URL zeigt auf die Cloudflare-Worker-Funktion, die die Stripe
 * Checkout Session erstellt (siehe stripe-worker/). Nach dem Deployment
 * (stripe-worker/DEPLOYMENT.md) die echte *.workers.dev-URL hier eintragen.
 */
(function () {
  var STORAGE_KEY = 'eichholz_cart_v1';
  var WORKER_URL = 'https://eichholz-shop-worker.YOUR-SUBDOMAIN.workers.dev';

  function loadCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      // Speicher voll oder deaktiviert (z.B. privater Modus) - Warenkorb
      // bleibt dann nur für die aktuelle Seite im Speicher erhalten.
    }
    renderBadge();
    renderDrawer();
  }

  function findProduct(id) {
    var products = window.EICHHOLZ_PRODUCTS || [];
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function clampQty(qty) {
    qty = parseInt(qty, 10) || 0;
    return Math.max(0, Math.min(20, qty));
  }

  function addItem(id, qty) {
    if (!findProduct(id)) return;
    qty = clampQty(qty || 1);
    if (qty <= 0) return;

    var cart = loadCart();
    var line = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { line = cart[i]; break; }
    }
    if (line) {
      line.qty = clampQty(line.qty + qty);
    } else {
      cart.push({ id: id, qty: qty });
    }
    saveCart(cart);
  }

  function updateQty(id, qty) {
    qty = clampQty(qty);
    var cart = loadCart();
    if (qty <= 0) {
      cart = cart.filter(function (l) { return l.id !== id; });
    } else {
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) { cart[i].qty = qty; break; }
      }
    }
    saveCart(cart);
  }

  function removeItem(id) {
    var cart = loadCart().filter(function (l) { return l.id !== id; });
    saveCart(cart);
  }

  function getCount() {
    return loadCart().reduce(function (sum, l) { return sum + l.qty; }, 0);
  }

  function getSubtotalCents() {
    return loadCart().reduce(function (sum, l) {
      var p = findProduct(l.id);
      return sum + (p ? p.priceCents * l.qty : 0);
    }, 0);
  }

  function formatEuro(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  function renderBadge() {
    var count = getCount();
    document.querySelectorAll('.cart-badge').forEach(function (badge) {
      badge.textContent = String(count);
      badge.classList.toggle('is-hidden', count === 0);
    });
  }

  // ---------- Drawer (einmalig gebaut, für jeden Warenkorb-Stand neu befüllt) ----------
  var overlay, drawer, itemsEl, subtotalEl, checkoutBtn, errorEl;
  var lastFocused = null;

  function buildDrawerOnce() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'cart-drawer-overlay';

    drawer = document.createElement('div');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('tabindex', '-1');
    var titleId = 'cartDrawerTitle';
    drawer.setAttribute('aria-labelledby', titleId);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cart-drawer-close';
    closeBtn.setAttribute('aria-label', 'Warenkorb schließen');
    closeBtn.innerHTML = '&times;';

    var heading = document.createElement('h3');
    heading.id = titleId;
    heading.textContent = 'Ihr Warenkorb';

    itemsEl = document.createElement('div');
    itemsEl.className = 'cart-drawer-items';

    var footer = document.createElement('div');
    footer.className = 'cart-drawer-footer';

    subtotalEl = document.createElement('p');
    subtotalEl.className = 'cart-drawer-subtotal';

    errorEl = document.createElement('p');
    errorEl.className = 'notice-box notice-box--compact cart-drawer-error is-hidden';

    checkoutBtn = document.createElement('button');
    checkoutBtn.type = 'button';
    checkoutBtn.className = 'btn btn--primary cart-drawer-checkout';
    checkoutBtn.textContent = 'Zur Kasse';
    checkoutBtn.addEventListener('click', checkout);

    footer.appendChild(subtotalEl);
    footer.appendChild(errorEl);
    footer.appendChild(checkoutBtn);

    drawer.appendChild(closeBtn);
    drawer.appendChild(heading);
    drawer.appendChild(itemsEl);
    drawer.appendChild(footer);
    overlay.appendChild(drawer);
    document.body.appendChild(overlay);

    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDrawer();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeDrawer();
    });

    wireItemEvents();
  }

  function renderDrawer() {
    if (!itemsEl) return;
    var cart = loadCart();

    if (!cart.length) {
      itemsEl.innerHTML = '<p class="cart-drawer-empty">Ihr Warenkorb ist noch leer.</p>';
    } else {
      itemsEl.innerHTML = cart.map(function (line) {
        var p = findProduct(line.id);
        if (!p) return '';
        // Varianten (z.B. American Cookies) sind eigene Produkte mit
        // gleichem Namen - die Variante gehört daher mit in die Zeile.
        var label = p.name + (p.variant ? ' – ' + p.variant : '');
        return (
          '<div class="cart-item" data-product-id="' + p.id + '">' +
            '<div class="cart-item-info">' +
              '<span class="cart-item-name">' + label + '</span>' +
              '<span class="cart-item-unit">' + (p.unit || '') + '</span>' +
            '</div>' +
            '<div class="qty-stepper" role="group" aria-label="Menge ' + label + '">' +
              '<button type="button" class="qty-btn qty-btn--minus" aria-label="Menge verringern">–</button>' +
              '<span class="qty-value" aria-live="polite">' + line.qty + '</span>' +
              '<button type="button" class="qty-btn qty-btn--plus" aria-label="Menge erhöhen">+</button>' +
            '</div>' +
            '<span class="cart-item-price">' + formatEuro(p.priceCents * line.qty) + '</span>' +
            '<button type="button" class="cart-item-remove" aria-label="' + label + ' entfernen">&times;</button>' +
          '</div>'
        );
      }).join('');
    }

    subtotalEl.textContent = 'Zwischensumme: ' + formatEuro(getSubtotalCents()) + ' (zzgl. Versand)';
    checkoutBtn.disabled = cart.length === 0;
  }

  function wireItemEvents() {
    itemsEl.addEventListener('click', function (e) {
      var id = e.target.closest('.cart-item') && e.target.closest('.cart-item').dataset.productId;
      if (!id) return;

      if (e.target.closest('.qty-btn--minus')) {
        var cart = loadCart();
        var line = cart.filter(function (l) { return l.id === id; })[0];
        updateQty(id, line ? line.qty - 1 : 0);
      } else if (e.target.closest('.qty-btn--plus')) {
        var cart2 = loadCart();
        var line2 = cart2.filter(function (l) { return l.id === id; })[0];
        updateQty(id, line2 ? line2.qty + 1 : 1);
      } else if (e.target.closest('.cart-item-remove')) {
        removeItem(id);
      }
    });
  }

  function openDrawer() {
    buildDrawerOnce();
    renderDrawer();

    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = scrollbarWidth + 'px';
    }
    document.body.classList.add('cart-drawer-open');
    overlay.classList.add('is-open');

    lastFocused = document.activeElement;
    drawer.focus();
  }

  function closeDrawer() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('cart-drawer-open');
    document.body.style.paddingRight = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('is-hidden');
  }

  function hideError() {
    errorEl.classList.add('is-hidden');
  }

  function checkout() {
    var cart = loadCart();
    if (!cart.length) return;

    hideError();
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Einen Moment …';

    fetch(WORKER_URL + '/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(function (l) { return { id: l.id, qty: l.qty }; }),
        origin: window.location.origin
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('checkout_failed');
        return res.json();
      })
      .then(function (data) {
        if (!data.url) throw new Error('no_url');
        window.location.href = data.url;
      })
      .catch(function () {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Zur Kasse';
        showError('Die Kasse konnte nicht geladen werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.');
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderBadge();

    document.querySelectorAll('.cart-toggle').forEach(function (btn) {
      btn.addEventListener('click', openDrawer);
    });

    // Warenkorb nach erfolgreichem Checkout leeren.
    if (location.pathname.indexOf('shop-erfolg.html') !== -1) {
      saveCart([]);
    }
  });

  window.EichholzCart = {
    addItem: addItem,
    updateQty: updateQty,
    removeItem: removeItem,
    getCount: getCount,
    getSubtotalCents: getSubtotalCents,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer
  };
})();
