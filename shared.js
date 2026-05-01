/* ─── SHARED JS ───
   Single source of truth for behavior across all 7 pages.
   All blocks are no-op safe when their target elements don't exist on a page. */

// Mobile drawer toggle (used by .nav-hamburger onclick)
function toggleDrawer() {
  var d = document.getElementById('mobileDrawer');
  if (!d) return;
  var h = document.querySelector('.nav-hamburger');
  d.classList.toggle('open');
  if (h) h.classList.toggle('open');
  document.body.style.overflow = d.classList.contains('open') ? 'hidden' : '';
}

// Stat-card counters (homepage + about). No-op if no .stats-band on this page.
(function() {
  var counted = false;
  function animateCount(el) {
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1400;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.floor(target * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }
  function runCounters() {
    if (counted) return;
    var band = document.querySelector('.stats-band');
    if (!band) return;
    var rect = band.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80 && rect.bottom > 0) {
      counted = true;
      document.querySelectorAll('.count').forEach(animateCount);
      document.querySelectorAll('.stat-card').forEach(function(c, i) {
        setTimeout(function() { c.classList.add('in-view'); }, i * 120);
      });
    }
  }
  window.addEventListener('scroll', runCounters, { passive: true });
  window.addEventListener('load', runCounters);
})();

// Scroll-reveal: fade sections into view as they enter the viewport
(function() {
  var sel = '.intro, .services, .featured, .featured-strip, .about-teaser, .testimonial-section, .cta-final, .story, .values, .standard, .stats-band, .nick-section, .process, .promise, .featured-quote, .testimonials-grid, .contact-grid, .service-area';
  var els = document.querySelectorAll(sel);
  els.forEach(function(e) { e.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { rootMargin: '-50px 0px' });
    els.forEach(function(e) { io.observe(e); });
  } else {
    els.forEach(function(e) { e.classList.add('visible'); });
  }
})();

// Section-nav active state + smooth scroll + back-to-top visibility.
// No-op safe: only acts on elements that exist.
(function() {
  if (document.querySelector('.section-nav')) {
    document.body.classList.add('has-section-nav');
  }
  function offsetTop() {
    var main = document.querySelector('nav');
    var sub = document.querySelector('.section-nav');
    return (main ? main.offsetHeight : 60) + (sub ? sub.offsetHeight : 0) + 12;
  }
  document.querySelectorAll('.section-nav a, .back-to-top').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      if (href === '#top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      var t = document.querySelector(href);
      if (!t) return;
      var top = t.getBoundingClientRect().top + window.pageYOffset - offsetTop();
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
  var navLinks = Array.from(document.querySelectorAll('.section-nav a[data-link]'));
  var sections = navLinks.map(function(l) { return document.getElementById(l.dataset.link); }).filter(Boolean);
  function updateActive() {
    if (!sections.length) return;
    var y = window.pageYOffset + offsetTop() + 40;
    var current = sections[0];
    sections.forEach(function(s) { if (s.offsetTop <= y) current = s; });
    navLinks.forEach(function(l) { l.classList.toggle('active', current && l.dataset.link === current.id); });
  }
  if (sections.length) {
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();
  }
  var btt = document.querySelector('.back-to-top');
  if (btt) {
    function tick() { btt.classList.toggle('visible', window.scrollY > 400); }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }
})();
