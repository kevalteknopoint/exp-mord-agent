/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-faq
 * Base block: accordion
 * Source: https://www.ceat.com/
 * Generated: 2026-05-07
 *
 * Container block - each FAQ item becomes one row with two columns:
 *   Column 1: summary (question heading text)
 *   Column 2: text (answer richtext content)
 *
 * Source structure:
 *   .cmp-accordion__item
 *     h3.cmp-accordion__header > button.cmp-accordion__button > span.cmp-accordion__title
 *     .cmp-accordion__panel > .responsivegrid > .aem-Grid > .text.parbase > p (may contain links)
 *
 * UE Model fields (accordion-faq-item):
 *   - summary (text/string): The FAQ question
 *   - text (richtext/string): The FAQ answer
 */
export default function parse(element, { document }) {
  // Find all accordion items within the .cmp-accordion container
  const accordionItems = element.querySelectorAll('.cmp-accordion__item');

  const cells = [];

  accordionItems.forEach((item) => {
    // Extract question text from .cmp-accordion__title
    const titleSpan = item.querySelector('.cmp-accordion__title');
    const questionText = titleSpan ? titleSpan.textContent.trim() : '';

    // Extract answer content from .cmp-accordion__panel
    const panel = item.querySelector('.cmp-accordion__panel');

    // Build summary cell with field hint
    const summaryFrag = document.createDocumentFragment();
    summaryFrag.appendChild(document.createComment(' field:summary '));
    if (questionText) {
      summaryFrag.appendChild(document.createTextNode(questionText));
    }

    // Build text cell with field hint - preserve richtext (paragraphs, links)
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (panel) {
      // Get all paragraph elements from the panel content
      const paragraphs = panel.querySelectorAll('.text.parbase p, .text p, p');
      if (paragraphs.length > 0) {
        paragraphs.forEach((p) => {
          textFrag.appendChild(p.cloneNode(true));
        });
      } else {
        // Fallback: use panel text content if no paragraphs found
        const panelText = panel.textContent.trim();
        if (panelText) {
          textFrag.appendChild(document.createTextNode(panelText));
        }
      }
    }

    // Each accordion item is one row with two columns: [summary, text]
    cells.push([summaryFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
