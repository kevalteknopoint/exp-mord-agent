/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-awards
 * Base block: carousel (blocks/idfc/carousel-awards)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .awards-accordian .embla-awards-banner
 * Generated: 2026-10-12
 *
 * UE model (carousel-awards-item): image (+imageAlt collapsed) | text (description + link)
 * Source (block-context/carousel-awards/source.html):
 *   .embla__container > .embla__slide (x6)
 *     a.link[href] (empty overlay anchor) -> detail link
 *     .item figure img                    -> award image
 *     .item p.card-info                   -> description
 *     .item p.arrow img                   -> decorative arrows (dropped)
 * Iterates the slide wrappers; duplicate slides (loop clones) are skipped by href+text.
 */
export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.embla__container > .embla__slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.embla__slide, .item')];

  const seen = new Set();
  const cells = [];
  slides.forEach((slide) => {
    const href = slide.querySelector('a.link[href], a[href]')?.getAttribute('href') || '';
    const img = slide.querySelector('figure img') || slide.querySelector('img:not(.white):not(.red)');
    const descEl = slide.querySelector('p.card-info') || slide.querySelector('p:not(.arrow)');
    const desc = descEl ? descEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const key = `${href}|${desc}`;
    if ((!img && !desc) || seen.has(key)) return;
    seen.add(key);

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    const textCell = document.createDocumentFragment();
    if (desc || href) {
      textCell.appendChild(document.createComment(' field:text '));
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc;
        textCell.appendChild(p);
      }
      if (href) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = 'Read more';
        p.appendChild(a);
        textCell.appendChild(p);
      }
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-awards', cells });
  element.replaceWith(block);
}
