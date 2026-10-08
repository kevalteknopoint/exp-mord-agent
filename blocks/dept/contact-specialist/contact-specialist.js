import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

const ARROW = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11.5" stroke="currentColor"/><path d="m10.5 8 4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>';

/**
 * "Questions?" panel: heading on the dark half; specialist photo, role, name and a
 * "Get in touch" bar on the light half.
 * Rows: image | text (h2, role p, name h3, link p)
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [imageRow, textRow] = [...block.children];
  const text = textRow && (textRow.firstElementChild || textRow);
  const heading = text && text.querySelector('h1, h2');

  const left = document.createElement('div');
  left.className = 'contact-specialist-intro';
  if (heading) left.append(heading);

  if (imageRow) imageRow.className = 'contact-specialist-image';
  if (textRow) textRow.className = 'contact-specialist-person';

  // the contact link becomes the full-width bar
  const link = text && [...text.querySelectorAll('a')].pop();
  if (link) {
    link.classList.remove('button', 'primary', 'secondary');
    const holder = link.closest('p');
    const bar = document.createElement('p');
    bar.className = 'contact-specialist-cta';
    const label = document.createElement('span');
    label.textContent = link.textContent.trim();
    link.textContent = '';
    link.append(label);
    link.insertAdjacentHTML('beforeend', ARROW);
    bar.append(link);
    if (holder && !holder.textContent.trim()) holder.remove();
    textRow.append(bar);
  }

  const role = text && [...text.querySelectorAll(':scope > p')].find((p) => !p.querySelector('a'));
  if (role) role.classList.add('contact-specialist-role');

  const right = document.createElement('div');
  right.className = 'contact-specialist-panel';
  if (imageRow) right.append(imageRow);
  if (textRow) right.append(textRow);

  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '1000' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    img.closest('picture').replaceWith(picture);
  });
  if (imageRow && !imageRow.querySelector('img')) imageRow.remove();

  block.textContent = '';
  block.append(left, right);
}
