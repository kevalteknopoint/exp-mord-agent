/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .blog-corouselstatic (section#TIRA blog carousel)
 *
 * Model (card): image | text -> one row per article card, 2 columns
 * Validated selectors (source.html + live DOM):
 *   .swiper-wrapper .slider-temp-wrap (iterated - stable inner wrapper of each card),
 *   .slider-temp-wrap > a[href] (article URL), .picture-wrapper img (lazy: src or data-src),
 *   .slider-cont .blog-car-static-anly-linkpos (article title)
 * Output text cell: linked article title as heading (the card's arrow link target).
 */
function clean(t) {
  return (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function hinted(document, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.slider-temp-wrap')];
  if (!cards.length) cards = [...element.querySelectorAll('.swiper-slide, .things-card-layout')];

  const cells = [];
  cards.forEach((card) => {
    const link = card.querySelector('a[href]') || card.closest('a[href]');
    const href = link ? link.getAttribute('href') : '';
    const titleEl = card.querySelector('.blog-car-static-anly-linkpos, .slider-cont, h3, h4');
    const title = clean(titleEl ? titleEl.textContent : (link ? link.textContent : ''));

    let image = null;
    const img = card.querySelector('.picture-wrapper img, img');
    const src = img && (img.getAttribute('src') || img.getAttribute('data-src'));
    if (src) {
      image = document.createElement('img');
      image.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
      image.alt = img.getAttribute('alt') || title;
    }

    const text = [];
    if (title) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h.append(a);
      } else h.textContent = title;
      text.push(h);
    }
    if (!image && !text.length) return;
    cells.push([hinted(document, 'image', image), hinted(document, 'text', text)]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
