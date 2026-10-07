import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Metric
 * Each row = one tile: cell 1 image (portrait for a quote tile, line art for stat tiles),
 * cell 2 rich text (stat: heading value + label paragraph | quote: quote paragraph, bold name,
 * role), cell 3 style: quote | red-tall | red | light.
 * Quote and *-tall tiles span two rows of the grid.
 */

const STYLES = ['quote', 'red-tall', 'red', 'light'];

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const [imageCell, textCell, styleCell] = [...row.children];
    const style = (styleCell?.textContent || '').trim().toLowerCase();
    const li = document.createElement('li');
    li.className = `cards-metric-card cards-metric-${STYLES.includes(style) ? style : 'light'}`;
    moveInstrumentation(row, li);

    if (textCell) {
      textCell.className = 'cards-metric-body';
      li.append(textCell);
    }
    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'cards-metric-image';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }
    ul.append(li);
  });

  block.replaceChildren(ul);
}
