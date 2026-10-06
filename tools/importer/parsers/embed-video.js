/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video. Base: embed.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .youtube-center-brush .youtubevideo
 *
 * Model (embed-video): embed_placeholder (+Alt), embed_uri (+Text) -> grouped into ONE cell
 * Validated selectors (source.html): iframe.videoIframe[src*="youtube.com/embed/"] (title = video title)
 * Fallbacks: any iframe with youtube/vimeo src or data-src, [data-video-id] / [data-videoid] placeholders
 * (the YT iframe API may not have replaced the placeholder yet).
 */
export default function parse(element, { document }) {
  let url = '';
  let title = '';

  const iframe = element.querySelector('iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"], iframe[data-src]');
  if (iframe) {
    const src = iframe.getAttribute('src') || iframe.getAttribute('data-src') || '';
    title = iframe.getAttribute('title') || '';
    const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/#]+)/);
    if (yt) url = `https://www.youtube.com/watch?v=${yt[1]}`;
    else if (src) url = src.startsWith('//') ? `https:${src}` : src;
  }
  if (!url) {
    const holder = element.querySelector('[data-video-id], [data-videoid], [data-youtube-id]');
    const id = holder && (holder.getAttribute('data-video-id') || holder.getAttribute('data-videoid') || holder.getAttribute('data-youtube-id'));
    if (id) url = `https://www.youtube.com/watch?v=${id}`;
  }
  if (!url) {
    const a = element.querySelector('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]');
    if (a) { url = a.getAttribute('href'); title = title || a.textContent.trim(); }
  }

  if (!url) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cell = document.createDocumentFragment();
  const poster = element.querySelector('img[src]:not([src*="pixel"])');
  if (poster) {
    cell.append(document.createComment(' field:embed_placeholder '));
    const img = document.createElement('img');
    img.src = poster.getAttribute('src');
    img.alt = poster.getAttribute('alt') || '';
    cell.append(img);
  }
  cell.append(document.createComment(' field:embed_uri '));
  const a = document.createElement('a');
  a.href = url;
  a.textContent = title || url;
  cell.append(a);

  const cells = [[cell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
