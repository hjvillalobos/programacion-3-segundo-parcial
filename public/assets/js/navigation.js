const wideLayout = window.matchMedia('(min-width: 56rem)');

document.querySelectorAll('.site-menu').forEach((menu) => {
  const summary = menu.querySelector('summary');
  function updateLayout() {
    menu.open = wideLayout.matches;
  }
  updateLayout();
  wideLayout.addEventListener('change', updateLayout);
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !wideLayout.matches && menu.open) {
      menu.open = false;
      summary.focus();
    }
  });
});
