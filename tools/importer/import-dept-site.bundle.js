/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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

  // tools/importer/import-dept-site-test-final.js
  var import_dept_site_test_final_exports = {};
  __export(import_dept_site_test_final_exports, {
    classify: () => classify,
    default: () => import_dept_site_test_final_default
  });

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

  // tools/importer/parsers/hero-video.js
  function parse(element, { document }) {
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
    const heading2 = element.querySelector('h1.block-scrolly-video-intro__title, h1, h2, [class*="__title"]');
    const ctaLink = element.querySelector('a.block-scrolly-video-intro__cta, a.button-v2, a[class*="__cta"]');
    const imageCell = document.createDocumentFragment();
    if (videoUrl || posterImg) imageCell.appendChild(document.createComment(" field:image "));
    if (videoUrl) {
      const videoLink = document.createElement("a");
      videoLink.href = videoUrl;
      videoLink.textContent = videoUrl;
      imageCell.appendChild(videoLink);
    } else if (posterImg) {
      imageCell.appendChild(posterImg.cloneNode(true));
    }
    const textCell = document.createDocumentFragment();
    const textComment = document.createComment(" field:text ");
    textCell.appendChild(textComment);
    if (heading2) {
      const h = heading2.cloneNode(true);
      h.querySelectorAll(".is-fancy-serif").forEach((span) => {
        const em = document.createElement("em");
        em.textContent = span.textContent;
        span.replaceWith(em);
      });
      textCell.appendChild(h);
    }
    if (ctaLink) {
      const p = document.createElement("p");
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
    const block2 = WebImporter.Blocks.createBlock(document, { name: "hero-video", cells });
    element.replaceWith(block2);
  }

  // tools/importer/parsers/columns-feature.js
  function buildRow(el2, document) {
    const image2 = el2.querySelector('img.block-assets-and-copy__media, img[class*="assets-and-copy__media"], img');
    const title2 = el2.querySelector('.block-assets-and-copy__title, [class*="assets-and-copy__title"]');
    const content = el2.querySelector(".block-assets-and-copy__content") || el2;
    const descriptions = [...content.querySelectorAll('p.block-assets-and-copy__text, p[class*="assets-and-copy__text"]')];
    const ctaLinks = [...content.querySelectorAll("a.button-v2, a[href]")].filter((a, i, arr) => arr.indexOf(a) === i);
    const col1 = [];
    if (image2) col1.push(image2);
    const col2 = [];
    if (title2 && title2.textContent.trim()) {
      const heading2 = document.createElement("h2");
      const clone = title2.cloneNode(true);
      clone.querySelectorAll(".is-fancy-serif").forEach((span) => {
        const em = document.createElement("em");
        em.textContent = span.textContent.replace(/\s+/g, " ").trim();
        span.replaceWith(em);
      });
      clone.querySelectorAll("strong").forEach((strong) => {
        const b = document.createElement("b");
        b.append(...strong.childNodes);
        strong.replaceWith(b);
      });
      clone.querySelectorAll("span").forEach((span) => span.replaceWith(...span.childNodes));
      heading2.innerHTML = clone.innerHTML.replace(/\s+/g, " ").trim();
      col2.push(heading2);
    }
    descriptions.forEach((p) => col2.push(p));
    ctaLinks.forEach((link) => {
      const p = document.createElement("p");
      p.appendChild(link);
      col2.push(p);
    });
    if (!col1.length && !col2.length) return null;
    return [col1.length ? col1 : "", col2.length ? col2 : ""];
  }
  function parse2(element, { document }) {
    if (!element.parentNode) return;
    const rows = [element];
    let next = element.nextElementSibling;
    while (next && next.classList && next.classList.contains("block-assets-and-copy")) {
      rows.push(next);
      next = next.nextElementSibling;
    }
    const cells = rows.map((row) => buildRow(row, document)).filter(Boolean);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    rows.slice(1).forEach((row) => row.remove());
    const block2 = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block2);
  }

  // tools/importer/parsers/cards-solutions.js
  function parse3(element, { document }) {
    let items = [...element.querySelectorAll(".block-talking-points__items > li")];
    if (!items.length) items = [...element.querySelectorAll("a.block-talking-points__item")];
    const defaultContent = [];
    const title2 = element.querySelector(".block-talking-points__title");
    if (title2 && title2.textContent.trim()) {
      const h2 = document.createElement("h2");
      h2.textContent = title2.textContent.replace(/\s+/g, " ").trim();
      defaultContent.push(h2);
    }
    const subtitle = element.querySelector(".block-talking-points__subtitle");
    if (subtitle && subtitle.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = subtitle.textContent.replace(/\s+/g, " ").trim();
      defaultContent.push(p);
    }
    const cells = [];
    items.forEach((item) => {
      const link = item.matches("a") ? item : item.querySelector("a.block-talking-points__item, a[href]");
      const image2 = item.querySelector("img.block-talking-points__item-image, .block-talking-points__item-image-container img");
      const titleSpan = item.querySelector(".block-talking-points__item-text");
      const hoverDescSpan = item.querySelector(".block-talking-points__items-hover-container > span.is-fancy-serif");
      const imageCell = document.createDocumentFragment();
      if (image2 && image2.getAttribute("src")) {
        imageCell.appendChild(document.createComment(" field:image "));
        const img = document.createElement("img");
        img.src = image2.getAttribute("src");
        img.alt = image2.getAttribute("alt") || "";
        imageCell.appendChild(img);
      }
      const textParts = [];
      const titleText = titleSpan ? titleSpan.textContent.replace(/\s+/g, " ").trim() : "";
      if (titleText) {
        const heading2 = document.createElement("h3");
        heading2.textContent = titleText;
        textParts.push(heading2);
      }
      if (hoverDescSpan && hoverDescSpan.textContent.trim()) {
        const desc = document.createElement("p");
        desc.textContent = hoverDescSpan.textContent.replace(/\s+/g, " ").trim();
        textParts.push(desc);
      }
      if (link && link.getAttribute("href")) {
        const p = document.createElement("p");
        const cta3 = document.createElement("a");
        cta3.href = link.getAttribute("href");
        cta3.textContent = titleText || "Learn more";
        p.appendChild(cta3);
        textParts.push(p);
      }
      if (!textParts.length && !imageCell.childNodes.length) return;
      const textCell = document.createDocumentFragment();
      if (textParts.length) {
        textCell.appendChild(document.createComment(" field:text "));
        textParts.forEach((el2) => textCell.appendChild(el2));
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...defaultContent);
      return;
    }
    const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-solutions", cells });
    defaultContent.forEach((el2) => element.before(el2));
    element.replaceWith(block2);
  }

  // tools/importer/parsers/cards-casestudy.js
  function parse4(element, { document }) {
    const cards = element.querySelectorAll(":scope > a.listing-card");
    const cells = [];
    cards.forEach((card) => {
      const imageFrag = document.createDocumentFragment();
      const video2 = card.querySelector(".listing-card__media-container video.listing-card__video");
      const img = card.querySelector(".listing-card__media-container img.listing-card__image");
      if (video2 && video2.getAttribute("src") || img) {
        imageFrag.appendChild(document.createComment(" field:image "));
      }
      if (video2) {
        const videoSrc = video2.getAttribute("src") || "";
        const videoEl = document.createElement("a");
        videoEl.href = videoSrc;
        videoEl.textContent = videoSrc;
        imageFrag.appendChild(videoEl);
      } else if (img) {
        const imgClone = img.cloneNode(true);
        imageFrag.appendChild(imgClone);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const href = card.getAttribute("href") || "";
      const brandNameEl = card.querySelector(".listing-card__meta p.listing-card__title");
      const hoverTitle = card.querySelector(".listing-card__hover-card-title");
      const tagEls = card.querySelectorAll(".listing-card__tags .listing-card__tag");
      if (brandNameEl) {
        const heading2 = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = brandNameEl.textContent.trim();
        heading2.appendChild(strong);
        textFrag.appendChild(heading2);
      }
      if (hoverTitle && hoverTitle.textContent.trim()) {
        const desc = document.createElement("p");
        desc.textContent = hoverTitle.textContent.replace(/\s+/g, " ").trim();
        textFrag.appendChild(desc);
      }
      if (tagEls.length > 0) {
        const tagsP = document.createElement("p");
        const tagTexts = [];
        tagEls.forEach((tagLi) => {
          const text2 = tagLi.textContent.replace(/[()\u00a0]/g, " ").replace(/\s+/g, " ").trim();
          if (text2) tagTexts.push(text2);
        });
        tagsP.textContent = tagTexts.join(", ");
        textFrag.appendChild(tagsP);
      }
      if (href) {
        const link = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "View Work";
        link.appendChild(a);
        textFrag.appendChild(link);
      }
      cells.push([imageFrag, textFrag]);
    });
    const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-casestudy", cells });
    element.replaceWith(block2);
  }

  // tools/importer/parsers/cards-solution-rows.js
  function buildRow2(row, document) {
    const img = row.querySelector("img.block-image-and-fact__image, .block-image-and-fact__content img, img");
    const title2 = row.querySelector(".block-image-and-fact__title");
    const text2 = row.querySelector(".block-image-and-fact__text");
    const cta3 = row.querySelector("a.block-image-and-fact__cta, a.button-v2");
    const imageCell = document.createDocumentFragment();
    if (img && img.getAttribute("src")) {
      imageCell.appendChild(document.createComment(" field:image "));
      const pic = document.createElement("img");
      pic.src = img.getAttribute("src");
      pic.alt = img.getAttribute("alt") || "";
      imageCell.appendChild(pic);
    }
    const textCell = document.createDocumentFragment();
    const parts = [];
    if (title2 && title2.textContent.trim()) {
      const h3 = document.createElement("h3");
      h3.textContent = title2.textContent.trim();
      parts.push(h3);
    }
    if (text2 && text2.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = text2.textContent.replace(/\s+/g, " ").trim();
      parts.push(p);
    }
    if (cta3 && cta3.getAttribute("href")) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = cta3.getAttribute("href");
      a.textContent = cta3.textContent.replace(/\s+/g, " ").trim() || "Learn more";
      p.appendChild(a);
      parts.push(p);
    }
    if (parts.length) {
      textCell.appendChild(document.createComment(" field:text "));
      parts.forEach((el2) => textCell.appendChild(el2));
    }
    return { hasContent: parts.length > 0 || imageCell.childNodes.length > 0, cells: [imageCell, textCell] };
  }
  function parse5(element, { document }) {
    if (!element.parentNode) return;
    const rows = [element];
    let next = element.nextElementSibling;
    while (next && next.classList && next.classList.contains("block-image-and-fact")) {
      rows.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    rows.forEach((row) => {
      const built = buildRow2(row, document);
      if (built.hasContent) cells.push(built.cells);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    rows.slice(1).forEach((row) => row.remove());
    const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-solution-rows", cells });
    element.replaceWith(block2);
  }

  // tools/importer/parsers/carousel-culture.js
  function parse6(element, { document }) {
    const slides = element.querySelectorAll(".block-feature-turntable__slide .block-feature-turntable__item");
    const cells = [];
    slides.forEach((slide2) => {
      const image2 = slide2.querySelector("img.block-feature-turntable__item-image");
      const title2 = slide2.querySelector(".block-feature-turntable__item-title");
      const description = slide2.querySelector(".block-feature-turntable__item-description");
      const mediaFrag = document.createDocumentFragment();
      if (image2) {
        mediaFrag.appendChild(document.createComment(" field:media_image "));
        mediaFrag.appendChild(image2);
      }
      const contentFrag = document.createDocumentFragment();
      if (title2 || description) {
        contentFrag.appendChild(document.createComment(" field:content_text "));
      }
      if (title2) {
        contentFrag.appendChild(title2);
      }
      if (description) {
        contentFrag.appendChild(description);
      }
      cells.push([mediaFrag, contentFrag]);
    });
    const block2 = WebImporter.Blocks.createBlock(document, { name: "carousel-culture", cells });
    element.replaceWith(block2);
  }

  // tools/importer/parsers/cards-insights.js
  function parse7(element, { document }) {
    const cards = element.querySelectorAll(":scope > a.listing-card-v2");
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img.listing-card-v2__image");
      const imageCell = document.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document.createComment(" field:image "));
        const picture = img.closest("picture") || img;
        imageCell.appendChild(picture.cloneNode(true));
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      const clean = (el2) => el2 ? el2.textContent.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() : "";
      const typeText = clean(card.querySelector(".listing-card-v2__type-tag"));
      if (typeText) {
        const typePara = document.createElement("p");
        typePara.textContent = typeText;
        textCell.appendChild(typePara);
      }
      const tagTexts = [...card.querySelectorAll(".listing-card-v2__tag")].map((tag) => clean(tag).replace(/[()]/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
      if (tagTexts.length > 0) {
        const tagPara = document.createElement("p");
        tagPara.textContent = tagTexts.join(", ");
        textCell.appendChild(tagPara);
      }
      const metaTitle = clean(card.querySelector(".listing-card-v2__meta .listing-card-v2__title, .listing-card-v2__title"));
      const hoverTitle = clean(card.querySelector(".listing-card-v2__hover-card-title"));
      const titleText = hoverTitle || metaTitle;
      if (hoverTitle && metaTitle && metaTitle !== hoverTitle) {
        const clientPara = document.createElement("p");
        clientPara.textContent = metaTitle;
        textCell.appendChild(clientPara);
      }
      const cardHref = card.getAttribute("href");
      if (titleText) {
        const titleEl = document.createElement("p");
        if (cardHref) {
          const link = document.createElement("a");
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
    const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-insights", cells });
    element.replaceWith(block2);
  }

  // tools/importer/parsers/dept/utils.js
  var BLOCK_TAGS = /* @__PURE__ */ new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "TABLE", "BLOCKQUOTE", "PRE", "HR"]);
  var DROP_SELECTOR = 'svg, button, form, input, select, textarea, label, script, style, noscript, template, dialog, iframe:not([src*="youtube"]):not([src*="vimeo"])';
  function text(el2) {
    return el2 ? el2.textContent.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() : "";
  }
  function pick(root, ...selectors) {
    for (const s of selectors) {
      const el2 = root.querySelector(s);
      if (el2) return el2;
    }
    return null;
  }
  function linkParagraph(document, href, label, strong = false) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    if (strong) {
      const s = document.createElement("strong");
      s.append(a);
      p.append(s);
    } else {
      p.append(a);
    }
    return p;
  }
  function el(document, tag, content) {
    const node = document.createElement(tag);
    if (content !== void 0) node.textContent = content;
    return node;
  }
  function image(document, img) {
    if (!img) return null;
    const src = img.getAttribute("data-src") || img.currentSrc || img.getAttribute("src");
    if (!src || src.startsWith("data:")) return null;
    const out2 = document.createElement("img");
    out2.src = src;
    out2.alt = (img.getAttribute("alt") || "").trim();
    return out2;
  }
  function backgroundImage(document, node) {
    if (!node) return null;
    const style = node.getAttribute("style") || "";
    const m = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
    const src = m && m[1] || node.getAttribute("data-bg") || node.getAttribute("data-background-image");
    if (!src) return null;
    const out2 = document.createElement("img");
    out2.src = src;
    out2.alt = "";
    return out2;
  }
  function flatten(document, source) {
    const root = source.cloneNode(true);
    root.querySelectorAll(DROP_SELECTOR).forEach((n) => n.remove());
    root.querySelectorAll('[aria-hidden="true"]').forEach((n) => {
      if (!n.querySelector("img")) n.remove();
    });
    const out2 = [];
    let para = null;
    const flush = () => {
      if (para && (text(para) || para.querySelector("img"))) out2.push(para);
      para = null;
    };
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          if (child.textContent.trim()) {
            para = para || document.createElement("p");
            para.append(child.textContent.replace(/\s+/g, " "));
          }
          return;
        }
        if (child.nodeType !== 1) return;
        const tag = child.tagName;
        if (tag === "TABLE") {
          flush();
          [...child.querySelectorAll("tr")].forEach((tr, i) => {
            const line = [...tr.children].map((c) => text(c)).filter(Boolean).join(" \xB7 ");
            if (!line) return;
            const p = document.createElement("p");
            if (i === 0 && tr.querySelector("th")) p.append(el(document, "strong", line));
            else p.textContent = line;
            out2.push(p);
          });
          return;
        }
        if (BLOCK_TAGS.has(tag)) {
          flush();
          if (text(child) || child.querySelector("img") || tag === "HR") out2.push(child);
          return;
        }
        if (tag === "IMG") {
          const img = image(document, child);
          if (img) {
            flush();
            const p = document.createElement("p");
            p.append(img);
            out2.push(p);
          }
          return;
        }
        if (tag === "PICTURE") {
          const img = image(document, child.querySelector("img"));
          if (img) {
            flush();
            const p = document.createElement("p");
            p.append(img);
            out2.push(p);
          }
          return;
        }
        if (tag === "VIDEO") {
          const src = child.getAttribute("src") || child.querySelector("source") && child.querySelector("source").getAttribute("src");
          if (src) {
            flush();
            out2.push(linkParagraph(document, src, src));
          }
          return;
        }
        if (tag === "IFRAME") {
          flush();
          const src = child.getAttribute("src") || child.getAttribute("data-src");
          if (src) out2.push(linkParagraph(document, src, src));
          return;
        }
        if (tag === "A") {
          if (child.querySelector("h1, h2, h3, h4, h5, h6, p, div, img, picture")) {
            flush();
            walk(child);
            const label = text(child.querySelector("h1, h2, h3, h4, h5, h6")) || text(child);
            if (child.href && label) out2.push(linkParagraph(document, child.href, label));
            return;
          }
          if (!text(child)) return;
          para = para || document.createElement("p");
          para.append(child);
          return;
        }
        if (["STRONG", "B", "EM", "I", "U", "SUB", "SUP", "CODE", "BR"].includes(tag)) {
          para = para || document.createElement("p");
          para.append(child);
          return;
        }
        const bg = backgroundImage(document, child);
        if (bg) {
          flush();
          const p = document.createElement("p");
          p.append(bg);
          out2.push(p);
        }
        const isInline = tag === "SPAN" && !child.querySelector("div, p, h1, h2, h3, h4, h5, h6, ul, ol, img, picture");
        if (isInline) {
          if (!text(child)) return;
          para = para || document.createElement("p");
          para.append(child.textContent.replace(/\s+/g, " "));
          return;
        }
        flush();
        walk(child);
        flush();
      });
    };
    walk(root);
    flush();
    out2.forEach((n) => {
      [n, ...n.querySelectorAll("*")].forEach((e) => {
        [...e.attributes].forEach((a) => {
          if (!["href", "src", "alt", "colspan", "rowspan"].includes(a.name)) e.removeAttribute(a.name);
        });
      });
    });
    return out2;
  }
  function field(document, name, ...nodes) {
    const frag = document.createDocumentFragment();
    const flat = nodes.flat().filter(Boolean);
    if (!flat.length) return "";
    frag.append(document.createComment(` field:${name} `));
    flat.forEach((n) => frag.append(typeof n === "string" ? document.createTextNode(n) : n));
    return frag;
  }
  function block(document, name, cells) {
    return WebImporter.Blocks.createBlock(document, { name, cells });
  }
  function localHref(href) {
    if (!href || href === "/dept" || href.startsWith("/dept/") || href.startsWith("#")) return href;
    let u;
    try {
      u = new URL(href, "https://www.dept.global/");
    } catch (e) {
      return href;
    }
    if (!/^(www\.)?dept\.global$/.test(u.hostname)) return href;
    if (u.pathname.startsWith("/wp-content/") || u.pathname.startsWith("/wp-json/")) return u.href;
    if (/\.[a-z0-9]{2,5}$/i.test(u.pathname)) return u.href;
    if (u.search && /[?&](p|post_type|s)=/.test(u.search)) return u.href;
    const path = u.pathname.replace(/\/+$/, "");
    return `/dept${path || "/index"}${u.hash || ""}`;
  }
  var DAM_ROOT = "/content/dam/exp-mord-agent/dept";
  function damPath(src) {
    if (!src) return null;
    if (src.startsWith(`${DAM_ROOT}/`)) return src;
    let u;
    try {
      u = new URL(src, "https://www.dept.global/");
    } catch (e) {
      return null;
    }
    if (!/^(www\.)?dept\.global$/.test(u.hostname)) return null;
    const m = u.pathname.match(/^\/wp-content\/(.+)$/);
    if (!m) return null;
    let rel;
    try {
      rel = decodeURIComponent(m[1]);
    } catch (e) {
      rel = m[1];
    }
    rel = rel.split("/").filter(Boolean).map((seg) => seg.replace(/[^A-Za-z0-9._-]+/g, "-")).join("/");
    return `${DAM_ROOT}/${rel}`;
  }
  function useDamImages(root) {
    const pairs = [];
    root.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      const dam = damPath(src);
      if (!dam) return;
      img.setAttribute("src", dam);
      let source = src;
      try {
        source = new URL(src, "https://www.dept.global/").href.split(/[?#]/)[0];
      } catch (e) {
      }
      pairs.push([source, dam]);
    });
    root.querySelectorAll("source[srcset]").forEach((s) => s.remove());
    return pairs;
  }

  // tools/importer/parsers/dept/handlers/detail.js
  var BR_RUN = /(?:\s|&nbsp;)*(?:<br\s*\/?>(?:\s|&nbsp;)*){2,}/i;
  var LISTINGS = {
    event: ["all-events", { "de-dach": "insights", "en-in": "insights", latam: "dept-insights-descargas-y-eventos" }],
    downloads: ["all-whitepapers", { "de-dach": "alle-whitepaper", latam: "dept-insights-descargas-y-eventos" }],
    agency: ["agency-details", { "de-dach": "ueber-uns", "en-in": "about-us", latam: "detalles-de-la-agencia" }],
    office: ["contact-us", { "de-dach": "kontakt-bueros", latam: "contacto" }]
  };
  var BACK_LABEL = { "de-dach": "Zur\xFCck", latam: "Volver" };
  var DOWNLOAD_LABEL = { "de-dach": "Whitepaper herunterladen", latam: "Descargar" };
  function trimBreaks(node) {
    const edge = (first) => {
      let n = first ? node.firstChild : node.lastChild;
      while (n && (n.nodeType === 3 && !n.textContent.trim() || n.nodeType === 1 && n.tagName === "BR")) {
        const next = first ? n.nextSibling : n.previousSibling;
        n.remove();
        n = next;
      }
    };
    edge(true);
    edge(false);
    if (node.firstChild && node.firstChild.nodeType === 3) node.firstChild.textContent = node.firstChild.textContent.replace(/^\s+/, "");
    if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.textContent = node.lastChild.textContent.replace(/\s+$/, "");
    return node;
  }
  function inline(document, source, tag) {
    const out2 = el(document, tag);
    const isHeading = /^H\d$/i.test(tag);
    const walk = (from, to) => {
      from.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          to.append(n.textContent.replace(/\s+/g, " "));
          return;
        }
        if (n.nodeType !== 1 || n.matches("svg, button, script, style, i.icon")) return;
        if (n.tagName === "BR") {
          to.append(el(document, "br"));
          return;
        }
        const wrap = n.matches("strong, b") && !isHeading && "strong" || n.matches("em, i") && "em" || n.tagName === "A" && n.getAttribute("href") && "a";
        if (wrap) {
          const w = el(document, wrap);
          if (wrap === "a") w.href = n.getAttribute("href");
          walk(n, w);
          if (text(w)) to.append(w);
          return;
        }
        walk(n, to);
      });
    };
    walk(source, out2);
    out2.innerHTML = out2.innerHTML.replace(/\s*<br>\s*/g, "<br>");
    return trimBreaks(out2);
  }
  function richText(document, source) {
    if (!source) return [];
    const out2 = [];
    flatten(document, source).forEach((n) => {
      if (n.tagName !== "P" || n.querySelector("img") || !BR_RUN.test(n.innerHTML)) {
        if (n.tagName === "P") trimBreaks(n);
        if (text(n) || n.querySelector("img")) out2.push(n);
        return;
      }
      n.innerHTML.split(BR_RUN).forEach((part) => {
        const p = el(document, "p");
        p.innerHTML = part;
        if (text(trimBreaks(p))) out2.push(p);
      });
    });
    return out2;
  }
  function labelled(document, label, value) {
    const p = el(document, "p");
    if (label) {
      p.append(el(document, "strong", label));
      p.append(" ");
    }
    p.append(value);
    return p;
  }
  function formUrl(node) {
    const iframe = node && node.querySelector("iframe");
    if (!iframe) return "";
    return (iframe.getAttribute("src") || iframe.getAttribute("data-src") || iframe.getAttribute("data-initial-src") || "").trim();
  }
  function backLink(element, ctx, kind) {
    const { document, locale } = ctx;
    const button = element.querySelector('[class*="back-button"], [class*="__btn"][onclick*="history"]');
    const label = text(button) || BACK_LABEL[locale] || "Back";
    const href = button && button.tagName === "A" ? button.getAttribute("href") || "" : "";
    if (href && !href.includes("?")) return linkParagraph(document, href, label);
    const [slug2, overrides] = LISTINGS[kind];
    const path = [locale, overrides[locale] || slug2].filter(Boolean).join("/");
    return linkParagraph(document, `https://www.dept.global/${path}/`, label);
  }
  function title(document, source) {
    return source && text(source) ? el(document, "h1", text(source)) : null;
  }
  function headerImage(document, img, h1) {
    const out2 = image(document, img);
    if (out2 && !out2.alt && h1) out2.alt = text(h1);
    return out2;
  }
  function detailPanel(document, variant, img, nodes) {
    return block(document, `Detail Panel (${variant})`, [
      [img ? field(document, "image", img) : ""],
      [field(document, "text", nodes.filter(Boolean))]
    ]);
  }
  function decodeEmail(hex) {
    if (!hex || !/^[0-9a-f]+$/i.test(hex)) return "";
    const key = parseInt(hex.slice(0, 2), 16);
    let out2 = "";
    for (let i = 2; i < hex.length; i += 2) out2 += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
    try {
      return decodeURIComponent(escape(out2));
    } catch (e) {
      return out2;
    }
  }
  function emailOf(node) {
    if (!node) return "";
    const a = node.matches("a") ? node : node.querySelector("a");
    const href = a && a.getAttribute("href") || "";
    if (href.startsWith("mailto:")) return href.slice(7).split("?")[0];
    const cf = node.querySelector("[data-cfemail]") || (node.matches("[data-cfemail]") ? node : null);
    const hex = cf && cf.getAttribute("data-cfemail") || (href.match(/email-protection#([0-9a-f]+)/i) || [])[1];
    const decoded = decodeEmail(hex);
    if (decoded) return decoded;
    return /@/.test(text(node)) ? text(node) : "";
  }
  function agencyDetail([element], ctx) {
    const { document } = ctx;
    const h1 = pick(element, "h1", '[class*="__heading"]');
    const nodes = [backLink(element, ctx, "agency"), title(document, h1)];
    element.querySelectorAll('[class*="__text"]').forEach((t) => {
      if (text(t)) nodes.push(inline(document, t, "p"));
    });
    const cta3 = element.querySelector('a[class*="__btn"][href]');
    if (cta3 && text(cta3)) nodes.push(linkParagraph(document, cta3.getAttribute("href"), text(cta3)));
    const img = headerImage(document, element.querySelector('[class*="__image-wrap"] img'), h1);
    return [detailPanel(document, "split", img, nodes)];
  }
  function locationDetail([element], ctx) {
    const { document } = ctx;
    const h1 = pick(element, "h1", '[class*="__heading"]');
    const nodes = [backLink(element, ctx, "office"), title(document, h1)];
    const mail = emailOf(element.querySelector('[class*="__mail"]'));
    if (mail) nodes.push(linkParagraph(document, `mailto:${mail}`, mail));
    ['[class*="__phone"]', '[class*="__address"]'].forEach((sel) => {
      const n = element.querySelector(sel);
      if (n && text(n)) nodes.push(inline(document, n, "p"));
    });
    const cta3 = element.querySelector('a[class*="cta-bar"][href]');
    if (cta3 && text(cta3)) nodes.push(linkParagraph(document, cta3.getAttribute("href"), text(cta3.querySelector('[class*="__label"]') || cta3), true));
    const img = headerImage(document, element.querySelector('[class*="__image-wrap"] img'), h1);
    return [detailPanel(document, "split", img, nodes)];
  }
  function whitepaperDetail([element], ctx) {
    const { document, locale } = ctx;
    const h1 = pick(element, "h1", '[class*="__whitepaper-title"]');
    const img = headerImage(document, element.querySelector('[class*="__featured-image-wrap"] img, [class*="__header"] img'), h1);
    const out2 = [detailPanel(document, "overlay", img, [backLink(element, ctx, "downloads"), title(document, h1)])];
    const intro2 = element.querySelector('[class*="__cta-content-title"]');
    if (intro2 && text(intro2)) out2.push(el(document, "p", text(intro2)));
    element.querySelectorAll('[class*="__cta-content-text"]').forEach((t) => out2.push(...richText(document, t)));
    const form = formUrl(element.querySelector('[class*="__form"]'));
    if (form) out2.push(linkParagraph(document, form, DOWNLOAD_LABEL[locale] || "Download"));
    return out2;
  }
  function eventDetails(elements, ctx) {
    const { document } = ctx;
    const element = elements.find((e) => !e.classList.contains("flyout-drawer"));
    const drawer = elements.find((e) => e.classList.contains("flyout-drawer")) || document.querySelector(".block-event-details__flyout-drawer");
    if (!element) return [];
    const h1 = pick(element, "h1", '[class*="__event-title"]');
    const img = headerImage(document, element.querySelector('[class*="__featured-image-wrap"] img'), h1);
    const out2 = [detailPanel(document, "overlay", img, [backLink(element, ctx, "event"), title(document, h1)])];
    const bar = pick(element, '[class*="__content-floating-bar-desktop"]', '[class*="__content-floating-bar-mobile"]');
    if (bar) {
      const utc = (iso) => {
        const d = new Date(iso || "");
        return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(11, 16);
      };
      const start = utc(element.getAttribute("data-event-start"));
      const end = utc(element.getAttribute("data-event-end"));
      [...bar.querySelectorAll('p[class*="-title"]')].forEach((label) => {
        const value = label.nextElementSibling;
        if (!value || !text(value)) return;
        if (/time-title/.test(label.className) && start) {
          const name = text(label).replace(/\s*\(.*\)\s*$/, "");
          out2.push(labelled(document, `${name} (UTC)`, end ? `${start} \u2013 ${end}` : start));
        } else {
          out2.push(labelled(document, text(label), text(value)));
        }
      });
    }
    element.querySelectorAll(".author").forEach((author) => {
      const portrait = image(document, author.querySelector("img"));
      const lines2 = author.querySelector(".author__text");
      if (portrait) {
        if (!portrait.alt && lines2 && lines2.firstChild) portrait.alt = lines2.firstChild.textContent.trim();
        const p = el(document, "p");
        p.append(portrait);
        out2.push(p);
      }
      if (lines2 && text(lines2)) out2.push(inline(document, lines2, "p"));
    });
    out2.push(...richText(document, element.querySelector('[class*="__content-details"]')));
    const trigger = drawer && drawer.getAttribute("data-trigger");
    let button = null;
    try {
      button = trigger ? document.querySelector(trigger) : null;
    } catch (e) {
    }
    const form = formUrl(drawer);
    if (button && form) out2.push(linkParagraph(document, form, text(button) || "Register"));
    return out2;
  }
  function partnerHeader(elements, ctx) {
    const { document } = ctx;
    const out2 = [];
    elements.forEach((element) => {
      if (element.tagName === "P") {
        if (text(element)) out2.push(inline(document, element, "p"));
        return;
      }
      const h1 = pick(element, "h1", '[class*="__title"]');
      const nodes = [];
      const logo2 = image(document, element.querySelector('img[class*="__partner-logo-img"]'));
      if (logo2) {
        if (!logo2.alt) logo2.alt = `${text(h1).split(" ")[0]} logo`;
        const p = el(document, "p");
        p.append(logo2);
        nodes.push(p);
      }
      nodes.push(title(document, h1));
      const cta3 = element.querySelector('a[class*="__cta-button"][href]');
      if (cta3 && text(cta3)) nodes.push(linkParagraph(document, cta3.getAttribute("href"), text(cta3)));
      const img = headerImage(document, element.querySelector('[class*="__image-wrap"]:not([class*="logo"]) img'), h1);
      out2.push(detailPanel(document, "overlay", img, nodes));
    });
    return out2;
  }
  function formPage([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const t = element.querySelector('[class*="__title"]');
    if (t && text(t)) out2.push(el(document, "h2", text(t)));
    const form = formUrl(element);
    if (form) out2.push(linkParagraph(document, form, text(t) || "Register"));
    return out2.length ? out2 : flatten(document, element);
  }
  function jobDetails(elements, ctx) {
    const { document } = ctx;
    const out2 = [];
    elements.forEach((element) => {
      const part = [...element.classList].find((c) => c.startsWith("block-job-details__")) || "";
      if (part.endsWith("__intro")) {
        const overline = element.querySelector('[class*="__overline"]');
        if (overline && text(overline)) out2.push(inline(document, overline, "p"));
        const h1 = title(document, element.querySelector('[class*="__job-name"], h1'));
        if (h1) out2.push(h1);
        const cities = element.querySelector('[class*="__cities"]');
        if (cities && text(cities)) {
          const faded = text(cities.querySelector(".is-faded"));
          const label = faded ? text(cities).slice(0, text(cities).length - faded.length).trim() : "";
          out2.push(label ? labelled(document, label, faded) : el(document, "p", text(cities)));
        }
      } else if (part.endsWith("__meta")) {
        element.querySelectorAll("p").forEach((p) => {
          const label = text(p.querySelector("b, strong"));
          const value = text(p).slice(label.length).trim();
          if (value) out2.push(labelled(document, label, value));
        });
      } else if (part.endsWith("__content")) {
        const teaser = element.querySelector('[class*="__teaser-headline"]');
        if (teaser && text(teaser)) out2.push(el(document, "h2", text(teaser)));
        const apply = element.querySelector('a[class*="__apply-button"][href]');
        if (apply && text(apply)) out2.push(linkParagraph(document, apply.getAttribute("href"), text(apply), true));
        out2.push(...richText(document, element.querySelector('[class*="__job-ad"]')));
      } else {
        out2.push(...flatten(document, element));
      }
    });
    return out2;
  }
  var HANDLERS = {
    "panel-agency-detail": { handler: agencyDetail },
    "panel-location-detail": { handler: locationDetail },
    "whitepaper-detail-panel": { handler: whitepaperDetail },
    "event-details": { handler: eventDetails, group: true },
    // intro, meta and content are separate children of <main>: one section
    "job-details": { handler: jobDetails, group: true },
    // the header and its intro line (block-partner-header__cta) are separate children of <main>
    "partner-header": { handler: partnerHeader, group: true },
    "form-page": { handler: formPage }
  };

  // tools/importer/parsers/dept/handlers/logos.js
  function logo(document, img, altFromFile = true) {
    const out2 = image(document, img);
    if (!out2 || out2.alt || !altFromFile) return out2;
    const name = decodeURIComponent(out2.src.split(/[?#]/)[0].split("/").pop() || "").replace(/\.[a-z0-9]+$/i, "").replace(/[-_](\d+|logo|white|size|wit|weiss)(?=[-_]|$)/gi, "").replace(/[-_]+/g, " ").trim();
    out2.alt = name;
    return out2;
  }
  function uniqueImages(element, selector) {
    const seen = /* @__PURE__ */ new Set();
    return [...element.querySelectorAll(selector)].filter((img) => {
      const src = img.getAttribute("data-src") || img.getAttribute("src") || "";
      if (!src || seen.has(src)) return false;
      seen.add(src);
      return true;
    });
  }
  function logoGrid(document, variant, items) {
    const rows = items.filter((i) => i.img).map(({ img, textNodes }) => {
      const row = [field(document, "image", img)];
      if (textNodes && textNodes.length) row.push(field(document, "text", textNodes));
      return row;
    });
    if (!rows.length) return null;
    return block(document, variant ? `logo-grid (${variant})` : "logo-grid", rows);
  }
  function titleOf(document, node) {
    if (!node || !text(node)) return null;
    const h = el(document, "h2");
    const walk = (from) => from.childNodes.forEach((n) => {
      if (n.nodeType === 3) h.append(n.textContent.replace(/\s+/g, " "));
      else if (n.nodeType !== 1) return;
      else if (n.tagName === "BR") h.append(" ");
      else if (n.matches(".is-fancy-serif, em, i")) {
        if (text(n)) h.append(el(document, "em", text(n)));
      } else walk(n);
    });
    walk(node);
    h.innerHTML = h.innerHTML.replace(/<\/em>(\s*)<em>/g, "$1").replace(/\s+/g, " ").trim();
    return h;
  }
  function highlightedLogos([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf(document, element.querySelector('[class*="__title"]:not([class*="__title-wrap"])'));
    if (title2) out2.push(title2);
    element.querySelectorAll('[class*="__subtitle"]').forEach((p) => {
      if (text(p)) out2.push(el(document, "p", text(p)));
    });
    const count = ((element.getAttribute("style") || "").match(/--logo-count:\s*(\d+)/) || [])[1];
    const items = uniqueImages(element, "img").map((img) => ({ img: logo(document, img) }));
    const grid = logoGrid(document, count === "4" ? "columns-4" : "", items);
    if (grid) out2.push(grid);
    return out2.length ? out2 : flatten(document, element);
  }
  function clientPanel([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf(document, pick(element, '[class*="__title"]', "h2, h3"));
    if (title2) out2.push(title2);
    const items = uniqueImages(element, "img").map((img) => ({ img: logo(document, img) }));
    const grid = logoGrid(document, "", items);
    if (grid) out2.push(grid);
    return out2.length ? out2 : flatten(document, element);
  }
  function awardsPanel([element], ctx) {
    const { document } = ctx;
    const items = [...element.querySelectorAll('[class*="__item-wrapper"]')].map((item) => {
      const caption = text(item.querySelector('[class*="__heading"]'));
      return {
        // award logo file names are no useful alt text
        img: logo(document, item.querySelector("img"), false),
        textNodes: caption ? [el(document, "p", caption)] : []
      };
    });
    const grid = logoGrid(document, "awards", items);
    return grid ? [grid] : flatten(document, element);
  }
  function globalPartners([element], ctx) {
    const { document } = ctx;
    const items = [...element.querySelectorAll('[class*="__card-wrap"]')].map((card) => {
      const link = card.querySelector("a[href]");
      const img = image(document, card.querySelector("img"));
      const name = text(card.querySelector('[class*="__card-name"]'));
      const caption = text(card.querySelector('[class*="__image-caption"]'));
      if (img && !img.alt) img.alt = name;
      const textNodes = [];
      if (name) textNodes.push(link ? linkParagraph(document, link.getAttribute("href"), name) : el(document, "p", name));
      if (caption) textNodes.push(el(document, "p", caption));
      return { img, textNodes };
    });
    const grid = logoGrid(document, "partners", items);
    return grid ? [grid] : flatten(document, element);
  }
  function partnersGrid([element], ctx) {
    const { document } = ctx;
    const items = [...element.querySelectorAll('a[class*="__card"]')].map((card) => {
      const img = logo(document, card.querySelector("img"));
      const href = card.getAttribute("href");
      const label = img && img.alt || text(card);
      return { img, textNodes: href && label ? [linkParagraph(document, href, label)] : [] };
    });
    const grid = logoGrid(document, "tiles", items);
    return grid ? [grid] : flatten(document, element);
  }
  var HANDLERS2 = {
    "highlighted-logos": { handler: highlightedLogos },
    // dark on the source (theme set in the component CSS, not as a theme class)
    "client-panel": { handler: clientPanel, style: "dept-client-panel, dept-bg-richblack, dept-dark" },
    "awards-panel": { handler: awardsPanel, style: "dept-awards-panel, dept-bg-richblack, dept-dark" },
    "global-partners": { handler: globalPartners },
    "partners-grid": { handler: partnersGrid }
  };

  // tools/importer/parsers/dept/handlers/lists.js
  function trimBreaks2(node) {
    const edge = (first) => {
      let n = first ? node.firstChild : node.lastChild;
      while (n && (n.nodeType === 3 && !n.textContent.trim() || n.nodeType === 1 && n.tagName === "BR")) {
        const next = first ? n.nextSibling : n.previousSibling;
        n.remove();
        n = next;
      }
    };
    edge(true);
    edge(false);
    if (node.firstChild && node.firstChild.nodeType === 3) node.firstChild.textContent = node.firstChild.textContent.replace(/^\s+/, "");
    if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.textContent = node.lastChild.textContent.replace(/\s+$/, "");
    return node;
  }
  function inline2(document, source, tag) {
    const out2 = el(document, tag);
    if (!source) return out2;
    const isHeading = /^H\d$/i.test(tag);
    const walk = (from, to) => {
      from.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          to.append(n.textContent.replace(/\u00a0/g, " ").replace(/\s+/g, " "));
          return;
        }
        if (n.nodeType !== 1) return;
        if (n.matches('svg, button, script, style, i.icon, [aria-hidden="true"]')) return;
        if (n.tagName === "BR") {
          to.append(el(document, "br"));
          return;
        }
        if (n.matches(".is-fancy-serif, em, i")) {
          if (text(n)) to.append(el(document, "em", text(n)));
          return;
        }
        if (n.matches("strong, b") && !isHeading) {
          const s = el(document, "strong");
          walk(n, s);
          if (text(s)) to.append(s);
          return;
        }
        if (n.tagName === "A" && n.getAttribute("href")) {
          const a = el(document, "a");
          a.href = n.getAttribute("href");
          walk(n, a);
          if (text(a)) to.append(a);
          return;
        }
        walk(n, to);
      });
    };
    walk(source, out2);
    out2.innerHTML = out2.innerHTML.replace(/<\/em>(\s*)<em>/g, "$1").replace(/\s*<br>\s*/g, "<br>");
    return trimBreaks2(out2);
  }
  function inlineNodes(document, source, tag) {
    const n = inline2(document, source, tag);
    return text(n) ? [n] : [];
  }
  function pointsList(document, variant, points) {
    const rows = points.map(({ title: title2, body }) => [...inlineNodes(document, title2, "h3"), ...body]).filter((nodes) => nodes.length).map((nodes) => [field(document, "text", nodes)]);
    if (!rows.length) return null;
    return block(document, variant ? `points-list (${variant})` : "points-list", rows);
  }
  function paragraphs(document, elements) {
    return elements.flatMap((e) => inlineNodes(document, e, "p"));
  }
  function eventPeople([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    out2.push(...inlineNodes(document, element.querySelector('[class*="__title"]'), "h2"));
    const rows = [...element.querySelectorAll('[class*="__card-wrap"]')].map((card) => {
      const img = image(document, card.querySelector("img"));
      const name = text(card.querySelector('[class*="__card-name"]'));
      const position = text(card.querySelector('[class*="__card-position"]'));
      const social = card.querySelector('a[class*="__card-social"][href]');
      if (img && !img.alt) img.alt = name;
      const body = [];
      if (name) body.push(el(document, "h3", name));
      if (position) body.push(el(document, "p", position));
      if (social) {
        const p = el(document, "p");
        const a = el(document, "a", text(social) || "LinkedIn");
        a.href = social.getAttribute("href");
        p.append(a);
        body.push(p);
      }
      const row = [img ? field(document, "image", img) : ""];
      if (body.length) row.push(field(document, "text", body));
      return row;
    }).filter((row) => row[0] || row.length > 1);
    if (rows.length) out2.push(block(document, "people-cards", rows));
    return out2.length ? out2 : flatten(document, element);
  }
  function pointsTable([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    out2.push(...inlineNodes(document, element.querySelector('[class*="__title"]:not([class*="__point"])'), "h2"));
    element.querySelectorAll('[class*="__subtitle"]:not([class*="__point"])').forEach((p) => {
      out2.push(...inlineNodes(document, p, "p"));
    });
    const points = [...element.querySelectorAll('[class*="__point"]:is(li, div)')].filter((li) => /__point(\s|$)/.test(li.className)).map((li) => ({
      title: li.querySelector('[class*="__point-title"]'),
      body: paragraphs(document, [...li.querySelectorAll('[class*="__point-subtitle"]')])
    }));
    const list = pointsList(document, "", points);
    if (list) out2.push(list);
    return out2.length ? out2 : flatten(document, element);
  }
  function panelWithList([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    out2.push(...inlineNodes(document, element.querySelector('[class*="__column--left"] :is(h1, h2, h3, h4, [class*="__heading"])'), "h2"));
    const points = [...element.querySelectorAll('[class*="__item"]:not([class*="__item-"])')].map((item) => {
      const content = item.querySelector(".list-with-content__content");
      return {
        title: item.querySelector(".list-with-content__heading, .list-with-content__title"),
        body: content && text(content) ? flatten(document, content) : []
      };
    });
    const list = pointsList(document, "numbered", points);
    if (list) out2.push(list);
    return out2.length ? out2 : flatten(document, element);
  }
  function twoColumnItemsList([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    out2.push(...inlineNodes(document, element.querySelector('[class*="__title"]:not([class*="__item"])'), "h2"));
    const points = [...element.querySelectorAll('[class*="__item"]:not([class*="__item-"]):not([class*="__items"])')].map((item) => ({
      title: item.querySelector('[class*="__item-title"]'),
      body: paragraphs(document, [...item.querySelectorAll('[class*="__item-subtitle"]')])
    }));
    const list = pointsList(document, "columns", points);
    if (list) out2.push(list);
    return out2.length ? out2 : flatten(document, element);
  }
  function twoColumnTwoRowList([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    out2.push(...inlineNodes(document, element.querySelector('[class*="__title"]:not([class*="__item"])'), "h2"));
    const points = [];
    for (let i = 1; element.querySelector(`[class*="__item-${i}-"]`); i += 1) {
      points.push({
        title: element.querySelector(`[class*="__item-${i}-title"]`),
        body: paragraphs(document, [...element.querySelectorAll(`[class*="__item-${i}-subtitle"]`)])
      });
    }
    const list = pointsList(document, "stats", points);
    if (list) out2.push(list);
    return out2.length ? out2 : flatten(document, element);
  }
  function caseCredits([element], ctx) {
    const { document } = ctx;
    const bare = (node) => text(inline2(document, node, "p")).replace(/^\(\s*(.*?)\s*\)$/, "$1");
    const out2 = [];
    const awards = [...element.querySelectorAll('[class*="__award"]:not([class*="__award-"]):not([class*="__awards"])')];
    if (awards.length) {
      const awardsLabel = bare(element.querySelector('[class*="__awards-label"]'));
      if (awardsLabel) out2.push(el(document, "h2", awardsLabel));
      const row = (values) => ["award", "year", "category"].map((name, i) => values[i] ? field(document, name, values[i]) : "");
      const headers = [...element.querySelectorAll('[class*="__awards-header"] > *')].map(bare);
      const rows = [row(headers.length ? headers : ["Award", "Year", "Category"])];
      awards.forEach((award) => {
        rows.push(row(["__award-name", "__award-year", "__award-description"].map((c) => text(award.querySelector(`[class*="${c}"]`)))));
      });
      out2.push(block(document, "case-credits", rows));
    }
    const credits = [...element.querySelectorAll('[class*="__credit-column"]')].flatMap((col) => {
      const role = bare(col.querySelector('[class*="__credit-label"]'));
      const people = inlineNodes(document, col.querySelector('[class*="__credit-people"]'), "p");
      return [...role ? [el(document, "h3", role)] : [], ...people];
    });
    if (credits.length) {
      const creditsLabel = bare(element.querySelector('[class*="__credits-label"]'));
      if (creditsLabel) out2.push(el(document, "h2", creditsLabel));
      out2.push(...credits);
    }
    return out2.length ? out2 : flatten(document, element);
  }
  var darkList = (name) => (element) => {
    const themed2 = [...element.children].some((child) => /--(richBlack|onyxGrey)\b/.test(child.className));
    return themed2 ? `dept-${name}` : `dept-${name}, dept-bg-richblack, dept-dark`;
  };
  var HANDLERS3 = {
    "event-people": { handler: eventPeople },
    "points-table": { handler: pointsTable },
    "panel-with-list": { handler: panelWithList },
    "two-column-items-list": { handler: twoColumnItemsList, style: darkList("two-column-items-list") },
    "two-column-two-row-list": { handler: twoColumnTwoRowList, style: darkList("two-column-two-row-list") },
    "case-credits": { handler: caseCredits }
  };

  // tools/importer/parsers/dept/handlers/cards.js
  var ACCENT = ".is-fancy-serif, em, i";
  var BR_RUN2 = /(?:\s|&nbsp;)*(?:<br\s*\/?>(?:\s|&nbsp;)*){2,}/i;
  var DARK = ["onyxgrey", "richblack", "black", "darkgrey", "charcoal"];
  function titleOf2(document, node, tag = "h2") {
    if (!node || !text(node)) return null;
    const h = el(document, tag);
    const walk = (from) => from.childNodes.forEach((n) => {
      if (n.nodeType === 3) h.append(n.textContent.replace(/\s+/g, " "));
      else if (n.nodeType !== 1) return;
      else if (n.tagName === "BR") h.append(" ");
      else if (n.matches(ACCENT)) {
        if (text(n)) h.append(el(document, "em", text(n)));
      } else walk(n);
    });
    walk(node);
    h.innerHTML = h.innerHTML.replace(/<\/em>(\s*)<em>/g, "$1").replace(/\s+/g, " ").trim();
    return h;
  }
  function inline3(document, source, tag = "p") {
    const out2 = el(document, tag);
    const walk = (from, to) => from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(n.textContent.replace(/\s+/g, " "));
        return;
      }
      if (n.nodeType !== 1 || n.matches("svg, button, script, style")) return;
      if (n.tagName === "BR") {
        to.append(el(document, "br"));
        return;
      }
      if (n.matches(ACCENT)) {
        if (text(n)) to.append(el(document, "em", text(n)));
        return;
      }
      if (n.matches("strong, b") && !/^H\d$/.test(tag.toUpperCase())) {
        const s = el(document, "strong");
        walk(n, s);
        if (text(s)) to.append(s);
        return;
      }
      if (n.tagName === "A" && n.getAttribute("href")) {
        const a = el(document, "a");
        a.href = n.getAttribute("href");
        walk(n, a);
        if (text(a)) to.append(a);
        return;
      }
      walk(n, to);
    });
    walk(source, out2);
    out2.innerHTML = out2.innerHTML.replace(/<\/em>(\s*)<em>/g, "$1").replace(/^(\s|<br>)+|(\s|<br>)+$/g, "").trim();
    return text(out2) ? out2 : null;
  }
  function paragraphs2(document, node) {
    if (!node) return [];
    return node.innerHTML.split(BR_RUN2).map((part) => {
      const holder = document.createElement("div");
      holder.innerHTML = part;
      return inline3(document, holder);
    }).filter(Boolean);
  }
  function cta(document, link, fallback = "") {
    if (!link || !link.getAttribute("href")) return null;
    const label = text(link) || fallback;
    return label ? linkParagraph(document, link.getAttribute("href"), label) : null;
  }
  function cardsRelated(document, variant, cards) {
    const rows = cards.filter((c) => c.img || c.nodes && c.nodes.length).map(({ img, nodes }) => [field(document, "image", img), field(document, "text", nodes)]);
    if (!rows.length) return null;
    return block(document, variant ? `cards-related (${variant})` : "cards-related", rows);
  }
  function carousel(document, variant, slides) {
    const rows = slides.filter((s) => s.img || s.nodes && s.nodes.length).map(({ img, nodes }) => [field(document, "media_image", img), field(document, "content_text", nodes || [])]);
    if (!rows.length) return null;
    return block(document, variant ? `carousel-culture (${variant})` : "carousel-culture", rows);
  }
  function cardTitle(document, title2, href) {
    if (!title2) return null;
    const h3 = el(document, "h3");
    if (href) {
      const a = el(document, "a", title2);
      a.href = href;
      h3.append(a);
    } else {
      h3.textContent = title2;
    }
    return h3;
  }
  function realSlides(element, selector) {
    return [...element.querySelectorAll(selector)].filter((s) => !s.matches(".swiper-slide-duplicate"));
  }
  var light = (name) => `${name}, dept-light`;
  var themed = (name) => (node) => {
    const theme = (node.getAttribute("data-theme") || "").toLowerCase();
    if (!theme || theme === "white") return light(name);
    return `${name}, dept-bg-${theme}${DARK.includes(theme) ? ", dept-dark" : ""}`;
  };
  function titleBlockCarousel([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf2(document, pick(element, '[class*="__title"]'));
    if (title2) out2.push(title2);
    out2.push(...paragraphs2(document, pick(element, '[class*="__text"]')));
    const slides = [...element.querySelectorAll("img")].map((img) => ({ img: image(document, img) }));
    const carouselBlock = carousel(document, "images", slides);
    if (carouselBlock) out2.push(carouselBlock);
    return out2.length ? out2 : flatten(document, element);
  }
  function imageCards([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const intro2 = pick(element, '[class*="__intro"]');
    if (intro2 && inline3(document, intro2)) out2.push(inline3(document, intro2));
    const title2 = titleOf2(document, pick(element, '[class*="__title"]'));
    if (title2) out2.push(title2);
    const body = pick(element, '[class*="__text"]');
    if (body) out2.push(...paragraphs2(document, body));
    const link = cta(document, pick(element, 'a[class*="__cta"]'));
    if (link) out2.push(link);
    element.querySelectorAll("img").forEach((img) => {
      const copy = image(document, img);
      if (!copy) return;
      const p = el(document, "p");
      p.append(copy);
      out2.push(p);
    });
    return out2.length ? out2 : flatten(document, element);
  }
  function slide(document, node, titleTag = "h2") {
    const nodes = [];
    const tag = text(pick(node, '[class*="__tag"]', '[class*="__intro"]'));
    if (tag) nodes.push(el(document, "p", tag));
    const title2 = titleOf2(document, pick(node, '[class*="__title"]'), titleTag);
    if (title2) nodes.push(title2);
    const link = node.querySelector('a[class*="__cta"], a[href]');
    const label = link && text(link.querySelector('button, [class*="__btn"], [class*="cta-button"]')) || (link && text(link) !== text(title2) ? text(link) : "");
    if (link && link.getAttribute("href")) nodes.push(linkParagraph(document, link.getAttribute("href"), label || "Read more"));
    return { img: image(document, node.querySelector("img")), nodes };
  }
  function slidesCarousel([element], ctx) {
    const { document } = ctx;
    const slides = realSlides(element, '[class*="__item"]:not([class*="__item-inner"])').map((s) => slide(document, s));
    const carouselBlock = carousel(document, "slides", slides);
    return carouselBlock ? [carouselBlock] : flatten(document, element);
  }
  var hero = (titleTag) => ([element], ctx) => {
    const { document } = ctx;
    const carouselBlock = carousel(document, "slides", [slide(document, element, titleTag)]);
    return carouselBlock ? [carouselBlock] : flatten(document, element);
  };
  function intro(document, element, { eyebrow, title: title2, subtitles = [], button } = {}) {
    const out2 = [];
    if (eyebrow && text(pick(element, eyebrow))) out2.push(el(document, "p", text(pick(element, eyebrow))));
    const h = title2 && titleOf2(document, pick(element, title2));
    if (h) out2.push(h);
    subtitles.forEach((sel) => element.querySelectorAll(sel).forEach((p) => {
      const copy = inline3(document, p);
      if (copy) out2.push(copy);
    }));
    const link = button && cta(document, pick(element, button));
    if (link) out2.push(link);
    return out2;
  }
  function twoCardsAndContent([element], ctx) {
    const { document } = ctx;
    const out2 = intro(document, element, {
      title: '[class*="__main-title"]',
      subtitles: ['[class*="__main-subtitle"]'],
      button: 'a[class*="__main-cta"]'
    });
    const seen = /* @__PURE__ */ new Set();
    const cards = [...element.querySelectorAll('a[class*="__card"]')].filter((a) => {
      const key = a.getAttribute("href") || text(a);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((card) => {
      const nodes = [cardTitle(document, text(card.querySelector('[class*="__card-title"]')), card.getAttribute("href"))];
      const sub = text(card.querySelector('[class*="__card-subtitle"]'));
      if (sub) nodes.push(el(document, "p", sub));
      return { img: image(document, card.querySelector("img")), nodes: nodes.filter(Boolean) };
    });
    const cardsBlock = cardsRelated(document, "slider", cards);
    if (cardsBlock) out2.push(cardsBlock);
    return out2.length ? out2 : flatten(document, element);
  }
  function contentCards([element], ctx) {
    const { document } = ctx;
    const out2 = intro(document, element, {
      eyebrow: '[class*="__overline"]',
      title: '[class*="cards__title"]',
      subtitles: ['[class*="cards__subtitle"]', '[class*="cards__caption"]'],
      button: 'a[class*="cards__cta"]'
    });
    const jobs = realSlides(element, 'a[class*="cards__job"]').map((job) => {
      const nodes = [];
      const dept = text(job.querySelector('[class*="__job-department"]'));
      if (dept) nodes.push(el(document, "p", dept));
      const t = cardTitle(document, text(job.querySelector('[class*="__job-title"]')), job.getAttribute("href"));
      if (t) nodes.push(t);
      const meta = [text(job.querySelector('[class*="__job-country"]')), text(job.querySelector('[class*="__job-contract"]'))].filter(Boolean);
      if (meta.length) nodes.push(el(document, "p", meta.join(" \xB7 ")));
      return { img: null, nodes };
    });
    const people = realSlides(element, ".content-card, .speaker-content-card").map((card) => {
      const nodes = [];
      const tag = text(card.querySelector('[class*="__tag"]'));
      if (tag) nodes.push(el(document, "p", tag));
      const name = text(card.querySelector('[class*="__title"]'));
      if (name) nodes.push(el(document, "h3", name));
      ["__position", "__quote", "__text"].forEach((part) => {
        const p = card.querySelector(`[class*="${part}"]`);
        const copy = p && inline3(document, p);
        if (copy) nodes.push(copy);
      });
      const link = cta(document, card.querySelector("a[href]"));
      if (link) nodes.push(link);
      return { img: image(document, card.querySelector("img")), nodes };
    });
    const cardsBlock = cardsRelated(document, "slider", [...people, ...jobs]);
    if (cardsBlock) out2.push(cardsBlock);
    return out2.length ? out2 : flatten(document, element);
  }
  function caseTeaser([element], ctx) {
    const { document } = ctx;
    const href = element.getAttribute("href");
    const nodes = [cardTitle(document, text(element.querySelector('[class*="__client"]')), href)];
    const title2 = text(element.querySelector('[class*="__title"]'));
    if (title2) nodes.push(el(document, "p", title2));
    const label = text(element.querySelector('[class*="__cta"]'));
    if (href && label) nodes.push(linkParagraph(document, href, label));
    const cardsBlock = cardsRelated(document, "teaser", [{ img: image(document, element.querySelector("img")), nodes: nodes.filter(Boolean) }]);
    return cardsBlock ? [cardsBlock] : flatten(document, element);
  }
  function fourCardInformation([element], ctx) {
    const { document } = ctx;
    const out2 = intro(document, element, {
      title: '[class*="block__title"]',
      subtitles: ['[class*="block__subtitle"]'],
      button: 'a[class*="__cta"]'
    });
    const cards = realSlides(element, ".four-card-information-block-card").map((card) => {
      const nodes = [];
      const title2 = text(card.querySelector('[class*="__title"]'));
      if (title2) nodes.push(el(document, "h3", title2));
      const body = card.querySelector('[class*="__clients"], [class*="__text"]');
      const copy = body && inline3(document, body);
      if (copy) nodes.push(copy);
      return { img: image(document, card.querySelector("img")), nodes };
    });
    const cardsBlock = cardsRelated(document, "info", cards);
    if (cardsBlock) out2.push(cardsBlock);
    return out2.length ? out2 : flatten(document, element);
  }
  function panelWithCards([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf2(document, pick(element, '[class*="__column--left"] h2, [class*="__column--left"] h3'));
    if (title2) out2.push(title2);
    const cards = [...element.querySelectorAll('[class*="panel-with-cards__item-inner"]')].map((item) => {
      const nodes = [];
      const name = text(item.querySelector(".card-teaser__title, h2, h3"));
      if (name) nodes.push(el(document, "h3", name));
      item.querySelectorAll('[class*="overlay__content"] p, [class*="overlay__content"] li').forEach((p) => {
        const copy = inline3(document, p);
        if (copy) nodes.push(copy);
      });
      return { img: image(document, item.querySelector("img")), nodes };
    });
    const cardsBlock = cardsRelated(document, "tiles", cards);
    if (cardsBlock) out2.push(cardsBlock);
    return out2.length ? out2 : flatten(document, element);
  }
  function caseStudyShowcase([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf2(document, pick(element, '[class*="__heading"]'));
    if (title2) out2.push(title2);
    const cards = [...element.querySelectorAll(".universal-item-card")].map((card) => {
      const href = card.getAttribute("href");
      const nodes = [cardTitle(document, text(card.querySelector('[class*="__title"]')), href)];
      const meta = text(card.querySelector('[class*="__meta"]'));
      if (meta) nodes.push(el(document, "p", meta));
      return { img: image(document, card.querySelector("img")), nodes: nodes.filter(Boolean) };
    }).filter((c) => c.img || c.nodes.length);
    const cardsBlock = cardsRelated(document, "", cards);
    if (cardsBlock) out2.push(cardsBlock);
    return out2.length ? out2 : flatten(document, element);
  }
  function workListingV2([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf2(document, pick(element, '[class*="__title"]'), "h1");
    if (title2) out2.push(title2);
    const items = element.querySelector('[class*="__items"]');
    if (items && items.querySelector("a.listing-card")) {
      const clone = items.cloneNode(true);
      clone.querySelectorAll(".listing-card__title:not(p)").forEach((h) => {
        const p = el(document, "p", text(h));
        p.className = "listing-card__title";
        h.replaceWith(p);
      });
      out2.push(...runParser(parse4, [clone], ctx));
    }
    return out2.length ? out2 : flatten(document, element);
  }
  function industryListing([element], ctx) {
    const { document } = ctx;
    const items = [...element.querySelectorAll('a[class*="__item"]')];
    if (!items.length) return flatten(document, element);
    const ul = el(document, "ul");
    items.forEach((a) => {
      const li = el(document, "li");
      const link = el(document, "a", text(a.querySelector('[class*="__item-title"]')) || text(a));
      link.href = a.getAttribute("href");
      li.append(link);
      ul.append(li);
    });
    return [ul];
  }
  function jobList([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf2(document, pick(element, '[class*="block-job-list__title"]'));
    if (title2) out2.push(title2);
    const sub = text(pick(element, '[class*="block-job-list__subtitle"]'));
    if (sub) out2.push(el(document, "p", sub));
    const cards = [...element.querySelectorAll("a.job-card")].map((card) => {
      const nodes = [];
      const dept = [...card.querySelectorAll('p[class*="__department"]')].map(text).filter(Boolean).join(", ");
      if (dept) nodes.push(el(document, "p", dept));
      const t = cardTitle(document, text(card.querySelector('[class*="__title"]')), card.getAttribute("href"));
      if (t) nodes.push(t);
      const meta = [text(card.querySelector('[class*="__countries"]')), text(card.querySelector('[class*="__contract-types"]'))].filter(Boolean);
      if (meta.length) nodes.push(el(document, "p", meta.join(" \xB7 ")));
      return { img: image(document, card.querySelector("img")), nodes };
    });
    const cardsBlock = cardsRelated(document, "list", cards);
    if (cardsBlock) out2.push(cardsBlock);
    return out2.length ? out2 : flatten(document, element);
  }
  function sixBlockContent([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const top = element.querySelector('[class*="__top-content"]') || element;
    const img = image(document, top.querySelector("img"));
    const right = intro(document, top, { title: '[class*="content__title"]', subtitles: ['[class*="content__subtitle"]'] });
    if (img || right.length) {
      const p = el(document, "p");
      if (img) p.append(img);
      out2.push(block(document, "panel-split", [
        [field(document, "left", img ? p : null)],
        [field(document, "right", right)]
      ]));
    }
    const cards = [...element.querySelectorAll(".block-six-block-content-card")].map((card) => {
      const nodes = [];
      const num = text(card.querySelector('[class*="card__title"]'));
      if (num) nodes.push(el(document, "p", num));
      const name = text(card.querySelector('[class*="card__subtitle"]'));
      if (name) nodes.push(el(document, "h3", name));
      const desc = card.querySelector('[class*="card__description"]');
      const copy = desc && inline3(document, desc);
      if (copy) nodes.push(copy);
      return { img: null, nodes };
    });
    const cardsBlock = cardsRelated(document, "numbered", cards);
    if (cardsBlock) out2.push(cardsBlock);
    return out2.length ? out2 : flatten(document, element);
  }
  function threeRowBlock([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf2(document, pick(element, '[class*="block__title"]'));
    if (title2) out2.push(title2);
    const img = image(document, element.querySelector("img"));
    const right = [];
    element.querySelectorAll('[class*="__item"][data-position]').forEach((item) => {
      const h = text(item.querySelector('[class*="__item-title"]'));
      if (h) right.push(el(document, "h3", h));
      const p = item.querySelector('[class*="__item-subtitle"]');
      const copy = p && inline3(document, p);
      if (copy) right.push(copy);
    });
    if (img || right.length) {
      const p = el(document, "p");
      if (img) p.append(img);
      out2.push(block(document, "panel-split", [
        [field(document, "left", img ? p : null)],
        [field(document, "right", right)]
      ]));
    }
    return out2.length ? out2 : flatten(document, element);
  }
  var HANDLERS4 = {
    "title-block-carousel": { handler: titleBlockCarousel },
    "image-cards": { handler: imageCards },
    carousel: { handler: slidesCarousel, style: "dept-carousel-slides" },
    "numbered-carousel": { handler: slidesCarousel, style: "dept-carousel-slides" },
    "card-hero": { handler: hero("h1"), style: "dept-carousel-slides" },
    "hero-carousel-montage": { handler: hero("h2"), style: "dept-carousel-slides" },
    "two-cards-and-content": { handler: twoCardsAndContent, style: themed("dept-two-cards-and-content") },
    "image-with-content-cards": { handler: contentCards, style: light("dept-content-cards") },
    "content-cards": { handler: contentCards, style: light("dept-content-cards") },
    "case-teaser-v2": { handler: caseTeaser, style: "dept-case-teaser" },
    "four-card-information-block": { handler: fourCardInformation, style: themed("dept-four-card-information-block") },
    "panel-with-cards": { handler: panelWithCards },
    // dark on the source (theme set in the component CSS, not as a theme class)
    "case-study-showcase": { handler: caseStudyShowcase, style: "dept-case-study-showcase, dept-bg-richblack, dept-dark" },
    "work-listing-v2": { handler: workListingV2 },
    "industry-listing": { handler: industryListing },
    "job-list": { handler: jobList, style: light("dept-job-list") },
    "six-block-content": { handler: sixBlockContent },
    "three-row-block": { handler: threeRowBlock, style: light("dept-three-row-block") }
  };

  // tools/importer/parsers/dept/handlers/intros.js
  var ACCENT2 = ".is-fancy-serif, em, i";
  var BR_RUN3 = /(?:\s|&nbsp;)*(?:<br\s*\/?>(?:\s|&nbsp;)*){2,}/i;
  function trimBreaks3(node) {
    const edge = (first) => {
      let n = first ? node.firstChild : node.lastChild;
      while (n && (n.nodeType === 3 && !n.textContent.trim() || n.nodeType === 1 && n.tagName === "BR")) {
        const next = first ? n.nextSibling : n.previousSibling;
        n.remove();
        n = next;
      }
    };
    edge(true);
    edge(false);
    if (node.firstChild && node.firstChild.nodeType === 3) node.firstChild.textContent = node.firstChild.textContent.replace(/^\s+/, "");
    if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.textContent = node.lastChild.textContent.replace(/\s+$/, "");
    return node;
  }
  function inline4(document, source, tag) {
    const out2 = el(document, tag);
    const isHeading = /^H\d$/i.test(tag);
    const walk = (from, to) => {
      from.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          to.append(n.textContent.replace(/\s+/g, " "));
          return;
        }
        if (n.nodeType !== 1) return;
        if (n.matches("svg, button, script, style, i.icon")) return;
        if (n.tagName === "BR") {
          to.append(el(document, "br"));
          return;
        }
        if (n.matches(ACCENT2)) {
          if (text(n)) to.append(el(document, "em", text(n)));
          return;
        }
        if (n.matches("strong, b") && !isHeading) {
          const s = el(document, "strong");
          walk(n, s);
          if (text(s)) to.append(s);
          else to.append(...s.childNodes);
          return;
        }
        if (n.tagName === "A" && n.getAttribute("href")) {
          const a = el(document, "a");
          a.href = n.getAttribute("href");
          walk(n, a);
          if (text(a)) to.append(a);
          return;
        }
        walk(n, to);
      });
    };
    walk(source, out2);
    out2.innerHTML = out2.innerHTML.replace(/<\/em>(\s*)<em>/g, "$1");
    return trimBreaks3(out2);
  }
  function splitBreaks(document, nodes) {
    const out2 = [];
    nodes.forEach((n) => {
      if (!/^(P|H[1-6])$/.test(n.tagName) || n.querySelector("img") || !BR_RUN3.test(n.innerHTML)) {
        if (n.nodeType === 1 && /^(P|H[1-6])$/.test(n.tagName)) trimBreaks3(n);
        if (text(n) || n.querySelector("img")) out2.push(n);
        return;
      }
      n.innerHTML.split(BR_RUN3).forEach((part) => {
        const p = el(document, n.tagName.toLowerCase());
        p.innerHTML = part;
        trimBreaks3(p);
        if (text(p)) out2.push(p);
      });
    });
    return out2;
  }
  function keepTag(document, source, fallbackTag = "p") {
    if (!source || !text(source)) return [];
    const tag = /^H[1-6]$/.test(source.tagName) ? source.tagName.toLowerCase() : fallbackTag;
    return splitBreaks(document, [inline4(document, source, tag)]);
  }
  function richText2(document, source) {
    return source ? splitBreaks(document, flatten(document, source)) : [];
  }
  function formUrl2(node) {
    const iframe = node && node.querySelector("iframe");
    if (!iframe) return "";
    return (iframe.getAttribute("src") || iframe.getAttribute("data-src") || iframe.getAttribute("data-initial-src") || "").trim();
  }
  function labelled2(document, label, value, href) {
    const p = el(document, "p");
    if (label) {
      p.append(el(document, "strong", label));
      p.append(" ");
    }
    if (href) {
      const a = el(document, "a", value);
      a.href = href;
      p.append(a);
    } else {
      p.append(value);
    }
    return p;
  }
  function introBlock(element, ctx) {
    const { document } = ctx;
    const img = image(document, pick(element, '[class*="__featured-image"]', "img"));
    const title2 = pick(element, '[class*="__title"]:not([class*="banner"])', "h1");
    const textNodes = [];
    const badge = text(pick(element, '[class*="__badge"]'));
    if (badge) textNodes.push(el(document, "p", badge));
    if (title2) textNodes.push(el(document, "h1", text(title2)));
    if (img && !img.alt && title2) img.alt = text(title2);
    const details = [];
    element.querySelectorAll('[class*="__event-meta"] > [class*="__event-meta-item"]').forEach((item) => {
      const labelEl = item.querySelector('[class*="meta-label"]');
      const label = text(labelEl);
      const value = text(item).slice(label.length).trim();
      if (value) details.push(el(document, "p", label ? `${label}: ${value}` : value));
    });
    const cells = [[field(document, "image", img)], [field(document, "text", textNodes)]];
    if (details.length) {
      cells.push([""]);
      cells.push([field(document, "details", details)]);
    }
    return block(document, "article-header (intro)", cells);
  }
  function whitepaperIntro([element], ctx) {
    const { document } = ctx;
    const out2 = [introBlock(element, ctx)];
    out2.push(...richText2(document, element.querySelector('[class*="__content"]')));
    const form = formUrl2(element.querySelector('[class*="__form"]'));
    if (form) out2.push(linkParagraph(document, form, text(pick(element, '[class*="__badge"]')) || "Download"));
    return out2;
  }
  function eventIntro([element], ctx) {
    return [introBlock(element, ctx)];
  }
  function eventInfo([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    element.querySelectorAll('[class*="__intro"]').forEach((intro2) => out2.push(...richText2(document, intro2)));
    element.querySelectorAll('[class*="__sub-event-item"]').forEach((item) => {
      const label = text(item.querySelector("b, strong"));
      const value = text(item).slice(label.length).trim();
      if (!value) return;
      const href = item.tagName === "A" ? item.getAttribute("href") : "";
      out2.push(labelled2(document, label, value, href));
    });
    const form = formUrl2(element.querySelector('[class*="__form"]'));
    if (form) {
      const cta3 = text(document.querySelector('.block-event-intro a[href="#register-form"]'));
      out2.push(linkParagraph(document, form, cta3 || "Register"));
    }
    return out2.length ? out2 : flatten(document, element);
  }
  function eventContent([element], ctx) {
    const { document } = ctx;
    const out2 = keepTag(document, element.querySelector('[class*="__title"]'));
    out2.push(...richText2(document, element.querySelector('[class*="__content"]') || element));
    return out2;
  }
  function registerHref(document, href) {
    const m = (href || "").match(/^:event-registration-form-(.+):$/);
    if (!m) return href;
    return formUrl2(document.querySelector(`.block-event-registration-form[data-form-id="${m[1]}"]`)) || "";
  }
  function eventRegister([element], ctx) {
    const { document } = ctx;
    const out2 = keepTag(document, element.querySelector('[class*="__label"]'));
    const cta3 = pick(element, 'a[class*="__desktop-button"]', "a[href]");
    const href = cta3 && registerHref(document, cta3.getAttribute("href"));
    let label = "";
    if (cta3) {
      const walker = document.createTreeWalker(cta3, 4);
      for (let n = walker.nextNode(); n && !label; n = walker.nextNode()) label = n.textContent.replace(/\s+/g, " ").trim();
    }
    if (href && label) out2.push(linkParagraph(document, href, label));
    return out2;
  }
  function eventRegistrationForm([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const img = image(document, element.querySelector("img"));
    const title2 = element.querySelector('[class*="__title"]');
    if (img) {
      if (!img.alt && title2) img.alt = text(title2);
      const p = el(document, "p");
      p.append(img);
      out2.push(p);
    }
    out2.push(...keepTag(document, title2));
    element.querySelectorAll('[class*="__meta"] > *').forEach((item) => {
      const line = text(item);
      const m = line.match(/^([^:\d]{1,30}):\s*(.+)$/);
      if (m) out2.push(labelled2(document, m[1].trim(), m[2].trim()));
      else if (line) out2.push(el(document, "p", line));
    });
    const form = formUrl2(element);
    if (form) out2.push(linkParagraph(document, form, "Register"));
    return out2;
  }
  function titleAndText(element, ctx, titleSel, textSel) {
    const { document } = ctx;
    const out2 = keepTag(document, element.querySelector(titleSel));
    element.querySelectorAll(textSel).forEach((t) => out2.push(...keepTag(document, t)));
    return out2.length ? out2 : flatten(document, element);
  }
  var industryIntro = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__subtitle"]');
  var titleBlock = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__text"]');
  var awardsIntro = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__subtitle"]');
  var caseIntroTitle = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__text"]');
  var introText = ([e], ctx) => titleAndText(e, ctx, '[class*="__heading"], h1, h2, h3', '[class*="__paragraph"]');
  var statement = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__text"]');
  function highlightedStatement([element], ctx) {
    const out2 = titleAndText(element, ctx, '[class*="__title"]', '[class*="__text"]');
    const cta3 = element.querySelector('a[class*="__cta"]');
    if (cta3 && cta3.getAttribute("href") && text(cta3)) out2.push(linkParagraph(ctx.document, cta3.getAttribute("href"), text(cta3)));
    return out2;
  }
  function postHeader([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const back = element.querySelector('a[class*="back"]');
    if (back && back.getAttribute("href")) out2.push(linkParagraph(document, back.getAttribute("href"), text(back) || "Back"));
    const h1 = pick(element, "h1", '[class*="__heading"]');
    if (h1) out2.push(el(document, "h1", text(h1)));
    return out2.length ? out2 : flatten(document, element);
  }
  function textBlockHero([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = element.querySelector('[class*="__title"]');
    if (title2 && text(title2)) {
      const main = document.querySelector("main") || document.body;
      const hasH1 = [...main.querySelectorAll("h1")].some((h) => !element.contains(h));
      inline4(document, title2, "p").innerHTML.split(/(?:\s*<br\s*\/?>\s*)+/i).forEach((html) => {
        const p = el(document, "p");
        p.innerHTML = html;
        if (!text(trimBreaks3(p))) return;
        out2.push(out2.length ? p : el(document, hasH1 ? "h2" : "h1", text(p)));
      });
    }
    element.querySelectorAll('[class*="__text"]').forEach((t) => {
      out2.push(...splitBreaks(document, [inline4(document, t, "p")]));
    });
    return out2.length ? out2 : flatten(document, element);
  }
  function typography([element], ctx) {
    if (element.querySelector("p, div, h1, h2, h3, h4, h5, h6, ul, ol, img")) return richText2(ctx.document, element);
    return keepTag(ctx.document, element);
  }
  var HANDLERS5 = {
    "whitepaper-intro": { handler: whitepaperIntro },
    "event-intro": { handler: eventIntro },
    "event-info": { handler: eventInfo },
    "event-content-v2": { handler: eventContent },
    "event-register": { handler: eventRegister },
    "event-registration-form": { handler: eventRegistrationForm },
    "post-header": { handler: postHeader },
    "post-header-variant-2": { handler: postHeader, style: "dept-post-header" },
    "text-block-hero": { handler: textBlockHero },
    "awards-intro": { handler: awardsIntro },
    "industry-intro": { handler: industryIntro },
    "title-block": { handler: titleBlock },
    "highlighted-statement": { handler: highlightedStatement },
    // the source "align--center" option does not move the (left-aligned) text: not kept
    statement: { handler: statement, style: "dept-statement, dept-statement-v1" },
    "intro-text": { handler: introText },
    typography: { handler: typography },
    "case-intro-title": { handler: caseIntroTitle }
  };

  // tools/importer/parsers/dept/handlers/media.js
  function trimBreaks4(nodes) {
    nodes.forEach((n) => {
      if (n.nodeType !== 1 || !/^(P|H[1-6])$/.test(n.tagName)) return;
      const edge = (first) => first ? n.firstChild : n.lastChild;
      let x = edge(true);
      while (x && (x.nodeType === 1 && x.tagName === "BR" || x.nodeType === 3 && !x.textContent.trim())) {
        x.remove();
        x = edge(true);
      }
      x = edge(false);
      while (x && (x.nodeType === 1 && x.tagName === "BR" || x.nodeType === 3 && !x.textContent.trim())) {
        x.remove();
        x = edge(false);
      }
    });
    return nodes.filter((n) => n.nodeType !== 1 || text(n) || n.querySelector("img, picture") || n.matches("table, hr"));
  }
  function media(elements, ctx) {
    return elements.flatMap((e) => mediaAndContent(e, ctx));
  }
  function panelTwoMedia([element], ctx) {
    const columns = [...element.querySelectorAll('[class*="__column"]')];
    if (!columns.length) return mediaAndContent(element, ctx);
    return columns.flatMap((c) => mediaAndContent(c, ctx));
  }
  function titleOf3(document, node, fallbackTag = "h2") {
    if (!node || !text(node)) return null;
    const tag = /^H[2-6]$/.test(node.tagName) ? node.tagName.toLowerCase() : fallbackTag;
    const clone = node.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return heading(document, clone, tag);
  }
  function ctaOf(document, element, selector = 'a.cta-button, a.btn, a[class*="__cta"], a[class*="__btn"]') {
    const a = element.querySelector(selector);
    return a && a.href && text(a) ? linkParagraph(document, a.href, text(a)) : null;
  }
  function textAndMedia([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const tag = text(pick(element, '[class*="__tag"]'));
    if (tag) out2.push(el(document, "p", tag));
    const title2 = titleOf3(document, pick(element, '[class*="__title"]', "h1, h2, h3, h4"));
    if (title2) out2.push(title2);
    element.querySelectorAll('p[class*="__subtitle"], p[class*="__paragraph"], p[class*="__text"]').forEach((p) => {
      out2.push(...flatten(document, p));
    });
    const cta3 = ctaOf(document, element);
    if (cta3) out2.push(cta3);
    const imageWrap = pick(element, ".image-wrap", ".plyr, .video, video");
    if (!imageWrap) return out2.length ? out2 : flatten(document, element);
    const mediaNodes = mediaAndContent(imageWrap, ctx);
    const imageFirst = element.matches('[class*="media-with-text"]') && !element.classList.contains("is-switched");
    return trimBreaks4(imageFirst ? [...mediaNodes, ...out2] : [...out2, ...mediaNodes]);
  }
  function titleLeftBodyRight([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf3(document, pick(element, '[class*="__title"]'));
    if (title2) out2.push(title2);
    element.querySelectorAll("p").forEach((p) => out2.push(...flatten(document, p)));
    return trimBreaks4(out2);
  }
  function callToAction([element], ctx) {
    return trimBreaks4(flatten(ctx.document, element));
  }
  function ctaBar([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = titleOf3(document, pick(element, '[class*="__heading"]', '[class*="__title"]', "h2, h3"));
    if (title2) out2.push(title2);
    element.querySelectorAll('p[class*="__subtitle"], p[class*="__text"]').forEach((p) => out2.push(...flatten(document, p)));
    const cta3 = ctaOf(document, element);
    if (cta3) out2.push(cta3);
    return trimBreaks4(out2.length ? out2 : flatten(document, element));
  }
  function routingExtras([element], ctx) {
    const { document } = ctx;
    const columns = [...element.querySelectorAll('[class*="__left-column"], [class*="__right-column"]')];
    if (!columns.length) return flatten(document, element);
    return columns.flatMap((column) => {
      const out2 = [];
      const link = column.querySelector("a[href]");
      const title2 = column.querySelector('[class*="__title"]');
      if (title2 && text(title2)) {
        const h3 = el(document, "h3");
        const a = el(document, "a");
        a.href = link ? link.href : "";
        title2.childNodes.forEach((n) => {
          if (n.nodeType === 1 && n.matches("strong, b")) a.append(el(document, "strong", text(n)));
          else a.append(n.textContent.replace(/\s+/g, " "));
        });
        a.innerHTML = a.innerHTML.trim();
        h3.append(link ? a : a.textContent);
        out2.push(h3);
      }
      column.querySelectorAll('p[class*="__text"]').forEach((p) => out2.push(...flatten(document, p)));
      return out2;
    });
  }
  var slug = (value) => value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
  function vacancySubnav([element], ctx) {
    const { document } = ctx;
    const anchors = [...document.querySelectorAll("main .wrapper[id][data-anchor-text]")];
    const labels = [...element.querySelectorAll('[class*="__link"]')].map(text).filter(Boolean);
    const out2 = [];
    if (labels.length) {
      const ul = el(document, "ul");
      labels.forEach((label) => {
        const target = anchors.find((w) => text({ textContent: w.getAttribute("data-anchor-text") }) === label);
        const li = el(document, "li");
        if (target) {
          const a = el(document, "a", label);
          const h = target.querySelector("h1, h2, h3, h4, h5, h6");
          const clone = h && h.cloneNode(true);
          if (clone) clone.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
          a.href = `#${clone && text(clone) ? slug(text(clone)) : target.id}`;
          li.append(a);
        } else {
          li.textContent = label;
        }
        ul.append(li);
      });
      out2.push(ul);
    }
    const cta3 = ctaOf(document, element);
    if (cta3) out2.push(cta3);
    return out2;
  }
  function richText3([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const subhead = text(pick(element, '[class*="__left-content"] [class*="__subhead"]'));
    if (subhead) out2.push(el(document, "p", subhead));
    const title2 = titleOf3(document, pick(element, '[class*="__left-content"] [class*="__title"]', '[class*="__left-content"] h2, [class*="__left-content"] h3'));
    if (title2) out2.push(title2);
    const content = pick(element, '[class*="__content"]:not([class*="__left-content"])') || element;
    content.querySelectorAll('[class*="__item-inner"]').forEach((item) => {
      const cta3 = item.querySelector("a.cta-button");
      if (cta3 && !text(item).replace(text(cta3), "").trim()) {
        if (cta3.href) out2.push(linkParagraph(document, cta3.href, text(cta3)));
      } else {
        out2.push(...flatten(document, item));
      }
    });
    return out2.length ? out2 : flatten(document, element);
  }
  var innerOf = (node) => node.firstElementChild || node;
  var nameOf = (node) => {
    const classes = [...node.classList];
    const blockClass = classes.find((c) => c.startsWith("block-"));
    if (blockClass) return blockClass.replace(/^block-/, "").replace(/__.*$/, "");
    return (classes[0] || node.tagName.toLowerCase()).replace(/__.*$/, "");
  };
  function wrapper(elements, ctx) {
    return elements.flatMap((element) => {
      const inner = innerOf(element);
      const def = HANDLERS6[nameOf(inner)];
      if (inner !== element && def && def.handler) return def.handler([inner], ctx);
      return mediaAndContent(inner, ctx);
    });
  }
  function wrapperStyle(node) {
    const inner = innerOf(node);
    const name = nameOf(inner);
    const def = HANDLERS6[name] || {};
    if (inner === node) return "dept-wrapper";
    const style = (typeof def.style === "function" ? def.style(inner) : def.style) || `dept-${name}`;
    const m = inner.className.match(/(?:__theme|background-color|__color)--([a-zA-Z]+)\b/);
    const color = m && m[1].toLowerCase();
    if (!color || color === "white") return style;
    const dark = ["onyxgrey", "richblack", "black", "darkgrey", "charcoal"].includes(color);
    return `${style}, dept-bg-${color}${dark ? ", dept-dark" : ""}`;
  }
  function panelTwoMediaStyle(node) {
    const styles = ["dept-panel-two-media"];
    if (node.classList.contains("is-square")) styles.push("dept-panel-square");
    if (node.querySelector('[class*="__left"].is-framed')) styles.push("dept-panel-framed-left");
    if (node.querySelector('[class*="__right"].is-framed')) styles.push("dept-panel-framed-right");
    return styles.join(", ");
  }
  function richTextStyle(node) {
    const theme = (node.getAttribute("data-theme") || "").toLowerCase();
    if (!theme || theme === "white") return "dept-rich-text";
    const dark = ["onyxgrey", "richblack", "black", "darkgrey", "charcoal"].includes(theme);
    return `dept-rich-text, dept-bg-${theme}${dark ? ", dept-dark" : ""}`;
  }
  var HANDLERS7 = {
    image: { handler: media },
    "image-wrap": { handler: media, style: "dept-image" },
    div: { handler: media, style: "dept-image" },
    "full-width-image": { handler: media },
    "panel-two-media": { handler: panelTwoMedia, style: panelTwoMediaStyle },
    "oversized-image": { handler: textAndMedia },
    "media-with-text": { handler: textAndMedia },
    "title-left-body-right": { handler: titleLeftBodyRight },
    wrapper: { handler: wrapper, style: wrapperStyle },
    "call-to-action": { handler: callToAction },
    "footer-top": { handler: ctaBar },
    "routing-banner": { handler: ctaBar },
    "routing-extras": { handler: routingExtras },
    "vacancy-subnav": { handler: vacancySubnav },
    "rich-text": { handler: richText3, style: richTextStyle }
  };

  // tools/importer/parsers/dept/handlers/round2.js
  var ACCENT3 = ".is-fancy-serif, em, i";
  var BR_RUN4 = /(?:\s|&nbsp;)*(?:<br\s*\/?>(?:\s|&nbsp;)*){2,}/i;
  function trimBreaks5(node) {
    const edge = (first) => {
      let n = first ? node.firstChild : node.lastChild;
      while (n && (n.nodeType === 3 && !n.textContent.trim() || n.nodeType === 1 && n.tagName === "BR")) {
        const next = first ? n.nextSibling : n.previousSibling;
        n.remove();
        n = next;
      }
    };
    edge(true);
    edge(false);
    if (node.firstChild && node.firstChild.nodeType === 3) node.firstChild.textContent = node.firstChild.textContent.replace(/^\s+/, "");
    if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.textContent = node.lastChild.textContent.replace(/\s+$/, "");
    return node;
  }
  function inline5(document, source, tag = "p") {
    const out2 = el(document, tag);
    if (!source) return out2;
    const isHeading = /^H\d$/i.test(tag);
    const walk = (from, to) => {
      from.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          to.append(n.textContent.replace(/\s+/g, " "));
          return;
        }
        if (n.nodeType !== 1 || n.matches('svg, button, script, style, i.icon, [aria-hidden="true"], .is-mobile')) return;
        if (n.tagName === "BR") {
          to.append(isHeading ? " " : el(document, "br"));
          return;
        }
        if (n.matches(ACCENT3)) {
          if (text(n)) to.append(el(document, "em", text(n)));
          return;
        }
        if (n.matches("strong, b") && !isHeading) {
          const s = el(document, "strong");
          walk(n, s);
          if (text(s)) to.append(s);
          return;
        }
        if (n.tagName === "A" && n.getAttribute("href") && !isHeading) {
          const a = el(document, "a");
          a.href = n.getAttribute("href");
          walk(n, a);
          if (text(a)) to.append(a);
          return;
        }
        walk(n, to);
      });
    };
    walk(source, out2);
    out2.innerHTML = out2.innerHTML.replace(/<\/em>(\s*)<em>/g, "$1").replace(/\s*<br>\s*/g, "<br>");
    if (isHeading) out2.innerHTML = out2.innerHTML.replace(/\s+/g, " ");
    return trimBreaks5(out2);
  }
  function lines(document, source, tag = "p") {
    if (!source || !text(source)) return [];
    const copy = inline5(document, source, tag);
    if (!BR_RUN4.test(copy.innerHTML)) return text(copy) ? [copy] : [];
    return copy.innerHTML.split(BR_RUN4).map((part) => {
      const p = el(document, tag);
      p.innerHTML = part;
      return trimBreaks5(p);
    }).filter((p) => text(p));
  }
  function richText4(document, source) {
    if (!source) return [];
    return flatten(document, source).flatMap((n) => {
      if (n.tagName !== "P" || n.querySelector("img")) return [n];
      return lines(document, n);
    });
  }
  function titleOf4(document, node, tag = "h2") {
    if (!node || !text(node)) return null;
    return inline5(document, node, tag);
  }
  function pageTitleTag(document, element) {
    const main = document.querySelector("main") || document.body;
    return [...main.querySelectorAll("h1")].some((h) => !element.contains(h)) ? "h2" : "h1";
  }
  function imageParagraph(document, img) {
    if (!img) return null;
    const p = el(document, "p");
    p.append(img);
    return p;
  }
  function imageOf(document, node) {
    if (!node) return null;
    return image(document, node.querySelector("img")) || backgroundImage(document, node.matches('[style*="background-image"]') ? node : node.querySelector('[style*="background-image"]'));
  }
  function formUrl3(node) {
    const iframe = node && node.querySelector("iframe");
    if (!iframe) return "";
    return (iframe.getAttribute("src") || iframe.getAttribute("data-src") || iframe.getAttribute("data-initial-src") || "").trim();
  }
  function drawerForm(document, trigger) {
    const id = trigger && trigger.id;
    if (!id) return "";
    const drawer = [...document.querySelectorAll(".flyout-drawer[data-trigger]")].find((d) => d.getAttribute("data-trigger") === `#${id}`);
    const pick2 = drawer && drawer.querySelector('input[value^="http"]');
    return formUrl3(drawer) || (pick2 ? pick2.value : "");
  }
  function cta2(document, link, label = "", strong = false) {
    const href = link && link.getAttribute("href");
    const name = label || text(link);
    if (!href || href.startsWith("#") || !name) return null;
    return linkParagraph(document, href, name, strong);
  }
  var LISTINGS2 = {
    whitepapers: ["all-whitepapers", { "de-dach": "alle-whitepaper" }],
    partners: ["partners", { "de-dach": "partner" }],
    industries: ["industries", { "de-dach": "branchen" }],
    insights: ["all-insights", { "de-dach": "alle-insights" }]
  };
  function listingButton(document, element, selector, ctx, kind) {
    const button = element.querySelector(selector);
    if (!button) return null;
    const label = text(button.querySelector(".btn__label")) || text(button);
    if (button.tagName === "A") return cta2(document, button, label);
    if (!label || !LISTINGS2[kind]) return null;
    const [slug2, overrides] = LISTINGS2[kind];
    const path = [ctx.locale, overrides[ctx.locale] || slug2].filter(Boolean).join("/");
    return linkParagraph(document, `https://www.dept.global/${path}/`, label);
  }
  function cardTitle2(document, title2, href) {
    if (!title2) return null;
    const h3 = el(document, "h3");
    if (href) {
      const a = el(document, "a", title2);
      a.href = href;
      h3.append(a);
    } else {
      h3.textContent = title2;
    }
    return h3;
  }
  function cardsRelated2(document, variant, cards) {
    const rows = cards.filter((c) => c && (c.img || c.nodes && c.nodes.filter(Boolean).length)).map(({ img, nodes }) => [field(document, "image", img), field(document, "text", (nodes || []).filter(Boolean))]);
    if (!rows.length) return null;
    return block(document, variant ? `cards-related (${variant})` : "cards-related", rows);
  }
  function pointsList2(document, variant, points) {
    const rows = points.map((nodes) => nodes.filter(Boolean)).filter((nodes) => nodes.length).map((nodes) => [field(document, "text", nodes)]);
    if (!rows.length) return null;
    return block(document, variant ? `points-list (${variant})` : "points-list", rows);
  }
  function unique(cards) {
    const seen = /* @__PURE__ */ new Set();
    return cards.filter((c) => {
      const key = c.getAttribute("href") || text(c);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function nested(node, ctx) {
    const classes = [...node.classList];
    const blockClass = classes.find((c) => c.startsWith("block-"));
    const name = (blockClass ? blockClass.replace(/^block-/, "") : classes[0] || "").replace(/__.*$/, "");
    const def = HANDLERS6[name];
    if (def && def.handler) return def.handler([node], ctx);
    return richText4(ctx.document, node);
  }
  var out = (nodes, document, element) => {
    const list = nodes.filter(Boolean);
    return list.length ? list : flatten(document, element);
  };
  function twoQuotes([element], ctx) {
    const { document } = ctx;
    const nodes = [...element.querySelectorAll('[class*="__quote"]:not([class*="__quote-"])')].flatMap((q) => [
      ...lines(document, q.querySelector('[class*="__title"]')),
      ...lines(document, q.querySelector('[class*="__text"]'))
    ]);
    return out(nodes, document, element);
  }
  function paragraph([element], ctx) {
    return out(lines(ctx.document, element), ctx.document, element);
  }
  function ctaBanner([element], ctx) {
    const { document } = ctx;
    return out([
      titleOf4(document, pick(element, '[class*="cta-text__content"]', "h2, h3")),
      cta2(document, pick(element, 'a[class*="__cta-button"]', "a.cta-button"))
    ], document, element);
  }
  function tiktokVideo([element], ctx) {
    const { document } = ctx;
    const id = element.getAttribute("data-video-id") || ((element.getAttribute("cite") || "").match(/video\/(\d+)/) || [])[1];
    const url = element.getAttribute("cite") || (id ? `https://www.tiktok.com/embed/v2/${id}` : "");
    return url ? [linkParagraph(document, url, "Watch on TikTok")] : [];
  }
  function externallyTriggeredForm([element], ctx) {
    const { document } = ctx;
    const form = drawerForm(document, element);
    if (!form) return [];
    const trigger = (element.getAttribute("data-triggers") || "").trim();
    const opener = trigger && [...document.querySelectorAll("main a[href]")].find((a) => a.getAttribute("href") === trigger);
    return [linkParagraph(document, form, text(opener) || "Contact us")];
  }
  function trendsFloatingDownload([element], ctx) {
    const { document } = ctx;
    const link = element.querySelector("a[href]");
    const form = formUrl3(document.querySelector('main [class*="__form"]'));
    const href = form || link && link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || !text(link)) return [];
    return [linkParagraph(document, href, text(link))];
  }
  function postHeader2([element], ctx) {
    const { document } = ctx;
    const h1 = pick(element, "h1", '[class*="__heading"]');
    const left = [titleOf4(document, h1, "h1")];
    const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
    if (img && !img.alt && h1) img.alt = text(h1);
    const right = [imageParagraph(document, img), ...lines(document, element.querySelector('[class*="__intro"]'))];
    const bar = element.querySelector('[class*="__cta-bar"]');
    const form = drawerForm(document, bar);
    const label = text(bar && bar.querySelector(".cta-bar__label"));
    if (form && label) right.push(linkParagraph(document, form, label, true));
    return [block(document, "panel-split", [
      [field(document, "left", left.filter(Boolean))],
      [field(document, "right", right.filter(Boolean))]
    ])];
  }
  function mainPageHeader([element], ctx) {
    const { document } = ctx;
    return out([
      titleOf4(document, pick(element, '[class*="__heading"]', "h1"), "h1"),
      ...lines(document, element.querySelector('[class*="__intro"]'))
    ], document, element);
  }
  function insightsHeader([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, pick(element, '[class*="__heading"]', "h1"), "h1")];
    const column = element.querySelector('[class*="__column--right"]');
    if (column) [...column.children].forEach((child) => nodes.push(...nested(child, ctx)));
    return out(nodes, document, element);
  }
  function eventHeader(elements, ctx) {
    const { document } = ctx;
    const nodes = [];
    elements.forEach((element) => {
      if (element.tagName === "P") {
        nodes.push(...lines(document, element));
        return;
      }
      const h1 = pick(element, "h1", '[class*="__title"]');
      const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
      if (img && !img.alt && h1) img.alt = text(h1);
      const textNodes = [titleOf4(document, h1, "h1")];
      element.querySelectorAll('[class*="__meta"] > *').forEach((m) => textNodes.push(...lines(document, m)));
      nodes.push(block(document, "Detail Panel (overlay)", [
        [img ? field(document, "image", img) : ""],
        [field(document, "text", textNodes.filter(Boolean))]
      ]));
    });
    return nodes;
  }
  function imageWithTextAndOverlay([element], ctx) {
    const { document } = ctx;
    const t = element.querySelector('[class*="__text"]');
    const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
    if (img && !img.alt && t) img.alt = text(t);
    return [block(document, "Detail Panel (overlay)", [
      [img ? field(document, "image", img) : ""],
      [field(document, "text", [titleOf4(document, t, pageTitleTag(document, element))].filter(Boolean))]
    ])];
  }
  function landingPageTitle([element], ctx) {
    const { document } = ctx;
    const t = element.querySelector('[class*="__title"]');
    const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
    if (img && !img.alt && t) img.alt = text(t);
    return [block(document, "Detail Panel (overlay)", [
      [img ? field(document, "image", img) : ""],
      [field(document, "text", [
        ...lines(document, element.querySelector('[class*="__intro"]')),
        titleOf4(document, t, pageTitleTag(document, element))
      ].filter(Boolean))]
    ])];
  }
  function trendsHeader([element], ctx) {
    const { document } = ctx;
    const t = element.querySelector('[class*="__title"]');
    const img = imageOf(document, element.querySelector('[class*="__background-image-wrap"]')) || imageOf(document, element.querySelector('[class*="__image-wrap"]'));
    if (img && !img.alt && t) img.alt = text(t);
    return [block(document, "Detail Panel (overlay)", [
      [img ? field(document, "image", img) : ""],
      [field(document, "text", [
        titleOf4(document, t, pageTitleTag(document, element)),
        ...lines(document, element.querySelector('[class*="__subtitle"]')),
        cta2(document, element.querySelector('a[class*="__cta"]'))
      ].filter(Boolean))]
    ])];
  }
  function formWithHeader([element], ctx) {
    const { document, type } = ctx;
    const t = element.querySelector('[class*="__title"]');
    const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
    if (img && !img.alt && t) img.alt = text(t);
    const nodes = [block(document, "Detail Panel (overlay)", [
      [img ? field(document, "image", img) : ""],
      [field(document, "text", [titleOf4(document, t, "h2")].filter(Boolean))]
    ])];
    nodes.push(...lines(document, element.querySelector('[class*="__intro"]')));
    nodes.push(...lines(document, element.querySelector('[class*="__body"]')));
    const form = formUrl3(element.querySelector('[class*="__form-container"]') || element);
    if (form) nodes.push(linkParagraph(document, form, type === "event" ? "Register" : "Contact us"));
    return nodes;
  }
  function formBlock(fallbackLabel, useTitle = true) {
    return ([element], ctx) => {
      const { document } = ctx;
      const t = element.querySelector('[class*="__title"]');
      const nodes = [titleOf4(document, t, pageTitleTag(document, element))];
      nodes.push(imageParagraph(document, imageOf(document, element.querySelector('[class*="__image-wrap"]'))));
      const iframe = element.querySelector("iframe");
      const form = formUrl3(element);
      const label = useTitle && iframe && (iframe.getAttribute("title") || "").trim() || fallbackLabel;
      if (form) nodes.push(linkParagraph(document, form, label));
      return out(nodes, document, element);
    };
  }
  var panelList = (kind) => ([element], ctx) => {
    const { document } = ctx;
    const nodes = [titleOf4(document, pick(element, '[class*="__heading"]', "h2"))];
    nodes.push(listingButton(document, element, '[class*="__column--left"] :is(a[href], button)', ctx, kind));
    const items = [...element.querySelectorAll("a.panel-list-item")].map((a) => [text(a.querySelector('[class*="__title-content"]')) || text(a), a.getAttribute("href")]).filter(([label]) => label);
    if (items.length) {
      const ol = el(document, "ol");
      items.forEach(([label, href]) => {
        const li = el(document, "li");
        if (href) {
          const a = el(document, "a", label);
          a.href = href;
          li.append(a);
        } else {
          li.textContent = label;
        }
        ol.append(li);
      });
      nodes.push(ol);
    }
    return out(nodes, document, element);
  };
  function panelWork([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, pick(element, '[class*="__heading"]', "h1, h2"), "h2")];
    const teaser = element.querySelector("a.case-teaser");
    const href = teaser && teaser.getAttribute("href");
    if (href) {
      const label = text(teaser.querySelector('.btn__label, [class*="__read-more"]'));
      const title2 = text(teaser.querySelector('[class*="__title"], h2, h3'));
      nodes.push(cardsRelated2(document, "teaser", [{
        img: imageOf(document, teaser),
        nodes: [cardTitle2(document, title2, href), label ? linkParagraph(document, href, label) : null]
      }]));
    }
    return out(nodes, document, element);
  }
  function panelWhitepaper([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, pick(element, '[class*="__heading"]', "h1, h2"), "h2")];
    nodes.push(listingButton(document, element, '[class*="__cta"]', ctx, "whitepapers"));
    const cards = [...element.querySelectorAll(".card-whitepaper")].map((card) => {
      const link = card.closest("a[href]") || card.querySelector("a[href]");
      const title2 = text(card.querySelector('[class*="__title"], h2, h3'));
      if (!title2) return null;
      return { img: imageOf(document, card), nodes: [cardTitle2(document, title2, link && link.getAttribute("href"))] };
    });
    nodes.push(cardsRelated2(document, "", cards));
    return out(nodes, document, element);
  }
  function textCard(document, card, href, { eyebrow, title: title2, body } = {}) {
    const nodes = [];
    const e = eyebrow && text(card.querySelector(eyebrow));
    if (e) nodes.push(el(document, "p", e));
    nodes.push(cardTitle2(document, text(card.querySelector(title2)), href));
    if (body) nodes.push(...lines(document, card.querySelector(body)));
    return { img: null, nodes };
  }
  function articleRelatedPosts([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, pick(element, '[class*="__heading"]', "h2"))];
    nodes.push(listingButton(document, element, '[class*="__left"] [class*="__cta"]', ctx, "insights"));
    const cards = [...element.querySelectorAll('[class*="__right"] .article-teaser-small')].map((card) => {
      const link = card.closest("a[href]");
      return textCard(document, card, link && link.getAttribute("href"), { eyebrow: '[class*="__author"]', title: '[class*="__title"]' });
    }).filter((c) => c.nodes.some((n) => n && n.tagName === "H3"));
    nodes.push(cardsRelated2(document, "list", cards));
    return out(nodes, document, element);
  }
  function highlightedInsight(elements, ctx) {
    const { document } = ctx;
    const cards = elements.map((card) => {
      const href = card.getAttribute("href");
      const nodes = [];
      const meta = text(card.querySelector('[class*="__meta"]'));
      if (meta) nodes.push(el(document, "p", meta));
      nodes.push(cardTitle2(document, text(card.querySelector('[class*="__title"]')), href));
      return { img: imageOf(document, card), nodes };
    });
    const b = cardsRelated2(document, "", cards);
    return b ? [b] : elements.flatMap((e) => flatten(document, e));
  }
  function serviceTeaser(elements, ctx) {
    const { document } = ctx;
    const cards = elements.map((teaser) => {
      const link = teaser.querySelector('a[href]:not([href=""])');
      const href = link && link.getAttribute("href");
      const name = text(teaser.querySelector('[class*="__heading"]'));
      if (!name) return null;
      const label = text(teaser.querySelector(".btn__label"));
      return {
        img: null,
        nodes: [
          cardTitle2(document, name, href),
          ...lines(document, teaser.querySelector('[class*="__excerpt"]')),
          href && label ? linkParagraph(document, href, label) : null
        ]
      };
    });
    const b = cardsRelated2(document, "list", cards);
    return b ? [b] : [];
  }
  function contentListing([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__title"]'), "h1")];
    const cards = unique([...element.querySelectorAll("a.listing-card-v2")]).map((card) => {
      const href = card.getAttribute("href");
      const n = [];
      const type = text(card.querySelector('[class*="__type"]'));
      if (type) n.push(el(document, "p", type));
      n.push(cardTitle2(document, text(card.querySelector('[class*="__title"]')), href));
      const tags = [...card.querySelectorAll('[class*="__tag"]:not([class*="__tags"]):not([class*="__type"])')].map((t) => text(t).replace(/^\(\s*|\s*\)$/g, "")).filter(Boolean);
      if (tags.length) n.push(el(document, "p", tags.join(", ")));
      return { img: image(document, card.querySelector("img")), nodes: n };
    });
    nodes.push(cardsRelated2(document, "", cards));
    return out(nodes, document, element);
  }
  function filterableItemListing([element], ctx) {
    const { document } = ctx;
    const nodes = [cta2(document, element.querySelector('a[class*="__back-button"]'))];
    nodes.push(titleOf4(document, element.querySelector('[class*="__title"]'), "h1"));
    const cards = unique([...element.querySelectorAll("a.universal-item-card")]).map((card) => {
      const href = card.getAttribute("href");
      const n = [];
      const meta = text(card.querySelector('[class*="__meta"]'));
      if (meta) n.push(el(document, "p", meta));
      n.push(cardTitle2(document, text(card.querySelector('[class*="__title"]')), href));
      return { img: image(document, card.querySelector("img")), nodes: n };
    });
    nodes.push(cardsRelated2(document, "", cards));
    return out(nodes, document, element);
  }
  function customListingSimple([element], ctx) {
    const { document } = ctx;
    const cards = [...element.querySelectorAll('a[class*="__card"]')].map((card) => {
      const label = text(card.querySelector('[class*="__card_btn"]')) || text(card);
      const img = image(document, card.querySelector("img"));
      if (img && !img.alt) img.alt = label;
      return { img, nodes: [cardTitle2(document, label, card.getAttribute("href"))] };
    });
    const b = cardsRelated2(document, "", cards);
    return b ? [b] : flatten(document, element);
  }
  function featuredItems([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, pick(element, '[class*="__heading"]', "h2"))];
    nodes.push(cta2(document, element.querySelector('a[class*="__btn"]')));
    const cards = unique([...element.querySelectorAll('a[class*="article-card"]')]).map((card) => ({
      img: imageOf(document, card),
      nodes: [cardTitle2(document, text(card.querySelector('[class*="__heading"]')), card.getAttribute("href"))]
    }));
    nodes.push(cardsRelated2(document, "", cards));
    return out(nodes, document, element);
  }
  function informationCards([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__text"] [class*="__title"]'))];
    element.querySelectorAll('[class*="__text"] [class*="__subtitle"]').forEach((p) => nodes.push(...lines(document, p)));
    const cards = ["left", "right", "third"].map((side) => {
      const title2 = element.querySelector(`[class*="__${side}-title"]`);
      const img = image(document, element.querySelector(`[class*="__${side}-image"] img, img[class*="__${side}-image"]`));
      const body = [titleOf4(document, title2, "h3"), ...lines(document, element.querySelector(`[class*="__${side}-subtitle"]`))];
      if (img && !img.alt && title2) img.alt = text(title2);
      return { img, nodes: body };
    });
    nodes.push(cardsRelated2(document, "info", cards));
    return out(nodes, document, element);
  }
  function podcasts([element], ctx) {
    const { document } = ctx;
    const titleEl = element.querySelector('[class*="__title"]');
    const nodes = [titleOf4(document, titleEl && (titleEl.querySelector(".is-desktop") || titleEl))];
    const featured = element.querySelector('[class*="__featured"]');
    const cards = [];
    const seen = /* @__PURE__ */ new Set();
    if (featured) {
      const link = featured.querySelector("a[href]");
      const href = link && link.getAttribute("href");
      seen.add(href);
      cards.push({
        img: image(document, featured.querySelector("img")),
        nodes: [
          el(document, "p", text(featured.querySelector('[class*="__featured-meta"]'))),
          cardTitle2(document, text(featured.querySelector('[class*="__featured-title"]')), href),
          cta2(document, link)
        ].filter((n) => n && text(n))
      });
    }
    element.querySelectorAll('a[class*="__item"]').forEach((item) => {
      const href = item.getAttribute("href");
      if (seen.has(href)) return;
      seen.add(href);
      const meta = [text(item.querySelector('[class*="__item-meta"]')), text(item.querySelector('[class*="__item-date"]'))].filter(Boolean).join(" \u2022 ");
      cards.push({ img: null, nodes: [meta ? el(document, "p", meta) : null, cardTitle2(document, text(item.querySelector('[class*="__item-title"]')), href)] });
    });
    nodes.push(cardsRelated2(document, "list", cards));
    return out(nodes, document, element);
  }
  function teamGallery([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__title"]'))];
    nodes.push(...lines(document, element.querySelector('[class*="__subhead"]')));
    const rows = [...element.querySelectorAll('[class*="__item"]:not([class*="__items"]):not([class*="__item-"])')].map((item) => {
      const name = text(item.querySelector('[class*="__item-name"]'));
      const bio = text(item.querySelector('[class*="__item-bio"]'));
      const img = image(document, item.querySelector("img"));
      if (img) img.alt = name;
      const body = [name ? el(document, "h3", name) : null, bio ? el(document, "p", bio) : null].filter(Boolean);
      return [img ? field(document, "image", img) : "", field(document, "text", body)];
    }).filter((row) => row[0] || row[1]);
    if (rows.length) nodes.push(block(document, "people-cards", rows));
    return out(nodes, document, element);
  }
  function labelled3(document, label, valueEl) {
    const value = inline5(document, valueEl, "p");
    if (!text(value)) return null;
    if (!label) return value;
    const p = el(document, "p");
    p.append(el(document, "strong", label), el(document, "br"), ...value.childNodes);
    return p;
  }
  function eventProgram([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__title"]'))];
    const tabs = [...element.querySelectorAll('[class*="__tab"]:not([class*="__tabs"]):not([class*="__tab-"])')].map(text);
    [...element.querySelectorAll('[class*="__schedule-item"]')].forEach((schedule, i) => {
      if (tabs[i] && tabs.length > 1) nodes.push(el(document, "h3", tabs[i]));
      const points = [...schedule.querySelectorAll('[class*="__item"]:not([class*="__item-"])')].map((item) => {
        const part = (name) => [...item.querySelectorAll("*")].find((n) => [...n.classList].some((c) => c.endsWith(`__item-${name}`)));
        return [
          titleOf4(document, part("keynote-title"), "h3"),
          labelled3(document, text(part("time-label")), part("time")),
          labelled3(document, text(part("speakers-label")), part("speakers"))
        ];
      });
      nodes.push(pointsList2(document, "", points));
    });
    return out(nodes, document, element);
  }
  function eventProgramV2([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__title"]'))];
    const table = element.querySelector("table");
    if (table) {
      const head = [...table.querySelectorAll("thead th")].map((th) => text(inline5(document, th, "p")));
      const points = [...table.querySelectorAll("tbody tr")].map((tr) => {
        const [time, talk, speaker] = [...tr.children];
        return [titleOf4(document, talk, "h3"), labelled3(document, head[0], time), labelled3(document, head[2], speaker)];
      });
      nodes.push(pointsList2(document, "", points));
    }
    return out(nodes, document, element);
  }
  function eventLocations([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__title"]'), "h2")];
    element.querySelectorAll('[class*="__location-title"]').forEach((p) => nodes.push(...lines(document, p)));
    element.querySelectorAll('iframe[src*="maps"]').forEach((iframe) => {
      const src = iframe.getAttribute("src");
      let q = "";
      try {
        q = new URL(src, "https://maps.google.com/").searchParams.get("q") || "";
      } catch (e) {
      }
      if (q) nodes.push(linkParagraph(document, `https://maps.google.com/maps?q=${encodeURIComponent(q)}`, q));
    });
    return out(nodes, document, element);
  }
  function timeline([element], ctx) {
    const { document } = ctx;
    const cards = [...element.querySelectorAll('[class*="__item"]:not([class*="__item-"])')].map((item) => {
      const year = text(item.querySelector('[class*="__year"]'));
      const img = image(document, item.querySelector("img"));
      if (img && !img.alt) img.alt = year;
      return { img, nodes: [year ? el(document, "h3", year) : null, ...lines(document, item.querySelector('[class*="__description"]'))] };
    });
    const b = cardsRelated2(document, "", cards);
    return b ? [b] : flatten(document, element);
  }
  function threeFacts([element], ctx) {
    const { document } = ctx;
    const nodes = [imageParagraph(document, image(document, element.querySelector('[class*="__background-image"] img, img')))];
    nodes.push(titleOf4(document, element.querySelector('[class*="__title"]')));
    const points = [...element.querySelectorAll('[class*="__fact"]:not([class*="__fact-"]):not([class*="__facts"])')].map((fact) => {
      const t = fact.querySelector('[class*="__fact-title"]');
      const h3 = titleOf4(document, t, "h3");
      if (h3) h3.innerHTML = h3.innerHTML.replace(/^\s*\d+\s+/, "");
      return [h3, ...lines(document, fact.querySelector('[class*="__fact-subtitle"]'))];
    });
    nodes.push(pointsList2(document, "numbered", points));
    return out(nodes, document, element);
  }
  function headingTextImage([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__title"]'))];
    element.querySelectorAll('[class*="__text"]').forEach((p) => nodes.push(...lines(document, p)));
    let urls = [];
    const grid = element.querySelector("[data-items]");
    try {
      urls = JSON.parse(grid.getAttribute("data-items")).map((i) => i.url).filter(Boolean);
    } catch (e) {
      urls = [...element.querySelectorAll('[class*="__grid-media"] img')].map((img) => img.getAttribute("src"));
    }
    const title2 = text(element.querySelector('[class*="__title"]'));
    const slides = urls.slice(0, 6).map((src) => {
      const img = el(document, "img");
      img.src = src;
      img.alt = title2;
      return [field(document, "media_image", img), ""];
    });
    if (slides.length) nodes.push(block(document, "carousel-culture (images)", slides));
    return out(nodes, document, element);
  }
  function headingWithColumns([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__title"]:not([class*="__title-lead"])'))];
    nodes.push(imageParagraph(document, image(document, element.querySelector('[class*="__image-wrap"] img'))));
    nodes.push(...lines(document, element.querySelector('[class*="__title-lead"]')));
    nodes.push(...richText4(document, element.querySelector('[class*="__content"]')));
    return out(nodes, document, element);
  }
  function specialAwards([element], ctx) {
    const { document } = ctx;
    const nodes = [titleOf4(document, element.querySelector('[class*="__title"]'))];
    nodes.push(...lines(document, element.querySelector('[class*="__subtitle"]')));
    const cards = [...element.querySelectorAll('[class*="__tab"][data-img]')].map((tab) => {
      const data = (name) => (tab.getAttribute(`data-${name}`) || "").replace(/\s+/g, " ").trim();
      const img = el(document, "img");
      img.src = data("img");
      img.alt = data("title") || text(tab);
      const n = [el(document, "p", text(tab)), el(document, "h3", data("title"))];
      if (data("subtitle")) n.push(el(document, "p", data("subtitle")));
      return { img, nodes: n.filter((x) => text(x)) };
    });
    nodes.push(cardsRelated2(document, "", cards));
    return out(nodes, document, element);
  }
  function officeMap([element], ctx) {
    const { document } = ctx;
    const nodes = [];
    const tabs = [...element.querySelectorAll('[class*="__tab"]:not([class*="__tabs"])')].map((t) => text(t).replace(/\s*\d+$/, ""));
    element.querySelectorAll('[class*="__region-container"]').forEach((region, i) => {
      const name = tabs[i];
      if (name) nodes.push(el(document, "h2", name));
      const points = [...region.querySelectorAll('[class*="__office-card"]')].map((card) => {
        const [city, ...rest] = [...card.children];
        return [el(document, "h3", text(city)), ...rest.map((n) => {
          if (n.tagName === "A" && n.getAttribute("href")) return linkParagraph(document, n.getAttribute("href"), text(n));
          return text(n) ? el(document, "p", text(n)) : null;
        })];
      });
      nodes.push(pointsList2(document, "columns", points));
    });
    return out(nodes, document, element);
  }
  function mediaParallax([element], ctx) {
    const { document } = ctx;
    const link = element.querySelector("a[href]");
    const label = text(element.querySelector('button, [class*="__btn"]'));
    const content = [
      ...lines(document, element.querySelector('[class*="__tag"]')),
      titleOf4(document, element.querySelector('[class*="__title"]')),
      link ? linkParagraph(document, link.getAttribute("href"), label || "Read more") : null
    ].filter(Boolean);
    const img = image(document, element.querySelector("img"));
    return [block(document, "carousel-culture (slides)", [[field(document, "media_image", img), field(document, "content_text", content)]])];
  }
  function squareMediaWithText([element], ctx) {
    const { document } = ctx;
    const media2 = [imageParagraph(document, image(document, element.querySelector('[class*="__image-wrap"] img')))];
    const content = [titleOf4(document, element.querySelector('[class*="__title"]'))];
    element.querySelectorAll('[class*="__paragraph"]').forEach((p) => content.push(...lines(document, p)));
    content.push(cta2(document, element.querySelector('a.cta-button, a[class*="__cta"]')));
    const nodes = element.classList.contains("is-switched") ? [...content, ...media2] : [...media2, ...content];
    return out(nodes, document, element);
  }
  function fiftyFiftyImages([element], ctx) {
    const { document } = ctx;
    return out([...element.querySelectorAll("img")].map((img) => imageParagraph(document, image(document, img))), document, element);
  }
  function trendsIntro([element], ctx) {
    const { document } = ctx;
    return out([
      ...lines(document, element.querySelector('[class*="__text"]')),
      imageParagraph(document, image(document, element.querySelector('[class*="__image-wrap"] img'))),
      ...lines(document, element.querySelector('[class*="__img-text"]'))
    ], document, element);
  }
  function trendsContent([element], ctx) {
    const { document } = ctx;
    const t = element.querySelector('[class*="__title"]');
    const images = ['[class*="__image-wrap"]:not([class*="hover"]) img', '[class*="__second-image-wrap"] img'].map((sel) => {
      const img = image(document, element.querySelector(sel));
      if (img && !img.alt && t) img.alt = text(t);
      return imageParagraph(document, img);
    });
    return out([
      ...lines(document, element.querySelector('[class*="__overline"]')),
      titleOf4(document, t),
      ...[...element.querySelectorAll('[class*="__text"]')].flatMap((p) => lines(document, p)),
      cta2(document, element.querySelector('a.cta-button, a[class*="__cta"]')),
      ...images
    ], document, element);
  }
  function featuredEvent([element], ctx) {
    const { document } = ctx;
    const teaser = element.querySelector('a[class*="event-teaser"]');
    if (!teaser || !text(teaser)) return [];
    return out([
      titleOf4(document, element.querySelector('[class*="__heading"]')),
      cardsRelated2(document, "", [{
        img: imageOf(document, teaser),
        nodes: [cardTitle2(document, text(teaser.querySelector('[class*="__title"], h2, h3')), teaser.getAttribute("href"))]
      }])
    ], document, element);
  }
  function fastFacts([element], ctx) {
    const { document } = ctx;
    const rows = [...element.querySelectorAll('[class*="__item"]:not([class*="__item-"])')].map((item) => {
      const nodes = [...lines(document, item.querySelector('[class*="__item-title"]')), ...lines(document, item.querySelector('[class*="__item-text"]'))];
      return nodes.length ? [field(document, "text", nodes)] : null;
    }).filter(Boolean);
    return out([
      titleOf4(document, element.querySelector('[class*="__title"]')),
      rows.length ? block(document, "stats-grid", rows) : null
    ], document, element);
  }
  function fullBleedImage([element], ctx) {
    const { document } = ctx;
    return out([imageParagraph(document, image(document, element.querySelector("img")))], document, element);
  }
  function caseTeaser2([element], ctx) {
    const { document } = ctx;
    const href = element.getAttribute("href");
    if (!href) return [];
    const label = text(element.querySelector('.btn__label, [class*="__read-more"]'));
    const b = cardsRelated2(document, "teaser", [{
      img: imageOf(document, element),
      nodes: [cardTitle2(document, text(element.querySelector('[class*="__title"], h2, h3')) || label, href)]
    }]);
    return b ? [b] : [];
  }
  function ctaButton([element], ctx) {
    const link = cta2(ctx.document, element.matches("a") ? element : element.querySelector("a[href]"));
    return link ? [link] : flatten(ctx.document, element);
  }
  function souvenirShop([element], ctx) {
    const { document } = ctx;
    const cards = [...element.querySelectorAll("[data-souvenir-shop-product-name]")].map((item) => {
      const data = (name) => (item.getAttribute(`data-souvenir-shop-${name}`) || "").replace(/\s+/g, " ").trim();
      let img = null;
      if (data("image-url")) {
        img = el(document, "img");
        img.src = data("image-url");
        img.alt = data("image-alt") || data("product-name");
      }
      return { img, nodes: [el(document, "h3", data("product-name")), data("description") ? el(document, "p", data("description")) : null] };
    });
    return out([
      titleOf4(document, element.querySelector('[class*="__title"]')),
      ...lines(document, element.querySelector('[class*="__subtitle"]')),
      cardsRelated2(document, "", cards)
    ], document, element);
  }
  var HANDLERS8 = {
    "two-quotes": { handler: twoQuotes },
    // the header and its intro line (block-event-header__cta) are separate children of <main>
    "event-header": { handler: eventHeader, group: true },
    "article-related-posts": { handler: articleRelatedPosts },
    "service-post-header": { handler: postHeader2, style: "dept-post-header-split, dept-service-post-header" },
    "industry-post-header": { handler: postHeader2, style: "dept-post-header-split, dept-industry-post-header" },
    "partner-post-header": { handler: postHeader2, style: "dept-post-header-split, dept-partner-post-header" },
    "panel-services": { handler: panelList(""), style: "dept-panel-list, dept-panel-services" },
    "panel-partners": { handler: panelList("partners"), style: "dept-panel-list, dept-panel-partners" },
    "panel-industries": { handler: panelList("industries"), style: "dept-panel-list, dept-panel-industries" },
    "highlighted-insight": { handler: highlightedInsight, group: true },
    "main-page-header": { handler: mainPageHeader },
    "panel-work": { handler: panelWork },
    "event-program": { handler: eventProgram },
    "event-program-v2": { handler: eventProgramV2, style: "dept-event-program, dept-event-program-v2" },
    "content-listing": { handler: contentListing },
    "filterable-item-listing": { handler: filterableItemListing, style: "dept-content-listing, dept-filterable-item-listing" },
    "custom-listing-simple": { handler: customListingSimple },
    "panel-whitepaper": { handler: panelWhitepaper },
    "information-with-two-content-cards": { handler: informationCards },
    "tiktok-video": { handler: tiktokVideo },
    "special-awards": { handler: specialAwards },
    "heading-text-image": { handler: headingTextImage },
    "contact-form-big": { handler: formBlock("Contact us") },
    "form-newsletter": { handler: formBlock("Subscribe", false) },
    paragraph: { handler: paragraph },
    "js-media-parallax": { handler: mediaParallax, style: "dept-carousel-slides, dept-media-parallax" },
    "trends-floating-download": { handler: trendsFloatingDownload },
    "square-media-with-text": { handler: squareMediaWithText, style: (node) => `dept-media-with-text, dept-square-media-with-text${node.classList.contains("is-switched") ? ", dept-switched" : ""}` },
    "service-teaser": { handler: serviceTeaser, group: true },
    "image-with-text-and-overlay": { handler: imageWithTextAndOverlay },
    podcasts: { handler: podcasts },
    "insights-header": { handler: insightsHeader },
    "externally-triggered-form": { handler: externallyTriggeredForm },
    "cta-banner": { handler: ctaBanner },
    timeline: { handler: timeline },
    "heading-with-columns": { handler: headingWithColumns },
    "three-facts": { handler: threeFacts },
    // dark on the source (theme set in the component CSS, not as a theme class)
    "office-map": { handler: officeMap, style: "dept-office-map, dept-bg-richblack, dept-dark" },
    "form-with-header": { handler: formWithHeader },
    "fifty-fifty-image-block": { handler: fiftyFiftyImages, style: "dept-panel-two-media, dept-fifty-fifty-image-block" },
    "trends-header-v2": { handler: trendsHeader },
    "trends-header": { handler: trendsHeader, style: "dept-trends-header-v2, dept-trends-header" },
    "trends-intro": { handler: trendsIntro },
    "trends-content": { handler: trendsContent, style: (node) => `dept-trends-content${node.classList.contains("is-swapped") ? ", dept-switched" : ""}` },
    "featured-items": { handler: featuredItems },
    "landing-page-title": { handler: landingPageTitle },
    "team-gallery": { handler: teamGallery },
    "event-locations": { handler: eventLocations },
    "featured-event": { handler: featuredEvent },
    // single-page components
    "fast-facts": { handler: fastFacts },
    "full-bleed-image": { handler: fullBleedImage, style: "dept-full-width-image, dept-full-bleed-image" },
    "case-teaser": { handler: caseTeaser2 },
    text: { handler: paragraph, style: "dept-paragraph, dept-text" },
    "cta-button": { handler: ctaButton },
    "souvenir-shop": { handler: souvenirShop }
  };

  // tools/importer/parsers/dept/components.js
  function runParser(parser, elements, ctx) {
    const holder = ctx.document.createElement("div");
    elements.forEach((e) => holder.append(e));
    elements.forEach((e) => {
      if (e.parentNode) parser(e, ctx);
    });
    return [...holder.childNodes];
  }
  function heading(document, source, tag) {
    const h = el(document, tag);
    const walk = (from) => from.childNodes.forEach((n) => {
      if (n.nodeType === 3) h.append(n.textContent.replace(/\s+/g, " "));
      else if (n.nodeType !== 1 || n.matches("svg, button, script, style")) return;
      else if (n.tagName === "BR") h.append(" ");
      else if (n.matches(".is-fancy-serif, em, i")) {
        if (text(n)) h.append(el(document, "em", text(n)));
      } else walk(n);
    });
    walk(source);
    h.innerHTML = h.innerHTML.replace(/<\/em>(\s*)<em>/g, "$1").replace(/\s+/g, " ").trim();
    return h;
  }
  function titleAndCta(ctx, element, titleSel, ctaSel) {
    const out2 = [];
    const title2 = pick(element, titleSel);
    if (title2 && text(title2)) out2.push(heading(ctx.document, title2, "h2"));
    const cta3 = pick(element, ctaSel);
    if (cta3 && cta3.href && text(cta3)) out2.push(linkParagraph(ctx.document, cta3.href, text(cta3)));
    return out2;
  }
  function scrollyVideoIntro(elements, ctx) {
    return runParser(parse, elements, ctx);
  }
  var TWO_COLUMN_VARIANTS = ["left-aligned-asset", "right-aligned-asset", "fifty-fifty-asset"];
  var variantOf = (node) => node.getAttribute && node.getAttribute("data-variant") || "";
  function assetsAndCopy(elements, ctx) {
    const variant = variantOf(elements[0]);
    if (!variant || TWO_COLUMN_VARIANTS.includes(variant)) return runParser(parse2, elements, ctx);
    return elements.flatMap((e) => mediaAndContent(e, ctx));
  }
  function talkingPoints(elements, ctx) {
    return runParser(parse3, elements, ctx);
  }
  function workListing([element], ctx) {
    const out2 = titleAndCta(ctx, element, ".block-work-listing__title", ".block-work-listing > a.button-v2, a.button-v2");
    const subtitle = text(element.querySelector(".block-work-listing__subtitle"));
    if (subtitle) out2.splice(out2.length && out2[0].tagName === "H2" ? 1 : 0, 0, el(ctx.document, "p", subtitle));
    const items = element.querySelector(".block-work-listing__items");
    if (items) out2.push(...runParser(parse4, [items], ctx));
    return out2;
  }
  function imageAndFact(elements, ctx) {
    return runParser(parse5, elements, ctx);
  }
  function featureTurntable(elements, ctx) {
    return runParser(parse6, elements, ctx);
  }
  function customListing([element], ctx) {
    const out2 = titleAndCta(ctx, element, ".block-custom-listing__title", ".block-custom-listing > a.button-v2, a.button-v2");
    const items = element.querySelector(".block-custom-listing__items");
    if (items) out2.push(...runParser(parse7, [items], ctx));
    return out2;
  }
  function titleWithCta([element], ctx) {
    return flatten(ctx.document, element);
  }
  function articlePostHeader([element], ctx) {
    const { document } = ctx;
    const img = image(document, pick(element, ".block-article-post-header__image", ".image-wrap img"));
    const textNodes = [];
    const back = pick(element, ".block-article-post-header__back-button");
    if (back && back.href) textNodes.push(linkParagraph(document, back.href, text(back) || "Back"));
    const title2 = pick(element, "h1");
    if (title2) textNodes.push(el(document, "h1", text(title2)));
    if (img && !img.alt && title2) img.alt = text(title2);
    const portrait = image(document, pick(element, ".author__portrait"));
    const details = [];
    const author = pick(element, ".author__text");
    if (author) {
      const parts = author.innerHTML.split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()).filter(Boolean);
      if (parts[0]) {
        const p = el(document, "p");
        const strong = el(document, "strong", parts[0]);
        p.append(strong);
        details.push(p);
      }
      if (parts[1]) details.push(el(document, "p", parts.slice(1).join(" ")));
    }
    element.querySelectorAll(".block-article-post-header__meta > div").forEach((meta) => {
      const label = text(meta.querySelector('[class*="description"]'));
      const value = text(meta.querySelector('[class*="time"], [class*="date"]:not([class*="description"])'));
      if (value) details.push(el(document, "p", label ? `${label}: ${value}` : value));
    });
    const cells = [
      [field(document, "image", img)],
      [field(document, "text", textNodes)]
    ];
    if (portrait || details.length) {
      cells.push([field(document, "portrait", portrait)]);
      cells.push([field(document, "details", details)]);
    }
    return [block(document, "article-header", cells)];
  }
  function titleAndContent([element], ctx) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('[class*="__social-links"]').forEach((n) => n.remove());
    const nodes = flatten(ctx.document, clone);
    return nodes;
  }
  function highlightedItemListing([element], ctx, titleSel = ".block-highlighted-item-listing__title") {
    const { document } = ctx;
    const out2 = titleAndCta(ctx, element, titleSel, ".block-highlighted-item-listing__cta-button");
    const cards = [...element.querySelectorAll(".universal-item-card, .block-highlighted-item-listing__cards > a, .block-highlighted-cases__projects > a")];
    if (cards.length) {
      const rows = cards.map((card) => {
        const img = image(document, card.querySelector("img"));
        const body = [];
        const meta = text(card.querySelector('[class*="__meta"], [class*="__eyebrow"]'));
        if (meta) body.push(el(document, "p", meta));
        const titleText = text(card.querySelector('h3, h4, [class*="__title"]'));
        if (titleText) {
          const h3 = el(document, "h3");
          if (card.href) {
            const a = el(document, "a", titleText);
            a.href = card.href;
            h3.append(a);
          } else {
            h3.textContent = titleText;
          }
          body.push(h3);
        }
        const desc = text(card.querySelector('[class*="__description"], [class*="__text"]'));
        if (desc) body.push(el(document, "p", desc));
        const ctaLabel = text(card.querySelector('[class*="__btn"], .cta-button'));
        if (ctaLabel && card.href) body.push(linkParagraph(document, card.href, ctaLabel));
        return [field(document, "image", img), field(document, "text", body)];
      });
      out2.push(block(document, "cards-related", rows));
    }
    return out2;
  }
  function getInTouch([element], ctx) {
    const { document } = ctx;
    const img = image(document, element.querySelector("img")) || backgroundImage(document, element.querySelector(".block-get-in-touch__image, .image--bg"));
    const body = [];
    const heading2 = pick(element, ".block-get-in-touch__heading", "h2");
    if (heading2) body.push(el(document, "h2", text(heading2)));
    const role = text(pick(element, ".block-get-in-touch__subtitle"));
    if (role) body.push(el(document, "p", role));
    const name = text(pick(element, ".block-get-in-touch__person-title", "h3"));
    if (name) body.push(el(document, "h3", name));
    const label = text(pick(element, ".cta-bar__label")) || "Get in touch";
    body.push(linkParagraph(document, `https://www.dept.global/${ctx.locale ? `${ctx.locale}/` : ""}contact/`, label, true));
    return [block(document, "contact-specialist", [
      [field(document, "image", img)],
      [field(document, "text", body)]
    ])];
  }
  function ctaText([element], ctx) {
    const heading2 = element.querySelector("h1, h2, h3, h4, h5, h6, p");
    if (!heading2) return flatten(ctx.document, element);
    const out2 = [];
    const parts = heading2.innerHTML.split(/(?:<br\s*\/?>\s*){1,}/i);
    parts.forEach((part) => {
      const holder = ctx.document.createElement("div");
      holder.innerHTML = part;
      const only = holder.children.length === 1 && holder.firstElementChild.tagName === "A" && text(holder) === text(holder.firstElementChild);
      if (!text(holder)) return;
      if (only) {
        const a = holder.firstElementChild;
        out2.push(linkParagraph(ctx.document, a.href, text(a)));
      } else {
        const p = ctx.document.createElement("p");
        p.innerHTML = holder.innerHTML;
        out2.push(...flatten(ctx.document, p));
      }
    });
    return out2;
  }
  function videoSource(document, node) {
    const iframe = node.querySelector("iframe[src], iframe[data-src]");
    let url = "";
    if (iframe) {
      const src = iframe.getAttribute("src") || iframe.getAttribute("data-src") || "";
      const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/]+)/);
      const vimeo = src.match(/player\.vimeo\.com\/video\/(\d+)/);
      if (yt) url = `https://www.youtube.com/watch?v=${yt[1]}`;
      else if (vimeo) url = `https://vimeo.com/${vimeo[1]}`;
      else url = src;
    }
    const videoEl = node.matches("video") ? node : node.querySelector("video");
    if (!url && videoEl) {
      const source = videoEl.querySelector("source[src]");
      url = videoEl.getAttribute("src") || source && source.getAttribute("src") || "";
    }
    if (url && url.startsWith("/")) url = `https://www.dept.global${url}`;
    const posterEl = node.querySelector(".plyr__poster");
    let poster = posterEl ? backgroundImage(document, posterEl) : null;
    if (!poster && videoEl && videoEl.getAttribute("poster")) {
      poster = document.createElement("img");
      poster.src = videoEl.getAttribute("poster");
      poster.alt = "";
    }
    return { url, poster };
  }
  function videoBlock(document, node, textNodes = []) {
    const { url, poster } = videoSource(document, node);
    if (!url) return null;
    const cells = [
      [field(document, "uri", linkParagraph(document, url, url))]
    ];
    if (poster || textNodes.length) cells.push([field(document, "poster", poster)]);
    if (textNodes.length) cells.push([field(document, "text", textNodes)]);
    return block(document, "video-embed", cells);
  }
  var PLAYER = '.plyr, .video, video, iframe[src*="youtube"], iframe[src*="vimeo"]';
  function mediaAndContent(element, ctx) {
    const { document } = ctx;
    const clone = element.cloneNode(true);
    const players = [...clone.querySelectorAll(PLAYER)].filter((p) => !p.parentElement || !p.parentElement.closest(PLAYER));
    if (!players.length) return flatten(document, clone);
    const blocks = players.map((p) => videoBlock(document, p));
    players.forEach((p, i) => {
      const marker = document.createElement("p");
      marker.textContent = `@@video-${i}@@`;
      p.replaceWith(marker);
    });
    const out2 = [];
    flatten(document, clone).forEach((n) => {
      const m = n.textContent.trim().match(/^@@video-(\d+)@@$/);
      if (m) {
        if (blocks[Number(m[1])]) out2.push(blocks[Number(m[1])]);
      } else {
        out2.push(n);
      }
    });
    return out2;
  }
  function video([element], ctx) {
    const vb = videoBlock(ctx.document, element);
    return vb ? [vb] : flatten(ctx.document, element);
  }
  function jumbotron([element], ctx) {
    const { document } = ctx;
    const title2 = text(element.querySelector(".jumbotron__title, h1, h2"));
    const heading2 = title2 ? [el(document, "h2", title2)] : [];
    const vb = videoBlock(document, element, heading2);
    if (vb) return [vb];
    return flatten(document, element);
  }
  function authorLines(document, author) {
    if (!author) return [];
    const parts = author.innerHTML.split(/<br\s*\/?>/i).map((x) => x.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()).filter(Boolean);
    const out2 = [];
    if (parts[0]) {
      const p = el(document, "p");
      p.append(el(document, "strong", parts[0]));
      out2.push(p);
    }
    if (parts[1]) out2.push(el(document, "p", parts.slice(1).join(" ")));
    return out2;
  }
  function insightIntro([element], ctx) {
    const { document } = ctx;
    const img = image(document, pick(element, '[class*="__featured"]', "img:not(.author__portrait)"));
    const title2 = pick(element, "h1");
    const textNodes = [];
    const badge = text(pick(element, '[class*="__badge"]'));
    if (badge) textNodes.push(el(document, "p", badge));
    if (title2) textNodes.push(el(document, "h1", text(title2)));
    if (img && !img.alt && title2) img.alt = text(title2);
    const portrait = image(document, pick(element, ".author__portrait"));
    const details = authorLines(document, pick(element, ".author__text"));
    element.querySelectorAll('[class*="__insight-meta-item"]').forEach((item) => {
      const label = text(item.querySelector('[class*="meta-label"]'));
      const value = [...item.querySelectorAll("span")].filter((sp) => !sp.matches('[class*="meta-label"]')).map(text).join(" ").trim();
      if (value) details.push(el(document, "p", label ? `${label}: ${value}` : value));
    });
    const cells = [[field(document, "image", img)], [field(document, "text", textNodes)]];
    if (portrait || details.length) {
      cells.push([field(document, "portrait", portrait)]);
      cells.push([field(document, "details", details)]);
    }
    return [block(document, "article-header (intro)", cells)];
  }
  function insightCta([element], ctx) {
    const { document } = ctx;
    const img = image(document, element.querySelector("img"));
    const body = [];
    const title2 = text(pick(element, '[class*="__title"]'));
    if (title2) body.push(el(document, "h2", title2));
    const desc = text(pick(element, 'p[class*="__text"]'));
    if (desc) body.push(el(document, "p", desc));
    const cta3 = pick(element, 'a[class*="__cta"]', "a.button-v2", "a[href]");
    if (cta3 && cta3.href) body.push(linkParagraph(document, cta3.href, text(cta3), true));
    return [block(document, "cta-banner", [[field(document, "image", img)], [field(document, "text", body)]])];
  }
  function stats([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const title2 = text(pick(element, '[class*="stats-and-copy__title"]', '[class*="stats-panel__title"]'));
    if (title2) out2.push(el(document, "h2", title2));
    let items = [...element.querySelectorAll(".stats-item")];
    if (!items.length) items = [...element.querySelectorAll('li[class*="__card"]')];
    const rows = items.map((item) => {
      const value = text(item.querySelector('.block-stats-item__stat, .stats-item__stat, [class*="card-title"]'));
      const label = text(item.querySelector('.stats-item__heading, [class*="card-subtitle"]'));
      if (!value && !label) return null;
      const nodes = [];
      if (value) nodes.push(el(document, "p", value));
      if (label) nodes.push(el(document, "p", label));
      return [field(document, "text", nodes)];
    }).filter(Boolean);
    if (rows.length) out2.push(block(document, "stats-grid", rows));
    else out2.push(...flatten(document, element));
    return out2;
  }
  function nextCase([element], ctx) {
    const { document } = ctx;
    const img = image(document, element.querySelector("img"));
    const body = [];
    const label = text(element.querySelector(".next-case__label"));
    if (label) body.push(el(document, "p", label));
    const client = text(element.querySelector(".next-case__client"));
    if (client) body.push(el(document, "h2", client));
    const title2 = text(element.querySelector(".next-case__title"));
    if (title2) body.push(el(document, "p", title2));
    const tags = [...element.querySelectorAll(".next-case__tags li")].map((li) => text(li).replace(/[()]/g, "").trim()).filter(Boolean);
    if (tags.length) body.push(el(document, "p", tags.join(", ")));
    const cta3 = element.querySelector("a[href]");
    if (cta3) body.push(linkParagraph(document, cta3.href, text(cta3) || "View Work"));
    return [block(document, "next-case", [[field(document, "image", img)], [field(document, "text", body)]])];
  }
  function panelSplit([element], ctx) {
    const { document } = ctx;
    const left = element.querySelector('[class*="__left"]');
    const right = element.querySelector('[class*="__right"]');
    if (!left || !right) return flatten(document, element);
    return [block(document, "panel-split", [
      [field(document, "left", flatten(document, left))],
      [field(document, "right", flatten(document, right))]
    ])];
  }
  function caseIntro([element], ctx) {
    const { document } = ctx;
    const categories = element.querySelector('[class*="__category-container"]');
    const left = categories ? flatten(document, categories) : [];
    const clone = element.cloneNode(true);
    const cat = clone.querySelector('[class*="__category-container"]');
    if (cat) cat.remove();
    const right = flatten(document, clone);
    if (!left.length) return right;
    return [block(document, "panel-split (intro)", [
      [field(document, "left", left)],
      [field(document, "right", right)]
    ])];
  }
  function highlightedCases([element], ctx) {
    return highlightedItemListing([element], ctx, ".block-highlighted-cases__heading");
  }
  function casePostHeader([element], ctx) {
    const { document } = ctx;
    const out2 = [];
    const back = element.querySelector('a[class*="back"]');
    if (back && back.href) out2.push(linkParagraph(document, back.href, text(back) || "Back"));
    const h1 = element.querySelector("h1");
    if (h1) out2.push(el(document, "h1", text(h1)));
    return out2.length ? out2 : flatten(document, element);
  }
  function quote([element], ctx) {
    const { document } = ctx;
    const q = text(element.querySelector('.quote__heading, blockquote, [class*="__quote-text"], h2, h3'));
    const by = text(element.querySelector('.quote__paragraph, [class*="__author"], cite'));
    if (!q) return flatten(document, element);
    const out2 = [el(document, "h2", q)];
    if (by && by !== q) out2.push(el(document, "p", by));
    return out2;
  }
  var HANDLERS6 = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({
    "scrolly-video-intro": { handler: scrollyVideoIntro, style: "dept-hero" },
    "statement-v2": { style: "dept-statement" },
    "assets-and-copy": {
      handler: assetsAndCopy,
      style: (node) => {
        if (!variantOf(node) || TWO_COLUMN_VARIANTS.includes(variantOf(node))) return "dept-features";
        const first = node.querySelector("h1, h2, h3, h4, p, img, picture, video, iframe, .plyr");
        const textFirst = first && /^(H\d|P)$/.test(first.tagName) && text(first);
        return `dept-assets-and-copy, dept-variant-${variantOf(node)}${textFirst ? ", dept-text-first" : ""}`;
      },
      // only the two-column rows (homepage feature rows) form one block; every other variant
      // stays its own section, like on the source
      group: true,
      groupKey: (node) => !variantOf(node) || TWO_COLUMN_VARIANTS.includes(variantOf(node)) ? `two-column:${variantOf(node)}` : null
    },
    "talking-points": { handler: talkingPoints, style: "dept-services" },
    "work-listing": { handler: workListing, style: "dept-work" },
    "title-with-cta": { handler: titleWithCta, style: "dept-solutions", joinNext: ["image-and-fact"] },
    "image-and-fact": { handler: imageAndFact, style: "dept-solutions", group: true },
    "feature-turntable": { handler: featureTurntable, style: "dept-culture" },
    "custom-listing": { handler: customListing, style: "dept-insights" },
    "text-divider": { prefixNext: true },
    "article-post-header": { handler: articlePostHeader },
    "title-and-content": { handler: titleAndContent },
    "highlighted-item-listing": { handler: highlightedItemListing },
    "get-in-touch": { handler: getInTouch },
    "cta-text": { handler: ctaText },
    video: { handler: video },
    jumbotron: { handler: jumbotron },
    "insight-intro": { handler: insightIntro, style: "dept-article-post-header" },
    "insight-cta": { handler: insightCta },
    "stats-panel": { handler: stats },
    "stats-and-copy": { handler: stats },
    "next-case": { handler: nextCase },
    "panel-with-rich-text": { handler: panelSplit },
    "panel-with-image-and-rich-text": { handler: panelSplit },
    "highlighted-cases": { handler: highlightedCases, style: "dept-highlighted-item-listing" },
    "case-post-header": { handler: casePostHeader },
    "case-intro": { handler: caseIntro },
    quote: { handler: quote },
    "case-quote": { handler: quote, style: "dept-quote" }
  }, HANDLERS), HANDLERS2), HANDLERS3), HANDLERS4), HANDLERS5), HANDLERS7), HANDLERS8);

  // tools/importer/import-dept-site-test-final.js
  var LOCALES = ["en-au-b", "en-au", "en-in", "en-nl", "en-uki", "de-dach", "en-dk", "latam", "macedonia", "en"];
  var FRAGMENT_LOCALE = { "en-au-b": "en-au", en: "" };
  var SKIP = /* @__PURE__ */ new Set(["flyout-drawer", "pardot-forms", "page-overlay", "tracking-blockers", "navigation", "footer-v2"]);
  var THEME = /(?:__theme|background-color)--([a-zA-Z]+)\b/;
  var DARK2 = ["onyxgrey", "richblack", "black", "darkgrey", "charcoal"];
  function classify(url) {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const locale = LOCALES.includes(parts[0]) ? parts[0] : "";
    const rest = locale ? parts.slice(1) : parts;
    let type = "page";
    if (!rest.length) type = "home";
    else if (rest.length > 1) [type] = rest;
    return { locale, type };
  }
  function componentName(node) {
    const classes = [...node.classList];
    const blockClass = classes.find((c) => c.startsWith("block-"));
    if (blockClass) return blockClass.replace(/^block-/, "").replace(/__.*$/, "");
    return (classes[0] || node.tagName.toLowerCase()).replace(/__.*$/, "");
  }
  function themeStyles(node) {
    let m = node.className.match(THEME);
    if (!m && node.getAttribute("data-theme")) m = [null, node.getAttribute("data-theme")];
    if (!m) {
      const COLUMN = /__(left|right|column)--(richBlack|onyxGrey)\b/;
      const column = [...node.children].find((child) => COLUMN.test(child.className));
      m = column && [null, column.className.match(COLUMN)[2]];
    }
    const color = m && m[1].toLowerCase();
    if (!color || color === "white") return [];
    return DARK2.includes(color) ? [`dept-bg-${color}`, "dept-dark"] : [`dept-bg-${color}`];
  }
  function buildSections(sourceMain) {
    const sections = [];
    let prefix = [];
    [...sourceMain.children].forEach((node) => {
      const name = componentName(node);
      if (SKIP.has(name)) return;
      if (!text(node) && !node.querySelector("img, picture, video, iframe")) return;
      const def = HANDLERS6[name] || {};
      if (def.prefixNext) {
        prefix.push(node);
        return;
      }
      const prev = sections[sections.length - 1];
      const prevPart = prev && prev.parts[prev.parts.length - 1];
      if (prevPart && !prefix.length) {
        const prevDef = HANDLERS6[prevPart.name] || {};
        const key = def.groupKey ? def.groupKey(node) : "";
        const sameGroup = key !== null && (!def.groupKey || def.groupKey(prevPart.elements[0]) === key);
        if (prevPart.name === name && def.group && sameGroup) {
          prevPart.elements.push(node);
          return;
        }
        if ((prevDef.joinNext || []).includes(name)) {
          prev.parts.push({ name, elements: [node] });
          return;
        }
      }
      sections.push({ parts: [{ name, elements: [node] }], prefix, theme: themeStyles(node) });
      prefix = [];
    });
    if (prefix.length && sections.length) sections[sections.length - 1].parts.push({ name: "text-divider", elements: prefix });
    return sections;
  }
  function addMetadata(container, document, meta) {
    container.append(WebImporter.Blocks.getMetadataBlock(document, meta));
  }
  var import_dept_site_test_final_default = {
    transform: (payload) => {
      var _a;
      const { document, url, params } = payload;
      const originalURL = params.originalURL || url;
      const { locale, type } = classify(originalURL);
      const localePrefix = locale ? `/dept/${locale}` : "/dept";
      const ctx = {
        document,
        url,
        params,
        locale,
        type,
        localePrefix
      };
      const body = document.body;
      const head = (sel, attr = "content") => {
        const n = document.querySelector(sel);
        return n ? (n.getAttribute(attr) || "").trim() : "";
      };
      const meta = {
        Title: (document.title || head('meta[property="og:title"]')).trim()
      };
      const description = head('meta[name="description"]') || head('meta[property="og:description"]');
      if (description) meta.Description = description;
      const ogImage = head('meta[property="og:image"]');
      if (ogImage) {
        const img = document.createElement("img");
        img.src = ogImage;
        meta.Image = img;
      }
      meta.template = "dept";
      const brandDesign = !!document.querySelector('main [class*="text-sans-"]');
      meta.theme = brandDesign ? `dept-${type}, dept-brand` : `dept-${type}`;
      const fragmentLocale = (_a = FRAGMENT_LOCALE[locale]) != null ? _a : locale;
      const fragmentPrefix = fragmentLocale ? `/dept/${fragmentLocale}` : "/dept";
      meta.nav = `${fragmentPrefix}/nav`;
      meta.footer = `${fragmentPrefix}/footer`;
      try {
        transform("beforeTransform", body, payload);
      } catch (e) {
        console.error("cleanup failed", e);
      }
      const sourceMain = document.querySelector("main") || body;
      if (sourceMain.querySelector(":scope > .four-oh-four, .four-oh-four")) {
        throw new Error("source page is a 404 (not found) page");
      }
      const sections = buildSections(sourceMain);
      const out2 = document.createElement("div");
      const report = [];
      sections.forEach((section) => {
        const nodes = [];
        section.prefix.forEach((p) => nodes.push(...flatten(document, p)));
        const styles = [];
        section.parts.forEach(({ name, elements }) => {
          const def = HANDLERS6[name] || {};
          report.push(name);
          let result;
          try {
            result = def.handler ? def.handler(elements, ctx) : elements.flatMap((e) => flatten(document, e));
          } catch (e) {
            console.error(`handler ${name} failed`, e);
            result = elements.flatMap((x) => flatten(document, x));
          }
          nodes.push(...result);
          const style = (typeof def.style === "function" ? def.style(elements[0]) : def.style) || `dept-${name}`;
          style.split(",").map((x) => x.trim()).forEach((x) => {
            if (x && !styles.includes(x)) styles.push(x);
          });
        });
        styles.push(...section.theme);
        if (!nodes.length) return;
        if (out2.childNodes.length) out2.append(document.createElement("hr"));
        nodes.forEach((n) => out2.append(n));
        out2.append(block(document, "Section Metadata", { style: styles.join(", ") }));
      });
      out2.querySelectorAll("a[href]").forEach((a) => {
        const href = localHref(a.getAttribute("href"));
        if (href) a.setAttribute("href", href);
      });
      out2.append(document.createElement("hr"));
      addMetadata(out2, document, meta);
      body.innerHTML = "";
      body.append(...out2.childNodes);
      try {
        transform("afterTransform", body, payload);
      } catch (e) {
        console.error("cleanup failed", e);
      }
      WebImporter.rules.transformBackgroundImages(body, document);
      WebImporter.rules.adjustImageUrls(body, url, originalURL);
      const images = useDamImages(body);
      const livePath = new URL(originalURL).pathname.replace(/\/+$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(`/dept${livePath || "/index"}`);
      return [{
        element: body,
        path,
        report: {
          title: meta.Title,
          template: `dept-${type}`,
          locale: locale || "global",
          components: report,
          // components without an entry (style-only entries such as statement-v2 are intended)
          fallback: report.filter((n) => !HANDLERS6[n]),
          images
        }
      }];
    }
  };
  return __toCommonJS(import_dept_site_test_final_exports);
})();
