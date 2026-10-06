/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-vertical (new block for /broadridge). Base: tabs.
 * Source: migration-work/design-broadridge/source/broadridge.html (semantic source written from the design image)
 * Instance selector: .capability-tabs  (div.tab-panel[data-label] > h3, p, p > a)
 *
 * Container block - one row per tab (tabs-vertical-item):
 *   cell 1: title (text) - tab label
 *   cell 2: text (richtext) - h3, paragraph(s), link paragraph
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const panels = [...element.querySelectorAll('.tab-panel')];
  const cells = [];

  panels.forEach((panel, i) => {
    const labelCell = document.createDocumentFragment();
    labelCell.append(document.createComment(' field:title '), document.createTextNode(clean(panel.getAttribute('data-label')) || `Tab ${i + 1}`));

    const textCell = document.createDocumentFragment();
    textCell.append(document.createComment(' field:text '));
    [...panel.children].forEach((child) => {
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document.createElement('h3');
        h.textContent = clean(child.textContent);
        textCell.append(h);
      } else if (clean(child.textContent)) {
        const p = document.createElement('p');
        const a = child.querySelector('a');
        if (a) {
          const l = document.createElement('a');
          l.href = a.getAttribute('href') || '#';
          l.textContent = clean(a.textContent);
          p.append(l);
        } else p.textContent = clean(child.textContent);
        textCell.append(p);
      }
    });

    cells.push([labelCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-vertical', cells });
  element.replaceWith(block);
}
