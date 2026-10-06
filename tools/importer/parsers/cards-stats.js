/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stats. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .whychoose-cards > .cmp-container > .container
 *   (matches each stat group container, plus a trailing text-only container with the "T&C apply" note)
 *
 * Model (cards-stats-item): image | text -> one row per stat tile, 2 columns
 * Validated selectors (source.html):
 *   .proxyteaser .cmp-teaser, .cmp-teaser__image img.cq-dd-image,
 *   .cmp-teaser__description > p (1st = stat value, rest = label)
 * Text-only containers (.leadproxytext) are not stat tiles: they are kept as default content.
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
  const tiles = [...element.querySelectorAll('.cmp-teaser')];
  if (!tiles.length) {
    // e.g. the trailing "T&C apply" text container: keep as default content
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  tiles.forEach((tile) => {
    const icon = imgFrom(document, tile.querySelector('.cmp-teaser__image img'));
    const paras = [...tile.querySelectorAll('.cmp-teaser__description > *')].filter((p) => p.textContent.trim());
    const text = [];
    paras.forEach((p, i) => {
      if (i === 0) {
        const np = document.createElement('p');
        const strong = document.createElement('strong');
        strong.append(...[...p.childNodes].map((n) => n.cloneNode(true)));
        np.append(strong);
        text.push(np);
      } else text.push(p);
    });
    if (!icon && !text.length) return;
    cells.push([hinted(document, 'image', icon), hinted(document, 'text', text)]);
  });

  // footnote text that sits in the same matched container (when a parent container is matched)
  const extras = [...element.querySelectorAll('.leadproxytext .cmp-text > *')]
    .filter((n) => n.textContent.trim() && !n.closest('.cmp-teaser'));

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block, ...extras);
}
