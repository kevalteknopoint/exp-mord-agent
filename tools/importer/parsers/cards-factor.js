/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-factor. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .investment-risk-main-wrapper
 *
 * Model (cards-factor-item): text -> one row per card, 1 column
 * Validated selectors (source.html):
 *   .investment-risk-cards-wrapper .newextendedteaser .cmp-teaser,
 *   .cmp-teaser__description h4 (title), .card-details .card_text (paragraph)
 * Ignored: decorative watermark <img> (CSS draws it), empty .ratingcount, pagination and arrow containers.
 */
export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.investment-risk-cards-wrapper .cmp-teaser')];
  if (!cards.length) cards = [...element.querySelectorAll('.cmp-teaser')];

  const cells = [];
  cards.forEach((card) => {
    const text = [];
    const title = card.querySelector('.cmp-teaser__description h1, .cmp-teaser__description h2, .cmp-teaser__description h3, .cmp-teaser__description h4, .cmp-teaser__title');
    if (title && title.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = title.textContent.replace(/ /g, ' ').trim();
      text.push(h);
    }
    card.querySelectorAll('.card-details .card_text, .card-details > p').forEach((t) => {
      const v = t.textContent.replace(/ /g, ' ').trim();
      if (!v) return;
      const p = document.createElement('p');
      p.textContent = v;
      text.push(p);
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-factor', cells });
  element.replaceWith(block);
}
