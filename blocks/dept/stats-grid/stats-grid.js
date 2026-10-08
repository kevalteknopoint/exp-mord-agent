import { moveInstrumentation } from '../../../scripts/scripts.js';

/**
 * Key figures (dept.global stats panel / stats and copy). One row per stat:
 * first paragraph = value, second = label.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const cell = row.firstElementChild || row;
    const [value, ...label] = [...cell.children];
    if (value) value.classList.add('stats-grid-value');
    label.forEach((p) => p.classList.add('stats-grid-label'));
    while (cell.firstChild) li.append(cell.firstChild);
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
