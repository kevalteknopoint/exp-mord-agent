import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-app-links-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-app-links-item';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('picture')) div.remove();
      else if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-app-links-icon';
      else div.className = 'cards-app-links-body';
    });
    // the link is the arrow call to action under the text: a text link, not a button
    li.querySelectorAll('.cards-app-links-body a').forEach((a) => {
      a.classList.remove('button', 'primary', 'secondary');
      a.classList.add('cards-app-links-cta');
      const holder = a.closest('p') || a;
      holder.classList.remove('button-container');
      holder.classList.add('cards-app-links-cta-wrap');
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '64' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
  block.textContent = '';
  block.append(ul);
}
