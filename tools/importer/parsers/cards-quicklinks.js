/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-quicklinks
 * Base block: cards
 * Source: https://www.wipro.com/
 * Selector: .homepagequicklinks .quicklinks_boxes
 * Generated: 2026-04-30
 *
 * Container block (xwalk): each .quicklink child becomes one row.
 * UE model (card-quicklink) fields per child: image (reference), text (richtext).
 *
 * Source DOM structure (live):
 *   div.quicklinks_boxes
 *     div.quicklink
 *       a[href]
 *         div.bg[data-bg-desktop]  (background image via data attribute, no <img> in live DOM)
 *         div.content > p.title    (title text + decorative dot span)
 */
export default function parse(element, { document }) {
  const quicklinks = element.querySelectorAll(':scope > .quicklink');

  const cells = [];

  quicklinks.forEach((ql) => {
    // Extract the link wrapper
    const link = ql.querySelector('a[href]');

    // Extract background image from data-bg-desktop attribute on div.bg
    // Live DOM uses data attributes instead of <img> elements
    const bgDiv = ql.querySelector('.bg[data-bg-desktop], .bg.lazy-dynamic-bg');
    const bgSrc = bgDiv
      ? bgDiv.getAttribute('data-bg-desktop') || bgDiv.getAttribute('data-poster')
      : null;

    // Fallback: check for an actual <img> tag (scraped/cleaned HTML may have one)
    const existingImg = ql.querySelector('.bg img, img');

    // Build image cell with field hint
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (existingImg) {
      imageCell.appendChild(existingImg);
    } else if (bgSrc) {
      const img = document.createElement('img');
      img.src = bgSrc;
      imageCell.appendChild(img);
    }

    // Extract title text from p.title, excluding the decorative dot span
    const titleEl = ql.querySelector('p.title, .content .title');
    let titleText = '';
    if (titleEl) {
      // Clone to avoid mutating the DOM, then remove decorative dot spans
      const titleClone = titleEl.cloneNode(true);
      const dotSpans = titleClone.querySelectorAll('span[aria-hidden="true"], span[class*="titledot"]');
      dotSpans.forEach((s) => s.remove());
      titleText = titleClone.textContent.trim();
    }

    // Build text cell with field hint
    // Combine title text with link as richtext
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (link && link.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = titleText || link.getAttribute('href');
      textCell.appendChild(a);
    } else if (titleText) {
      const p = document.createElement('p');
      p.textContent = titleText;
      textCell.appendChild(p);
    }

    // Container block: each child item = one row, fields = columns [image, text]
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quicklinks', cells });
  element.replaceWith(block);
}
