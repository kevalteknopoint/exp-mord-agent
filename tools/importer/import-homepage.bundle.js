var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-homepage.js
  function parse(element, { document }) {
    const image = element.querySelector("div.page-header__image-wrapper picture, .page-header__image-wrapper img");
    const heading = element.querySelector("h1.page-header__title, h1");
    const description = element.querySelector("div.page-header__description, .page-header__description");
    const cta = element.querySelector("a.page-header__cta, .page-header__cta-box a");
    const cells = [];
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(" field:image "));
    if (image) {
      imageCell.appendChild(image);
    }
    cells.push([imageCell]);
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    if (description) {
      const p = document.createElement("p");
      p.textContent = description.textContent.trim();
      textCell.appendChild(p);
    }
    if (cta) textCell.appendChild(cta);
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-homepage", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-feature.js
  function parse2(element, { document }) {
    const image = element.querySelector("div.feature-panel-image picture, .feature-panel-image img");
    const heading = element.querySelector("h2.panel-title, h2");
    const description = element.querySelector("div.panel-description");
    const cta = element.querySelector("div.panel-cta-box a, a.cta-primary");
    const cells = [];
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(" field:image "));
    if (image) {
      imageCell.appendChild(image);
    }
    cells.push([imageCell]);
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    if (description && description.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = description.textContent.trim();
      textCell.appendChild(p);
    }
    if (cta) textCell.appendChild(cta);
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const cells = [];
    const table = element.tagName === "TABLE" ? element : element.querySelector("div.table-wrapper table, table");
    if (table) {
      const rows = table.querySelectorAll("tbody > tr, tr");
      for (const row of rows) {
        const tds = row.querySelectorAll("td");
        const rowCells = [];
        for (const td of tds) {
          const cellContent = document.createDocumentFragment();
          while (td.firstChild) {
            cellContent.appendChild(td.firstChild);
          }
          rowCells.push(cellContent);
        }
        if (rowCells.length > 0) {
          cells.push(rowCells);
        }
      }
      const block2 = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
      element.replaceWith(block2);
      return;
    }
    const tiles = element.querySelectorAll("div.block-content > div.c-feature-tile, div.c-feature-tile");
    if (tiles.length > 0) {
      const rowCells = [];
      for (const tile of tiles) {
        const cellContent = document.createDocumentFragment();
        const img = tile.querySelector("img.feature-image");
        if (img) {
          const picture = document.createElement("picture");
          const newImg = document.createElement("img");
          newImg.src = img.src;
          newImg.alt = img.alt || "";
          picture.appendChild(newImg);
          cellContent.appendChild(picture);
        }
        const heading = tile.querySelector("h3.feature-heading, h3");
        if (heading) {
          const h3 = document.createElement("h3");
          h3.textContent = heading.textContent.trim();
          cellContent.appendChild(h3);
        }
        const contentWrapper = tile.querySelector("div.content-wrapper");
        if (contentWrapper) {
          const descDiv = contentWrapper.querySelector("div.feature-content");
          if (descDiv) {
            const p = document.createElement("p");
            const textNodes = [];
            for (const node of descDiv.childNodes) {
              if (node.nodeType === 3) {
                const text = node.textContent.trim();
                if (text) textNodes.push(text);
              }
            }
            if (textNodes.length > 0) {
              p.textContent = textNodes.join(" ");
              cellContent.appendChild(p);
            }
          }
        }
        const cta = tile.querySelector("a.featur-btn, a.btn-skin-2.btn-icon");
        if (cta) {
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = cta.href;
          link.textContent = cta.textContent.trim();
          p.appendChild(link);
          cellContent.appendChild(p);
        }
        rowCells.push(cellContent);
      }
      if (rowCells.length > 0) {
        cells.push(rowCells);
      }
      const block2 = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
      element.replaceWith(block2);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells: [[""]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-links.js
  function parse4(element, { document }) {
    const linkItems = element.querySelectorAll("a.quick-link-item");
    const cells = [];
    for (const item of linkItems) {
      const label = "card";
      const icon = item.querySelector("div.icon-wrapper img, img");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (icon) {
        const picture = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = icon.src;
        newImg.alt = icon.alt || "";
        picture.appendChild(newImg);
        imageCell.appendChild(picture);
      }
      const title = item.querySelector("h5.quick-link-title, h5");
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (title) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = title.textContent.trim();
        p.appendChild(strong);
        textCell.appendChild(p);
      }
      if (item.href) {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = title ? title.textContent.trim() : "Learn more";
        p.appendChild(link);
        textCell.appendChild(p);
      }
      cells.push([label, imageCell, textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse5(element, { document }) {
    const tiles = element.querySelectorAll("div.block-content > div.c-feature-tile, div.c-feature-tile");
    const cells = [];
    for (const tile of tiles) {
      const label = "card";
      const img = tile.querySelector("img.feature-image, img");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (img) {
        const picture = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.src;
        newImg.alt = img.alt || "";
        picture.appendChild(newImg);
        imageCell.appendChild(picture);
      }
      const heading = tile.querySelector("h3.feature-heading, h3");
      const cta = tile.querySelector("a.featur-btn, a.btn-skin-2.btn-icon");
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (heading) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = heading.textContent.trim();
        p.appendChild(strong);
        textCell.appendChild(p);
      }
      if (cta) {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = cta.href;
        link.textContent = cta.textContent.trim();
        p.appendChild(link);
        textCell.appendChild(p);
      }
      cells.push([label, imageCell, textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ngssuper-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "section.s-notification"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "div.hidden"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header.s-mobile-header",
        "header.s-desktop-header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "section.s-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "a.c-back-to-top"
      ]);
      const emptyDiv = element.querySelector('.page-content > div[class=""]');
      if (emptyDiv && !emptyDiv.textContent.trim()) {
        emptyDiv.remove();
      }
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/ngssuper-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { document } = payload;
      const sections = payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      for (const section of reversedSections) {
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (section.id !== sections[0].id) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-homepage": parse,
    "hero-feature": parse2,
    "columns": parse3,
    "cards-icon-links": parse4,
    "cards": parse5
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Main landing page with hero banner, feature highlights, and promotional content",
    urls: [
      "https://www.ngssuper.com.au/"
    ],
    blocks: [
      {
        name: "hero-homepage",
        instances: [
          "section.s-page-header.skin-primary"
        ]
      },
      {
        name: "columns",
        instances: [
          "section.s-block-fluid.no-top-padding",
          "section.s-content-block.bg-theme-3 table"
        ]
      },
      {
        name: "cards-icon-links",
        instances: [
          "section.s-base-section"
        ]
      },
      {
        name: "hero-feature",
        instances: [
          "section.s-feature-cta-panel.panel-skin-2"
        ]
      },
      {
        name: "cards",
        instances: [
          "section.s-block-fluid:not(.no-top-padding)"
        ]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Banner",
        selector: "section.s-page-header.skin-primary",
        style: "dark",
        blocks: ["hero-homepage"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Disclaimer Text",
        selector: "section.s-page-header + section.s-content-block.color-primary-1",
        style: "dark",
        blocks: [],
        defaultContent: ["p"]
      },
      {
        id: "section-3",
        name: "Feature Columns",
        selector: "section.s-block-fluid.no-top-padding",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Quick Links Grid",
        selector: "section.s-base-section",
        style: null,
        blocks: ["cards-icon-links"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Announcement Banner",
        selector: "section.s-content-block.bg-theme-3",
        style: "warm-beige",
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Award Feature",
        selector: "section.s-feature-cta-panel.panel-skin-2",
        style: null,
        blocks: ["hero-feature"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "News and Articles",
        selector: "section.s-block-fluid:not(.no-top-padding)",
        style: null,
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-8",
        name: "CTA Banner",
        selector: ".page-content > section.s-content-block.color-primary-1:last-of-type",
        style: "dark",
        blocks: [],
        defaultContent: ["h2", "a"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    /**
     * Main transformation function for homepage template
     */
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
