/* Page interactions:
   - reveal:   fade content up as it scrolls into view ([data-reveal])
   - parallax: drift the floating decorative shapes on scroll (.mg-floaty)
   - reseed:   re-randomise the mg-letterpress ink so it "lands" differently each load */
(function () {
  // reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.animationDelay = (i * 0.06) + 's';
        e.target.classList.add('shown');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  // parallax
  const floats = document.querySelectorAll('.mg-floaty');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    floats.forEach((el, i) => { el.style.transform = `translateY(${y * (0.03 + i * 0.02)}px)`; });
  }, { passive: true });

  // reseed mg-letterpress (filters.js injects #inkrough first, on DOMContentLoaded)
  function reseed() {
    const f = document.querySelector('#inkrough feTurbulence');
    if (!f) return;
    const b = (0.010 + Math.random() * 0.006).toFixed(4);
    f.setAttribute('baseFrequency', b + ' ' + (0.018 + Math.random() * 0.006).toFixed(4));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reseed);
  else reseed();
})();
