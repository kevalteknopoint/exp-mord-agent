/*
 * Calculator EMI
 * Key-value block (one row per setting): priceMin, priceMax, price (default ex-showroom price, ₹),
 * downMin, downMax (down payment range, % of price), tenures (comma separated years, e.g. 3, 5, 7),
 * recommended (tenure marked "Recommended"), rateMin, rateMax, rate (interest % p.a.),
 * ctaLabel, ctaLink, note.
 * Renders price / down-payment / interest sliders, tenure options and the monthly EMI.
 */

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [key, value] = [...row.children];
    if (!key) return;
    const name = key.textContent.trim();
    config[name] = value ? value.textContent.trim() : '';
    if (value?.querySelector('a')) config[`${name}Href`] = value.querySelector('a').getAttribute('href');
  });
  return config;
}

const num = (value, fallback) => {
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : fallback;
};

const lakh = (n) => `₹${inr.format(n / 100000)}${n >= 3000000 ? '+' : ''} L`;

function emi(principal, ratePercent, years) {
  const n = years * 12;
  const r = ratePercent / 1200;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  const f = (1 + r) ** n;
  return (principal * r * f) / (f - 1);
}

function field(id, label, unit) {
  const wrap = document.createElement('div');
  wrap.className = 'calculator-emi-field';
  wrap.innerHTML = `<label class="calculator-emi-label" for="${id}-value">${label}</label>
    <span class="calculator-emi-value"><span class="calculator-emi-prefix"></span>
      <input id="${id}-value" type="text" inputmode="decimal" autocomplete="off">
      <span class="calculator-emi-unit">${unit || ''}</span></span>`;
  return wrap;
}

function slider(id, min, max, step, label) {
  const wrap = document.createElement('div');
  wrap.className = 'calculator-emi-range';
  wrap.innerHTML = `<input id="${id}-range" type="range" min="${min}" max="${max}" step="${step}" aria-label="${label}">
    <span class="calculator-emi-min"></span><span class="calculator-emi-max"></span>`;
  return wrap;
}

function paint(range) {
  const pct = ((range.value - range.min) / (range.max - range.min)) * 100;
  range.style.setProperty('--fill', `${pct}%`);
}

