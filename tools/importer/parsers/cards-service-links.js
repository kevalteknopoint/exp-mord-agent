/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-service-links (new block for /loans). Base: cards.
 * Source: migration-work/design-loans/source/loans.html
 * Instance selector: ul.service-links
 *
 * Cards convention - one row per card, two cells:
 *   cell 1: image (+ imageAlt) - optional decorative graphic (empty cell kept when absent)
 *   cell 2: text (richtext)    - a single link paragraph (whole row becomes clickable in the block JS)
 * Source markup: ul.service-links > li > a[href] (+ optional img)
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const rows = [...element.querySelectorAll(':scope > li')];
  const cells = [];

  rows.forEach((li) => {
    const a = li.querySelector('a[href]');
    if (!a) return;

    // cell 1: image (empty cell still included when there is no graphic)
    const imageCell = document.createDocumentFragment();
    const src = li.querySelector('img');
    if (src && src.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = src.getAttribute('src');
      img.alt = src.getAttribute('alt') || '';
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // cell 2: text
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || '#';
    link.textContent = clean(a.textContent);
    p.append(link);
    textCell.appendChild(p);

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service-links', cells });
  element.replaceWith(block);
}
