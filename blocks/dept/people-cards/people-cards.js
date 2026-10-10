import { moveInstrumentation } from '../../../scripts/scripts.js';

/**
 * Event speakers / team of dept.global event pages.
 * One row per person: photo | text (name heading, position, optional LinkedIn link).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture, img') && !cell.textContent.trim()) {
        cell.className = 'people-cards-image';
      } else if (cell.textContent.trim()) {
        cell.className = 'people-cards-body';
        // the social link is a plain text link, not a button
        cell.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
        cell.querySelectorAll('a.button').forEach((a) => a.classList.remove('button'));
        cell.querySelectorAll('p > a:only-child').forEach((a) => {
          a.closest('p').classList.add('people-cards-social');
          if (/^https?:/.test(a.getAttribute('href') || '')) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
        });
      } else {
        return;
      }
      li.append(cell);
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
