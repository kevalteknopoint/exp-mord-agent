import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Label Box
 * A bordered callout box with a tab label overlapping its top border.
 * Content: label text (first row, or first cell of a single row) + rich-text body
 * (paragraphs and/or bullet list) in the following row/cell.
 */
export default function decorate(block) {
  const cells = [...block.children].flatMap((row) => {
    const kids = [...row.children];
    if (kids.length === 1) moveInstrumentation(row, kids[0]);
    return kids;
  }).filter((c) => c.textContent.trim() || c.querySelector('picture'));

  const box = document.createElement('div');
  box.className = 'cards-label-box-box';

  const [labelCell, ...bodyCells] = cells;
  if (labelCell && bodyCells.length) {
    const label = document.createElement('div');
    label.className = 'cards-label-box-label';
    moveInstrumentation(labelCell, label);
    label.textContent = labelCell.textContent.trim();
    box.append(label);
  } else if (labelCell) {
    bodyCells.push(labelCell);
  }

  const body = document.createElement('div');
  body.className = 'cards-label-box-body';
  bodyCells.forEach((cell) => {
    if (bodyCells.length === 1) moveInstrumentation(cell, body);
    while (cell.firstChild) body.append(cell.firstChild);
  });
  box.append(body);

  block.replaceChildren(box);
}
