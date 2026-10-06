import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Tabs FAQ
 * Optional first row with a single cell = collapsible block title (e.g. "Term insurance FAQs").
 * Every other row = one category tab:
 *   cell 1: tab label (e.g. "Quick Facts")
 *   cell 2: rich text - repeated question heading (h2-h6) + answer paragraphs/lists
 * Questions are numbered automatically and separated by dividers.
 */

let count = 0;

function buildQuestions(panel) {
  const nodes = [...panel.children];
  const list = document.createElement('ol');
  list.className = 'tabs-faq-questions';
  let item = null;
  nodes.forEach((node) => {
    if (/^H[2-6]$/.test(node.tagName)) {
      item = document.createElement('li');
      item.className = 'tabs-faq-question';
      node.classList.add('tabs-faq-question-title');
      // drop a manual "1." prefix since numbering is automatic
      node.textContent = node.textContent.trim().replace(/^\d+\.\s*/, '');
      const answer = document.createElement('div');
      answer.className = 'tabs-faq-answer';
      item.append(node, answer);
      list.append(item);
    } else if (item) {
      item.querySelector('.tabs-faq-answer').append(node);
    }
  });
  if (list.children.length) panel.append(list);
}

export default function decorate(block) {
  count += 1;
  const rows = [...block.children];
  let titleRow = null;
  let emptyTitleRow = null;
  if (rows[0] && rows[0].children.length === 1 && rows.length > 1) {
    if (rows[0].textContent.trim()) [titleRow] = rows;
    else [emptyTitleRow] = rows;
  }
  const tabRows = rows.filter((r) => r !== titleRow && r !== emptyTitleRow && r.children.length);

  const body = document.createElement('div');
  body.className = 'tabs-faq-content';
  body.id = `tabs-faq-${count}-content`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-faq-list';
  tablist.setAttribute('role', 'tablist');
  body.append(tablist);

  tabRows.forEach((row, i) => {
    const id = `tabs-faq-${count}-panel-${i + 1}`;
    const [labelCell, ...contentCells] = [...row.children];
    const panel = document.createElement('div');
    panel.className = 'tabs-faq-panel';
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-hidden', i !== 0);
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    moveInstrumentation(row, panel);
    contentCells.forEach((cell) => {
      while (cell.firstChild) panel.append(cell.firstChild);
    });
    buildQuestions(panel);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-faq-tab';
    button.id = `tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', i === 0);
    button.textContent = labelCell ? labelCell.textContent.trim() : `Tab ${i + 1}`;
    button.addEventListener('click', () => {
      body.querySelectorAll('.tabs-faq-panel').forEach((p) => p.setAttribute('aria-hidden', true));
      tablist.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
      panel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    body.append(panel);
  });

  if (tabRows.length < 2) tablist.hidden = true;

  const children = [];
  if (titleRow) {
    const heading = titleRow.querySelector('h1, h2, h3, h4, h5, h6');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'tabs-faq-toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-controls', body.id);
    const toggleText = document.createElement('span');
    toggleText.className = 'tabs-faq-toggle-text';
    toggleText.textContent = titleRow.textContent.trim();
    toggle.append(toggleText);
    const title = document.createElement(heading ? heading.tagName : 'h2');
    title.className = 'tabs-faq-title';
    moveInstrumentation(titleRow, title);
    title.append(toggle);
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !open);
      body.hidden = open;
    });
    children.push(title);
  }
  children.push(body);
  block.replaceChildren(...children);
}
