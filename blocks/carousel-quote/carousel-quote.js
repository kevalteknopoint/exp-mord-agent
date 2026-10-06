import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Carousel Quote
 * Each row = one testimonial slide:
 *   cell 1: avatar image (optional)
 *   cell 2: rich text - quote paragraph(s), customer name (bold paragraph), role paragraph
 * Scroll-snap track (1 card visible on mobile, 2-3 on wider screens) with prev/next buttons.
 */

let count = 0;

const ICONS = {
  prev: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function decorateBody(cell) {
  cell.className = 'carousel-quote-body';
  const paras = [...cell.querySelectorAll(':scope > p')];
  const nameIndex = paras.findIndex((p) => {
    const strong = p.querySelector('strong, b');
    return strong && strong.textContent.trim() === p.textContent.trim();
  });
  const quoteParas = nameIndex > -1 ? paras.slice(0, nameIndex) : paras;
  const name = nameIndex > -1 ? paras[nameIndex] : null;
  const role = nameIndex > -1 ? paras[nameIndex + 1] : null;

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'carousel-quote-text';
  if (quoteParas.length) {
    quoteParas[0].before(blockquote);
    blockquote.append(...quoteParas);
  } else {
    cell.prepend(blockquote);
  }
  name?.classList.add('carousel-quote-name');
  role?.classList.add('carousel-quote-role');
  return { name, role };
}

function updateNav(block) {
  const track = block.querySelector('.carousel-quote-track');
  const prev = block.querySelector('.carousel-quote-prev');
  const next = block.querySelector('.carousel-quote-next');
  if (!track || !prev || !next) return;
  const max = track.scrollWidth - track.clientWidth;
  prev.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= max - 2;
  block.classList.toggle('carousel-quote-static', max <= 2);
}

function step(block, direction) {
  const track = block.querySelector('.carousel-quote-track');
  const slide = track.querySelector('.carousel-quote-slide');
  if (!slide) return;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  track.scrollBy({ left: direction * (slide.getBoundingClientRect().width + gap), behavior: 'smooth' });
}

export default function decorate(block) {
  count += 1;
  const trackId = `carousel-quote-${count}-track`;
  const label = block.closest('.section')?.querySelector('h2, h3')?.textContent.trim() || 'Testimonials';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', label);

  const track = document.createElement('ul');
  track.className = 'carousel-quote-track';
  track.id = trackId;
  track.tabIndex = 0;
  track.setAttribute('aria-label', `${label} slides`);

  const rows = [...block.children];
  rows.forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'carousel-quote-slide';
    li.setAttribute('role', 'group');
    li.setAttribute('aria-roledescription', 'slide');
    li.setAttribute('aria-label', `${i + 1} of ${rows.length}`);
    moveInstrumentation(row, li);

    const card = document.createElement('figure');
    card.className = 'carousel-quote-card';
    let avatar = null;
    let body = null;
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'carousel-quote-avatar';
        avatar = cell;
      } else if (cell.textContent.trim()) {
        body = cell;
      }
    });

    if (body) {
      const { name, role } = decorateBody(body);
      const caption = document.createElement('figcaption');
      caption.className = 'carousel-quote-author';
      if (avatar) caption.append(avatar);
      const who = document.createElement('div');
      who.className = 'carousel-quote-who';
      if (name) who.append(name);
      if (role) who.append(role);
      if (who.children.length) caption.append(who);
      card.append(body);
      if (caption.children.length) card.append(caption);
    } else if (avatar) {
      card.append(avatar);
    }
    li.append(card);
    track.append(li);
  });

  const nav = document.createElement('div');
  nav.className = 'carousel-quote-nav';
  nav.innerHTML = `
    <button type="button" class="carousel-quote-prev" aria-controls="${trackId}" aria-label="Previous testimonial">${ICONS.prev}</button>
    <button type="button" class="carousel-quote-next" aria-controls="${trackId}" aria-label="Next testimonial">${ICONS.next}</button>`;

  block.replaceChildren(track, nav);

  nav.querySelector('.carousel-quote-prev').addEventListener('click', () => step(block, -1));
  nav.querySelector('.carousel-quote-next').addEventListener('click', () => step(block, 1));

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateNav(block);
      ticking = false;
    });
  }, { passive: true });

  if (window.ResizeObserver) {
    new ResizeObserver(() => updateNav(block)).observe(track);
  }
  updateNav(block);
}
