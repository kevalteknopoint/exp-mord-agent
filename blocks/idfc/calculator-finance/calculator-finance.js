import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function emi(principal, annualRate, months) {
  const r = annualRate / 12 / 100;
  if (!r) return principal / months;
  const f = (1 + r) ** months;
  return (principal * r * f) / (f - 1);
}

function loanResult(principal, rate, months) {
  const monthly = emi(principal, rate, months);
  const total = monthly * months;
  return {
    headlineLabel: 'Your monthly EMI',
    headline: inr(monthly),
    rows: [
      { label: 'Principal amount', value: inr(principal), ratio: principal / total },
      { label: 'Total interest', value: inr(total - principal), ratio: (total - principal) / total },
      { label: 'Total amount payable', value: inr(total), ratio: 1 },
    ],
  };
}

/* Built-in calculators. Each field can be overridden from the authored config text,
   e.g. "amount: 10000 - 50000000, 2500000" or "idfc: 7". */
const CALCULATORS = {
  savings: {
    label: 'Savings Account',
    title: 'Savings A/c interest calculator',
    fields: [
      {
        key: 'amount', label: 'My savings amount', min: 10000, max: 50000000, value: 2500000, step: 10000, unit: 'inr',
      },
      {
        key: 'rate', label: 'Existing bank interest rate', min: 1.5, max: 3.5, value: 2.5, step: 0.05, unit: 'pct',
      },
    ],
    // effective IDFC FIRST rate across slabs (≈ source figure for ₹25L); override with "idfc: 7"
    constants: { idfc: 6.44 },
    compute: ({ amount, rate }, { idfc }) => {
      const bank = amount * ((1 + rate / 400) ** 4 - 1); // quarterly credit
      const first = amount * ((1 + idfc / 1200) ** 12 - 1); // monthly credit
      return {
        headlineLabel: 'You will earn',
        headline: `${inr(Math.max(first - bank, 0))} more yearly`,
        headlineSuffix: 'with IDFC FIRST Bank',
        rows: [
          { label: 'Yearly interest from your bank', value: inr(bank), ratio: bank / Math.max(first, bank) },
          { label: 'Yearly interest from IDFC FIRST Bank', value: inr(first), ratio: first / Math.max(first, bank) },
        ],
      };
    },
  },
  'personal-loan': {
    label: 'Personal Loan',
    title: 'Personal loan EMI calculator',
    fields: [
      {
        key: 'amount', label: 'Loan amount', min: 20000, max: 1500000, value: 500000, step: 10000, unit: 'inr',
      },
      {
        key: 'rate', label: 'Interest rate', min: 9.99, max: 36, value: 10.99, step: 0.01, unit: 'pct',
      },
      {
        key: 'tenure', label: 'Loan tenure', min: 9, max: 60, value: 36, step: 1, unit: 'months',
      },
    ],
    compute: ({ amount, rate, tenure }) => loanResult(amount, rate, tenure),
  },
  'credit-card': {
    label: 'Credit Card',
    title: 'Credit card rewards calculator',
    fields: [
      {
        key: 'spend', label: 'My monthly spend', min: 5000, max: 500000, value: 50000, step: 1000, unit: 'inr',
      },
      {
        key: 'rewards', label: 'Reward rate', min: 0.5, max: 10, value: 3, step: 0.1, unit: 'pct',
      },
    ],
    compute: ({ spend, rewards }) => {
      const yearlySpend = spend * 12;
      const value = (yearlySpend * rewards) / 100;
      return {
        headlineLabel: 'You could save',
        headline: `${inr(value)} yearly`,
        rows: [
          { label: 'Yearly spend', value: inr(yearlySpend), ratio: 1 },
          { label: 'Yearly rewards value', value: inr(value), ratio: value / yearlySpend },
        ],
      };
    },
  },
  'home-loan': {
    label: 'Home Loan',
    title: 'Home loan EMI calculator',
    fields: [
      {
        key: 'amount', label: 'Loan amount', min: 500000, max: 100000000, value: 5000000, step: 100000, unit: 'inr',
      },
      {
        key: 'rate', label: 'Interest rate', min: 8.5, max: 15, value: 8.85, step: 0.05, unit: 'pct',
      },
      {
        key: 'tenure', label: 'Loan tenure', min: 1, max: 30, value: 20, step: 1, unit: 'years',
      },
    ],
    compute: ({ amount, rate, tenure }) => loanResult(amount, rate, tenure * 12),
  },
  'two-wheeler-loan': {
    label: 'Two Wheeler Loan',
    title: 'Two wheeler loan EMI calculator',
    fields: [
      {
        key: 'amount', label: 'Loan amount', min: 20000, max: 300000, value: 100000, step: 5000, unit: 'inr',
      },
      {
        key: 'rate', label: 'Interest rate', min: 9, max: 30, value: 12, step: 0.05, unit: 'pct',
      },
      {
        key: 'tenure', label: 'Loan tenure', min: 12, max: 48, value: 36, step: 1, unit: 'months',
      },
    ],
    compute: ({ amount, rate, tenure }) => loanResult(amount, rate, tenure),
  },
};

