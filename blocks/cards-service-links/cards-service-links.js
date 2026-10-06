import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Service Links
 * Each row = one rounded link row:
 *   cell 1: optional graphic (picture) - such a row is rendered tall, graphic at the bottom
 *   cell 2: rich text with a single link (label)
 * A circular arrow sits on the right; the whole row is clickable (stretched link).
 */

const ARROW = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-service-links-item';
    moveInstrumentation(row, li);

    let media = null;
    let body = null;
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) media = cell;
      else if (cell.textContent.trim()) body = cell;
    });

    if (body) {
      body.className = 'cards-service-links-body';
      const link = body.querySelector('a');
      if (link) {
        link.classList.remove('button', 'primary', 'secondary');
        link.closest('.button-container')?.classList.remove('button-container');
        link.classList.add('cards-service-links-link');
      }
      const arrow = document.createElement('span');
      arrow.className = 'cards-service-links-arrow';
      arrow.innerHTML = ARROW;
      body.append(arrow);
      li.append(body);
    }

    if (media) {
      media.className = 'cards-service-links-media';
      media.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });
      li.classList.add('cards-service-links-featured');
      li.append(media);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
