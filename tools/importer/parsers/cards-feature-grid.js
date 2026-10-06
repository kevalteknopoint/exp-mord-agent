/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature-grid. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .investment-plan-cards-redesign (3 instances: icon variant + 2 numbered variants)
 *
 * Model (cards-feature-grid-item): image | number | text -> one row per item, 3 columns
 * Validated selectors (source.html):
 *   .leadproxyv2teaser .cmp-teaser, .cmp-teaser__image img.cmp-image__image,
 *   h3.cmp-teaser__title, .cmp-teaser__description > *
 * Numbered variants (.investment-plan-cards-var-three) use number-badge images whose alt is the digit
 * ("1", "2", ...): those are authored as the `number` field instead of an image.
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
  if (!items.length) items = [...element.querySelectorAll('.teaser')];

  const cells = [];
  items.forEach((item) => {
    const srcImg = item.querySelector('.cmp-teaser__image img, img.cmp-image__image');
    const alt = srcImg ? (srcImg.getAttribute('alt') || '').trim() : '';
    const isNumber = /^\d{1,3}$/.test(alt);
    const icon = isNumber ? null : imgFrom(document, srcImg);

    const text = [];
    const title = item.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
    if (title && title.textContent.trim()) {
      const h = document.createElement('h3');
      h.append(...[...title.childNodes].map((n) => n.cloneNode(true)));
      h.innerHTML = h.innerHTML.trim();
      text.push(h);
    }
    const desc = item.querySelector('.cmp-teaser__description');
    if (desc) [...desc.children].forEach((c) => { if (c.textContent.trim() && c !== title) text.push(c); });

    if (!icon && !isNumber && !text.length) return;
    cells.push([
      hinted(document, 'image', icon),
      isNumber ? hinted(document, 'number', document.createTextNode(alt)) : '',
      hinted(document, 'text', text),
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature-grid', cells });
  element.replaceWith(block);
}
