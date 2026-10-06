import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Factor
 * Each row = one bordered card with a single rich-text cell (centered title + paragraph).
 * A decorative watermark is drawn by CSS; an incomplete last row is centered.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-factor-card';
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture')) return;
      cell.className = cell.querySelector('picture') && !cell.textContent.trim()
        ? 'cards-factor-card-image' : 'cards-factor-card-body';
      li.append(cell);
    });
    ul.append(li);
  });
  block.replaceChildren(ul);
}
