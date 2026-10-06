import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Table Comparison
 * Each row = one comparison row:
 *   first row  : header - label column title + one cell per compared plan
 *   other rows : cell 1 attribute label, cells 2..n plan values (rich text)
 * Inside a value cell, a paragraph that is entirely bold (e.g. "**Minimum**", "**Maximum**")
 * starts a sub-column: it becomes a sub-label and the content after it is that sub-column's value.
 * A row whose label cell is empty and whose values are links becomes the CTA row (buttons).
 * Long tables show the first VISIBLE_ROWS rows; a "View more" paragraph authored right after
 * the block (in the following default content) becomes the expand / collapse toggle.
 */

const VISIBLE_ROWS = 7;
const VIEW_MORE = /^view (more|all|less)$/i;

function isSubLabel(node) {
  if (node.tagName !== 'P') return false;
  const strong = node.querySelector(':scope > strong, :scope > b');
  return strong && node.children.length === 1
    && strong.textContent.trim() === node.textContent.trim();
}

function splitSubRows(cell) {
  const nodes = [...cell.childNodes]
    .filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));
  if (!nodes.some((n) => n.nodeType === 1 && isSubLabel(n))) return false;
  const grid = document.createElement('div');
  grid.className = 'table-comparison-sub-grid';
  let value = null;
  nodes.forEach((n) => {
    if (n.nodeType === 1 && isSubLabel(n)) {
      const label = document.createElement('div');
      label.className = 'table-comparison-sub-label';
      label.textContent = n.textContent.trim();
      value = document.createElement('div');
      value.className = 'table-comparison-sub-value';
      grid.append(label, value);
    } else {
      if (!value) {
        value = document.createElement('div');
        value.className = 'table-comparison-sub-value';
        grid.append(value);
      }
      value.append(n);
    }
  });
  cell.replaceChildren(grid);
  cell.classList.add('table-comparison-has-sub');
  return true;
}

/* the authored "View more" paragraph directly following the block, if any */
function findViewMore(block) {
  const next = block.parentElement && block.parentElement.nextElementSibling;
  if (!next || !next.classList.contains('default-content-wrapper')) return null;
  return [...next.querySelectorAll(':scope > p')]
    .find((p) => VIEW_MORE.test(p.textContent.trim())) || null;
}

function setupViewMore(block, tbody) {
  const rows = [...tbody.querySelectorAll(':scope > tr:not(.table-comparison-cta-row)')];
  if (rows.length <= VISIBLE_ROWS) return;
  const toggle = findViewMore(block);
  if (!toggle) return;
  rows.slice(VISIBLE_ROWS).forEach((tr) => tr.classList.add('table-comparison-extra-row'));
  // show the toggle right below the table (before any glossary text in the same wrapper)
  toggle.parentElement.prepend(toggle);
  toggle.classList.add('table-comparison-view-more');
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');
  const label = [...toggle.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  const update = (expanded) => {
    block.classList.toggle('table-comparison-expanded', expanded);
    toggle.setAttribute('aria-expanded', expanded);
    if (label) label.textContent = expanded ? 'View less ' : 'View more ';
  };
  const onToggle = () => update(!block.classList.contains('table-comparison-expanded'));
  toggle.addEventListener('click', onToggle);
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  });
  update(false);
}

export default function decorate(block) {
  const rows = [...block.children];
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  let cols = 0;

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    const cells = [...row.children];
    cols = Math.max(cols, cells.length);
    const isHead = i === 0;
    const [labelCell, ...valueCells] = cells;
    const isCta = !isHead && labelCell && !labelCell.textContent.trim()
      && valueCells.length && valueCells.every((c) => !c.textContent.trim() || c.querySelector('a'));
    if (isCta) tr.classList.add('table-comparison-cta-row');

    cells.forEach((cell, c) => {
      let tag = 'td';
      if (isHead) tag = 'th';
      else if (c === 0) tag = 'th';
      const td = document.createElement(tag);
      if (isHead) td.setAttribute('scope', 'col');
      else if (c === 0) td.setAttribute('scope', 'row');
      td.className = c === 0 ? 'table-comparison-label' : 'table-comparison-value';
      moveInstrumentation(cell, td);
      while (cell.firstChild) td.append(cell.firstChild);
      if (!isHead && c > 0 && !isCta) splitSubRows(td);
      if (isCta) td.querySelectorAll('a').forEach((a) => a.classList.add('button'));
      tr.append(td);
    });
    (isHead ? thead : tbody).append(tr);
  });

  table.append(thead, tbody);
  const scroller = document.createElement('div');
  scroller.className = 'table-comparison-scroller';
  scroller.append(table);
  block.style.setProperty('--table-comparison-cols', Math.max(cols - 1, 1));
  block.replaceChildren(scroller);
  setupViewMore(block, tbody);
}
