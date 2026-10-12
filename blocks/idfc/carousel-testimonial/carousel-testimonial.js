import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

// decorative avatar bubble positions (x%, y%, size px), alternating left / right edge
const BUBBLES = [
  [6, 4, 128], [94, 8, 80], [2, 34, 100], [88, 22, 92], [7, 62, 72],
  [95, 42, 128], [2, 82, 64], [90, 80, 64], [14, 90, 56], [80, 94, 56],
];

const DATE_PATTERN = /^(\d{1,2}\s+[a-z]+\.?,?\s+\d{4}|[a-z]+\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})$/i;

function optimize(scope, width) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
}

function buildCard(row) {
  const card = document.createElement('li');
  card.className = 'carousel-testimonial-card';
  moveInstrumentation(row, card);
  const cells = [...row.children];
  const avatarCell = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
  const body = document.createElement('blockquote');
  body.className = 'carousel-testimonial-body';
  cells.filter((c) => c !== avatarCell).forEach((c) => {
    while (c.firstChild) body.append(c.firstChild);
  });
  body.querySelectorAll('p:empty').forEach((p) => p.remove());
  const name = body.querySelector('strong, b, h3, h4, h5, h6');
  const nameEl = name && (name.closest('p') || name);
  if (nameEl) nameEl.classList.add('carousel-testimonial-name');
  // cards are date + name + quote; the source alternates the order (quote first on some cards),
  // so the date is recognised by its shape ("6 October 2026") rather than by position
  [...body.children].filter((el) => el !== nameEl).forEach((el) => {
    const isDate = DATE_PATTERN.test(el.textContent.trim());
    el.classList.add(isDate ? 'carousel-testimonial-date' : 'carousel-testimonial-quote');
  });
  if (avatarCell) {
    avatarCell.className = 'carousel-testimonial-avatar';
    optimize(avatarCell, '120');
    card.append(avatarCell);
  }
  card.append(body);
  return card;
}

export default function decorate(block) {
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const decor = document.createElement('div');
  decor.className = 'carousel-testimonial-decor';
  decor.setAttribute('aria-hidden', 'true');
  const track = document.createElement('ul');
  track.className = 'carousel-testimonial-track';

  [...block.children].forEach((row) => {
    // rows with only images (no copy) are the decorative avatar bubbles
    if (row.querySelector('picture') && !row.textContent.trim()) {
      moveInstrumentation(row, decor);
      row.querySelectorAll('picture').forEach((pic) => {
        const bubble = document.createElement('span');
        bubble.className = 'carousel-testimonial-bubble';
        const [x, y, size] = BUBBLES[decor.children.length % BUBBLES.length];
        bubble.style.setProperty('--carousel-testimonial-x', `${x}%`);
        bubble.style.setProperty('--carousel-testimonial-y', `${y}%`);
        bubble.style.setProperty('--carousel-testimonial-size', `${size}px`);
        bubble.append(pic);
        decor.append(bubble);
      });
      return;
    }
    track.append(buildCard(row));
  });
  optimize(decor, '160');
  decor.querySelectorAll('img').forEach((img) => { img.alt = ''; });

  const viewport = document.createElement('div');
  viewport.className = 'carousel-testimonial-viewport';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-testimonial-prev';
  prev.setAttribute('aria-label', 'Previous testimonial');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-testimonial-next';
  next.setAttribute('aria-label', 'Next testimonial');
  viewport.append(prev, track, next);

  block.textContent = '';
  if (decor.children.length) block.append(decor);
  block.append(viewport);

  const step = () => {
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 1;
    prev.disabled = track.scrollLeft <= 0;
    next.disabled = track.scrollLeft >= max;
    prev.hidden = max <= 0;
    next.hidden = max <= 0;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  requestAnimationFrame(update);
}
