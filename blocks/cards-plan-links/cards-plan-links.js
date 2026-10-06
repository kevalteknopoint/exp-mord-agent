import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Plan Links
 * Each row = one small tile: cell 1 optional background image, cell 2 rich text (plan name + link).
 * Tiles render in a horizontally scrollable track with a progress bar and prev/next buttons
 * (controls hidden when everything fits).
 */

const BRAND = /^(Tata AIA)\s+(.+)$/;

/* "Tata AIA <plan name>" -> small "Tata AIA" eyebrow above the bold plan name (display only) */
function splitEyebrow(cell) {
  const title = [...cell.querySelectorAll('p')].find((p) => !p.classList.contains('cards-plan-links-card-link'));
  if (!title) return;
  title.classList.add('cards-plan-links-card-title');
  const strong = title.querySelector('strong');
  if (!strong || strong.children.length) return;
  const [, brand, name] = strong.textContent.trim().match(BRAND) || [];
  if (!name) return;
  const eyebrow = document.createElement('span');
  eyebrow.className = 'cards-plan-links-card-eyebrow';
  eyebrow.textContent = brand;
  strong.textContent = name;
  strong.before(eyebrow);
}

function update(block) {
  const track = block.querySelector('.cards-plan-links-track');
  const max = track.scrollWidth - track.clientWidth;
  const controls = block.querySelector('.cards-plan-links-controls');
  controls.hidden = max <= 1;
  const visible = track.scrollWidth ? Math.max(track.clientWidth / track.scrollWidth, 0.1) : 1;
  const ratio = max > 0 ? track.scrollLeft / max : 0;
  const bar = block.querySelector('.cards-plan-links-progress-bar');
  bar.style.width = `${visible * 100}%`;
  bar.style.marginLeft = `${ratio * (1 - visible) * 100}%`;
  block.querySelector('.cards-plan-links-prev').disabled = track.scrollLeft <= 1;
  block.querySelector('.cards-plan-links-next').disabled = track.scrollLeft >= max - 1;
}

function step(block, dir) {
  const track = block.querySelector('.cards-plan-links-track');
  const tile = track.querySelector('.cards-plan-links-card');
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const width = tile ? tile.getBoundingClientRect().width + gap : track.clientWidth;
  track.scrollBy({ left: dir * width, behavior: 'smooth' });
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'cards-plan-links-track';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-plan-links-card';
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-plan-links-card-image';
        li.append(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-plan-links-card-body';
        cell.querySelectorAll('a').forEach((a) => a.closest('p')?.classList.add('cards-plan-links-card-link'));
        splitEyebrow(cell);
        li.append(cell);
      }
    });
    track.append(li);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });

  const controls = document.createElement('div');
  controls.className = 'cards-plan-links-controls';
  controls.innerHTML = `
    <div class="cards-plan-links-progress" aria-hidden="true"><span class="cards-plan-links-progress-bar"></span></div>
    <div class="cards-plan-links-nav">
      <button type="button" class="cards-plan-links-prev" aria-label="Previous"></button>
      <button type="button" class="cards-plan-links-next" aria-label="Next"></button>
    </div>`;
  block.replaceChildren(track, controls);

  controls.querySelector('.cards-plan-links-prev').addEventListener('click', () => step(block, -1));
  controls.querySelector('.cards-plan-links-next').addEventListener('click', () => step(block, 1));
  track.addEventListener('scroll', () => update(block), { passive: true });
  window.addEventListener('resize', () => update(block));
  requestAnimationFrame(() => update(block));
}
