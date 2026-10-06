/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-feature
 * Base block: columns
 * Source selector: .block-assets-and-copy
 * Source: https://www.deptagency.com/en-in/
 * Generated: 2026-05-25
 *
 * Columns block with side-by-side layout: image column + text/CTA column.
 * xwalk project - Columns blocks do NOT require field hint comments per hinting rules.
 */
export default function parse(element, { document }) {
  // Column 1: Image
  const image = element.querySelector('img.block-assets-and-copy__media, img[class*="assets-and-copy__media"], img');

  // Column 2: Text content (title + description + CTA)
  const title = element.querySelector('.block-assets-and-copy__title, p[class*="title"], .text-sans-48');
  const contentContainer = element.querySelector('.block-assets-and-copy__content, div[class*="content"]');
  const description = contentContainer
    ? contentContainer.querySelector('p.block-assets-and-copy__text, p[class*="text-sans-24"], p')
    : element.querySelector('p.block-assets-and-copy__text, p[class*="text-sans-24"]');
  const ctaLinks = contentContainer
    ? Array.from(contentContainer.querySelectorAll('a.button-v2, a[class*="button"], a'))
    : Array.from(element.querySelectorAll('a.button-v2, a[class*="button"]'));

  // Build column 1 content (image)
  const col1 = [];
  if (image) {
    col1.push(image);
  }

  // Build column 2 content (text + CTA)
  const col2 = [];
  if (title) {
    // Convert p.title to a heading for semantic structure
    const heading = document.createElement('h2');
    heading.textContent = title.textContent;
    col2.push(heading);
  }
  if (description) {
    col2.push(description);
  }
  if (ctaLinks.length > 0) {
    ctaLinks.forEach((link) => col2.push(link));
  }

  // Cells: single row with two columns (image | text+CTA)
  const cells = [
    [col1, col2],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
