import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Hero Calculator
 * Content contract (one row per field):
 *   row 1: image (family photo)                    -> .hero-calculator-media
 *   row 2: promo rich text (badge, rating, heading, checklist, fine print)
 *   row 3: calculator rich text (heading, optional intro, CTA link = quote journey URL)
 * The calculator controls are rendered by this script; the CTA link supplies the
 * submit label and target URL. Missing rows are tolerated.
 *
 * Layouts (chosen from the content, no extra authoring):
 *   - full (promo has a heading, e.g. the page hero): promo card with logo, rating ribbon,
 *     headline, checklist and photo; calculator with switch toggles and plan selects.
 *   - compact (promo without a heading, e.g. a mid-page "check premium" teaser): the
 *     calculator heading becomes the section title above a white card; image + checklist
 *     on the left, short form with segmented toggles on the right.
 */

const SUM_ASSURED = ['50 Lakh', '75 Lakh', '1 Crore', '1.5 Crore', '2 Crore', '5 Crore'];
const POLICY_TERM = Array.from({ length: 12 }, (_, i) => `${(i + 1) * 5} years`);
const INCOME = ['Below 3 Lakh', '3 - 5 Lakh', '5 - 7.5 Lakh', '7.5 - 10 Lakh', '10 - 15 Lakh', 'Above 15 Lakh'];
const PAY_MODE = ['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'];
const CONSENT = 'By submitting details, I accept TATA AIA Life\'s Privacy Policy. TATA AIA Life Insurance Co. Ltd will send you updates on your policy, new products & services, insurance solutions or related information. A TATA AIA sales expert will call you from a 1600-series number to assist with your requirement.';

let calcId = 0;

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => c && node.append(c));
  return node;
}

/* switch: "<off> [switch] <on>" - checked selects the "on" option */
function switchField(id, name, label, offLabel, onLabel, checked) {
  const input = el('input', {
    type: 'checkbox',
    id,
    name,
    role: 'switch',
    class: 'hero-calculator-switch',
    'aria-labelledby': `${id}-label`,
    'data-on': onLabel.toLowerCase(),
    'data-off': offLabel.toLowerCase(),
  });
  input.checked = checked;
  return el('div', { class: 'hero-calculator-field hero-calculator-field-toggle' }, [
    el('span', { class: 'hero-calculator-label', id: `${id}-label`, text: label }),
    el('label', { class: 'hero-calculator-toggle', for: id }, [
      el('span', { class: 'hero-calculator-toggle-off', text: offLabel }),
      input,
      el('span', { class: 'hero-calculator-toggle-on', text: onLabel }),
    ]),
  ]);
}

/* segmented control: two radios rendered as joined buttons */
function segmentField(id, name, label, options, selected) {
  const fieldset = el('fieldset', { class: 'hero-calculator-segment' }, [
    el('legend', { class: 'hero-calculator-label', text: label }),
  ]);
  options.forEach((opt) => {
    const input = el('input', {
      type: 'radio', id: `${id}-${opt.toLowerCase()}`, name, value: opt.toLowerCase(),
    });
    input.checked = opt === selected;
    fieldset.append(el('label', { for: input.id }, [input, el('span', { text: opt })]));
  });
  return el('div', { class: 'hero-calculator-field hero-calculator-field-toggle' }, [fieldset]);
}

function selectField(id, name, label, values, selected) {
  const select = el('select', { id, name });
  values.forEach((v) => {
    const opt = el('option', { value: v, text: v });
    if (v === selected) opt.selected = true;
    select.append(opt);
  });
  return el('div', { class: 'hero-calculator-field' }, [
    el('label', { class: 'hero-calculator-label', for: id, text: label }),
    select,
  ]);
}

function inputField(id, name, label, attrs = {}, prefix = null) {
  const input = el('input', { id, name, ...attrs });
  const control = prefix
    ? el('div', { class: 'hero-calculator-prefixed' }, [
      el('span', { class: 'hero-calculator-prefix', text: prefix }), input])
    : input;
  return el('div', { class: 'hero-calculator-field' }, [
    el('label', { class: 'hero-calculator-label', for: id, text: label }),
    control,
  ]);
}

