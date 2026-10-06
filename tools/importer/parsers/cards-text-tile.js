/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-text-tile. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .who-buy-cards-mob-swiper .who-buy-cards (2 instances, same shape)
 *
 * Model (cards-text-tile-item): text -> one row per tile, 1 column
 * Validated selectors (source.html):
 *   .swiper-wrapper > .leadproxyteaser .cmp-teaser, .cmp-teaser__description > h3 (span.black_text),
 *   .cmp-teaser__description > p
 */
export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('.cmp-teaser')];
  if (!tiles.length) tiles = [...element.querySelectorAll('.swiper-slide')];

  const cells = [];
  tiles.forEach((tile) => {
    const desc = tile.querySelector('.cmp-teaser__description') || tile.querySelector('.cmp-teaser__content');
    if (!desc) return;
    const text = [];
    [...desc.children].forEach((c) => {
      if (!c.textContent.replace(/ /g, ' ').trim()) return;
      if (/^H[1-6]$/.test(c.tagName)) {
        const h = document.createElement('h3');
        const src = c.querySelector('.black_text') || c;
        h.append(...[...src.childNodes].map((n) => n.cloneNode(true)));
        text.push(h);
      } else text.push(c);
    });
    if (!text.length) return;
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(' field:text '));
    text.forEach((n) => frag.append(n));
    cells.push([frag]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-text-tile', cells });
  element.replaceWith(block);
}
