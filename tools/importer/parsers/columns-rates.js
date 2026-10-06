/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-rates.
 * Base: columns. Source: https://www.yes.bank.in/
 * Extracts savings account and FD rate display from .right-content
 * Note: Columns blocks do NOT require field hints (per xwalk rules)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Savings Account column
  const savingsTitle = element.querySelector('.savings-title, h3, h4');
  const savingsRate = element.querySelector('.savings-rate, [class*="rate"]');
  const savingsDesc = element.querySelector('.savings-desc, p');
  const savingsLink = element.querySelector('a[href*="savings"], a[href*="account"]');

  const col1 = document.createDocumentFragment();
  if (savingsTitle) col1.appendChild(savingsTitle.cloneNode(true));
  if (savingsRate) col1.appendChild(savingsRate.cloneNode(true));
  if (savingsDesc) col1.appendChild(savingsDesc.cloneNode(true));
  if (savingsLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = savingsLink.href;
    a.textContent = savingsLink.textContent.trim() || 'Open Account';
    p.appendChild(a);
    col1.appendChild(p);
  }

  // FD column
  const fdElements = element.querySelectorAll('[class*="fd"], [class*="fixed"]');
  const fdLink = element.querySelector('a[href*="fixed-deposit"], a[href*="fd"]');

  const col2 = document.createDocumentFragment();
  fdElements.forEach((el) => col2.appendChild(el.cloneNode(true)));
  if (fdLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = fdLink.href;
    a.textContent = fdLink.textContent.trim() || 'Open FD';
    p.appendChild(a);
    col2.appendChild(p);
  }

  // Fallback: if specific selectors didn't match, split children evenly
  if (!col1.hasChildNodes() && !col2.hasChildNodes()) {
    const children = Array.from(element.children);
    const mid = Math.ceil(children.length / 2);
    children.slice(0, mid).forEach((c) => col1.appendChild(c.cloneNode(true)));
    children.slice(mid).forEach((c) => col2.appendChild(c.cloneNode(true)));
  }

  cells.push([col1, col2]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-rates', cells });
  element.replaceWith(block);
}
