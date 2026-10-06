import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Plan
 * Each row = one plan card:
 *   cell 1: rich text - eyebrow, plan name, checklist or description, optional "Know More" link,
 *           primary CTA link (the last stand-alone link becomes the full-width card footer button)
 *   cell 2: optional fine print (UIN / disclaimer) rendered below the card
 */

function linkOnly(p) {
  const a = p.querySelector('a');
  return a && p.textContent.trim() === a.textContent.trim();
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-plan-item';
    moveInstrumentation(row, li);

    const cells = [...row.children].filter((c) => c.textContent.trim());
    const [bodyCell, ...rest] = cells;

    const card = document.createElement('div');
    card.className = 'cards-plan-card';

    if (bodyCell) {
      bodyCell.className = 'cards-plan-card-body';
      const ctas = [...bodyCell.querySelectorAll(':scope > p')].filter(linkOnly);
      const primary = ctas.pop();
      ctas.forEach((p) => p.classList.add('cards-plan-card-link'));
      bodyCell.querySelectorAll('ul').forEach((list) => list.classList.add('cards-plan-checklist'));
      card.append(bodyCell);
      if (primary) {
        primary.className = 'cards-plan-card-action';
        card.append(primary);
      }
    }
    li.append(card);

    rest.forEach((cell) => {
      cell.className = 'cards-plan-disclaimer';
      li.append(cell);
    });
    ul.append(li);
  });

  block.replaceChildren(ul);
}
