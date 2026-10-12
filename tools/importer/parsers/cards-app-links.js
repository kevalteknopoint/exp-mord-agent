/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-app-links
 * Base block: cards (blocks/idfc/cards-app-links)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .adv-mobile-app .bottom-nav
 * Generated: 2026-10-12
 *
 * UE model (cards-app-links-item): image (+imageAlt collapsed) | text (richtext)
 * One row per card. Source (block-context/cards-app-links/source.html):
 *   div.bottom-nav > div.comp-box (x4)
 *     img                     -> image
 *     div.text-sec > p        -> text paragraph (highlighted spans -> <strong>)
 *     div.text-sec > a        -> CTA link (text)
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .comp-box')];
  if (!items.length) items = [...element.querySelectorAll('.comp-box')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector(':scope > img, :scope > picture img');
    const body = item.querySelector('.text-sec') || item;

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    const textNodes = [];
    body.querySelectorAll(':scope > p').forEach((p) => {
      // highlighted fragments are spans on the source; keep the emphasis as bold
      p.querySelectorAll('span').forEach((span) => {
        const strong = document.createElement('strong');
        strong.innerHTML = span.innerHTML;
        span.replaceWith(strong);
      });
      if (p.textContent.trim()) textNodes.push(p);
    });
    body.querySelectorAll(':scope > a[href]').forEach((a) => {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      p.appendChild(link);
      textNodes.push(p);
    });

    const textCell = document.createDocumentFragment();
    if (textNodes.length) {
      textCell.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => textCell.appendChild(n));
    }

    if (img || textNodes.length) cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-app-links', cells });
  element.replaceWith(block);
}
