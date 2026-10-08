import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Carousel Reels
 * Each row = one customer video story: cell 1 poster image, cell 2 rich text (quote paragraph,
 * bold name, meta paragraph e.g. "Mumbai · Nexon EV", tag paragraph e.g. "Evolve · EV"),
 * cell 3 video link, cell 4 duration (e.g. 0:47).
 * Horizontal swipe row of tall poster cards; the play button opens the video.
 */

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'carousel-reels-track';

  [...block.children].forEach((row) => {
    const [imageCell, textCell, linkCell, durationCell] = [...row.children];
    const li = document.createElement('li');
    li.className = 'carousel-reels-card';
    moveInstrumentation(row, li);

    const media = document.createElement('div');
    media.className = 'carousel-reels-media';
    const img = imageCell?.querySelector('picture img');
    if (img) {
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      media.append(picture);
    }
    const link = linkCell?.querySelector('a');
    if (link) {
      const play = document.createElement('a');
      play.className = 'carousel-reels-play';
      play.href = link.getAttribute('href');
      play.textContent = link.textContent.trim() || 'Play video';
      moveInstrumentation(link, play);
      media.append(play);
    }
    const duration = (durationCell?.textContent || '').trim();
    if (duration) {
      const time = document.createElement('span');
      time.className = 'carousel-reels-duration';
      time.textContent = duration;
      media.append(time);
    }
    li.append(media);

    if (textCell) {
      textCell.className = 'carousel-reels-body';
      const paragraphs = [...textCell.querySelectorAll(':scope > p')];
      paragraphs.forEach((p, i) => {
        if (i === 0) p.classList.add('carousel-reels-quote');
        else if (p.querySelector('strong')) p.classList.add('carousel-reels-name');
        else if (i === paragraphs.length - 1 && paragraphs.length > 3) p.classList.add('carousel-reels-tag');
        else p.classList.add('carousel-reels-meta');
      });
      li.append(textCell);
    }
    ul.append(li);
  });

  block.replaceChildren(ul);
}
