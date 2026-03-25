/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-links variant.
 * Base block: cards
 * Source: https://www.ngssuper.com.au/
 * Selector: section.s-base-section
 *
 * Cards model (container block):
 *   Each card row has 3 columns: [card label, image, text]
 *   - image (reference) → column 2
 *   - imageAlt (text, collapsed into image)
 *   - text (richtext) → column 3
 *
 * DOM structure:
 *   div.c-quick-links > a.quick-link-item (repeating, 4 items)
 *     div.icon-wrapper > img (icon)
 *     h5.quick-link-title (title text)
 *     div.cta-icon (decorative arrow, ignore)
 *   Each a.quick-link-item is a full card link
 */
export default function parse(element, { document }) {
  // Find all quick link card items
  // Found in DOM: div.c-quick-links > a.quick-link-item
  const linkItems = element.querySelectorAll('a.quick-link-item');
  const cells = [];

  for (const item of linkItems) {
    // Column 1: "card" label (required by container block structure)
    const label = 'card';

    // Column 2: Icon image with field hint
    // Found in DOM: div.icon-wrapper > img
    const icon = item.querySelector('div.icon-wrapper img, img');
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (icon) {
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = icon.src;
      newImg.alt = icon.alt || '';
      picture.appendChild(newImg);
      imageCell.appendChild(picture);
    }

    // Column 3: Text content (heading + link as richtext) with field hint
    // Found in DOM: h5.quick-link-title
    const title = item.querySelector('h5.quick-link-title, h5');
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      p.appendChild(strong);
      textCell.appendChild(p);
    }
    // Add the link destination as a CTA
    if (item.href) {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = title ? title.textContent.trim() : 'Learn more';
      p.appendChild(link);
      textCell.appendChild(p);
    }

    cells.push([label, imageCell, textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-links', cells });
  element.replaceWith(block);
}
