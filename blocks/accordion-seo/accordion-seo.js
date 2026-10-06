/*
 * Accordion SEO Block
 * Recreate an accordion for SEO content sections
 * https://www.hlx.live/developer/block-collection/accordion
 *
 * - The first item starts open.
 * - A block with a single item (e.g. "Disclaimer") renders as a collapsible section title.
 * - When a "View more" paragraph is authored right after the block, only the first
 *   VISIBLE_ITEMS items show and that paragraph becomes the expand / collapse toggle.
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

const VISIBLE_ITEMS = 4;
const VIEW_MORE = /^view (more|all|less)$/i;

function setupViewMore(block, items) {
  if (items.length <= VISIBLE_ITEMS) return;
  const next = block.parentElement && block.parentElement.nextElementSibling;
  if (!next || !next.classList.contains('default-content-wrapper')) return;
  const toggle = next.firstElementChild;
  if (!toggle || toggle.tagName !== 'P' || !VIEW_MORE.test(toggle.textContent.trim())) return;

  items.slice(VISIBLE_ITEMS).forEach((item) => item.classList.add('accordion-seo-item-extra'));
  toggle.classList.add('accordion-seo-view-more');
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');
  const label = [...toggle.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  const update = (expanded) => {
    block.classList.toggle('accordion-seo-expanded', expanded);
    toggle.setAttribute('aria-expanded', expanded);
    if (label) label.textContent = expanded ? 'View less ' : 'View more ';
  };
  const onToggle = () => update(!block.classList.contains('accordion-seo-expanded'));
  toggle.addEventListener('click', onToggle);
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  });
  update(false);
}

export default function decorate(block) {
  const items = [];
  [...block.children].forEach((row, i) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-seo-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1] || document.createElement('div');
    body.className = 'accordion-seo-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-seo-item';
    if (i === 0) details.open = true;
    details.append(summary, body);
    row.replaceWith(details);
    items.push(details);
  });
  if (items.length === 1) block.classList.add('accordion-seo-single');
  setupViewMore(block, items);
}
