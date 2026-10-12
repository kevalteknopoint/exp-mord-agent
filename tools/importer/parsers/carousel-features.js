/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-features
 * Base block: carousel (blocks/idfc/carousel-features)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .what-make-us-spl .special-embla-slider
 * Generated: 2026-10-12
 *
 * UE model (carousel-features-item): image (+imageAlt collapsed) | text (h3 title, description, optional CTA)
 * Source (block-context/carousel-features/source.html + related.html):
 *   .embla__container > .embla__slide#cardN (x18)
 *     .wmaspecial .card img            -> icon
 *     .wmaspecial h3.card-title        -> title
 *     .info-tool-tip p.info            -> description (inside the slide, or the sibling
 *                                         #cardN-info-tool-tip-desktop outside the block)
 *     .info-tool-tip a.btn-red         -> CTA (Apply Now / Know More)
 *   Outside the block, in #special-carousel: .info-tool-tip-desktop siblings and the
 *   a.view-all "View All" toggle; both are consumed here and removed.
 */
function findTooltip(slide, scope, doc) {
  const own = slide.querySelector('.info-tool-tip');
  if (own && own.querySelector('p.info')) return own;
  const id = slide.id;
  if (id) {
    const ext = (scope && scope.querySelector(`[id="${id}-info-tool-tip-desktop"]`))
      || doc.getElementById(`${id}-info-tool-tip-desktop`);
    if (ext) return ext;
  }
  return own || null;
}

export default function parse(element, { document }) {
  const doc = element.ownerDocument || document;
  const scope = element.parentElement; // #special-carousel wrapper

  let slides = [...element.querySelectorAll('.embla__container > .embla__slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.embla__slide')];

  const consumed = [];
  const seen = new Set();
  const cells = [];

  slides.forEach((slide, idx) => {
    const card = slide.querySelector('.wmaspecial') || slide;
    const img = card.querySelector('.card img, img');
    const titleEl = card.querySelector('h3.card-title, .card-title, h3, h2');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const key = slide.id || title || `slide-${idx}`;
    if (seen.has(key)) return;
    seen.add(key);

    const tip = findTooltip(slide, scope, doc);
    if (tip && !element.contains(tip)) consumed.push(tip);
    const descEl = tip && tip.querySelector('p.info, p');
    const ctaEl = tip && tip.querySelector('a.btn-red[href]');

    if (!img && !title && !descEl) return;

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      textCell.appendChild(h3);
    }
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.innerHTML = descEl.innerHTML;
      textCell.appendChild(p);
    }
    const ctaHref = ctaEl && ctaEl.getAttribute('href');
    if (ctaHref && !/^javascript:/i.test(ctaHref)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaHref;
      a.textContent = ctaEl.textContent.replace(/\s+/g, ' ').trim();
      p.appendChild(a);
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // remove the external tooltips (all of them, matched or not) and the "View All" toggle
  if (scope) {
    scope.querySelectorAll(':scope > .info-tool-tip, :scope > .info-tool-tip-desktop').forEach((t) => consumed.push(t));
    const viewAll = scope.querySelector(':scope > a.view-all, :scope > #viewMore');
    if (viewAll) consumed.push(viewAll);
  }
  consumed.forEach((n) => n.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-features', cells });
  element.replaceWith(block);
}
