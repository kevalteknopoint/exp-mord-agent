/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-split (new block for /broadridge). Base: hero.
 * Source: migration-work/design-broadridge/source/broadridge.html (semantic source written from the design image)
 * Instance selector: .hero-split
 *
 * Container block - one row per panel (hero-split-item):
 *   cell 1: image (+ imageAlt, collapsed into the img alt) - optional background image
 *   cell 2: text (richtext)
 * Row 1 = article.hero-main (h1, intro p, CTA link); rows 2+ = article.hero-promo (p.tag, h2, arrow link).
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

function link(document, a) {
  const p = document.createElement('p');
  const l = document.createElement('a');
  l.href = a.getAttribute('href') || '#';
  l.textContent = clean(a.textContent);
  p.append(l);
  return p;
}

export default function parse(element, { document }) {
  const panels = [...element.querySelectorAll(':scope > .hero-main, :scope > .hero-promo')];
  const cells = [];

  panels.forEach((panel, index) => {
    const imageCell = document.createDocumentFragment();
    const src = panel.querySelector('img');
    if (src && src.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = src.getAttribute('src');
      img.alt = src.getAttribute('alt') || '';
      imageCell.append(document.createComment(' field:image '), img);
    }

    const textCell = document.createDocumentFragment();
    textCell.append(document.createComment(' field:text '));
    const tag = panel.querySelector('.tag');
    if (tag) {
      const p = document.createElement('p');
      p.textContent = clean(tag.textContent);
      textCell.append(p);
    }
    const heading = panel.querySelector('h1, h2, h3');
    if (heading) {
      const h = document.createElement(index === 0 ? 'h1' : 'h2');
      h.textContent = clean(heading.textContent);
      textCell.append(h);
    }
    panel.querySelectorAll(':scope > p:not(.tag)').forEach((p) => {
      const a = p.querySelector('a');
      if (a) textCell.append(link(document, a));
      else if (clean(p.textContent)) {
        const np = document.createElement('p');
        np.textContent = clean(p.textContent);
        textCell.append(np);
      }
    });

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-split', cells });
  element.replaceWith(block);
}
