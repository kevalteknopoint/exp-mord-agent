import { createOptimizedPicture } from '../../../scripts/aem.js';

/**
 * Inline video (dept.global case and article pages): YouTube, Vimeo or an MP4 file.
 * Plays muted and looped once in view, like the source players; the poster shows until then.
 * Rows: video link | poster (optional) | text over the video (optional)
 * @param {Element} block The block element
 */

function embedSrc(href) {
  const url = new URL(href, window.location.href);
  const yt = url.hostname.includes('youtu')
    && (url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop());
  if (yt) {
    const params = new URLSearchParams({
      autoplay: 1,
      mute: 1,
      loop: 1,
      playlist: yt,
      controls: 0,
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
    });
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt}?${params}` };
  }
  if (url.hostname.includes('vimeo')) {
    const id = url.pathname.split('/').filter(Boolean).pop();
    return { type: 'iframe', src: `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1&dnt=1` };
  }
  return { type: 'video', src: url.href };
}

function play(block, href, title) {
  const { type, src } = embedSrc(href);
  const frame = document.createElement('div');
  frame.className = 'video-embed-frame';
  if (type === 'iframe') {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title || 'Video';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.loading = 'lazy';
    frame.append(iframe);
  } else {
    const video = document.createElement('video');
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    frame.append(video);
    video.play().catch(() => { /* autoplay blocked: poster stays */ });
  }
  block.querySelector('.video-embed-media').append(frame);
  block.classList.add('video-embed-playing');
}

export default function decorate(block) {
  const [linkRow, posterRow, textRow] = [...block.children];
  const link = linkRow && linkRow.querySelector('a');
  const href = link ? link.href : '';

  const media = document.createElement('div');
  media.className = 'video-embed-media';
  const posterImg = posterRow && posterRow.querySelector('img');
  if (posterImg) {
    const picture = createOptimizedPicture(posterImg.src, posterImg.alt, false, [{ width: '1600' }]);
    picture.classList.add('video-embed-poster');
    media.append(picture);
  }

  if (linkRow) linkRow.className = 'video-embed-source';
  if (posterRow) posterRow.remove();
  if (textRow && textRow.textContent.trim()) {
    textRow.className = 'video-embed-text';
  } else if (textRow) {
    textRow.remove();
  }
  block.prepend(media);

  if (!href) return;
  const title = (textRow && textRow.textContent.trim()) || link.textContent.trim();
  if (!('IntersectionObserver' in window)) {
    play(block, href, title);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      play(block, href, title);
    }
  }, { rootMargin: '200px' });
  observer.observe(block);
}
