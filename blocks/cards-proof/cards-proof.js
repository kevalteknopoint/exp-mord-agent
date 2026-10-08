import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Proof
 * Each row = one proof point: rich text (heading value e.g. "12,450", label paragraph,
 * description paragraph(s), optional link - shown as a corner arrow, makes the item clickable).
 * Black band with dividers; fades to navy at the bottom.
 */

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-proof-item';
    moveInstrumentation(row, li);
    const cell = row.firstElementChild || document.createElement('div');
    cell.className = 'cards-proof-body';
    const paragraphs = [...cell.querySelectorAll(':scope > p')];
    if (paragraphs[0] && !paragraphs[0].querySelector('a')) paragraphs[0].classList.add('cards-proof-label');
    const link = [...cell.querySelectorAll('a')].pop();
    if (link) {
      link.className = 'cards-proof-link';
      const wrapper = link.closest('p');
      wrapper?.classList.remove('button-container');
      wrapper?.classList.add('cards-proof-link-wrapper');
    }
    li.append(cell);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
