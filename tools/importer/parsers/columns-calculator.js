/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-calculator. Base: columns.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .newpremiumcalc-container .newcalculatepremium
 *
 * Columns block (xwalk): 1 row x 2 columns, no field hints.
 *   col 1: heading + fine print (gender toggle / age slider are rendered by block JS)
 *   col 2: price label, price, CTA link
 * Validated selectors (source.html):
 *   .newpremiumcalculator__heading p, .premium-widget-content p,
 *   .premium-details > p, .premium-details .newpremcalc_termvalue, button.newprem__calc_button
 * The CTA is a JS <button> with no href: data-* URL attributes are used when present, otherwise the
 * online-purchase journey URL for the referenced plan.
 */
export default function parse(element, { document }) {
  const col1 = [];
  const headingSrc = element.querySelector('.newpremiumcalculator__heading p, .newpremiumcalculator__heading h2, .newpremiumcalculator__heading h3');
  if (headingSrc && headingSrc.textContent.trim()) {
    const h = document.createElement('h3');
    h.textContent = headingSrc.textContent.trim();
    col1.push(h);
  }
  element.querySelectorAll('.premium-widget-content > *').forEach((p) => {
    if (p.textContent.trim()) col1.push(p);
  });

  const col2 = [];
  const label = element.querySelector('.premium-details > p');
  if (label && label.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = label.textContent.trim();
    col2.push(p);
  }
  const price = element.querySelector('.premium-details .newpremcalc_termvalue, .premium-details span');
  if (price && price.textContent.trim()) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = price.textContent.trim();
    p.append(strong);
    col2.push(p);
  }
  const btn = element.querySelector('button.newprem__calc_button, .newwprem__calcbtnwrp button, .newwprem__calcbtnwrp a');
  if (btn) {
    const href = btn.getAttribute('href') || btn.getAttribute('data-href') || btn.getAttribute('data-url')
      || btn.getAttribute('data-redirect-url') || btn.getAttribute('data-link') || '';
    const a = document.createElement('a');
    a.href = href && !href.startsWith('javascript') ? href : 'https://sellonline.tataaia.com/app/products?product=SRP';
    a.textContent = btn.textContent.trim() || 'Buy Now';
    const p = document.createElement('p');
    p.append(a);
    col2.push(p);
  }

  if (!col1.length && !col2.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[col1, col2]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-calculator', cells });
  element.replaceWith(block);
}
