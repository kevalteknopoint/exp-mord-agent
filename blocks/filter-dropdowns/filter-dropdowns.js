import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Filter Dropdowns
 * Each row = one filter: cell 1 label (e.g. "What's your budget"), cell 2 rich text list of option
 * links. Renders a bar of toggle buttons; each opens a panel with its options.
 */

let filterDropdownsCount = 0;

export default function decorate(block) {
  filterDropdownsCount += 1;
  const bar = document.createElement('div');
  bar.className = 'filter-dropdowns-bar';

  const closeAll = (except) => {
    bar.querySelectorAll('.filter-dropdowns-item').forEach((item) => {
      if (item === except) return;
      item.classList.remove('open');
      item.querySelector('button').setAttribute('aria-expanded', 'false');
    });
  };

  [...block.children].forEach((row, i) => {
    const [labelCell, optionsCell] = [...row.children];
    const item = document.createElement('div');
    item.className = 'filter-dropdowns-item';
    moveInstrumentation(row, item);
    const id = `filter-dropdowns-${filterDropdownsCount}-${i + 1}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-dropdowns-toggle';
    button.textContent = (labelCell?.textContent || '').trim();
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', id);

    const panel = optionsCell || document.createElement('div');
    panel.className = 'filter-dropdowns-panel';
    panel.id = id;
    panel.querySelectorAll('.button').forEach((a) => {
      a.className = '';
      a.closest('.button-container')?.classList.remove('button-container');
    });

    button.addEventListener('click', () => {
      const open = !item.classList.contains('open');
      closeAll(item);
      item.classList.toggle('open', open);
      button.setAttribute('aria-expanded', open);
    });

    item.append(button, panel);
    bar.append(item);
  });

  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) closeAll();
  });
  block.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  block.replaceChildren(bar);
}
