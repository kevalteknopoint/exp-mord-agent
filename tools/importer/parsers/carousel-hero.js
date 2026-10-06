/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-hero
 * Base block: carousel
 * Source: https://www.ceat.com/
 * Selector: .hero-banner-teaser
 * Type: xwalk container block (each slide = one row, two columns: media + content)
 * Model fields per item: media_image (+ media_imageAlt collapsed), content_text
 * Generated: 2026-05-07
 */
export default function parse(element, { document }) {
  // element is the parent container (.hero-banner-teaser) holding all carousel slides
  const slides = element.querySelectorAll('.banner-carousel-teaser');

  const cells = [];

  slides.forEach((slide) => {
    // Extract image: <picture> element with responsive <source> srcsets
    // The <img> src is often empty due to lazy loading; fix it from a valid source URL
    const picture = slide.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img && (!img.getAttribute('src') || img.getAttribute('src') === '')) {
        // Find a valid full URL from source elements (srcset or data-srcset)
        const sources = picture.querySelectorAll('source');
        let resolvedSrc = '';
        for (let i = sources.length - 1; i >= 0; i--) {
          const srcset = sources[i].getAttribute('srcset') || '';
          const dataSrcset = sources[i].getAttribute('data-srcset') || '';
          // Prefer srcset that starts with http (full URL)
          if (srcset.startsWith('http')) {
            resolvedSrc = srcset.split(',')[0].trim().split(' ')[0];
            break;
          }
          if (!resolvedSrc && dataSrcset.startsWith('http')) {
            resolvedSrc = dataSrcset.split(',')[0].trim().split(' ')[0];
          }
        }
        if (resolvedSrc) {
          img.setAttribute('src', resolvedSrc);
        }
      }
    }

    // Extract optional link (some slides wrap content in a.cmp-teaser__link)
    const link = slide.querySelector('a.cmp-teaser__link, .cmp-teaser__action-link, .cmp-teaser__action-container a');

    // Build media cell with field hint
    const mediaFrag = document.createDocumentFragment();
    mediaFrag.appendChild(document.createComment(' field:media_image '));
    if (picture) {
      mediaFrag.appendChild(picture.cloneNode(true));
    }

    // Build content cell - only add field hint if there is actual content
    // Per hinting rules: NEVER add hints for empty cells
    const contentFrag = document.createDocumentFragment();
    if (link) {
      contentFrag.appendChild(document.createComment(' field:content_text '));
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = link.textContent.trim() || link.getAttribute('href');
      contentFrag.appendChild(a);
    }

    // Each slide = one row with two columns: [media, content]
    cells.push([mediaFrag, contentFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
