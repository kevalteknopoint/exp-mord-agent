/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block (reused base).
 * Source: https://www.ngssuper.com.au/
 * Selectors:
 *   - section.s-block-fluid.no-top-padding (feature tiles - 2 side-by-side cards)
 *   - section.s-content-block.bg-theme-3 table (announcement with icon + text)
 *
 * Columns model: columns (number), rows (number) - default content in cells.
 * Columns blocks do NOT require field hint comments.
 *
 * Target table: N columns per row, each cell has default content (text, images, links).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Pattern 1: HTML table layout (announcement banner in section 5)
  // Found in DOM: div.table-wrapper > table > tbody > tr > td
  // Element may BE the table itself (selector: section.s-content-block.bg-theme-3 table)
  const table = element.tagName === 'TABLE' ? element : element.querySelector('div.table-wrapper table, table');
  if (table) {
    const rows = table.querySelectorAll('tbody > tr, tr');
    for (const row of rows) {
      const tds = row.querySelectorAll('td');
      const rowCells = [];
      for (const td of tds) {
        const cellContent = document.createDocumentFragment();
        while (td.firstChild) {
          cellContent.appendChild(td.firstChild);
        }
        rowCells.push(cellContent);
      }
      if (rowCells.length > 0) {
        cells.push(rowCells);
      }
    }

    const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
    element.replaceWith(block);
    return;
  }

  // Pattern 2: Feature tiles (feature columns in section 3)
  // Found in DOM: div.block-content > div.c-feature-tile.has-button
  const tiles = element.querySelectorAll('div.block-content > div.c-feature-tile, div.c-feature-tile');
  if (tiles.length > 0) {
    const rowCells = [];
    for (const tile of tiles) {
      const cellContent = document.createDocumentFragment();

      // Image: div.feature-content > img.feature-image
      const img = tile.querySelector('img.feature-image');
      if (img) {
        const picture = document.createElement('picture');
        const newImg = document.createElement('img');
        newImg.src = img.src;
        newImg.alt = img.alt || '';
        picture.appendChild(newImg);
        cellContent.appendChild(picture);
      }

      // Heading: div.content-wrapper > h3.feature-heading
      const heading = tile.querySelector('h3.feature-heading, h3');
      if (heading) {
        const h3 = document.createElement('h3');
        h3.textContent = heading.textContent.trim();
        cellContent.appendChild(h3);
      }

      // Description: div.content-wrapper > div.feature-content (inner)
      const contentWrapper = tile.querySelector('div.content-wrapper');
      if (contentWrapper) {
        const descDiv = contentWrapper.querySelector('div.feature-content');
        if (descDiv) {
          const p = document.createElement('p');
          // Get text content only (skip nested links which are footnotes)
          const textNodes = [];
          for (const node of descDiv.childNodes) {
            if (node.nodeType === 3) {
              const text = node.textContent.trim();
              if (text) textNodes.push(text);
            }
          }
          if (textNodes.length > 0) {
            p.textContent = textNodes.join(' ');
            cellContent.appendChild(p);
          }
        }
      }

      // CTA: a.featur-btn (note: typo in source is "featur" not "feature")
      const cta = tile.querySelector('a.featur-btn, a.btn-skin-2.btn-icon');
      if (cta) {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = cta.href;
        link.textContent = cta.textContent.trim();
        p.appendChild(link);
        cellContent.appendChild(p);
      }

      rowCells.push(cellContent);
    }

    if (rowCells.length > 0) {
      cells.push(rowCells);
    }

    const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
    element.replaceWith(block);
    return;
  }

  // Fallback: no matching pattern found, create empty block
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: [['']] });
  element.replaceWith(block);
}
