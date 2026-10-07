import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Shortcut
 * Each row = one compact shortcut card: cell 1 icon image, cell 2 rich text (heading, short
 * subtitle, link). The link makes the whole card clickable; a diagonal arrow sits top right.
 */

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-shortcut-card';
    moveInstrumentation(row, li);
    const [imageCell, textCell] = [...row.children];

    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'cards-shortcut-icon';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '120' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }

    if (textCell) {
      textCell.className = 'cards-shortcut-body';
      const link = [...textCell.querySelectorAll('a')].pop();
      if (link) {
        link.className = 'cards-shortcut-link';
        const p = link.closest('p');
        if (p) {
          p.className = 'cards-shortcut-link-wrapper';
        }
      }
      li.append(textCell);
    }
    ul.append(li);
  });

  block.replaceChildren(ul);
}
