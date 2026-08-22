/* atjanie.com — lightweight scroll/entrance motion for text & cards.
   Progressive enhancement: if this script doesn't run, nothing is hidden —
   elements simply display normally with no animation. */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var selector = [
    '.hero-tag', '.hero-title', '.hero-subtitle', '.hero-cta',
    '.page-banner .section-label', '.page-banner h1',
    '.blog-hero .section-label', '.blog-hero h1', '.blog-cta-wrap',
    'section > .section-label', 'section > .section-title',
    '.client-cell', '.project-card', '.service-item', '.testimonial',
    '.film-card', '.work-link-item', '.writing-card', '.credential-group',
    '.contact-strip h2', '.contact-strip a.email',
    '.quote-band p', '.film-hero-quote > div',
    '.bio-image-wrap', '.bio-text .lead', '.bio-text > p'
  ].join(',');

  var els = Array.prototype.slice.call(document.querySelectorAll(selector));
  if (!els.length) return;

  // Stagger siblings that share a parent so groups (hero lines, grid cards) cascade in.
  var counts = [];
  var parents = [];
  els.forEach(function (el) {
    el.classList.add('reveal');
    var idx = parents.indexOf(el.parentElement);
    if (idx === -1) { parents.push(el.parentElement); counts.push(0); idx = parents.length - 1; }
    var step = Math.min(counts[idx], 7) * 0.07;
    counts[idx] += 1;
    el.style.transitionDelay = step.toFixed(2) + 's';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
