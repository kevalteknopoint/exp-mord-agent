/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-support
 * Base block: cards (blocks/idfc/cards-support)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .getInTouch .get-intouch-revamp .col-lg-12
 * Generated: 2026-10-12
 *
 * UE model (cards-support-item): image (+imageAlt collapsed) | text (link label)
 * Source (block-context/cards-support/source.html):
 *   ul.getin-list-revamp > li.getin-list-item (x3)
 *     a[href] > figure img   -> image
 *     a[href] > p            -> link label (re-wrapped as a link to the li's href)
 *   h2.touch-title           -> kept as default content above the block when it has text
 * Iterates the <li> wrappers, not the anchors (anchors wrap block content).
 */
export default function parse(element, { document }) {
  const title = element.querySelector(':scope > h2.touch-title, :scope > h2');
  let items = [...element.querySelectorAll('li.getin-list-item')];
  if (!items.length) items = [...element.querySelectorAll('ul > li')];

  const cells = [];
  items.forEach((li) => {
    const a = li.querySelector('a[href]');
    const img = li.querySelector('img');
    const labelEl = li.querySelector('p, figcaption, span');
    const label = (labelEl ? labelEl.textContent : (a ? a.textContent : '')).replace(/\s+/g, ' ').trim();

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    const textCell = document.createDocumentFragment();
    if (label) {
      textCell.appendChild(document.createComment(' field:text '));
      const p = document.createElement('p');
      if (a) {
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = label;
        p.appendChild(link);
      } else {
        p.textContent = label;
      }
      textCell.appendChild(p);
    }

    if (img || label) cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-support', cells });
  if (title && title.textContent.trim()) {
    element.replaceWith(title, block);
  } else {
    element.replaceWith(block);
  }
}
