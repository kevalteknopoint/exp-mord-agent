/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-solutions
 * Base block: cards
 * Source: https://www.deptagency.com/en-in/
 * Selector: .block-talking-points
 * Generated: 2026-05-25
 *
 * Container block — each card item becomes one row with columns: image | text
 * UE model fields per card: image (reference), text (richtext)
 */
export default function parse(element, { document }) {
  // Get all card items from the talking points list
  const items = element.querySelectorAll('.block-talking-points__items > li');

  const cells = [];

  items.forEach((item) => {
    // Extract image from the hover container
    const image = item.querySelector('.block-talking-points__item-image');

    // Build the text content: title + description + link
    const titleSpan = item.querySelector('.block-talking-points__item-text');
    const hoverDescSpan = item.querySelector('.block-talking-points__items-hover-container > span.is-fancy-serif');
    const link = item.querySelector('a.block-talking-points__item');

    // Build image cell with field hint
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (image) {
      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt || '';
      imageCell.appendChild(img);
    }

    // Build text cell with field hint
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    // Add title as heading
    if (titleSpan) {
      const heading = document.createElement('h3');
      heading.textContent = titleSpan.textContent.trim();
      textCell.appendChild(heading);
    }

    // Add description paragraph
    if (hoverDescSpan) {
      const desc = document.createElement('p');
      desc.textContent = hoverDescSpan.textContent.trim();
      textCell.appendChild(desc);
    }

    // Add link/CTA if available
    if (link) {
      const cta = document.createElement('a');
      cta.href = link.href;
      cta.textContent = titleSpan ? titleSpan.textContent.trim() : 'Learn more';
      textCell.appendChild(cta);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-solutions', cells });
  element.replaceWith(block);
}
