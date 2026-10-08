/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cta-sticky (new block for /tata-cars). Base: cta.
 * Source: migration-work/design-tatacars/source/tata-cars.html (semantic source written from the design image)
 * Instance selector: #sticky .sticky-cta
 *
 * Single block field: text (info paragraph, CTA links - italic link = outline)
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

export default function parse(element, { document }) {
  const cells = [[hinted(document, 'text', ...richNodes(document, element))]];
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cta-sticky', cells }));
}
