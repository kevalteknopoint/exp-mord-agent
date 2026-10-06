/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-links.
 * Base: cards. Source: https://www.yes.bank.in/
 * Extracts EMI calculator tool cards from .tools-inner-row
 */
export default function parse(element, { document }) {
  const toolCards = element.querySelectorAll('.tools-inner-row');
  const cells = [];

  toolCards.forEach((card) => {
    const img = card.querySelector('.tools-image img, img');
    const title = card.querySelector('h3, .tools-text h3');
    const link = card.querySelector('a[href]');

    // Image cell
    const imgCell = document.createDocumentFragment();
    if (img) {
      const picture = document.createElement('picture');
      const imgEl = document.createElement('img');
      imgEl.src = img.src || '';
      imgEl.alt = img.alt || '';
      picture.appendChild(imgEl);
      imgCell.appendChild(picture);
    }

    // Text cell with title and CTA link
    const textCell = document.createDocumentFragment();
    if (title) textCell.appendChild(title.cloneNode(true));
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim() || 'Calculate Now';
      p.appendChild(a);
      textCell.appendChild(p);
    }

    cells.push([imgCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-links', cells });
  element.replaceWith(block);
}