const KEYS = Object.keys(CALCULATORS);
const num = (s) => parseFloat(String(s).replace(/,/g, ''));

function findType(text) {
  // the calculator key must be the first token of the cell, so intro copy mentioning
  // e.g. "savings" is never mistaken for a calculator row
  const t = text.trim().toLowerCase();
  return KEYS.find((k) => new RegExp(`^${k}(?![a-z-])`).test(t));
}

function parseConfig(type, text) {
  const base = CALCULATORS[type];
  const fields = base.fields.map((f) => ({ ...f }));
  const constants = { ...(base.constants || {}) };
  const rangeRe = /([a-z]+)\s*[:=]\s*([\d.,]+)\s*(?:-|to)\s*([\d.,]+)(?:\s*[,(]\s*(?:default\s*)?([\d.,]+)\)?)?/gi;
  [...text.matchAll(rangeRe)].forEach(([, key, min, max, value]) => {
    const field = fields.find((f) => f.key === key.toLowerCase());
    if (!field) return;
    field.min = num(min);
    field.max = num(max);
    if (value) field.value = num(value);
    field.value = Math.min(Math.max(field.value, field.min), field.max);
  });
  const singleRe = /([a-z]+)\s*[:=]\s*([\d.,]+)(?!\s*(?:-|to|[\d.,]))/gi;
  [...text.matchAll(singleRe)].forEach(([, key, value]) => {
    const k = key.toLowerCase();
    if (k in constants) constants[k] = num(value);
    const field = fields.find((f) => f.key === k);
    if (field) field.value = Math.min(Math.max(num(value), field.min), field.max);
  });
  // authored ranges can move the minimum off the built-in step grid (two wheeler: 7000 - 2000000
  // with a 5000 step), which made the slider snap away from the shown value: re-align the value
  fields.forEach((f) => {
    const steps = Math.round((f.value - f.min) / f.step);
    const decimals = Math.max(...[f.step, f.min].map((n) => (String(n).split('.')[1] || '').length));
    f.value = Math.min(Number((f.min + steps * f.step).toFixed(decimals)), f.max);
  });
  return { ...base, fields, constants };
}

function formatValue(field, value) {
  if (field.unit === 'inr') return Math.round(value).toLocaleString('en-IN');
  return String(value);
}

function formatBound(field, value) {
  if (field.unit === 'inr') {
    if (value >= 10000000) return `₹${value / 10000000}Cr`;
    if (value >= 100000) return `₹${value / 100000}L`;
    if (value >= 1000) return `₹${value / 1000}K`;
    return `₹${value}`;
  }
  if (field.unit === 'pct') return `${value}%`;
  return `${value} ${field.unit}`;
}

const UNIT_SUFFIX = { pct: '% p.a.', months: 'months', years: 'years' };

