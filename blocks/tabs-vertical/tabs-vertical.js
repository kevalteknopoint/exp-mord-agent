import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Tabs Vertical
 * Each row = one tab: cell 1 tab label, cell 2 rich text (heading, paragraph, link).
 * Desktop: stacked tab labels on the left, the selected tab's white detail card on the right.
 * The link renders as an arrow at the bottom of the card.
 */

let tabsVerticalCount = 0;

function selectTab(block, button) {
  block.querySelectorAll('.tabs-vertical-tab').forEach((btn) => {
    const selected = btn === button;
    btn.setAttribute('aria-selected', selected);
    btn.tabIndex = selected ? 0 : -1;
  });
  block.querySelectorAll('.tabs-vertical-panel').forEach((panel) => {
    panel.setAttribute('aria-hidden', panel.id !== button.getAttribute('aria-controls'));
  });
}

export default function decorate(block) {
  tabsVerticalCount += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-vertical-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-orientation', 'vertical');

  const panels = document.createElement('div');
  panels.className = 'tabs-vertical-panels';

  [...block.children].forEach((row, i) => {
    const [labelCell, textCell] = [...row.children];
    const id = `tabs-vertical-${tabsVerticalCount}-panel-${i + 1}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-vertical-tab';
    button.id = `${id}-tab`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.textContent = (labelCell?.textContent || '').trim() || `Tab ${i + 1}`;
    button.addEventListener('click', () => selectTab(block, button));
    tablist.append(button);

    const panel = document.createElement('div');
    panel.className = 'tabs-vertical-panel';
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    moveInstrumentation(row, panel);
    if (textCell) {
      moveInstrumentation(textCell, panel);
      while (textCell.firstChild) panel.append(textCell.firstChild);
    }
    const link = [...panel.querySelectorAll('a')].pop();
    if (link) {
      link.classList.remove('button', 'primary', 'secondary');
      link.classList.add('tabs-vertical-link');
      const p = link.closest('p');
      p?.classList.remove('button-container');
      p?.classList.add('tabs-vertical-link-wrapper');
    }
    panels.append(panel);
  });

  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    const tabs = [...tablist.children];
    const current = tabs.indexOf(document.activeElement);
    let next = current;
    if (e.key === 'ArrowDown') next = (current + 1) % tabs.length;
    if (e.key === 'ArrowUp') next = (current - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    e.preventDefault();
    tabs[next].focus();
    selectTab(block, tabs[next]);
  });

  block.replaceChildren(tablist, panels);
  if (tablist.firstElementChild) selectTab(block, tablist.firstElementChild);
}
