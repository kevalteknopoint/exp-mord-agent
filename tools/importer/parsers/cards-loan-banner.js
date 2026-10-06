/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-loan-banner (new block for /loans). Base: cards.
 * Source: migration-work/design-loans/source/loans.html (semantic source written from the design image)
 * Instance selector: .loan-banners
 *
 * Cards convention - one row per banner card:
 *   cell 1: image (+ imageAlt, collapsed into the img alt) - full-bleed background photo
 *   cell 2: text (richtext) - eyebrow paragraph, heading (h2), "Apply now" link paragraph, fine-print paragraph
 *   cell 3: theme (select)  - "light" = white text (dark photo) | "dark" = dark text (light photo)
 * Source markup: article.loan-banner[data-theme] > img + .loan-banner-text > p.eyebrow, h2, p > a.cta, p.fine-print
 * Note: the source data-theme describes the PHOTO ("light" photo => dark text), so it is inverted here.
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.loan-banner')];
  const cells = [];

  cards.forEach((card) => {
    // cell 1: image
    const imageCell = document.createDocumentFragment();
    const src = card.querySelector('img');
    if (src && src.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = src.getAttribute('src');
      img.alt = src.getAttribute('alt') || '';
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // cell 2: text
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    const body = card.querySelector('.loan-banner-text') || card;
    const eyebrow = clean((body.querySelector('.eyebrow') || {}).textContent);
    if (eyebrow) textCell.appendChild(para(document, eyebrow));
    const heading = body.querySelector('h1, h2, h3');
    if (heading) {
      const h = document.createElement('h2');
      h.textContent = clean(heading.textContent);
      textCell.appendChild(h);
    }
    const cta = body.querySelector('a.cta') || body.querySelector('a[href]');
    if (cta) {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = cta.getAttribute('href') || '#';
      link.textContent = clean(cta.textContent);
      p.append(link);
      textCell.appendChild(p);
    }
    const fine = clean((body.querySelector('.fine-print') || {}).textContent);
    if (fine) textCell.appendChild(para(document, fine));

    // cell 3: theme (text colour)
    const photo = (card.getAttribute('data-theme') || 'dark').toLowerCase();
    const themeCell = document.createDocumentFragment();
    themeCell.appendChild(document.createComment(' field:theme '));
    themeCell.appendChild(document.createTextNode(photo === 'light' ? 'dark' : 'light'));

    cells.push([imageCell, textCell, themeCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-loan-banner', cells });
  element.replaceChildren(block);
}
