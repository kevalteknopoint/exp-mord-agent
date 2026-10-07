import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Carousel Expand
 * Each row = one video story: cell 1 poster image, cell 2 rich text (caption paragraph e.g. the
 * customer's name, link to the video).
 * The active story is shown wide with a red play button; the other stories are narrow peeks that
 * expand when clicked. Dots below show the active story.
 */

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-expand-track';

  [...block.children].forEach((row, index) => {
    const [imageCell, textCell] = [...row.children];
    const li = document.createElement('li');
    li.className = 'carousel-expand-item';
    moveInstrumentation(row, li);

    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'carousel-expand-media';
      const picture = createOptimizedPicture(img.src, img.alt, index === 0, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }
    if (textCell) {
      textCell.className = 'carousel-expand-caption';
      const link = [...textCell.querySelectorAll('a')].pop();
      if (link) {
        link.className = 'carousel-expand-play';
        link.closest('p')?.classList.add('carousel-expand-play-wrapper');
      }
      li.append(textCell);
    }
    track.append(li);
  });

  const items = [...track.children];
  block.replaceChildren(track);
  if (!items.length) return;

  const dots = document.createElement('div');
  dots.className = 'carousel-expand-dots';
  const activate = (i) => {
    items.forEach((item, n) => {
      const active = n === i;
      item.classList.toggle('active', active);
      item.querySelectorAll('a').forEach((a) => { a.tabIndex = active ? 0 : -1; });
      item.setAttribute('aria-current', active);
    });
    [...dots.children].forEach((dot, n) => dot.setAttribute('aria-current', n === i));
  };

  items.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      if (!item.classList.contains('active')) {
        e.preventDefault();
        activate(i);
      }
    });
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show story ${i + 1} of ${items.length}`);
    dot.addEventListener('click', () => activate(i));
    dots.append(dot);
  });
  if (items.length > 1) block.append(dots);
  activate(0);
}
