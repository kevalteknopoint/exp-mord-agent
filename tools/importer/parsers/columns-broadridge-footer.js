/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the /broadridge-footer Columns block. Base block: columns (no variant).
 * Source: migration-work/design-broadridge/source/broadridge-footer.html
 * Instance selector: .footer-columns  (div.footer-brand | div.footer-links)
 *
 * One row, two columns: column 1 = brand (logo, about, stock line, social list, global websites, copyright),
 * column 2 = Company Info list, Industries list, legal links list.
 * xwalk note: Columns blocks do NOT require field hint comments.
 */
export default function parse(element, { document }) {
  const columns = [...element.querySelectorAll(':scope > div')].map((col) => {
    const frag = document.createDocumentFragment();
    [...col.children].forEach((child) => frag.append(child));
    return frag;
  });
  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells: [columns] });
  element.replaceWith(block);
}
