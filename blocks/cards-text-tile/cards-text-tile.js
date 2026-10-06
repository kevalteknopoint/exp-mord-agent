import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Text Tile
 * Each row = one rounded tile with a single rich-text cell (bold heading + paragraph).
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-text-tile-item';
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim()) return;
      cell.className = 'cards-text-tile-body';
      li.append(cell);
    });
    ul.append(li);
  });
  block.replaceChildren(ul);
}
