/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-testimonial
 * Base block: carousel (blocks/idfc/carousel-testimonial)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .compliment .embla-testi-slider
 * Generated: 2026-10-12
 *
 * UE model (carousel-testimonial-item): image (+imageAlt collapsed, optional avatar) | text
 * Text cell = date paragraph, name (strong), quote paragraph.
 * Source (block-context/carousel-testimonial/source.html):
 *   .embla__container > .embla__slide .item .card > p
 *     p own text / strong / small - date and quote swap places between cards
 *     ("6 October 2026 <strong>Name</strong><small>"quote"</small>" vs
 *      ""quote" <strong>Name</strong><small>3 October 2026</small>"), so each part is
 *     classified by a date pattern rather than by position.
 * Decorative avatars (picture.desktop-testi-images) are outside the block and removed by
 * idfc-cleanup, so the image cell stays empty. Carousel controls are dropped.
 */
const DATE_RE = /^\d{1,2}\s+[A-Za-z]+,?\s+\d{4}$/;

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.embla__slide .card')];
  if (!cards.length) cards = [...element.querySelectorAll('.embla__slide, .item')];

  const seen = new Set();
  const cells = [];
  cards.forEach((card) => {
    const p = card.querySelector('p') || card;
    const nameEl = p.querySelector('strong, b');
    const smallEl = p.querySelector('small');
    const name = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const small = smallEl ? smallEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const own = [...p.childNodes]
      .filter((n) => n !== nameEl && n !== smallEl)
      .map((n) => n.textContent)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    let date = '';
    let quote = '';
    [own, small].forEach((part) => {
      if (!part) return;
      if (!date && DATE_RE.test(part)) date = part;
      else quote = quote ? `${quote} ${part}` : part;
    });
    if (!name && !quote) return;
    const key = `${name}|${quote}`;
    if (seen.has(key)) return;
    seen.add(key);

    const avatar = card.querySelector('img');
    const imageCell = document.createDocumentFragment();
    if (avatar) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(avatar);
    }

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (date) {
      const dp = document.createElement('p');
      dp.textContent = date;
      textCell.appendChild(dp);
    }
    if (name) {
      const np = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = name;
      np.appendChild(strong);
      textCell.appendChild(np);
    }
    if (quote) {
      const qp = document.createElement('p');
      qp.textContent = quote;
      textCell.appendChild(qp);
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-testimonial', cells });
  element.replaceWith(block);
}
