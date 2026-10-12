/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-hero
 * Base block: carousel (blocks/idfc/carousel-hero)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .homepage-banner .embla-home-static-banner
 * Generated: 2026-10-12
 *
 * UE model (carousel-hero-item):
 *   media_image (+media_imageAlt collapsed) + media_video (grouped "media_" cell) | content_text
 * Source (block-context/carousel-hero/source.html, verified against the live page):
 *   .embla__container > .embla__slide (x8)
 *     .nhb-video video source[src]              -> video slide (desktop source first)
 *     .nhb-image picture                        -> image slide; lozad: real URL is in
 *                                                  source[srcset] (desktop) / img[data-src]
 *     .nhb-desc (1..3 per slide)                -> p.h1 heading, p.txt text, .btn-group a CTAs
 *   Video slides rotate up to three .nhb-desc messages over one video; each message
 *   becomes its own slide row sharing that video so no copy is lost.
 *   Carousel controls (.embla__controls) are dropped.
 */
const ORIGIN = 'https://www.idfcfirst.bank.in';
const PLACEHOLDER = /loader\.(jpg|png|gif)|^data:|19873fe2a58527d55d1ccd2cddb3ea00/i;

function absolute(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('//')) return `https:${src}`;
  if (src.startsWith('/')) return `${ORIGIN}${src}`;
  return src;
}

function firstSrc(srcset) {
  return (srcset || '').split(',')[0].trim().split(/\s+/)[0] || '';
}

// pick the real image URL of a lozad picture: desktop <source>, then data-src, then src
function resolveImage(picture, document) {
  if (!picture) return null;
  const img = picture.querySelector('img');
  const candidates = [];
  picture.querySelectorAll('source').forEach((s) => {
    const media = s.getAttribute('media') || '';
    const url = firstSrc(s.getAttribute('srcset') || s.getAttribute('data-srcset'));
    if (url) candidates.push({ url, desktop: /min-width/.test(media) });
  });
  const desktop = candidates.find((c) => c.desktop) || candidates[0];
  let url = desktop ? desktop.url : '';
  if (!url && img) url = img.getAttribute('data-src') || '';
  if (!url && img) url = img.getAttribute('src') || '';
  if (!url || PLACEHOLDER.test(url)) {
    const alt = img && (img.getAttribute('data-src') || '');
    url = alt && !PLACEHOLDER.test(alt) ? alt : '';
  }
  if (!url) return null;
  const out = document.createElement('img');
  out.src = url;
  out.alt = img ? (img.getAttribute('alt') || '').trim() : '';
  return out;
}

export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.embla__container > .embla__slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.embla__slide')];

  const cells = [];
  slides.forEach((slide) => {
    // --- media ---
    const sources = [...slide.querySelectorAll('.nhb-video video source[src], video source[src]')];
    const desktopSource = sources.find((s) => /min-width/.test(s.getAttribute('media') || '')) || sources[0];
    const videoUrl = desktopSource ? absolute(desktopSource.getAttribute('src')) : '';
    const image = videoUrl ? null : resolveImage(slide.querySelector('.nhb-image picture, picture'), document);

    // --- messages ---
    let descs = [...slide.querySelectorAll('.nhb-desc')];
    if (!descs.length) descs = [slide];

    descs.forEach((desc) => {
      const headingEl = desc.querySelector('.h1, h1, h2');
      const headingText = headingEl ? headingEl.textContent.replace(/\s+/g, ' ').trim() : '';
      const textEl = desc.querySelector('p.txt');
      const text = textEl ? textEl.textContent.replace(/\s+/g, ' ').trim() : '';
      const ctas = [...desc.querySelectorAll('.btn-group a[href], a.btn-red[href], a.btn-underline[href]')]
        .filter((a, i, arr) => arr.indexOf(a) === i)
        .filter((a) => !/^javascript:/i.test(a.getAttribute('href')));
      if (!headingText && !text && !ctas.length) return;

      const mediaCell = document.createDocumentFragment();
      if (image) {
        mediaCell.appendChild(document.createComment(' field:media_image '));
        mediaCell.appendChild(image.cloneNode(true));
      }
      if (videoUrl) {
        mediaCell.appendChild(document.createComment(' field:media_video '));
        const a = document.createElement('a');
        a.href = videoUrl;
        a.textContent = videoUrl;
        mediaCell.appendChild(a);
      }

      const contentCell = document.createDocumentFragment();
      contentCell.appendChild(document.createComment(' field:content_text '));
      if (headingText) {
        const h = document.createElement(cells.length === 0 ? 'h1' : 'h2');
        h.textContent = headingText;
        contentCell.appendChild(h);
      }
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        contentCell.appendChild(p);
      }
      ctas.forEach((cta, i) => {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = cta.getAttribute('href');
        a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
        if (i === 0) {
          const strong = document.createElement('strong');
          strong.appendChild(a);
          p.appendChild(strong);
        } else {
          p.appendChild(a);
        }
        contentCell.appendChild(p);
      });

      cells.push([mediaCell, contentCell]);
    });
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
