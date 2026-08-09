/* Theme switcher.
   Applies [data-theme] on <html>, remembers the choice in localStorage, and
   (on first visit) follows the OS dark-mode setting. Buttons opt in with a
   data-theme-set="light|darkroom|blueprint" attribute. */
(function () {
  const KEY = 'mg-theme';
  const THEMES = ['light', 'darkroom', 'blueprint'];

  function firstChoice() {
    const saved = localStorage.getItem(KEY);
    if (saved && THEMES.includes(saved)) return saved;
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'darkroom' : 'light';
  }

  // apply immediately to avoid a flash of the wrong theme
  const start = firstChoice();
  document.documentElement.setAttribute('data-theme', start);

  function apply(theme) {
    if (!THEMES.includes(theme)) theme = 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-set]').forEach((b) => {
      b.classList.toggle('is-active', b.getAttribute('data-theme-set') === theme);
    });
    // the hand-drawn lines are painted once; nudge ink-lines.js to repaint
    window.dispatchEvent(new Event('resize'));
  }

  function wire() {
    apply(document.documentElement.getAttribute('data-theme') || start);
    document.querySelectorAll('[data-theme-set]').forEach((b) => {
      b.addEventListener('click', () => {
        const t = b.getAttribute('data-theme-set');
        localStorage.setItem(KEY, t);
        apply(t);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
