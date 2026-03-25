/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-homepage variant.
 * Base block: hero
 * Source: https://www.ngssuper.com.au/
 * Selector: section.s-page-header.skin-primary
 *
 * Hero model fields:
 *   - image (reference) → Row 1
 *   - imageAlt (text, collapsed into image)
 *   - text (richtext) → Row 2
 *
 * Target table: 1 column, 2 rows (image row + text row)
 */
export default function parse(element, { document }) {
  // Extract background/decorative image
  // Found in DOM: div.page-header__image-wrapper > picture > img.image-element
  const image = element.querySelector('div.page-header__image-wrapper picture, .page-header__image-wrapper img');

  // Extract heading
  // Found in DOM: h1.page-header__title > span
  const heading = element.querySelector('h1.page-header__title, h1');

  // Extract description text
  // Found in DOM: div.page-header__description
  const description = element.querySelector('div.page-header__description, .page-header__description');

  // Extract CTA link
  // Found in DOM: a.page-header__cta
  const cta = element.querySelector('a.page-header__cta, .page-header__cta-box a');

  // Build cells matching hero block library structure:
  // Row 1: image (with field hint)
  // Row 2: text content - heading, description, CTA (with field hint)
  const cells = [];

  // Row 1: Image
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (image) {
    imageCell.appendChild(image);
  }
  cells.push([imageCell]);

  // Row 2: Text content (heading + description + CTA as richtext)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (description) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    textCell.appendChild(p);
  }
  if (cta) textCell.appendChild(cta);
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-homepage', cells });
  element.replaceWith(block);
}
