export default function decorate(block) {
  const items = [...block.children];
  block.textContent = '';

  const grid = document.createElement('div');
  grid.classList.add('gallery-grid');

  const allImages = [];

  items.forEach((row) => {
    const pic = row.querySelector('picture');
    if (pic) {
      const img = pic.querySelector('img');
      const src = img?.src || '';
      const item = document.createElement('div');
      item.classList.add('gallery-item');
      item.appendChild(pic.cloneNode(true));
      item.dataset.imgSrc = src;
      item.dataset.imgIndex = allImages.length;
      allImages.push(src);
      grid.appendChild(item);
    }
  });

  block.appendChild(grid);

  // Apply load-more visibility to gallery groups (h2 + gallery block pairs)
  const section = block.closest('.section');
  if (section) {
    const allGalleries = section.querySelectorAll('.gallery-wrapper');
    const allHeadings = section.querySelectorAll(':scope > div > h2');
    const visibleCount = 2;

    allGalleries.forEach((wrapper, index) => {
      if (index >= visibleCount) {
        wrapper.classList.add('gallery-hidden');
      }
    });

    allHeadings.forEach((heading, index) => {
      if (index >= visibleCount) {
        heading.classList.add('gallery-hidden');
      }
    });

    // Only the first gallery block in the section adds the Load More button
    const firstGallery = section.querySelector('.gallery-wrapper');
    if (block.closest('.gallery-wrapper') === firstGallery && allGalleries.length > visibleCount) {
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.classList.add('gallery-load-more');
      loadMoreBtn.textContent = 'Load More...';

      loadMoreBtn.addEventListener('click', () => {
        const hiddenItems = section.querySelectorAll('.gallery-hidden');
        const nextBatch = [...hiddenItems].slice(0, 2);
        nextBatch.forEach((el) => el.classList.remove('gallery-hidden'));

        if (section.querySelectorAll('.gallery-hidden').length === 0) {
          loadMoreBtn.remove();
        }
      });

      section.appendChild(loadMoreBtn);
    }
  }

  // Lightbox popup with carousel
  const overlay = document.createElement('div');
  overlay.classList.add('gallery-lightbox');
  overlay.innerHTML = `
    <div class="gallery-lightbox-content">
      <figure class="gallery-lightbox-figure">
        <img class="gallery-lightbox-img" src="" alt="">
        <figcaption class="gallery-lightbox-counter"></figcaption>
      </figure>
      <button class="gallery-lightbox-prev" aria-label="Previous (Left arrow key)">&#10094;</button>
      <button class="gallery-lightbox-next" aria-label="Next (Right arrow key)">&#10095;</button>
    </div>
    <button class="gallery-lightbox-close" aria-label="Close">&times;</button>
  `;
  block.appendChild(overlay);

  const lightboxImg = overlay.querySelector('.gallery-lightbox-img');
  const lightboxCounter = overlay.querySelector('.gallery-lightbox-counter');
  const prevBtn = overlay.querySelector('.gallery-lightbox-prev');
  const nextBtn = overlay.querySelector('.gallery-lightbox-next');
  const closeBtn = overlay.querySelector('.gallery-lightbox-close');

  let currentIndex = 0;

  function getVisibleImages() {
    if (!section) return allImages;
    const visibleItems = section.querySelectorAll('.gallery-wrapper:not(.gallery-hidden) .gallery-item[data-img-src]');
    return [...visibleItems].map((item) => item.dataset.imgSrc).filter(Boolean);
  }

  function showImage(index) {
    const images = getVisibleImages();
    let i = index;
    if (i < 0) i = images.length - 1;
    if (i >= images.length) i = 0;
    currentIndex = i;
    lightboxImg.src = images[currentIndex];
    lightboxCounter.textContent = `${currentIndex + 1} of ${images.length}`;
  }

  function openLightbox(imgSrc) {
    const images = getVisibleImages();
    currentIndex = images.indexOf(imgSrc);
    if (currentIndex === -1) currentIndex = 0;
    showImage(currentIndex);
    overlay.classList.add('gallery-lightbox-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('gallery-lightbox-open');
    document.body.style.overflow = '';
  }

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item && item.dataset.imgSrc) {
      e.preventDefault();
      openLightbox(item.dataset.imgSrc);
    }
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === overlay.querySelector('.gallery-lightbox-content')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('gallery-lightbox-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}
