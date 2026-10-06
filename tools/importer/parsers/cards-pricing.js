/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-pricing. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .insurance-coverage-cards.container-category-price
 *
 * Model (cards-pricing-item): image, tag, text  -> one row per tile, 3 columns
 * Validated selectors (source.html): .leadproxyteaser.categoryPrice .cmp-teaser,
 *   .background-image img.desktopbg, .cmp-teaser__description span.lead / .term-text / .blueText / .whiteText,
 *   a.cmp-teaser__action-link
 */
function hinted(document, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('.cmp-teaser')];
  if (!tiles.length) tiles = [...element.querySelectorAll('.teaser, .leadproxyteaser')];

  const cells = [];
  tiles.forEach((tile) => {
    const bg = tile.querySelector('.background-image img.desktopbg[src], .background-image img[src]');
    const desc = tile.querySelector('.cmp-teaser__description') || tile;
    const tagEl = desc.querySelector('.blueText');
    const amountEl = desc.querySelector('.lead');
    const labelEl = desc.querySelector('.term-text');
    const priceEl = desc.querySelector('.whiteText');
    const cta = tile.querySelector('a.cmp-teaser__action-link, .cmp-teaser__action-container a');

    const text = [];
    if (amountEl) {
      const h = document.createElement('h3');
      h.textContent = amountEl.textContent.trim();
      text.push(h);
    }
    if (labelEl) {
      const p = document.createElement('p');
      p.textContent = labelEl.textContent.trim();
      text.push(p);
    }
    if (priceEl) {
      const p = document.createElement('p');
      p.append(...[...priceEl.childNodes].map((n) => n.cloneNode(true)));
      text.push(p);
    }
    // any other description paragraphs not covered above
    desc.querySelectorAll(':scope > p').forEach((p) => {
      if (p.querySelector('.blueText, .lead, .term-text, .whiteText')) return;
      if (p.textContent.trim()) text.push(p);
    });
    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim();
      p.append(a);
      text.push(p);
    }
    if (!text.length && !bg) return;

    cells.push([
      hinted(document, 'image', bg),
      tagEl ? hinted(document, 'tag', document.createTextNode(tagEl.textContent.trim())) : '',
      hinted(document, 'text', text),
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-pricing', cells });
  element.replaceWith(block);
}
