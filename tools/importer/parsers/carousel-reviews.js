/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-reviews. Base: carousel.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .testinomial-cards
 *
 * Model (carousel-reviews-item): image | text -> one row per review card, 2 columns
 *   text = reviewer name (h3), company / plan lines, rating paragraph ("4/5"), optional Watch Video link, quote
 * Validated selectors (source.html + live DOM):
 *   .swiper-wrapper > .newextendedteaser .cmp-teaser, .profile-image-wrapper img.profile-image (lazy: data-src),
 *   .card-details span.title / span.grey-text|span.company-name / span.pretitle / span.description,
 *   .card-details img.full / img.half / img.empty (star rating; fallback .ratingcount),
 *   a.watch_video_btn[data-href] (YouTube embed URL -> watch URL)
 * Ignored: .second-image (decorative quote mark).
 */
function clean(t) {
  return (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function para(document, text, tag = 'p') {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}

function hinted(document, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function videoUrl(href) {
  if (!href) return '';
  const m = href.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/#]+)/);
  return m ? `https://www.youtube.com/watch?v=${m[1]}` : href;
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.cmp-teaser')];
  if (!cards.length) cards = [...element.querySelectorAll('.swiper-slide')];

  const cells = [];
  cards.forEach((card) => {
    const details = card.querySelector('.card-details') || card;

    // Avatar
    let avatar = null;
    const pimg = card.querySelector('.profile-image-wrapper img, img.profile-image');
    const psrc = pimg && (pimg.getAttribute('src') || pimg.getAttribute('data-src'));
    if (psrc) {
      avatar = document.createElement('img');
      avatar.src = /\.svg$/i.test(psrc) ? `${psrc}?v=1` : psrc;
      avatar.alt = pimg.getAttribute('alt') || clean((details.querySelector('.title') || {}).textContent) || '';
    }

    const text = [];
    const name = clean((details.querySelector('.title') || {}).textContent);
    if (name) text.push(para(document, name, 'h3'));
    details.querySelectorAll('.grey-text, .company-name').forEach((s) => { const t = clean(s.textContent); if (t) text.push(para(document, t)); });
    // plan name (.pretitle) may wrap the review date (.date): emit them as separate lines
    details.querySelectorAll('.pretitle').forEach((s) => {
      const c = s.cloneNode(true);
      c.querySelectorAll('.date').forEach((d) => d.remove());
      const t = clean(c.textContent);
      if (t) text.push(para(document, t));
    });
    details.querySelectorAll('.date').forEach((s) => { const t = clean(s.textContent); if (t) text.push(para(document, t)); });

    // Rating
    const full = details.querySelectorAll('img.full').length;
    const half = details.querySelectorAll('img.half').length;
    const stars = details.querySelectorAll('img.full, img.half, img.empty').length;
    let rating = '';
    if (stars) rating = `${full + half * 0.5}/${stars}`;
    else {
      const rc = clean((card.querySelector('.ratingcount') || {}).textContent);
      if (/^\d(\.\d)?$/.test(rc)) rating = `${rc}/5`;
    }
    if (rating) text.push(para(document, rating));

    // Watch Video
    const vbtn = card.querySelector('a.watch_video_btn');
    if (vbtn) {
      const href = videoUrl(vbtn.getAttribute('data-href') || vbtn.getAttribute('href') || '');
      if (href) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = clean(vbtn.textContent) || 'Watch Video';
        p.append(a);
        text.push(p);
      }
    }

    // Quote
    details.querySelectorAll('.description').forEach((d) => { const t = clean(d.textContent); if (t) text.push(para(document, t)); });

    if (!avatar && !text.length) return;
    cells.push([hinted(document, 'image', avatar), hinted(document, 'text', text)]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-reviews', cells });
  element.replaceWith(block);
}
