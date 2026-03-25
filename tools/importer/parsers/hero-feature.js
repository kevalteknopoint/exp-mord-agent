/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-feature variant.
 * Base block: hero
 * Source: https://www.ngssuper.com.au/
 * Selector: section.s-feature-cta-panel.panel-skin-2
 *
 * Hero model fields:
 *   - image (reference) → Row 1
 *   - imageAlt (text, collapsed into image)
 *   - text (richtext) → Row 2
 *
 * Target table: 1 column, 2 rows (image row + text row)
 */
export default function parse(element, { document }) {
  // Extract feature/award image
  // Found in DOM: div.feature-panel-image > picture > img
  const image = element.querySelector('div.feature-panel-image picture, .feature-panel-image img');

  // Extract heading
  // Found in DOM: h2.panel-title
  const heading = element.querySelector('h2.panel-title, h2');

  // Extract description (may be empty)
  // Found in DOM: div.panel-description
  const description = element.querySelector('div.panel-description');

  // Extract CTA link
  // Found in DOM: div.panel-cta-box > a.cta-primary
  const cta = element.querySelector('div.panel-cta-box a, a.cta-primary');

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

  // Row 2: Text content (heading + optional description + CTA as richtext)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (description && description.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = description.textContent.trim();
    textCell.appendChild(p);
  }
  if (cta) textCell.appendChild(cta);
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}
