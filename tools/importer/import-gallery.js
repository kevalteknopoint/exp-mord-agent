/* eslint-disable */
/* global WebImporter */

const PAGE_TEMPLATE = {
  name: 'gallery',
  description: 'Project photo gallery page with images grouped by month',
  urls: ['https://www.nprpl.com/project-gallery-photos'],
};

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // Remove footer
    const footer = main.querySelector('footer');
    if (footer) footer.remove();

    // Remove breadcrumb
    const breadcrumb = main.querySelector('.breadcrumb-sl-inner');
    if (breadcrumb) breadcrumb.remove();

    // Remove load more link and hidden input
    const loadMore = main.querySelector('a.load-more');
    if (loadMore) loadMore.remove();
    const pageId = main.querySelector('input#PageId');
    if (pageId) pageId.remove();

    // Process the banner image as a hero block
    const banner = main.querySelector('section.main-banner img');
    if (banner) {
      const bannerSection = main.querySelector('section.main-banner');
      const heroTable = WebImporter.Blocks.createBlock(document, {
        name: 'hero',
        cells: [[banner.cloneNode(true)]],
      });
      bannerSection.replaceWith(heroTable);
    }

    // Process gallery sections - each h2 + .row becomes a cards block
    const gallery = main.querySelector('section.grid_gallery .gallery-container');
    if (gallery) {
      const children = [...gallery.children];
      const newContent = document.createDocumentFragment();

      for (const child of children) {
        if (child.tagName === 'H2') {
          // Keep heading as default content
          newContent.appendChild(child.cloneNode(true));
        } else if (child.classList.contains('row')) {
          // Convert image grid to cards block
          const items = child.querySelectorAll('a.galleryItem');
          const cells = [];
          items.forEach((item) => {
            const img = item.querySelector('img');
            if (img) {
              const cell = document.createElement('div');
              const pic = document.createElement('picture');
              const imgEl = document.createElement('img');
              imgEl.src = img.src;
              imgEl.alt = img.alt || '';
              pic.appendChild(imgEl);
              cell.appendChild(pic);
              cells.push([cell]);
            }
          });
          if (cells.length > 0) {
            const cardsBlock = WebImporter.Blocks.createBlock(document, {
              name: 'cards',
              cells,
            });
            newContent.appendChild(cardsBlock);
          }
        }
      }

      const gallerySection = main.querySelector('section.grid_gallery');
      gallerySection.innerHTML = '';
      gallerySection.appendChild(newContent);
    }

    // Add metadata
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Generate path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
      },
    }];
  },
};
