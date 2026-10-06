/* eslint-disable */
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

  // tools/importer/import-loans.js
  var import_loans_exports = {};
  __export(import_loans_exports, {
    default: () => import_loans_default
  });

  // tools/importer/parsers/cards-loan-banner.js
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function para(document2, text) {
    const p = document2.createElement("p");
    p.textContent = text;
    return p;
  }
  function parse(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".loan-banner")];
    const cells = [];
    cards.forEach((card) => {
      const imageCell = document2.createDocumentFragment();
      const src = card.querySelector("img");
      if (src && src.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      const body = card.querySelector(".loan-banner-text") || card;
      const eyebrow = clean((body.querySelector(".eyebrow") || {}).textContent);
      if (eyebrow) textCell.appendChild(para(document2, eyebrow));
      const heading = body.querySelector("h1, h2, h3");
      if (heading) {
        const h = document2.createElement("h2");
        h.textContent = clean(heading.textContent);
        textCell.appendChild(h);
      }
      const cta = body.querySelector("a.cta") || body.querySelector("a[href]");
      if (cta) {
        const p = document2.createElement("p");
        const link = document2.createElement("a");
        link.href = cta.getAttribute("href") || "#";
        link.textContent = clean(cta.textContent);
        p.append(link);
        textCell.appendChild(p);
      }
      const fine = clean((body.querySelector(".fine-print") || {}).textContent);
      if (fine) textCell.appendChild(para(document2, fine));
      const photo = (card.getAttribute("data-theme") || "dark").toLowerCase();
      const themeCell = document2.createDocumentFragment();
      themeCell.appendChild(document2.createComment(" field:theme "));
      themeCell.appendChild(document2.createTextNode(photo === "light" ? "dark" : "light"));
      cells.push([imageCell, textCell, themeCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-loan-banner", cells });
    element.replaceChildren(block);
  }

  // tools/importer/parsers/carousel-quote.js
  function clean2(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse2(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".testimonial")];
    const cells = [];
    items.forEach((item) => {
      const imageCell = document2.createDocumentFragment();
      const src = item.querySelector("img");
      if (src && src.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell.appendChild(document2.createComment(" field:media_image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:content_text "));
      const quote = item.querySelector("blockquote");
      if (quote) {
        const paras = [...quote.querySelectorAll("p")];
        (paras.length ? paras : [quote]).forEach((q) => {
          const t = clean2(q.textContent);
          if (!t) return;
          const p = document2.createElement("p");
          p.textContent = t;
          textCell.appendChild(p);
        });
      }
      const name = clean2((item.querySelector(".name, figcaption strong") || {}).textContent);
      if (name) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = name;
        p.append(strong);
        textCell.appendChild(p);
      }
      const role = clean2((item.querySelector(".role") || {}).textContent);
      if (role) {
        const p = document2.createElement("p");
        p.textContent = role;
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-quote", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-service-links.js
  function clean3(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse3(element, { document: document2 }) {
    const rows = [...element.querySelectorAll(":scope > li")];
    const cells = [];
    rows.forEach((li) => {
      const a = li.querySelector("a[href]");
      if (!a) return;
      const imageCell = document2.createDocumentFragment();
      const src = li.querySelector("img");
      if (src && src.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      const p = document2.createElement("p");
      const link = document2.createElement("a");
      link.href = a.getAttribute("href") || "#";
      link.textContent = clean3(a.textContent);
      p.append(link);
      textCell.appendChild(p);
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-service-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/loans-sections.js
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (!sections.length) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      sections.forEach((section, i) => {
        if (i === 0) return;
        const el = querySection(element, section.selector);
        if (el) el.before(doc.createElement("hr"));
      });
    }
    if (hookName === "afterTransform") {
      sections.forEach((section) => {
        const el = querySection(element, section.selector);
        if (!el) return;
        el.querySelectorAll("header.section-intro").forEach((h) => h.replaceWith(...h.childNodes));
        if (!section.style) return;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        el.append(metadata);
      });
    }
  }

  // tools/importer/import-loans.js
  var parsers = {
    "cards-loan-banner": parse,
    "carousel-quote": parse2,
    "cards-service-links": parse3
  };
  var PAGE_TEMPLATE = {
    "name": "loans",
    "description": "Loans landing page from design image: stacked loan banners, testimonials carousel, customer service links",
    "urls": [
      "http://localhost:8090/migration-work/design-loans/source/loans.html"
    ],
    "blocks": [
      {
        "name": "cards-loan-banner",
        "instances": [
          "section.loan-banners"
        ]
      },
      {
        "name": "carousel-quote",
        "instances": [
          "section.testimonials .testimonial-list"
        ]
      },
      {
        "name": "cards-service-links",
        "instances": [
          "section.customer-service ul.service-links"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Loan banners",
        "selector": ["#loan-banners"],
        "style": "loans-banners",
        "blocks": ["cards-loan-banner"],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Testimonials",
        "selector": ["#testimonials"],
        "style": "loans-testimonials",
        "blocks": ["carousel-quote"],
        "defaultContent": ["#testimonials .eyebrow", "#testimonials h2"]
      },
      {
        "id": "section-3",
        "name": "Customer service",
        "selector": ["#customer-service"],
        "style": "loans-service",
        "blocks": ["cards-service-links"],
        "defaultContent": ["#customer-service .eyebrow", "#customer-service h2"]
      }
    ]
  };
  var PAGE_METADATA = {
    Title: "Loans",
    template: "loans"
  };
  var transformers = [
    transform
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
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
  function addMetadata(main, document2) {
    const meta = {};
    const description = document2.querySelector('meta[name="description"]');
    meta.Title = PAGE_METADATA.Title || (document2.title || "").trim();
    if (description && description.content) meta.Description = description.content.trim();
    meta.template = PAGE_METADATA.template;
    const block = WebImporter.Blocks.getMetadataBlock(document2, meta);
    main.append(block);
    return meta;
  }
  function relativizeImages(main) {
    main.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      const m = src.match(/^(?:https?:)?\/\/[^/]+(\/images\/loans\/[^?#]+)/i);
      if (m) img.setAttribute("src", m[1]);
    });
  }
  var import_loans_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.querySelector("main") || document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      addMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      relativizeImages(main);
      const path = WebImporter.FileUtils.sanitizePath("/loans");
      return [{
        element: main,
        path,
        report: {
          title: PAGE_METADATA.Title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_loans_exports);
})();
