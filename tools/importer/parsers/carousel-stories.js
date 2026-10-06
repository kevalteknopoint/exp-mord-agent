/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-stories
 * Base block: carousel
 * Source: CEAT corporate homepage - Instagram-style stories carousel
 * UE Model: carousel-stories-item (fields: media_image, media_imageAlt [collapsed], content_text)
 * Generated: 2026-05-07
 */
export default function parse(element, { document }) {
  // Each swiper-slide is a story item (container block pattern: each child = one row)
  const slides = element.querySelectorAll('.swiper-slide');
  const cells = [];

  slides.forEach((slide) => {
    // Extract thumbnail image (media_image field; media_imageAlt is collapsed into img alt)
    const thumbnail = slide.querySelector('img.crosstrail-each-storie-img, img[class*="storie-img"]');

    // Build media cell with field hint
    const mediaFrag = document.createDocumentFragment();
    mediaFrag.appendChild(document.createComment(' field:media_image '));
    if (thumbnail) {
      mediaFrag.appendChild(thumbnail);
    }

    // Build content cell with field hint
    // The play button indicates video content; use it as text content placeholder
    const contentFrag = document.createDocumentFragment();
    contentFrag.appendChild(document.createComment(' field:content_text '));
    const playBtn = slide.querySelector('img.stories-play-button, img[class*="play-button"]');
    if (playBtn) {
      // Indicate video content via the play button image
      contentFrag.appendChild(playBtn);
    }

    // Each row = one slide with two columns: media | content
    cells.push([mediaFrag, contentFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-stories', cells });
  element.replaceWith(block);
}
