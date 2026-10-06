import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Feature Grid
 * Each row = one grid item. Cells:
 *   marker (optional) - an icon image OR a short number ("1", "2." ...) rendered as a circled badge
 *   text              - rich text: heading + paragraph(s)
 * Items flow into a 2-column grid separated by thin dividers (1 column on mobile).
 */

const NUMBER = /^\d{1,3}\.?$/;

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-feature-grid-item';
    moveInstrumentation(row, li);

    [...row.children].forEach((cell) => {
      const text = cell.textContent.trim();
      if (cell.querySelector('picture') && !text) {
        cell.className = 'cards-feature-grid-icon';
        li.append(cell);
      } else if (NUMBER.test(text)) {
        cell.className = 'cards-feature-grid-number';
        cell.textContent = text.replace('.', '');
        li.append(cell);
      } else if (text) {
        cell.className = 'cards-feature-grid-body';
        li.append(cell);
      }
    });

    if (!li.querySelector('.cards-feature-grid-icon, .cards-feature-grid-number')) {
      li.classList.add('cards-feature-grid-item-plain');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });

  block.replaceChildren(ul);
}
