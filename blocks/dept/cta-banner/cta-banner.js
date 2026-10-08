import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

/**
 * Call-to-action banner (dept.global insight CTA): background image with title, text and a button.
 * Rows: image | text
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [imageRow, textRow] = [...block.children];
  if (imageRow) imageRow.className = 'cta-banner-image';
  if (textRow) textRow.className = 'cta-banner-text';
  if (imageRow && !imageRow.querySelector('img')) {
    imageRow.remove();
    block.classList.add('cta-banner-no-image');
  }
  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '1600' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    img.closest('picture').replaceWith(picture);
  });
}
