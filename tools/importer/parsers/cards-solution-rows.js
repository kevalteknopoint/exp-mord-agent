/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-solution-rows
 * Base block: cards
 * Source: https://www.dept.global/en-in/
 * Selector: .block-image-and-fact (matches 5 adjacent sibling rows)
 * Generated: 2026-10-08
 *
 * Each `.block-image-and-fact` element is ONE row. The importer calls the parser
 * once per matched element; the first call gathers itself plus every following
 * adjacent `.block-image-and-fact` sibling into a single block and removes them.
 * Later calls hit detached elements (no parentNode) and are skipped.
 *
 * UE model (cards-solution-rows-item): image (reference), text (richtext)
 * Row: [image | H3 title + description + Learn more link]
 */
function buildRow(row, document) {
  const img = row.querySelector('img.block-image-and-fact__image, .block-image-and-fact__content img, img');
  const title = row.querySelector('.block-image-and-fact__title');
  const text = row.querySelector('.block-image-and-fact__text');
  const cta = row.querySelector('a.block-image-and-fact__cta, a.button-v2');

  // Image cell (no hint when empty)
  const imageCell = document.createDocumentFragment();
  if (img && img.getAttribute('src')) {
    imageCell.appendChild(document.createComment(' field:image '));
    const pic = document.createElement('img');
    pic.src = img.getAttribute('src');
    pic.alt = img.getAttribute('alt') || '';
    imageCell.appendChild(pic);
  }

  // Text cell
  const textCell = document.createDocumentFragment();
  const parts = [];
  if (title && title.textContent.trim()) {
    const h3 = document.createElement('h3');
    h3.textContent = title.textContent.trim();
    parts.push(h3);
  }
  if (text && text.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = text.textContent.replace(/\s+/g, ' ').trim();
    parts.push(p);
  }
  if (cta && cta.getAttribute('href')) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.replace(/\s+/g, ' ').trim() || 'Learn more';
    p.appendChild(a);
    parts.push(p);
  }
  if (parts.length) {
    textCell.appendChild(document.createComment(' field:text '));
    parts.forEach((el) => textCell.appendChild(el));
  }

  return { hasContent: parts.length > 0 || imageCell.childNodes.length > 0, cells: [imageCell, textCell] };
}

export default function parse(element, { document }) {
  if (!element.parentNode) return; // already merged into the first row's block

  // Gather this row plus following adjacent sibling rows
  const rows = [element];
  let next = element.nextElementSibling;
  while (next && next.classList && next.classList.contains('block-image-and-fact')) {
    rows.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  rows.forEach((row) => {
    const built = buildRow(row, document);
    if (built.hasContent) cells.push(built.cells);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  rows.slice(1).forEach((row) => row.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-solution-rows', cells });
  element.replaceWith(block);
}
