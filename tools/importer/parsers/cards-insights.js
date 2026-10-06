/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-insights
 * Base block: cards
 * Source: https://www.deptagency.com/en-in/
 * Selector: .block-custom-listing__items
 * Generated: 2026-05-25T00:00:00.000Z
 *
 * Structure (xwalk container block):
 *   Each card row = [image, text]
 *   Model fields: image (reference), text (richtext)
 *
 * Source DOM:
 *   .block-custom-listing__items
 *     > a.listing-card-v2 (repeated)
 *       > div.listing-card-v2__media-container > picture > img.listing-card-v2__image
 *       > div.listing-card-v2__meta
 *         > div.listing-card-v2__type-tag > span (type label e.g. "Insight", "Whitepaper")
 *         > ul.listing-card-v2__tags > li.listing-card-v2__tag (category tags)
 *         > p.listing-card-v2__title (card title)
 */
export default function parse(element, { document }) {
  const cards = element.querySelectorAll(':scope > a.listing-card-v2');
  const cells = [];

  cards.forEach((card) => {
    // Column 1: Image with field hint
    const img = card.querySelector('img.listing-card-v2__image');
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) {
      const picture = img.closest('picture') || img;
      imageCell.appendChild(picture.cloneNode(true));
    }

    // Column 2: Text content with field hint
    // Combines: type label, tags, title, and preserves the card link
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    // Extract type label (e.g., "Whitepaper", "Insight")
    const typeTag = card.querySelector('.listing-card-v2__type-tag span');
    if (typeTag) {
      const typePara = document.createElement('p');
      typePara.textContent = typeTag.textContent.trim();
      textCell.appendChild(typePara);
    }

    // Extract category tags
    const tags = card.querySelectorAll('.listing-card-v2__tag');
    if (tags.length > 0) {
      const tagTexts = [];
      tags.forEach((tag) => {
        // Extract actual tag text (skip the parentheses spans)
        const spans = tag.querySelectorAll('span');
        spans.forEach((span) => {
          const text = span.textContent.trim();
          if (text && text !== '(' && text !== ')') {
            tagTexts.push(text);
          }
        });
      });
      if (tagTexts.length > 0) {
        const tagPara = document.createElement('p');
        tagPara.textContent = tagTexts.join(', ');
        textCell.appendChild(tagPara);
      }
    }

    // Extract title and wrap as link to preserve href
    const title = card.querySelector('p.listing-card-v2__title, .listing-card-v2__title');
    const cardHref = card.getAttribute('href');
    if (title) {
      const titleEl = document.createElement('p');
      if (cardHref) {
        const link = document.createElement('a');
        link.setAttribute('href', cardHref);
        link.textContent = title.textContent.trim();
        titleEl.appendChild(link);
      } else {
        titleEl.textContent = title.textContent.trim();
      }
      textCell.appendChild(titleEl);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insights', cells });
  element.replaceWith(block);
}
