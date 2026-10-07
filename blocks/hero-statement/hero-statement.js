import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Hero Statement
 * Block fields (one row each): image (desktop artwork), mobileImage (optional artwork for small
 * screens), text (rich text: h1 statement - bold words via <strong>, tagline paragraph, optional
 * "scroll down" link).
 * Dark full-bleed hero; the artwork sits on the right (desktop) or below the text (mobile).
 */

export default function decorate(block) {
  const rows = [...block.children];
  const imageRows = rows.filter((row) => row.querySelector('picture'));
  const textRow = rows.find((row) => !row.querySelector('picture') && row.textContent.trim());

  const art = document.createElement('div');
  art.className = 'hero-statement-art';
  const sources = imageRows.map((row) => row.querySelector('img'));
  if (sources[0]) {
    const [desktop, mobile] = sources;
    const breakpoints = [{ media: '(min-width: 900px)', width: '1400' }, { width: '750' }];
    const picture = createOptimizedPicture(desktop.src, desktop.alt, true, breakpoints);
    if (mobile) {
      // art direction: the mobile artwork replaces the desktop one below 900px
      const mobilePicture = createOptimizedPicture(mobile.src, mobile.alt, true, [{ width: '750' }]);
      mobilePicture.querySelectorAll('source').forEach((source) => {
        source.media = '(max-width: 899px)';
        picture.prepend(source);
      });
    }
    const img = picture.querySelector('img');
    img.fetchPriority = 'high';
    moveInstrumentation(desktop, img);
    art.append(picture);
  }

  const content = document.createElement('div');
  content.className = 'hero-statement-content';
  if (textRow) {
    const cell = textRow.firstElementChild || textRow;
    moveInstrumentation(cell, content);
    while (cell.firstChild) content.append(cell.firstChild);
  }
  // paragraphs after the heading: a link-only paragraph is the scroll cue, the first other one
  // is the tagline
  const children = [...content.children];
  const headingIndex = children.findIndex((el) => ['H1', 'H2'].includes(el.tagName));
  let tagline = false;
  children.slice(headingIndex + 1).filter((el) => el.tagName === 'P').forEach((p) => {
    const link = p.querySelector('a');
    if (link && p.textContent.trim() === link.textContent.trim()) {
      link.className = 'hero-statement-scroll';
      p.className = 'hero-statement-scroll-wrapper';
    } else if (!tagline) {
      p.classList.add('hero-statement-tagline');
      tagline = true;
    }
  });

  block.replaceChildren(art, content);
}