function buildForm(ctaLink, compact) {
  calcId += 1;
  const p = `hero-calc-${calcId}`;
  const form = el('form', { class: 'hero-calculator-form', novalidate: '' });

  const rowPerson = el('div', { class: 'hero-calculator-row hero-calculator-row-2' }, [
    inputField(`${p}-name`, 'name', 'Full name (First and last)', {
      type: 'text', autocomplete: 'name', placeholder: 'E.g. Rakesh Singh',
    }),
    inputField(`${p}-dob`, 'dob', 'Date of birth', { type: 'date', placeholder: 'DD/MM/YYYY' }),
  ]);

  const rowToggles = el('div', { class: 'hero-calculator-row hero-calculator-row-3 hero-calculator-toggles' }, compact
    ? [
      segmentField(`${p}-nri`, 'nri', 'Are you an NRI?', ['Yes', 'No'], 'No'),
      segmentField(`${p}-gender`, 'gender', 'Gender', ['Male', 'Female'], 'Male'),
      segmentField(`${p}-smoker`, 'smoker', 'Do you smoke?', ['Yes', 'No'], 'No'),
    ]
    : [
      switchField(`${p}-nri`, 'nri', 'Are you an NRI?', 'Yes', 'No', true),
      switchField(`${p}-gender`, 'gender', 'Gender', 'Male', 'Female', false),
      switchField(`${p}-smoker`, 'smoker', 'Do you smoke?', 'Yes', 'No', true),
    ]);

  const rowContact = el('div', { class: 'hero-calculator-row hero-calculator-row-2' }, [
    inputField(`${p}-mobile`, 'mobile', 'Mobile number', {
      type: 'tel',
      autocomplete: 'tel-national',
      inputmode: 'numeric',
      maxlength: '10',
      pattern: '[6-9][0-9]{9}',
      placeholder: 'E.g. 9876543210',
    }, '+91'),
    inputField(`${p}-email`, 'email', 'Email ID', {
      type: 'email', autocomplete: 'email', placeholder: 'E.g. abc@gmail.com',
    }),
  ]);

  const rows = [rowPerson, rowToggles, rowContact];
  if (!compact) {
    rows.push(el('div', { class: 'hero-calculator-row hero-calculator-row-4' }, [
      selectField(`${p}-term`, 'policyTerm', 'Policy Term', POLICY_TERM, '30 years'),
      selectField(`${p}-sum`, 'sumAssured', 'Sum Assured (₹)', SUM_ASSURED, '1 Crore'),
      selectField(`${p}-income`, 'income', 'Annual Income (₹)', INCOME, '7.5 - 10 Lakh'),
      selectField(`${p}-mode`, 'paymentMode', 'Payment Mode', PAY_MODE, 'Monthly'),
    ]));
  }

  const consent = el('input', { type: 'checkbox', id: `${p}-consent`, name: 'consent' });
  consent.checked = true;
  rows.push(el('div', { class: 'hero-calculator-consent' }, [
    consent,
    el('label', { for: consent.id, text: CONSENT }),
  ]));

  const submit = el('button', {
    type: 'submit',
    class: 'button primary hero-calculator-submit',
    text: (ctaLink && ctaLink.textContent.trim()) || 'Calculate premium',
  });
  rows.push(el('div', { class: 'hero-calculator-actions' }, [submit]));

  form.append(...rows);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ctaLink || !ctaLink.href) return;
    const url = new URL(ctaLink.href, window.location.href);
    new FormData(form).forEach((v, k) => { if (v) url.searchParams.set(k, v); });
    form.querySelectorAll('input[type=checkbox]').forEach((c) => {
      if (c.dataset.on) url.searchParams.set(c.name, c.checked ? c.dataset.on : c.dataset.off);
      else url.searchParams.set(c.name, c.checked ? 'yes' : 'no');
    });
    window.location.href = url.toString();
  });
  return form;
}

