import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Carousel Showcase
 * Each row = one hero slide: cell 1 car image, cell 2 rich text (heading, model paragraph,
 * price paragraphs with the amount in <strong>, an italic-only paragraph = availability badge,
 * CTA links - an italic link renders as the outline button).
 * Dark slides with the car on top (mobile) / beside the text (desktop); dots + autoplay.
 */

const AUTOPLAY_MS = 6000;

function decorateBody(cell) {
  cell.className = 'carousel-showcase-body';
  const heading = cell.querySelector('h1, h2, h3');
  const actions = document.createElement('div');
  actions.className = 'carousel-showcase-actions';
  let model = false;
  [...cell.children].forEach((el) => {
    if (el === heading || el.tagName !== 'P') return;
    if (el.classList.contains('button-container')) {
      actions.append(el);
    } else if (el.querySelector('strong')) {
      el.classList.add('carousel-showcase-price');
    } else if (el.children.length === 1 && el.firstElementChild.tagName === 'EM'
      && el.textContent.trim() === el.firstElementChild.textContent.trim()) {
      el.classList.add('carousel-showcase-badge');
    } else if (!model) {
      el.classList.add('carousel-showcase-model');
      model = true;
    }
  });
  if (actions.children.length) cell.append(actions);
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-showcase-track';

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.className = 'carousel-showcase-slide';
    moveInstrumentation(row, li);
    const [imageCell, textCell] = [...row.children];
    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'carousel-showcase-media';
      const picture = createOptimizedPicture(img.src, img.alt, index === 0, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }
    if (textCell) {
      decorateBody(textCell);
      li.append(textCell);
    }
    track.append(li);
  });

  const slides = [...track.children];
  block.replaceChildren(track);
  if (slides.length < 2) return;

  const dots = document.createElement('div');
  dots.className = 'carousel-showcase-dots';
  let current = 0;
  const show = (i) => {
    current = i;
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  };
  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}`);
    dot.addEventListener('click', () => show(i));
    dots.append(dot);
  });
  block.append(dots);

  const setActive = (i) => {
    current = i;
    [...dots.children].forEach((dot, n) => dot.setAttribute('aria-current', n === i));
    slides.forEach((slide, n) => slide.setAttribute('aria-hidden', n !== i));
  };
  setActive(0);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(slides.indexOf(entry.target));
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((slide) => observer.observe(slide));

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let timer = setInterval(() => show((current + 1) % slides.length), AUTOPLAY_MS);
    block.addEventListener('pointerenter', () => { clearInterval(timer); timer = null; });
    block.addEventListener('focusin', () => { clearInterval(timer); timer = null; });
    block.addEventListener('pointerleave', () => {
      if (!timer) timer = setInterval(() => show((current + 1) % slides.length), AUTOPLAY_MS);
    });
  }
}
