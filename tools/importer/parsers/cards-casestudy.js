/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-casestudy
 * Base block: cards
 * Source: https://www.dept.global/en-in/
 * Selector: .block-work-listing__items
 * Generated: 2026-05-25 / Re-validated against dept.global DOM: 2026-10-08
 *
 * Structure (container block):
 *   Each card row = [image, text]
 *   - image: video poster or img from the card media
 *   - text: brand name + hover title (case study description) + tags, wrapped in link
 */
export default function parse(element, { document }) {
  const cards = element.querySelectorAll(':scope > a.listing-card');
  const cells = [];

  cards.forEach((card) => {
    // --- Image/Media cell ---
    const imageFrag = document.createDocumentFragment();
    const video = card.querySelector('.listing-card__media-container video.listing-card__video');
    const img = card.querySelector('.listing-card__media-container img.listing-card__image');
    // Hint only when the media cell has content
    if ((video && video.getAttribute('src')) || img) {
      imageFrag.appendChild(document.createComment(' field:image '));
    }

    if (video) {
      // For video cards, create an image placeholder from video src (poster frame)
      const videoSrc = video.getAttribute('src') || '';
      const videoEl = document.createElement('a');
      videoEl.href = videoSrc;
      videoEl.textContent = videoSrc;
      imageFrag.appendChild(videoEl);
    } else if (img) {
      const imgClone = img.cloneNode(true);
      imageFrag.appendChild(imgClone);
    }

    // --- Text cell ---
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    const href = card.getAttribute('href') || '';
    const brandNameEl = card.querySelector('.listing-card__meta p.listing-card__title');
    // NOTE: html2md preProcess (DOMUtils.removeSpans) unwraps class-less <span>s before
    // parsers run, so read text from the classed containers, never from inner spans.
    const hoverTitle = card.querySelector('.listing-card__hover-card-title');
    const tagEls = card.querySelectorAll('.listing-card__tags .listing-card__tag');

    // Build text content: brand name as heading, description, tags
    if (brandNameEl) {
      const heading = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = brandNameEl.textContent.trim();
      heading.appendChild(strong);
      textFrag.appendChild(heading);
    }

    if (hoverTitle && hoverTitle.textContent.trim()) {
      const desc = document.createElement('p');
      desc.textContent = hoverTitle.textContent.replace(/\s+/g, ' ').trim();
      textFrag.appendChild(desc);
    }

    // Tags as comma-separated text
    if (tagEls.length > 0) {
      const tagsP = document.createElement('p');
      const tagTexts = [];
      tagEls.forEach((tagLi) => {
        // "( Category )" -> "Category" (works with or without the inner spans)
        const text = tagLi.textContent.replace(/[()\u00a0]/g, ' ').replace(/\s+/g, ' ').trim();
        if (text) tagTexts.push(text);
      });
      tagsP.textContent = tagTexts.join(', ');
      textFrag.appendChild(tagsP);
    }

    // Wrap with link to case study
    if (href) {
      const link = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = 'View Work';
      link.appendChild(a);
      textFrag.appendChild(link);
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-casestudy', cells });
  element.replaceWith(block);
}
