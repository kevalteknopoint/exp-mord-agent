import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

function buildCard(row) {
  const card = document.createElement('li');
  card.className = 'carousel-spotlight-card';
  moveInstrumentation(row, card);

  const cells = [...row.children];
  const iconCell = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
  const body = document.createElement('div');
  body.className = 'carousel-spotlight-body';
  cells.filter((c) => c !== iconCell).forEach((c) => {
    while (c.firstChild) body.append(c.firstChild);
  });
  // the last link is the arrow CTA pinned to the bottom of the card
  const links = [...body.querySelectorAll('a')];
  const cta = links[links.length - 1];
  if (cta) {
    // an arrow text link, so drop the default button decoration
    cta.classList.remove('button', 'primary', 'secondary');
    cta.classList.add('carousel-spotlight-cta');
    const holder = cta.closest('p') || cta;
    holder.classList.remove('button-container');
    holder.classList.add('carousel-spotlight-cta-wrap');
    body.append(holder);
  }
  card.append(body);

  if (iconCell) {
    iconCell.className = 'carousel-spotlight-icon';
    iconCell.querySelectorAll('picture > img').forEach((img) => {
      const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]);
      moveInstrumentation(img, pic.querySelector('img'));
      img.closest('picture').replaceWith(pic);
    });
    card.append(iconCell);
  }
  return card;
}

export default function decorate(block) {
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const track = document.createElement('ul');
  track.className = 'carousel-spotlight-track';
  [...block.children].forEach((row) => track.append(buildCard(row)));

  const nav = document.createElement('div');
  nav.className = 'carousel-spotlight-nav';
  nav.innerHTML = `<button type="button" class="carousel-spotlight-prev" aria-label="Previous"></button>
    <button type="button" class="carousel-spotlight-next" aria-label="Next"></button>`;
  const prev = nav.querySelector('.carousel-spotlight-prev');
  const next = nav.querySelector('.carousel-spotlight-next');

  block.textContent = '';
  block.append(track, nav);

  const step = () => {
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
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