/* tag promo paragraphs so they can be laid out (logo, rating ribbon, fine print) */
function decoratePromo(content) {
  content.querySelectorAll('ul').forEach((ul) => ul.classList.add('hero-calculator-checklist'));
  [...content.children].forEach((node) => {
    if (node.tagName !== 'P') return;
    const text = node.textContent.trim();
    if (node.querySelector('picture') && !text) {
      node.classList.add('hero-calculator-logo');
      return;
    }
    const rating = text.match(/^(\d(?:\.\d)?)\s+(rated\b.*)$/i);
    if (rating) {
      node.classList.add('hero-calculator-rating');
      const rest = node.innerHTML.replace(/^\s*\d(?:\.\d)?\s*/, '');
      node.innerHTML = '';
      node.append(
        el('span', { class: 'hero-calculator-rating-score', text: rating[1] }),
        el('span', { class: 'hero-calculator-rating-stars', 'aria-hidden': 'true', text: '★★★★★' }),
      );
      const caption = el('span', { class: 'hero-calculator-rating-text' });
      caption.innerHTML = rest;
      node.append(caption);
      return;
    }
    if (node.previousElementSibling?.matches('ul, ol')) node.classList.add('hero-calculator-fineprint');
    else if (!node.previousElementSibling || node.previousElementSibling.matches('.hero-calculator-logo, .hero-calculator-rating')) {
      node.classList.add('hero-calculator-plan');
    }
  });
}

export default function decorate(block) {
  const rows = [...block.children];

  // UE always emits all three rows (an empty image row stays in place); DA may omit the image
  let mediaRow = rows.find((r) => r.querySelector('picture') && !r.textContent.trim());
  if (!mediaRow && rows.length >= 3) [mediaRow] = rows;
  const textRows = rows.filter((r) => r !== mediaRow);
  const promoRow = textRows[0];
  const calcRow = textRows[1];

  const promo = el('div', { class: 'hero-calculator-promo' });
  const promoContent = el('div', { class: 'hero-calculator-content' });
  if (promoRow) {
    moveInstrumentation(promoRow, promoContent);
    const cell = promoRow.querySelector(':scope > div') || promoRow;
    while (cell.firstChild) promoContent.append(cell.firstChild);
    decoratePromo(promoContent);
  }
  const compact = block.classList.contains('compact')
    || (!!promoRow && !promoContent.querySelector('h1, h2, h3, h4, h5, h6'));
  block.classList.toggle('hero-calculator-compact', compact);
  promo.append(promoContent);

  if (mediaRow && mediaRow.querySelector('picture img')) {
    const media = el('div', { class: 'hero-calculator-media' });
    moveInstrumentation(mediaRow, media);
    const pic = mediaRow.querySelector('picture');
    const img = pic.querySelector('img');
    const eager = !compact;
    const optimized = createOptimizedPicture(img.src, img.alt, eager, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    media.append(optimized);
    if (compact) promo.prepend(media);
    else promo.append(media);
  }

  const calc = el('div', { class: 'hero-calculator-panel' });
  let ctaLink = null;
  let title = null;
  if (calcRow) {
    moveInstrumentation(calcRow, calc);
    const cell = calcRow.querySelector(':scope > div') || calcRow;
    ctaLink = cell.querySelector('a');
    const intro = el('div', { class: 'hero-calculator-intro' });
    while (cell.firstChild) intro.append(cell.firstChild);
    // the CTA link is consumed by the submit button
    if (ctaLink) {
      const holder = ctaLink.closest('p, .button-container');
      if (holder && holder.textContent.trim() === ctaLink.textContent.trim()) holder.remove();
      else ctaLink.remove();
    }
    if (compact) {
      // compact layout: the calculator heading is the title above the card
      title = intro.querySelector('h1, h2, h3, h4, h5, h6');
      if (title) {
        title.classList.add('hero-calculator-title');
        title.remove();
      }
    }
    if (intro.children.length) calc.append(intro);
  }
  calc.append(buildForm(ctaLink, compact));

  const body = el('div', { class: 'hero-calculator-body' }, [promo, calc]);
  block.replaceChildren(...(title ? [title, body] : [body]));
}
