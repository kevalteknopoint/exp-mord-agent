import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Solution
 * Each row = one tall light-blue card: cell 1 illustration image, cell 2 rich text
 * (heading, short description, link). The link renders as an arrow at the bottom and makes
 * the whole card clickable.
 */

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-solution-card';
    moveInstrumentation(row, li);
    const [imageCell, textCell] = [...row.children];

    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'cards-solution-image';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }

    if (textCell) {
      textCell.className = 'cards-solution-body';
      const link = [...textCell.querySelectorAll('a')].pop();
      if (link) {
        link.classList.remove('button', 'primary', 'secondary');
        link.classList.add('cards-solution-link');
        const p = link.closest('p');
        p?.classList.remove('button-container');
        p?.classList.add('cards-solution-link-wrapper');
      }
      li.append(textCell);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
