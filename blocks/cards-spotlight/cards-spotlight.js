import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Spotlight
 * Each row = one insight card: cell 1 photo, cell 2 rich text
 * (tag paragraph before the heading, e.g. "Content type"; heading; link).
 * Photo on top, navy body below; the link renders as an arrow and makes the whole card clickable.
 */

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-spotlight-card';
    moveInstrumentation(row, li);
    const [imageCell, textCell] = [...row.children];

    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'cards-spotlight-image';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }

    if (textCell) {
      textCell.className = 'cards-spotlight-body';
      const children = [...textCell.children];
      const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
      const headingIndex = heading ? children.indexOf(heading) : -1;
      children.forEach((el, i) => {
        if (el.tagName === 'P' && i < headingIndex && !el.querySelector('a')) el.classList.add('cards-spotlight-tag');
      });
      const link = [...textCell.querySelectorAll('a')].pop();
      if (link) {
        link.classList.remove('button', 'primary', 'secondary');
        link.classList.add('cards-spotlight-link');
        const p = link.closest('p');
        p?.classList.remove('button-container');
        p?.classList.add('cards-spotlight-link-wrapper');
      }
      li.append(textCell);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
