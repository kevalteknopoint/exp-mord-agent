import { moveInstrumentation } from '../../../scripts/scripts.js';
import { fetchPlaceholders } from '../../../scripts/placeholders.js';

/*
 * "Feature turntable" (source: .block-feature-turntable on dept.global).
 * An infinitely looping row of slides; the centred slide is full size and its
 * neighbours shrink, fade and blur with their distance from the centre. Motion is
 * driven by the dots and by drag/swipe only (no autoplay, not scroll-linked).
 * Values below were measured from the live source:
 * - scale = opacity = 1 - 0.45 * distance (distance in slides from centre)
 * - blur = min(1px, (1 - scale) * 10px)
 * - title/description --opacity = 1 - 0.7875 * distance
 * - easing: the source's spring integrator (duration 25, friction 0.68 per 60fps frame)
 */
const SCALE_STEP = 0.45;
const TEXT_STEP = 0.7875;
const BLUR_FACTOR = 10;
const SPRING_DURATION = 25;
const SPRING_FRICTION = 0.68;
const FRAME_MS = 1000 / 60;
const SETTLE_EPSILON = 0.0005;
const DRAG_THRESHOLD_PX = 5;
const FLICK_VELOCITY = 0.3; // px per ms

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const mod = (value, n) => ((value % n) + n) % n;

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-culture-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-culture-slide');

  const item = document.createElement('div');
  item.classList.add('carousel-culture-item');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-culture-slide-${colIdx === 0 ? 'image' : 'content'}`);
    item.append(column);
  });
  slide.append(item);

  item.querySelectorAll('img').forEach((img) => {
    img.draggable = false;
    img.decoding = 'async';
  });

  // second line of the title (after the <br>) gets the accent colour
  const content = item.querySelector('.carousel-culture-slide-content');
  const title = content?.querySelector('p, h1, h2, h3, h4, h5, h6');
  if (title) {
    title.classList.add('carousel-culture-title');
    const br = title.querySelector(':scope > br');
    if (br) {
      const accent = document.createElement('span');
      accent.classList.add('carousel-culture-accent');
      while (br.nextSibling) accent.append(br.nextSibling);
      title.append(accent);
    }
    title.id = title.id || `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', title.id);
  }
  const description = title?.nextElementSibling;
  if (description) description.classList.add('carousel-culture-description');

  return slide;
}

