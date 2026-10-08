import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * CTA Sticky
 * Block field: text (rich text - an info paragraph e.g. "4 dealers near you", then CTA links; an
 * italic link is the outline button).
 * Mobile: fixed action bar at the bottom of the viewport (hidden while the footer is in view).
 * Desktop: rendered inline as a compact action row.
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div') || block;
  const bar = document.createElement('div');
  bar.className = 'cta-sticky-bar';
  moveInstrumentation(cell, bar);
  while (cell.firstChild) bar.append(cell.firstChild);

  const actions = document.createElement('div');
  actions.className = 'cta-sticky-actions';
  bar.querySelectorAll(':scope > p').forEach((p) => {
    if (p.classList.contains('button-container')) actions.append(p);
    else p.classList.add('cta-sticky-info');
  });
  bar.append(actions);
  block.replaceChildren(bar);
  document.body.classList.add('has-cta-sticky');

  // keep the footer readable: slide the bar away once the footer scrolls into view
  const footer = document.querySelector('footer');
  if (footer) {
    new IntersectionObserver(([entry]) => {
      bar.classList.toggle('cta-sticky-hidden', entry.isIntersecting);
    }).observe(footer);
  }
}
