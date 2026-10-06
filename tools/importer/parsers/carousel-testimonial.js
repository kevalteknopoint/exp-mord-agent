/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-testimonial
 * Base block: carousel
 * Selector: section.video-testimonials
 * Model: carousel-testimonial-item (container block)
 * Fields: media_image (reference), media_imageAlt (collapsed), content_text (richtext)
 * Generated: 2026-05-07
 */
export default function parse(element, { document }) {
  // Each swiper-slide is one testimonial card (one row in the container block)
  const slides = element.querySelectorAll('.swiper-slide');

  const cells = [];

  slides.forEach((slide) => {
    // Extract image from the testimonial (product image or background)
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-teaser img, img');

    // Extract text content: label, quote, reviewer name, product name
    const pretitle = slide.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
    const title = slide.querySelector('.cmp-teaser__title, [class*="teaser__title"]');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
    const reviewer = slide.querySelector('.cmp-teaser__reviewer, .reviewer-name, [class*="reviewer"]');
    const product = slide.querySelector('.cmp-teaser__product, .product-name, [class*="product"]');

    // Build the image cell with field hint (media_image group)
    // Per hinting rules: only add field comment when content is present
    const imageCell = document.createDocumentFragment();
    if (image) {
      const imageComment = document.createComment(' field:media_image ');
      imageCell.appendChild(imageComment);
      imageCell.appendChild(image);
    }

    // Build the content cell with field hint (content_text group)
    const contentCell = document.createDocumentFragment();
    const contentComment = document.createComment(' field:content_text ');
    contentCell.appendChild(contentComment);

    // Assemble rich text content: pretitle, quote, reviewer, product
    if (pretitle) contentCell.appendChild(pretitle);
    if (title) contentCell.appendChild(title);
    if (description) contentCell.appendChild(description);
    if (reviewer) contentCell.appendChild(reviewer);
    if (product) contentCell.appendChild(product);

    // Each slide is one row with two columns: [image, content]
    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-testimonial', cells });
  element.replaceWith(block);
}
