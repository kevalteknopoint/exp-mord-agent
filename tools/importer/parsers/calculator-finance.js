/* eslint-disable */
/* global WebImporter */

/**
 * Parser: calculator-finance
 * Base block: calculator (custom, blocks/idfc/calculator-finance)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .calulator .revamp_financial_calc
 * Generated: 2026-10-12
 *
 * UE model (blocks/idfc/calculator-finance/_calculator-finance.json):
 *   block: image (+imageAlt collapsed), text (richtext)  -> one row each
 *   item (calculator-finance-item): label | calc_type + calc_ranges (grouped) | cta
 *
 * Source structure (verified in block-context/calculator-finance/source.html):
 *   .calc-description h2 + p                       -> intro text
 *   .financial-figure img.d-lg-inline-block         -> illustration (desktop image)
 *   .disclaimer-desktop > div (text starting "*")   -> footnotes (intro text)
 *   .embla__slide.card-bx .card-item a              -> tab labels (document order)
 *   form > div[id$="-panel"]                        -> calculator panels (same order as tabs)
 *     .calc-amount / .calc-intrest / .calc-tenure .help-block -> min/max bounds
 *     a.red-btn / a.btn-red                         -> Apply Now CTA
 */

const PANEL_TYPES = {
  'saving-account-panel': 'savings',
  'personal-loan-panel': 'personal-loan',
  'credit-card-panel': 'credit-card',
  'home-loan-panel': 'home-loan',
  'two-wheeler-loan-panel': 'two-wheeler-loan',
};

function typeFromLabel(label) {
  const t = (label || '').toLowerCase();
  if (t.includes('saving')) return 'savings';
  if (t.includes('personal')) return 'personal-loan';
  if (t.includes('credit')) return 'credit-card';
  if (t.includes('home')) return 'home-loan';
  if (t.includes('wheeler')) return 'two-wheeler-loan';
  return '';
}

// "₹2.5K" -> 2500, "1Cr" -> 10000000, "9.99%" -> 9.99
function toNumber(raw) {
  const m = String(raw).replace(/,/g, '').match(/([\d.]+)\s*(K|L|Cr)?/i);
  if (!m) return NaN;
  const mult = { k: 1e3, l: 1e5, cr: 1e7 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult * 100) / 100;
}

// min/max bounds are two <span>s; class-less spans may already be unwrapped by the
// import pipeline, so fall back to the (still separate) text nodes.
function readBounds(slide) {
  const help = slide && slide.querySelector('.help-block');
  if (!help) return null;
  let parts = [...help.children].map((c) => c.textContent.trim()).filter(Boolean);
  if (parts.length < 2) {
    parts = [...help.childNodes].map((n) => n.textContent.trim()).filter(Boolean);
  }
  if (parts.length < 2) return null;
  const min = toNumber(parts[0]);
  const max = toNumber(parts[parts.length - 1]);
  if (Number.isNaN(min) || Number.isNaN(max) || min >= max) return null;
  return { min, max };
}

function buildRanges(panel, type) {
  // credit-card on the source is an EMI calculator; the block's credit-card calculator
  // uses different inputs, so its defaults are kept.
  if (!panel || !type || type === 'credit-card') return '';
  const parts = [];
  const amount = readBounds(panel.querySelector('.calc-amount'));
  if (amount) parts.push(`amount: ${amount.min} - ${amount.max}`);
  const rate = readBounds(panel.querySelector('.calc-intrest'));
  if (rate) parts.push(`rate: ${rate.min} - ${rate.max}`);
  if (type !== 'savings') {
    const tenure = readBounds(panel.querySelector('.calc-tenure'));
    if (tenure) {
      if (type === 'home-loan') {
        // source tenure is in months, the block's home-loan tenure is in years
        const min = Math.max(1, Math.round(tenure.min / 12));
        const max = Math.round(tenure.max / 12);
        if (max > min) parts.push(`tenure: ${min} - ${max}`);
      } else {
        parts.push(`tenure: ${tenure.min} - ${tenure.max}`);
      }
    }
  }
  return parts.join(', ');
}

function hinted(document, field, nodes) {
  const list = nodes.filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

export default function parse(element, { document }) {
  // --- intro ---
  const heading = element.querySelector('.calc-description h2, .calc-description h1, .revamp_financial_calc_heading');
  const subheading = element.querySelector('.calc-description p, .revamp_financial_calc_sub-heading');
  const image = element.querySelector('.financial-figure img.d-lg-inline-block')
    || element.querySelector('.financial-figure img');
  const footnotes = [...element.querySelectorAll('.disclaimer-desktop > div')]
    .map((d) => d.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .map((t) => para(document, t));

  // --- calculator tabs ---
  const labels = [...element.querySelectorAll('.financial-calc-carousal .card-item')]
    .map((item) => item.textContent.replace(/\s+/g, ' ').trim());
  const panels = [...element.querySelectorAll('form [id$="-panel"]')];

  const items = [];
  const count = Math.max(labels.length, panels.length);
  for (let i = 0; i < count; i += 1) {
    const panel = panels[i];
    const label = labels[i] || '';
    const type = (panel && PANEL_TYPES[panel.id]) || typeFromLabel(label);
    if (!type) continue;
    const ranges = buildRanges(panel, type);
    const cta = panel && (panel.querySelector('.bar-desktop-btn a.red-btn')
      || panel.querySelector('a.red-btn, a.btn-red'));
    let ctaLink = null;
    if (cta && cta.getAttribute('href') && !/^javascript:/i.test(cta.getAttribute('href'))) {
      ctaLink = document.createElement('a');
      ctaLink.href = cta.getAttribute('href');
      ctaLink.textContent = cta.textContent.trim() || 'Apply Now';
    }
    items.push({ label, type, ranges, ctaLink });
  }

  if (!heading && !items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([hinted(document, 'image', [image])]);
  cells.push([hinted(document, 'text', [heading, subheading, ...footnotes])]);

  items.forEach(({ label, type, ranges, ctaLink }) => {
    const labelCell = hinted(document, 'label', [label ? document.createTextNode(label) : null]);
    const typeCell = document.createDocumentFragment();
    typeCell.appendChild(document.createComment(' field:calc_type '));
    typeCell.appendChild(para(document, type));
    if (ranges) {
      typeCell.appendChild(document.createComment(' field:calc_ranges '));
      typeCell.appendChild(para(document, ranges));
    }
    const ctaCell = hinted(document, 'cta', [ctaLink]);
    cells.push([labelCell, typeCell, ctaCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'calculator-finance', cells });
  element.replaceWith(block);
}
