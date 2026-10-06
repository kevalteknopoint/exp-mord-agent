/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-banner
 * Base block: cards
 * Source: https://www.ceat.com/
 * Selector: .banner-teaser.banner-card-campaign
 * Generated: 2026-05-07
 *
 * UE Model: container block (cards) with child items (card)
 * Card fields: image (reference), text (richtext)
 * Collapsed fields (skipped): imageAlt, imageTitle, imageText, imageMimeType, imageType
 *
 * Source structure:
 *   div.banner-teaser.banner-card-campaign
 *     div.cmp-teaser
 *       div.cmp-teaser__content
 *         h2.cmp-teaser__title
 *         div.cmp-teaser__description > p
 *         div.cmp-teaser__action-container > a.cmp-teaser__action-link (multiple)
 *       picture > source.lozad (lazy-loaded background image)
 */
export default function parse(element, { document }) {
  // Extract image - the banner has a picture element with lazy-loaded source
  const picture = element.querySelector('picture');

  // Extract text content: heading, description, and CTA links
  const heading = element.querySelector('.cmp-teaser__title, h2, h1, [class*="title"]');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));

  // Build the text cell content with field hint
  // UE model: card has "image" and "text" fields
  // Container block: each card item = one row with columns for each field
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (picture) {
    imageCell.appendChild(picture);
  }

  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) {
    textCell.appendChild(heading);
  }
  if (description) {
    textCell.appendChild(description);
  }
  ctaLinks.forEach((link) => {
    textCell.appendChild(link);
  });

  // Build cells array - container block: one row per card item, columns = fields
  const cells = [
    [imageCell, textCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-banner', cells });
  element.replaceWith(block);
}
