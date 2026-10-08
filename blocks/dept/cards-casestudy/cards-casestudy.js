import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

/*
 * Case study ("Work") cards, matching the DEPT work listing:
 * - media cell: an MP4 link renders as a muted, looping, inline autoplay <video>
 *   (no autoplay for prefers-reduced-motion); a picture is used as-is
 * - text cell: client name (strong), case title, tags (comma separated), "View Work" link
 * - the case title + "View Work" pill are shown in a hover card over the media;
 *   the whole card is clickable (stretched "View Work" link)
 * - touch devices get a "+" toggle that reveals the hover card
 */

const VIDEO_RE = /\.(mp4|webm|mov)(\?|#|$)/i;

// taxonomy terms that themselves contain a comma (source: "( Tech, Media & Telecoms )")
const COMPOUND_TAGS = ['Tech, Media & Telecoms'];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Splits the authored tag line into tags ("a; b" or "a, b", keeping known compound terms)
 * @param {string} text The tag line
 * @returns {string[]} The tags
 */
function splitTags(text) {
  const value = text.trim();
  if (!value) return [];
  if (/[;|]/.test(value)) return value.split(/[;|]/).map((t) => t.trim()).filter(Boolean);
  const parts = value.split(',').map((t) => t.trim()).filter(Boolean);
  const tags = [];
  for (let i = 0; i < parts.length; i += 1) {
    const pair = `${parts[i]}, ${parts[i + 1]}`;
    if (parts[i + 1] && COMPOUND_TAGS.includes(pair)) {
      tags.push(pair);
      i += 1;
    } else {
      tags.push(parts[i]);
    }
  }
  return tags;
}

/**
 * Plays videos while they are on screen, pauses them otherwise.
 * Sources are attached lazily, shortly before a card scrolls into view.
 */
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target: video, isIntersecting }) => {
    if (isIntersecting) {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      if (!reducedMotion.matches) video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  });
}, { rootMargin: '200px 0px' });

/**
 * Builds the background video for a card
 * @param {HTMLAnchorElement} link The authored video link
 * @returns {HTMLVideoElement} The video
 */
function buildVideo(link) {
  const video = document.createElement('video');
  video.className = 'cards-casestudy-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  ['muted', 'loop', 'playsinline', 'disablepictureinpicture', 'disableremoteplayback']
    .forEach((attr) => video.setAttribute(attr, ''));
  video.setAttribute('aria-hidden', 'true');
  video.preload = reducedMotion.matches ? 'metadata' : 'auto';
  video.dataset.src = link.href;
  moveInstrumentation(link, video);
  videoObserver.observe(video);
  return video;
}

/**
 * Builds the "+" toggle that reveals the hover card on touch devices
 * @param {Element} li The card
 * @returns {HTMLButtonElement} The toggle
 */
function buildToggle(li) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cards-casestudy-toggle';
  button.setAttribute('aria-label', 'Post details');
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = '<svg width="24" height="25" viewBox="0 0 24 25" fill="none" aria-hidden="true" focusable="false">'
    + '<circle cx="12" cy="12.8193" r="11.5" stroke="currentColor"/>'
    + '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12.5714 7.50209C12.5714 7.1865 12.3156 6.93066 12 6.93066C11.6844 6.93066 11.4286 7.1865 11.4286 7.50209V12.3592H6.57143C6.25584 12.3592 6 12.6151 6 12.9307C6 13.2463 6.25584 13.5021 6.57143 13.5021H11.4286V18.3592C11.4286 18.6748 11.6844 18.9307 12 18.9307C12.3156 18.9307 12.5714 18.6748 12.5714 18.3592V13.5021H17.4286C17.7441 13.5021 18 13.2463 18 12.9307C18 12.6151 17.7441 12.3592 17.4286 12.3592H12.5714V7.50209Z"/>'
    + '</svg>';
  button.addEventListener('click', () => {
    const open = li.classList.toggle('is-open');
    button.setAttribute('aria-pressed', String(open));
  });
  return button;
}

/**
 * Decorates a card's text cell and builds its hover card
 * @param {Element} li The card
 * @param {Element} media The media cell
 * @param {Element} body The text cell
 * @param {boolean} editing Whether the page is open in Universal Editor
 */
function decorateBody(li, media, body, editing) {
  const paragraphs = [...body.querySelectorAll(':scope > p')];
  const linkP = paragraphs.find((p) => p.querySelector('a[href]'));
  const link = linkP?.querySelector('a[href]');
  const textPs = paragraphs.filter((p) => p !== linkP);
  const clientP = textPs.find((p) => p.querySelector('strong')) || textPs[0];
  const rest = textPs.filter((p) => p !== clientP);
  const [titleP, tagsP] = rest.length > 1 ? rest : [null, rest[0]];

  clientP?.classList.add('cards-casestudy-client');
  titleP?.classList.add('cards-casestudy-case-title');

  if (tagsP) {
    const tags = splitTags(tagsP.textContent);
    tagsP.classList.add('cards-casestudy-tags');
    tagsP.replaceChildren(...tags.map((tag) => {
      const span = document.createElement('span');
      span.className = 'cards-casestudy-tag';
      span.innerHTML = '<span aria-hidden="true">(</span>&nbsp;<span></span>&nbsp;<span aria-hidden="true">)</span>';
      span.children[1].textContent = tag;
      return span;
    }));
  }

  // hover card: case title + "View Work" pill (decorative copy, the link carries the label)
  const hoverCard = document.createElement('div');
  hoverCard.className = 'cards-casestudy-hover-card';
  hoverCard.setAttribute('aria-hidden', 'true');
  if (titleP) {
    const title = document.createElement('p');
    title.className = 'cards-casestudy-hover-card-title';
    title.textContent = titleP.textContent.trim();
    hoverCard.append(title);
  }
  if (link) {
    const pill = document.createElement('p');
    pill.className = 'cards-casestudy-hover-card-tag';
    pill.textContent = link.textContent.trim() || 'View Work';
    hoverCard.append(pill);
  }
  media.append(hoverCard);

  if (link) {
    link.classList.remove('button');
    link.classList.add('cards-casestudy-link');
    linkP.classList.remove('button-container');
    linkP.classList.add('cards-casestudy-link-container');
    const label = [clientP, titleP].filter(Boolean).map((p) => p.textContent.trim()).join(': ');
    if (label) {
      link.setAttribute('aria-label', label);
      link.removeAttribute('title');
    }
    // in Universal Editor the fields must stay clickable, so no stretched link there
    if (!editing) li.classList.add('has-link');
  }
}

export default function decorate(block) {
  const editing = !!document.querySelector('[data-aue-resource]');
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    const [media, ...bodies] = [...li.children];
    media?.classList.add('cards-casestudy-card-image');
    bodies.forEach((div) => div.classList.add('cards-casestudy-card-body'));

    if (media) {
      const videoLink = [...media.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href));
      if (videoLink) {
        const wrapper = videoLink.closest('p') || videoLink;
        wrapper.replaceWith(buildVideo(videoLink));
      }
    }
    if (media && bodies[0]) decorateBody(li, media, bodies[0], editing);
    li.append(buildToggle(li));
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
