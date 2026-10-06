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

  // tools/importer/import-term-insurance-redesign.js
  var import_term_insurance_redesign_exports = {};
  __export(import_term_insurance_redesign_exports, {
    default: () => import_term_insurance_redesign_default
  });

  // tools/importer/parsers/hero-calculator.js
  function hinted(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function parse(element, { document: document2 }) {
    const photo = element.querySelector(".authorable-personimg img.cmp-image__image, .authorable-personimg img[src]") || element.querySelector('img[alt="banner"]');
    const promo = [];
    const logo = element.querySelector(".banner-logo-image img.cmp-image__image, .banner-logo-image img[src]");
    if (logo) {
      const src = logo.getAttribute("src") || logo.getAttribute("data-src") || "";
      if (/\.svg$/i.test(src)) logo.setAttribute("src", `${src}?v=1`);
      promo.push(logo);
    }
    const rateCount = element.querySelector(".banner-rating .ratecount");
    const customerCount = element.querySelector(".banner-rating .customer-count p");
    if (rateCount || customerCount) {
      const p = document2.createElement("p");
      if (rateCount) p.append(`${rateCount.textContent.trim()} `);
      if (customerCount) p.append(...[...customerCount.childNodes].map((n) => n.cloneNode(true)));
      promo.push(p);
    }
    const promoText = element.querySelector(".banner-content-desktop-text .cmp-text") || element.querySelector(".leadproxytext:not(.term-and-condition-text) .cmp-text");
    if (promoText) {
      [...promoText.children].forEach((child) => {
        if (child.textContent.replace(/ /g, " ").trim()) promo.push(child);
      });
    }
    const fine = element.querySelectorAll(".term-and-condition-text .cmp-text > *");
    fine.forEach((f) => {
      if (f.textContent.trim()) promo.push(f);
    });
    const calc = [];
    const calcTitle = element.querySelector(".tic-premium-calc-title h2, .tic-premium-calc-title h1, .tic-premium-calc-title h3");
    if (calcTitle) calc.push(calcTitle);
    const calcBtn = element.querySelector("a.tic-premium-calc-btn");
    if (calcBtn) {
      const journey = element.querySelector('a[href*="sellonline.tataaia.com"]') || document2.querySelector('a.productBanner-btn[href*="sellonline.tataaia.com"]');
      const a = document2.createElement("a");
      const href = calcBtn.getAttribute("href") || "";
      a.href = journey && journey.getAttribute("href") || (href && !href.startsWith("javascript") ? href : "https://sellonline.tataaia.com/app/products?product=SRP");
      a.textContent = calcBtn.textContent.trim() || "Calculate Premium";
      const p = document2.createElement("p");
      p.append(a);
      calc.push(p);
    }
    if (!photo && !promo.length && !calc.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [
      [hinted(document2, "image", photo)],
      [hinted(document2, "text", promo)],
      [hinted(document2, "calculator", calc)]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-calculator", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-pricing.js
  function hinted2(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function parse2(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll(".cmp-teaser")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".teaser, .leadproxyteaser")];
    const cells = [];
    tiles.forEach((tile) => {
      const bg = tile.querySelector(".background-image img.desktopbg[src], .background-image img[src]");
      const desc = tile.querySelector(".cmp-teaser__description") || tile;
      const tagEl = desc.querySelector(".blueText");
      const amountEl = desc.querySelector(".lead");
      const labelEl = desc.querySelector(".term-text");
      const priceEl = desc.querySelector(".whiteText");
      const cta = tile.querySelector("a.cmp-teaser__action-link, .cmp-teaser__action-container a");
      const text = [];
      if (amountEl) {
        const h = document2.createElement("h3");
        h.textContent = amountEl.textContent.trim();
        text.push(h);
      }
      if (labelEl) {
        const p = document2.createElement("p");
        p.textContent = labelEl.textContent.trim();
        text.push(p);
      }
      if (priceEl) {
        const p = document2.createElement("p");
        p.append(...[...priceEl.childNodes].map((n) => n.cloneNode(true)));
        text.push(p);
      }
      desc.querySelectorAll(":scope > p").forEach((p) => {
        if (p.querySelector(".blueText, .lead, .term-text, .whiteText")) return;
        if (p.textContent.trim()) text.push(p);
      });
      if (cta) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.trim();
        p.append(a);
        text.push(p);
      }
      if (!text.length && !bg) return;
      cells.push([
        hinted2(document2, "image", bg),
        tagEl ? hinted2(document2, "tag", document2.createTextNode(tagEl.textContent.trim())) : "",
        hinted2(document2, "text", text)
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-pricing", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-plan.js
  function hinted3(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function linkPara(document2, src) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = src.getAttribute("href");
    a.textContent = src.textContent.trim();
    p.append(a);
    return p;
  }
  function parse3(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".coverage-cards")];
    if (!cards.length) cards = [...element.querySelectorAll(".cmp-teaser")].map((t) => t.closest(".cmp-container") || t);
    const cells = [];
    cards.forEach((card) => {
      const teaser = card.querySelector(".cmp-teaser");
      if (!teaser) return;
      const desc = teaser.querySelector(".cmp-teaser__description");
      const text = [];
      if (desc) {
        [...desc.children].forEach((child) => {
          if (child.tagName === "UL" || child.tagName === "OL") {
            const list = document2.createElement(child.tagName.toLowerCase());
            child.querySelectorAll(":scope > li").forEach((li) => {
              const nli = document2.createElement("li");
              [...li.childNodes].forEach((n) => {
                if (!(n.nodeType === 1 && n.tagName === "IMG")) nli.append(n.cloneNode(true));
              });
              list.append(nli);
            });
            text.push(list);
            return;
          }
          if (!child.textContent.trim()) return;
          if (child.querySelector("span.title")) {
            const h = document2.createElement("h3");
            h.textContent = child.textContent.trim();
            text.push(h);
            return;
          }
          const a = child.querySelector("a[href]");
          if (a && child.textContent.trim() === a.textContent.trim()) {
            text.push(linkPara(document2, a));
            return;
          }
          const p = document2.createElement("p");
          const inner = child.querySelector("span.pretitle, span.black_text");
          p.append(...[...(inner || child).childNodes].map((n) => n.cloneNode(true)));
          text.push(p);
        });
      }
      teaser.querySelectorAll(".cmp-teaser__action-container a[href]").forEach((a) => text.push(linkPara(document2, a)));
      const disclaimer = [...card.querySelectorAll(".leadproxytext .cmp-text > *")].filter((n) => n.textContent.trim());
      if (!text.length && !disclaimer.length) return;
      cells.push([hinted3(document2, "text", text), hinted3(document2, "disclaimer", disclaimer)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-plan", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-list.js
  function hinted4(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function imgFrom(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse4(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".cmp-teaser")];
    if (!items.length) items = [...element.querySelectorAll(":scope > .teaser, :scope > div")];
    const cells = [];
    items.forEach((item) => {
      const icon = imgFrom(document2, item.querySelector(".cmp-teaser__image img, img.cmp-image__image"));
      const desc = item.querySelector(".cmp-teaser__description") || item.querySelector(".cmp-teaser__content");
      const text = [];
      if (desc) {
        const heading = desc.querySelector("h1, h2, h3, h4, h5, h6") || item.querySelector(".cmp-teaser__title");
        if (heading) {
          const h = document2.createElement("h3");
          const src = heading.querySelector(".blueText") || heading.querySelector("p") || heading;
          h.append(...[...src.childNodes].map((n) => n.cloneNode(true)));
          if (h.textContent.trim()) text.push(h);
        }
        [...desc.children].forEach((child) => {
          if (child === heading || child.contains(heading)) return;
          if (!child.textContent.trim()) return;
          text.push(child);
        });
      }
      if (!icon && !text.length) return;
      cells.push([hinted4(document2, "image", icon), hinted4(document2, "text", text)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon-list", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-persona.js
  function hinted5(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function imgFrom2(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse5(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".cmp-teaser")];
    if (!slides.length) slides = [...element.querySelectorAll(".swiper-slide")];
    const cells = [];
    slides.forEach((slide) => {
      const avatar = imgFrom2(document2, slide.querySelector(".cmp-teaser__image img, img.cmp-image__image"));
      const desc = slide.querySelector(".cmp-teaser__description") || slide.querySelector(".cmp-teaser__content");
      const text = [];
      if (desc) {
        [...desc.children].forEach((child) => {
          if (!child.textContent.trim()) return;
          if (/^H[1-6]$/.test(child.tagName)) {
            const h = document2.createElement("h3");
            const src = child.querySelector(".black_text") || child;
            h.append(...[...src.childNodes].map((n) => n.cloneNode(true)));
            text.push(h);
          } else text.push(child);
        });
      }
      if (!avatar && !text.length) return;
      cells.push([hinted5(document2, "image", avatar), hinted5(document2, "text", text)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-persona", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-video.js
  function parse6(element, { document: document2 }) {
    let url = "";
    let title = "";
    const iframe = element.querySelector('iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"], iframe[data-src]');
    if (iframe) {
      const src = iframe.getAttribute("src") || iframe.getAttribute("data-src") || "";
      title = iframe.getAttribute("title") || "";
      const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/#]+)/);
      if (yt) url = `https://www.youtube.com/watch?v=${yt[1]}`;
      else if (src) url = src.startsWith("//") ? `https:${src}` : src;
    }
    if (!url) {
      const holder = element.querySelector("[data-video-id], [data-videoid], [data-youtube-id]");
      const id = holder && (holder.getAttribute("data-video-id") || holder.getAttribute("data-videoid") || holder.getAttribute("data-youtube-id"));
      if (id) url = `https://www.youtube.com/watch?v=${id}`;
    }
    if (!url) {
      const a2 = element.querySelector('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"]');
      if (a2) {
        url = a2.getAttribute("href");
        title = title || a2.textContent.trim();
      }
    }
    if (!url) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cell = document2.createDocumentFragment();
    const poster = element.querySelector('img[src]:not([src*="pixel"])');
    if (poster) {
      cell.append(document2.createComment(" field:embed_placeholder "));
      const img = document2.createElement("img");
      img.src = poster.getAttribute("src");
      img.alt = poster.getAttribute("alt") || "";
      cell.append(img);
    }
    cell.append(document2.createComment(" field:embed_uri "));
    const a = document2.createElement("a");
    a.href = url;
    a.textContent = title || url;
    cell.append(a);
    const cells = [[cell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-plan-links.js
  function hinted6(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function imgFrom3(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse7(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll(".cmp-teaser")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".swiper-slide, .teaser")];
    const cells = [];
    tiles.forEach((tile) => {
      const img = imgFrom3(document2, tile.querySelector(".cmp-teaser__image img, img.cmp-image__image"));
      const link = tile.querySelector("a.cmp-teaser__link[href], a.cmp-image__link[href], a[href]");
      const href = link ? link.getAttribute("href") : "";
      const paras = [...tile.querySelectorAll(".cmp-teaser__description > p, .cmp-teaser__description > h3, .cmp-teaser__title")].filter((p) => p.textContent.trim());
      const text = [];
      let ctaLabel = "";
      paras.forEach((p) => {
        if (p.querySelector(".red_text")) {
          ctaLabel = p.textContent.trim();
          return;
        }
        const np = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = p.textContent.trim();
        np.append(strong);
        text.push(np);
      });
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = ctaLabel || "Check Plan";
        p.append(a);
        text.push(p);
      } else if (ctaLabel) {
        const p = document2.createElement("p");
        p.textContent = ctaLabel;
        text.push(p);
      }
      if (!img && !text.length) return;
      cells.push([hinted6(document2, "image", img), hinted6(document2, "text", text)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-plan-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature-grid.js
  function hinted7(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function imgFrom4(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse8(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".cmp-teaser")];
    if (!items.length) items = [...element.querySelectorAll(".teaser")];
    const cells = [];
    items.forEach((item) => {
      const srcImg = item.querySelector(".cmp-teaser__image img, img.cmp-image__image");
      const alt = srcImg ? (srcImg.getAttribute("alt") || "").trim() : "";
      const isNumber = /^\d{1,3}$/.test(alt);
      const icon = isNumber ? null : imgFrom4(document2, srcImg);
      const text = [];
      const title = item.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
      if (title && title.textContent.trim()) {
        const h = document2.createElement("h3");
        h.append(...[...title.childNodes].map((n) => n.cloneNode(true)));
        h.innerHTML = h.innerHTML.trim();
        text.push(h);
      }
      const desc = item.querySelector(".cmp-teaser__description");
      if (desc) [...desc.children].forEach((c) => {
        if (c.textContent.trim() && c !== title) text.push(c);
      });
      if (!icon && !isNumber && !text.length) return;
      cells.push([
        hinted7(document2, "image", icon),
        isNumber ? hinted7(document2, "number", document2.createTextNode(alt)) : "",
        hinted7(document2, "text", text)
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature-grid", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-calculator.js
  function parse9(element, { document: document2 }) {
    const col1 = [];
    const headingSrc = element.querySelector(".newpremiumcalculator__heading p, .newpremiumcalculator__heading h2, .newpremiumcalculator__heading h3");
    if (headingSrc && headingSrc.textContent.trim()) {
      const h = document2.createElement("h3");
      h.textContent = headingSrc.textContent.trim();
      col1.push(h);
    }
    element.querySelectorAll(".premium-widget-content > *").forEach((p) => {
      if (p.textContent.trim()) col1.push(p);
    });
    const col2 = [];
    const label = element.querySelector(".premium-details > p");
    if (label && label.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = label.textContent.trim();
      col2.push(p);
    }
    const price = element.querySelector(".premium-details .newpremcalc_termvalue, .premium-details span");
    if (price && price.textContent.trim()) {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      strong.textContent = price.textContent.trim();
      p.append(strong);
      col2.push(p);
    }
    const btn = element.querySelector("button.newprem__calc_button, .newwprem__calcbtnwrp button, .newwprem__calcbtnwrp a");
    if (btn) {
      const href = btn.getAttribute("href") || btn.getAttribute("data-href") || btn.getAttribute("data-url") || btn.getAttribute("data-redirect-url") || btn.getAttribute("data-link") || "";
      const a = document2.createElement("a");
      a.href = href && !href.startsWith("javascript") ? href : "https://sellonline.tataaia.com/app/products?product=SRP";
      a.textContent = btn.textContent.trim() || "Buy Now";
      const p = document2.createElement("p");
      p.append(a);
      col2.push(p);
    }
    if (!col1.length && !col2.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-calculator", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stats.js
  function hinted8(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function imgFrom5(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse10(element, { document: document2 }) {
    const tiles = [...element.querySelectorAll(".cmp-teaser")];
    if (!tiles.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    tiles.forEach((tile) => {
      const icon = imgFrom5(document2, tile.querySelector(".cmp-teaser__image img"));
      const paras = [...tile.querySelectorAll(".cmp-teaser__description > *")].filter((p) => p.textContent.trim());
      const text = [];
      paras.forEach((p, i) => {
        if (i === 0) {
          const np = document2.createElement("p");
          const strong = document2.createElement("strong");
          strong.append(...[...p.childNodes].map((n) => n.cloneNode(true)));
          np.append(strong);
          text.push(np);
        } else text.push(p);
      });
      if (!icon && !text.length) return;
      cells.push([hinted8(document2, "image", icon), hinted8(document2, "text", text)]);
    });
    const extras = [...element.querySelectorAll(".leadproxytext .cmp-text > *")].filter((n) => n.textContent.trim() && !n.closest(".cmp-teaser"));
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-stats", cells });
    element.replaceWith(block, ...extras);
  }

  // tools/importer/parsers/accordion-seo.js
  function hinted9(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function bodyNodes(container) {
    if (!container) return [];
    const out = [];
    [...container.children].forEach((child) => {
      if (child.matches(".ta-para, .cmp-text, .text, .leadproxytext, .ta-fq-ans-m")) {
        out.push(...bodyNodes(child));
        return;
      }
      const text = child.textContent.replace(/ /g, " ").trim();
      if (!text && !child.querySelector("img, table, iframe")) return;
      out.push(child);
    });
    return out;
  }
  function cleanText(el2) {
    return el2 ? el2.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim() : "";
  }
  function parse11(element, { document: document2 }) {
    const items = [];
    element.querySelectorAll("li.ta-fq-content-li").forEach((li) => {
      const q = li.querySelector(".ta-fq-content-qtext h1, .ta-fq-content-qtext h2, .ta-fq-content-qtext h3, .ta-fq-content-qtext h4, .ta-fq-content-qtext") || li.querySelector(".ta-fq-content-q");
      const a = li.querySelector(".ta-fq-ans-m") || li.querySelector(".ta-fq-ans-w");
      items.push({ summary: cleanText(q), body: bodyNodes(a) });
    });
    if (!items.length) {
      const accItems = element.matches(".cmp-accordion__item") ? [element] : [...element.querySelectorAll(".cmp-accordion__item")];
      accItems.forEach((item) => {
        const title = item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__header, button");
        const panel = item.querySelector(".cmp-accordion__panel");
        items.push({ summary: cleanText(title), body: bodyNodes(panel) });
      });
    }
    const cells = [];
    items.forEach(({ summary, body }) => {
      if (!summary && !body.length) return;
      cells.push([
        summary ? hinted9(document2, "summary", document2.createTextNode(summary)) : "",
        hinted9(document2, "text", body)
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-seo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-rounded.js
  function cellContent(document2, src) {
    const frag = document2.createDocumentFragment();
    if (!src) return frag;
    const nodes = [...src.childNodes].filter((n) => {
      if (n.nodeType === 8) return false;
      if (n.nodeType === 3) return n.textContent.replace(/ /g, " ").trim() !== "";
      if (n.nodeType !== 1) return false;
      return n.textContent.replace(/ /g, " ").trim() !== "" || n.querySelector("img");
    });
    nodes.forEach((n) => frag.append(n.cloneNode(true)));
    return frag;
  }
  function hasContent(frag) {
    return frag && frag.textContent.replace(/ /g, " ").trim() !== "";
  }
  function parseDivTable(document2, element) {
    const rows = [];
    const heads = [...element.querySelectorAll('.table-blue-heading > [class*="table-heading-"]')].filter((h) => !h.classList.contains("mob-block"));
    if (heads.length) {
      rows.push(heads.map((h) => {
        const head = h.querySelector(".head") || h;
        return cellContent(document2, head);
      }));
    }
    element.querySelectorAll(".table-rows-data").forEach((r) => {
      const row = [cellContent(document2, r.querySelector(".plan-name"))];
      let cols = [...r.querySelectorAll('.inner-column > [class*="-column"]')];
      if (!cols.length) cols = [...r.querySelectorAll(".plan-data")].map((d) => d.parentElement);
      cols.forEach((c) => row.push(cellContent(document2, c.querySelector(".plan-data") || c)));
      rows.push(row);
    });
    return rows;
  }
  function parseRealTable(document2, table) {
    return [...table.querySelectorAll("tr")].map((tr) => [...tr.children].filter((c) => c.tagName === "TD" || c.tagName === "TH").map((c) => cellContent(document2, c)));
  }
  function parse12(element, { document: document2 }) {
    let rows = [];
    const table = element.querySelector("table");
    if (element.querySelector(".table-rows-data, .table-blue-heading")) rows = parseDivTable(document2, element);
    else if (table) rows = parseRealTable(document2, table);
    rows = rows.filter((r) => r.some((c) => hasContent(c)));
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const colCount = Math.min(4, Math.max(...rows.map((r) => r.length)));
    const cells = rows.map((r) => {
      const out = [];
      for (let i = 0; i < colCount; i += 1) {
        const c = r[i];
        if (c && hasContent(c)) {
          const frag = document2.createDocumentFragment();
          frag.append(document2.createComment(` field:column${i + 1}text `), c);
          out.push(frag);
        } else out.push("");
      }
      if (r.length > colCount) {
        r.slice(colCount).forEach((c) => {
          if (hasContent(c) && out[colCount - 1]) out[colCount - 1].append(c);
        });
      }
      return out;
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "table-rounded", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-comparison.js
  function clean(t) {
    return (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function contentNodes(src) {
    if (!src) return [];
    return [...src.childNodes].filter((n) => {
      if (n.nodeType === 8) return false;
      if (n.nodeType === 3) return clean(n.textContent) !== "";
      return n.nodeType === 1 && (clean(n.textContent) !== "" || n.querySelector("img"));
    }).map((n) => n.cloneNode(true));
  }
  function hinted10(document2, idx, nodes) {
    const list = nodes.filter(Boolean);
    if (!list.length || !list.some((n) => clean(n.textContent) || n.querySelector && n.querySelector("img"))) return "";
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:column${idx}text `));
    list.forEach((n) => frag.append(n));
    return frag;
  }
  function parse13(element, { document: document2 }) {
    const rows = [];
    const headFirst = element.querySelector(".table-blue-heading > .table-heading-first");
    const planHeads = [...element.querySelectorAll(".table-blue-heading > .secondElement, .table-blue-heading > .table-heading-second, .table-blue-heading > .table-heading-third")].filter((h, i, arr) => arr.indexOf(h) === i && !h.classList.contains("mob-block"));
    let planCount = planHeads.length;
    if (headFirst || planHeads.length) {
      const label = document2.createElement("p");
      label.textContent = clean(headFirst ? headFirst.textContent : "");
      const header = [[label]];
      planHeads.forEach((h) => {
        const p = document2.createElement("p");
        const name = h.querySelector(":scope > .head") || h.querySelector(".head");
        p.textContent = clean(name ? name.textContent : "");
        header.push([p]);
      });
      rows.push(header);
    }
    element.querySelectorAll(".table-rows-data").forEach((r) => {
      const labelNodes = contentNodes(r.querySelector(".plan-name"));
      const groups = [...r.querySelectorAll(":scope > .parent-table-data > div")];
      const perPlan = [];
      groups.forEach((g) => {
        const subHead = g.querySelector(":scope > .mobile-minmax-head") || g.querySelector(".backgrey");
        const sub = subHead ? clean(subHead.textContent) : "";
        const planCols = [...g.querySelectorAll(":scope > .inner-column > div")];
        planCount = Math.max(planCount, planCols.length);
        planCols.forEach((col, i) => {
          perPlan[i] = perPlan[i] || [];
          const values = contentNodes(col.querySelector(".plan-data"));
          if (sub && (values.length || groups.length > 1)) {
            const p = document2.createElement("p");
            const b = document2.createElement("strong");
            b.textContent = sub;
            p.append(b);
            perPlan[i].push(p);
          }
          perPlan[i].push(...values);
        });
      });
      rows.push([labelNodes, ...perPlan]);
    });
    const ctas = [...element.querySelectorAll(".redirection-button-container .btn-container a[href], .redirection-button-container a.redirect-btn")].filter((a, i, arr) => arr.indexOf(a) === i);
    if (ctas.length) {
      const row = [[]];
      ctas.forEach((src) => {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = src.getAttribute("href");
        a.textContent = clean(src.textContent) || "Buy Now";
        p.append(a);
        row.push([p]);
      });
      rows.push(row);
    }
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const colCount = Math.min(4, Math.max(planCount + 1, ...rows.map((r) => r.length)));
    const cells = rows.map((r) => {
      const out = [];
      for (let i = 0; i < colCount; i += 1) out.push(hinted10(document2, i + 1, r[i] || []));
      return out;
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "table-comparison", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-label-box.js
  function parse14(element, { document: document2 }) {
    const desc = element.querySelector(".cmp-teaser__description") || element.querySelector(".cmp-teaser__content") || element;
    const tag = desc.querySelector("span.tag, .tag");
    const labelText = tag ? tag.textContent.replace(/ /g, " ").trim() : "";
    const tagPara = tag ? tag.closest("p") : null;
    const body = [...desc.children].filter((c) => c !== tagPara && c !== tag && c.textContent.replace(/ /g, " ").trim());
    if (!labelText && !body.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const labelCell = document2.createDocumentFragment();
    if (labelText) labelCell.append(document2.createComment(" field:label "), document2.createTextNode(labelText));
    const bodyCell = document2.createDocumentFragment();
    if (body.length) {
      bodyCell.append(document2.createComment(" field:text "));
      body.forEach((n) => bodyCell.append(n));
    }
    const cells = [
      [labelText ? labelCell : ""],
      [body.length ? bodyCell : ""]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-label-box", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-duration.js
  function clean2(t) {
    return (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function linkPara2(document2, src) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = src.getAttribute("href");
    a.textContent = clean2(src.textContent);
    p.append(a);
    return p;
  }
  function parse15(element, { document: document2 }) {
    const root = element.querySelector(":scope > .cmp-container") || element;
    const introTeaser = root.querySelector(":scope > .leadproxyteaser .cmp-teaser") || element.querySelector(".cmp-teaser");
    const col1 = [];
    let primaryHref = "";
    if (introTeaser) {
      const desc = introTeaser.querySelector(".cmp-teaser__description");
      if (desc) {
        const ul = document2.createElement("ul");
        [...desc.children].forEach((c) => {
          if (/^H[1-6]$/.test(c.tagName)) {
            const h = document2.createElement("h3");
            h.textContent = clean2(c.textContent);
            col1.push(h);
          } else if (clean2(c.textContent)) {
            const li = document2.createElement("li");
            [...c.childNodes].forEach((n) => {
              if (!(n.nodeType === 1 && n.tagName === "IMG")) li.append(n.cloneNode(true));
            });
            ul.append(li);
          }
        });
        if (ul.children.length) col1.push(ul);
      }
      const cta = introTeaser.querySelector("a.cmp-teaser__action-link, .cmp-teaser__action-container a[href]");
      if (cta) {
        primaryHref = cta.getAttribute("href");
        col1.push(linkPara2(document2, cta));
      }
    }
    const col2 = [];
    const intro = element.querySelector(".leadproxytext .cmp-text h1, .leadproxytext .cmp-text h2, .leadproxytext .cmp-text h3, .leadproxytext .cmp-text h4, .leadproxytext .cmp-text h5");
    if (intro) {
      const h = document2.createElement("h3");
      h.textContent = clean2(intro.textContent);
      col2.push(h);
    }
    const tiles = [...element.querySelectorAll(".cmp-container")].filter((c) => c.querySelector(":scope > .leadproxyv2teaser"));
    tiles.forEach((tile) => {
      const badgeSrc = tile.querySelector(":scope > .leadproxyteaser .cmp-teaser__description");
      const badge = document2.createElement("h4");
      badge.textContent = clean2(badgeSrc ? badgeSrc.textContent : "") || "Cover";
      col2.push(badge);
      const v2 = tile.querySelector(":scope > .leadproxyv2teaser .cmp-teaser");
      if (!v2) return;
      const img = v2.querySelector(".cmp-teaser__image img");
      const src = img && (img.getAttribute("src") || img.getAttribute("data-src"));
      if (src) {
        const p = document2.createElement("p");
        const ni = document2.createElement("img");
        ni.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
        ni.alt = img.getAttribute("alt") || "";
        p.append(ni);
        col2.push(p);
      }
      const amount = v2.querySelector(".cmp-teaser__title");
      if (amount && clean2(amount.textContent)) {
        const p = document2.createElement("p");
        const s = document2.createElement("strong");
        s.textContent = clean2(amount.textContent);
        p.append(s);
        col2.push(p);
      }
      v2.querySelectorAll(".cmp-teaser__description > *").forEach((p) => {
        if (clean2(p.textContent)) col2.push(p);
      });
    });
    element.querySelectorAll(".customizecta a[href], .get-qoute-btn a[href]").forEach((a) => {
      if (a.getAttribute("href") !== primaryHref) col2.push(linkPara2(document2, a));
    });
    if (!col1.length && !col2.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-duration", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-text-tile.js
  function parse16(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll(".cmp-teaser")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".swiper-slide")];
    const cells = [];
    tiles.forEach((tile) => {
      const desc = tile.querySelector(".cmp-teaser__description") || tile.querySelector(".cmp-teaser__content");
      if (!desc) return;
      const text = [];
      [...desc.children].forEach((c) => {
        if (!c.textContent.replace(/ /g, " ").trim()) return;
        if (/^H[1-6]$/.test(c.tagName)) {
          const h = document2.createElement("h3");
          const src = c.querySelector(".black_text") || c;
          h.append(...[...src.childNodes].map((n) => n.cloneNode(true)));
          text.push(h);
        } else text.push(c);
      });
      if (!text.length) return;
      const frag = document2.createDocumentFragment();
      frag.append(document2.createComment(" field:text "));
      text.forEach((n) => frag.append(n));
      cells.push([frag]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-text-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-table.js
  function clean3(t) {
    return (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function parse17(element, { document: document2 }) {
    const col1 = [];
    const img = element.querySelector(".extendedimage img.cmp-image__image, .cmp-image img.cmp-image__image, img.cmp-image__image");
    const src = img && (img.getAttribute("src") || img.getAttribute("data-src"));
    if (src) {
      const ni = document2.createElement("img");
      ni.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
      ni.alt = img.getAttribute("alt") || "";
      col1.push(ni);
    }
    const col2 = [];
    const textRoot = element.querySelector(".term-table-text .cmp-text, .leadproxytext .cmp-text");
    if (textRoot) {
      textRoot.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        if (h.closest("table")) return;
        const nh = document2.createElement("h3");
        nh.textContent = clean3(h.textContent);
        if (nh.textContent) col2.push(nh);
      });
      const table = textRoot.querySelector("table");
      if (table) {
        const ul = document2.createElement("ul");
        table.querySelectorAll("tr").forEach((tr) => {
          const vals = [...tr.children].filter((c) => c.tagName === "TD" || c.tagName === "TH").map((c) => clean3(c.textContent));
          if (!vals.some(Boolean)) return;
          const li = document2.createElement("li");
          li.textContent = vals.join(" | ");
          ul.append(li);
        });
        if (ul.children.length) col2.push(ul);
      }
      [...textRoot.querySelectorAll(":scope > p")].forEach((p) => {
        if (clean3(p.textContent)) col2.push(p);
      });
    }
    if (!col1.length && !col2.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-image-table", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-reviews.js
  function clean4(t) {
    return (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function para(document2, text, tag = "p") {
    const el2 = document2.createElement(tag);
    el2.textContent = text;
    return el2;
  }
  function hinted11(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function videoUrl(href) {
    if (!href) return "";
    const m = href.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/#]+)/);
    return m ? `https://www.youtube.com/watch?v=${m[1]}` : href;
  }
  function parse18(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".cmp-teaser")];
    if (!cards.length) cards = [...element.querySelectorAll(".swiper-slide")];
    const cells = [];
    cards.forEach((card) => {
      const details = card.querySelector(".card-details") || card;
      let avatar = null;
      const pimg = card.querySelector(".profile-image-wrapper img, img.profile-image");
      const psrc = pimg && (pimg.getAttribute("src") || pimg.getAttribute("data-src"));
      if (psrc) {
        avatar = document2.createElement("img");
        avatar.src = /\.svg$/i.test(psrc) ? `${psrc}?v=1` : psrc;
        avatar.alt = pimg.getAttribute("alt") || clean4((details.querySelector(".title") || {}).textContent) || "";
      }
      const text = [];
      const name = clean4((details.querySelector(".title") || {}).textContent);
      if (name) text.push(para(document2, name, "h3"));
      details.querySelectorAll(".grey-text, .company-name").forEach((s) => {
        const t = clean4(s.textContent);
        if (t) text.push(para(document2, t));
      });
      details.querySelectorAll(".pretitle").forEach((s) => {
        const c = s.cloneNode(true);
        c.querySelectorAll(".date").forEach((d) => d.remove());
        const t = clean4(c.textContent);
        if (t) text.push(para(document2, t));
      });
      details.querySelectorAll(".date").forEach((s) => {
        const t = clean4(s.textContent);
        if (t) text.push(para(document2, t));
      });
      const full = details.querySelectorAll("img.full").length;
      const half = details.querySelectorAll("img.half").length;
      const stars = details.querySelectorAll("img.full, img.half, img.empty").length;
      let rating = "";
      if (stars) rating = `${full + half * 0.5}/${stars}`;
      else {
        const rc = clean4((card.querySelector(".ratingcount") || {}).textContent);
        if (/^\d(\.\d)?$/.test(rc)) rating = `${rc}/5`;
      }
      if (rating) text.push(para(document2, rating));
      const vbtn = card.querySelector("a.watch_video_btn");
      if (vbtn) {
        const href = videoUrl(vbtn.getAttribute("data-href") || vbtn.getAttribute("href") || "");
        if (href) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = clean4(vbtn.textContent) || "Watch Video";
          p.append(a);
          text.push(p);
        }
      }
      details.querySelectorAll(".description").forEach((d) => {
        const t = clean4(d.textContent);
        if (t) text.push(para(document2, t));
      });
      if (!avatar && !text.length) return;
      cells.push([hinted11(document2, "image", avatar), hinted11(document2, "text", text)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-reviews", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form-callback.js
  function clean5(t) {
    return (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function hinted12(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function parse19(element, { document: document2 }) {
    const intro = [];
    const heading = [...element.querySelectorAll(".ta-needinfo-head h1, .ta-needinfo-head h2, .ta-needinfo-head h3, .ta-needinfo-head h4")].find((h) => clean5(h.textContent));
    if (heading) {
      const h = document2.createElement("h3");
      h.textContent = clean5(heading.textContent);
      intro.push(h);
    }
    element.querySelectorAll(".need-info-cc-title > p, .ta-needinfo-head > p").forEach((p) => {
      if (clean5(p.textContent)) intro.push(p);
    });
    let link = null;
    const btn = element.querySelector("button.getCallBackTteForm, .need-info-cc-button button, .need-info-cc-button a");
    if (btn) {
      const href = btn.getAttribute("href") || btn.getAttribute("data-href") || btn.getAttribute("data-url") || btn.getAttribute("data-action") || btn.closest("form") && btn.closest("form").getAttribute("action") || "";
      link = document2.createElement("a");
      link.href = href && !href.startsWith("javascript") ? href : "#";
      link.textContent = clean5(btn.textContent) || "Get a Call Back";
    }
    let consent = [...element.querySelectorAll(".tte-country-consent .info-content > *")].filter((n) => clean5(n.textContent));
    if (!consent.length) consent = [...element.querySelectorAll(".info-content-mob > *")].filter((n) => clean5(n.textContent));
    const success = [];
    const resultText = clean5((element.querySelector(".tte-popup-wrapper .resultText, .popup-result-text") || {}).textContent);
    const resultMsg = clean5((element.querySelector(".tte-form-popup-Msg") || {}).textContent);
    if (resultText) {
      const p = document2.createElement("p");
      const s = document2.createElement("strong");
      s.textContent = resultText;
      p.append(s);
      success.push(p);
    }
    if (resultMsg) {
      const p = document2.createElement("p");
      p.textContent = resultMsg;
      success.push(p);
    }
    if (!intro.length && !link && !consent.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [
      [hinted12(document2, "intro", intro)],
      [hinted12(document2, "link", link)],
      [hinted12(document2, "consent", consent)],
      [hinted12(document2, "success", success)]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "form-callback", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function clean6(t) {
    return (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function hinted13(document2, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function parse20(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".slider-temp-wrap")];
    if (!cards.length) cards = [...element.querySelectorAll(".swiper-slide, .things-card-layout")];
    const cells = [];
    cards.forEach((card) => {
      const link = card.querySelector("a[href]") || card.closest("a[href]");
      const href = link ? link.getAttribute("href") : "";
      const titleEl = card.querySelector(".blog-car-static-anly-linkpos, .slider-cont, h3, h4");
      const title = clean6(titleEl ? titleEl.textContent : link ? link.textContent : "");
      let image = null;
      const img = card.querySelector(".picture-wrapper img, img");
      const src = img && (img.getAttribute("src") || img.getAttribute("data-src"));
      if (src) {
        image = document2.createElement("img");
        image.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
        image.alt = img.getAttribute("alt") || title;
      }
      const text = [];
      if (title) {
        const h = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          h.append(a);
        } else h.textContent = title;
        text.push(h);
      }
      if (!image && !text.length) return;
      cells.push([hinted13(document2, "image", image), hinted13(document2, "text", text)]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-faq.js
  function clean7(t) {
    return (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function parse21(element, { document: document2 }) {
    const labels = [...element.querySelectorAll('.cmp-tabs__tablist > .cmp-tabs__tab, [role="tab"]')];
    const panels = [...element.querySelectorAll(".cmp-tabs__tabpanel")];
    const cells = [];
    const accItem = element.closest(".cmp-accordion__item");
    const header = accItem ? accItem.querySelector(":scope > .cmp-accordion__header") : null;
    const titleText = clean7(header ? (header.querySelector(".cmp-accordion__title") || header).textContent : "");
    if (titleText) {
      const frag = document2.createDocumentFragment();
      frag.append(document2.createComment(" field:title "), document2.createTextNode(titleText));
      cells.push([frag]);
    }
    panels.forEach((panel, i) => {
      const label = clean7(labels[i] ? labels[i].textContent : "") || `Tab ${i + 1}`;
      const content = [];
      const roots = panel.querySelectorAll(".cmp-text");
      (roots.length ? [...roots] : [panel]).forEach((root) => {
        [...root.children].forEach((child) => {
          if (!clean7(child.textContent)) return;
          if (/^H[1-6]$/.test(child.tagName)) {
            const h = document2.createElement("h3");
            const c = child.cloneNode(true);
            c.querySelectorAll(".lead").forEach((s) => {
              if (/^\d+\.?$/.test(clean7(s.textContent))) s.remove();
            });
            h.innerHTML = c.innerHTML;
            h.innerHTML = h.innerHTML.trim();
            content.push(h);
          } else content.push(child);
        });
      });
      if (!content.length) return;
      const labelCell = document2.createDocumentFragment();
      labelCell.append(document2.createComment(" field:title "), document2.createTextNode(label));
      const textCell = document2.createDocumentFragment();
      textCell.append(document2.createComment(" field:text "));
      content.forEach((n) => textCell.append(n));
      cells.push([labelCell, textCell]);
    });
    if (!cells.length || titleText && cells.length === 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-faq", cells });
    if (header) header.remove();
    element.replaceWith(block);
  }

  // tools/importer/transformers/tataaia-redesign.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  var TATAAIA = "https://www.tataaia.com";
  var NEW_IDS = {
    calculator: "redesign-term-calculator",
    ageCards: "redesign-age-cards",
    howToBuy: "redesign-how-to-buy",
    popularSearches: "redesign-popular-searches",
    byline: "redesign-byline"
  };
  var COMPARE_ROWS = [
    ["Entry Age (years)", [["<p>18</p>", "<p>18</p>"], ["<p>65</p>", "<p>65</p>"]]],
    ["Maturity Age (years)", [["<p>22</p>", "<p>28</p>"], ["<p>100</p>", "<p>100</p>"]]],
    ["Pay premium for (Premium Payment Term in years)", [["<ul> <li><b>Single Pay</b></li> <li><b>Limited Pay</b>: 4 years</li> <li><b>Regular Pay</b>: 4 years</li> </ul>", "<ul> <li><b>Single Pay</b></li> <li><b>Limited Pay</b>: 5 years</li> <li><b>Regular Pay</b>: 10 years</li> </ul>"], ["<ul> <li><b>Single Pay</b></li> <li><b>Limited Pay</b>: Benefit Option Term minus 1 year (Max. 81 years)</li> <li><b>Regular Pay</b>:Same as Benefit Option Term (Max. 82 years)</li> </ul>", "<ul> <li><b>Single Pay</b></li> <li><b>Limited Pay</b>: Benefit Option Term minus 1 year (Max. 81 years)</li> <li><b>Regular Pay</b>:Same as Benefit Option Term (Max. 82 years)</li> </ul>"]]],
    ["Stay covered for (Policy Term in years)", [["<ul> <li><b>Single Pay:</b>5 years</li> <li><b>Limited Pay</b>: 5 years</li> <li><b>Regular Pay</b>: 4 years</li> </ul>", "<p>10</p>"], ["<p>82 (Subject to max. maturity age of 100 years)</p>", "<p>82 (Subject to max. maturity age of 100 years)</p>"]]],
    ["Life cover (Basic Sum Assured in Rs)", [["<p>50 Lakh</p>", "<p>2 Crore</p>"], ["<p>No limit, subject to Board Approved Underwriting Policy (BAUP)</p>", "<p>No limit, subject to Board Approved Underwriting Policy (BAUP)</p>"]]],
    ["Premium payment mode", [["<p>Annual/Semi-annual/Quarterly/Monthly</p>", "<p>Annual/Semi-annual/Quarterly/Monthly</p>"]]],
    ["Death benefit", [["<p>Lump sum life cover paid to the claimant on death of the Life Assured</p>", "<p>Lump sum life cover paid to the claimant on death of the Life Assured</p>"]]],
    ["Option to cover till age of 100", [["<p>Yes</p>", "<p>Yes</p>"]]],
    ["Return of premium", [["<p>No</p>", "<p>100% of total base plan premiums paid (excl. loading, taxes &amp; discount) returned on survival</p>"]]],
    ["Terminal illness cover", [["<p>50% Basic Sum Assured paid on terminal Illness and future premiums waived off; remaining amount paid to the nominee on death of the Life Assured</p>", "<p>50% Basic Sum Assured paid on terminal Illness and future premiums waived off; remaining amount paid to the nominee on death of the Life Assured</p>"]]],
    ["Early exit feature", [["<p>No</p>", "<p>100% Surrender Value anytime after 25 years</p>"]]],
    ["Instant claim payout", [["<p>Instant death benefit of \u20B9 3 Lakh from the Sum Assured will be paid upon claim registration and submission of basic documents</p>", "<p>Instant death benefit of \u20B9 3 Lakh from the Sum Assured will be paid upon claim registration and submission of basic documents</p>"]]],
    ["FlexiPay (Pay later) benefit", [["<p>Flexibility to delay premiums for a block of 12 months without any interest with life cover intact</p>", "<p>Flexibility to delay premiums for a block of 12 months without any interest with life cover intact</p>"]]],
    ["Health benefit", [["<p>Option to attach health riders<sup>4</sup></p>", "<p>Option to attach health riders<sup>4</sup></p>"]]],
    ["Tax benefit on premiums paid", [["<p>Yes, under section 80C</p>", "<p>Yes, under section 80C</p>"]]],
    ["Tax on death benefit", [["<p>Tax-free</p>", "<p>Tax-free</p>"]]],
    ["Digital purchase discount", [["<ul> <li><b>Single Pay:</b> 1%</li> <li><b>Limited/Regular Pay</b>: 10% on 1st year premium</li> </ul>", "<ul> <li><b>Single Pay:</b> 1%</li> <li><b>Limited/Regular Pay:</b> 10% on 1st year premium</li> </ul>"]]],
    ["Salaried personnel discount", [["<ul> <li><b>Single Pay:</b> 1%</li> <li><b>Limited/Regular Pay:</b> 8.5% On 1st year premium</li> </ul>", "<ul> <li><b>Single Pay:</b> 1%</li> <li><b>Limited/Regular Pay:</b> 8.5% On 1st year premium</li> </ul>"]]],
    ["Female premium benefit", [["<p>15% Lower premium for women</p>", "<p>15% Lower premium for women</p>"]]],
    ["Milestone discount", [["<ul> <li><b>Single Pay:</b> 0.5%</li> <li><b>Limited/Regular Pay:</b> 2% on 1st year premium for first jobbers, newly-weds, first-time parents and recent homeowners (max. Rs. 500)</li> </ul>", "<p>No</p>"]]],
    ["Tata Group staff discount", [["<ul> <li><b>Single Pay:</b> 2%</li> <li><b>Limited/Regular Pay:</b> 12% On 1st year premium</li> </ul>", ""]]],
    ["Other discounts", [["<p>Loyalty Program Benefit under Tata Digital: Neu coins<sup>6</sup> credited</p> <ul> <li><b>Single Pay:</b> 0.5%</li> <li><b>Limited/Regular Pay:</b> 5%</li> </ul>", "<p>Loyalty Program Benefit under Tata Digital: Neu coins<sup>6</sup> credited </p> <ul> <li> <b>Single Pay:</b> 0.5%</li> <li><b> Limited/Regular Pay:</b> 5%</li> </ul>"]]]
  ];
  var COMPARE_CTAS = [
    "https://sellonline.tataaia.com/wps/PA_TATAAIA_SO/CampaignRedirection?campaign=BO&product=373&camcode=2042&cid=website:link:termcategorypage::sampoornarakshapromise:comparetermplans_srplifepromise:2042",
    "https://sellonline.tataaia.com/wps/PA_TATAAIA_SO/CampaignRedirection?campaign=BO&product=367&camcode=2042&cid=website:link:termcategorypage::maharakshasupremeselect:comparetermplans_mrsslifesecure:2042"
  ];
  var PREMIUM_1CR = "\u20B9 589";
  var PREMIUM_CTA = "https://sellonline.tataaia.com/app/products?product=SRP&campaign=BO&camcode=2066&cid=website:link:terminsurancecalculatorwidget::sampoornarakshapromise:terminsurance:2066&sourcePage=https://www.tataaia.com/life-insurance-plans/term-insurance.html";
  var norm = (t) => (t || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  var normKey = (t) => norm(t).toLowerCase();
  function fillComparisonTable(root, doc) {
    const wrapper = root.querySelector(".compare-term-plan-table .compare-table-wrapper");
    if (!wrapper) {
      console.warn("[tataaia-redesign] comparison table not found");
      return;
    }
    const data = new Map(COMPARE_ROWS.map(([label, groups]) => [normKey(label), groups]));
    let filled = 0;
    wrapper.querySelectorAll(".table-rows-data").forEach((row) => {
      const labelEl = row.querySelector(".plan-name");
      const groupsData = labelEl && data.get(normKey(labelEl.textContent));
      if (!groupsData) return;
      const groups = [...row.querySelectorAll(":scope > .parent-table-data > div")];
      groups.forEach((g, gi) => {
        const values = groupsData[gi];
        if (!values) return;
        let inner = g.querySelector(":scope > .inner-column");
        if (!inner) {
          inner = doc.createElement("div");
          inner.className = "inner-column";
          g.append(inner);
        }
        values.forEach((html, ci) => {
          let col = inner.querySelectorAll(":scope > div")[ci];
          if (!col) {
            col = doc.createElement("div");
            inner.append(col);
          }
          let pd = col.querySelector(".plan-data");
          if (!pd) {
            pd = doc.createElement("div");
            pd.className = "plan-data";
            col.append(pd);
          }
          if (!norm(pd.textContent) && html) {
            pd.innerHTML = html;
            filled += 1;
          }
        });
      });
    });
    const ctas = [...wrapper.querySelectorAll(".redirection-button-container a.redirect-btn, .redirection-button-container .btn-container a")].filter((a, i, arr) => arr.indexOf(a) === i);
    ctas.forEach((a, i) => {
      const href = a.getAttribute("href") || "";
      if (COMPARE_CTAS[i] && (!href || href === "#" || href.startsWith("javascript"))) a.setAttribute("href", COMPARE_CTAS[i]);
    });
    console.log(`[tataaia-redesign] comparison table: filled ${filled} empty plan cells`);
  }
  function fillPremiumCalculator(root) {
    const calc = root.querySelector(".newpremiumcalc-container .newcalculatepremium");
    if (!calc) {
      console.warn("[tataaia-redesign] 1 Cr premium calculator not found");
      return;
    }
    const value = calc.querySelector(".premium-details .newpremcalc_termvalue");
    if (value && !norm(value.textContent)) value.textContent = PREMIUM_1CR;
    const btn = calc.querySelector("button.newprem__calc_button");
    if (btn && !btn.getAttribute("data-href")) {
      btn.setAttribute("data-href", btn.getAttribute("data-calcbtnlink") || PREMIUM_CTA);
    }
  }
  function findGrid(root) {
    const grid = root.querySelector("div.root.responsivegrid > div.aem-Grid > div.responsivegrid.aem-GridColumn > div.aem-Grid");
    if (grid) return grid;
    const hero = root.querySelector(".nolead-calc-banner-wrapper");
    return hero ? hero.parentElement : null;
  }
  function gridChild(grid, selector) {
    let el2 = grid.querySelector(`:scope > ${selector}`) || grid.querySelector(selector);
    while (el2 && el2.parentElement !== grid) el2 = el2.parentElement;
    return el2 || null;
  }
  var DROP = [
    ".interlinking-widget",
    // section-5 grey interlinking pills
    ".benefits-ills-mob-font-20",
    // section-7 benefits illustration tabs
    "#container-2ff58935c7",
    // section-7 (empty swiper overlay container)
    "#container-916e0a3aec",
    // section-11 persona examples slider
    "#container-adaee19218",
    // section-19 cards-factor "Factors impacting savings plan premium"
    "#container-fc5f3371ba",
    // section-27 "When should you buy" table
    "#container-b2c8b612e3",
    // section-29 "Can NRIs buy term insurance in India?"
    "#leadproxytext-1eeff73bd5",
    // section-33 "Understanding the age factor..."
    ".term-insurance-hightlights",
    // section-33 age-factor highlights
    "#container-e553947e67",
    // section-49 "Is GST applicable on term insurance"
    "#leadproxytext-82cd37ae67"
    // section-51 "Key Term Insurance Insights"
  ];
  var ORDER = [
    /* 1 */
    [".breadcrumb", ".term-insurance-maininfo-container"],
    /* 2 */
    [".nolead-calc-banner-wrapper"],
    /* 3 */
    [".newsecondarynavigation"],
    /* 4 */
    ["#container-f3864d3a26"],
    /* 5 */
    ["#leadproxytext-5179f9a894"],
    /* 6 */
    ["#container-1bc7d25ffb"],
    // section-9 How does a term plan work
    /* 7 */
    [".mob-mt-5.mt-40.enhancecoveragecontainer.enhance-container-tab", "#container-fd213a4373", "#container-0d02e02de8"],
    // section-8
    /* 8 */
    ["#container-f4164bf945"],
    // section-13 Tata AIA Term plans
    /* 9 */
    ["#container-d2b88fc833"],
    // section-10
    /* 10 */
    ["#container-cd5dfce657"],
    // section-12 video
    /* 11 */
    ["#container-1ba1e4524a"],
    /* 12 */
    [".newpremiumcalc-container"],
    /* 13 */
    [".whychoose-cards"],
    /* 14 */
    ["#container-217c32ab0c"],
    /* 15 */
    ["#container-9d7e57cecd"],
    /* 16 */
    ["#container-f942407c45"],
    /* 17 */
    ["#leadproxytext-4fac5f6122", ".term-insurance-table"],
    /* 18 */
    ["#container-5caf9ff5af"],
    /* 19 */
    [".rider-bg.faq_acc_with-viewallbtn", "#container-475bf0458f"],
    /* 20 */
    ["#container-fadf1d54e1"],
    /* 21 */
    ["#container-4a5dfb47f8"],
    /* 22 */
    ["#container-2c038f2903"],
    /* 23 */
    [`#${NEW_IDS.calculator}`],
    /* 24 */
    ["#container-33e50a7826"],
    /* 25 */
    ["#container-771a9a44bf"],
    /* 26 */
    ["#container-8edf4bc779"],
    /* 27 */
    ["#container-9dfa60f0af"],
    /* 28 */
    ["#container-1c542e2ae3", "#container-4c0d0d1c34"],
    /* 29 */
    ["#container-f4882e2f04"],
    /* 30 */
    ["#leadproxytext-1bfd9816cd"],
    /* 31 */
    ["#container-defa9db8ad"],
    /* 32 */
    ["#leadproxytext-8e6b531b6b"],
    /* 33 */
    ["#container-8332a7d055"],
    /* 34 */
    ['[id="27"]'],
    /* 35 */
    ["#container-b2a7b4132b"],
    /* 36 */
    ["#leadproxytext-a8e8208a95", "#leadproxyteaser-249ae514b8"],
    /* 37 */
    ["#container-16ed44abb5"],
    /* 38 */
    ["#container-d35e3a192d"],
    /* 39 */
    ["#leadproxytext-ae2ba99d42"],
    /* 40 */
    ["#container-1618092523"],
    /* 41 */
    ["#leadproxytext-3a445fa119"],
    /* 42 */
    ["#container-92e8aae3a5"],
    /* 43 */
    [`#${NEW_IDS.howToBuy}`],
    /* 44 */
    ["#container-b2fe259e25"],
    /* 45 */
    ["#leadproxytext-4cf3e377b6"],
    /* 46 */
    ["#container-6f11a5e168"],
    /* 47 */
    ["#leadproxytext-7f29512ee4"],
    /* 48 */
    ["#container-6ed3066365"],
    /* 49 */
    ["#leadproxytext-45dbbbfc29"],
    /* 50 */
    ["#container-74e18de16e"],
    /* 51 */
    ["#leadproxytext-c876bebae1"],
    /* 52 */
    [".voiceof-happy-customer"],
    /* 53 */
    [".tte-form-redesign"],
    /* 54 */
    ["#container-0e5e661886"],
    /* 55 */
    ["#container-593dd46a6a", ".updatedatelatest"],
    /* 56 */
    [`#${NEW_IDS.popularSearches}`]
  ];
  function removePartial(root) {
    const s25 = root.querySelector("#container-4a5dfb47f8");
    if (s25) {
      [...s25.querySelectorAll("h2")].filter((h) => /how long does it take to approve a claim/i.test(h.textContent)).forEach((h) => {
        const box = h.closest(".ta-container") || h.closest(".leadproxytext");
        if (box && s25.contains(box) && !box.querySelector(".compare-term-plan-table")) box.remove();
      });
    }
    const s37 = root.querySelector('[id="27"]');
    if (s37) {
      [...s37.querySelectorAll("h2")].filter((h) => /market-linked wealth creation/i.test(h.textContent)).forEach((h) => {
        const box = h.closest(".supportpage_styleguide") || h.closest(".leadproxytext");
        if (box && s37.contains(box) && box !== s37) box.remove();
      });
    }
  }
  function hinted14(doc, field, nodes) {
    const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
    if (!list.length) return "";
    const frag = doc.createDocumentFragment();
    frag.appendChild(doc.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function el(doc, tag, html) {
    const e = doc.createElement(tag);
    if (html !== void 0) e.innerHTML = html;
    return e;
  }
  function buildAgeCards(doc, ctaHref) {
    const wrap = doc.createElement("div");
    wrap.id = NEW_IDS.ageCards;
    const ages = [
      ["Age 20", "Premium starts at \u20B9548/month"],
      ["Age 30", "Premium starts at \u20B9732/month"],
      ["Age 40", "Premium starts at \u20B91,308/month"]
    ];
    const cells = ages.map(([age, label]) => ["", hinted14(doc, "text", [el(doc, "p", `<strong>${age}</strong>`), el(doc, "p", label)])]);
    wrap.append(WebImporter.Blocks.createBlock(doc, { name: "cards-stats", cells }));
    const p = doc.createElement("p");
    const a = doc.createElement("a");
    a.href = ctaHref || "#";
    a.textContent = "Plan now";
    p.append(a);
    wrap.append(p);
    return wrap;
  }
  function buildHowToBuy(doc) {
    const wrap = doc.createElement("div");
    wrap.id = NEW_IDS.howToBuy;
    wrap.append(el(doc, "h2", "How to buy Term Insurance?"));
    wrap.append(el(doc, "p", "Buying term insurance online is simple with Tata AIA. Here's how to buy a plan from Tata AIA Life Insurance:"));
    const steps = [
      "Visit the Tata AIA Life Insurance website and find the term insurance section.",
      "Use the term insurance calculator to estimate your premium based on the sum assured and policy term. This tool can help you pick a plan that fits your budget.",
      "Choose a term plan and consider adding riders like critical illness cover or accidental death benefit. These additions provide extra protection for specific situations.",
      "Fill out the online application with required information such as ID proof, address proof, income proof and upload your documents. Moreover, you might need to provide medical information for underwriting purposes.",
      "Make the payment and read the policy disclaimer carefully. It is important to understand all terms before completing your Tata AIA term insurance purchase."
    ];
    const ol = doc.createElement("ol");
    steps.forEach((s) => ol.append(el(doc, "li", s)));
    wrap.append(ol);
    return wrap;
  }
  var POPULAR_SEARCHES = [
    ["Term Insurance", "/life-insurance-plans/term-insurance.html"],
    ["Health Insurance Plan", "#"],
    ["Term Insurance Calculator", "/calculator/term-insurance-calculator.html"],
    ["ULIP", "/life-insurance-plans/wealth-solutions.html"],
    // live anchor text "ULIP Plans"
    ["Pension Calculator", "/calculator/retirement-and-pension-calculator.html"],
    ["Life Insurance Policy", "#"],
    ["Long Term Capital Gain", "#"],
    ["Term Insurance With Return of Premium", "/term-plan-with-return-of-premium.html"],
    // live "Term Plan with Return of Premium"
    ["Pension Plan", "/life-insurance-plans/retirement-and-pension-solutions.html"],
    // live "Retirement & Pension Plans"
    ["Small Cap Fund", "#"],
    ["Multi Cap Fund", "#"],
    ["ULIP Calculator", "/calculator/ulip-calculator.html"],
    ["Savings Calculator", "/calculator/saving-calculator.html"],
    ["ULIP vs Mutual Fund", "#"],
    ["ULIP Taxation", "#"],
    ["Money Management Tips", "#"],
    ["ULIP Charges", "#"],
    ["1 Crore Term Insurance", "/life-insurance-plans/term-insurance/1-crore-term-insurance-plan.html"],
    ["Dynamic Asset Allocation Fund", "#"],
    ["ULIP vs. ELSS", "#"],
    ["ULIP Advantages", "#"],
    ["ULIP Lock-in Period", "#"],
    ["Term Insurance for Diabetics", "#"],
    ["Wealth Creation Plans", "#"],
    ["Wealth Insurance", "#"],
    ["Term Insurance for Smokers", "#"],
    ["Whole Life Insurance", "/life-insurance-plans/term-insurance/whole-life-insurance.html"],
    ["Partial Withdrawal in ULIP", "#"],
    ["ULIP Surrender", "#"]
  ];
  function buildPopularSearches(doc) {
    const wrap = doc.createElement("div");
    wrap.id = NEW_IDS.popularSearches;
    wrap.append(el(doc, "h2", "Popular searches"));
    const ul = doc.createElement("ul");
    POPULAR_SEARCHES.forEach(([text, path]) => {
      const li = doc.createElement("li");
      const a = doc.createElement("a");
      a.href = path === "#" ? "#" : `${TATAAIA}${path}`;
      a.textContent = text;
      li.append(a);
      ul.append(li);
    });
    wrap.append(ul);
    return wrap;
  }
  function blockName(table) {
    const first = table.querySelector("tr > th, tr > td");
    return first ? normKey(first.textContent) : "";
  }
  function buildSecondCalculator(main, doc) {
    const placeholder = main.querySelector(`#${NEW_IDS.calculator}`);
    if (!placeholder) {
      console.warn("[tataaia-redesign] term calculator placeholder missing");
      return;
    }
    const hero = [...main.querySelectorAll("table")].find((t) => blockName(t) === "hero-calculator" || blockName(t) === "hero calculator");
    const heroImg = hero && hero.querySelector("img");
    const heroCta = hero && [...hero.querySelectorAll("a[href]")].pop();
    const img = heroImg ? heroImg.cloneNode(true) : null;
    const text = [
      el(doc, "p", "Tata AIA Sampoorna Raksha Promise"),
      el(doc, "ul", [
        "<li>Get <strong>\u20B91 Crore life cover</strong> at \u20B9501/month*</li>",
        "<li>Avail up to <strong>18.5% discount</strong> on 1st year premium*</li>",
        "<li>Get <strong>100%</strong> premium back*</li>"
      ].join(""))
    ];
    const cta = doc.createElement("a");
    cta.href = heroCta && heroCta.getAttribute("href") || "https://sellonline.tataaia.com/app/products?product=SRP";
    cta.textContent = "Calculate premium";
    const ctaP = doc.createElement("p");
    ctaP.append(cta);
    const calc = [el(doc, "h2", "Term Calculator \u2013 Check premium in just 2 steps"), ctaP];
    const cells = [
      [hinted14(doc, "image", img)],
      [hinted14(doc, "text", text)],
      [hinted14(doc, "calculator", calc)]
    ];
    placeholder.replaceWith(WebImporter.Blocks.createBlock(doc, { name: "hero-calculator", cells }));
  }
  function simplifyByline(root, doc) {
    const container = root.querySelector(".term-insurance-information-container");
    if (!container) return;
    const list = doc.createElement("ul");
    container.querySelectorAll(".term-insurance-info-card").forEach((card) => {
      var _a, _b;
      const img = card.querySelector("img");
      const label = norm((_a = card.querySelector(".cmp-teaser__description p")) == null ? void 0 : _a.textContent);
      const name = norm((_b = card.querySelector("h2, h3")) == null ? void 0 : _b.textContent);
      if (!name) return;
      const li = doc.createElement("li");
      if (img) {
        const avatar = doc.createElement("img");
        avatar.src = img.getAttribute("src");
        avatar.alt = img.getAttribute("alt") || name;
        li.append(avatar);
      }
      li.append(doc.createTextNode(`${label} `));
      const strong = doc.createElement("strong");
      strong.textContent = name;
      li.append(strong);
      list.append(li);
    });
    const wrap = doc.createElement("div");
    wrap.id = NEW_IDS.byline;
    wrap.append(list);
    container.replaceWith(wrap);
  }
  function promoteHeadings(root, doc) {
    const titles = [
      ...root.querySelectorAll(".enhanceheading .cmp-text > p:first-child"),
      ...root.querySelectorAll(".testinomial-heading .cmp-text > p:first-child"),
      ...root.querySelectorAll(".termplan-container .leadproxytext h3"),
      ...root.querySelectorAll(".whychoose-cards > .cmp-container > .leadproxytext h4")
    ];
    titles.forEach((node) => {
      const text = norm(node.textContent);
      if (!text) return;
      const h2 = doc.createElement("h2");
      h2.textContent = text;
      node.replaceWith(h2);
    });
  }
  var DECORATIVE_IMAGES = /\/(left-desk\.png|right-desk\.png|Blue-left-Line\.svg|Blue-right-Line\.svg|Prev-arrow\.svg|Next-arrow\.svg)(\?|$)/i;
  function removeDecorativeImages(root) {
    [...root.querySelectorAll("img")].filter((img) => DECORATIVE_IMAGES.test(img.getAttribute("src") || "") && !img.closest("table")).forEach((img) => {
      let node = img.closest("picture") || img;
      while (node.parentElement && node.parentElement !== root && node.parentElement.children.length === 1 && !norm(node.parentElement.textContent)) {
        node = node.parentElement;
      }
      node.remove();
    });
  }
  function transform(hookName, element, payload) {
    const doc = element.ownerDocument || document;
    if (hookName === H.before) {
      fillComparisonTable(element, doc);
      fillPremiumCalculator(element);
      const grid = findGrid(element);
      if (!grid) {
        console.error("[tataaia-redesign] main grid not found - page left in live order");
        return;
      }
      DROP.forEach((sel) => {
        const child = gridChild(grid, sel);
        if (child) child.remove();
        else console.warn(`[tataaia-redesign] drop target not found: ${sel}`);
      });
      removePartial(element);
      simplifyByline(element, doc);
      promoteHeadings(element, doc);
      const durationCta = element.querySelector("#container-f4882e2f04 a.cmp-teaser__action-link[href], .life-cover a.cmp-teaser__action-link[href]");
      const delaying = gridChild(grid, "#leadproxytext-1bfd9816cd");
      if (delaying) delaying.append(buildAgeCards(doc, durationCta && durationCta.getAttribute("href")));
      else console.warn('[tataaia-redesign] "How delaying" container not found - age cards not added');
      [
        [NEW_IDS.calculator, () => {
          const d = doc.createElement("div");
          d.id = NEW_IDS.calculator;
          return d;
        }],
        [NEW_IDS.howToBuy, () => buildHowToBuy(doc)],
        [NEW_IDS.popularSearches, () => buildPopularSearches(doc)]
      ].forEach(([, build]) => grid.append(build()));
      const placed = /* @__PURE__ */ new Set();
      ORDER.forEach((sels, i) => {
        sels.forEach((sel) => {
          const child = gridChild(grid, sel);
          if (!child) {
            console.warn(`[tataaia-redesign] design #${i + 1}: not found ${sel}`);
            return;
          }
          if (placed.has(child)) return;
          placed.add(child);
          grid.append(child);
        });
      });
      [...grid.children].forEach((c) => {
        if (!placed.has(c) && norm(c.textContent)) {
          console.log(`[tataaia-redesign] unplaced grid child (left in front): ${c.className}`);
        }
      });
    }
    if (hookName === H.after) {
      buildSecondCalculator(element, doc);
      removeDecorativeImages(element);
    }
  }

  // tools/importer/transformers/tataaia-cleanup.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.before) {
      WebImporter.DOMUtils.remove(element, [
        ".successfailurepopup",
        // <div class="successfailurepopup aem-GridColumn ...">
        ".popup-nudge",
        // <div class="popup-nudge aem-GridColumn ..."> (section.popup-nudge-wrapper.dsp-none)
        ".newcampaignloader",
        // <div class="newcampaignloader aem-GridColumn ..."> page loader
        ".timerfooterform",
        // <div class="timerfooterform aem-GridColumn ..."> (empty)
        ".bgcolorcontainer.srp-btn-revmap.dsp-none",
        // hidden mobile sticky CTA container
        ".api-failure-page.dsp-none",
        // hidden "Can't decide" fallback (NOT the hero, which lacks .dsp-none)
        ".new-result-page",
        // hidden result panel inside the hero calculator wrapper
        ".vymo-api-failure-message"
        // hidden API failure panels (hero + fallback)
      ]);
      WebImporter.DOMUtils.remove(element, [
        "span.swiper-notification",
        "span.swiper-pagination-bullet",
        "div.swiper-pagination",
        // blog carousel pagination (section#TIRA)
        ".pagination-container",
        // testimonial pagination wrapper
        ".swiper-button-prev",
        ".swiper-button-next",
        ".arrow-container",
        // testimonial arrow images
        ".rider-arrow-container",
        // enhance coverage / rider carousels
        ".risk-cards-arrow-container",
        // investment risk cards
        ".rider-arrow-mobile-block"
        // who-buy-cards arrows (.extendedimage.swiper-button-disabled)
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_talic_0",
        // Adobe ID syncing iframe
        'iframe[src*="doubleclick.net"]',
        // floodlight tracking iframes
        "#vizury-notification-container",
        // lemnisk onsite notification widget
        "#tSrngBEkWlDy",
        "#loader",
        // div#loader.ta-loader
        "#ariaAlertRegion",
        "#keyboardWrapper",
        // virtual keyboard
        "#datepickers-container",
        // datepicker widget
        "#chatScript",
        ".chatbot",
        // <div class="chatbot aem-GridColumn ...">
        "link",
        "script",
        "style",
        "noscript"
      ]);
    }
    if (hookName === H2.after) {
      const header = element.querySelector("div.container.new-header_sec_revamp");
      if (header) {
        const xf = header.closest(".experiencefragment");
        (xf || header).remove();
      }
      WebImporter.DOMUtils.remove(element, [
        "div.container.new-header_sec_revamp",
        ".new-header",
        ".newheadercontainer"
      ]);
      const footer = element.querySelector("footer.talic-footer");
      if (footer) {
        const wrap = footer.closest(".footer");
        (wrap || footer).remove();
      }
      WebImporter.DOMUtils.remove(element, ["footer.talic-footer"]);
      WebImporter.DOMUtils.remove(element, [".breadcrumb"]);
      WebImporter.DOMUtils.remove(element, [
        ".testimonial_video_popup",
        // hidden video popup shell next to .testinomial-cards
        'iframe:not([src*="youtube"])',
        "input",
        "link",
        "noscript"
      ]);
      element.querySelectorAll("[onclick], [data-analytics], [data-track]").forEach((el2) => {
        el2.removeAttribute("onclick");
        el2.removeAttribute("data-analytics");
        el2.removeAttribute("data-track");
      });
    }
  }

  // tools/importer/transformers/tataaia-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el2 = root.querySelector(sel);
      if (el2) return el2;
    }
    return null;
  }
  function transform3(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
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
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
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

  // tools/importer/import-term-insurance-redesign.js
  var parsers = {
    "hero-calculator": parse,
    "cards-pricing": parse2,
    "cards-plan": parse3,
    "cards-icon-list": parse4,
    "carousel-persona": parse5,
    "embed-video": parse6,
    "cards-plan-links": parse7,
    "cards-feature-grid": parse8,
    "columns-calculator": parse9,
    "cards-stats": parse10,
    "accordion-seo": parse11,
    "table-rounded": parse12,
    "table-comparison": parse13,
    "cards-label-box": parse14,
    "columns-duration": parse15,
    "cards-text-tile": parse16,
    "columns-image-table": parse17,
    "carousel-reviews": parse18,
    "form-callback": parse19,
    "cards-article": parse20,
    "tabs-faq": parse21
  };
  var PAGE_TEMPLATE = {
    "name": "term-insurance-redesign",
    "description": "Tata AIA term insurance page - Figma redesign order (migration-work/figma-ref/redesign-spec.md): reordered live sections, dropped sections removed, new calculator / age cards / how-to-buy / popular-searches sections",
    "urls": [
      "https://www.tataaia.com/life-insurance-plans/term-insurance.html"
    ],
    "blocks": [
      {
        "name": "hero-calculator",
        "instances": [
          ".nolead-calc-banner-wrapper .term-calculator-container"
        ]
      },
      {
        "name": "cards-pricing",
        "instances": [
          ".insurance-coverage-cards.container-category-price"
        ]
      },
      {
        "name": "cards-plan",
        "instances": [
          ".coveragecardcontainer.content-center",
          ".categorypage-fourcards.coveragecardcontainer"
        ]
      },
      {
        "name": "cards-icon-list",
        "instances": [
          "#container-526c3450ed",
          "#container-30eac4a7ea"
        ]
      },
      {
        "name": "carousel-persona",
        "instances": [
          ".who-buy-cards-parent.ta-container .who-buy-cards"
        ]
      },
      {
        "name": "embed-video",
        "instances": [
          ".youtube-center-brush .youtubevideo"
        ]
      },
      {
        "name": "cards-plan-links",
        "instances": [
          ".termplan-cards"
        ]
      },
      {
        "name": "cards-feature-grid",
        "instances": [
          ".investment-plan-cards-redesign"
        ]
      },
      {
        "name": "columns-calculator",
        "instances": [
          ".newpremiumcalc-container .newcalculatepremium"
        ]
      },
      {
        "name": "cards-stats",
        "instances": [
          ".whychoose-cards > .cmp-container > .container"
        ]
      },
      {
        "name": "accordion-seo",
        "instances": [
          ".faq-accordion-investment-plan .ta-fq-content-w",
          ".accordion-first-section > .cmp-accordion > .cmp-accordion__item:nth-of-type(2)"
        ]
      },
      {
        "name": "table-rounded",
        "instances": [
          ".term-insurance-table",
          ".term-table-text.four-column-table",
          ".term-table-text.table-head-red",
          ".term-table-text.document-table-center",
          '[id="40"] > .term-table-text'
        ]
      },
      {
        "name": "table-comparison",
        "instances": [
          ".compare-term-plan-table .compare-table-wrapper"
        ]
      },
      {
        "name": "cards-label-box",
        "instances": [
          ".leadproxyteaser.newlaunch-var-two"
        ]
      },
      {
        "name": "columns-duration",
        "instances": [
          ".life-cover.ta-container"
        ]
      },
      {
        "name": "cards-text-tile",
        "instances": [
          ".who-buy-cards-mob-swiper .who-buy-cards"
        ]
      },
      {
        "name": "columns-image-table",
        "instances": [
          ".claim-image-table"
        ]
      },
      {
        "name": "carousel-reviews",
        "instances": [
          ".testinomial-cards"
        ]
      },
      {
        "name": "form-callback",
        "instances": [
          ".tte-form-countrycode"
        ]
      },
      {
        "name": "cards-article",
        "instances": [
          ".blog-corouselstatic"
        ]
      },
      {
        "name": "tabs-faq",
        "instances": [
          ".faq-tabs"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Page title and intro",
        "selector": [
          ".breadcrumb"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 1
      },
      {
        "id": "section-2",
        "name": "Above-the-fold promo + calculator",
        "selector": [
          ".nolead-calc-banner-wrapper"
        ],
        "style": null,
        "blocks": [
          "hero-calculator"
        ],
        "defaultContent": [],
        "designOrder": 2
      },
      {
        "id": "section-3",
        "name": "In-page anchor navigation",
        "selector": [
          ".newsecondarynavigation"
        ],
        "style": "anchor-nav",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 3
      },
      {
        "id": "section-4",
        "name": "Coverage tier price cards + reviewer byline",
        "selector": [
          "#container-f3864d3a26"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-pricing"
        ],
        "defaultContent": [],
        "designOrder": 4
      },
      {
        "id": "section-4b",
        "name": "Author / reviewer byline",
        "selector": [
          "#redesign-byline"
        ],
        "style": "light-blue, byline",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 4
      },
      {
        "id": "section-6",
        "name": "What is term insurance",
        "selector": [
          "#leadproxytext-5179f9a894"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 5
      },
      {
        "id": "section-9",
        "name": "How a term plan works",
        "selector": [
          "div.container.responsivegrid.mob-pt-20.pt-30"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 6
      },
      {
        "id": "section-8",
        "name": "Bestselling plans + example",
        "selector": [
          ".mob-mt-5.mt-40.enhancecoveragecontainer.enhance-container-tab"
        ],
        "style": null,
        "blocks": [
          "cards-plan"
        ],
        "defaultContent": [],
        "designOrder": 7
      },
      {
        "id": "section-13",
        "name": "Term plan quick links slider",
        "selector": [
          "#container-f4164bf945"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-plan-links"
        ],
        "defaultContent": [],
        "designOrder": 8
      },
      {
        "id": "section-10",
        "name": "Why buy term insurance",
        "selector": [
          "#container-d2b88fc833"
        ],
        "style": null,
        "blocks": [
          "cards-icon-list"
        ],
        "defaultContent": [],
        "designOrder": 9
      },
      {
        "id": "section-12",
        "name": "Explainer video",
        "selector": [
          "#container-cd5dfce657"
        ],
        "style": "light-blue",
        "blocks": [
          "embed-video"
        ],
        "defaultContent": [],
        "designOrder": 10
      },
      {
        "id": "section-14",
        "name": "Features of term insurance",
        "selector": [
          "#container-1ba1e4524a"
        ],
        "style": null,
        "blocks": [
          "cards-feature-grid"
        ],
        "defaultContent": [],
        "designOrder": 11
      },
      {
        "id": "section-15",
        "name": "1 Crore premium calculator",
        "selector": [
          ".newpremiumcalc-container"
        ],
        "style": "light-blue",
        "blocks": [
          "columns-calculator"
        ],
        "defaultContent": [],
        "designOrder": 12
      },
      {
        "id": "section-16",
        "name": "Why choose Tata AIA stats",
        "selector": [
          ".whychoose-cards"
        ],
        "style": null,
        "blocks": [
          "cards-stats"
        ],
        "defaultContent": [],
        "designOrder": 13
      },
      {
        "id": "section-17",
        "name": "Who should buy slider",
        "selector": [
          "#container-217c32ab0c"
        ],
        "style": "light-blue",
        "blocks": [
          "carousel-persona"
        ],
        "defaultContent": [],
        "designOrder": 14
      },
      {
        "id": "section-18",
        "name": "Life stages accordion",
        "selector": [
          "#container-9d7e57cecd"
        ],
        "style": null,
        "blocks": [
          "accordion-seo"
        ],
        "defaultContent": [],
        "designOrder": 15
      },
      {
        "id": "section-20",
        "name": "Types of term plans",
        "selector": [
          "#container-f942407c45"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-feature-grid"
        ],
        "defaultContent": [],
        "designOrder": 16
      },
      {
        "id": "section-21",
        "name": "Term vs whole life table",
        "selector": [
          "#leadproxytext-4fac5f6122"
        ],
        "style": null,
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": [],
        "designOrder": 17
      },
      {
        "id": "section-22",
        "name": "Best plans table",
        "selector": [
          "#container-5caf9ff5af"
        ],
        "style": "light-blue",
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": [],
        "designOrder": 18
      },
      {
        "id": "section-23",
        "name": "Best plans cards",
        "selector": [
          ".rider-bg.faq_acc_with-viewallbtn"
        ],
        "style": null,
        "blocks": [
          "cards-plan"
        ],
        "defaultContent": [],
        "designOrder": 19
      },
      {
        "id": "section-23b",
        "name": "How to choose the best term plan accordion",
        "selector": [
          "#container-5030569737"
        ],
        "style": "light-blue",
        "blocks": [
          "accordion-seo"
        ],
        "defaultContent": [],
        "designOrder": "19b"
      },
      {
        "id": "section-24",
        "name": "Choose plan as per needs",
        "selector": [
          "#container-fadf1d54e1"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 20
      },
      {
        "id": "section-25",
        "name": "Plan comparison table + explanation",
        "selector": [
          "#container-4a5dfb47f8"
        ],
        "style": "light-blue",
        "blocks": [
          "table-comparison"
        ],
        "defaultContent": [],
        "designOrder": 21
      },
      {
        "id": "section-26",
        "name": "Family financial future callout",
        "selector": [
          "#container-2c038f2903"
        ],
        "style": null,
        "blocks": [
          "cards-label-box"
        ],
        "defaultContent": [],
        "designOrder": 22
      },
      {
        "id": "section-new-term-calculator",
        "name": "NEW Term Calculator - check premium in 2 steps",
        "selector": [
          "#redesign-term-calculator"
        ],
        "style": "light-blue",
        "blocks": [
          "hero-calculator"
        ],
        "defaultContent": [],
        "designOrder": 23
      },
      {
        "id": "section-28",
        "name": "Factors affecting premiums",
        "selector": [
          "#container-33e50a7826"
        ],
        "style": null,
        "blocks": [
          "cards-icon-list"
        ],
        "defaultContent": [],
        "designOrder": 24
      },
      {
        "id": "section-29",
        "name": "Cover needed",
        "selector": [
          "#container-771a9a44bf"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 25
      },
      {
        "id": "section-30",
        "name": "Infographic image",
        "selector": [
          "#container-8edf4bc779"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 26
      },
      {
        "id": "section-31",
        "name": "Sum assured importance",
        "selector": [
          "#container-9dfa60f0af"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 27
      },
      {
        "id": "section-32",
        "name": "Policy period",
        "selector": [
          "#container-1c542e2ae3"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 28
      },
      {
        "id": "section-33",
        "name": "Right duration promo",
        "selector": [
          "#container-f4882e2f04"
        ],
        "style": "light-blue",
        "blocks": [
          "columns-duration"
        ],
        "defaultContent": [],
        "designOrder": 29
      },
      {
        "id": "section-33b",
        "name": "How delaying term insurance can cost you + NEW age cards",
        "selector": [
          "#leadproxytext-1bfd9816cd"
        ],
        "style": null,
        "blocks": [
          "cards-stats"
        ],
        "defaultContent": [],
        "designOrder": 30
      },
      {
        "id": "section-34",
        "name": "Affordable tips tiles",
        "selector": [
          "#container-defa9db8ad"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-text-tile"
        ],
        "defaultContent": [],
        "designOrder": 31
      },
      {
        "id": "section-35",
        "name": "Payout options table",
        "selector": [
          "#leadproxytext-8e6b531b6b"
        ],
        "style": null,
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": [],
        "designOrder": 32
      },
      {
        "id": "section-36",
        "name": "What is a rider",
        "selector": [
          "#container-8332a7d055"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 33
      },
      {
        "id": "section-37",
        "name": "Rider types",
        "selector": [
          '[id="27"]'
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 34
      },
      {
        "id": "section-38",
        "name": "Riders importance",
        "selector": [
          "#container-b2a7b4132b"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 35
      },
      {
        "id": "section-39",
        "name": "Critical illness rider + rising health risks",
        "selector": [
          ".mob-mb-20.page-container.max-wid550"
        ],
        "style": null,
        "blocks": [
          "cards-label-box"
        ],
        "defaultContent": [],
        "designOrder": 36
      },
      {
        "id": "section-39b",
        "name": "Top riders",
        "selector": [
          "#container-16ed44abb5"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 37
      },
      {
        "id": "section-40",
        "name": "Plan benefits",
        "selector": [
          "#container-d35e3a192d"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 38
      },
      {
        "id": "section-41",
        "name": "Eligibility",
        "selector": [
          "#leadproxytext-ae2ba99d42"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 39
      },
      {
        "id": "section-42",
        "name": "Covered vs not covered",
        "selector": [
          "#container-1618092523"
        ],
        "style": null,
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": [],
        "designOrder": 40
      },
      {
        "id": "section-43",
        "name": "Common mistakes",
        "selector": [
          "#leadproxytext-3a445fa119"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 41
      },
      {
        "id": "section-44",
        "name": "Why buy online tiles",
        "selector": [
          "#container-92e8aae3a5"
        ],
        "style": null,
        "blocks": [
          "cards-text-tile"
        ],
        "defaultContent": [],
        "designOrder": 42
      },
      {
        "id": "section-new-how-to-buy",
        "name": "NEW How to buy term insurance",
        "selector": [
          "#redesign-how-to-buy"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 43
      },
      {
        "id": "section-45",
        "name": "Documents list",
        "selector": [
          "#container-b2fe259e25"
        ],
        "style": null,
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": [],
        "designOrder": 44
      },
      {
        "id": "section-45b",
        "name": "Claim process",
        "selector": [
          "#leadproxytext-4cf3e377b6"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 45
      },
      {
        "id": "section-46",
        "name": "Avoid claim rejection",
        "selector": [
          "#container-6f11a5e168"
        ],
        "style": null,
        "blocks": [
          "cards-feature-grid"
        ],
        "defaultContent": [],
        "designOrder": 46
      },
      {
        "id": "section-47",
        "name": "Claim documents table",
        "selector": [
          "#leadproxytext-7f29512ee4"
        ],
        "style": "light-blue",
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": [],
        "designOrder": 47
      },
      {
        "id": "section-48",
        "name": "Claim approval time",
        "selector": [
          "#container-6ed3066365"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 48
      },
      {
        "id": "section-49",
        "name": "Claim settlement ratio",
        "selector": [
          "#leadproxytext-45dbbbfc29"
        ],
        "style": "light-blue",
        "blocks": [
          "columns-image-table"
        ],
        "defaultContent": [],
        "designOrder": 49
      },
      {
        "id": "section-50",
        "name": "Key terms",
        "selector": [
          "#container-74e18de16e"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [],
        "designOrder": 50
      },
      {
        "id": "section-51",
        "name": "Takeaways",
        "selector": [
          "#leadproxytext-c876bebae1"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 51
      },
      {
        "id": "section-52",
        "name": "Customer reviews carousel",
        "selector": [
          ".voiceof-happy-customer"
        ],
        "style": null,
        "blocks": [
          "carousel-reviews"
        ],
        "defaultContent": [],
        "designOrder": 52
      },
      {
        "id": "section-53",
        "name": "Call-back lead form",
        "selector": [
          ".tte-form-redesign"
        ],
        "style": "light-blue",
        "blocks": [
          "form-callback"
        ],
        "defaultContent": [],
        "designOrder": 53
      },
      {
        "id": "section-54",
        "name": "Related articles slider",
        "selector": [
          "#container-0e5e661886"
        ],
        "style": null,
        "blocks": [
          "cards-article"
        ],
        "defaultContent": [],
        "designOrder": 54
      },
      {
        "id": "section-55",
        "name": "FAQs, disclaimer, last updated",
        "selector": [
          "#container-593dd46a6a"
        ],
        "style": null,
        "blocks": [
          "tabs-faq",
          "accordion-seo"
        ],
        "defaultContent": [],
        "designOrder": 55
      },
      {
        "id": "section-new-popular-searches",
        "name": "NEW Popular searches",
        "selector": [
          "#redesign-popular-searches"
        ],
        "style": "link-pills",
        "blocks": [],
        "defaultContent": [],
        "designOrder": 56
      }
    ]
  };
  var transformers = [
    // redesign MUST run first: its beforeTransform drops/reorders grid children before
    // tataaia-sections inserts the <hr> section breaks
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
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
  var import_term_insurance_redesign_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
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
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath("/life-insurance-plans/term-insurance-redesign");
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_term_insurance_redesign_exports);
})();
