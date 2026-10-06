/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-culture
 * Base block: carousel
 * Source: https://www.deptagency.com/en-in/
 * Selector: .block-feature-turntable
 * Generated: 2026-05-25
 *
 * Container block - each slide becomes one row.
 * UE Model fields per item:
 *   - media_image (reference) + media_imageAlt (collapsed)
 *   - content_text (richtext)
 */
export default function parse(element, { document }) {
  // Each slide item contains: title, image, description
  const slides = element.querySelectorAll('.block-feature-turntable__slide .block-feature-turntable__item');

  const cells = [];

  slides.forEach((slide) => {
    // Extract image (media_image field + collapsed media_imageAlt)
    const image = slide.querySelector('img.block-feature-turntable__item-image');

    // Extract title (part of content_text richtext field)
    const title = slide.querySelector('.block-feature-turntable__item-title');

    // Extract description (part of content_text richtext field)
    const description = slide.querySelector('.block-feature-turntable__item-description');

    // Column 1: media_image with field hint
    const mediaFrag = document.createDocumentFragment();
    mediaFrag.appendChild(document.createComment(' field:media_image '));
    if (image) {
      mediaFrag.appendChild(image);
    }

    // Column 2: content_text (richtext combining title + description) with field hint
    const contentFrag = document.createDocumentFragment();
    contentFrag.appendChild(document.createComment(' field:content_text '));
    if (title) {
      contentFrag.appendChild(title);
    }
    if (description) {
      contentFrag.appendChild(description);
    }

    // Each slide is a row with two columns: [media_image, content_text]
    cells.push([mediaFrag, contentFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-culture', cells });
  element.replaceWith(block);
}
