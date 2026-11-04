(() => {
  /* ---------- Mobile navigation ---------- */
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (header.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
  });

  /* ---------- Highlight the section in view ---------- */
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean)
      .forEach((section) => spy.observe(section));
  }

  /* ---------- Light / dark theme ---------- */
  // The saved choice is applied by an inline script in <head>; with no choice the system setting wins
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const THEME_COLORS = { light: '#f5f6f8', dark: '#0e1116' };
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

  function showTheme() {
    const theme = currentTheme();
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
    themeButton.dataset.current = theme;
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
  }
  themeButton.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
    showTheme();
  });
  systemDark.addEventListener('change', showTheme);
  showTheme();

  /* ---------- Project filters ---------- */
  const filterButtons = document.querySelectorAll('[data-filter]');
  const projects = [...document.querySelectorAll('.project')];
  const filterStatus = document.getElementById('filter-status');
  const FILTER_NAMES = { app: 'web app', site: 'website', tool: 'tool' };

  function applyFilter(filter) {
    let shown = 0;
    projects.forEach((project) => {
      project.hidden = filter !== 'all' && project.dataset.category !== filter;
      project.classList.remove('is-lead');
      if (!project.hidden) shown += 1;
    });
    projects.find((project) => !project.hidden)?.classList.add('is-lead');
    filterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    filterStatus.textContent = filter === 'all'
      ? `Showing all ${projects.length} projects`
      : `Showing ${shown} ${FILTER_NAMES[filter]}${shown === 1 ? '' : 's'} of ${projects.length} projects`;
  }
  filterButtons.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
