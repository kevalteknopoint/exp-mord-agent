/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon-list. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selectors: #container-526c3450ed, #container-30eac4a7ea
 *
 * Model (cards-icon-list-item): image | text -> one row per item, 2 columns
 * Validated selectors (source.html):
 *   .leadproxyv2teaser .cmp-teaser, .cmp-teaser__image img.cmp-image__image,
 *   .cmp-teaser__description > h3 (wraps p > span.blueText), .cmp-teaser__description > p
 * The icon is wrapped in a self-link (cmp-image__link -> current page); the link is dropped.
 */
function hinted(document, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function imgFrom(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
  if (!src) return null;
  const out = document.createElement('img');
  out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.cmp-teaser')];
  if (!items.length) items = [...element.querySelectorAll(':scope > .teaser, :scope > div')];

  const cells = [];
  items.forEach((item) => {
    const icon = imgFrom(document, item.querySelector('.cmp-teaser__image img, img.cmp-image__image'));
    const desc = item.querySelector('.cmp-teaser__description') || item.querySelector('.cmp-teaser__content');
    const text = [];
    if (desc) {
      const heading = desc.querySelector('h1, h2, h3, h4, h5, h6') || item.querySelector('.cmp-teaser__title');
      if (heading) {
        const h = document.createElement('h3');
        const src = heading.querySelector('.blueText') || heading.querySelector('p') || heading;
        h.append(...[...src.childNodes].map((n) => n.cloneNode(true)));
        if (h.textContent.trim()) text.push(h);
      }
      [...desc.children].forEach((child) => {
        if (child === heading || child.contains(heading)) return;
        if (!child.textContent.trim()) return;
        text.push(child);
      });
    }
    if (!icon && !text.length) return;
    cells.push([hinted(document, 'image', icon), hinted(document, 'text', text)]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-list', cells });
  element.replaceWith(block);
}
