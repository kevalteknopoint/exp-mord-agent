/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-app
 * Base block: columns (blocks/idfc/columns-app)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .adv-mobile-app .advance-mobile-app > .row
 * Generated: 2026-10-12
 *
 * Columns block: no field hints (xwalk columns cells hold default content only).
 * 1 row x 3 cells (blocks/idfc/columns-app/metadata.json contentPattern):
 *   cell 1: .heading-sec h2, p, .btn-container links (Install Now, View awards)
 *   cell 2: .car-box img.d-show (desktop phone mock-up)
 *   cell 3: .grcompmobinri-desc p (tagline), .grcompmob-qr h3, .grcompmobqr-img img (QR)
 * Carousel controls are dropped; the mobile image (img.m-show) duplicates the desktop one.
 */
function link(document, a) {
  const p = document.createElement('p');
  const out = document.createElement('a');
  out.href = a.getAttribute('href');
  out.textContent = a.textContent.replace(/\s+/g, ' ').trim();
  p.appendChild(out);
  return p;
}

export default function parse(element, { document }) {
  // --- cell 1: intro text + CTAs ---
  const textCell = [];
  const heading = element.querySelector('.heading-sec h2, .heading-sec h1, h2');
  const intro = element.querySelector('.heading-sec p');
  if (heading) textCell.push(heading);
  if (intro) textCell.push(intro);
  element.querySelectorAll('.heading-sec .btn-container a[href], .heading-sec a[href]').forEach((a) => {
    if (!textCell.some((n) => n.querySelector && n.querySelector(`a[href="${a.getAttribute('href')}"]`))) {
      textCell.push(link(document, a));
    }
  });

  // --- cell 2: phone mock-up(s) ---
  const mediaCell = [];
  const slides = [...element.querySelectorAll('.embla-mobile-app-banner .embla__slide')];
  const taglines = [];
  (slides.length ? slides : [element]).forEach((slide) => {
    const img = slide.querySelector('.car-box img.d-show') || slide.querySelector('.car-box img');
    if (img) mediaCell.push(img);
    slide.querySelectorAll('.grcompmobinri-desc p, .mobile-app-h3').forEach((p) => {
      if (!taglines.includes(p)) taglines.push(p);
    });
  });

  // --- cell 3: tagline, download heading, QR ---
  const qrCell = [...taglines];
  const qrHeading = element.querySelector('.grcompmob-qr h3, .grcompmobqr-desc h3, .grcompmob-qr h2');
  const qrImg = element.querySelector('.grcompmobqr-img img, .grcompmob-qr img');
  if (qrHeading) qrCell.push(qrHeading);
  if (qrImg) qrCell.push(qrImg);

  if (!textCell.length && !mediaCell.length && !qrCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell, mediaCell, qrCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-app', cells });
  element.replaceWith(block);
}
