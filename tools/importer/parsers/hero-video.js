/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video
 * Base block: hero
 * Source: https://www.dept.global/en-in/
 * Selector: .block-scrolly-video-intro
 * Generated: 2026-05-25 / Re-validated against dept.global DOM: 2026-10-08
 *
 * UE Model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Structure: Row 1 = video/image (YouTube link preferred, poster fallback), Row 2 = text (H1 + CTA)
 */
export default function parse(element, { document }) {
  // === Extract video URL from YouTube iframe ===
  const iframe = element.querySelector('.plyr__video-embed iframe, .block-scrolly-video-intro__video-container iframe');
  let videoUrl = '';
  if (iframe) {
    const src = iframe.getAttribute('src') || '';
    // Extract the YouTube video ID from embed URL
    const match = src.match(/youtube\.com\/embed\/([^?&]+)/);
    if (match) {
      videoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
    }
  }

  // === Extract poster image as fallback ===
  const posterImg = element.querySelector('.plyr__poster img, .block-scrolly-video-intro__video-container img');

  // === Extract heading ===
  const heading = element.querySelector('h1.block-scrolly-video-intro__title, h1, h2, [class*="__title"]');

  // === Extract CTA link ===
  const ctaLink = element.querySelector('a.block-scrolly-video-intro__cta, a.button-v2, a[class*="__cta"]');

  // === Build Row 1: image/video field ===
  // For xwalk, the video is represented as a link in the image cell
  const imageCell = document.createDocumentFragment();
  // Hint only when the cell has content
  if (videoUrl || posterImg) imageCell.appendChild(document.createComment(' field:image '));

  if (videoUrl) {
    const videoLink = document.createElement('a');
    videoLink.href = videoUrl;
    videoLink.textContent = videoUrl;
    imageCell.appendChild(videoLink);
  } else if (posterImg) {
    imageCell.appendChild(posterImg.cloneNode(true));
  }

  // === Build Row 2: text field (richtext - heading + CTA) ===
  const textCell = document.createDocumentFragment();
  const textComment = document.createComment(' field:text ');
  textCell.appendChild(textComment);

  if (heading) {
    // Clone the heading to preserve semantic HTML
    const h = heading.cloneNode(true);
    // the accent word(s) (orange on the source) are authored as emphasis
    h.querySelectorAll('.is-fancy-serif').forEach((span) => {
      const em = document.createElement('em');
      em.textContent = span.textContent;
      span.replaceWith(em);
    });
    textCell.appendChild(h);
  }

  if (ctaLink) {
    // Wrap CTA in a paragraph for proper richtext structure
    const p = document.createElement('p');
    const link = ctaLink.cloneNode(true);
    // Ensure href is absolute
    if (link.getAttribute('href') && !link.getAttribute('href').startsWith('http')) {
      link.href = `https://www.dept.global${link.getAttribute('href')}`;
    }
    p.appendChild(link);
    textCell.appendChild(p);
  }

  // === Build cells array matching UE model (2 rows: image, text) ===
  const cells = [
    [imageCell],
    [textCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
