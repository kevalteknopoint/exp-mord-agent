import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Hero Split
 * Each row = one panel: cell 1 optional image, cell 2 rich text.
 *   row 1  : main panel - heading, intro paragraph(s), CTA link (white button)
 *   rows 2+: promo cards stacked on the right - tag paragraph (before the heading), heading, link
 *            (rendered as an arrow; the whole card is clickable). Optional image = card background.
 */

function unbutton(link) {
  link.classList.remove('button', 'primary', 'secondary');
  const container = link.closest('.button-container');
  if (container) container.classList.remove('button-container');
}

function decorateImage(cell, eager) {
  const img = cell?.querySelector('picture img');
  if (!img) return null;
  const picture = createOptimizedPicture(img.src, img.alt, eager, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]);
  moveInstrumentation(img, picture.querySelector('img'));
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-split-image';
  wrapper.append(picture);
  return wrapper;
}

function decoratePromo(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  const children = [...body.children];
  const headingIndex = heading ? children.indexOf(heading) : -1;
  children.forEach((el, i) => {
    if (el.tagName === 'P' && headingIndex > -1 && i < headingIndex && !el.querySelector('a')) {
      el.classList.add('hero-split-tag');
    }
  });
  const link = [...body.querySelectorAll('a')].pop();
  if (link) {
    unbutton(link);
    link.classList.add('hero-split-link');
    link.closest('p')?.classList.add('hero-split-link-wrapper');
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  const main = document.createElement('div');
  main.className = 'hero-split-main';
  const promos = document.createElement('div');
  promos.className = 'hero-split-promos';

  rows.forEach((row, index) => {
    const [imageCell, textCell] = [...row.children];
    const panel = document.createElement('div');
    moveInstrumentation(row, panel);
    const image = decorateImage(imageCell, index === 0);
    if (image) {
      panel.append(image);
      panel.classList.add('hero-split-has-image');
    }
    const body = document.createElement('div');
    body.className = 'hero-split-body';
    if (textCell) {
      moveInstrumentation(textCell, body);
      while (textCell.firstChild) body.append(textCell.firstChild);
    }
    panel.append(body);

    if (index === 0) {
      panel.classList.add('hero-split-panel');
      main.append(panel);
    } else {
      panel.classList.add('hero-split-promo');
      decoratePromo(body);
      promos.append(panel);
    }
  });

  block.replaceChildren(main);
  if (promos.children.length) block.append(promos);
}
