import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Dealer Finder
 * Key-value block (one row per setting): label (field label, e.g. "Pincode / Locality"),
 * pincode (prefilled value), result (e.g. "4 dealers near you"), map (image),
 * action (dealer locator page URL; the search is sent as ?pincode=).
 * Renders a pincode search field, the result line and the map preview.
 */

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [key, value] = [...row.children];
    if (!key || !value) return;
    const name = key.textContent.trim();
    config[name] = value;
  });
  return config;
}

const text = (cell) => (cell?.textContent || '').trim();

export default function decorate(block) {
  const c = readConfig(block);

  const form = document.createElement('form');
  form.className = 'dealer-finder-form';
  form.method = 'get';
  form.action = c.action?.querySelector('a')?.getAttribute('href') || text(c.action) || '/dealer-locator';
  form.setAttribute('role', 'search');
  form.innerHTML = `<label class="dealer-finder-field"><span>${text(c.label) || 'Pincode / Locality'}</span>
    <input type="text" name="pincode" inputmode="numeric" autocomplete="postal-code"></label>
    <button type="submit" class="dealer-finder-submit" aria-label="Find dealers"></button>`;
  form.querySelector('input').value = text(c.pincode);

  const result = document.createElement('p');
  result.className = 'dealer-finder-result';
  result.textContent = text(c.result);

  const info = document.createElement('div');
  info.className = 'dealer-finder-info';
  info.append(form);
  if (result.textContent) info.append(result);

  const map = document.createElement('div');
  map.className = 'dealer-finder-map';
  const img = c.map?.querySelector('img');
  if (img) {
    map.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]));
  }

  block.replaceChildren(info, map);
}
