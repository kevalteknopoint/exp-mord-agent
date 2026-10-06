/*
 * Columns Duration
 * One row, two columns:
 *   column 1: heading, check-list (ul), CTA link
 *   column 2: intro heading/paragraph, then comparison tiles - each tile starts at an
 *             h4/h5/h6 badge heading (e.g. "Cover till 70 years of age") followed by its
 *             content (optional icon, amount, label, price) until the next badge heading.
 */

function buildTiles(col) {
  const badges = [...col.querySelectorAll(':scope > h4, :scope > h5, :scope > h6')];
  if (!badges.length) return;
  const tiles = document.createElement('div');
  tiles.className = 'columns-duration-tiles';
  badges.forEach((badge) => {
    const tile = document.createElement('div');
    tile.className = 'columns-duration-tile';
    const content = document.createElement('div');
    content.className = 'columns-duration-tile-content';
    let next = badge.nextElementSibling;
    while (next && !badges.includes(next)) {
      const move = next;
      next = next.nextElementSibling;
      content.append(move);
    }
    badge.classList.add('columns-duration-badge');
    // emphasise the number inside the badge ("Cover till 70 years of age")
    badge.innerHTML = badge.innerHTML.replace(/(\d+)/, '<span class="columns-duration-badge-number">$1</span>');
    // emphasise the premium amount in plain price lines ("at ₹28,378/Year")
    content.querySelectorAll(':scope > p').forEach((p) => {
      if (p.querySelector('strong, picture')) return;
      p.classList.add('columns-duration-price');
      p.innerHTML = p.innerHTML.replace(/(₹\s?[\d,.]+)/, '<span class="columns-duration-amount">$1</span>');
    });
    tile.append(badge, content);
    tiles.append(tile);
  });
  col.append(tiles);
  const intro = [...col.children].filter((c) => c !== tiles);
  intro.forEach((n) => n.classList.add('columns-duration-intro'));
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add('columns-duration-row');
  const [main, panel] = [...row.children];
  if (main) {
    main.classList.add('columns-duration-main');
    main.querySelectorAll('ul').forEach((ul) => ul.classList.add('columns-duration-checklist'));
    main.querySelectorAll(':scope > p').forEach((p) => {
      const a = p.querySelector('a');
      if (a && a.textContent.trim() === p.textContent.trim()) p.classList.add('columns-duration-cta');
    });
  }
  if (panel) {
    panel.classList.add('columns-duration-panel');
    buildTiles(panel);
  }
  // any additional rows are kept and simply stacked
  [...block.children].slice(1).forEach((r) => r.classList.add('columns-duration-row'));
}
