import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Loan Banner
 * Each row = one full-bleed rounded banner card:
 *   cell 1: background image (picture)
 *   cell 2: rich text - eyebrow paragraph, heading, CTA link, fine-print paragraph
 *   cell 3: theme - "light" (white text, default) | "dark" (dark text, for light photos)
 * Text is overlaid at the top of the card, fine print sits at the bottom.
 */

const THEMES = ['light', 'dark'];

function decorateBody(cell) {
  cell.className = 'cards-loan-banner-body';
  const heading = cell.querySelector(':is(h1, h2, h3, h4, h5, h6)');
  const children = [...cell.children];
  const headingIndex = heading ? children.indexOf(heading) : -1;
  const ctaIndex = children.findIndex((el) => el.querySelector('a'));
  children.forEach((el, i) => {
    if (el.tagName !== 'P') return;
    if (headingIndex > -1 && i < headingIndex) {
      el.classList.add('cards-loan-banner-eyebrow');
    } else if (el.querySelector('a') && i === ctaIndex) {
      el.classList.add('cards-loan-banner-cta');
      el.querySelectorAll('a').forEach((a) => a.classList.add('cards-loan-banner-button'));
    } else if (i > Math.max(headingIndex, ctaIndex)) {
      el.classList.add('cards-loan-banner-fineprint');
    }
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.className = 'cards-loan-banner-item';
    moveInstrumentation(row, li);

    const [imageCell, textCell, themeCell] = [...row.children];
    const theme = (themeCell?.textContent || '').trim().toLowerCase();
    li.classList.add(`cards-loan-banner-${THEMES.includes(theme) ? theme : 'light'}`);

    const picture = imageCell?.querySelector('picture');
    if (picture) {
      imageCell.className = 'cards-loan-banner-image';
      const img = picture.querySelector('img');
      if (img) {
        img.loading = index === 0 ? 'eager' : 'lazy';
        if (index === 0) img.fetchPriority = 'high';
      }
      li.append(imageCell);
    }

    if (textCell && textCell.textContent.trim()) {
      decorateBody(textCell);
      li.append(textCell);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
