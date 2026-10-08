/* eslint-disable */
/* global WebImporter */
/**
 * Parser for calculator-emi (new block for /tata-cars). Base: calculator.
 * Source: migration-work/design-tatacars/source/tata-cars.html (semantic source written from the design image)
 * Instance selector: #emi .calculator
 *
 * Key-value block (dl > dt/dd): priceMin, priceMax, price, downMin, downMax, tenures, recommended,
 *   rateMin, rateMax, rate, ctaLabel, ctaLink, note
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

function hinted(document, field, ...nodes) {
  const frag = document.createDocumentFragment();
  frag.append(document.createComment(` field:${field} `), ...nodes);
  return frag;
}

function imageCell(document, source, field = 'image') {
  const frag = document.createDocumentFragment();
  if (source && source.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = source.getAttribute('src');
    img.alt = source.getAttribute('alt') || '';
    frag.append(document.createComment(` field:${field} `), img);
  }
  return frag;
}

// clones headings (keeping inline markup and level), paragraphs and lists; skips images
function richNodes(document, root) {
  const nodes = [];
  [...root.children].forEach((child) => {
    if (child.tagName === 'IMG' || !clean(child.textContent)) return;
    if (child.tagName === 'A') {
      const p = document.createElement('p');
      p.append(child.cloneNode(true));
      nodes.push(p);
      return;
    }
    nodes.push(child.cloneNode(true));
  });
  return nodes;
}

// key-value block: one row per <dt>/<dd> pair (images and links are kept as elements)
export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll(':scope > dt').forEach((dt) => {
    const dd = dt.nextElementSibling;
    if (!dd || dd.tagName !== 'DD') return;
    const key = clean(dt.textContent);
    const value = document.createDocumentFragment();
    const img = dd.querySelector('img');
    if (img) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src');
      i.alt = img.getAttribute('alt') || '';
      value.append(i);
    } else if (['ctaLink'].includes(key)) {
      const a = document.createElement('a');
      a.href = clean(dd.textContent) || '#';
      a.textContent = clean(dd.textContent) || '#';
      value.append(a);
    } else {
      value.append(document.createTextNode(clean(dd.textContent)));
    }
    cells.push([key, value]);
  });
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'calculator-emi', cells }));
}
