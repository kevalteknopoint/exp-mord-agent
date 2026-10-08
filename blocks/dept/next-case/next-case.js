import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

/**
 * "Next project" teaser at the end of case pages.
 * Rows: image | text (label p, client heading, title p, tags p, link p)
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [imageRow, textRow] = [...block.children];
  if (imageRow) imageRow.className = 'next-case-image';
  if (textRow) textRow.className = 'next-case-text';

  const text = textRow && (textRow.firstElementChild || textRow);
  if (text) {
    const heading = text.querySelector('h1, h2, h3');
    const children = [...text.children];
    const headingIndex = heading ? children.indexOf(heading) : -1;
    const paragraphs = children.filter((child) => child.tagName === 'P');
    const before = paragraphs.filter((p) => children.indexOf(p) < headingIndex);
    const after = paragraphs.filter((p) => !before.includes(p) && !p.querySelector('a'));
    if (before[0]) before[0].classList.add('next-case-label');
    if (after[0]) after[0].classList.add('next-case-title');
    if (after[1]) after[1].classList.add('next-case-tags');
    const link = text.querySelector('a');
    if (link) {
      link.classList.add('next-case-link');
      // the whole panel is clickable, like on the source
      block.classList.add('next-case-clickable');
    }
  }

  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    img.closest('picture').replaceWith(picture);
  });
}
