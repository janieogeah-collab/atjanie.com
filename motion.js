/* atjanie.com motion: nav, reveal on scroll, typewriter band.
   Progressive enhancement. Without JS everything simply shows. */
(function () {
  'use strict';

  /* nav: mobile toggle + solid bar after scrolling */
  var nav = document.getElementById('nav');
  if (nav) {
    var toggle = nav.querySelector('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
    }
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); document.body.style.overflow = ''; });
    });
    var onScroll = function () { nav.classList.toggle('solid', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- carousel (the slate) ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel-track');
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = car.querySelector('.dots');
    var playBtn = car.querySelector('.play');
    var DUR = 5500, i = 0, timer = null, paused = false;
    car.style.setProperty('--dur', DUR + 'ms');
    var dots = slides.map(function (s, k) {
      var d = document.createElement('button');
      d.className = 'dot'; d.type = 'button'; d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Show ' + s.getAttribute('aria-label'));
      d.addEventListener('click', function () { go(k, true); });
      dotsWrap.appendChild(d); return d;
    });
    function layout() {
      var w = slides[0].getBoundingClientRect().width, gap = 20;
      var x = (car.clientWidth - w) / 2 - i * (w + gap);
      track.style.transform = 'translateX(' + x + 'px)';
    }
    function go(k, user) {
      i = (k + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === i); s.tabIndex = n === i ? 0 : -1; });
      dots.forEach(function (d, n) {
        d.classList.remove('is-active'); void d.offsetWidth;
        if (n === i) d.classList.add('is-active');
        d.setAttribute('aria-selected', n === i ? 'true' : 'false');
      });
      layout(); schedule();
    }
    function schedule() { clearTimeout(timer); if (!paused) timer = setTimeout(function () { go(i + 1); }, DUR); }
    function setPaused(p) {
      paused = p; car.classList.toggle('paused', p);
      playBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
      if (p) clearTimeout(timer); else go(i);
    }
    playBtn.addEventListener('click', function () { setPaused(!paused); });
    slides.forEach(function (s, n) {
      s.addEventListener('click', function (e) { if (n !== i) { e.preventDefault(); go(n, true); } });
    });
    /* swipe */
    var sx = null, moved = false;
    track.addEventListener('pointerdown', function (e) { sx = e.clientX; moved = false; });
    track.addEventListener('pointermove', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 10) moved = true; });
    track.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1), true);
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(i + 1, true);
      if (e.key === 'ArrowLeft') go(i - 1, true);
    });
    /* pause when off screen */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (!en.isIntersecting) clearTimeout(timer); else if (!paused) schedule(); });
      }, { threshold: 0.25 }).observe(car);
    }
    window.addEventListener('resize', layout);
    if (reduced) paused = true, car.classList.add('paused');
    go(0);
  });

  /* ---------- open-up project cards ---------- */
  document.querySelectorAll('.pcard').forEach(function (card) {
    function toggle(force) {
      var open = typeof force === 'boolean' ? force : !card.classList.contains('open');
      document.querySelectorAll('.pcard.open').forEach(function (o) { if (o !== card) { o.classList.remove('open'); o.setAttribute('aria-expanded', 'false'); } });
      card.classList.toggle('open', open);
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) setTimeout(function () { card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }, 350);
    }
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      if (card.classList.contains('open') && !e.target.closest('.plus')) return;
      toggle();
    });
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } if (e.key === 'Escape') toggle(false); });
  });
  if (!('IntersectionObserver' in window)) return;

  /* typewriter: [data-type] keeps its text in the attribute and types it when seen */
  document.querySelectorAll('[data-type]').forEach(function (el) {
    var full = el.getAttribute('data-type');
    if (reduced) { el.textContent = full; return; }
    el.textContent = '';
    var caret = document.createElement('span');
    caret.className = 'caret';
    el.appendChild(caret);
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || started) return;
        started = true; io.disconnect();
        var i = 0;
        (function tick() {
          i++;
          el.textContent = full.slice(0, i);
          el.appendChild(caret);
          if (i < full.length) {
            var ch = full.charAt(i - 1);
            setTimeout(tick, /[.,]/.test(ch) ? 380 : 45 + Math.random() * 45);
          }
        })();
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  if (reduced) { document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); }); return; }

  var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal], [data-reveal-kids] > *'));
  var seen = new Map();
  els.forEach(function (el) {
    el.classList.add('reveal');
    var p = el.parentElement, k = seen.get(p) || 0;
    if (p.hasAttribute('data-reveal-kids')) el.style.transitionDelay = (Math.min(k, 6) * 0.08).toFixed(2) + 's';
    seen.set(p, k + 1);
  });
  var ro = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (el) { ro.observe(el); });
})();
