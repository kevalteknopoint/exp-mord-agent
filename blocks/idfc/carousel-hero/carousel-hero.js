import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

const AUTOPLAY_DELAY = 6000;
const VIDEO_PATTERN = /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i;

let carouselId = 0;

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// most slides carry a background video: only the active slide's video is loaded and played,
// the others stay paused with preload="none" so a 10+ slide hero doesn't fetch every mp4 up front
function buildVideo(link) {
  const video = document.createElement('video');
  video.className = 'carousel-hero-video';
  video.muted = true;
  video.loop = true;
  video.preload = 'none';
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  const source = document.createElement('source');
  source.src = link.href;
  source.type = `video/${(link.href.match(VIDEO_PATTERN)?.[1] || 'mp4').toLowerCase()}`;
  video.append(source);
  return video;
}

function decorateMedia(cell) {
  cell.className = 'carousel-hero-media';
  const videoLink = [...cell.querySelectorAll('a')].find((a) => VIDEO_PATTERN.test(a.href));
  if (videoLink) {
    const video = buildVideo(videoLink);
    const poster = cell.querySelector('picture img');
    if (poster) video.poster = poster.src;
    cell.textContent = '';
    cell.append(video);
    return;
  }
  cell.querySelectorAll('picture > img').forEach((img, i) => {
    const pic = createOptimizedPicture(img.src, img.alt, i === 0, [
      { media: '(min-width: 900px)', width: '1200' },
      { width: '750' },
    ]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
}

function decorateContent(cell) {
  cell.className = 'carousel-hero-content';
  const links = [...cell.querySelectorAll('a')];
  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'carousel-hero-ctas';
  links.forEach((a, i) => {
    a.classList.add(i === 0 ? 'carousel-hero-cta-primary' : 'carousel-hero-cta-secondary');
    const holder = a.closest('p') || a;
    // authored plain (not bold) secondary links ("Know More") are text links, not buttons
    if (i > 0 && !a.closest('strong, em')) {
      a.classList.remove('button', 'primary', 'secondary');
      holder.classList.remove('button-container');
    }
    ctaWrap.append(holder);
  });
  if (ctaWrap.children.length) cell.append(ctaWrap);
}

export default function decorate(block) {
  carouselId += 1;
  const id = `carousel-hero-${carouselId}`;
  block.id = id;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = [...block.children];
  const track = document.createElement('ul');
  track.className = 'carousel-hero-slides';

  rows.forEach((row, idx) => {
    const slide = document.createElement('li');
    slide.className = 'carousel-hero-slide';
    slide.id = `${id}-slide-${idx}`;
    slide.dataset.slideIndex = idx;
    moveInstrumentation(row, slide);

    const cells = [...row.children];
    // media is the cell carrying a picture / video link; content is the rest
    const mediaCell = cells.find((c) => c.querySelector('picture')
      || [...c.querySelectorAll('a')].some((a) => VIDEO_PATTERN.test(a.href)));
    cells.forEach((cell) => {
      if (cell === mediaCell) decorateMedia(cell);
      else decorateContent(cell);
    });
    if (mediaCell) slide.append(mediaCell);
    cells.filter((c) => c !== mediaCell).forEach((c) => slide.append(c));

    const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading?.id) slide.setAttribute('aria-labelledby', heading.id);
    track.append(slide);
  });

  block.textContent = '';
  const viewport = document.createElement('div');
  viewport.className = 'carousel-hero-viewport';
  viewport.append(track);
  block.append(viewport);

  const slides = [...track.children];
  const syncVideos = (index) => {
    slides.forEach((s, i) => {
      const video = s.querySelector('video');
      if (!video) return;
      if (i === index) {
        if (video.preload === 'none') {
          video.preload = 'auto';
          video.load();
        }
        if (!REDUCE_MOTION) video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    });
  };
  if (slides.length < 2) {
    syncVideos(0);
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'carousel-hero-controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-hero-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-hero-next';
  next.setAttribute('aria-label', 'Next slide');
  const dots = document.createElement('ol');
  dots.className = 'carousel-hero-dots';
  slides.forEach((slide, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'carousel-hero-dot';
    btn.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}`);
    btn.setAttribute('aria-controls', slide.id);
    btn.dataset.target = i;
    li.append(btn);
    dots.append(li);
  });
  controls.append(prev, dots, next);
  block.append(controls);

  let active = 0;
  const setActive = (index) => {
    active = index;
    block.dataset.activeSlide = index;
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== index);
      s.querySelectorAll('a, button').forEach((el) => {
        if (i === index) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
    dots.querySelectorAll('button').forEach((b, i) => {
      b.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
    syncVideos(index);
  };
  const show = (index, behavior = 'smooth') => {
    const target = (index + slides.length) % slides.length;
    track.scrollTo({ left: slides[target].offsetLeft, top: 0, behavior });
    setActive(target);
  };

  prev.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  dots.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) show(parseInt(btn.dataset.target, 10));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(parseInt(entry.target.dataset.slideIndex, 10));
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((s) => observer.observe(s));
  setActive(0);

  // autoplay: off in Universal Editor and for reduced-motion users; pauses on hover/focus
  const inEditor = block.hasAttribute('data-aue-resource') || !!document.querySelector('[data-aue-resource]');
  if (!REDUCE_MOTION && !inEditor) {
    let timer;
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => show(active + 1), AUTOPLAY_DELAY);
    };
    const stop = () => clearInterval(timer);
    block.addEventListener('mouseenter', stop);
    block.addEventListener('mouseleave', start);
    block.addEventListener('focusin', stop);
    block.addEventListener('focusout', start);
    start();
  }
}
