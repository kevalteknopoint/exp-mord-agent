/*
 * Embed Video
 * Content: optional poster image + a video URL link (YouTube, Vimeo or any embeddable URL).
 * Renders a lazily-loaded, responsive 16:9 iframe; with a poster, the iframe loads on click.
 */

function youtubeSrc(url, autoplay) {
  let vid = url.searchParams.get('v') || '';
  if (url.hostname.includes('youtu.be')) [, vid] = url.pathname.split('/');
  const pathMatch = url.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/);
  if (!vid && pathMatch) [, vid] = pathMatch;
  const params = new URLSearchParams({ rel: '0' });
  if (autoplay) {
    params.set('autoplay', '1');
    params.set('mute', '1');
  }
  return `https://www.youtube.com/embed/${encodeURIComponent(vid)}?${params}`;
}

function vimeoSrc(url, autoplay) {
  const id = url.pathname.split('/').filter(Boolean).pop();
  return `https://player.vimeo.com/video/${id}${autoplay ? '?muted=1&autoplay=1' : ''}`;
}

function buildIframe(link, title, autoplay) {
  const url = new URL(link, window.location.href);
  let src = url.href;
  let provider = 'generic';
  if (url.hostname.includes('youtube') || url.hostname.includes('youtu.be')) {
    src = youtubeSrc(url, autoplay);
    provider = 'youtube';
  } else if (url.hostname.includes('vimeo')) {
    src = vimeoSrc(url, autoplay);
    provider = 'vimeo';
  }
  const frame = document.createElement('div');
  frame.className = `embed-video-frame embed-video-${provider}`;
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title || `Content from ${url.hostname}`;
  iframe.loading = 'lazy';
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope');
  iframe.setAttribute('allowfullscreen', '');
  frame.append(iframe);
  return frame;
}

export default function decorate(block) {
  const anchor = block.querySelector('a');
  const placeholder = block.querySelector('picture');
  if (!anchor) return;
  const link = anchor.href;
  const linkText = anchor.textContent.trim();
  const title = linkText && linkText !== link ? linkText : '';
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-video-placeholder';
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'embed-video-play';
    play.setAttribute('aria-label', title ? `Play ${title}` : 'Play video');
    wrapper.append(placeholder, play);
    wrapper.addEventListener('click', () => {
      block.replaceChildren(buildIframe(link, title, true));
      block.classList.add('embed-video-is-loaded');
    });
    block.append(wrapper);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      block.replaceChildren(buildIframe(link, title, false));
      block.classList.add('embed-video-is-loaded');
    }
  });
  observer.observe(block);
}
