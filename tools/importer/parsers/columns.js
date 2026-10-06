/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns variant.
 * Base block: columns
 * Selector: section.main_content .row
 * Generated: 2026-04-30
 *
 * Source structure: .row containing pairs of col-lg-7 and col-lg-5 divs.
 * Each div contains an h3 (label) and p (value) representing project details.
 * Pairs are grouped into rows of the Columns block table.
 *
 * xwalk note: Columns blocks do NOT require field hint comments per hinting rules.
 */
export default function parse(element, { document }) {
  // Select all column divs within the .row container
  const columnDivs = Array.from(element.querySelectorAll(':scope > div[class*="col-"]'));

  // Group divs into pairs (left col-lg-7, right col-lg-5)
  const cells = [];
  for (let i = 0; i < columnDivs.length; i += 2) {
    const leftDiv = columnDivs[i];
    const rightDiv = columnDivs[i + 1];

    // Build left cell content
    const leftContent = [];
    if (leftDiv) {
      const leftHeading = leftDiv.querySelector('h3');
      const leftParagraph = leftDiv.querySelector('p');
      if (leftHeading) leftContent.push(leftHeading);
      if (leftParagraph) leftContent.push(leftParagraph);
    }

    // Build right cell content
    const rightContent = [];
    if (rightDiv) {
      const rightHeading = rightDiv.querySelector('h3');
      const rightParagraph = rightDiv.querySelector('p');
      if (rightHeading) rightContent.push(rightHeading);
      if (rightParagraph) rightContent.push(rightParagraph);
    }

    // Only add row if at least one cell has content
    if (leftContent.length > 0 || rightContent.length > 0) {
      cells.push([leftContent, rightContent]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
