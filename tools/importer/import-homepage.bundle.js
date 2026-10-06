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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-wizard.js
  function parse(element, { document }) {
    const firstStep = element.querySelector("li.step.first-step, li.first-step, li.step") || element;
    const image = firstStep.querySelector(".background-image img, picture img, img");
    const heading = firstStep.querySelector(".js-text-block .heading-title, .text-block h1, .text-block h2, h1, h2");
    const ctas = Array.from(
      firstStep.querySelectorAll(".start-cta-wrapper a[href]")
    ).filter((a) => {
      const href = a.getAttribute("href");
      return href && href !== "#" && !a.classList.contains("js-help-button");
    });
    if (!image && !heading && ctas.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(image);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (heading) textFrag.appendChild(heading);
    ctas.forEach((cta) => {
      const label = cta.querySelector(".cta-text");
      if (label && !cta.textContent.trim()) cta.textContent = label.textContent.trim();
      const p = document.createElement("p");
      p.appendChild(cta);
      textFrag.appendChild(p);
    });
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-wizard", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-callout.js
  function parse2(element, { document }) {
    const cards = Array.from(element.querySelectorAll("a.m9-content-card"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".content-card-media img, picture img, img");
      const heading = card.querySelector(".card-content-wrapper h4, .content-title-sub h4, h3, h4");
      const href = card.getAttribute("href");
      let imageCell = "";
      if (image) {
        const imgFrag = document.createDocumentFragment();
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(image);
        imageCell = imgFrag;
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading);
      if (href) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = heading ? heading.textContent.trim() : href;
        const p = document.createElement("p");
        p.appendChild(link);
        textFrag.appendChild(p);
      }
      cells.push([imageCell, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-callout", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function parse3(element, { document }) {
    const image = element.querySelector(".background-image img, picture img, img");
    const heading = element.querySelector(".text-block .heading-title, .m5-text-block h1, .m5-text-block h2, h1, h2");
    const subheading = element.querySelector(".text-block-paragraph, .text-block .wysiwyg, .m5-text-block > div > span.wysiwyg");
    const cta = element.querySelector(".text-block-cta-wrapper a[href], .text-block-cta a[href]");
    if (!image && !heading && !subheading && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(image);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (heading) textFrag.appendChild(heading);
    if (subheading) {
      const inner = subheading.querySelector("p");
      textFrag.appendChild(inner || subheading);
    }
    if (cta) {
      const label = cta.querySelector(".cta-text");
      if (label && !cta.textContent.trim()) cta.textContent = label.textContent.trim();
      const p = document.createElement("p");
      p.appendChild(cta);
      textFrag.appendChild(p);
    }
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse4(element, { document }) {
    const cards = Array.from(element.querySelectorAll("a.m9-content-card"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".content-card-media img, picture img, img");
      const heading = card.querySelector(".card-content-wrapper h4, .content-title-sub h4, h3, h4");
      const href = card.getAttribute("href");
      let imageCell = "";
      if (image) {
        const imgFrag = document.createDocumentFragment();
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(image);
        imageCell = imgFrag;
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading);
      if (href) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = heading ? heading.textContent.trim() : href;
        const p = document.createElement("p");
        p.appendChild(link);
        textFrag.appendChild(p);
      }
      cells.push([imageCell, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse5(element, { document }) {
    const cards = Array.from(element.querySelectorAll("a.m9-content-card"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".content-card-media img, picture img, img");
      const heading = card.querySelector(".card-content-wrapper h4, .content-title-sub h4, h3, h4");
      const href = card.getAttribute("href");
      let imageCell = "";
      if (image) {
        const imgFrag = document.createDocumentFragment();
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(image);
        imageCell = imgFrag;
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading);
      if (href) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = heading ? heading.textContent.trim() : href;
        const p = document.createElement("p");
        p.appendChild(link);
        textFrag.appendChild(p);
      }
      cells.push([imageCell, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-media.js
  function parse6(element, { document }) {
    const image = element.querySelector(".media img, picture img, img");
    const heading = element.querySelector(".media h1, .media h2, h1, h2");
    const cta = element.querySelector(".btn-wrapper a[href], .media a[href]");
    if (!image && !heading && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(image);
      cells.push([imgFrag]);
    } else {
      cells.push([""]);
    }
    if (heading || cta) {
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading);
      if (cta) {
        const label = cta.querySelector(".cta-text");
        if (label && !cta.textContent.trim()) cta.textContent = label.textContent.trim();
        const p = document.createElement("p");
        p.appendChild(cta);
        textFrag.appendChild(p);
      }
      cells.push([textFrag]);
    } else {
      cells.push([""]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-video.js
  function parse7(element, { document }) {
    const cards = Array.from(element.querySelectorAll(".m9-content-card"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".video-poster img, .content-card-media img, picture img, img");
      const heading = card.querySelector(".card-content-wrapper h4, .content-title-sub h4, h3, h4");
      const iframe = card.querySelector('iframe[src*="youtube.com/embed/"]');
      let watchUrl = "";
      if (iframe) {
        const m = iframe.getAttribute("src").match(/youtube\.com\/embed\/([^?&/]+)/);
        if (m) watchUrl = `https://www.youtube.com/watch?v=${m[1]}`;
      }
      let imageCell = "";
      if (image) {
        const imgFrag = document.createDocumentFragment();
        imgFrag.appendChild(document.createComment(" field:image "));
        imgFrag.appendChild(image);
        imageCell = imgFrag;
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading);
      if (watchUrl) {
        const link = document.createElement("a");
        link.setAttribute("href", watchUrl);
        link.textContent = heading ? heading.textContent.trim() : watchUrl;
        const p = document.createElement("p");
        p.appendChild(link);
        textFrag.appendChild(p);
      }
      cells.push([imageCell, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-badges.js
  function parse8(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".carousel-item, .js-carousel-slide"));
    if (slides.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".carousel-inner-item img, picture img, img");
      const heading = slide.querySelector(".carousel-inner-item h1, .carousel-inner-item h2, .carousel-inner-item h3, h2, h3");
      const cta = slide.querySelector(".carousel-inner-item a[href], a[href]");
      let imageCell = "";
      if (image) {
        const imgFrag = document.createDocumentFragment();
        imgFrag.appendChild(document.createComment(" field:media_image "));
        imgFrag.appendChild(image);
        imageCell = imgFrag;
      }
      let textCell = "";
      if (heading || cta) {
        const textFrag = document.createDocumentFragment();
        textFrag.appendChild(document.createComment(" field:content_text "));
        if (heading) textFrag.appendChild(heading);
        if (cta) {
          const p = document.createElement("p");
          p.appendChild(cta);
          textFrag.appendChild(p);
        }
        textCell = textFrag;
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-badges", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dulux-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#supportchatwidget",
        "div.cloudservice.googlerecaptcha"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header.s1-header",
        "footer.s3-secondary-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "section.c18-logo-group"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript",
        "script"
      ]);
    }
  }

  // tools/importer/transformers/dulux-sections.js
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
    "hero-wizard": parse,
    "cards-callout": parse2,
    "hero-promo": parse3,
    "cards-article": parse4,
    "cards-product": parse5,
    "hero-media": parse6,
    "cards-video": parse7,
    "carousel-badges": parse8
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Dulux India homepage with color wizard, callout blocks, hero banners, related content grid, media, and product carousel",
    urls: [
      "https://www.dulux.in/"
    ],
    blocks: [
      {
        name: "hero-wizard",
        instances: ["div.c32-color-wizard"]
      },
      {
        name: "cards-callout",
        instances: ["div.cmp-c10-callout-blocks"]
      },
      {
        name: "hero-promo",
        instances: [
          "div.cmp-c12-hero-banner.style-appearance-primary-brand-3",
          "div.cmp-c12-hero-banner.style-appearance-light"
        ]
      },
      {
        name: "cards-article",
        instances: [
          "div.cmp-c43-related-content:nth-of-type(6)",
          "div.cmp-c43-related-content:nth-of-type(14)"
        ]
      },
      {
        name: "cards-product",
        instances: ["div.cmp-c43-related-content:nth-of-type(8)"]
      },
      {
        name: "hero-media",
        instances: ["div.cmp-c19-media.style-contain"]
      },
      {
        name: "cards-video",
        instances: ["div.cmp-c43-related-content:nth-of-type(12)"]
      },
      {
        name: "carousel-badges",
        instances: ["div.cmp-c15-carousel"]
      }
    ],
    sections: [
      { id: "sec-1", name: "Color Wizard Hero", selector: "div.c32-color-wizard", style: null, blocks: ["hero-wizard"], defaultContent: [] },
      { id: "sec-2", name: "Callout Tiles", selector: "div.cmp-c10-callout-blocks", style: null, blocks: ["cards-callout"], defaultContent: [] },
      { id: "sec-3", name: "Colour Play Promo Banner", selector: "div.cmp-c12-hero-banner.style-appearance-primary-brand-3", style: null, blocks: ["hero-promo"], defaultContent: [] },
      { id: "sec-4", name: "Inspiring Paint Solutions Intro", selector: "div.cmp-c23-text-block.style-hero:nth-of-type(5)", style: null, blocks: [], defaultContent: ["div.cmp-c23-text-block.style-hero:nth-of-type(5)"] },
      { id: "sec-5", name: "Colour of the Year Cards", selector: "div.cmp-c43-related-content:nth-of-type(6)", style: null, blocks: ["cards-article"], defaultContent: [] },
      { id: "sec-6", name: "Featured Products Intro", selector: "div.cmp-c23-text-block.style-hero:nth-of-type(7)", style: null, blocks: [], defaultContent: ["div.cmp-c23-text-block.style-hero:nth-of-type(7)"] },
      { id: "sec-7", name: "Featured Products Cards", selector: "div.cmp-c43-related-content:nth-of-type(8)", style: null, blocks: ["cards-product"], defaultContent: [] },
      { id: "sec-8", name: "Assurance Media Banner", selector: "div.cmp-c19-media.style-contain", style: null, blocks: ["hero-media"], defaultContent: [] },
      { id: "sec-9", name: "Perfect Your Paint Intro", selector: "div.cmp-c23-text-block.style-hero:nth-of-type(11)", style: null, blocks: [], defaultContent: ["div.cmp-c23-text-block.style-hero:nth-of-type(11)"] },
      { id: "sec-10", name: "YouTube Video Cards", selector: "div.cmp-c43-related-content:nth-of-type(12)", style: null, blocks: ["cards-video"], defaultContent: [] },
      { id: "sec-11", name: "Expert Advice Intro", selector: "div.cmp-c23-text-block.style-hero:nth-of-type(13)", style: null, blocks: [], defaultContent: ["div.cmp-c23-text-block.style-hero:nth-of-type(13)"] },
      { id: "sec-12", name: "Expert Advice Cards", selector: "div.cmp-c43-related-content:nth-of-type(14)", style: null, blocks: ["cards-article"], defaultContent: [] },
      { id: "sec-13", name: "View All Articles Link", selector: "div.cmp-c23-text-block.style-hero:nth-of-type(15)", style: null, blocks: [], defaultContent: ["div.cmp-c23-text-block.style-hero:nth-of-type(15)"] },
      { id: "sec-14", name: "Painting Services Promo Banner", selector: "div.cmp-c12-hero-banner.style-appearance-light", style: null, blocks: ["hero-promo"], defaultContent: [] },
      { id: "sec-15", name: "Rating Badges Carousel", selector: "div.cmp-c15-carousel", style: null, blocks: ["carousel-badges"], defaultContent: [] }
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
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
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
