/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards variant.
 * Base block: cards (container block).
 * Source: https://www.wipro.com/
 * Generated: 2026-04-30
 *
 * UE Model (xwalk): card model with fields: image (reference), text (richtext)
 * Container block: each card = one row, columns = [image, text]
 *
 * Source DOM: Multiple sibling .teaser.teaser--full-size.teaser--card elements
 * Each teaser contains:
 *   - .cmp-teaser__image img (card image)
 *   - h2.cmp-teaser__title (card title)
 *   - .cmp-teaser__description (card description)
 *   - .cmp-teaser__action-link (CTA link)
 */
export default function parse(element, { document }) {
  // Guard: if this element was already processed (removed from DOM by a sibling), skip
  if (!element.parentElement) return;

  // Collect all sibling teaser cards in the same parent container
  const parent = element.parentElement;
  const allCards = Array.from(
    parent.querySelectorAll(':scope > .teaser.teaser--full-size.teaser--card'),
  );

  // If no cards found via scoped query, fall back to just this element
  if (allCards.length === 0) {
    allCards.push(element);
  }

  const cells = [];

  allCards.forEach((card) => {
    // Extract image
    const img = card.querySelector('.cmp-teaser__image img');

    // Extract title (h2.cmp-teaser__title or nested .cmp-teaser__title)
    const titleEl = card.querySelector('h2.cmp-teaser__title');

    // Extract description
    const descEl = card.querySelector('.cmp-teaser__description');

    // Extract CTA link
    const ctaLink = card.querySelector('a.cmp-teaser__action-link');

    // Build image cell with field hint
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) {
      imageCell.appendChild(img);
    }

    // Build text cell with field hint (title + description + CTA as richtext)
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (titleEl) {
      textCell.appendChild(titleEl);
    }
    if (descEl) {
      textCell.appendChild(descEl);
    }
    if (ctaLink) {
      // Wrap CTA in a paragraph for proper richtext structure
      const p = document.createElement('p');
      p.appendChild(ctaLink);
      textCell.appendChild(p);
    }

    // Each card = one row with two columns: [image, text]
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });

  // Remove sibling cards that were merged into this block
  allCards.forEach((card) => {
    if (card !== element) {
      card.remove();
    }
  });

  element.replaceWith(block);
}
