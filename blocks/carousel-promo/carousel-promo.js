import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Carousel Promo
 * Each row = one promo banner slide: cell 1 photo, cell 2 rich text (tag paragraph before the
 * heading, heading, CTA link, fine-print paragraph after the CTA), cell 3 rich text stats
 * (list - one item per stat, value in <strong>).
 * Wide gradient banner; slides scroll horizontally with dots and gentle autoplay.
 */

const AUTOPLAY_MS = 6000;

function decorateText(cell) {
  cell.className = 'carousel-promo-text';
  const heading = cell.querySelector('h1, h2, h3, h4');
  const children = [...cell.children];
  const headingIndex = heading ? children.indexOf(heading) : -1;
  const cta = children.find((el) => el.querySelector('a'));
  children.forEach((el, i) => {
    if (el === heading) el.classList.add('carousel-promo-title');
    else if (el === cta) {
      el.className = 'carousel-promo-cta';
      el.querySelectorAll('a').forEach((a) => { a.className = 'carousel-promo-button'; });
    } else if (headingIndex > -1 && i < headingIndex) el.classList.add('carousel-promo-tag');
    else el.classList.add('carousel-promo-fine');
  });
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-promo-track';

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.className = 'carousel-promo-slide';
    moveInstrumentation(row, li);
    const [imageCell, textCell, statsCell] = [...row.children];
    if (textCell) {
      decorateText(textCell);
      li.append(textCell);
    }
    if (statsCell && statsCell.textContent.trim()) {
      statsCell.className = 'carousel-promo-stats';
      li.append(statsCell);
    }
    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'carousel-promo-media';
      const picture = createOptimizedPicture(img.src, img.alt, index === 0, [{ width: '750' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }
    track.append(li);
  });

  const slides = [...track.children];
  block.replaceChildren(track);
  if (slides.length < 2) return;

  const dots = document.createElement('div');
  dots.className = 'carousel-promo-dots';
  const goTo = (i) => {
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  };
  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}`);
    dot.addEventListener('click', () => goTo(i));
    dots.append(dot);
  });
  block.append(dots);

  let current = 0;
  const setActive = (i) => {
    current = i;
    [...dots.children].forEach((dot, n) => dot.setAttribute('aria-current', n === i));
    slides.forEach((slide, n) => slide.setAttribute('aria-hidden', n !== i));
  };
  setActive(0);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        setActive(slides.indexOf(entry.target));
      }
    });
  }, { root: track, threshold: [0.6] });
  slides.forEach((slide) => observer.observe(slide));

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let timer = setInterval(() => goTo((current + 1) % slides.length), AUTOPLAY_MS);
    const pause = () => { clearInterval(timer); timer = null; };
    block.addEventListener('pointerenter', pause);
    block.addEventListener('focusin', pause);
    block.addEventListener('pointerleave', () => {
      if (!timer) timer = setInterval(() => goTo((current + 1) % slides.length), AUTOPLAY_MS);
    });
  }
}
