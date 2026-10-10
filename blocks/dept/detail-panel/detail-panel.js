import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

/* source icons (circle arrow left / dot / arrow right), drawn in currentColor */
const ICONS = {
  back: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11.5" stroke="currentColor"/><path d="M17 12H7.5M11 8l-4 4 4 4" stroke="currentColor" stroke-width="1.25"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="9.25" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2.5" fill="currentColor"/></svg>',
  bar: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11.25" stroke="currentColor" stroke-width="1.5"/><path d="M7 12h9.5M13 8l4 4-4 4" stroke="currentColor" stroke-width="1.25"/></svg>',
};

/** Plain link (button decoration removed) with an icon before or after its label. */
function iconLink(a, icon, className, after = false) {
  a.classList.remove('button', 'primary', 'secondary');
  a.closest('.button-container')?.classList.remove('button-container');
  a.classList.add(className);
  const label = document.createElement('span');
  label.textContent = a.textContent.trim();
  a.textContent = '';
  a.append(label);
  a.insertAdjacentHTML(after ? 'beforeend' : 'afterbegin', icon);
}

/**
 * Page header of the DEPT detail pages (agencies, offices, downloads, events, partners).
 * Rows: image | text (back link, h1, description / contact lines, call-to-action link)
 * Variants: split (dark text column | image), overlay (title over a full-width image).
 * A bold call-to-action link becomes the purple bar of the office pages.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [imageRow, textRow] = [...block.children];
  if (imageRow) imageRow.className = 'detail-panel-image';
  if (textRow) textRow.className = 'detail-panel-text';
  if (!imageRow || !imageRow.querySelector('img')) block.classList.add('detail-panel-no-image');

  const text = textRow && (textRow.firstElementChild || textRow);
  if (text) {
    const heading = text.querySelector('h1, h2');
    const children = [...text.children];
    const headingIndex = heading ? children.indexOf(heading) : -1;
    children.forEach((child, index) => {
      if (child.tagName !== 'P') return;
      if (child.querySelector('img')) {
        child.classList.add('detail-panel-logo');
        return;
      }
      const a = child.querySelector('a');
      // only paragraphs that are just a link (not mailto / tel lines)
      const linkOnly = a && a.textContent.trim() === child.textContent.trim() && !/^(mailto|tel):/.test(a.getAttribute('href') || '');
      if (!linkOnly) {
        // e-mail / phone lines are text links, not buttons
        if (a) {
          a.classList.remove('button', 'primary', 'secondary');
          child.classList.remove('button-container');
        }
        return;
      }
      if (index < headingIndex) {
        child.classList.add('detail-panel-back-container');
        iconLink(a, ICONS.back, 'detail-panel-back');
      } else if (a.closest('strong')) {
        child.classList.add('detail-panel-bar-container');
        iconLink(a, ICONS.bar, 'detail-panel-bar', true);
      } else {
        child.classList.add('detail-panel-cta-container');
        iconLink(a, ICONS.link, 'detail-panel-cta');
      }
    });
  }

  block.querySelectorAll('picture > img').forEach((img) => {
    const isMedia = !!img.closest('.detail-panel-image');
    const picture = createOptimizedPicture(img.src, img.alt, isMedia, [{ width: isMedia ? '1440' : '240' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    img.closest('picture').replaceWith(picture);
  });
}
