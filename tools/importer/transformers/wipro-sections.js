/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Wipro section breaks and section metadata.
 * Inserts <hr> section breaks and Section Metadata blocks based on template sections.
 * All selectors verified against migration-work/cleaned.html captured DOM.
 *
 * Template sections (8 total, 7 with styles):
 *   section-1: .homepagetextandimage (dark-purple)
 *   section-2: .banner.teaser.banner--content-center (dark)
 *   section-3: .splitparsys (dark)
 *   section-4: .teaser.teaser--full-size.teaser--card (dark)
 *   section-5: .homepagetwocolumn (dark)
 *   section-6: .homepagequicklinks (dark)
 *   section-7: .sustainability-text (light)
 *   section-8: .mktoform2 (no style)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid position shifts
    const reversedSections = [...sections].reverse();

    for (const section of reversedSections) {
      if (!section.selector) continue;

      // Find the first element matching the section selector
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Insert Section Metadata block after the section element if it has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before each section except the first
      if (section.id !== sections[0].id) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
