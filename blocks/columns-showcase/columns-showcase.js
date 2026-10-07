import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Columns Showcase
 * Block fields (one row each): image (large visual), text (rich text: heading, paragraph(s), CTA).
 * Desktop: visual left, right-aligned text bottom right. Mobile: text, visual, then the CTA.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows.find((row) => row.querySelector('picture'));
  const textRow = rows.find((row) => row !== imageRow && row.textContent.trim());

  const media = document.createElement('div');
  media.className = 'columns-showcase-media';
  const img = imageRow?.querySelector('img');
  if (img) {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    media.append(picture);
  }

  const content = document.createElement('div');
  content.className = 'columns-showcase-content';
  if (textRow) {
    const cell = textRow.firstElementChild || textRow;
    moveInstrumentation(cell, content);
    while (cell.firstChild) content.append(cell.firstChild);
  }
  // CTA paragraphs get their own grid area (below the visual on mobile)
  const cta = document.createElement('div');
  cta.className = 'columns-showcase-cta';
  cta.append(...content.querySelectorAll(':scope > .button-container'));

  block.replaceChildren(media, content);
  if (cta.children.length) block.append(cta);
}
