/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table-rounded. Base: table.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selectors: .term-insurance-table, .term-table-text.four-column-table, .term-table-text.table-head-red,
 *   .term-table-text.document-table-center, [id="40"] > .term-table-text   (7 matches, 2 markup shapes)
 *
 * Model: container block, items table-rounded-row / -col-2 / -col-3 / -col-4 with fields column1text..column4text.
 * Output: one block row per table row (first row = header), each cell hinted with column{N}text;
 *   all rows padded to the same column count.
 *
 * Shape A (.term-insurance-table, div-based):
 *   header: .table-blue-heading > .table-heading-first / -second / -third (excluding the .mob-block duplicate),
 *           text from :scope > p or .head p
 *   rows:   .table-rows-data > .plan-name (col 1) + .inner-column > .second-*-column .plan-data (cols 2..n)
 * Shape B (.term-table-text): .cmp-text table > tr > th/td (real <table>).
 */
function cellContent(document, src) {
  const frag = document.createDocumentFragment();
  if (!src) return frag;
  const nodes = [...src.childNodes].filter((n) => {
    if (n.nodeType === 8) return false; // HTML comments (data-sly leftovers)
    if (n.nodeType === 3) return n.textContent.replace(/ /g, ' ').trim() !== '';
    if (n.nodeType !== 1) return false;
    return n.textContent.replace(/ /g, ' ').trim() !== '' || n.querySelector('img');
  });
  nodes.forEach((n) => frag.append(n.cloneNode(true)));
  return frag;
}

function hasContent(frag) {
  return frag && frag.textContent.replace(/ /g, ' ').trim() !== '';
}

function parseDivTable(document, element) {
  const rows = [];
  const heads = [...element.querySelectorAll('.table-blue-heading > [class*="table-heading-"]')]
    .filter((h) => !h.classList.contains('mob-block'));
  if (heads.length) {
    rows.push(heads.map((h) => {
      const head = h.querySelector('.head') || h;
      return cellContent(document, head);
    }));
  }
  element.querySelectorAll('.table-rows-data').forEach((r) => {
    const row = [cellContent(document, r.querySelector('.plan-name'))];
    let cols = [...r.querySelectorAll('.inner-column > [class*="-column"]')];
    if (!cols.length) cols = [...r.querySelectorAll('.plan-data')].map((d) => d.parentElement);
    cols.forEach((c) => row.push(cellContent(document, c.querySelector('.plan-data') || c)));
    rows.push(row);
  });
  return rows;
}

function parseRealTable(document, table) {
  return [...table.querySelectorAll('tr')].map((tr) => [...tr.children]
    .filter((c) => c.tagName === 'TD' || c.tagName === 'TH')
    .map((c) => cellContent(document, c)));
}

export default function parse(element, { document }) {
  let rows = [];
  const table = element.querySelector('table');
  if (element.querySelector('.table-rows-data, .table-blue-heading')) rows = parseDivTable(document, element);
  else if (table) rows = parseRealTable(document, table);

  rows = rows.filter((r) => r.some((c) => hasContent(c)));
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const colCount = Math.min(4, Math.max(...rows.map((r) => r.length)));
  const cells = rows.map((r) => {
    const out = [];
    for (let i = 0; i < colCount; i += 1) {
      const c = r[i];
      if (c && hasContent(c)) {
        const frag = document.createDocumentFragment();
        frag.append(document.createComment(` field:column${i + 1}text `), c);
        out.push(frag);
      } else out.push('');
    }
    // more than 4 source columns: fold the overflow into the last column
    if (r.length > colCount) {
      r.slice(colCount).forEach((c) => { if (hasContent(c) && out[colCount - 1]) out[colCount - 1].append(c); });
    }
    return out;
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-rounded', cells });
  element.replaceWith(block);
}
