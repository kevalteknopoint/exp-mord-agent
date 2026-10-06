/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-video. Base: cards.
 * Source: https://www.dulux.in/ (div.cmp-c43-related-content — YouTube video cards)
 * xwalk model (blocks/cards-video/_cards-video.json): container of `card-video` items,
 *   each card has image (reference — video poster), imageAlt (collapsed), text (richtext).
 * Library structure: N rows (one per card), 2 columns (image cell, text cell).
 * Each card wraps a YouTube player; the video watch URL is emitted as a link in the text cell.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.m9-content-card'));

  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    // Poster image (image cell).
    const image = card.querySelector('.video-poster img, .content-card-media img, picture img, img');
    const heading = card.querySelector('.card-content-wrapper h4, .content-title-sub h4, h3, h4');

    // Derive the YouTube watch URL from the embed iframe.
    const iframe = card.querySelector('iframe[src*="youtube.com/embed/"]');
    let watchUrl = '';
    if (iframe) {
      const m = iframe.getAttribute('src').match(/youtube\.com\/embed\/([^?&/]+)/);
      if (m) watchUrl = `https://www.youtube.com/watch?v=${m[1]}`;
    }

    // Column 1: image cell (field:image) — poster. imageAlt collapses into <img alt>.
    let imageCell = '';
    if (image) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(' field:image '));
      imgFrag.appendChild(image);
      imageCell = imgFrag;
    }

    // Column 2: text cell (field:text) — heading + video link (richtext).
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (heading) textFrag.appendChild(heading);
    if (watchUrl) {
      const link = document.createElement('a');
      link.setAttribute('href', watchUrl);
      link.textContent = heading ? heading.textContent.trim() : watchUrl;
      const p = document.createElement('p');
      p.appendChild(link);
      textFrag.appendChild(p);
    }

    cells.push([imageCell, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  element.replaceWith(block);
}
