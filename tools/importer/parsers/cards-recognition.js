/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-recognition (new block for /broadridge). Base: cards.
 * Source: migration-work/design-broadridge/source/broadridge.html (semantic source written from the design image)
 * Source markup: Recognition cards (li.recognition-card > optional img, h3, p > a)
 *
 * Container block - one row per card:
 *   cell 1: image (+ imageAlt, collapsed into the img alt)
 *   cell 2: text (richtext) - tag paragraph (optional), h3 heading, other paragraphs, link paragraph
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.recognition-card')];
  const cells = [];

  cards.forEach((card) => {
    const imageCell = document.createDocumentFragment();
    const src = card.querySelector('img');
    if (src && src.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = src.getAttribute('src');
      img.alt = src.getAttribute('alt') || '';
      imageCell.append(document.createComment(' field:image '), img);
    }

    const textCell = document.createDocumentFragment();
    textCell.append(document.createComment(' field:text '));
    [...card.children].forEach((child) => {
      if (child.tagName === 'IMG') return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document.createElement('h3');
        h.innerHTML = child.innerHTML.trim();
        textCell.append(h);
        return;
      }
      const a = child.querySelector('a');
      const p = document.createElement('p');
      if (a) {
        const l = document.createElement('a');
        l.href = a.getAttribute('href') || '#';
        l.textContent = clean(a.textContent);
        p.append(l);
      } else {
        if (!clean(child.textContent)) return;
        p.textContent = clean(child.textContent);
      }
      textCell.append(p);
    });

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-recognition', cells });
  element.replaceWith(block);
}
