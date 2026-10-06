import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Stats
 * Each row = one stat tile:
 *   cell 1 line icon (optional), cell 2 rich text (bold stat + short label).
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-stats-item';
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-stats-icon';
        li.append(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-stats-body';
        const first = cell.firstElementChild;
        if (first) first.classList.add('cards-stats-value');
        li.append(cell);
      }
    });
    ul.append(li);
  });
  // tiles without icons (e.g. "Age 20 / Premium starts at ₹548/month") render as a highlight panel
  if (!ul.querySelector('.cards-stats-icon')) {
    block.classList.add('cards-stats-plain');
    ul.querySelectorAll('.cards-stats-body > :not(.cards-stats-value)').forEach((p) => {
      p.innerHTML = p.innerHTML.replace(/(₹\s?[\d,.]+(?:\s?\/\s?\w+)?)/g, '<span class="cards-stats-amount">$1</span>');
    });
  }
  ul.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
  block.replaceChildren(ul);
}
