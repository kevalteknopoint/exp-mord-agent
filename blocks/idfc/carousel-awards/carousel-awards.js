import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

function buildCard(row) {
  const card = document.createElement('li');
  card.className = 'carousel-awards-card';
  moveInstrumentation(row, card);
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture') && !c.textContent.trim());
  if (imageCell) {
    imageCell.className = 'carousel-awards-image';
    imageCell.querySelectorAll('picture > img').forEach((img) => {
      const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
      moveInstrumentation(img, pic.querySelector('img'));
      img.closest('picture').replaceWith(pic);
    });
    card.append(imageCell);
  }
  const body = document.createElement('div');
  body.className = 'carousel-awards-body';
  cells.filter((c) => c !== imageCell).forEach((c) => {
    while (c.firstChild) body.append(c.firstChild);
  });

  // the detail link becomes the arrow pinned bottom-right and makes the whole card clickable
  const links = [...body.querySelectorAll('a')];
  const link = links[links.length - 1];
  if (link) {
    const holder = link.closest('p');
    const linkText = link.textContent.trim();
    const desc = body.textContent.replace(linkText, '').trim();
    link.classList.add('carousel-awards-link');
    link.setAttribute('aria-label', linkText || desc.slice(0, 80) || 'Read more');
    if (!desc && linkText) {
      // the whole description is the link text: keep it visible as copy above the arrow
      const copy = document.createElement('p');
      copy.textContent = linkText;
      (holder || link).before(copy);
    }
    if (holder && holder.textContent.trim() !== linkText) {
      // link sits inside the description: move it to its own row
      const own = document.createElement('p');
      own.append(link);
      body.append(own);
      own.classList.add('carousel-awards-link-wrap');
    } else if (holder) {
      holder.classList.add('carousel-awards-link-wrap');
      body.append(holder);
    } else {
      body.append(link);
    }
  }
  card.append(body);
  return card;
}

export default function decorate(block) {
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const track = document.createElement('ul');
  track.className = 'carousel-awards-track';
  [...block.children].forEach((row) => track.append(buildCard(row)));

  const nav = document.createElement('div');
  nav.className = 'carousel-awards-nav';
  nav.innerHTML = `<button type="button" class="carousel-awards-prev" aria-label="Previous"></button>
    <button type="button" class="carousel-awards-next" aria-label="Next"></button>`;
  const prev = nav.querySelector('.carousel-awards-prev');
  const next = nav.querySelector('.carousel-awards-next');

  block.textContent = '';
  block.append(nav, track);

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
