/*
 * Scroll reveal animations of the /dept page template (page metadata "template: dept"),
 * matching https://www.dept.global/en-in/:
 * - display headings / statement / section labels: each word slides up out of a clip mask,
 *   staggered word by word
 * - body copy slides up
 * - images fade and scale in, slightly after the words
 * Styles (initial + revealed states) live in styles/dept.css under body.dept.
 * Skipped for prefers-reduced-motion and inside Universal Editor (it splits text nodes,
 * which would break in-place editing).
 */

const WORD_TARGETS = [
  '.section:not(.dept-hero) .default-content-wrapper :is(h1, h2, h3)',
  '.dept-statement .default-content-wrapper > p',
  ':is(.dept-services, .dept-solutions) .default-content-wrapper > p:first-child',
  '.dept-solutions .default-content-wrapper > p + p',
  '.columns-feature :is(h2, h3)',
  '.cards-solution-rows h3',
].join(', ');

const SLIDE_TARGETS = [
  '.dept-services .default-content-wrapper > h2 + p',
  '.columns-feature p:not(.button-container):not(:has(picture))',
  '.cards-solution-rows p:not(.button-container):not(:has(picture))',
].join(', ');

const IMAGE_TARGETS = [
  '.columns-feature picture',
  '.cards-solution-rows picture',
  '.cards-insights picture',
].join(', ');

const WORD_STAGGER_MS = 60;

/**
 * Wraps every word of an element's text in .dept-word > span, keeping inline markup (em, a, ...)
 * @param {Element} el The element to split
 * @returns {number} The number of words
 */
function splitWords(el) {
  let count = 0;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/);
    if (!parts.some((part) => part.trim())) return;
    const fragment = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (!part.trim()) {
        fragment.append(part);
        return;
      }
      const word = document.createElement('span');
      word.className = 'dept-word';
      const inner = document.createElement('span');
      inner.textContent = part;
      inner.style.transitionDelay = `${count * WORD_STAGGER_MS}ms`;
      word.append(inner);
      fragment.append(word);
      count += 1;
    });
    node.replaceWith(fragment);
  });
  return count;
}

/**
 * Sets up the scroll reveals
 * @param {Element} main The main element
 */
export default function decorate(main) {
  if (!main) return;
  // the scroll reveals belong to the new brand design (themes dept-home / dept-brand)
  if (!document.body.matches('.dept-home, .dept-brand')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.querySelector('[data-aue-resource]')) return;

  const targets = [];
  main.querySelectorAll(WORD_TARGETS).forEach((el) => {
    if (el.dataset.deptReveal || !el.textContent.trim()) return;
    if (splitWords(el)) {
      el.dataset.deptReveal = 'words';
      targets.push(el);
    }
  });
  main.querySelectorAll(SLIDE_TARGETS).forEach((el) => {
    if (el.dataset.deptReveal) return;
    el.dataset.deptReveal = 'slide';
    targets.push(el);
  });
  main.querySelectorAll(IMAGE_TARGETS).forEach((el) => {
    if (el.dataset.deptReveal) return;
    el.dataset.deptReveal = 'image';
    targets.push(el);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('dept-revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  // the initial (hidden) state is applied only now, so content never stays hidden without JS
  document.body.classList.add('dept-motion');
  targets.forEach((el) => observer.observe(el));
}
