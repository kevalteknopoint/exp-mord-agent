/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block (reused base).
 * Source: https://www.ngssuper.com.au/
 * Selector: section.s-block-fluid:not(.no-top-padding)
 *
 * Cards model (container block):
 *   Each card row has 3 columns: [card label, image, text]
 *   - image (reference) → column 2
 *   - imageAlt (text, collapsed into image)
 *   - text (richtext) → column 3
 *
 * DOM structure (news article cards):
 *   div.block-content > div.c-feature-tile.has-button (repeating, 3 items)
 *     div.feature-content > img.feature-image (thumbnail)
 *     div.content-wrapper > h3.feature-heading (article title)
 *     a.featur-btn (Read more CTA - note typo in source)
 *
 * Note: Section heading (h2.block-heading) is default content handled
 * separately by the import script, not part of this block.
 */
export default function parse(element, { document }) {
  // Find all article card tiles
  // Found in DOM: div.block-content > div.c-feature-tile.has-button
  const tiles = element.querySelectorAll('div.block-content > div.c-feature-tile, div.c-feature-tile');
  const cells = [];

  for (const tile of tiles) {
    // Column 1: "card" label (required by container block structure)
    const label = 'card';

    // Column 2: Article thumbnail image with field hint
    // Found in DOM: div.feature-content > img.feature-image
    const img = tile.querySelector('img.feature-image, img');
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) {
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      picture.appendChild(newImg);
      imageCell.appendChild(picture);
    }

    // Column 3: Text content (title + CTA as richtext) with field hint
    // Found in DOM: h3.feature-heading for title, a.featur-btn for CTA
    const heading = tile.querySelector('h3.feature-heading, h3');
    const cta = tile.querySelector('a.featur-btn, a.btn-skin-2.btn-icon');

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (heading) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = heading.textContent.trim();
      p.appendChild(strong);
      textCell.appendChild(p);
    }
    if (cta) {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.textContent.trim();
      p.appendChild(link);
      textCell.appendChild(p);
    }

    cells.push([label, imageCell, textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
