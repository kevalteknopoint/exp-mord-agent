/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-promo (new block for /kotak-life). Base: carousel.
 * Source: migration-work/design-kotak/source/kotak-life.html (semantic source written from the design images)
 * Instance selector: #promo .promo-slides
 *
 * One row per slide: image (photo) | text (tag p, h2, CTA link, fine print) | stats (list, value in <strong>)
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

// copies headings (keeping inline markup), paragraphs, lists and link paragraphs
function richNodes(document, root, skip = []) {
  const nodes = [];
  [...root.children].forEach((child) => {
    if (skip.some((sel) => child.matches(sel)) || child.tagName === 'IMG') return;
    if (child.tagName === 'BLOCKQUOTE') {
      nodes.push(...richNodes(document, child));
      return;
    }
    if (!clean(child.textContent)) return;
    if (/^H[1-6]$/.test(child.tagName)) {
      const h = document.createElement('h3');
      h.innerHTML = child.innerHTML.trim();
      nodes.push(h);
    } else if (child.tagName === 'UL' || child.tagName === 'OL') {
      nodes.push(child.cloneNode(true));
    } else {
      const p = document.createElement('p');
      const a = child.querySelector('a');
      if (a && clean(a.textContent) === clean(child.textContent)) {
        const l = document.createElement('a');
        l.href = a.getAttribute('href') || '#';
        l.textContent = clean(a.textContent);
        p.append(l);
      } else p.innerHTML = child.innerHTML.trim();
      nodes.push(p);
    }
  });
  return nodes;
}

export default function parse(element, { document }) {
  const cells = [...element.querySelectorAll('.promo-slide')].map((slide) => {
    const text = richNodes(document, slide, ['.stats']).map((node) => {
      if (node.tagName === 'H3') {
        const h = document.createElement('h2');
        h.innerHTML = node.innerHTML;
        return h;
      }
      return node;
    });
    const stats = slide.querySelector('.stats');
    return [
      imageCell(document, slide.querySelector('img')),
      hinted(document, 'text', ...text),
      hinted(document, 'stats', ...(stats ? [stats.cloneNode(true)] : [])),
    ];
  });
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'carousel-promo', cells }));
}
