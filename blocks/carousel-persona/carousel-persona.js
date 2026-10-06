import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Carousel Persona
 * Each row = one slide card:
 *   cell 1 round avatar image, cell 2 rich text (heading + paragraph, inline links).
 * Renders a scroll-snap track (1 / 2 / 3 cards visible), a progress bar and prev/next buttons.
 */

let carouselCount = 0;

function updateControls(block) {
  const track = block.querySelector('.carousel-persona-track');
  const max = track.scrollWidth - track.clientWidth;
  const ratio = max > 0 ? track.scrollLeft / max : 1;
  const visible = track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1;
  const bar = block.querySelector('.carousel-persona-progress-bar');
  if (bar) {
    bar.style.width = `${Math.max(visible, 0.1) * 100}%`;
    bar.style.marginLeft = `${ratio * (1 - Math.max(visible, 0.1)) * 100}%`;
  }
  // highlight the first (left-most) visible card
  const slides = [...track.children];
  const { left } = track.getBoundingClientRect();
  const active = Math.max(
    slides.findIndex((s) => s.getBoundingClientRect().right - left > s.offsetWidth / 2),
    0,
  );
  slides.forEach((s, i) => s.classList.toggle('carousel-persona-active', i === active));
  const prev = block.querySelector('.carousel-persona-prev');
  const next = block.querySelector('.carousel-persona-next');
  if (prev) prev.disabled = track.scrollLeft <= 1;
  if (next) next.disabled = track.scrollLeft >= max - 1;
}

function step(block, dir) {
  const track = block.querySelector('.carousel-persona-track');
  const slide = track.querySelector('.carousel-persona-slide');
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const width = slide ? slide.getBoundingClientRect().width + gap : track.clientWidth;
  track.scrollBy({ left: dir * width, behavior: 'smooth' });
}

export default function decorate(block) {
  carouselCount += 1;
  block.id = block.id || `carousel-persona-${carouselCount}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const track = document.createElement('ul');
  track.className = 'carousel-persona-track';

  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'carousel-persona-slide';
    li.setAttribute('aria-roledescription', 'slide');
    li.setAttribute('aria-label', `${i + 1}`);
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'carousel-persona-avatar';
        li.append(cell);
      } else if (cell.textContent.trim()) {
        cell.className = 'carousel-persona-body';
        li.append(cell);
      }
    });
    track.append(li);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });

  const controls = document.createElement('div');
  controls.className = 'carousel-persona-controls';
  controls.innerHTML = `
    <div class="carousel-persona-progress" aria-hidden="true"><span class="carousel-persona-progress-bar"></span></div>
    <div class="carousel-persona-nav">
      <button type="button" class="carousel-persona-prev" aria-label="Previous slide"></button>
      <button type="button" class="carousel-persona-next" aria-label="Next slide"></button>
    </div>`;

  block.replaceChildren(track, controls);

  if (track.children.length < 2) {
    controls.hidden = true;
    return;
  }

  controls.querySelector('.carousel-persona-prev').addEventListener('click', () => step(block, -1));
  controls.querySelector('.carousel-persona-next').addEventListener('click', () => step(block, 1));
  track.addEventListener('scroll', () => updateControls(block), { passive: true });
  window.addEventListener('resize', () => updateControls(block));
  requestAnimationFrame(() => updateControls(block));
}
