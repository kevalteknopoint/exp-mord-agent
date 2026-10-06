import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Tabs Feature
 * Each row = one tab: cell 1 tab label, cell 2 image, cell 3 rich text (heading, paragraph, link).
 * Horizontal underlined tab list; each panel shows the image beside the text.
 */

let tabsFeatureCount = 0;

function selectTab(block, button) {
  block.querySelectorAll('.tabs-feature-tab').forEach((btn) => {
    const selected = btn === button;
    btn.setAttribute('aria-selected', selected);
    btn.tabIndex = selected ? 0 : -1;
  });
  block.querySelectorAll('.tabs-feature-panel').forEach((panel) => {
    panel.setAttribute('aria-hidden', panel.id !== button.getAttribute('aria-controls'));
  });
}

export default function decorate(block) {
  tabsFeatureCount += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-feature-list';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'tabs-feature-panels';

  [...block.children].forEach((row, i) => {
    const [labelCell, imageCell, textCell] = [...row.children];
    const id = `tabs-feature-${tabsFeatureCount}-panel-${i + 1}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-feature-tab';
    button.id = `${id}-tab`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.textContent = (labelCell?.textContent || '').trim() || `Tab ${i + 1}`;
    button.addEventListener('click', () => selectTab(block, button));
    tablist.append(button);
    labelCell?.remove();

    row.className = 'tabs-feature-panel';
    row.id = id;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-labelledby', button.id);

    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'tabs-feature-image';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1000' }, { width: '750' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
    } else imageCell?.remove();

    if (textCell) {
      textCell.className = 'tabs-feature-body';
      textCell.querySelectorAll('a').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary');
        a.classList.add('tabs-feature-link');
        a.closest('p')?.classList.remove('button-container');
      });
    }

    panels.append(row);
  });

  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = [...tablist.children];
    const current = tabs.indexOf(document.activeElement);
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    e.preventDefault();
    tabs[next].focus();
    selectTab(block, tabs[next]);
  });

  block.replaceChildren(tablist, panels);
  if (tablist.firstElementChild) selectTab(block, tablist.firstElementChild);
}
