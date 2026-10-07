/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: /kotak-life (+ /kotak-nav, /kotak-footer) sections.
 * Source: migration-work/design-kotak/source/*.html (semantic sources written from the design images)
 *
 * beforeTransform: inserts a section break (<hr>) before every section except the first, while all
 *                  section elements still exist (before block parsers run). Outline CTAs
 *                  (p.cta-outline) are wrapped in <em> so they become secondary buttons.
 * afterTransform:  appends a Section Metadata block (style) to each section that has one. Parsers keep the
 *                  <section> wrappers (they only replace their inner instance elements), so the selectors
 *                  still resolve after parsing. Also unwraps the decorative <header class="section-intro">
 *                  wrappers so the heading and intro paragraph become plain default content.
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
    element.querySelectorAll('p.cta-outline > a').forEach((a) => {
      const em = doc.createElement('em');
      a.replaceWith(em);
      em.append(a);
    });
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
