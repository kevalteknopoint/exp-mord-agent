import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

// optional per-card theme, authored as the last cell (select field in Universal Editor)
const THEMES = ['blue', 'red', 'plum', 'black', 'chocolate'];

let tabsId = 0;

function optimize(scope, width = '200') {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tab';
}

function buildCard(row, cells) {
  const card = document.createElement('li');
  card.className = 'tabs-products-card';
  moveInstrumentation(row, card);

  let theme = '';
  const rest = cells.filter((cell) => {
    const value = cell.textContent.trim().toLowerCase();
    if (!cell.querySelector('picture, a') && THEMES.includes(value)) {
      theme = value;
      return false;
    }
    return true;
  });
  if (theme) card.classList.add(`tabs-products-card-${theme}`);

  const iconCell = rest.find((c) => c.querySelector('picture') && !c.textContent.trim());
  const bodyCells = rest.filter((c) => c !== iconCell && (c.textContent.trim() || c.querySelector('picture')));

  const body = document.createElement('div');
  body.className = 'tabs-products-card-body';
  bodyCells.forEach((c) => {
    while (c.firstChild) body.append(c.firstChild);
  });
  const links = [...body.querySelectorAll('a')];
  if (links.length) {
    const ctas = document.createElement('div');
    ctas.className = 'tabs-products-card-ctas';
    links.forEach((a, i) => {
      a.classList.add(i === 0 ? 'tabs-products-cta-primary' : 'tabs-products-cta-secondary');
      const holder = a.closest('p') || a;
      // the plain (not bold) secondary link ("Know more") is a text link, not a button
      if (i > 0 && !a.closest('strong, em')) {
        a.classList.remove('button', 'primary', 'secondary');
        holder.classList.remove('button-container');
      }
      ctas.append(holder);
    });
    body.append(ctas);
  }
  body.querySelectorAll('p:empty').forEach((p) => p.remove());
  card.append(body);

  if (iconCell) {
    iconCell.className = 'tabs-products-card-icon';
    optimize(iconCell);
    card.append(iconCell);
  }
  return card;
}

export default function decorate(block) {
  tabsId += 1;
  const groups = new Map();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const tabCell = cells.shift();
    const label = tabCell.textContent.trim() || 'Products';
    if (!groups.has(label)) groups.set(label, { label, icon: null, cards: [] });
    const group = groups.get(label);
    const icon = tabCell.querySelector('picture');
    if (icon && !group.icon) group.icon = icon;
    group.cards.push(buildCard(row, cells));
  });

  const tablist = document.createElement('div');
  tablist.className = 'tabs-products-list';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'tabs-products-panels';

  [...groups.values()].forEach((group, i) => {
    const id = `tabs-products-${tabsId}-${slug(group.label)}-${i}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-products-tab';
    button.id = `${id}-tab`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', i === 0);
    button.tabIndex = i === 0 ? 0 : -1;
    if (group.icon) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'tabs-products-tab-icon';
      iconWrap.append(group.icon);
      optimize(iconWrap, '64');
      button.append(iconWrap);
    }
    const text = document.createElement('span');
    text.className = 'tabs-products-tab-label';
    text.textContent = group.label;
    button.append(text);
    tablist.append(button);

    const panel = document.createElement('div');
    panel.className = 'tabs-products-panel';
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.setAttribute('aria-hidden', i !== 0);
    const grid = document.createElement('ul');
    grid.className = 'tabs-products-grid';
    grid.append(...group.cards);
    panel.append(grid);
    panels.append(panel);
  });

  const select = (button) => {
    tablist.querySelectorAll('[role=tab]').forEach((b) => {
      const on = b === button;
      b.setAttribute('aria-selected', on);
      b.tabIndex = on ? 0 : -1;
    });
    panels.querySelectorAll('[role=tabpanel]').forEach((p) => {
      p.setAttribute('aria-hidden', p.id !== button.getAttribute('aria-controls'));
    });
  };

  tablist.addEventListener('click', (e) => {
    const button = e.target.closest('[role=tab]');
    if (button) select(button);
  });
  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = [...tablist.querySelectorAll('[role=tab]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let target = current;
    if (e.key === 'ArrowRight') target = (current + 1) % tabs.length;
    if (e.key === 'ArrowLeft') target = (current - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') target = 0;
    if (e.key === 'End') target = tabs.length - 1;
    e.preventDefault();
    tabs[target].focus();
    select(tabs[target]);
  });

  block.textContent = '';
  block.append(tablist, panels);
}
