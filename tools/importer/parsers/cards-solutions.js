/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-solutions
 * Base block: cards
 * Source: https://www.dept.global/en-in/
 * Selector: .block-talking-points
 * Updated: 2026-10-08 (re-validated against dept.global DOM)
 *
 * Source: numbered list of 4 links `a.block-talking-points__item` (number, title,
 * hover description + hover image inside `.block-talking-points__items-hover-container`).
 * Iterates the `<li>` wrappers (not the anchors) to stay immune to inline-merge drift.
 *
 * Container block — each item becomes one row: image | text
 * UE model fields per card: image (reference), text (richtext)
 * Number (01..04) is not authored — the block JS generates it from row index.
 * Section heading (.block-talking-points__title) and intro (.block-talking-points__subtitle)
 * are kept as default content before the block.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.block-talking-points__items > li')];
  if (!items.length) items = [...element.querySelectorAll('a.block-talking-points__item')];

  // Default content preserved before the block
  const defaultContent = [];
  const title = element.querySelector('.block-talking-points__title');
  if (title && title.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.replace(/\s+/g, ' ').trim();
    defaultContent.push(h2);
  }
  const subtitle = element.querySelector('.block-talking-points__subtitle');
  if (subtitle && subtitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = subtitle.textContent.replace(/\s+/g, ' ').trim();
    defaultContent.push(p);
  }

  const cells = [];

  items.forEach((item) => {
    const link = item.matches('a') ? item : item.querySelector('a.block-talking-points__item, a[href]');
    const image = item.querySelector('img.block-talking-points__item-image, .block-talking-points__item-image-container img');
    const titleSpan = item.querySelector('.block-talking-points__item-text');
    const hoverDescSpan = item.querySelector('.block-talking-points__items-hover-container > span.is-fancy-serif');

    // Image cell (hint only when an image exists)
    const imageCell = document.createDocumentFragment();
    if (image && image.getAttribute('src')) {
      imageCell.appendChild(document.createComment(' field:image '));
      const img = document.createElement('img');
      img.src = image.getAttribute('src');
      img.alt = image.getAttribute('alt') || '';
      imageCell.appendChild(img);
    }

    // Text cell: H3 title + description + link
    const textParts = [];
    const titleText = titleSpan ? titleSpan.textContent.replace(/\s+/g, ' ').trim() : '';
    if (titleText) {
      const heading = document.createElement('h3');
      heading.textContent = titleText;
      textParts.push(heading);
    }
    if (hoverDescSpan && hoverDescSpan.textContent.trim()) {
      const desc = document.createElement('p');
      desc.textContent = hoverDescSpan.textContent.replace(/\s+/g, ' ').trim();
      textParts.push(desc);
    }
    if (link && link.getAttribute('href')) {
      const p = document.createElement('p');
      const cta = document.createElement('a');
      cta.href = link.getAttribute('href');
      cta.textContent = titleText || 'Learn more';
      p.appendChild(cta);
      textParts.push(p);
    }

    if (!textParts.length && !imageCell.childNodes.length) return;

    const textCell = document.createDocumentFragment();
    if (textParts.length) {
      textCell.appendChild(document.createComment(' field:text '));
      textParts.forEach((el) => textCell.appendChild(el));
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...defaultContent);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-solutions', cells });
  defaultContent.forEach((el) => element.before(el));
  element.replaceWith(block);
}
