import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Action
 * Each row = one quick action: cell 1 icon, cell 2 rich text (heading, description, optional
 * italic-only paragraph = chip, link). The link renders as a square arrow button and makes the
 * row clickable.
 */

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const [imageCell, textCell] = [...row.children];
    const li = document.createElement('li');
    li.className = 'cards-action-card';
    moveInstrumentation(row, li);

    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'cards-action-icon';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }
    if (textCell) {
      textCell.className = 'cards-action-body';
      textCell.querySelectorAll(':scope > p').forEach((p) => {
        const only = p.children.length === 1 ? p.firstElementChild : null;
        if (only && only.tagName === 'EM' && p.textContent.trim() === only.textContent.trim()) {
          p.className = 'cards-action-chip';
        }
      });
      const link = [...textCell.querySelectorAll('a')].pop();
      if (link) {
        link.className = 'cards-action-link';
        const wrapper = link.closest('p');
        wrapper?.classList.remove('button-container');
        wrapper?.classList.add('cards-action-link-wrapper');
      }
      li.append(textCell);
    }
    ul.append(li);
  });

  block.replaceChildren(ul);
}
