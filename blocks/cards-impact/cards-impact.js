import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Impact
 * Each row = one content card: cell 1 illustration, cell 2 rich text (tag paragraph before the
 * heading e.g. "Video", heading, description, link),
 * cell 3 theme: light | red (raised feature card).
 * The link renders as a round icon button (play icon for video/podcast tags, arrow otherwise) and
 * makes the card clickable. Mobile: horizontal swipe row with dots.
 */

const PLAY_TAGS = /video|podcast|watch|listen/i;

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-impact-list';

  [...block.children].forEach((row) => {
    const [imageCell, textCell, themeCell] = [...row.children];
    const theme = (themeCell?.textContent || '').trim().toLowerCase() === 'red' ? 'red' : 'light';
    const li = document.createElement('li');
    li.className = `cards-impact-card cards-impact-${theme}`;
    moveInstrumentation(row, li);

    if (textCell) {
      textCell.className = 'cards-impact-body';
      const heading = textCell.querySelector('h1, h2, h3, h4');
      const children = [...textCell.children];
      const headingIndex = heading ? children.indexOf(heading) : -1;
      let tag = '';
      children.forEach((el, i) => {
        if (el.tagName === 'P' && i < headingIndex && !el.querySelector('a')) {
          el.className = 'cards-impact-tag';
          tag = el.textContent;
        }
      });
      const link = [...textCell.querySelectorAll('a')].pop();
      if (link) {
        link.className = `cards-impact-link ${PLAY_TAGS.test(tag) ? 'cards-impact-play' : 'cards-impact-arrow'}`;
        const p = link.closest('p');
        if (p) p.className = 'cards-impact-link-wrapper';
      }
      li.append(textCell);
    }

    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'cards-impact-image';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }
    ul.append(li);
  });

  block.replaceChildren(ul);

  // mobile swipe dots
  const cards = [...ul.children];
  if (cards.length < 2) return;
  const dots = document.createElement('div');
  dots.className = 'cards-impact-dots';
  dots.setAttribute('aria-hidden', 'true');
  cards.forEach(() => dots.append(document.createElement('span')));
  block.append(dots);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = cards.indexOf(entry.target);
      [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === index));
    });
  }, { root: ul, threshold: 0.6 });
  cards.forEach((card) => observer.observe(card));
}
