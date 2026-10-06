/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-gallery.js
  var import_gallery_exports = {};
  __export(import_gallery_exports, {
    default: () => import_gallery_default
  });
  var PAGE_TEMPLATE = {
    name: "gallery",
    description: "Project photo gallery page with images grouped by month",
    urls: ["https://www.nprpl.com/project-gallery-photos"]
  };
  var import_gallery_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      const footer = main.querySelector("footer");
      if (footer) footer.remove();
      const breadcrumb = main.querySelector(".breadcrumb-sl-inner");
      if (breadcrumb) breadcrumb.remove();
      const loadMore = main.querySelector("a.load-more");
      if (loadMore) loadMore.remove();
      const pageId = main.querySelector("input#PageId");
      if (pageId) pageId.remove();
      const banner = main.querySelector("section.main-banner img");
      if (banner) {
        const bannerSection = main.querySelector("section.main-banner");
        const heroTable = WebImporter.Blocks.createBlock(document, {
          name: "hero",
          cells: [[banner.cloneNode(true)]]
        });
        bannerSection.replaceWith(heroTable);
      }
      const gallery = main.querySelector("section.grid_gallery .gallery-container");
      if (gallery) {
        const children = [...gallery.children];
        const newContent = document.createDocumentFragment();
        for (const child of children) {
          if (child.tagName === "H2") {
            newContent.appendChild(child.cloneNode(true));
          } else if (child.classList.contains("row")) {
            const items = child.querySelectorAll("a.galleryItem");
            const cells = [];
            items.forEach((item) => {
              const img = item.querySelector("img");
              if (img) {
                const cell = document.createElement("div");
                const pic = document.createElement("picture");
                const imgEl = document.createElement("img");
                imgEl.src = img.src;
                imgEl.alt = img.alt || "";
                pic.appendChild(imgEl);
                cell.appendChild(pic);
                cells.push([cell]);
              }
            });
            if (cells.length > 0) {
              const cardsBlock = WebImporter.Blocks.createBlock(document, {
                name: "cards",
                cells
              });
              newContent.appendChild(cardsBlock);
            }
          }
        }
        const gallerySection = main.querySelector("section.grid_gallery");
        gallerySection.innerHTML = "";
        gallerySection.appendChild(newContent);
      }
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name
        }
      }];
    }
  };
  return __toCommonJS(import_gallery_exports);
})();
