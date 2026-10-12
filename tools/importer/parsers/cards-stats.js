/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-stats
 * Base block: cards (blocks/idfc/cards-stats)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .helping-communities .custom-div
 * Generated: 2026-10-12
 *
 * UE model (cards-stats-item): image (+imageAlt collapsed) | text (stat title as h3 + description)
 * Source (block-context/cards-stats/source.html):
 *   .embla__slide > .comm-box (x4)
 *     img                         -> image
 *     .text-part p.item-heading   -> stat title (h3)
 *     .text-part p (others)       -> description
 * Carousel controls (.embla__controls) are dropped.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.embla__slide .comm-box')];
  if (!items.length) items = [...element.querySelectorAll('.comm-box, .embla__slide')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    const textPart = item.querySelector('.text-part') || item;
    const titleEl = textPart.querySelector('.item-heading, h2, h3, h4');
    const descs = [...textPart.querySelectorAll(':scope > p')].filter((p) => p !== titleEl && p.textContent.trim());

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    const textCell = document.createDocumentFragment();
    if (titleEl || descs.length) {
      textCell.appendChild(document.createComment(' field:text '));
      if (titleEl) {
        const h3 = document.createElement('h3');
        h3.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
        textCell.appendChild(h3);
      }
      descs.forEach((p) => textCell.appendChild(p));
    }

    if (img || titleEl || descs.length) cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
