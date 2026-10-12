/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-spotlight
 * Base block: carousel (blocks/idfc/carousel-spotlight)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .spotlight .spotlight-carousel
 * Generated: 2026-10-12
 *
 * UE model (carousel-spotlight-item): image (+imageAlt collapsed) | text (h3 title, description, CTA link)
 * Source (block-context/carousel-spotlight/source.html):
 *   .embla__container > .embla__slide.spotlight-item
 *     :scope > figure img                     -> icon
 *     h3.spotlight-item-desc-heading          -> title
 *     p.spotlight-item-desc-sub-heading       -> description
 *     .spotlight-item-desc > a[href]          -> CTA (label read from the anchor text,
 *                                                its inner span may be unwrapped; arrow image dropped)
 * Carousel buttons are dropped.
 */
export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.embla__container > .embla__slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.spotlight-item, .embla__slide')];

  const seen = new Set();
  const cells = [];
  slides.forEach((slide) => {
    const img = slide.querySelector(':scope > figure img') || slide.querySelector('figure:not(a figure) img');
    const titleEl = slide.querySelector('.spotlight-item-desc-heading, h3, h2');
    const descEl = slide.querySelector('.spotlight-item-desc-sub-heading, .spotlight-item-desc p');
    const ctaEl = slide.querySelector('.spotlight-item-desc > a[href], a[href]');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const key = `${title}|${ctaEl ? ctaEl.getAttribute('href') : ''}`;
    if (!title && !img) return;
    if (seen.has(key)) return;
    seen.add(key);

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      textCell.appendChild(h3);
    }
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.replace(/\s+/g, ' ').trim();
      textCell.appendChild(p);
    }
    const href = ctaEl && ctaEl.getAttribute('href');
    if (href && !/^javascript:/i.test(href)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = ctaEl.textContent.replace(/\s+/g, ' ').trim() || 'Know more';
      p.appendChild(a);
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-spotlight', cells });
  element.replaceWith(block);
}