function buildField(field, id, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'calculator-finance-field';
  const inputId = `${id}-${field.key}`;
  wrap.innerHTML = `
    <label class="calculator-finance-label" for="${inputId}">${field.label}</label>
    <div class="calculator-finance-input">
      ${field.unit === 'inr' ? '<span class="calculator-finance-prefix">₹</span>' : ''}
      <input id="${inputId}" type="text" inputmode="decimal" autocomplete="off">
      ${UNIT_SUFFIX[field.unit] ? `<span class="calculator-finance-suffix">${UNIT_SUFFIX[field.unit]}</span>` : ''}
    </div>
    <input class="calculator-finance-range" type="range" aria-label="${field.label}"
      min="${field.min}" max="${field.max}" step="${field.step}" value="${field.value}">
    <div class="calculator-finance-bounds"><span>${formatBound(field, field.min)}</span><span>${formatBound(field, field.max)}</span></div>`;
  const text = wrap.querySelector(`#${inputId}`);
  const range = wrap.querySelector('.calculator-finance-range');
  const set = (value, fromText = false) => {
    const v = Math.min(Math.max(Number.isNaN(value) ? field.min : value, field.min), field.max);
    field.value = v;
    range.value = v;
    range.style.setProperty('--calculator-finance-fill', `${((v - field.min) / (field.max - field.min)) * 100}%`);
    if (!fromText) text.value = formatValue(field, v);
    onChange();
  };
  range.addEventListener('input', () => set(num(range.value)));
  text.addEventListener('change', () => set(num(text.value)));
  text.addEventListener('blur', () => { text.value = formatValue(field, field.value); });
  set(field.value);
  return wrap;
}

function buildPanel(calc, id, footerCell) {
  const panel = document.createElement('div');
  panel.className = 'calculator-finance-panel';
  panel.id = id;
  panel.setAttribute('role', 'tabpanel');

  const body = document.createElement('div');
  body.className = 'calculator-finance-panel-body';
  const title = document.createElement('h3');
  title.className = 'calculator-finance-title';
  title.textContent = calc.title;
  body.append(title);

  const results = document.createElement('div');
  results.className = 'calculator-finance-results';
  const summary = document.createElement('div');
  summary.className = 'calculator-finance-summary';
  summary.setAttribute('aria-live', 'polite');

  const render = () => {
    const values = Object.fromEntries(calc.fields.map((f) => [f.key, f.value]));
    const out = calc.compute(values, calc.constants);
    results.innerHTML = out.rows.map((r) => `
      <div class="calculator-finance-result" style="--calculator-finance-ratio: ${Math.max(0, Math.min(r.ratio, 1)).toFixed(3)}">
        <span class="calculator-finance-result-bar" aria-hidden="true"></span>
        <span class="calculator-finance-result-label">${r.label}</span>
        <strong class="calculator-finance-result-value">${r.value}</strong>
      </div>`).join('');
    summary.innerHTML = `<p class="calculator-finance-summary-label">${out.headlineLabel}</p>
      <p class="calculator-finance-summary-value">${out.headline}</p>
      ${out.headlineSuffix ? `<p class="calculator-finance-summary-suffix">${out.headlineSuffix}</p>` : ''}`;
  };

  calc.fields.forEach((f) => body.append(buildField(f, id, () => calc.ready && render())));
  body.append(results);
  calc.ready = true;
  render();

  const footer = document.createElement('div');
  footer.className = 'calculator-finance-footer';
  footer.append(summary);
  if (footerCell) {
    const cta = document.createElement('div');
    cta.className = 'calculator-finance-cta';
    while (footerCell.firstChild) cta.append(footerCell.firstChild);
    const links = [...cta.querySelectorAll('a')];
    if (links[0]) links[0].classList.add('calculator-finance-cta-primary');
    links.slice(1).forEach((a) => a.classList.add('calculator-finance-cta-secondary'));
    footer.append(cta);
  }
  panel.append(body, footer);
  return panel;
}

let calcId = 0;

