import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

let featuresId = 0;

function optimize(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
}

function buildCard(row, index) {
  const card = document.createElement('li');
  card.className = 'carousel-features-card';
  moveInstrumentation(row, card);

  const cells = [...row.children];
  const iconCell = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
  if (iconCell) {
    iconCell.className = 'carousel-features-icon';
    optimize(iconCell);
    card.append(iconCell);
  }

  const body = document.createElement('div');
  body.className = 'carousel-features-body';
  cells.filter((c) => c !== iconCell).forEach((c) => {
    while (c.firstChild) body.append(c.firstChild);
  });

  // the title stays visible; everything after it is revealed by "Read more"
  const title = body.querySelector('h1, h2, h3, h4, h5, h6') || body.firstElementChild;
  const detail = document.createElement('div');
  detail.className = 'carousel-features-detail';
  detail.id = `carousel-features-${featuresId}-detail-${index}`;
  [...body.children].filter((el) => el !== title).forEach((el) => detail.append(el));
  // the revealed "Apply Now" is a plain text link under the description, not a button
  detail.querySelectorAll('a').forEach((a) => {
    a.classList.add('carousel-features-cta');
    if (!a.closest('strong, em')) {
      a.classList.remove('button', 'primary', 'secondary');
      a.closest('.button-container')?.classList.remove('button-container');
    }
  });
  card.append(body);

  if (detail.textContent.trim() || detail.querySelector('picture')) {
    detail.hidden = true;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'carousel-features-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', detail.id);
    toggle.textContent = 'Read more';
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? 'Read less' : 'Read more';
      detail.hidden = !open;
      card.classList.toggle('carousel-features-card-open', open);
    });
    body.append(detail, toggle);
  }
  return card;
}

export default function decorate(block) {
  featuresId += 1;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const track = document.createElement('ul');
  track.className = 'carousel-features-track';
  [...block.children].forEach((row, i) => track.append(buildCard(row, i)));

  const nav = document.createElement('div');
  nav.className = 'carousel-features-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-features-prev';
  prev.setAttribute('aria-label', 'Previous');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-features-next';
  next.setAttribute('aria-label', 'Next');
  nav.append(prev, next);

  block.textContent = '';
  block.append(nav, track);

  const step = () => {
    const card = track.querySelector('.carousel-features-card');
    if (!card) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 1;
    prev.disabled = track.scrollLeft <= 0;
    next.disabled = track.scrollLeft >= max;
    nav.hidden = max <= 0;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  requestAnimationFrame(update);
}
