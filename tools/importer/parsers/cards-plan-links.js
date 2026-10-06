/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-plan-links. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .termplan-cards
 *
 * Model (cards-plan-links-item): image | text -> one row per tile, 2 columns
 * Validated selectors (source.html):
 *   .teaserv2 .cmp-teaser (iterated - inner wrapper; the tile is a set of sibling a.cmp-teaser__link
 *   anchors sharing one href, which html2md can merge), .cmp-teaser__description > p (plan name, span.red_text CTA),
 *   .cmp-teaser__image img.cmp-image__image, a.cmp-teaser__link[href] (tile target)
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
  let tiles = [...element.querySelectorAll('.cmp-teaser')];
  if (!tiles.length) tiles = [...element.querySelectorAll('.swiper-slide, .teaser')];

  const cells = [];
  tiles.forEach((tile) => {
    const img = imgFrom(document, tile.querySelector('.cmp-teaser__image img, img.cmp-image__image'));
    const link = tile.querySelector('a.cmp-teaser__link[href], a.cmp-image__link[href], a[href]');
    const href = link ? link.getAttribute('href') : '';
    const paras = [...tile.querySelectorAll('.cmp-teaser__description > p, .cmp-teaser__description > h3, .cmp-teaser__title')]
      .filter((p) => p.textContent.trim());

    const text = [];
    let ctaLabel = '';
    paras.forEach((p) => {
      if (p.querySelector('.red_text')) { ctaLabel = p.textContent.trim(); return; }
      const np = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = p.textContent.trim();
      np.append(strong);
      text.push(np);
    });
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = ctaLabel || 'Check Plan';
      p.append(a);
      text.push(p);
    } else if (ctaLabel) {
      const p = document.createElement('p');
      p.textContent = ctaLabel;
      text.push(p);
    }
    if (!img && !text.length) return;
    cells.push([hinted(document, 'image', img), hinted(document, 'text', text)]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-plan-links', cells });
  element.replaceWith(block);
}
