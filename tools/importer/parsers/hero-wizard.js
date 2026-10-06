/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-wizard. Base: hero.
 * Source: https://www.dulux.in/ (div.c32-color-wizard)
 * xwalk model (blocks/hero-wizard/_hero-wizard.json): image (reference), imageAlt (collapsed), text (richtext)
 * Library structure: 1 column, 3 rows (name / background image / text content).
 */
export default function parse(element, { document }) {
  // Scope extraction to the first (landing) step of the wizard.
  const firstStep = element.querySelector('li.step.first-step, li.first-step, li.step') || element;

  // Background image (row 2). Prefer the desktop <img>.
  const image = firstStep.querySelector('.background-image img, picture img, img');

  // Heading (row 3 content). The intro heading of the landing step.
  const heading = firstStep.querySelector('.js-text-block .heading-title, .text-block h1, .text-block h2, h1, h2');

  // Primary CTA on the landing step (the start CTA). Exclude helper/return links
  // and the suggestion buttons that belong to the interactive help block.
  const ctas = Array.from(
    firstStep.querySelectorAll('.start-cta-wrapper a[href]'),
  ).filter((a) => {
    const href = a.getAttribute('href');
    return href && href !== '#' && !a.classList.contains('js-help-button');
  });

  // Empty-block guard.
  if (!image && !heading && ctas.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image cell (field:image). imageAlt collapses into the <img alt> attribute.
  if (image) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(image);
    cells.push([imgFrag]);
  } else {
    cells.push(['']);
  }

  // Row 3: text content cell (field:text) — heading + CTAs as richtext.
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (heading) textFrag.appendChild(heading);
  ctas.forEach((cta) => {
    // Normalize CTA button label into anchor text if wrapped in a span.
    const label = cta.querySelector('.cta-text');
    if (label && !cta.textContent.trim()) cta.textContent = label.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(cta);
    textFrag.appendChild(p);
  });
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-wizard', cells });
  element.replaceWith(block);
}
