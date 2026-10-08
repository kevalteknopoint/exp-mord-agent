import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

/* back arrow of the source "Back to all articles" link, drawn in currentColor */
const BACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11.5" stroke="currentColor"/><path d="M13.5 8 9.5 12l4 4" stroke="currentColor" stroke-width="1.5"/></svg>';

/**
 * Article header (insight / news pages).
 * Rows: image | text (back link, h1) | author portrait | details (name, role, "Label: value" lines)
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [imageRow, textRow, portraitRow, detailsRow] = [...block.children];
  const cell = (row) => (row ? row.firstElementChild || row : null);

  if (imageRow) imageRow.className = 'article-header-media';
  if (textRow) textRow.className = 'article-header-text';
  if (portraitRow) portraitRow.className = 'article-header-portrait';
  if (detailsRow) detailsRow.className = 'article-header-details';

  // back link: icon + label (label hidden on small screens like on the source)
  const text = cell(textRow);
  const back = text && [...text.querySelectorAll('a')].find((a) => !a.closest('h1, h2'));
  if (back) {
    back.classList.remove('button', 'primary', 'secondary');
    back.closest('.button-container')?.classList.remove('button-container');
    back.classList.add('article-header-back');
    back.closest('p')?.classList.add('article-header-back-container');
    const label = document.createElement('span');
    label.textContent = back.textContent.trim();
    back.textContent = '';
    back.insertAdjacentHTML('afterbegin', BACK_ICON);
    back.append(label);
  }

  // author: first lines are name + role, "Label: value" lines are the meta (length, date)
  const details = cell(detailsRow);
  if (details) {
    const author = document.createElement('div');
    author.className = 'article-header-author';
    const meta = document.createElement('dl');
    meta.className = 'article-header-meta';
    [...details.querySelectorAll(':scope > p')].forEach((p) => {
      const m = p.textContent.match(/^([^:]{1,40}):\s*(.+)$/);
      if (m && !p.querySelector('strong')) {
        const item = document.createElement('div');
        const dt = document.createElement('dt');
        dt.textContent = m[1].trim();
        const dd = document.createElement('dd');
        dd.textContent = m[2].trim();
        item.append(dt, dd);
        meta.append(item);
        p.remove();
      } else {
        author.append(p);
      }
    });
    details.prepend(author);
    if (meta.children.length) details.append(meta);
  }

  block.querySelectorAll('picture > img').forEach((img) => {
    const eager = !!img.closest('.article-header-media');
    const picture = createOptimizedPicture(img.src, img.alt, eager, [{ width: eager ? '960' : '160' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    img.closest('picture').replaceWith(picture);
  });

  // empty optional rows (no portrait / no image) are hidden
  [imageRow, portraitRow].forEach((row) => {
    if (row && !row.querySelector('img')) row.classList.add('article-header-empty');
  });
}
