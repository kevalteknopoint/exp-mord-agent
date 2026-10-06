/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-stats.
 * Base: columns. Source: https://www.yes.bank.in/
 * Extracts stat counters from .lists-infos (1,563 Branches, 9.7M Customers, 1,350+ ATMs)
 * Note: Columns blocks do NOT require field hints (per xwalk rules)
 */
export default function parse(element, { document }) {
  const cells = [];
  const statItems = element.querySelectorAll('h2, [class*="stat"]');
  const row = [];

  // Each stat is an h2 (value) followed by a p (label)
  statItems.forEach((item) => {
    const cell = document.createDocumentFragment();
    const value = document.createElement('h2');
    value.textContent = item.textContent.trim();
    cell.appendChild(value);

    const nextSibling = item.nextElementSibling;
    if (nextSibling && (nextSibling.tagName === 'P' || nextSibling.tagName === 'SPAN')) {
      const label = document.createElement('p');
      label.textContent = nextSibling.textContent.trim();
      cell.appendChild(label);
    }

    row.push(cell);
  });

  if (row.length > 0) {
    cells.push(row);
  } else {
    // Fallback: treat all children as separate columns
    const children = Array.from(element.children);
    const fallbackRow = children.map((child) => {
      const cell = document.createDocumentFragment();
      cell.appendChild(child.cloneNode(true));
      return cell;
    });
    if (fallbackRow.length > 0) cells.push(fallbackRow);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stats', cells });
  element.replaceWith(block);
}
