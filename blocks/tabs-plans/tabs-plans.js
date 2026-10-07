import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Tabs Plans
 * Each row = one plan card: cell 1 tab label (cards with the same label are grouped into one tab),
 * cell 2 illustration image, cell 3 rich text (optional badge paragraph before the heading,
 * heading - <strong> words are highlighted in red, description, link).
 * Pill tab list; each tab panel shows its plan cards in a grid. The link makes the card clickable.
 */

let tabsPlansCount = 0;

function decorateCard(row) {
  const [, imageCell, textCell] = [...row.children];
  const card = document.createElement('li');
  card.className = 'tabs-plans-card';
  moveInstrumentation(row, card);

  if (textCell) {
    textCell.className = 'tabs-plans-body';
    const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
    const children = [...textCell.children];
    const headingIndex = heading ? children.indexOf(heading) : -1;
    children.forEach((el, i) => {
      if (el.tagName === 'P' && i < headingIndex && !el.querySelector('a')) el.className = 'tabs-plans-badge';
    });
    const link = [...textCell.querySelectorAll('a')].pop();
    if (link) {
      link.className = 'tabs-plans-link';
      const p = link.closest('p');
      if (p) p.className = 'tabs-plans-link-wrapper';
    }
    card.append(textCell);
  }

  const img = imageCell?.querySelector('picture img');
  if (img) {
    imageCell.className = 'tabs-plans-image';
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    img.closest('picture').replaceWith(picture);
    card.append(imageCell);
  }
  return card;
}

function select(block, button) {
  block.querySelectorAll('.tabs-plans-tab').forEach((tab) => {
    const selected = tab === button;
    tab.setAttribute('aria-selected', selected);
    tab.tabIndex = selected ? 0 : -1;
  });
  block.querySelectorAll('.tabs-plans-panel').forEach((panel) => {
    panel.setAttribute('aria-hidden', panel.id !== button.getAttribute('aria-controls'));
  });
}

export default function decorate(block) {
  tabsPlansCount += 1;
  const groups = new Map();
  [...block.children].forEach((row) => {
    const label = (row.firstElementChild?.textContent || '').trim() || 'Plans';
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(decorateCard(row));
  });

  const tablist = document.createElement('div');
  tablist.className = 'tabs-plans-list';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'tabs-plans-panels';

  [...groups.entries()].forEach(([label, cards], i) => {
    const id = `tabs-plans-${tabsPlansCount}-${i + 1}`;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-plans-tab';
    tab.id = `${id}-tab`;
    tab.textContent = label;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', id);
    tab.addEventListener('click', () => select(block, tab));
    tablist.append(tab);

    const panel = document.createElement('ul');
    panel.className = 'tabs-plans-panel';
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.append(...cards);
    panels.append(panel);
  });

  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const tabs = [...tablist.children];
    const step = e.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(tabs.indexOf(document.activeElement) + step + tabs.length) % tabs.length];
    e.preventDefault();
    next.focus();
    select(block, next);
  });

  block.replaceChildren(tablist, panels);
  if (tablist.firstElementChild) select(block, tablist.firstElementChild);
}
