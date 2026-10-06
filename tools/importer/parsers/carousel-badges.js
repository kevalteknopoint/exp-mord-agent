/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-badges. Base: carousel.
 * Source: https://www.dulux.in/ (div.cmp-c15-carousel)
 * xwalk model (blocks/carousel-badges/_carousel-badges.json): container of `carousel-badges-item`,
 *   each slide has media_image (reference), media_imageAlt (collapsed), content_text (richtext).
 * Library structure: N rows (one per slide), 2 columns (image cell, text cell).
 */
export default function parse(element, { document }) {
  const slides = Array.from(element.querySelectorAll('.carousel-item, .js-carousel-slide'));

  if (slides.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  slides.forEach((slide) => {
    const image = slide.querySelector('.carousel-inner-item img, picture img, img');
    const heading = slide.querySelector('.carousel-inner-item h1, .carousel-inner-item h2, .carousel-inner-item h3, h2, h3');
    const cta = slide.querySelector('.carousel-inner-item a[href], a[href]');

    // Column 1: image cell (field:media_image). media_imageAlt collapses into <img alt>.
    let imageCell = '';
    if (image) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(' field:media_image '));
      imgFrag.appendChild(image);
      imageCell = imgFrag;
    }

    // Column 2: text cell (field:content_text) — heading + CTA (richtext). Present only when content exists.
    let textCell = '';
    if (heading || cta) {
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(' field:content_text '));
      if (heading) textFrag.appendChild(heading);
      if (cta) {
        const p = document.createElement('p');
        p.appendChild(cta);
        textFrag.appendChild(p);
      }
      textCell = textFrag;
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-badges', cells });
  element.replaceWith(block);
}
