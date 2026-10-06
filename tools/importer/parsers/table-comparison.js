/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table-comparison. Base: table.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .compare-term-plan-table .compare-table-wrapper
 *
 * Model: container block, every row is a table-comparison-row item with fields column1text..column4text (unused trailing columns stay empty).
 * Output (per block README):
 *   row 1        : header - label column title + one cell per compared plan
 *   rows 2..n    : attribute label + one rich-text value cell per plan; Minimum/Maximum groups become
 *                  bold-only sub-label paragraphs followed by the value
 *   last row     : empty label + "Buy Now" links (CTA row)
 * Validated selectors (source.html):
 *   .table-blue-heading > .table-heading-first (label title), .table-heading-second/-third .head p (plan names;
 *   the .select-drop-down plan switcher is ignored), .table-rows-data > .plan-name,
 *   .parent-table-data > div (group; .mobile-minmax-head = sub-label) > .inner-column > div (one per plan) .plan-data,
 *   .redirection-button-container a.redirect-btn
 * Rows behind "view more" (.hide-row) are still content and are kept.
 */
function clean(t) {
  return (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function contentNodes(src) {
  if (!src) return [];
  return [...src.childNodes].filter((n) => {
    if (n.nodeType === 8) return false;
    if (n.nodeType === 3) return clean(n.textContent) !== '';
    return n.nodeType === 1 && (clean(n.textContent) !== '' || n.querySelector('img'));
  }).map((n) => n.cloneNode(true));
}

function hinted(document, idx, nodes) {
  const list = nodes.filter(Boolean);
  if (!list.length || !list.some((n) => clean(n.textContent) || (n.querySelector && n.querySelector('img')))) return '';
  const frag = document.createDocumentFragment();
  frag.append(document.createComment(` field:column${idx}text `));
  list.forEach((n) => frag.append(n));
  return frag;
}

export default function parse(element, { document }) {
  const rows = [];

  // Header
  const headFirst = element.querySelector('.table-blue-heading > .table-heading-first');
  const planHeads = [...element.querySelectorAll('.table-blue-heading > .secondElement, .table-blue-heading > .table-heading-second, .table-blue-heading > .table-heading-third')]
    .filter((h, i, arr) => arr.indexOf(h) === i && !h.classList.contains('mob-block'));
  let planCount = planHeads.length;
  if (headFirst || planHeads.length) {
    const label = document.createElement('p');
    label.textContent = clean(headFirst ? headFirst.textContent : '');
    const header = [[label]];
    planHeads.forEach((h) => {
      const p = document.createElement('p');
      const name = h.querySelector(':scope > .head') || h.querySelector('.head');
      p.textContent = clean(name ? name.textContent : '');
      header.push([p]);
    });
    rows.push(header);
  }

  // Data rows
  element.querySelectorAll('.table-rows-data').forEach((r) => {
    const labelNodes = contentNodes(r.querySelector('.plan-name'));
    const groups = [...r.querySelectorAll(':scope > .parent-table-data > div')];
    const perPlan = [];
    groups.forEach((g) => {
      const subHead = g.querySelector(':scope > .mobile-minmax-head') || g.querySelector('.backgrey');
      const sub = subHead ? clean(subHead.textContent) : '';
      const planCols = [...g.querySelectorAll(':scope > .inner-column > div')];
      planCount = Math.max(planCount, planCols.length);
      planCols.forEach((col, i) => {
        perPlan[i] = perPlan[i] || [];
        const values = contentNodes(col.querySelector('.plan-data'));
        if (sub && (values.length || groups.length > 1)) {
          const p = document.createElement('p');
          const b = document.createElement('strong');
          b.textContent = sub;
          p.append(b);
          perPlan[i].push(p);
        }
        perPlan[i].push(...values);
      });
    });
    rows.push([labelNodes, ...perPlan]);
  });

  // CTA row
  const ctas = [...element.querySelectorAll('.redirection-button-container .btn-container a[href], .redirection-button-container a.redirect-btn')]
    .filter((a, i, arr) => arr.indexOf(a) === i);
  if (ctas.length) {
    const row = [[]];
    ctas.forEach((src) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = src.getAttribute('href');
      a.textContent = clean(src.textContent) || 'Buy Now';
      p.append(a);
      row.push([p]);
    });
    rows.push(row);
  }

  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const colCount = Math.min(4, Math.max(planCount + 1, ...rows.map((r) => r.length)));
  const cells = rows.map((r) => {
    const out = [];
    for (let i = 0; i < colCount; i += 1) out.push(hinted(document, i + 1, r[i] || []));
    return out;
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-comparison', cells });
  element.replaceWith(block);
}
