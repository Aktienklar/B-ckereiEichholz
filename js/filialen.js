/**
 * Zentrale Filialdaten + interaktive Filialkarten/Detailansicht für
 * oeffnungszeiten.html. Einzige Quelle für Name, Adresse, Öffnungszeiten,
 * Bilder und Maps-Links je Filiale - Karten und Modal werden komplett
 * daraus gerendert, damit nichts doppelt gepflegt werden muss.
 *
 * Neue Filiale ergänzen: Objekt unten im FILIALEN-Array hinzufügen.
 * Fotos ergänzen: Dateien als assets/img/filialen/<id>-<n>.jpg ablegen und
 * per photos(id, [Alternativtexte]) eintragen - Reihenfolge = Nummer n.
 * Fehlende Öffnungszeiten ergänzen: openingHours-Array mit { day, hours } befüllen.
 */
(function () {

  function fullAddress(address) {
    if (!address) return null;
    return address.street + ', ' + address.zip + ' ' + address.city;
  }

  function googleMapsSearchUrl(address) {
    var addr = fullAddress(address);
    return addr ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr) : null;
  }

  function googleMapsDirectionsUrl(address) {
    var addr = fullAddress(address);
    return addr ? 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(addr) : null;
  }

  function filiale(id, tag, name, address, openingHours, images, placeUrl) {
    return {
      id: id,
      tag: tag,
      name: name,
      address: address,
      openingHours: openingHours || null,
      images: images || [], // { src, alt }, siehe photos()
      // placeUrl: offizieller Google-Maps-Eintrag der Filiale (falls bekannt) -
      // wird bevorzugt verlinkt, sonst automatisch aus der Adresse berechnet.
      googleMapsUrl: placeUrl || googleMapsSearchUrl(address),
      googleMapsDirectionsUrl: googleMapsDirectionsUrl(address),
      isComplete: !!address
    };
  }

  function photos(id, alts) {
    return alts.map(function (alt, i) {
      return { src: 'assets/img/filialen/' + id + '-' + (i + 1) + '.jpg', alt: alt };
    });
  }

  var FILIALEN = [
    filiale(
      'mihla', 'Hauptfiliale', 'Mihla',
      { street: 'Eisenacher Str. 13', zip: '99831', city: 'Amt Creuzburg' },
      [
        { day: 'Montag – Freitag', hours: '05:30 – 18:00 Uhr' },
        { day: 'Samstag', hours: '05:30 – 16:00 Uhr' },
        { day: 'Sonntag', hours: '05:30 – 10:00 Uhr, 13:00 – 17:00 Uhr' }
      ],
      photos('mihla', [
        'Verkaufstheke der Hauptfiliale Mihla mit Brot und Gebäck',
        'Theke mit Brot, Brötchen und Kuchen in Mihla',
        'Lange Verkaufstheke der Hauptfiliale Mihla',
        'Café-Bereich der Hauptfiliale Mihla',
        'Sitzecke im Café der Hauptfiliale Mihla'
      ]),
      'https://www.google.com/maps/place/B%C3%A4ckerei+Eichholz/@51.0749405,9.7655539,79921m/data=!3m1!1e3!4m10!1m2!2m1!1sb%C3%A4ckerei+eichholz!3m6!1s0x47a490b951d436d7:0x754c019c6c9a4041!8m2!3d51.0749405!4d10.3258566!15sChJiw6Rja2VyZWkgZWljaGhvbHoiA4gBAVoUIhJiw6Rja2VyZWkgZWljaGhvbHqSAQZiYWtlcnmaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMjFWZDFsdVVtbFVTRkpRVVRCb1psbHJOVVJZTVd4NFVWZHdWbTk2WVhoQuABAPoBBAgAEEo!16s%2Fg%2F1w0qzy4t?entry=ttu&g_ep=EgoyMDI2MDcyNi4wIKXMDSoASAFQAw%3D%3D'
    ),
    filiale(
      'eisenach-karlstr', 'Filiale', 'Eisenach',
      { street: 'Karlstr. 65', zip: '99826', city: 'Eisenach' },
      [
        { day: 'Montag – Freitag', hours: '07:00 – 18:00 Uhr' },
        { day: 'Samstag', hours: '07:30 – 13:00 Uhr' }
      ],
      photos('eisenach-karlstr', [
        'Theke mit Brötchen und Gebäck in der Filiale Karlstraße',
        'Verkaufstheke der Filiale Karlstraße',
        'Innenraum der Filiale Karlstraße',
        'Eingang der Filiale Karlstraße',
        'Sitzplätze vor der Filiale Karlstraße'
      ])
    ),
    filiale(
      'eisenach-bahnhofstr', 'Filiale', 'Eisenach',
      { street: 'Bahnhofstraße 23', zip: '99817', city: 'Eisenach' },
      null,
      photos('eisenach-bahnhofstr', [
        'Brotregal und Theke in der Filiale Bahnhofstraße',
        'Verkaufstheke der Filiale Bahnhofstraße',
        'Theke und Kuchenvitrine in der Filiale Bahnhofstraße',
        'Schaufenster der Filiale Bahnhofstraße'
      ]),
      'https://www.google.com/maps/place/B%C3%A4ckerei+Eichholz/@51.0749405,9.7655539,79921m/data=!3m1!1e3!4m10!1m2!2m1!1sb%C3%A4ckerei+eichholz!3m6!1s0x47a49c7ff88e07d9:0x4d336b0601e6db6a!8m2!3d50.9750624!4d10.3246164!15sChJiw6Rja2VyZWkgZWljaGhvbHoiA4gBAVoUIhJiw6Rja2VyZWkgZWljaGhvbHqSAQZiYWtlcnmaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnQwUjFSVVpISmphbVI1WVRCU1NXTldTbWxqTVdSS1ZqQTFURkZXUlJBQuABAPoBBQj0ARAt!16s%2Fg%2F1tdnd7_k?entry=ttu&g_ep=EgoyMDI2MDcyNi4wIKXMDSoASAFQAw%3D%3D'
    ),
    filiale(
      'eisenach-gothaer', 'Filiale', 'Eisenach',
      { street: 'Gothaer Str. 1', zip: '99817', city: 'Eisenach' },
      [
        { day: 'Montag – Freitag', hours: '07:00 – 18:00 Uhr' },
        { day: 'Samstag', hours: '07:00 – 14:00 Uhr' }
      ],
      photos('eisenach-gothaer', [
        'Verkaufstheke der Filiale Gothaer Straße',
        'Theke mit Brot und Kuchen in der Filiale Gothaer Straße',
        'Brotregal der Filiale Gothaer Straße',
        'Eingang der Filiale Gothaer Straße'
      ])
    ),
    filiale(
      'erfurt-schloesserstrasse', 'Filiale', 'Erfurt',
      { street: 'Schlösserstraße 89', zip: '99084', city: 'Erfurt' },
      [
        { day: 'Montag – Freitag', hours: '08:00 – 19:00 Uhr' },
        { day: 'Samstag', hours: '08:00 – 18:00 Uhr' },
        { day: 'Sonntag', hours: '08:00 – 14:00 Uhr' }
      ],
      photos('erfurt-schloesserstrasse', [
        'Schaufenster der Filiale Schlösserstraße in Erfurt',
        'Fensterplätze mit Blick auf die Schlösserstraße',
        'Café-Bereich der Filiale Schlösserstraße',
        'Sitznische in der Filiale Schlösserstraße',
        'Sessel im Café der Filiale Schlösserstraße',
        'Sitzecke am Fenster in der Filiale Schlösserstraße',
        'Tische und Barhocker in der Filiale Schlösserstraße',
        'Regal und Sitzplätze in der Filiale Schlösserstraße',
        'Verkaufstheke der Filiale Schlösserstraße',
        'Theke mit Steinbackofen in der Filiale Schlösserstraße',
        'Kaffeekarte der Filiale Schlösserstraße',
        'Eingang des Café Eichholz in der Schlösserstraße'
      ]),
      'https://www.google.com/maps/place/B%C3%A4ckerei+Eichholz/@50.977186,10.4693421,80090m/data=!3m2!1e3!5s0x47a47295f99269e1:0x56711cf864c77142!4m10!1m2!2m1!1sb%C3%A4ckerei+eichholz!3m6!1s0x47a4732a0cce5b5f:0x9a8a2da591a35e29!8m2!3d50.977186!4d11.0296448!15sChJiw6Rja2VyZWkgZWljaGhvbHoiA4gBAVoUIhJiw6Rja2VyZWkgZWljaGhvbHqSAQZiYWtlcnmaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMjVTVFUxSVJuRk9WbkIwV0RKSmVXTlhVWGxXUm5CVVZsZHdXRlpIWXhBQuABAPoBBAgAED0!16s%2Fg%2F11q2qkyfm8?entry=ttu&g_ep=EgoyMDI2MDcyNi4wIKXMDSoASAFQAw%3D%3D'
    )
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('filialeGrid');
    if (!grid) return;

    // ---------- Karten rendern ----------
    FILIALEN.forEach(function (f) {
      var li = document.createElement('li');
      li.className = 'filiale-card-wrap';

      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'filiale-card';
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-expanded', 'false');
      card.dataset.filialeId = f.id;

      var addressLine = f.isComplete
        ? fullAddress(f.address)
        : f.name + ' – genaue Adresse folgt';

      card.innerHTML =
        '<span class="tag">' + f.tag + '</span>' +
        '<span class="filiale-card-name">' + f.name + '</span>' +
        '<span class="filiale-card-address' + (f.isComplete ? '' : ' placeholder') + '">' + addressLine + '</span>';

      card.addEventListener('click', function () {
        openModal(f, card);
      });

      li.appendChild(card);
      grid.appendChild(li);
    });

    // ---------- Modal (einmalig, wird für jede Filiale wiederverwendet) ----------
    var overlay = document.createElement('div');
    overlay.className = 'filiale-modal-overlay';

    var modal = document.createElement('div');
    modal.className = 'filiale-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    var titleId = 'filialeModalTitle';
    modal.setAttribute('aria-labelledby', titleId);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'filiale-modal-close';
    closeBtn.setAttribute('aria-label', 'Filialdetails schließen');
    closeBtn.innerHTML = '&times;';

    var media = document.createElement('div');
    media.className = 'filiale-modal-media';

    var body = document.createElement('div');
    body.className = 'filiale-modal-body';

    modal.appendChild(closeBtn);
    modal.appendChild(media);
    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    var activeCard = null;
    var lastFocused = null;

    function renderMedia(f) {
      media.innerHTML = '';

      if (!f.images.length) {
        var placeholder = document.createElement('div');
        placeholder.className = 'filiale-modal-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        placeholder.textContent = '📷';
        var label = document.createElement('span');
        label.className = 'filiale-modal-placeholder-label';
        label.textContent = 'Foto folgt';
        media.appendChild(placeholder);
        media.appendChild(label);
        return;
      }

      var index = 0;
      var backdrop = document.createElement('div');
      backdrop.className = 'filiale-modal-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      var img = document.createElement('img');
      img.decoding = 'async';
      var counter = document.createElement('span');
      counter.className = 'filiale-modal-counter';

      var renderImage = function () {
        var image = f.images[index];
        img.src = image.src;
        img.alt = image.alt || (f.name + ' – Bäckerei Eichholz');
        backdrop.style.backgroundImage = 'url("' + image.src + '")';
        counter.textContent = (index + 1) + ' / ' + f.images.length;
      };
      renderImage();
      media.appendChild(backdrop);
      media.appendChild(img);

      if (f.images.length > 1) {
        var prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'filiale-modal-nav filiale-modal-nav--prev';
        prev.setAttribute('aria-label', 'Vorheriges Bild');
        prev.innerHTML = '&#8249;';

        var next = document.createElement('button');
        next.type = 'button';
        next.className = 'filiale-modal-nav filiale-modal-nav--next';
        next.setAttribute('aria-label', 'Nächstes Bild');
        next.innerHTML = '&#8250;';

        prev.addEventListener('click', function () {
          index = (index - 1 + f.images.length) % f.images.length;
          renderImage();
        });
        next.addEventListener('click', function () {
          index = (index + 1) % f.images.length;
          renderImage();
        });

        media.appendChild(prev);
        media.appendChild(next);
        media.appendChild(counter);
      }
    }

    function renderHours(f) {
      if (!f.openingHours || !f.openingHours.length) {
        return '<p class="placeholder">Öffnungszeiten folgen</p>';
      }
      var rows = f.openingHours.map(function (entry) {
        return '<tr><td>' + entry.day + '</td><td>' + entry.hours + '</td></tr>';
      }).join('');
      return '<table class="hours-table hours-table--compact"><tbody>' + rows + '</tbody></table>';
    }

    function renderActions(f) {
      if (!f.isComplete) {
        return '<p class="notice-box notice-box--compact">Routenplanung nach Bekanntgabe der Adresse verfügbar.</p>';
      }
      return (
        '<div class="filiale-modal-actions">' +
        '<a class="btn btn--primary" href="' + f.googleMapsUrl + '" target="_blank" rel="noopener noreferrer">In Google Maps öffnen</a>' +
        '<a class="btn btn--outline" href="' + f.googleMapsDirectionsUrl + '" target="_blank" rel="noopener noreferrer">Route planen</a>' +
        '</div>'
      );
    }

    function openModal(f, triggerCard) {
      if (activeCard) {
        activeCard.setAttribute('aria-expanded', 'false');
      }
      activeCard = triggerCard;
      activeCard.setAttribute('aria-expanded', 'true');

      renderMedia(f);

      var addressHtml = f.isComplete
        ? fullAddress(f.address).replace(', ', '<br>')
        : '<span class="placeholder">Genaue Adresse folgt</span>';

      body.innerHTML =
        '<span class="tag">' + f.tag + '</span>' +
        '<h3 id="' + titleId + '">' + f.name + '</h3>' +
        '<p class="filiale-modal-address">' + addressHtml + '</p>' +
        renderHours(f) +
        renderActions(f);

      var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px';
      }
      document.body.classList.add('filiale-modal-open');
      overlay.classList.add('is-open');

      lastFocused = document.activeElement;
      modal.focus();
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('filiale-modal-open');
      document.body.style.paddingRight = '';

      if (activeCard) {
        activeCard.setAttribute('aria-expanded', 'false');
      }
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
      activeCard = null;
    }

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeModal();
      }
    });
  });

})();
