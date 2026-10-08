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

  // tools/importer/import-dept-site.js
  var import_dept_site_exports = {};
  __export(import_dept_site_exports, {
    classify: () => classify,
    default: () => import_dept_site_default
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
    const title = el2.querySelector('.block-assets-and-copy__title, [class*="assets-and-copy__title"]');
    const content = el2.querySelector(".block-assets-and-copy__content") || el2;
    const descriptions = [...content.querySelectorAll('p.block-assets-and-copy__text, p[class*="assets-and-copy__text"]')];
    const ctaLinks = [...content.querySelectorAll("a.button-v2, a[href]")].filter((a, i, arr) => arr.indexOf(a) === i);
    const col1 = [];
    if (image2) col1.push(image2);
    const col2 = [];
    if (title && title.textContent.trim()) {
      const heading2 = document.createElement("h2");
      const clone = title.cloneNode(true);
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
    const title = element.querySelector(".block-talking-points__title");
    if (title && title.textContent.trim()) {
      const h2 = document.createElement("h2");
      h2.textContent = title.textContent.replace(/\s+/g, " ").trim();
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
        const cta = document.createElement("a");
        cta.href = link.getAttribute("href");
        cta.textContent = titleText || "Learn more";
        p.appendChild(cta);
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
    const title = row.querySelector(".block-image-and-fact__title");
    const text2 = row.querySelector(".block-image-and-fact__text");
    const cta = row.querySelector("a.block-image-and-fact__cta, a.button-v2");
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
    if (title && title.textContent.trim()) {
      const h3 = document.createElement("h3");
      h3.textContent = title.textContent.trim();
      parts.push(h3);
    }
    if (text2 && text2.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = text2.textContent.replace(/\s+/g, " ").trim();
      parts.push(p);
    }
    if (cta && cta.getAttribute("href")) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.replace(/\s+/g, " ").trim() || "Learn more";
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
    slides.forEach((slide) => {
      const image2 = slide.querySelector("img.block-feature-turntable__item-image");
      const title = slide.querySelector(".block-feature-turntable__item-title");
      const description = slide.querySelector(".block-feature-turntable__item-description");
      const mediaFrag = document.createDocumentFragment();
      if (image2) {
        mediaFrag.appendChild(document.createComment(" field:media_image "));
        mediaFrag.appendChild(image2);
      }
      const contentFrag = document.createDocumentFragment();
      if (title || description) {
        contentFrag.appendChild(document.createComment(" field:content_text "));
      }
      if (title) {
        contentFrag.appendChild(title);
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
    const out = document.createElement("img");
    out.src = src;
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function backgroundImage(document, node) {
    if (!node) return null;
    const style = node.getAttribute("style") || "";
    const m = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
    const src = m && m[1] || node.getAttribute("data-bg") || node.getAttribute("data-background-image");
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = "";
    return out;
  }
  function flatten(document, source) {
    const root = source.cloneNode(true);
    root.querySelectorAll(DROP_SELECTOR).forEach((n) => n.remove());
    root.querySelectorAll('[aria-hidden="true"]').forEach((n) => {
      if (!n.querySelector("img")) n.remove();
    });
    const out = [];
    let para = null;
    const flush = () => {
      if (para && (text(para) || para.querySelector("img"))) out.push(para);
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
        if (BLOCK_TAGS.has(tag)) {
          flush();
          if (text(child) || child.querySelector("img") || tag === "HR") out.push(child);
          return;
        }
        if (tag === "IMG") {
          const img = image(document, child);
          if (img) {
            flush();
            const p = document.createElement("p");
            p.append(img);
            out.push(p);
          }
          return;
        }
        if (tag === "PICTURE") {
          const img = image(document, child.querySelector("img"));
          if (img) {
            flush();
            const p = document.createElement("p");
            p.append(img);
            out.push(p);
          }
          return;
        }
        if (tag === "VIDEO") {
          const src = child.getAttribute("src") || child.querySelector("source") && child.querySelector("source").getAttribute("src");
          if (src) {
            flush();
            out.push(linkParagraph(document, src, src));
          }
          return;
        }
        if (tag === "IFRAME") {
          flush();
          const src = child.getAttribute("src") || child.getAttribute("data-src");
          if (src) out.push(linkParagraph(document, src, src));
          return;
        }
        if (tag === "A") {
          if (child.querySelector("h1, h2, h3, h4, h5, h6, p, div, img, picture")) {
            flush();
            walk(child);
            const label = text(child.querySelector("h1, h2, h3, h4, h5, h6")) || text(child);
            if (child.href && label) out.push(linkParagraph(document, child.href, label));
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
          out.push(p);
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
    out.forEach((n) => {
      [n, ...n.querySelectorAll("*")].forEach((e) => {
        [...e.attributes].forEach((a) => {
          if (!["href", "src", "alt", "colspan", "rowspan"].includes(a.name)) e.removeAttribute(a.name);
        });
      });
    });
    return out;
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
    source.childNodes.forEach((n) => {
      if (n.nodeType === 1 && n.matches(".is-fancy-serif, em, i")) h.append(el(document, "em", text(n)));
      else h.append(n.textContent.replace(/\s+/g, " "));
    });
    h.innerHTML = h.innerHTML.trim();
    return h;
  }
  function titleAndCta(ctx, element, titleSel, ctaSel) {
    const out = [];
    const title = pick(element, titleSel);
    if (title && text(title)) out.push(heading(ctx.document, title, "h2"));
    const cta = pick(element, ctaSel);
    if (cta && cta.href && text(cta)) out.push(linkParagraph(ctx.document, cta.href, text(cta)));
    return out;
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
    const out = titleAndCta(ctx, element, ".block-work-listing__title", ".block-work-listing > a.button-v2, a.button-v2");
    const items = element.querySelector(".block-work-listing__items");
    if (items) out.push(...runParser(parse4, [items], ctx));
    return out;
  }
  function imageAndFact(elements, ctx) {
    return runParser(parse5, elements, ctx);
  }
  function featureTurntable(elements, ctx) {
    return runParser(parse6, elements, ctx);
  }
  function customListing([element], ctx) {
    const out = titleAndCta(ctx, element, ".block-custom-listing__title", ".block-custom-listing > a.button-v2, a.button-v2");
    const items = element.querySelector(".block-custom-listing__items");
    if (items) out.push(...runParser(parse7, [items], ctx));
    return out;
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
    const title = pick(element, "h1");
    if (title) textNodes.push(el(document, "h1", text(title)));
    if (img && !img.alt && title) img.alt = text(title);
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
    const out = titleAndCta(ctx, element, titleSel, ".block-highlighted-item-listing__cta-button");
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
      out.push(block(document, "cards-related", rows));
    }
    return out;
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
    const out = [];
    const parts = heading2.innerHTML.split(/(?:<br\s*\/?>\s*){1,}/i);
    parts.forEach((part) => {
      const holder = ctx.document.createElement("div");
      holder.innerHTML = part;
      const only = holder.children.length === 1 && holder.firstElementChild.tagName === "A" && text(holder) === text(holder.firstElementChild);
      if (!text(holder)) return;
      if (only) {
        const a = holder.firstElementChild;
        out.push(linkParagraph(ctx.document, a.href, text(a)));
      } else {
        const p = ctx.document.createElement("p");
        p.innerHTML = holder.innerHTML;
        out.push(...flatten(ctx.document, p));
      }
    });
    return out;
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
    const out = [];
    flatten(document, clone).forEach((n) => {
      const m = n.textContent.trim().match(/^@@video-(\d+)@@$/);
      if (m) {
        if (blocks[Number(m[1])]) out.push(blocks[Number(m[1])]);
      } else {
        out.push(n);
      }
    });
    return out;
  }
  function video([element], ctx) {
    const vb = videoBlock(ctx.document, element);
    return vb ? [vb] : flatten(ctx.document, element);
  }
  function jumbotron([element], ctx) {
    const { document } = ctx;
    const title = text(element.querySelector(".jumbotron__title, h1, h2"));
    const heading2 = title ? [el(document, "h2", title)] : [];
    const vb = videoBlock(document, element, heading2);
    if (vb) return [vb];
    return flatten(document, element);
  }
  function authorLines(document, author) {
    if (!author) return [];
    const parts = author.innerHTML.split(/<br\s*\/?>/i).map((x) => x.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()).filter(Boolean);
    const out = [];
    if (parts[0]) {
      const p = el(document, "p");
      p.append(el(document, "strong", parts[0]));
      out.push(p);
    }
    if (parts[1]) out.push(el(document, "p", parts.slice(1).join(" ")));
    return out;
  }
  function insightIntro([element], ctx) {
    const { document } = ctx;
    const img = image(document, pick(element, '[class*="__featured"]', "img:not(.author__portrait)"));
    const title = pick(element, "h1");
    const textNodes = [];
    const badge = text(pick(element, '[class*="__badge"]'));
    if (badge) textNodes.push(el(document, "p", badge));
    if (title) textNodes.push(el(document, "h1", text(title)));
    if (img && !img.alt && title) img.alt = text(title);
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
    const title = text(pick(element, '[class*="__title"]'));
    if (title) body.push(el(document, "h2", title));
    const desc = text(pick(element, 'p[class*="__text"]'));
    if (desc) body.push(el(document, "p", desc));
    const cta = pick(element, 'a[class*="__cta"]', "a.button-v2", "a[href]");
    if (cta && cta.href) body.push(linkParagraph(document, cta.href, text(cta), true));
    return [block(document, "cta-banner", [[field(document, "image", img)], [field(document, "text", body)]])];
  }
  function stats([element], ctx) {
    const { document } = ctx;
    const out = [];
    const title = text(pick(element, '[class*="stats-and-copy__title"]', '[class*="stats-panel__title"]'));
    if (title) out.push(el(document, "h2", title));
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
    if (rows.length) out.push(block(document, "stats-grid", rows));
    else out.push(...flatten(document, element));
    return out;
  }
  function nextCase([element], ctx) {
    const { document } = ctx;
    const img = image(document, element.querySelector("img"));
    const body = [];
    const label = text(element.querySelector(".next-case__label"));
    if (label) body.push(el(document, "p", label));
    const client = text(element.querySelector(".next-case__client"));
    if (client) body.push(el(document, "h2", client));
    const title = text(element.querySelector(".next-case__title"));
    if (title) body.push(el(document, "p", title));
    const tags = [...element.querySelectorAll(".next-case__tags li")].map((li) => text(li).replace(/[()]/g, "").trim()).filter(Boolean);
    if (tags.length) body.push(el(document, "p", tags.join(", ")));
    const cta = element.querySelector("a[href]");
    if (cta) body.push(linkParagraph(document, cta.href, text(cta) || "View Work"));
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
    const out = [];
    const back = element.querySelector('a[class*="back"]');
    if (back && back.href) out.push(linkParagraph(document, back.href, text(back) || "Back"));
    const h1 = element.querySelector("h1");
    if (h1) out.push(el(document, "h1", text(h1)));
    return out.length ? out : flatten(document, element);
  }
  function quote([element], ctx) {
    const { document } = ctx;
    const q = text(element.querySelector('.quote__heading, blockquote, [class*="__quote-text"], h2, h3'));
    const by = text(element.querySelector('.quote__paragraph, [class*="__author"], cite'));
    if (!q) return flatten(document, element);
    const out = [el(document, "h2", q)];
    if (by && by !== q) out.push(el(document, "p", by));
    return out;
  }
  var HANDLERS = {
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
  };

  // tools/importer/import-dept-site.js
  var LOCALES = ["en-au-b", "en-au", "en-in", "en-nl", "en-uki", "de-dach", "en-dk", "latam", "macedonia", "en"];
  var FRAGMENT_LOCALE = { "en-au-b": "en-au", en: "" };
  var SKIP = /* @__PURE__ */ new Set(["flyout-drawer", "pardot-forms", "page-overlay", "tracking-blockers", "navigation", "footer-v2"]);
  var THEME = /(?:__theme|background-color)--([a-zA-Z]+)\b/;
  var DARK = ["onyxgrey", "richblack", "black", "darkgrey", "charcoal"];
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
    if (!m) {
      const column = [...node.children].find((child) => /--(richBlack|onyxGrey)\b/.test(child.className));
      m = column && column.className.match(/--(richBlack|onyxGrey)\b/);
    }
    const color = m && m[1].toLowerCase();
    if (!color || color === "white") return [];
    return DARK.includes(color) ? [`dept-bg-${color}`, "dept-dark"] : [`dept-bg-${color}`];
  }
  function buildSections(sourceMain) {
    const sections = [];
    let prefix = [];
    [...sourceMain.children].forEach((node) => {
      const name = componentName(node);
      if (SKIP.has(name)) return;
      if (!text(node) && !node.querySelector("img, picture, video, iframe")) return;
      const def = HANDLERS[name] || {};
      if (def.prefixNext) {
        prefix.push(node);
        return;
      }
      const prev = sections[sections.length - 1];
      const prevPart = prev && prev.parts[prev.parts.length - 1];
      if (prevPart && !prefix.length) {
        const prevDef = HANDLERS[prevPart.name] || {};
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
  var import_dept_site_default = {
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
      const out = document.createElement("div");
      const report = [];
      sections.forEach((section, index) => {
        if (index > 0) out.append(document.createElement("hr"));
        const nodes = [];
        section.prefix.forEach((p) => nodes.push(...flatten(document, p)));
        const styles = [];
        section.parts.forEach(({ name, elements }) => {
          const def = HANDLERS[name] || {};
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
        nodes.forEach((n) => out.append(n));
        out.append(block(document, "Section Metadata", { style: styles.join(", ") }));
      });
      out.querySelectorAll("a[href]").forEach((a) => {
        const href = localHref(a.getAttribute("href"));
        if (href) a.setAttribute("href", href);
      });
      out.append(document.createElement("hr"));
      addMetadata(out, document, meta);
      body.innerHTML = "";
      body.append(...out.childNodes);
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
          fallback: report.filter((n) => !HANDLERS[n] || !HANDLERS[n].handler),
          images
        }
      }];
    }
  };
  return __toCommonJS(import_dept_site_exports);
})();
