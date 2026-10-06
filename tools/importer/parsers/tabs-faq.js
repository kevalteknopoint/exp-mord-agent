/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-faq. Base: tabs.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .faq-tabs
 *
 * Model: tabs-faq (block: title) + tabs-faq-item (title | text)
 *   row 1   : single cell - collapsible block title ("Term insurance FAQs")
 *   rows 2+ : tab label | rich text (question headings h3 + answer paragraphs / lists)
 * Validated selectors (source.html + cleaned.html context):
 *   ol.cmp-tabs__tablist > li.cmp-tabs__tab (labels), .cmp-tabs__tabpanel .cmp-text > * (Q&A content),
 *   h3 > span.lead ("1." manual number - dropped, the block numbers questions automatically),
 *   title: enclosing .cmp-accordion__item .cmp-accordion__title (the wrapping AEM accordion header is
 *   consumed into the block so it is not duplicated as default content).
 */
function clean(t) {
  return (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const labels = [...element.querySelectorAll('.cmp-tabs__tablist > .cmp-tabs__tab, [role="tab"]')];
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')];

  const cells = [];

  // Block title from the wrapping accordion item header
  const accItem = element.closest('.cmp-accordion__item');
  const header = accItem ? accItem.querySelector(':scope > .cmp-accordion__header') : null;
  const titleText = clean(header ? (header.querySelector('.cmp-accordion__title') || header).textContent : '');
  if (titleText) {
    const frag = document.createDocumentFragment();
    frag.append(document.createComment(' field:title '), document.createTextNode(titleText));
    cells.push([frag]);
  }

  panels.forEach((panel, i) => {
    const label = clean(labels[i] ? labels[i].textContent : '') || `Tab ${i + 1}`;
    const content = [];
    const roots = panel.querySelectorAll('.cmp-text');
    (roots.length ? [...roots] : [panel]).forEach((root) => {
      [...root.children].forEach((child) => {
        if (!clean(child.textContent)) return;
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document.createElement('h3');
          const c = child.cloneNode(true);
          c.querySelectorAll('.lead').forEach((s) => { if (/^\d+\.?$/.test(clean(s.textContent))) s.remove(); });
          h.innerHTML = c.innerHTML;
          h.innerHTML = h.innerHTML.trim();
          content.push(h);
        } else content.push(child);
      });
    });
    if (!content.length) return;

    const labelCell = document.createDocumentFragment();
    labelCell.append(document.createComment(' field:title '), document.createTextNode(label));
    const textCell = document.createDocumentFragment();
    textCell.append(document.createComment(' field:text '));
    content.forEach((n) => textCell.append(n));
    cells.push([labelCell, textCell]);
  });

  if (!cells.length || (titleText && cells.length === 1)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-faq', cells });
  if (header) header.remove();
  element.replaceWith(block);
}
