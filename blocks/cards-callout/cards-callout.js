import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-callout-card-image';
      else div.className = 'cards-callout-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  /* Source cards are a single clickable link wrapping image + heading.
     Use the redundant body link as the card-wide href, then drop the
     duplicate link text so only the heading shows. */
  ul.querySelectorAll('li').forEach((li) => {
    const body = li.querySelector('.cards-callout-card-body');
    const link = body?.querySelector('a');
    const heading = body?.querySelector('h1, h2, h3, h4, h5, h6');
    if (link && heading) {
      li.dataset.href = link.getAttribute('href');
      const anchor = document.createElement('a');
      anchor.className = 'cards-callout-card-link';
      anchor.href = link.getAttribute('href');
      anchor.setAttribute('aria-label', heading.textContent.trim());
      link.closest('p')?.remove();
      link.remove();
      while (li.firstChild) anchor.append(li.firstChild);
      li.append(anchor);
    }
  });

  block.textContent = '';
  block.append(ul);
}
