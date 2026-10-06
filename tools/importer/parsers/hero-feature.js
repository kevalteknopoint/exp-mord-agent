/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-feature variant.
 * Base block: hero
 * Source: https://www.wipro.com/
 * Selector: .banner.teaser.banner--content-center
 * Generated: 2026-04-30
 *
 * Hero model fields (from _hero.json / component-models.json):
 *   - image (reference) → Row 1
 *   - imageAlt (text, collapsed into image — no separate row)
 *   - text (richtext) → Row 2
 *
 * Target table: 1 column, 2 rows (image/video row + text row)
 *
 * Source DOM structure:
 *   div.banner.teaser.banner--content-center
 *     div.cmp-teaser
 *       div.cmp-teaser__content
 *         div.cmp-teaser__tout
 *           div.cmp-teaser__pretitle                        → pretitle (may be empty)
 *           div.cmp-teaser__description > p                 → description (may be whitespace only)
 *           div.cmp-teaser__action-container
 *             div.cmp-teaser__action-background
 *               a.cmp-teaser__action-link                   → CTA link (href, text)
 *           div.cmp-teaser__playicon-placeholder
 *             a.cmp-teaser__play-link                       → video play link (mp4 href)
 *       div.cmp-teaser__image > video                       → background video
 *       div.cmp-teaser__mobile-image img                    → fallback background image
 */
export default function parse(element, { document }) {
  // --- Row 1: Image/Video media ---
  // Validated: div.cmp-teaser__image > video[src] (desktop video)
  const video = element.querySelector('.cmp-teaser__image video[src], .cmp-teaser__image video');

  // Validated: div.cmp-teaser__mobile-image img.cmp-teaser__background-image (mobile fallback)
  const fallbackImage = element.querySelector(
    '.cmp-teaser__mobile-image img.cmp-teaser__background-image, .cmp-teaser__mobile-image img, .cmp-teaser__image img',
  );

  // --- Row 2: Text content ---
  // Validated: a.cmp-teaser__action-link (CTA with href and span text)
  const ctaLink = element.querySelector(
    'a.cmp-teaser__action-link, .cmp-teaser__action-container a',
  );

  // Validated: div.cmp-teaser__description p (may contain only whitespace/nbsp)
  const descriptionEl = element.querySelector('.cmp-teaser__description p, .cmp-teaser__description');

  // Validated: div.cmp-teaser__pretitle (may be empty)
  const pretitleEl = element.querySelector('.cmp-teaser__pretitle');

  // Build cells matching hero block library structure (2 rows for xwalk hero model)

  const cells = [];

  // Row 1: Image / Video (field:image from UE model)
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (video && video.getAttribute('src')) {
    // Prefer video — create a link to the video asset for import
    const videoLink = document.createElement('a');
    videoLink.href = video.getAttribute('src');
    videoLink.textContent = video.getAttribute('src');
    imageCell.appendChild(videoLink);
  } else if (fallbackImage) {
    imageCell.appendChild(fallbackImage);
  }
  cells.push([imageCell]);

  // Row 2: Text content (field:text from UE model)
  // Combines pretitle + description + CTA as richtext per hero model
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));

  // Add pretitle as heading if present and non-empty
  if (pretitleEl && pretitleEl.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = pretitleEl.textContent.trim();
    textCell.appendChild(h2);
  }

  // Add description if present and has real content (not just whitespace/nbsp)
  const descText = descriptionEl ? descriptionEl.textContent.replace(/ /g, ' ').trim() : '';
  if (descText) {
    const p = document.createElement('p');
    p.innerHTML = descriptionEl.innerHTML.trim();
    textCell.appendChild(p);
  }

  // Add CTA link
  if (ctaLink) {
    const ctaP = document.createElement('p');
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href') || '';
    // Extract visible text from the link (may be inside a span)
    a.textContent = ctaLink.textContent.trim() || 'Learn More';
    ctaP.appendChild(a);
    textCell.appendChild(ctaP);
  }

  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-feature', cells });
  element.replaceWith(block);
}
