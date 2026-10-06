/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-quote (new block for /loans). Base: carousel.
 * Source: migration-work/design-loans/source/loans.html
 * Instance selector: .testimonial-list
 *
 * Carousel convention - one row per slide, two cells:
 *   cell 1: media_image (+ media_imageAlt) - round customer avatar
 *   cell 2: content_text (richtext)        - quote paragraph(s), customer name (<p><strong>), role paragraph
 * Source markup: figure.testimonial > blockquote > p ; figcaption > img, strong.name, span.role
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.testimonial')];
  const cells = [];

  items.forEach((item) => {
    // cell 1: media_image
    const imageCell = document.createDocumentFragment();
    const src = item.querySelector('img');
    if (src && src.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = src.getAttribute('src');
      img.alt = src.getAttribute('alt') || '';
      imageCell.appendChild(document.createComment(' field:media_image '));
      imageCell.appendChild(img);
    }

    // cell 2: content_text
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:content_text '));
    const quote = item.querySelector('blockquote');
    if (quote) {
      const paras = [...quote.querySelectorAll('p')];
      (paras.length ? paras : [quote]).forEach((q) => {
        const t = clean(q.textContent);
        if (!t) return;
        const p = document.createElement('p');
        p.textContent = t;
        textCell.appendChild(p);
      });
    }
    const name = clean((item.querySelector('.name, figcaption strong') || {}).textContent);
    if (name) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = name;
      p.append(strong);
      textCell.appendChild(p);
    }
    const role = clean((item.querySelector('.role') || {}).textContent);
    if (role) {
      const p = document.createElement('p');
      p.textContent = role;
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-quote', cells });
  element.replaceWith(block);
}