function initTurntable(block, track, slides, dots) {
  const n = slides.length;
  const items = slides.map((slide) => slide.querySelector('.carousel-culture-item'));
  const state = {
    pos: 0, // current position in slides (slide i is centred when pos ≡ i mod n)
    target: 0,
    velocity: 0,
    active: -1,
    slideWidth: 0,
    centre: 0,
    raf: 0,
    lastTime: 0,
    acc: 0,
  };

  function setActive(index) {
    const active = mod(index, n);
    if (active === state.active) return;
    state.active = active;
    block.dataset.activeSlide = active;
    slides.forEach((slide, i) => {
      const isActive = i === active;
      slide.setAttribute('aria-hidden', !isActive);
      slide.querySelectorAll('a, button').forEach((el) => {
        if (isActive) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === active);
      dot.setAttribute('aria-pressed', i === active);
    });
  }

  function render() {
    const { pos, slideWidth, centre } = state;
    slides.forEach((slide, i) => {
      // signed distance from the centre, wrapped into (-n/2, n/2] for the infinite loop
      const offset = n / 2 - mod(n / 2 - (i - pos), n);
      const x = centre + (offset - i) * slideWidth;
      slide.style.transform = `translate3d(${x}px, 0, 0)`;

      const distance = Math.abs(offset);
      const scale = Math.max(0, 1 - SCALE_STEP * distance);
      const item = items[i];
      item.style.scale = scale;
      item.style.opacity = scale;
      item.style.filter = `blur(${Math.min(1, (1 - scale) * BLUR_FACTOR)}px)`;
      item.style.setProperty('--opacity', Math.max(0, 1 - TEXT_STEP * distance));
    });
  }

  function measure() {
    state.slideWidth = slides[0].offsetWidth;
    state.centre = (block.clientWidth - state.slideWidth) / 2;
    render();
  }

  function settle() {
    state.pos = mod(state.target, n);
    state.target = state.pos;
    state.velocity = 0;
    state.raf = 0;
    render();
  }

  function step() {
    const diff = state.target - state.pos;
    state.velocity = (state.velocity + diff / SPRING_DURATION) * SPRING_FRICTION;
    state.pos += state.velocity;
  }

  function frame(time) {
    state.acc += Math.min(time - state.lastTime, 100);
    state.lastTime = time;
    while (state.acc >= FRAME_MS) {
      state.acc -= FRAME_MS;
      step();
    }
    if (Math.abs(state.target - state.pos) < SETTLE_EPSILON
      && Math.abs(state.velocity) < SETTLE_EPSILON) {
      settle();
      return;
    }
    render();
    state.raf = requestAnimationFrame(frame);
  }

  function animate() {
    if (reducedMotion.matches) {
      cancelAnimationFrame(state.raf);
      settle();
      return;
    }
    if (state.raf) return;
    // like the source, the first step is taken in the same frame as the click
    step();
    render();
    state.acc = 0;
    state.lastTime = performance.now();
    state.raf = requestAnimationFrame(frame);
  }

  function goTo(index) {
    // shortest way round the loop
    let delta = mod(index - state.target, n);
    if (delta > n / 2) delta -= n;
    state.target += delta;
    setActive(index);
    animate();
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  dots[0].closest('ol').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = mod(state.active + (e.key === 'ArrowRight' ? 1 : -1), n);
    goTo(next);
    dots[next].focus();
  });

  // drag / swipe (vertical page scrolling stays native via touch-action: pan-y)
  let drag = null;
  let suppressClick = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.velocity = 0;
    drag = {
      id: e.pointerId,
      startX: e.clientX,
      startPos: state.pos,
      lastX: e.clientX,
      lastTime: e.timeStamp,
      speed: 0,
      moved: false,
    };
  });
  track.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
    if (!drag.moved) {
      drag.moved = true;
      track.setPointerCapture(e.pointerId);
      block.classList.add('is-dragging');
    }
    const dt = e.timeStamp - drag.lastTime;
    if (dt > 0) drag.speed = (e.clientX - drag.lastX) / dt;
    drag.lastX = e.clientX;
    drag.lastTime = e.timeStamp;
    state.pos = drag.startPos - dx / state.slideWidth;
    state.target = state.pos;
    setActive(Math.round(state.pos));
    render();
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const { moved, speed, startPos } = drag;
    drag = null;
    block.classList.remove('is-dragging');
    if (moved) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; });
      let target = Math.round(state.pos);
      if (target === Math.round(startPos) && Math.abs(speed) > FLICK_VELOCITY) {
        target += speed < 0 ? 1 : -1;
      }
      state.target = target;
      setActive(target);
    }
    animate();
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('click', (e) => {
    if (!suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  new ResizeObserver(measure).observe(block);
  setActive(0);
  measure();
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-culture-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-culture-slides-container');
  const track = document.createElement('ul');
  track.classList.add('carousel-culture-slides');
  container.append(track);

  const slides = rows.map((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    moveInstrumentation(row, slide);
    track.append(slide);
    row.remove();
    return slide;
  });
  block.prepend(container);

  if (slides.length < 2) {
    block.classList.add('is-single');
    return;
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
  const list = document.createElement('ol');
  list.classList.add('carousel-culture-slide-indicators');
  const dots = slides.map((slide, idx) => {
    const li = document.createElement('li');
    li.classList.add('carousel-culture-slide-indicator');
    li.dataset.targetSlide = idx;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-controls', slide.id);
    button.setAttribute('aria-label', `${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${slides.length}`);
    li.append(button);
    list.append(li);
    return button;
  });
  nav.append(list);
  block.append(nav);

  initTurntable(block, track, slides, dots);
}
