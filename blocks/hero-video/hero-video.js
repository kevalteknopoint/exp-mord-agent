function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1);
    }
  } catch (e) {
    // not a valid URL
  }
  return null;
}

/*
 * Scroll-linked intro, mirroring the source ScrollTrigger (desktop >= 992px, motion allowed):
 * trigger = the hero section, start "25% 33.3%", end "50% 33.3%", scrub 2.
 * The video scale tween fills the first 2/3 of that range with a power1.out ease.
 * The eased progress is exposed as --hero-video-progress; hero-video.css maps it to a scale.
 */
const MOTION_QUERY = '(width >= 992px) and (prefers-reduced-motion: no-preference)';
const SMOOTHING = 0.6; // seconds (exponential catch-up, approximates GSAP scrub: 2)

function setupScrollGrowth(block) {
  const media = window.matchMedia(MOTION_QUERY);
  const trigger = block.closest('.section') || block;
  let target = 0;
  let current = 0;
  let frame = null;
  let last = 0;

  const measure = () => {
    const { top, height } = trigger.getBoundingClientRect();
    const quarter = height * 0.25;
    if (!quarter) return 0;
    const progress = (window.innerHeight * 0.333 - top - quarter) / quarter;
    return Math.min(1, Math.max(0, progress * 1.5));
  };

  const apply = (value) => {
    const eased = 1 - (1 - value) ** 2;
    block.style.setProperty('--hero-video-progress', eased.toFixed(4));
  };

  const tick = (now) => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    last = now;
    current += (target - current) * (1 - Math.exp(-dt / SMOOTHING));
    if (Math.abs(target - current) < 0.0005) current = target;
    apply(current);
    if (current === target) {
      frame = null;
      last = 0;
    } else {
      frame = window.requestAnimationFrame(tick);
    }
  };

  const onScroll = () => {
    target = measure();
    if (!frame) frame = window.requestAnimationFrame(tick);
  };

  const start = () => {
    target = measure();
    current = target;
    apply(current);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  };

  const stop = () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (frame) window.cancelAnimationFrame(frame);
    frame = null;
    last = 0;
    block.style.removeProperty('--hero-video-progress');
  };

  if (media.matches) start();
  media.addEventListener('change', (e) => (e.matches ? start() : stop()));
}

export default function decorate(block) {
  // Find the video link and convert to embedded YouTube iframe
  const videoRow = block.querySelector(':scope > div:first-child');
  if (videoRow) {
    const link = videoRow.querySelector('a');
    if (link) {
      const url = link.href;
      const videoId = extractYouTubeId(url);
      if (videoId) {
        const videoEmbed = document.createElement('div');
        videoEmbed.className = 'video-embed';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&playsinline=1`;
        iframe.setAttribute('allow', 'autoplay; encrypted-media');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('loading', 'lazy');
        iframe.title = 'YouTube Video Player';
        videoEmbed.append(iframe);
        // Replace the cell content with the embed
        const cell = videoRow.querySelector(':scope > div');
        if (cell) {
          cell.innerHTML = '';
          cell.append(videoEmbed);
        }
      }
    }
  }

  // Style the word "GROWTH" with accent color when the author has not emphasised it already
  const h1 = block.querySelector('h1');
  if (h1 && !h1.querySelector('em')) {
    const text = h1.textContent;
    if (text.includes('GROWTH')) {
      h1.innerHTML = text.replace(
        'GROWTH',
        '<em>GROWTH</em>',
      );
    }
  }

  setupScrollGrowth(block);
}
