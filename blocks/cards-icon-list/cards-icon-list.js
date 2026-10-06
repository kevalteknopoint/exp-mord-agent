import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Icon List
 * Each row = one list item:
 *   cell 1 small icon image (optional), cell 2 rich text (heading + description).
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-icon-list-item';
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      const hasPic = cell.querySelector('picture');
      if (hasPic && !cell.textContent.trim()) {
        cell.className = 'cards-icon-list-icon';
        li.append(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-icon-list-body';
        li.append(cell);
      }
    });
    if (!li.querySelector('.cards-icon-list-icon')) li.classList.add('cards-icon-list-no-icon');
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
  block.replaceChildren(ul);
}
