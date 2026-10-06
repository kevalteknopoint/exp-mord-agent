/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form variant.
 * Base block: form
 * Selector: .ceat-makemodel-search-v2
 * Source: https://www.ceat.com/
 * Generated: 2026-05-07
 *
 * Tyre finder search form - migrated as a Form block referencing /forms/tyre-finder.
 * UE Model fields: reference (aem-content), action (text/string)
 */
export default function parse(element, { document }) {
  // For EDS, forms are referenced by path rather than embedding the full form HTML.
  // Create a link element pointing to the form definition path.
  const formLink = document.createElement('a');
  formLink.href = '/forms/tyre-finder';
  formLink.textContent = '/forms/tyre-finder';

  // Build cells matching the UE model:
  // Row 1: reference field (aem-content) - link to the form definition
  const cells = [];

  // Row 1: reference - form path reference
  const referenceFragment = document.createDocumentFragment();
  referenceFragment.appendChild(document.createComment(' field:reference '));
  referenceFragment.appendChild(formLink);
  cells.push([referenceFragment]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
