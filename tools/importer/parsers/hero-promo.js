/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo. Base: hero.
 * Source: https://www.dulux.in/ (div.cmp-c12-hero-banner — primary-brand-3 & light variants)
 * xwalk model (blocks/hero-promo/_hero-promo.json): image (reference), imageAlt (collapsed), text (richtext)
 * Library structure: 1 column, 3 rows (name / background image / text content).
 */
export default function parse(element, { document }) {
  // Row 2: background image (desktop <img>).
  const image = element.querySelector('.background-image img, picture img, img');

  // Row 3 content.
  const heading = element.querySelector('.text-block .heading-title, .m5-text-block h1, .m5-text-block h2, h1, h2');
  const subheading = element.querySelector('.text-block-paragraph, .text-block .wysiwyg, .m5-text-block > div > span.wysiwyg');
  const cta = element.querySelector('.text-block-cta-wrapper a[href], .text-block-cta a[href]');

  // Empty-block guard.
  if (!image && !heading && !subheading && !cta) {
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

  // Row 3: text cell (field:text) — heading + subheading + CTA (richtext).
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (heading) textFrag.appendChild(heading);
  if (subheading) {
    // Prefer inner paragraph markup when present, else wrap text.
    const inner = subheading.querySelector('p');
    textFrag.appendChild(inner || subheading);
  }
  if (cta) {
    const label = cta.querySelector('.cta-text');
    if (label && !cta.textContent.trim()) cta.textContent = label.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(cta);
    textFrag.appendChild(p);
  }
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
