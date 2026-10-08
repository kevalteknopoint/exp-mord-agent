/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-reels (new block for /tata-cars). Base: carousel.
 * Source: migration-work/design-tatacars/source/tata-cars.html (semantic source written from the design image)
 * Instance selector: #family .reels
 *
 * One row per story: image | text (quote, bold name, meta, tag) | link (video) | duration
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
  const cells = [...element.querySelectorAll(':scope > article')].map((card) => {
    const link = card.querySelector(':scope > a');
    const a = document.createElement('a');
    if (link) {
      a.href = link.getAttribute('href') || '#';
      a.textContent = clean(link.textContent);
    }
    const paragraphs = [...card.querySelectorAll(':scope > p')].map((p) => p.cloneNode(true));
    return [
      imageCell(document, card.querySelector('img')),
      hinted(document, 'text', ...paragraphs),
      hinted(document, 'link', ...(link ? [a] : [])),
      hinted(document, 'duration', document.createTextNode(clean(card.getAttribute('data-duration')))),
    ];
  });
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'carousel-reels', cells }));
}
