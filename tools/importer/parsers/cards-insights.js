/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-insights
 * Base block: cards
 * Source: https://www.dept.global/en-in/
 * Selector: .block-custom-listing__items
 * Generated: 2026-05-25T00:00:00.000Z / Re-validated against dept.global DOM: 2026-10-08
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
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      const picture = img.closest('picture') || img;
      imageCell.appendChild(picture.cloneNode(true));
    }

    // Column 2: Text content with field hint
    // Combines: type label, tags, title, and preserves the card link
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    // NOTE: html2md preProcess (DOMUtils.removeSpans) unwraps class-less <span>s before
    // parsers run, so read text from the classed containers, never from inner spans.
    const clean = (el) => (el ? el.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : '');

    // Type label (e.g. "Case Study", "Insight", "Whitepaper"); the icon is an <img>, not text
    const typeText = clean(card.querySelector('.listing-card-v2__type-tag'));
    if (typeText) {
      const typePara = document.createElement('p');
      typePara.textContent = typeText;
      textCell.appendChild(typePara);
    }

    // Category tags: "( Category )" -> "Category"
    const tagTexts = [...card.querySelectorAll('.listing-card-v2__tag')]
      .map((tag) => clean(tag).replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (tagTexts.length > 0) {
      const tagPara = document.createElement('p');
      tagPara.textContent = tagTexts.join(', ');
      textCell.appendChild(tagPara);
    }

    // Title: the hover-card title (when present) is the article title; the meta title is then
    // the client name (e.g. case study card: "Electronics Retailer") and is kept as a label.
    const metaTitle = clean(card.querySelector('.listing-card-v2__meta .listing-card-v2__title, .listing-card-v2__title'));
    const hoverTitle = clean(card.querySelector('.listing-card-v2__hover-card-title'));
    const titleText = hoverTitle || metaTitle;
    if (hoverTitle && metaTitle && metaTitle !== hoverTitle) {
      const clientPara = document.createElement('p');
      clientPara.textContent = metaTitle;
      textCell.appendChild(clientPara);
    }
    const cardHref = card.getAttribute('href');
    if (titleText) {
      const titleEl = document.createElement('p');
      if (cardHref) {
        const link = document.createElement('a');
        link.setAttribute('href', cardHref);
        link.textContent = titleText;
        titleEl.appendChild(link);
      } else {
        titleEl.textContent = titleText;
      }
      textCell.appendChild(titleEl);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insights', cells });
  element.replaceWith(block);
}
