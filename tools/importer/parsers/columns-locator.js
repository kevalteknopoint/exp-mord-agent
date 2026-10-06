/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-locator
 * Base block: columns
 * Source: https://www.ceat.com/
 * Generated: 2026-05-07
 *
 * Store locator block with two columns:
 * - Left: Stats (400+ CEAT Exclusive Outlets, 3400+ Active Tyre Dealers) + background image
 * - Right: Pincode search area + city links (Chennai, Hyderabad, Bengaluru, Mumbai, Delhi, Pune)
 *
 * Columns blocks are EXEMPT from field hints per xwalk hinting rules.
 */
export default function parse(element, { document }) {
  // === LEFT COLUMN: Stats + background image ===
  const leftCol = document.createElement('div');

  // Extract stat items from .cmp-teaser__content divs
  const statContents = element.querySelectorAll('.cmp-teaser__content');
  statContents.forEach((statBlock) => {
    const heading = statBlock.querySelector('h2');
    const description = statBlock.querySelector('p, .cmp-teaser__description p');
    if (heading) leftCol.appendChild(heading);
    if (description) leftCol.appendChild(description);
  });

  // Extract background image (picture element or standalone img)
  const picture = element.querySelector('.shop-teaser picture');
  if (picture) {
    leftCol.appendChild(picture);
  } else {
    const bgImg = element.querySelector('.shop-teaser img[alt]');
    if (bgImg) leftCol.appendChild(bgImg);
  }

  // === RIGHT COLUMN: Pincode search + city links ===
  const rightCol = document.createElement('div');

  // Pincode search description text
  const pincodeText = element.querySelector('.enter-near-shop-title');
  if (pincodeText) rightCol.appendChild(pincodeText);

  // Doorstep service label
  const tabLabel = element.querySelector('.tab-label');
  if (tabLabel) {
    const labelP = document.createElement('p');
    labelP.textContent = tabLabel.textContent.trim();
    rightCol.appendChild(labelP);
  }

  // City links from tab list
  const cityLinks = element.querySelectorAll('.cmp-tabs__tab a.state-link');
  if (cityLinks.length > 0) {
    const cityList = document.createElement('p');
    cityLinks.forEach((link, index) => {
      const a = document.createElement('a');
      a.href = link.href || link.getAttribute('href');
      a.textContent = link.textContent.trim();
      cityList.appendChild(a);
      if (index < cityLinks.length - 1) {
        cityList.appendChild(document.createTextNode(' | '));
      }
    });
    rightCol.appendChild(cityList);
  }

  // Build cells: 2 columns, 1 row (as per block model: columns=2, rows=1)
  const cells = [
    [leftCol, rightCol],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-locator', cells });
  element.replaceWith(block);
}
