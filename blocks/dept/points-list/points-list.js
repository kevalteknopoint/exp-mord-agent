import { moveInstrumentation } from '../../../scripts/scripts.js';

/**
 * Point lists of dept.global (partner "why choose us" tables, award takeaways, service and web3
 * lists). One row per point: text (title heading + description), kept as one cell so it stays
 * one rich text in Universal Editor; the layouts place the title via CSS.
 * Layouts (block classes): rows (default), numbered, columns, stats.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const list = document.createElement(block.classList.contains('numbered') ? 'ol' : 'ul');
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell || !cell.textContent.trim()) return;
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    cell.className = 'points-list-text';
    const first = cell.firstElementChild;
    if (first && /^H[1-6]$/.test(first.tagName)) first.classList.add('points-list-title');
    li.append(cell);
    list.append(li);
  });
  block.textContent = '';
  block.append(list);
}
