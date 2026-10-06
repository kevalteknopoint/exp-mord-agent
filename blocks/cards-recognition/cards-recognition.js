import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Recognition
 * Each row = one card: cell 1 optional image, cell 2 rich text (heading, link).
 * A card with an image becomes the large feature card (image fills the card, title overlaid);
 * text-only cards stack beside it. The link renders as an arrow and makes the whole card clickable.
 */

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-recognition-card';
    moveInstrumentation(row, li);
    const [imageCell, textCell] = [...row.children];

    const img = imageCell?.querySelector('picture img');
    if (img) {
      li.classList.add('cards-recognition-feature');
      imageCell.className = 'cards-recognition-image';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1000' }, { width: '750' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }

    if (textCell) {
      textCell.className = 'cards-recognition-body';
      const link = [...textCell.querySelectorAll('a')].pop();
      if (link) {
        link.classList.remove('button', 'primary', 'secondary');
        link.classList.add('cards-recognition-link');
        const p = link.closest('p');
        p?.classList.remove('button-container');
        p?.classList.add('cards-recognition-link-wrapper');
      }
      li.append(textCell);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
