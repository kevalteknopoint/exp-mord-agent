/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Tata AIA sections.
 * Inserts section breaks (<hr>) and Section Metadata blocks from payload.template.sections.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Section selectors come from page-templates.json (verified against migration-work/cleaned.html).
 *
 * Breaks are inserted in beforeTransform (while every section element still exists, before
 * block parsers replace them); Section Metadata is added in afterTransform, anchored to a marker
 * attribute on the inserted <hr>. Sections are processed in reverse order so DOM insertions never
 * shift sections not yet processed. Section-1 (.breadcrumb, removed by tataaia-cleanup in
 * afterTransform) is first and unstyled, so it gets neither a break nor metadata.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors - first match wins.
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
  if (sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue;
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      // Directly after the section's leading <hr> = inside that section, regardless of
      // how deeply the section anchors are nested.
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
