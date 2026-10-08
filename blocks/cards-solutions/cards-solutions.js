import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const ARROW_SVG = '<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M0.276367 9.01565V6.87304H13.6607L10.1546 1.19652L12.1581 0L16.9998 7.95826L12.1303 16L10.1268 14.7757L13.6607 9.01565H0.276367Z" fill="currentColor"></path></svg>';

/**
 * Numbered talking-points list (source: dept.global .block-talking-points).
 * Each row: [image cell, text cell (heading, description, link)].
 * Output per row:
 *   li > a.cards-solutions-item
 *     span.cards-solutions-item-number
 *     div.cards-solutions-item-title          (display: contents)
 *       h3.cards-solutions-item-text          (title, slides out on hover)
 *       div.cards-solutions-item-hover        (slides in on hover)
 *         p.cards-solutions-item-description
 *         div.cards-solutions-item-image > picture
 *     span.cards-solutions-item-arrow
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];
    const imageCell = cells.find((cell) => cell.querySelector('picture, img') && !cell.textContent.trim());
    const textCell = cells.find((cell) => cell !== imageCell) || cells[0];

    const anchor = textCell?.querySelector('a');
    const a = document.createElement('a');
    a.className = 'cards-solutions-item';
    a.href = anchor ? anchor.getAttribute('href') : '#';

    const number = document.createElement('span');
    number.className = 'cards-solutions-item-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');

    const title = document.createElement('div');
    title.className = 'cards-solutions-item-title';

    // keep the authored heading element (and its id) so the outline stays intact
    let heading = textCell?.querySelector('h1, h2, h3, h4, h5, h6');
    if (!heading) {
      heading = document.createElement('h3');
      heading.textContent = anchor ? anchor.textContent.trim() : '';
    }
    heading.className = 'cards-solutions-item-text';

    const hover = document.createElement('div');
    hover.className = 'cards-solutions-item-hover';

    const description = textCell
      ? [...textCell.querySelectorAll('p')].find((p) => !p.querySelector('a') && p.textContent.trim())
      : null;
    if (description) {
      description.className = 'cards-solutions-item-description';
      hover.append(description);
    }

    const img = imageCell?.querySelector('img');
    if (img) {
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      const imageWrap = document.createElement('div');
      imageWrap.className = 'cards-solutions-item-image';
      imageWrap.append(picture);
      hover.append(imageWrap);
    }

    title.append(heading, hover);

    const arrow = document.createElement('span');
    arrow.className = 'cards-solutions-item-arrow';
    arrow.innerHTML = ARROW_SVG;

    a.append(number, title, arrow);
    li.append(a);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
