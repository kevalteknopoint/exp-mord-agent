/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-image-table. Base: columns.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .claim-image-table
 *
 * Columns block (xwalk): 1 row x 2 columns, no field hints.
 *   col 1: chart image (.extendedimage img.cmp-image__image)
 *   col 2: optional heading + data table
 * The source data table (.term-table-text table) is authored in the block's list form - one <li> per row,
 * values separated by " | ", first item = header - because a <table> nested inside a block cell does not
 * survive the markdown / xwalk round trip (the block JS rebuilds the table from the list).
 */
function clean(t) {
  return (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const col1 = [];
  const img = element.querySelector('.extendedimage img.cmp-image__image, .cmp-image img.cmp-image__image, img.cmp-image__image');
  const src = img && (img.getAttribute('src') || img.getAttribute('data-src'));
  if (src) {
    const ni = document.createElement('img');
    ni.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    ni.alt = img.getAttribute('alt') || '';
    col1.push(ni);
  }

  const col2 = [];
  const textRoot = element.querySelector('.term-table-text .cmp-text, .leadproxytext .cmp-text');
  if (textRoot) {
    textRoot.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if (h.closest('table')) return;
      const nh = document.createElement('h3');
      nh.textContent = clean(h.textContent);
      if (nh.textContent) col2.push(nh);
    });
    const table = textRoot.querySelector('table');
    if (table) {
      const ul = document.createElement('ul');
      table.querySelectorAll('tr').forEach((tr) => {
        const vals = [...tr.children].filter((c) => c.tagName === 'TD' || c.tagName === 'TH').map((c) => clean(c.textContent));
        if (!vals.some(Boolean)) return;
        const li = document.createElement('li');
        li.textContent = vals.join(' | ');
        ul.append(li);
      });
      if (ul.children.length) col2.push(ul);
    }
    [...textRoot.querySelectorAll(':scope > p')].forEach((p) => { if (clean(p.textContent)) col2.push(p); });
  }

  if (!col1.length && !col2.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[col1, col2]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-table', cells });
  element.replaceWith(block);
}
