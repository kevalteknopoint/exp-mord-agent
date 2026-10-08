/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-feature
 * Base block: columns
 * Source selector: .block-assets-and-copy (matches 2 adjacent siblings: DEPTIFY, Adobe partner)
 * Source: https://www.dept.global/en-in/
 * Generated: 2026-05-25 / Updated 2026-10-08 (dept.global DOM, sibling merge)
 *
 * One columns block, one row per `.block-assets-and-copy` element: image | H2 + text + CTA.
 * The first matched element gathers following adjacent `.block-assets-and-copy` siblings
 * and removes them; later parser calls hit detached elements and are skipped.
 * xwalk project - Columns blocks do NOT require field hint comments per hinting rules.
 */
function buildRow(el, document) {
  const image = el.querySelector('img.block-assets-and-copy__media, img[class*="assets-and-copy__media"], img');
  const title = el.querySelector('.block-assets-and-copy__title, [class*="assets-and-copy__title"]');
  const content = el.querySelector('.block-assets-and-copy__content') || el;
  const descriptions = [...content.querySelectorAll('p.block-assets-and-copy__text, p[class*="assets-and-copy__text"]')];
  const ctaLinks = [...content.querySelectorAll('a.button-v2, a[href]')]
    .filter((a, i, arr) => arr.indexOf(a) === i);

  const col1 = [];
  if (image) col1.push(image);

  const col2 = [];
  if (title && title.textContent.trim()) {
    // Keep the title's bold + accent markup: the importer strips <strong> from headings, so bold
    // becomes <b>; the orange accent words (.is-fancy-serif) become <em>. Other spans are unwrapped.
    const heading = document.createElement('h2');
    const clone = title.cloneNode(true);
    clone.querySelectorAll('.is-fancy-serif').forEach((span) => {
      const em = document.createElement('em');
      em.textContent = span.textContent.replace(/\s+/g, ' ').trim();
      span.replaceWith(em);
    });
    clone.querySelectorAll('strong').forEach((strong) => {
      const b = document.createElement('b');
      b.append(...strong.childNodes);
      strong.replaceWith(b);
    });
    clone.querySelectorAll('span').forEach((span) => span.replaceWith(...span.childNodes));
    heading.innerHTML = clone.innerHTML.replace(/\s+/g, ' ').trim();
    col2.push(heading);
  }
  descriptions.forEach((p) => col2.push(p));
  ctaLinks.forEach((link) => {
    const p = document.createElement('p');
    p.appendChild(link);
    col2.push(p);
  });

  if (!col1.length && !col2.length) return null;
  return [col1.length ? col1 : '', col2.length ? col2 : ''];
}

export default function parse(element, { document }) {
  if (!element.parentNode) return; // already merged into the first instance's block

  const rows = [element];
  let next = element.nextElementSibling;
  while (next && next.classList && next.classList.contains('block-assets-and-copy')) {
    rows.push(next);
    next = next.nextElementSibling;
  }

  const cells = rows.map((row) => buildRow(row, document)).filter(Boolean);
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  rows.slice(1).forEach((row) => row.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
