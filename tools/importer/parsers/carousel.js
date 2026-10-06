/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel
 * Base block: carousel
 * Container block: each slide (carousel-item) = one row with 2 columns
 * UE Model fields per item:
 *   - media_image (reference) + media_imageAlt (collapsed Alt suffix)
 *   - content_text (richtext)
 * Selector: .bootstrape-carousel .bootstrape-item:not(.cloned) .item
 * Generated: 2026-04-30
 */
export default function parse(element, { document }) {
  // This parser is called once per .item element.
  // Each .item becomes one row in the carousel container block.
  // Fields: media_ group (image) | content_ group (heading + CTA)

  // Extract the slide background image
  const image = element.querySelector('picture, img.img-fluid, img[class*="img-fluid"], img');

  // Extract heading from banner_content
  const heading = element.querySelector('.banner_content h1, .banner_content h2, .banner_content h3, .banner_content [class*="title"]');

  // Extract CTA link from banner_content
  const cta = element.querySelector('.banner_content a.btn, .banner_content a.btn-gradient, .banner_content a[class*="btn"], .banner_content a');

  // Build the media cell (column 1): image with field hint
  const mediaCell = document.createDocumentFragment();
  mediaCell.appendChild(document.createComment(' field:media_image '));
  if (image) {
    mediaCell.appendChild(image);
  }

  // Build the content cell (column 2): heading + CTA with field hint
  const contentCell = document.createDocumentFragment();
  contentCell.appendChild(document.createComment(' field:content_text '));
  if (heading) {
    contentCell.appendChild(heading);
  }
  if (cta) {
    contentCell.appendChild(cta);
  }

  // Each slide item is one row with 2 columns [media | content]
  const cells = [
    [mediaCell, contentCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
