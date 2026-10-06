/*
 * Columns Calculator
 * One row, two columns:
 *   column 1: heading + fine print
 *             (the gender toggle and age slider are injected after the heading)
 *   column 2: price label ("Monthly premium"), price ("₹ 589"), CTA link ("Buy Now"),
 *             optional rate list - one item per age: "<age> <male premium> [<female premium>]"
 *             e.g. "20 589 549". The list is hidden and drives the displayed price.
 * Without a rate list the authored price stays as-is; the selections are always appended
 * to the CTA URL as query parameters.
 */

const DEFAULT_MIN = 20;
const DEFAULT_MAX = 65;

function parseRates(list) {
  if (!list) return [];
  return [...list.querySelectorAll('li')].map((li) => {
    const nums = (li.textContent.replace(/,/g, '').match(/\d+(\.\d+)?/g) || []).map(Number);
    return { age: nums[0], male: nums[1], female: nums[2] ?? nums[1] };
  }).filter((r) => Number.isFinite(r.age) && Number.isFinite(r.male))
    .sort((a, b) => a.age - b.age);
}

function rateFor(rates, age, gender) {
  let match = rates[0];
  rates.forEach((r) => { if (r.age <= age) match = r; });
  return match ? match[gender] : null;
}

function formatInr(value) {
  return Math.round(value).toLocaleString('en-IN');
}

let calcCount = 0;

export default function decorate(block) {
  calcCount += 1;
  const id = `columns-calculator-${calcCount}`;
  const row = block.firstElementChild;
  if (!row) return;
  const [inputCol, resultCol] = [...row.children];
  row.classList.add('columns-calculator-row');
  if (inputCol) inputCol.classList.add('columns-calculator-inputs');
  if (resultCol) resultCol.classList.add('columns-calculator-result');

  // result column: price, CTA and optional rate list
  let priceEl = null;
  let cta = null;
  let rates = [];
  if (resultCol) {
    const list = resultCol.querySelector('ul, ol');
    rates = parseRates(list);
    if (list && rates.length) list.remove();
    cta = resultCol.querySelector('a');
    if (cta) cta.closest('p')?.classList.add('columns-calculator-cta');
    priceEl = [...resultCol.querySelectorAll('p, h2, h3, h4, strong')]
      .find((n) => /₹|\d/.test(n.textContent) && !n.querySelector('a') && !n.closest('a'));
    if (priceEl) priceEl.classList.add('columns-calculator-price');
    const label = [...resultCol.querySelectorAll(':scope > p, :scope > div > p')]
      .find((p) => p !== priceEl && !p.contains(priceEl) && !p.querySelector('a'));
    if (label) label.classList.add('columns-calculator-price-label');
  }

  const minAge = rates.length ? rates[0].age : DEFAULT_MIN;
  const maxAge = rates.length > 1 ? rates[rates.length - 1].age : DEFAULT_MAX;

  const controls = document.createElement('div');
  controls.className = 'columns-calculator-controls';
  controls.innerHTML = `
    <fieldset class="columns-calculator-gender">
      <legend>Gender</legend>
      <label><input type="radio" name="${id}-gender" value="male" checked><span>Male</span></label>
      <label><input type="radio" name="${id}-gender" value="female"><span>Female</span></label>
    </fieldset>
    <div class="columns-calculator-age">
      <label for="${id}-age">Age</label>
      <div class="columns-calculator-age-control">
        <div class="columns-calculator-slider">
          <input type="range" id="${id}-age" min="${minAge}" max="${maxAge}" step="1" value="${minAge}">
          <div class="columns-calculator-range" aria-hidden="true"><span>${minAge}</span><span>${maxAge}</span></div>
        </div>
        <output class="columns-calculator-age-value" for="${id}-age">${minAge}</output>
      </div>
    </div>`;

  if (inputCol) {
    const heading = inputCol.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.after(controls);
    else inputCol.prepend(controls);
    const fine = [...inputCol.querySelectorAll(':scope > p')].filter((p) => !controls.contains(p));
    fine.forEach((p) => p.classList.add('columns-calculator-fineprint'));
  }

  const slider = controls.querySelector('input[type=range]');
  const ageOut = controls.querySelector('output');
  const ctaBase = cta ? cta.href : null;

  const refresh = () => {
    const age = Number(slider.value);
    const gender = controls.querySelector('input[type=radio]:checked').value;
    ageOut.textContent = age;
    const pct = ((age - minAge) / Math.max(maxAge - minAge, 1)) * 100;
    slider.style.setProperty('--columns-calculator-fill', `${pct}%`);
    const rate = rateFor(rates, age, gender);
    if (priceEl && rate != null) priceEl.textContent = `₹ ${formatInr(rate)}`;
    if (cta && ctaBase) {
      const url = new URL(ctaBase, window.location.href);
      url.searchParams.set('age', age);
      url.searchParams.set('gender', gender);
      cta.href = url.toString();
    }
  };

  slider.addEventListener('input', refresh);
  controls.querySelectorAll('input[type=radio]').forEach((r) => r.addEventListener('change', refresh));
  refresh();
}
