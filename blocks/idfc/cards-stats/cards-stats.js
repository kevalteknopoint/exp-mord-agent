import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-stats-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-stats-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-stats-icon';
      else div.className = 'cards-stats-body';
    });
    // the stat headline is the first heading, or the first bold paragraph
    const body = li.querySelector('.cards-stats-body');
    const stat = body?.querySelector('h1, h2, h3, h4, h5, h6')
      || body?.querySelector('p > strong:only-child, p > b:only-child')?.parentElement;
    if (stat) stat.classList.add('cards-stats-value');
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '120' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
  block.textContent = '';
  block.append(ul);
}
