/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-persona. Base: carousel.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .who-buy-cards-parent.ta-container .who-buy-cards (2 instances, same shape)
 *
 * Model (carousel-persona-item): image | text -> one row per slide, 2 columns
 * Validated selectors (source.html):
 *   .swiper-wrapper > .leadproxyv2teaser .cmp-teaser (iterated - inner wrapper, not the slide anchors),
 *   .cmp-teaser__image img.cmp-image__image, .cmp-teaser__description > h3 (span.black_text, optional link),
 *   .cmp-teaser__description > p
 * The avatar's self-link (cmp-image__link -> current page) and empty <a></a> placeholders are dropped.
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
  let slides = [...element.querySelectorAll('.cmp-teaser')];
  if (!slides.length) slides = [...element.querySelectorAll('.swiper-slide')];

  const cells = [];
  slides.forEach((slide) => {
    const avatar = imgFrom(document, slide.querySelector('.cmp-teaser__image img, img.cmp-image__image'));
    const desc = slide.querySelector('.cmp-teaser__description') || slide.querySelector('.cmp-teaser__content');
    const text = [];
    if (desc) {
      [...desc.children].forEach((child) => {
        if (!child.textContent.trim()) return;
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document.createElement('h3');
          const src = child.querySelector('.black_text') || child;
          h.append(...[...src.childNodes].map((n) => n.cloneNode(true)));
          text.push(h);
        } else text.push(child);
      });
    }
    if (!avatar && !text.length) return;
    cells.push([hinted(document, 'image', avatar), hinted(document, 'text', text)]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-persona', cells });
  element.replaceWith(block);
}
