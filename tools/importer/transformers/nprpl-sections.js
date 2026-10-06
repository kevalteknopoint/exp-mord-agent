/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NPRPL sections.
 * Adds section breaks (<hr>) and Section Metadata blocks based on template sections.
 * Selectors verified from captured DOM (migration-work/cleaned.html):
 *   - section.main-banner (Hero Banner Carousel, no style)
 *   - section.main_content (Project Details, style: light)
 */

export default function transform(hookName, element, payload) {
  if (hookName === 'afterTransform') {
    const { document } = payload;
    const sections = payload.template.sections;

    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to preserve DOM positions
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);

      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.append(metadataBlock);
      }

      // Add <hr> before non-first sections to create section breaks
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
