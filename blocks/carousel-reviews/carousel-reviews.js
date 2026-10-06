import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Carousel Reviews
 * Each row = one review card:
 *   cell 1: round avatar image (optional)
 *   cell 2: rich text - reviewer name (heading), plan name / date lines, an optional rating
 *           paragraph ("4/5" or "4.5 / 5"), an optional "Watch Video" link, and the quote text.
 * Centered-mode carousel: the active card sits in the middle (enlarged), neighbours are faded;
 * dot pagination and prev/next buttons.
 */

const RATING = /^(\d(?:\.\d)?)\s*\/\s*5$/;
const DATE = /^\d{1,2}(st|nd|rd|th)?\s+[A-Za-z]{3,9},?\s+\d{4}$|^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}$/;
let count = 0;

function stars(value) {
  const wrap = document.createElement('span');
  wrap.className = 'carousel-reviews-rating';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', `Rated ${value} out of 5`);
  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement('span');
    let state = 'empty';
    if (value >= i) state = 'full';
    else if (value > i - 1) state = 'half';
    star.className = `carousel-reviews-star carousel-reviews-star-${state}`;
    wrap.append(star);
  }
  return wrap;
}

function decorateBody(cell) {
  cell.className = 'carousel-reviews-body';
  cell.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    const m = text.match(RATING);
    if (m) {
      p.replaceChildren(stars(parseFloat(m[1])));
      p.classList.add('carousel-reviews-rating-line');
      return;
    }
    const a = p.querySelector('a');
    if (a && a.textContent.trim() === text) {
      p.classList.add('carousel-reviews-video');
      a.classList.add('carousel-reviews-video-link');
    }
  });
  const plain = () => [...cell.querySelectorAll(':scope > p')].filter((p) => !p.classList.length);
  const quote = plain().pop();
  if (quote) quote.classList.add('carousel-reviews-quote');

  // meta lines: "<brand> <stars>" and "<plan> <date>" (display grouping only)
  plain().forEach((p) => {
    if (DATE.test(p.textContent.trim())) p.classList.add('carousel-reviews-date');
  });
  const [brand, plan] = plain();
  brand?.classList.add('carousel-reviews-brand');
  plan?.classList.add('carousel-reviews-plan');
  const rating = cell.querySelector(':scope > .carousel-reviews-rating-line');
  const date = cell.querySelector(':scope > .carousel-reviews-date');
  if (!brand && !plan && !rating && !date) return;
  const meta = document.createElement('div');
  meta.className = 'carousel-reviews-meta';
  [[brand, rating], [plan, date]].forEach((pair) => {
    const items = pair.filter(Boolean);
    if (!items.length) return;
    const line = document.createElement('div');
    line.className = 'carousel-reviews-meta-line';
    line.append(...items);
    meta.append(line);
  });
  const heading = cell.querySelector(':scope > :is(h2, h3, h4, h5, h6)');
  if (heading) heading.after(meta);
  else cell.prepend(meta);
}

function setActive(block, index) {
  const slides = [...block.querySelectorAll('.carousel-reviews-slide')];
  slides.forEach((s, i) => {
    s.classList.toggle('carousel-reviews-active', i === index);
    s.setAttribute('aria-hidden', i !== index);
    s.querySelectorAll('a').forEach((a) => {
      if (i === index) a.removeAttribute('tabindex');
      else a.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-reviews-dot').forEach((d, i) => {
    d.setAttribute('aria-current', i === index);
  });
  block.dataset.activeSlide = index;
}

function goTo(block, index) {
  const slides = block.querySelectorAll('.carousel-reviews-slide');
  const n = slides.length;
  const target = slides[((index % n) + n) % n];
  const track = block.querySelector('.carousel-reviews-track');
  track.scrollTo({
    left: target.offsetLeft - (track.clientWidth - target.clientWidth) / 2,
    behavior: 'smooth',
  });
}

export default function decorate(block) {
  count += 1;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const track = document.createElement('ul');
  track.className = 'carousel-reviews-track';

  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'carousel-reviews-slide';
    li.id = `carousel-reviews-${count}-slide-${i}`;
    li.dataset.slideIndex = i;
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'carousel-reviews-avatar';
        li.append(cell);
      } else if (cell.textContent.trim()) {
        decorateBody(cell);
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

  const slides = [...track.children];
  const nav = document.createElement('div');
  nav.className = 'carousel-reviews-nav';
  nav.innerHTML = `
    <button type="button" class="carousel-reviews-prev" aria-label="Previous review"></button>
    <button type="button" class="carousel-reviews-next" aria-label="Next review"></button>`;
  const dots = document.createElement('ol');
  dots.className = 'carousel-reviews-dots';
  slides.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" class="carousel-reviews-dot" aria-label="Show review ${i + 1} of ${slides.length}"></button>`;
    li.firstElementChild.addEventListener('click', () => goTo(block, i));
    dots.append(li);
  });

  const viewport = document.createElement('div');
  viewport.className = 'carousel-reviews-viewport';
  viewport.append(track, nav);
  block.replaceChildren(viewport, dots);

  if (slides.length < 2) {
    nav.hidden = true;
    dots.hidden = true;
    setActive(block, 0);
    return;
  }

  nav.querySelector('.carousel-reviews-prev').addEventListener('click', () => goTo(block, Number(block.dataset.activeSlide || 0) - 1));
  nav.querySelector('.carousel-reviews-next').addEventListener('click', () => goTo(block, Number(block.dataset.activeSlide || 0) + 1));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) setActive(block, Number(e.target.dataset.slideIndex));
    });
  }, { root: track, threshold: 0.75 });
  slides.forEach((s) => observer.observe(s));

  const start = Math.floor((slides.length - 1) / 2);
  setActive(block, start);
  requestAnimationFrame(() => {
    const target = slides[start];
    track.scrollLeft = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
  });
}