export default function decorate(block) {
  calcId += 1;
  const intro = document.createElement('div');
  intro.className = 'calculator-finance-intro';
  const introMedia = document.createElement('div');
  introMedia.className = 'calculator-finance-intro-media';
  const introText = document.createElement('div');
  introText.className = 'calculator-finance-intro-text';

  const calculators = [];
  // paragraphs of a cell joined with spaces ("savings" + "amount: …" must not fuse together)
  const cellText = (c) => (c.children.length
    ? [...c.children].map((el) => el.textContent).join(' ')
    : c.textContent);

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const typeCellIdx = cells.findIndex((c, i) => i > 0 && findType(cellText(c)));
    if (cells.length >= 2 && typeCellIdx > 0) {
      calculators.push({
        row,
        label: cells[0].textContent.trim(),
        type: findType(cellText(cells[typeCellIdx])),
        config: cellText(cells[typeCellIdx]),
        footer: cells.find((c, i) => i > typeCellIdx && (c.textContent.trim() || c.querySelector('a'))),
      });
      return;
    }
    // intro row(s): image(s) go to the media column, text to the copy column
    cells.forEach((cell) => {
      cell.querySelectorAll('picture').forEach((pic) => {
        const p = pic.closest('p');
        introMedia.append(pic);
        if (p && !p.textContent.trim() && !p.children.length) p.remove();
      });
      if (cell.textContent.trim()) {
        moveInstrumentation(cell, introText);
        while (cell.firstChild) introText.append(cell.firstChild);
      }
    });
    moveInstrumentation(row, intro);
  });

  introMedia.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '800' }, { width: '600' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
  // the trailing paragraphs starting with '*' are footnotes/disclaimers: keep them after the image
  const footnotes = document.createElement('div');
  footnotes.className = 'calculator-finance-footnotes';
  [...introText.children].filter((el) => /^\s*\*/.test(el.textContent)).forEach((el) => footnotes.append(el));
  intro.append(introText);
  if (introMedia.children.length) intro.append(introMedia);
  if (footnotes.children.length) intro.append(footnotes);

  const widget = document.createElement('div');
  widget.className = 'calculator-finance-widget';
  const tablist = document.createElement('div');
  tablist.className = 'calculator-finance-tabs';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'calculator-finance-panels';

  calculators.forEach((c, i) => {
    const calc = parseConfig(c.type, c.config);
    const id = `calculator-finance-${calcId}-${c.type}-${i}`;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'calculator-finance-tab';
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', id);
    tab.setAttribute('aria-selected', i === 0);
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.textContent = c.label || calc.label;
    tablist.append(tab);

    const panel = buildPanel(calc, id, c.footer);
    moveInstrumentation(c.row, panel);
    panel.setAttribute('aria-labelledby', tab.id);
    panel.hidden = i !== 0;
    panels.append(panel);
  });

  const select = (tab) => {
    tablist.querySelectorAll('[role=tab]').forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    panels.querySelectorAll('[role=tabpanel]').forEach((p) => {
      p.hidden = p.id !== tab.getAttribute('aria-controls');
    });
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('[role=tab]');
    if (tab) select(tab);
  });
  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const tabs = [...tablist.querySelectorAll('[role=tab]')];
    const cur = tabs.indexOf(document.activeElement);
    if (cur < 0) return;
    const next = tabs[(cur + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    e.preventDefault();
    next.focus();
    select(next);
  });

  const tabsWrap = document.createElement('div');
  tabsWrap.className = 'calculator-finance-tabs-wrap';
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'calculator-finance-tabs-next';
  more.setAttribute('aria-label', 'More calculators');
  more.addEventListener('click', () => tablist.scrollBy({ left: tablist.clientWidth / 2, behavior: 'smooth' }));
  const updateMore = () => {
    more.hidden = tablist.scrollLeft + tablist.clientWidth >= tablist.scrollWidth - 1;
  };
  tablist.addEventListener('scroll', updateMore, { passive: true });
  window.addEventListener('resize', updateMore);
  tabsWrap.append(tablist, more);
  widget.append(tabsWrap, panels);

  block.textContent = '';
  block.append(intro);
  if (calculators.length) {
    block.append(widget);
    requestAnimationFrame(updateMore);
  }
}
