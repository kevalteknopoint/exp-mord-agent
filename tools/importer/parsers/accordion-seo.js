/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-seo. Base: accordion.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selectors:
 *   .faq-accordion-investment-plan .ta-fq-content-w                                   (numbered FAQ lists)
 *   .accordion-first-section > .cmp-accordion > .cmp-accordion__item:nth-of-type(2)   ("Disclaimer" panel)
 *
 * Model (accordion-seo-item): summary | text -> one row per item, 2 columns
 * Validated selectors (source.html):
 *   Shape A: li.ta-fq-content-li > .ta-fq-content-qtext h3 (question, span.faqnumber prefix),
 *            .ta-fq-ans-m .ta-para > * (answer)
 *   Shape B: .cmp-accordion__item > .cmp-accordion__header .cmp-accordion__title (title),
 *            .cmp-accordion__panel .cmp-text > * (body)
 * Items hidden behind "view more" (li.list_display_none) are still content and are kept.
 */
function hinted(document, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function bodyNodes(container) {
  if (!container) return [];
  const out = [];
  [...container.children].forEach((child) => {
    if (child.matches('.ta-para, .cmp-text, .text, .leadproxytext, .ta-fq-ans-m')) {
      out.push(...bodyNodes(child));
      return;
    }
    const text = child.textContent.replace(/ /g, ' ').trim();
    if (!text && !child.querySelector('img, table, iframe')) return;
    out.push(child);
  });
  return out;
}

function cleanText(el) {
  return el ? el.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : '';
}

export default function parse(element, { document }) {
  const items = [];

  // Shape A: numbered FAQ list
  element.querySelectorAll('li.ta-fq-content-li').forEach((li) => {
    const q = li.querySelector('.ta-fq-content-qtext h1, .ta-fq-content-qtext h2, .ta-fq-content-qtext h3, .ta-fq-content-qtext h4, .ta-fq-content-qtext')
      || li.querySelector('.ta-fq-content-q');
    const a = li.querySelector('.ta-fq-ans-m') || li.querySelector('.ta-fq-ans-w');
    items.push({ summary: cleanText(q), body: bodyNodes(a) });
  });

  // Shape B: AEM core accordion item(s)
  if (!items.length) {
    const accItems = element.matches('.cmp-accordion__item')
      ? [element]
      : [...element.querySelectorAll('.cmp-accordion__item')];
    accItems.forEach((item) => {
      const title = item.querySelector('.cmp-accordion__title') || item.querySelector('.cmp-accordion__header, button');
      const panel = item.querySelector('.cmp-accordion__panel');
      items.push({ summary: cleanText(title), body: bodyNodes(panel) });
    });
  }

  const cells = [];
  items.forEach(({ summary, body }) => {
    if (!summary && !body.length) return;
    cells.push([
      summary ? hinted(document, 'summary', document.createTextNode(summary)) : '',
      hinted(document, 'text', body),
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-seo', cells });
  element.replaceWith(block);
}
