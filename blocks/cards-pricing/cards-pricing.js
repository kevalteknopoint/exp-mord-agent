import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Pricing
 * Each row = one pricing tile. Cells (any may be empty/omitted):
 *   image  - optional background image
 *   tag    - optional short ribbon text (e.g. "Best Seller")
 *   text   - rich text: amount heading, label, price line, CTA link
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-pricing-card';
    moveInstrumentation(row, li);

    const cells = [...row.children];
    let body = null;
    cells.forEach((cell) => {
      const hasPic = cell.querySelector('picture');
      const text = cell.textContent.trim();
      if (hasPic && !text) {
        cell.className = 'cards-pricing-card-image';
      } else if (!text) {
        cell.remove();
        return;
      } else if (!body && cells.indexOf(cell) < cells.length - 1
        && !cell.querySelector('h1, h2, h3, h4, h5, h6, a') && text.length < 40) {
        cell.className = 'cards-pricing-card-tag';
        li.classList.add('cards-pricing-card-tagged');
      } else {
        cell.className = 'cards-pricing-card-body';
        body = cell;
      }
      li.append(cell);
    });

    if (body) {
      const links = body.querySelectorAll('a');
      links.forEach((a) => a.closest('p')?.classList.add('cards-pricing-card-cta'));
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
