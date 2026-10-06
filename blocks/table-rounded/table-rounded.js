import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Table Rounded
 * Each row = one table row; the first row is the header row. Cells are rich text
 * (paragraphs, bold text, bullet lists). Supports 1-5 columns; the table scrolls
 * horizontally inside its rounded container on narrow screens.
 * Styles detected from the content (no authoring change needed):
 *   table-head-red      - 2 columns, 2nd header negates the 1st ("Covered" / "Not Covered")
 *   table-rounded-lists - every filled body cell is a bullet list (narrow, centred checklist)
 */
const normalise = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();

/* rows authored in Universal Editor carry every column field; drop the unused trailing columns */
function trimEmptyColumns(rows) {
  const hasContent = (cell) => cell.textContent.trim() || cell.querySelector('img, picture, a');
  const used = rows.reduce(
    (max, row) => Math.max(max, [...row.children].findLastIndex(hasContent) + 1),
    0,
  );
  rows.forEach((row) => [...row.children].slice(used).forEach((cell) => cell.remove()));
}

export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const rows = [...block.children];
  trimEmptyColumns(rows);
  let columnCount = 0;

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    const cells = [...row.children];
    columnCount = Math.max(columnCount, cells.length);
    cells.forEach((cell, c) => {
      const isHead = i === 0;
      const td = document.createElement(isHead ? 'th' : 'td');
      if (isHead) td.setAttribute('scope', 'col');
      td.classList.add(`table-rounded-col-${c + 1}`);
      moveInstrumentation(cell, td);
      while (cell.firstChild) td.append(cell.firstChild);
      tr.append(td);
    });
    if (i === 0) thead.append(tr);
    else tbody.append(tr);
  });

  table.append(thead, tbody);
  const scroller = document.createElement('div');
  scroller.className = 'table-rounded-scroller';
  scroller.append(table);
  block.classList.add(`table-rounded-${columnCount}-cols`);

  const heads = [...thead.querySelectorAll('th')].map((th) => normalise(th.textContent));
  if (heads.length === 2 && heads[0] && heads[1] !== heads[0]
    && heads[1].replace(/\bnot\s+/, '') === heads[0]) {
    block.classList.add('table-head-red');
  }

  const filled = [...tbody.querySelectorAll('td')].filter((td) => td.textContent.trim());
  const isList = (el) => /^(UL|OL)$/.test(el.tagName);
  if (filled.length && filled.every((td) => [...td.children].every(isList))) {
    block.classList.add('table-rounded-lists');
  }

  block.replaceChildren(scroller);
}
