/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-media. Base: hero.
 * Source: https://www.dulux.in/ (div.cmp-c19-media.style-contain)
 * xwalk model (blocks/hero-media/_hero-media.json): image (reference), imageAlt (collapsed), text (richtext)
 * Library structure: 1 column, 3 rows (name / background image / text content).
 */
export default function parse(element, { document }) {
  // Row 2: media image (desktop <img>).
  const image = element.querySelector('.media img, picture img, img');

  // Row 3 content (this media banner has an optional CTA in .btn-wrapper).
  const heading = element.querySelector('.media h1, .media h2, h1, h2');
  const cta = element.querySelector('.btn-wrapper a[href], .media a[href]');

  // Empty-block guard.
  if (!image && !heading && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image cell (field:image). imageAlt collapses into <img alt>.
  if (image) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(image);
    cells.push([imgFrag]);
  } else {
    cells.push(['']);
  }

  // Row 3: text cell (field:text) — heading + CTA (richtext). Emitted only when content exists.
  if (heading || cta) {
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (heading) textFrag.appendChild(heading);
    if (cta) {
      const label = cta.querySelector('.cta-text');
      if (label && !cta.textContent.trim()) cta.textContent = label.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(cta);
      textFrag.appendChild(p);
    }
    cells.push([textFrag]);
  } else {
    // Keep the third row present but empty (no field hint on empty cell).
    cells.push(['']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-media', cells });
  element.replaceWith(block);
}
