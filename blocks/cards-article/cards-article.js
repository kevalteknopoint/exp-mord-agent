import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Article
 * Each row = one article card: cell 1 image, cell 2 rich text (title heading, optional link).
 * Cards render in a horizontal scroll-snap track (4 visible on desktop) with a progress bar
 * and prev/next buttons; the controls hide themselves when every card fits.
 */

function update(block) {
  const track = block.querySelector('.cards-article-track');
  const controls = block.querySelector('.cards-article-controls');
  const max = track.scrollWidth - track.clientWidth;
  controls.hidden = max <= 1;
  const visible = track.scrollWidth ? Math.max(track.clientWidth / track.scrollWidth, 0.1) : 1;
  const ratio = max > 0 ? track.scrollLeft / max : 0;
  const bar = block.querySelector('.cards-article-progress-bar');
  bar.style.width = `${visible * 100}%`;
  bar.style.marginLeft = `${ratio * (1 - visible) * 100}%`;
  block.querySelector('.cards-article-prev').disabled = track.scrollLeft <= 1;
  block.querySelector('.cards-article-next').disabled = track.scrollLeft >= max - 1;
}

function step(block, dir) {
  const track = block.querySelector('.cards-article-track');
  const card = track.querySelector(':scope > li');
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const width = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  track.scrollBy({ left: dir * width, behavior: 'smooth' });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-article-track';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-article-card-image';
      else div.className = 'cards-article-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const controls = document.createElement('div');
  controls.className = 'cards-article-controls';
  controls.hidden = true;
  controls.innerHTML = `
    <div class="cards-article-progress" aria-hidden="true"><span class="cards-article-progress-bar"></span></div>
    <div class="cards-article-nav">
      <button type="button" class="cards-article-prev" aria-label="Previous articles"></button>
      <button type="button" class="cards-article-next" aria-label="Next articles"></button>
    </div>`;

  block.replaceChildren(ul, controls);

  controls.querySelector('.cards-article-prev').addEventListener('click', () => step(block, -1));
  controls.querySelector('.cards-article-next').addEventListener('click', () => step(block, 1));
  ul.addEventListener('scroll', () => update(block), { passive: true });
  window.addEventListener('resize', () => update(block));
  requestAnimationFrame(() => update(block));
}
