import { moveInstrumentation } from '../../../scripts/scripts.js';

const COLUMNS = ['award', 'year', 'category'];

/**
 * Awards table of dept.global case pages.
 * Rows: award | year | category. The first row holds the (localized) column headers.
 * The section labels and the credits list around it are default content.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  [...block.children].forEach((row, index) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    [...row.children].slice(0, COLUMNS.length).forEach((cell, i) => {
      const td = document.createElement(index ? 'td' : 'th');
      if (!index) td.scope = 'col';
      td.className = `case-credits-${COLUMNS[i]}`;
      moveInstrumentation(cell, td);
      // single paragraphs are unwrapped: the cells are plain text fields
      const only = cell.children.length === 1 && cell.firstElementChild.tagName === 'P' ? cell.firstElementChild : cell;
      td.append(...only.childNodes);
      tr.append(td);
    });
    (index ? tbody : thead).append(tr);
  });
  if (thead.children.length) table.append(thead);
  table.append(tbody);
  block.textContent = '';
  block.append(table);
}
