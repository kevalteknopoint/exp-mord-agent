import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

/**
 * Two-column panel (dept.global panel with rich text / with image and rich text):
 * rows: left (heading or image) | right (rich text).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // rows: left | right (one cell each)
  const [left, right] = [...block.children];
  if (!left) return;
  if (left) {
    left.classList.add('panel-split-left');
    if (left.querySelector('picture') && !left.textContent.trim()) left.classList.add('panel-split-media');
  }
  if (right) right.classList.add('panel-split-right');
  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '1000' }]);
    moveInstrumentation(img, picture.querySelector('img'));
    img.closest('picture').replaceWith(picture);
  });
}
