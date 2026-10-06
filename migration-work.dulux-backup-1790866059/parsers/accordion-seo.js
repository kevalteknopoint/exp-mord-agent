/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-seo
 * Base block: accordion
 * Source: https://www.ceat.com/
 * Generated: 2026-05-07
 *
 * Container block - each SEO accordion item becomes one row with two columns:
 *   Column 1: summary (heading text for the accordion item)
 *   Column 2: text (richtext content for the accordion item)
 *
 * Source structure:
 *   .seo-accordion-container
 *     .seo-accordion-item (main wrapper)
 *       .seo-accordion-header.seo-header > h3 (main title)
 *       .seo-accordion-content
 *         p.seo-accordion-content-sub (intro paragraph)
 *         .seo-nested-accordion
 *           .seo-accordion-item (repeated)
 *             .seo-accordion-header.seo-accordion-header-sub > h4/h3 (sub-section heading)
 *             p.seo-accordion-content-sub (sub-section content)
 *
 * UE Model fields (accordion-seo-item):
 *   - summary (text/string): The accordion item heading
 *   - text (richtext/string): The accordion item body content
 */
export default function parse(element, { document }) {
  const cells = [];

  // Strategy: Extract the main title + intro as the first item,
  // then each nested accordion item as subsequent items.

  // 1. Extract main title from .seo-accordion-header.seo-header
  const mainHeader = element.querySelector('.seo-accordion-header.seo-header');
  const mainHeading = mainHeader ? mainHeader.querySelector('h3, h2, h4') : null;
  const mainTitle = mainHeading ? mainHeading.textContent.trim() : '';

  // 2. Extract intro paragraph from .seo-accordion-content > p.seo-accordion-content-sub (direct child)
  const mainContent = element.querySelector('.seo-accordion-content');
  const introParagraph = mainContent ? mainContent.querySelector(':scope > p.seo-accordion-content-sub, :scope > p') : null;

  // Add main title + intro as first row
  if (mainTitle) {
    const summaryFrag = document.createDocumentFragment();
    summaryFrag.appendChild(document.createComment(' field:summary '));
    summaryFrag.appendChild(document.createTextNode(mainTitle));

    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (introParagraph) {
      textFrag.appendChild(introParagraph.cloneNode(true));
    }

    cells.push([summaryFrag, textFrag]);
  }

  // 3. Extract nested accordion items from .seo-nested-accordion
  const nestedAccordion = element.querySelector('.seo-nested-accordion');
  if (nestedAccordion) {
    const nestedItems = nestedAccordion.querySelectorAll(':scope > .seo-accordion-item');

    nestedItems.forEach((item) => {
      // Extract sub-section heading
      const subHeader = item.querySelector('.seo-accordion-header, .seo-accordion-header-sub');
      const subHeading = subHeader ? subHeader.querySelector('h3, h4, h2, h5') : null;
      const subTitle = subHeading ? subHeading.textContent.trim() : (subHeader ? subHeader.textContent.trim() : '');

      // Extract sub-section content - look for paragraph content
      const subContent = item.querySelector('p.seo-accordion-content-sub, .seo-accordion-content p, p');

      // Build summary cell with field hint
      const summaryFrag = document.createDocumentFragment();
      summaryFrag.appendChild(document.createComment(' field:summary '));
      if (subTitle) {
        summaryFrag.appendChild(document.createTextNode(subTitle));
      }

      // Build text cell with field hint - preserve richtext
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(' field:text '));
      if (subContent) {
        textFrag.appendChild(subContent.cloneNode(true));
      } else {
        // Fallback: look for any text content in the item beyond the header
        const allParagraphs = item.querySelectorAll('p');
        allParagraphs.forEach((p) => {
          textFrag.appendChild(p.cloneNode(true));
        });
      }

      cells.push([summaryFrag, textFrag]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-seo', cells });
  element.replaceWith(block);
}
