import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-support-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-support-item';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('picture')) div.remove();
      else if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-support-icon';
      else div.className = 'cards-support-body';
    });
    // icon + label act as one link target (the label is a text link, not a button)
    const link = li.querySelector('.cards-support-body a');
    if (link) {
      link.classList.remove('button', 'primary', 'secondary');
      link.closest('.button-container')?.classList.remove('button-container');
      link.classList.add('cards-support-link');
      li.classList.add('cards-support-item-linked');
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
  block.textContent = '';
  block.append(ul);
}
