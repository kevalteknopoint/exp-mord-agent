/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-homepage variant.
 * Base block: hero
 * Source: https://www.wipro.com/
 * Selector: .homepagetextandimage .text_and_image
 * Generated: 2026-04-30T15:42:00Z
 *
 * Hero model fields (from _hero.json):
 *   - image (reference) → Row 1
 *   - imageAlt (text, collapsed into image)
 *   - text (richtext) → Row 2
 *
 * Target table: 1 column, 2 rows (image row + text row)
 *
 * Source DOM structure:
 *   div.text_and_image
 *     div.text_and_image_container
 *       div.text
 *         div.title          → heading
 *         div.desc           → description (may contain inline HTML like <b>)
 *         div.buttonContainer > a.button → CTA
 *       div.image > img      → hero image
 */
export default function parse(element, { document }) {
  // Extract hero image
  // Validated in source: div.image > img
  const image = element.querySelector(':scope div.image img, :scope .image img');

  // Extract heading title
  // Validated in source: div.text > div.title
  const titleEl = element.querySelector(':scope div.title, :scope .title');

  // Extract description text
  // Validated in source: div.text > div.desc (contains inline <b> elements)
  const descEl = element.querySelector(':scope div.desc, :scope .desc');

  // Extract CTA button link
  // Validated in source: div.buttonContainer > a.button
  const cta = element.querySelector(':scope div.buttonContainer a.button, :scope .buttonContainer a, :scope a.button');

  // Build cells matching hero block library structure:
  // Row 1: image (with field hint for xwalk UE model)
  // Row 2: text content - heading, description, CTA (with field hint for xwalk UE model)
  const cells = [];

  // Row 1: Image (field:image from UE model)
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (image) {
    const img = image.cloneNode(true);
    imageCell.appendChild(img);
  }
  cells.push([imageCell]);

  // Row 2: Text content (field:text from UE model)
  // Combines heading + description + CTA as richtext per UE model
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));

  // Convert title div to proper heading element
  if (titleEl) {
    const h1 = document.createElement('h1');
    h1.textContent = titleEl.textContent.trim();
    textCell.appendChild(h1);
  }

  // Preserve description with inline HTML (e.g. <b> tags)
  if (descEl && descEl.textContent.trim()) {
    const p = document.createElement('p');
    // Clone child nodes to preserve inline elements like <b>
    Array.from(descEl.childNodes).forEach((child) => {
      p.appendChild(child.cloneNode(true));
    });
    textCell.appendChild(p);
  }

  // Append CTA link
  if (cta) {
    const ctaP = document.createElement('p');
    ctaP.appendChild(cta.cloneNode(true));
    textCell.appendChild(ctaP);
  }

  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-homepage', cells });
  element.replaceWith(block);
}
