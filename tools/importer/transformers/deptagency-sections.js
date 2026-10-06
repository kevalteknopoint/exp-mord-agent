/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: DEPT Agency section breaks.
 * Inserts <hr> section breaks based on template section definitions from payload.template.sections.
 * All selectors verified against captured DOM of https://www.deptagency.com/en-in/ (cleaned.html)
 *
 * Sections (from page-templates.json):
 *   1. Hero Video Intro - .block-scrolly-video-intro
 *   2. Statement - .block-statement-v2
 *   3. Adobe Partner Feature - .block-assets-and-copy:not(.has-less-t-space)
 *   4. Work Listing - .block-work-listing
 *   5. Solutions / Talking Points - .block-talking-points
 *   6. Growth Invention Framework - .block-assets-and-copy.has-less-t-space
 *   7. Culture Carousel - .block-feature-turntable
 *   8. On Our Mind / Insights - .block-custom-listing
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element };
    const doc = element.ownerDocument || document;
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid offset issues when inserting elements
    const reversedSections = [...sections].reverse();

    for (const section of reversedSections) {
      // Skip the first section (no <hr> before it)
      if (section.id === 'section-1' || sections.indexOf(section) === 0) continue;

      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Insert <hr> before the section element to create a section break
      const hr = doc.createElement('hr');
      sectionEl.before(hr);

      // If section has a style, insert Section Metadata block after the section content
      if (section.style) {
        const block = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        // Find the next section or end of content to place section metadata before it
        const nextSectionIndex = sections.indexOf(section) + 1;
        if (nextSectionIndex < sections.length) {
          const nextSectionEl = element.querySelector(sections[nextSectionIndex].selector);
          if (nextSectionEl) {
            nextSectionEl.before(block);
          } else {
            sectionEl.parentNode.appendChild(block);
          }
        } else {
          sectionEl.parentNode.appendChild(block);
        }
      }
    }
  }
}
