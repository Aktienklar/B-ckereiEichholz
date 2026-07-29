document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Sticky header: solid background only appears after scrolling past the
  // hero / page-hero banner, so the nav can float transparently over them.
  var header = document.querySelector('.site-header');
  if (header) {
    var scrollThreshold = 40;
    var ticking = false;

    var updateHeaderState = function () {
      header.classList.toggle('is-scrolled', window.scrollY > scrollThreshold);
      ticking = false;
    };

    // Measure the real header height so the hero/page-hero banners underneath
    // can be pulled up by exactly that amount (keeps the transparent nav
    // flush with no gap, independent of font-loading/viewport changes).
    var syncHeaderHeight = function () {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    };

    updateHeaderState();
    syncHeaderHeight();

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        setTimeout(updateHeaderState, 60);
      }
    }, { passive: true });

    window.addEventListener('resize', syncHeaderHeight);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncHeaderHeight);
    }
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Scroll-in reveal for images, text blocks and product cards.
  // Plain IntersectionObserver instead of a library (e.g. AOS): the whole
  // site is dependency-free static HTML/CSS/JS, so this avoids an extra
  // request/script for an effect that's ~40 lines of native browser API.
  // Different element types get a different reveal style (fade / pop /
  // tilt) so the page doesn't just do one repetitive fade-in everywhere.
  var revealGroups = [
    { selector: '.section-heading, .contact-card, .hours-table, .map-wrap, .filiale-list li', variant: null },
    { selector: '.torte-grid figure, .gallery img', variant: 'reveal--pop' },
    { selector: '.card, .timeline-item', variant: 'reveal--tilt' }
  ];

  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealGroups.forEach(function (group) {
      var els = Array.prototype.slice.call(document.querySelectorAll(group.selector));

      els.forEach(function (el) {
        el.classList.add('reveal');
        if (group.variant) {
          el.classList.add(group.variant);
        }

        // Stagger elements that share a parent (grid/gallery items), so
        // cards in the same row cascade in slightly rather than popping
        // in all at once.
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
          return child.matches(group.selector);
        });
        var index = siblings.indexOf(el);
        el.style.transitionDelay = (Math.min(index, 5) * 70) + 'ms';

        observer.observe(el);
      });
    });
  }

  // Subtle 3D tilt on hover for product cards and torte photos. Mouse/
  // trackpad only (gated on "hover: hover) and (pointer: fine)") so touch
  // devices never attach the listeners in the first place - no cost there.
  if (canHover && !reduceMotion) {
    var tilt = function (selector, maxTilt, hoverScale) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.addEventListener('mousemove', function (e) {
          var rect = el.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width - 0.5;
          var py = (e.clientY - rect.top) / rect.height - 0.5;
          var rotateX = (-py * maxTilt).toFixed(2);
          var rotateY = (px * maxTilt).toFixed(2);
          el.style.transform = 'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' +
            rotateY + 'deg) scale(' + hoverScale + ') translateY(-6px)';
        });

        el.addEventListener('mouseleave', function () {
          el.style.transform = '';
        });
      });
    };

    tilt('.card', 7, 1.02);
    tilt('.torte-grid figure', 9, 1.03);
  }

  // Lightbox: click any gallery/torte/content photo to view it uncropped
  // (object-fit: contain) in a darkened overlay. Reuses the same img tag's
  // src rather than duplicating markup per image.
  var lightboxTriggers = document.querySelectorAll('.gallery img, .torte-grid img, .hero-image img');
  if (lightboxTriggers.length) {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Bildansicht');

    var overlayImg = document.createElement('img');
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Schließen');
    closeBtn.innerHTML = '&times;';

    overlay.appendChild(overlayImg);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    var lastFocused = null;

    var openLightbox = function (img) {
      overlayImg.src = img.currentSrc || img.src;
      overlayImg.alt = img.alt || '';

      // Compensate for the scrollbar that overflow:hidden removes, so the
      // page content doesn't shift sideways while the lightbox is open.
      var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px';
      }
      document.body.classList.add('lightbox-open');

      overlay.classList.add('is-open');
      lastFocused = document.activeElement;
      closeBtn.focus();
    };

    var closeLightbox = function () {
      overlay.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      document.body.style.paddingRight = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    };

    lightboxTriggers.forEach(function (img) {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Bild vergrößern: ' + (img.alt || ''));

      img.addEventListener('click', function () {
        openLightbox(img);
      });

      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(img);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  // Gentle parallax on the hero photo: moves slower than the page scroll.
  // Skipped on touch/small screens and reduced-motion (purely decorative
  // depth cue, not worth the extra scroll listener there).
  var heroImg = document.querySelector('.hero-media img');
  if (heroImg && !reduceMotion && window.innerWidth > 640) {
    var parallaxTicking = false;

    var updateParallax = function () {
      var offset = Math.min(window.scrollY, window.innerHeight) * 0.25;
      heroImg.style.transform = 'scale(1.12) translateY(' + offset + 'px)';
      parallaxTicking = false;
    };

    window.addEventListener('scroll', function () {
      if (!parallaxTicking) {
        parallaxTicking = true;
        window.requestAnimationFrame(updateParallax);
      }
    }, { passive: true });
  }

});
