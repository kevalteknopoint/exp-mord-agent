import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

/**
 * Related items ("More insights?", "More cases"): image, eyebrow line, linked title.
 * The title link covers the whole card (see .cards-related-link::after).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = div.querySelector('picture') && !div.querySelector('h1, h2, h3, h4, h5, h6, p:not(:has(picture))')
        ? 'cards-related-image' : 'cards-related-body';
    });
    const body = li.querySelector('.cards-related-body');
    if (body) {
      body.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
      body.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
      const [first] = body.children;
      if (first && first.tagName === 'P' && !first.querySelector('a')) first.classList.add('cards-related-eyebrow');
      const link = body.querySelector('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a') || body.querySelector('a');
      if (link) link.classList.add('cards-related-link');
      // a trailing link-only paragraph is the card CTA ("Read Article")
      const last = body.lastElementChild;
      if (last && last.tagName === 'P' && last.children.length === 1 && last.querySelector('a') !== link
        && last.textContent.trim() === last.querySelector('a')?.textContent.trim()) {
        last.classList.add('cards-related-cta');
        last.querySelector('a').tabIndex = -1;
      }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    img.closest('picture').replaceWith(picture);
  });
  block.textContent = '';
  block.append(ul);
}
