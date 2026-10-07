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
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`;
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

  // Style the word "GROWTH" with accent color in the heading
  const h1 = block.querySelector('h1');
  if (h1) {
    const text = h1.textContent;
    if (text.includes('GROWTH')) {
      h1.innerHTML = text.replace(
        'GROWTH',
        '<em>GROWTH</em>',
      );
    }
  }
}
