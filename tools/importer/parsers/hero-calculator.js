/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-calculator. Base: hero.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .nolead-calc-banner-wrapper .term-calculator-container
 *
 * Model (blocks/hero-calculator/_hero-calculator.json): image (+imageAlt collapsed), text, calculator
 * Output: 3 rows x 1 column
 *   row 1: image      - family photo (.authorable-personimg img)
 *   row 2: text       - product logo, rating, heading, checklist, fine print
 *   row 3: calculator - calculator heading + CTA link (form controls rendered by block JS)
 *
 * Validated selectors (source.html):
 *   .authorable-personimg img.cmp-image__image, .banner-logo-image img.cmp-image__image,
 *   .banner-rating .ratecount, .banner-rating .customer-count p,
 *   .banner-content-desktop-text .cmp-text (h4 + ul), .term-and-condition-text .cmp-text p,
 *   .tic-premium-calc-title h2, a.tic-premium-calc-btn
 */
function hinted(document, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

export default function parse(element, { document }) {
  // Row 1: family photo (fallback: any large banner image that is not the logo)
  const photo = element.querySelector('.authorable-personimg img.cmp-image__image, .authorable-personimg img[src]')
    || element.querySelector('img[alt="banner"]');

  // Row 2: promo rich text
  const promo = [];
  const logo = element.querySelector('.banner-logo-image img.cmp-image__image, .banner-logo-image img[src]');
  if (logo) {
    // product logo is an SVG content image: html2md turns any src ending in .svg into an :icon:
    const src = logo.getAttribute('src') || logo.getAttribute('data-src') || '';
    if (/\.svg$/i.test(src)) logo.setAttribute('src', `${src}?v=1`);
    promo.push(logo);
  }

  const rateCount = element.querySelector('.banner-rating .ratecount');
  const customerCount = element.querySelector('.banner-rating .customer-count p');
  if (rateCount || customerCount) {
    const p = document.createElement('p');
    if (rateCount) p.append(`${rateCount.textContent.trim()} `);
    if (customerCount) p.append(...[...customerCount.childNodes].map((n) => n.cloneNode(true)));
    promo.push(p);
  }

  const promoText = element.querySelector('.banner-content-desktop-text .cmp-text')
    || element.querySelector('.leadproxytext:not(.term-and-condition-text) .cmp-text');
  if (promoText) {
    [...promoText.children].forEach((child) => {
      if (child.textContent.replace(/ /g, ' ').trim()) promo.push(child);
    });
  }

  const fine = element.querySelectorAll('.term-and-condition-text .cmp-text > *');
  fine.forEach((f) => { if (f.textContent.trim()) promo.push(f); });

  // Row 3: calculator heading + CTA link
  const calc = [];
  const calcTitle = element.querySelector('.tic-premium-calc-title h2, .tic-premium-calc-title h1, .tic-premium-calc-title h3');
  if (calcTitle) calc.push(calcTitle);
  const calcBtn = element.querySelector('a.tic-premium-calc-btn');
  if (calcBtn) {
    // The source button is a JS trigger (javascript:void(0)); use the online-quote journey link when present
    const journey = element.querySelector('a[href*="sellonline.tataaia.com"]')
      || document.querySelector('a.productBanner-btn[href*="sellonline.tataaia.com"]');
    const a = document.createElement('a');
    const href = calcBtn.getAttribute('href') || '';
    a.href = (journey && journey.getAttribute('href'))
      || (href && !href.startsWith('javascript') ? href : 'https://sellonline.tataaia.com/app/products?product=SRP');
    a.textContent = calcBtn.textContent.trim() || 'Calculate Premium';
    const p = document.createElement('p');
    p.append(a);
    calc.push(p);
  }

  if (!photo && !promo.length && !calc.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [
    [hinted(document, 'image', photo)],
    [hinted(document, 'text', promo)],
    [hinted(document, 'calculator', calc)],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-calculator', cells });
  element.replaceWith(block);
}
