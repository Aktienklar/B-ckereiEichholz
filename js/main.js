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

  // Hochzeitstorten-Konfigurator: Scrollytelling-Bühne. Auf breiten Viewports
  // bleibt die 3D-Bühne gepinnt (CSS position: sticky) während ein
  // rAF-Scroll-Listener den Fortschritt 0-1 innerhalb der Sektion berechnet
  // und daraus Explosion (Layer-Abstand) sowie Text-Crossfades ableitet -
  // reines CSS-3D + vanilla JS, keine Grafik-Library. Auf schmalen
  // Viewports und bei reduced-motion läuft stattdessen ein einfacher,
  // einmaliger Reveal per IntersectionObserver.
  (function () {
    var story = document.getElementById('cakeStory');
    var stack = document.getElementById('cakeStack');
    if (!story || !stack) return;

    var storyInner = story.querySelector('.cake-story-inner');
    var panels = Array.prototype.slice.call(story.querySelectorAll('.cake-panel'));
    var swatchesDock = document.getElementById('cakeSwatchesDock');

    var biskuitFlavors = ['Sandbiskuit', 'Schoko', 'Zitrone', 'Marmor', 'Rotwein', 'Karotte', 'Mandel', 'Kokos'];
    var biskuitColors = ['#e8c288', '#6b3f28', '#f5e07a', '#cfa66b', '#7a2331', '#d98a3d', '#f0e4c8', '#fbf8f2'];

    var fuellungFlavors = ['Vanillecreme', 'Buttercreme', 'Schokocreme', 'Erdbeercreme', 'Himbeercreme', 'Kirschfüllung', 'Sahnefüllung', 'Nougatcreme'];
    var fuellungColors = ['#fdf6e3', '#f7e6c4', '#4a2c1d', '#e8879c', '#c62d55', '#8c1c3a', '#ffffff', '#6e4a2e'];

    var renderSwatches = function (containerId, flavors, colors, cssVar) {
      var container = document.getElementById(containerId);
      if (!container) return;

      flavors.forEach(function (name, index) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'flavor-swatch';
        btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        if (index === 0) {
          btn.classList.add('is-active');
        }

        var swatch = document.createElement('span');
        swatch.className = 'flavor-swatch__color';
        swatch.style.backgroundColor = colors[index];

        var label = document.createElement('span');
        label.textContent = name;

        btn.appendChild(swatch);
        btn.appendChild(label);

        btn.addEventListener('click', function () {
          stack.style.setProperty(cssVar, colors[index]);

          container.querySelectorAll('.flavor-swatch').forEach(function (other) {
            other.classList.remove('is-active');
            other.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-pressed', 'true');
        });

        container.appendChild(btn);
      });

      // Startfarbe direkt setzen, passend zum aktiven (ersten) Swatch.
      stack.style.setProperty(cssVar, colors[0]);
    };

    renderSwatches('biskuitSwatches', biskuitFlavors, biskuitColors, '--biskuit-color');
    renderSwatches('fuellungSwatches', fuellungFlavors, fuellungColors, '--fuellung-color');

    var clamp01 = function (v) {
      return Math.max(0, Math.min(1, v));
    };

    // Jedes Panel bekommt ein gleich großes Segment des Scroll-Fortschritts
    // (0-1). "layers" (Index 1) steuert zusätzlich die Explosion.
    var FADE = 0.04;

    var panelRange = function (index) {
      var count = panels.length;
      return { start: index / count, end: (index + 1) / count };
    };

    // Weicher Ein-/Ausblend-Übergang um eine Fortschritts-Kante herum,
    // erzeugt bewusst überlappende Crossfades zwischen Nachbar-Panels.
    var edgeRamp = function (progress, edge, width, rising) {
      var t = rising
        ? (progress - (edge - width)) / (2 * width)
        : ((edge + width) - progress) / (2 * width);
      return clamp01(t);
    };

    var panelOpacity = function (progress, start, end, isFirst, isLast) {
      var fadeIn = isFirst ? 1 : edgeRamp(progress, start, FADE, true);
      var fadeOut = isLast ? 1 : edgeRamp(progress, end, FADE, false);
      return clamp01(Math.min(fadeIn, fadeOut));
    };

    var applyProgress = function (progress) {
      var layersRange = panelRange(1);
      var explode = clamp01((progress - layersRange.start) / (layersRange.end - layersRange.start));
      stack.style.setProperty('--explode', explode.toFixed(3));

      panels.forEach(function (panel, index) {
        var range = panelRange(index);
        var opacity = panelOpacity(progress, range.start, range.end, index === 0, index === panels.length - 1);
        panel.style.opacity = opacity;
        panel.style.transform = 'translateY(' + ((1 - opacity) * 18).toFixed(1) + 'px)';
      });

      if (swatchesDock) {
        var configRange = panelRange(panels.length - 1);
        var dockOpacity = edgeRamp(progress, configRange.start, FADE, true);
        swatchesDock.style.opacity = dockOpacity;
        swatchesDock.style.transform = 'translateY(' + ((1 - dockOpacity) * 10).toFixed(1) + 'px)';
      }
    };

    var scrollTicking = false;
    var updateScrollProgress = function () {
      var rect = story.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var progress = total > 0 ? clamp01(-rect.top / total) : (rect.top < 0 ? 1 : 0);
      applyProgress(progress);
      scrollTicking = false;
    };

    var onScroll = function () {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(updateScrollProgress);
      }
    };

    var mobileObserver = null;

    var teardownMobile = function () {
      if (mobileObserver) {
        mobileObserver.disconnect();
        mobileObserver = null;
      }
    };

    var setupDesktopMode = function () {
      storyInner.classList.add('cake-scroll-active');
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      updateScrollProgress();
    };

    var teardownDesktopMode = function () {
      storyInner.classList.remove('cake-scroll-active');
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    var setupMobileMode = function () {
      stack.style.setProperty('--explode', '0');

      if (!('IntersectionObserver' in window)) {
        stack.style.setProperty('--explode', '1');
        panels.forEach(function (panel) {
          panel.classList.add('is-visible');
        });
        if (swatchesDock) {
          swatchesDock.classList.add('is-visible');
        }
        return;
      }

      mobileObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (entry.target === stack) {
            stack.style.setProperty('--explode', '1');
          } else {
            entry.target.classList.add('is-visible');
          }
          mobileObserver.unobserve(entry.target);
        });
      }, { threshold: 0.35 });

      mobileObserver.observe(stack);
      panels.forEach(function (panel) {
        mobileObserver.observe(panel);
      });
      if (swatchesDock) {
        mobileObserver.observe(swatchesDock);
      }
    };

    if (reduceMotion) {
      stack.style.setProperty('--explode', '1');
      panels.forEach(function (panel) {
        panel.classList.add('is-visible');
      });
      if (swatchesDock) {
        swatchesDock.classList.add('is-visible');
      }
      return;
    }

    var isDesktop = function () {
      return window.matchMedia('(min-width: 901px)').matches;
    };

    var currentlyDesktop = isDesktop();
    if (currentlyDesktop) {
      setupDesktopMode();
    } else {
      setupMobileMode();
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var nowDesktop = isDesktop();
        if (nowDesktop === currentlyDesktop) return;
        currentlyDesktop = nowDesktop;
        if (currentlyDesktop) {
          teardownMobile();
          setupDesktopMode();
        } else {
          teardownDesktopMode();
          setupMobileMode();
        }
      }, 200);
    });
  })();
});