export default function decorate(block) {
  const c = readConfig(block);
  const priceMin = num(c.priceMin, 300000);
  const priceMax = num(c.priceMax, 3000000);
  const downMin = num(c.downMin, 20);
  const downMax = num(c.downMax, 80);
  const rateMin = num(c.rateMin, 7);
  const rateMax = num(c.rateMax, 14);
  const tenures = (c.tenures || '3, 5, 7').split(',').map((t) => num(t, 0)).filter(Boolean);
  const recommended = num(c.recommended, tenures[Math.floor(tenures.length / 2)]);
  const state = {
    price: Math.min(Math.max(num(c.price, 2500000), priceMin), priceMax),
    down: downMin,
    years: recommended,
    rate: Math.min(Math.max(num(c.rate, rateMin), rateMin), rateMax),
  };

  const root = document.createElement('div');
  root.className = 'calculator-emi-inputs';

  // ex-showroom price
  const priceField = field('calculator-emi-price', 'Ex showroom price');
  priceField.querySelector('.calculator-emi-prefix').textContent = '₹';
  const priceRange = slider('calculator-emi-price', priceMin, priceMax, 10000, 'Ex showroom price');
  priceRange.querySelector('.calculator-emi-min').textContent = lakh(priceMin).replace('+', '');
  priceRange.querySelector('.calculator-emi-max').textContent = lakh(priceMax);

  // down payment (% of price)
  const downField = field('calculator-emi-down', 'Down payment');
  downField.querySelector('.calculator-emi-prefix').textContent = '₹';
  const downRange = slider('calculator-emi-down', downMin, downMax, 1, 'Down payment, percent of price');
  downRange.querySelector('.calculator-emi-min').textContent = `${downMin}% of price`;
  downRange.querySelector('.calculator-emi-max').textContent = `Max ${downMax}% of price`;

  // tenure
  const tenureField = field('calculator-emi-tenure', 'Loan tenure', 'Years');
  const tenureOptions = document.createElement('div');
  tenureOptions.className = 'calculator-emi-tenures';
  tenureOptions.setAttribute('role', 'radiogroup');
  tenureOptions.setAttribute('aria-label', 'Loan tenure');
  tenures.forEach((years) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.setAttribute('role', 'radio');
    option.dataset.years = years;
    option.innerHTML = `${years} Years${years === recommended ? '<small>Recommended</small>' : ''}`;
    tenureOptions.append(option);
  });

  // interest rate
  const rateField = field('calculator-emi-rate', 'Interest rate', '%');
  const rateRange = slider('calculator-emi-rate', rateMin, rateMax, 0.1, 'Interest rate');
  rateRange.querySelector('.calculator-emi-min').textContent = `${rateMin}%`;
  rateRange.querySelector('.calculator-emi-max').textContent = `${rateMax}%`;

  root.append(priceField, priceRange, downField, downRange);
  root.append(tenureField, tenureOptions, rateField, rateRange);

  const result = document.createElement('div');
  result.className = 'calculator-emi-result';
  result.innerHTML = '<p class="calculator-emi-amount" aria-live="polite"><strong></strong><span>/ Monthly EMI</span></p>';
  if (c.ctaLabel) {
    const cta = document.createElement('p');
    cta.className = 'button-container';
    const link = document.createElement('a');
    link.className = 'button';
    link.href = c.ctaLinkHref || c.ctaLink || '#';
    link.textContent = c.ctaLabel;
    cta.append(link);
    result.append(cta);
  }
  if (c.note) {
    const note = document.createElement('p');
    note.className = 'calculator-emi-note';
    note.textContent = c.note;
    result.append(note);
  }

  const els = {
    priceInput: priceField.querySelector('input'),
    priceRange: priceRange.querySelector('input'),
    downInput: downField.querySelector('input'),
    downRange: downRange.querySelector('input'),
    tenureInput: tenureField.querySelector('input'),
    rateInput: rateField.querySelector('input'),
    rateRange: rateRange.querySelector('input'),
    amount: result.querySelector('.calculator-emi-amount strong'),
  };

  const render = () => {
    const downAmount = Math.round((state.price * state.down) / 100);
    els.priceInput.value = inr.format(state.price);
    els.priceRange.value = state.price;
    els.downInput.value = inr.format(downAmount);
    els.downRange.value = state.down;
    els.tenureInput.value = state.years;
    els.rateInput.value = state.rate;
    els.rateRange.value = state.rate;
    [els.priceRange, els.downRange, els.rateRange].forEach(paint);
    tenureOptions.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-checked', num(b.dataset.years, 0) === state.years);
    });
    els.amount.textContent = `₹${inr.format(Math.round(emi(state.price - downAmount, state.rate, state.years)))}`;
  };

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  els.priceRange.addEventListener('input', () => { state.price = num(els.priceRange.value, state.price); render(); });
  els.downRange.addEventListener('input', () => { state.down = num(els.downRange.value, state.down); render(); });
  els.rateRange.addEventListener('input', () => { state.rate = num(els.rateRange.value, state.rate); render(); });
  els.priceInput.addEventListener('change', () => { state.price = clamp(num(els.priceInput.value, state.price), priceMin, priceMax); render(); });
  els.downInput.addEventListener('change', () => {
    const pct = (num(els.downInput.value, 0) / state.price) * 100;
    state.down = clamp(Math.round(pct), downMin, downMax);
    render();
  });
  els.tenureInput.addEventListener('change', () => { state.years = clamp(num(els.tenureInput.value, state.years), 1, 10); render(); });
  els.rateInput.addEventListener('change', () => { state.rate = clamp(num(els.rateInput.value, state.rate), rateMin, rateMax); render(); });
  tenureOptions.addEventListener('click', (e) => {
    const option = e.target.closest('button');
    if (!option) return;
    state.years = num(option.dataset.years, state.years);
    render();
  });

  block.replaceChildren(root, result);
  render();
}
