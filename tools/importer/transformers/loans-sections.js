/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: /loans sections.
 * Source: migration-work/design-loans/source/loans.html (semantic source written from the design image)
 *
 * beforeTransform: inserts a section break (<hr>) before every section except the first, while all
 *                  section elements still exist (before block parsers run).
 * afterTransform:  appends a Section Metadata block (style) to each section element. Parsers keep the
 *                  <section> wrappers (they only replace their inner instance elements), so the
 *                  selectors still resolve after parsing.
 *                  Also unwraps the decorative <header class="section-intro"> wrappers so the eyebrow
 *                  and heading become plain default content.
 */
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (!sections.length) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    sections.forEach((section, i) => {
      if (i === 0) return;
      const el = querySection(element, section.selector);
      if (el) el.before(doc.createElement('hr'));
    });
  }

  if (hookName === 'afterTransform') {
    sections.forEach((section) => {
      const el = querySection(element, section.selector);
      if (!el) return;
      el.querySelectorAll('header.section-intro').forEach((h) => h.replaceWith(...h.childNodes));
      if (!section.style) return;
      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      el.append(metadata);
    });
  }
}
