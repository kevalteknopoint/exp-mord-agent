/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: https://www.dulux.in/ (div.cmp-c43-related-content — colour-of-the-year & expert-advice grids)
 * xwalk model (blocks/cards-article/_cards-article.json): container of `card` items,
 *   each card has image (reference), imageAlt (collapsed), text (richtext).
 * Library structure: N rows (one per card), 2 columns (image cell, text cell).
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('a.m9-content-card'));

  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const image = card.querySelector('.content-card-media img, picture img, img');
    const heading = card.querySelector('.card-content-wrapper h4, .content-title-sub h4, h3, h4');
    const href = card.getAttribute('href');

    // Column 1: image cell (field:image). imageAlt collapses into <img alt>.
    let imageCell = '';
    if (image) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(image);
      imageCell = imgFrag;
    }

    // Column 2: text cell (field:text) — heading + CTA link (richtext).
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (heading) textFrag.appendChild(heading);
    if (href) {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = heading ? heading.textContent.trim() : href;
      const p = document.createElement('p');
      p.appendChild(link);
      textFrag.appendChild(p);
    }

    cells.push([imageCell, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
