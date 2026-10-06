/* eslint-disable */
/* global WebImporter */

/**
 * Parser: tabs-brands
 * Base block: tabs
 * Source: https://www.ceat.com/ - Trusted by the world's best companies (tabbed brand links)
 * UE Model: tabs-brands-item (fields: title, content_heading, content_headingType [collapsed], content_image, content_richtext)
 * Container block: each tab = one row with fields as columns
 * Generated: 2026-05-07
 */
export default function parse(element, { document }) {
  // Extract tab labels from the tablist
  const tabs = Array.from(element.querySelectorAll('.cmp-tabs__tab, [data-cmp-hook-tabs="tab"]'));

  // Extract tab panels
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel, [data-cmp-hook-tabs="tabpanel"]'));

  const cells = [];

  tabs.forEach((tab, index) => {
    const panel = panels[index];
    if (!panel) return;

    // Field: title - the tab label text (e.g., "Car", "Bike", "Scooter")
    const titleFrag = document.createDocumentFragment();
    titleFrag.appendChild(document.createComment(' field:title '));
    const titleText = document.createElement('p');
    titleText.textContent = tab.textContent.trim();
    titleFrag.appendChild(titleText);

    // Field: content_heading - no explicit heading in source panels, leave empty
    // Field: content_image - no images in content panels, leave empty

    // Field: content_richtext - the brand links list
    const contentFrag = document.createDocumentFragment();
    contentFrag.appendChild(document.createComment(' field:content_richtext '));

    // Extract brand links from the panel
    // Car tab uses swiper structure, Bike/Scooter use plain <ul>
    const swiperWrapper = panel.querySelector('.swiper-wrapper, .swiper-tabs-wrapper ul');
    const plainList = panel.querySelector('ul:not(.swiper)');

    if (swiperWrapper) {
      // Car tab: links inside swiper-slide <li> elements
      const ul = document.createElement('ul');
      const slides = swiperWrapper.querySelectorAll('.swiper-slide');
      slides.forEach((slide) => {
        const link = slide.querySelector('a[href]');
        if (link && link.textContent.trim()) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link.href || link.getAttribute('href');
          a.textContent = link.textContent.trim();
          if (link.getAttribute('title')) {
            a.title = link.getAttribute('title');
          }
          li.appendChild(a);
          ul.appendChild(li);
        }
      });
      if (ul.children.length > 0) {
        contentFrag.appendChild(ul);
      }
    } else if (plainList) {
      // Bike/Scooter tabs: plain <ul> with <li><a> items
      const ul = document.createElement('ul');
      const items = plainList.querySelectorAll('li');
      items.forEach((item) => {
        const link = item.querySelector('a[href]');
        if (link && link.textContent.trim()) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link.href || link.getAttribute('href');
          a.textContent = link.textContent.trim();
          if (link.getAttribute('title')) {
            a.title = link.getAttribute('title');
          }
          li.appendChild(a);
          ul.appendChild(li);
        }
      });
      if (ul.children.length > 0) {
        contentFrag.appendChild(ul);
      }
    }

    // Each row = one tab item with columns: title | content (heading + richtext grouped)
    // Per library example: single "Content" column, so all fields in one cell per row
    cells.push([titleFrag, contentFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-brands', cells });
  element.replaceWith(block);
}
