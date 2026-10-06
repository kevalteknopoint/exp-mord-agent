import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Columns Image Table
 * One row, two columns:
 *   column 1: image (e.g. a chart) with optional caption text
 *   column 2: optional heading + a data table. The table may be authored either as
 *             a rich-text table, or as a list where each item is one row with values
 *             separated by "|" (first item = header row),
 *             e.g. "Sr.no | Financial Year | Ratio (%)".
 */

function listToTable(list) {
  const items = [...list.querySelectorAll(':scope > li')];
  if (!items.length || !items.some((li) => li.textContent.includes('|'))) return null;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  items.forEach((li, i) => {
    const tr = document.createElement('tr');
    li.textContent.split('|').map((v) => v.trim()).forEach((v) => {
      const cell = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) cell.setAttribute('scope', 'col');
      cell.textContent = v;
      tr.append(cell);
    });
    (i === 0 ? thead : tbody).append(tr);
  });
  table.append(thead, tbody);
  return table;
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-image-table-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && !col.querySelector('table, ul, ol')) {
        col.classList.add('columns-image-table-media');
        const img = pic.querySelector('img');
        if (img) {
          const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]);
          moveInstrumentation(img, optimized.querySelector('img'));
          pic.replaceWith(optimized);
        }
        return;
      }
      col.classList.add('columns-image-table-data');
      col.querySelectorAll('ul, ol').forEach((list) => {
        const table = listToTable(list);
        if (table) list.replaceWith(table);
      });
      col.querySelectorAll('table').forEach((table) => {
        const wrap = document.createElement('div');
        wrap.className = 'columns-image-table-scroller';
        table.replaceWith(wrap);
        wrap.append(table);
      });
    });
  });
}
