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

  // tools/importer/import-dept.js
  var import_dept_exports = {};
  __export(import_dept_exports, {
    default: () => import_dept_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document: document2 }) {
    const iframe = element.querySelector(".plyr__video-embed iframe, .block-scrolly-video-intro__video-container iframe");
    let videoUrl = "";
    if (iframe) {
      const src = iframe.getAttribute("src") || "";
      const match = src.match(/youtube\.com\/embed\/([^?&]+)/);
      if (match) {
        videoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
      }
    }
    const posterImg = element.querySelector(".plyr__poster img, .block-scrolly-video-intro__video-container img");
    const heading = element.querySelector('h1.block-scrolly-video-intro__title, h1, h2, [class*="__title"]');
    const ctaLink = element.querySelector('a.block-scrolly-video-intro__cta, a.button-v2, a[class*="__cta"]');
    const imageCell = document2.createDocumentFragment();
    if (videoUrl || posterImg) imageCell.appendChild(document2.createComment(" field:image "));
    if (videoUrl) {
      const videoLink = document2.createElement("a");
      videoLink.href = videoUrl;
      videoLink.textContent = videoUrl;
      imageCell.appendChild(videoLink);
    } else if (posterImg) {
      imageCell.appendChild(posterImg.cloneNode(true));
    }
    const textCell = document2.createDocumentFragment();
    const textComment = document2.createComment(" field:text ");
    textCell.appendChild(textComment);
    if (heading) {
      const h = heading.cloneNode(true);
      h.querySelectorAll(".is-fancy-serif").forEach((span) => {
        const em = document2.createElement("em");
        em.textContent = span.textContent;
        span.replaceWith(em);
      });
      textCell.appendChild(h);
    }
    if (ctaLink) {
      const p = document2.createElement("p");
      const link = ctaLink.cloneNode(true);
      if (link.getAttribute("href") && !link.getAttribute("href").startsWith("http")) {
        link.href = `https://www.dept.global${link.getAttribute("href")}`;
      }
      p.appendChild(link);
      textCell.appendChild(p);
    }
    const cells = [
      [imageCell],
      [textCell]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function buildRow(el, document2) {
    const image = el.querySelector('img.block-assets-and-copy__media, img[class*="assets-and-copy__media"], img');
    const title = el.querySelector('.block-assets-and-copy__title, [class*="assets-and-copy__title"]');
    const content = el.querySelector(".block-assets-and-copy__content") || el;
    const descriptions = [...content.querySelectorAll('p.block-assets-and-copy__text, p[class*="assets-and-copy__text"]')];
    const ctaLinks = [...content.querySelectorAll("a.button-v2, a[href]")].filter((a, i, arr) => arr.indexOf(a) === i);
    const col1 = [];
    if (image) col1.push(image);
    const col2 = [];
    if (title && title.textContent.trim()) {
      const heading = document2.createElement("h2");
      const clone = title.cloneNode(true);
      clone.querySelectorAll(".is-fancy-serif").forEach((span) => {
        const em = document2.createElement("em");
        em.textContent = span.textContent.replace(/\s+/g, " ").trim();
        span.replaceWith(em);
      });
      clone.querySelectorAll("strong").forEach((strong) => {
        const b = document2.createElement("b");
        b.append(...strong.childNodes);
        strong.replaceWith(b);
      });
      clone.querySelectorAll("span").forEach((span) => span.replaceWith(...span.childNodes));
      heading.innerHTML = clone.innerHTML.replace(/\s+/g, " ").trim();
      col2.push(heading);
    }
    descriptions.forEach((p) => col2.push(p));
    ctaLinks.forEach((link) => {
      const p = document2.createElement("p");
      p.appendChild(link);
      col2.push(p);
    });
    if (!col1.length && !col2.length) return null;
    return [col1.length ? col1 : "", col2.length ? col2 : ""];
  }
  function parse2(element, { document: document2 }) {
    if (!element.parentNode) return;
    const rows = [element];
    let next = element.nextElementSibling;
    while (next && next.classList && next.classList.contains("block-assets-and-copy")) {
      rows.push(next);
      next = next.nextElementSibling;
    }
    const cells = rows.map((row) => buildRow(row, document2)).filter(Boolean);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    rows.slice(1).forEach((row) => row.remove());
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-solutions.js
  function parse3(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".block-talking-points__items > li")];
    if (!items.length) items = [...element.querySelectorAll("a.block-talking-points__item")];
    const defaultContent = [];
    const title = element.querySelector(".block-talking-points__title");
    if (title && title.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = title.textContent.replace(/\s+/g, " ").trim();
      defaultContent.push(h2);
    }
    const subtitle = element.querySelector(".block-talking-points__subtitle");
    if (subtitle && subtitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = subtitle.textContent.replace(/\s+/g, " ").trim();
      defaultContent.push(p);
    }
    const cells = [];
    items.forEach((item) => {
      const link = item.matches("a") ? item : item.querySelector("a.block-talking-points__item, a[href]");
      const image = item.querySelector("img.block-talking-points__item-image, .block-talking-points__item-image-container img");
      const titleSpan = item.querySelector(".block-talking-points__item-text");
      const hoverDescSpan = item.querySelector(".block-talking-points__items-hover-container > span.is-fancy-serif");
      const imageCell = document2.createDocumentFragment();
      if (image && image.getAttribute("src")) {
        imageCell.appendChild(document2.createComment(" field:image "));
        const img = document2.createElement("img");
        img.src = image.getAttribute("src");
        img.alt = image.getAttribute("alt") || "";
        imageCell.appendChild(img);
      }
      const textParts = [];
      const titleText = titleSpan ? titleSpan.textContent.replace(/\s+/g, " ").trim() : "";
      if (titleText) {
        const heading = document2.createElement("h3");
        heading.textContent = titleText;
        textParts.push(heading);
      }
      if (hoverDescSpan && hoverDescSpan.textContent.trim()) {
        const desc = document2.createElement("p");
        desc.textContent = hoverDescSpan.textContent.replace(/\s+/g, " ").trim();
        textParts.push(desc);
      }
      if (link && link.getAttribute("href")) {
        const p = document2.createElement("p");
        const cta = document2.createElement("a");
        cta.href = link.getAttribute("href");
        cta.textContent = titleText || "Learn more";
        p.appendChild(cta);
        textParts.push(p);
      }
      if (!textParts.length && !imageCell.childNodes.length) return;
      const textCell = document2.createDocumentFragment();
      if (textParts.length) {
        textCell.appendChild(document2.createComment(" field:text "));
        textParts.forEach((el) => textCell.appendChild(el));
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...defaultContent);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-solutions", cells });
    defaultContent.forEach((el) => element.before(el));
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-casestudy.js
  function parse4(element, { document: document2 }) {
    const cards = element.querySelectorAll(":scope > a.listing-card");
    const cells = [];
    cards.forEach((card) => {
      const imageFrag = document2.createDocumentFragment();
      const video = card.querySelector(".listing-card__media-container video.listing-card__video");
      const img = card.querySelector(".listing-card__media-container img.listing-card__image");
      if (video && video.getAttribute("src") || img) {
        imageFrag.appendChild(document2.createComment(" field:image "));
      }
      if (video) {
        const videoSrc = video.getAttribute("src") || "";
        const videoEl = document2.createElement("a");
        videoEl.href = videoSrc;
        videoEl.textContent = videoSrc;
        imageFrag.appendChild(videoEl);
      } else if (img) {
        const imgClone = img.cloneNode(true);
        imageFrag.appendChild(imgClone);
      }
      const textFrag = document2.createDocumentFragment();
      textFrag.appendChild(document2.createComment(" field:text "));
      const href = card.getAttribute("href") || "";
      const brandNameEl = card.querySelector(".listing-card__meta p.listing-card__title");
      const hoverTitle = card.querySelector(".listing-card__hover-card-title");
      const tagEls = card.querySelectorAll(".listing-card__tags .listing-card__tag");
      if (brandNameEl) {
        const heading = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = brandNameEl.textContent.trim();
        heading.appendChild(strong);
        textFrag.appendChild(heading);
      }
      if (hoverTitle && hoverTitle.textContent.trim()) {
        const desc = document2.createElement("p");
        desc.textContent = hoverTitle.textContent.replace(/\s+/g, " ").trim();
        textFrag.appendChild(desc);
      }
      if (tagEls.length > 0) {
        const tagsP = document2.createElement("p");
        const tagTexts = [];
        tagEls.forEach((tagLi) => {
          const text = tagLi.textContent.replace(/[()\u00a0]/g, " ").replace(/\s+/g, " ").trim();
          if (text) tagTexts.push(text);
        });
        tagsP.textContent = tagTexts.join(", ");
        textFrag.appendChild(tagsP);
      }
      if (href) {
        const link = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = "View Work";
        link.appendChild(a);
        textFrag.appendChild(link);
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-casestudy", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-solution-rows.js
  function buildRow2(row, document2) {
    const img = row.querySelector("img.block-image-and-fact__image, .block-image-and-fact__content img, img");
    const title = row.querySelector(".block-image-and-fact__title");
    const text = row.querySelector(".block-image-and-fact__text");
    const cta = row.querySelector("a.block-image-and-fact__cta, a.button-v2");
    const imageCell = document2.createDocumentFragment();
    if (img && img.getAttribute("src")) {
      imageCell.appendChild(document2.createComment(" field:image "));
      const pic = document2.createElement("img");
      pic.src = img.getAttribute("src");
      pic.alt = img.getAttribute("alt") || "";
      imageCell.appendChild(pic);
    }
    const textCell = document2.createDocumentFragment();
    const parts = [];
    if (title && title.textContent.trim()) {
      const h3 = document2.createElement("h3");
      h3.textContent = title.textContent.trim();
      parts.push(h3);
    }
    if (text && text.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = text.textContent.replace(/\s+/g, " ").trim();
      parts.push(p);
    }
    if (cta && cta.getAttribute("href")) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.replace(/\s+/g, " ").trim() || "Learn more";
      p.appendChild(a);
      parts.push(p);
    }
    if (parts.length) {
      textCell.appendChild(document2.createComment(" field:text "));
      parts.forEach((el) => textCell.appendChild(el));
    }
    return { hasContent: parts.length > 0 || imageCell.childNodes.length > 0, cells: [imageCell, textCell] };
  }
  function parse5(element, { document: document2 }) {
    if (!element.parentNode) return;
    const rows = [element];
    let next = element.nextElementSibling;
    while (next && next.classList && next.classList.contains("block-image-and-fact")) {
      rows.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    rows.forEach((row) => {
      const built = buildRow2(row, document2);
      if (built.hasContent) cells.push(built.cells);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    rows.slice(1).forEach((row) => row.remove());
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-solution-rows", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-culture.js
  function parse6(element, { document: document2 }) {
    const slides = element.querySelectorAll(".block-feature-turntable__slide .block-feature-turntable__item");
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector("img.block-feature-turntable__item-image");
      const title = slide.querySelector(".block-feature-turntable__item-title");
      const description = slide.querySelector(".block-feature-turntable__item-description");
      const mediaFrag = document2.createDocumentFragment();
      if (image) {
        mediaFrag.appendChild(document2.createComment(" field:media_image "));
        mediaFrag.appendChild(image);
      }
      const contentFrag = document2.createDocumentFragment();
      if (title || description) {
        contentFrag.appendChild(document2.createComment(" field:content_text "));
      }
      if (title) {
        contentFrag.appendChild(title);
      }
      if (description) {
        contentFrag.appendChild(description);
      }
      cells.push([mediaFrag, contentFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-culture", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  function parse7(element, { document: document2 }) {
    const cards = element.querySelectorAll(":scope > a.listing-card-v2");
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img.listing-card-v2__image");
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        const picture = img.closest("picture") || img;
        imageCell.appendChild(picture.cloneNode(true));
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      const clean = (el) => el ? el.textContent.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() : "";
      const typeText = clean(card.querySelector(".listing-card-v2__type-tag"));
      if (typeText) {
        const typePara = document2.createElement("p");
        typePara.textContent = typeText;
        textCell.appendChild(typePara);
      }
      const tagTexts = [...card.querySelectorAll(".listing-card-v2__tag")].map((tag) => clean(tag).replace(/[()]/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
      if (tagTexts.length > 0) {
        const tagPara = document2.createElement("p");
        tagPara.textContent = tagTexts.join(", ");
        textCell.appendChild(tagPara);
      }
      const metaTitle = clean(card.querySelector(".listing-card-v2__meta .listing-card-v2__title, .listing-card-v2__title"));
      const hoverTitle = clean(card.querySelector(".listing-card-v2__hover-card-title"));
      const titleText = hoverTitle || metaTitle;
      if (hoverTitle && metaTitle && metaTitle !== hoverTitle) {
        const clientPara = document2.createElement("p");
        clientPara.textContent = metaTitle;
        textCell.appendChild(clientPara);
      }
      const cardHref = card.getAttribute("href");
      if (titleText) {
        const titleEl = document2.createElement("p");
        if (cardHref) {
          const link = document2.createElement("a");
          link.setAttribute("href", cardHref);
          link.textContent = titleText;
          titleEl.appendChild(link);
        } else {
          titleEl.textContent = titleText;
        }
        textCell.appendChild(titleEl);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-insights", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dept-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Usercentrics cookie consent root: <div id="usercentrics-root">
        "#usercentrics-root",
        // Plyr SVG sprite: <div id="sprite-plyr"> (first child of body)
        "#sprite-plyr",
        // Ad-blocker tracking pixel wrapper: <div class="tracking-blockers js-tracking-blockers">
        ".tracking-blockers",
        // Nav overlay: <div class="page-overlay"> (just before <main>)
        ".page-overlay",
        // Plyr video player controls (play/mute buttons) inside hero: <div class="plyr__controls">
        ".plyr__controls",
        // Decorative empty paragraphs in hero: p.block-scrolly-video-intro__deco-one / __deco-two
        ".block-scrolly-video-intro__deco-one",
        ".block-scrolly-video-intro__deco-two",
        // Carousel nav dots (buttons only): <div class="block-feature-turntable__nav-dots">
        ".block-feature-turntable__nav-dots"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Skip link: <a href="#main-content" class="block-navigation__skip-to-content">
        ".block-navigation__skip-to-content",
        // Header / navigation: <div class="block-navigation js-block-navigation ...">
        "div.block-navigation.js-block-navigation",
        // Desktop flyout <template> and mobile nav <dialog class="block-navigation__mobile-modal">
        "template",
        "dialog.block-navigation__mobile-modal",
        // Footer: <footer class="block-footer-v2 ...">
        "footer.block-footer-v2",
        // Leftover hover-only duplicate containers (if a parser did not consume them)
        ".listing-card__hover-card",
        // Insights card hover overlay: kept until here because cards-insights reads
        // .listing-card-v2__hover-card-title (the real article title on case-study cards)
        ".listing-card-v2__hover-card",
        ".block-talking-points__items-hover-container",
        // Tracking containers: <div id="GxsCRdhiJi">, <div id="batBeacon647787291983">, bing beacon img
        "#GxsCRdhiJi",
        '[id^="batBeacon"]',
        // Tracking iframes (doubleclick, adsrvr #universal_pixel_sk15r8f) and any remaining YouTube iframe
        "iframe",
        // Generic non-content elements
        "script",
        "noscript",
        "style",
        "link"
      ]);
      element.querySelectorAll('img[src*="ml-attr.com"], img[src*="bat.bing.com"], img[src*="sst.deptagency.com"]').forEach((img) => img.remove());
    }
  }

  // tools/importer/transformers/dept-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    return list.map((s) => {
      try {
        return root.querySelector(s);
      } catch (e) {
        return null;
      }
    }).find(Boolean) || null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-dept.js
  var parsers = {
    "hero-video": parse,
    "columns-feature": parse2,
    "cards-solutions": parse3,
    "cards-casestudy": parse4,
    "cards-solution-rows": parse5,
    "carousel-culture": parse6,
    "cards-insights": parse7
  };
  var PAGE_TEMPLATE = {
    name: "dept",
    description: "DEPT India homepage: video hero, statement, feature rows, AI services list, work grid, solution rows, culture carousel, insights",
    urls: [
      "https://www.dept.global/en-in/"
    ],
    path: "/dept",
    metadata: { template: "dept", nav: "/dept-nav", footer: "/dept-footer" },
    blocks: [
      { name: "hero-video", instances: [".block-scrolly-video-intro"] },
      { name: "columns-feature", instances: [".block-assets-and-copy"] },
      { name: "cards-solutions", instances: [".block-talking-points"] },
      { name: "cards-casestudy", instances: [".block-work-listing__items"] },
      { name: "cards-solution-rows", instances: [".block-image-and-fact"] },
      { name: "carousel-culture", instances: [".block-feature-turntable"] },
      { name: "cards-insights", instances: [".block-custom-listing__items"] }
    ],
    sections: [
      { id: "section-1", name: "Hero video intro", selector: [".block-scrolly-video-intro"], style: "dept-hero", blocks: ["hero-video"], defaultContent: [] },
      { id: "section-2", name: "Statement", selector: [".block-statement-v2"], style: "dept-statement", blocks: [], defaultContent: [".block-statement-v2__title"] },
      { id: "section-3", name: "Feature rows (DEPTIFY, Adobe partner)", selector: [".block-statement-v2 + .block-assets-and-copy", ".block-assets-and-copy"], style: "dept-features", blocks: ["columns-feature"], defaultContent: [] },
      { id: "section-4", name: "Services / AI Transformation", selector: [".block-assets-and-copy + .block-text-divider__text-divider", "#main-content > .block-text-divider__text-divider:nth-of-type(5)"], style: "dept-services", blocks: ["cards-solutions"], defaultContent: [".block-text-divider__text-divider", ".block-talking-points__title", ".block-talking-points__subtitle"] },
      { id: "section-5", name: "Work listing", selector: [".block-work-listing"], style: "dept-work", blocks: ["cards-casestudy"], defaultContent: [".block-work-listing__title", ".block-work-listing > a.button-v2"] },
      { id: "section-6", name: "Solutions / How we invent growth", selector: [".block-work-listing + .block-text-divider__text-divider", "#main-content > .block-text-divider__text-divider:nth-of-type(8)"], style: "dept-solutions", blocks: ["cards-solution-rows"], defaultContent: [".block-text-divider__text-divider", ".block-title-with-cta__title"] },
      { id: "section-7", name: "Culture carousel", selector: [".block-feature-turntable"], style: "dept-culture", blocks: ["carousel-culture"], defaultContent: [] },
      { id: "section-8", name: "On our mind / Insights", selector: [".block-custom-listing"], style: "dept-insights", blocks: ["cards-insights"], defaultContent: [".block-custom-listing__title", ".block-custom-listing > a.button-v2"] }
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
            element
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function addMetadata(main, document2, template) {
    const meta = {};
    const title = document2.querySelector('meta[property="og:title"]');
    const description = document2.querySelector('meta[name="description"]') || document2.querySelector('meta[property="og:description"]');
    meta.Title = (document2.title || title && title.content || "").trim();
    if (description && description.content) meta.Description = description.content.trim();
    Object.entries(template.metadata || {}).forEach(([key, value]) => {
      meta[key] = value;
    });
    main.append(WebImporter.Blocks.getMetadataBlock(document2, meta));
    return meta;
  }
  var import_dept_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
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
      main.appendChild(document2.createElement("hr"));
      const meta = addMetadata(main, document2, PAGE_TEMPLATE);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(PAGE_TEMPLATE.path);
      return [{
        element: main,
        path,
        report: {
          title: meta.Title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_dept_exports);
})();
