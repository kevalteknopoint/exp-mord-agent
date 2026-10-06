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

  // tools/importer/import-life-insurance-plans.js
  var import_life_insurance_plans_exports = {};
  __export(import_life_insurance_plans_exports, {
    default: () => import_life_insurance_plans_default
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

  // tools/importer/parsers/tabs-illustration.js
  function imgFrom(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse3(element, { document: document2 }) {
    const tabs = [...element.querySelectorAll('.cmp-tabs__tablist > .cmp-tabs__tab, [role="tab"]')];
    const panels = [...element.querySelectorAll(".cmp-tabs__tabpanel")];
    const cells = [];
    panels.forEach((panel, i) => {
      const label = tabs[i] ? tabs[i].textContent.trim() : "";
      const titleEl = panel.querySelector(".benefits-ills-card-title h4, .benefits-ills-card-title h3, .benefits-ills-card-title h2");
      const titleCell = document2.createDocumentFragment();
      const titleText = label || titleEl && titleEl.textContent.trim() || "";
      if (titleText) {
        titleCell.append(document2.createComment(" field:title "), document2.createTextNode(titleText));
      }
      const personaCell = document2.createDocumentFragment();
      const avatar = imgFrom(document2, panel.querySelector(".benefits-ills-main-image img"));
      if (avatar) personaCell.append(document2.createComment(" field:persona_image "), avatar);
      const personaText = [];
      if (titleEl) {
        const h = document2.createElement("h4");
        h.textContent = titleEl.textContent.trim();
        personaText.push(h);
      }
      panel.querySelectorAll(".benefits-ills-userdetails-section > p").forEach((p) => {
        if (p.textContent.trim()) personaText.push(p);
      });
      const details = [...panel.querySelectorAll(".benefits-ills-user-details > li")];
      if (details.length) {
        const ul = document2.createElement("ul");
        details.forEach((d) => {
          const li = document2.createElement("li");
          const p = d.querySelector(".userdetails-text p") || d;
          [...p.childNodes].forEach((n) => {
            if (n.nodeType === 1 && n.tagName === "IMG") return;
            if (n.nodeType === 1 && n.classList.contains("defaultSpan")) {
              const s = document2.createElement("strong");
              s.textContent = n.textContent.trim();
              li.append(s);
            } else li.append(n.cloneNode(true));
          });
          ul.append(li);
        });
        personaText.push(ul);
      }
      if (personaText.length) {
        personaCell.append(document2.createComment(" field:persona_text "));
        personaText.forEach((n) => personaCell.append(n));
      }
      const timelineCell = document2.createDocumentFragment();
      const steps = [...panel.querySelectorAll(".benefits-ills-swiper-wrapper .cmp-teaser, .proxyteaser .cmp-teaser")].filter((s, idx, arr) => arr.indexOf(s) === idx);
      const ol = document2.createElement("ol");
      steps.forEach((step, idx) => {
        const img = imgFrom(document2, step.querySelector(".cmp-teaser__image img"));
        if (img && idx < 3) {
          timelineCell.append(document2.createComment(` field:timeline_image${idx + 1} `), img);
        }
        const li = document2.createElement("li");
        if (img && idx >= 3) {
          const ip = document2.createElement("p");
          ip.append(img);
          li.append(ip);
        }
        const pre = step.querySelector(".cmp-teaser__pretitle");
        if (pre && pre.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = pre.textContent.trim();
          li.append(p);
        }
        const desc = step.querySelector(".cmp-teaser__description");
        if (desc) {
          const h = desc.querySelector("h1, h2, h3, h4, h5, h6");
          if (h) {
            const p = document2.createElement("p");
            const s = document2.createElement("strong");
            s.textContent = h.textContent.trim();
            p.append(s);
            li.append(p);
          }
          desc.querySelectorAll(":scope > p").forEach((p) => {
            if (p.textContent.trim()) li.append(p);
          });
        }
        if (li.childNodes.length) ol.append(li);
      });
      const timelineText = [];
      if (ol.children.length) timelineText.push(ol);
      const cta = panel.querySelector(".button a.cmp-button, a.cmp-button");
      if (cta) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.trim();
        p.append(a);
        timelineText.push(p);
      }
      if (timelineText.length) {
        timelineCell.append(document2.createComment(" field:timeline_text "));
        timelineText.forEach((n) => timelineCell.append(n));
      }
      if (!titleText && !personaText.length && !timelineText.length) return;
      cells.push([
        titleText ? titleCell : "",
        personaCell.childNodes.length ? personaCell : "",
        timelineCell.childNodes.length ? timelineCell : ""
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-illustration", cells });
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
  function parse4(element, { document: document2 }) {
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
    let items = [...element.querySelectorAll(".cmp-teaser")];
    if (!items.length) items = [...element.querySelectorAll(":scope > .teaser, :scope > div")];
    const cells = [];
    items.forEach((item) => {
      const icon = imgFrom2(document2, item.querySelector(".cmp-teaser__image img, img.cmp-image__image"));
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
  function imgFrom3(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse6(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".cmp-teaser")];
    if (!slides.length) slides = [...element.querySelectorAll(".swiper-slide")];
    const cells = [];
    slides.forEach((slide) => {
      const avatar = imgFrom3(document2, slide.querySelector(".cmp-teaser__image img, img.cmp-image__image"));
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
  function parse7(element, { document: document2 }) {
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
    let tiles = [...element.querySelectorAll(".cmp-teaser")];
    if (!tiles.length) tiles = [...element.querySelectorAll(".swiper-slide, .teaser")];
    const cells = [];
    tiles.forEach((tile) => {
      const img = imgFrom4(document2, tile.querySelector(".cmp-teaser__image img, img.cmp-image__image"));
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
  function imgFrom5(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse9(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".cmp-teaser")];
    if (!items.length) items = [...element.querySelectorAll(".teaser")];
    const cells = [];
    items.forEach((item) => {
      const srcImg = item.querySelector(".cmp-teaser__image img, img.cmp-image__image");
      const alt = srcImg ? (srcImg.getAttribute("alt") || "").trim() : "";
      const isNumber = /^\d{1,3}$/.test(alt);
      const icon = isNumber ? null : imgFrom5(document2, srcImg);
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
  function parse10(element, { document: document2 }) {
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
  function imgFrom6(document2, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse11(element, { document: document2 }) {
    const tiles = [...element.querySelectorAll(".cmp-teaser")];
    if (!tiles.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    tiles.forEach((tile) => {
      const icon = imgFrom6(document2, tile.querySelector(".cmp-teaser__image img"));
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
  function cleanText(el) {
    return el ? el.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim() : "";
  }
  function parse12(element, { document: document2 }) {
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

  // tools/importer/parsers/cards-factor.js
  function parse13(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".investment-risk-cards-wrapper .cmp-teaser")];
    if (!cards.length) cards = [...element.querySelectorAll(".cmp-teaser")];
    const cells = [];
    cards.forEach((card) => {
      const text = [];
      const title = card.querySelector(".cmp-teaser__description h1, .cmp-teaser__description h2, .cmp-teaser__description h3, .cmp-teaser__description h4, .cmp-teaser__title");
      if (title && title.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = title.textContent.replace(/ /g, " ").trim();
        text.push(h);
      }
      card.querySelectorAll(".card-details .card_text, .card-details > p").forEach((t) => {
        const v = t.textContent.replace(/ /g, " ").trim();
        if (!v) return;
        const p = document2.createElement("p");
        p.textContent = v;
        text.push(p);
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-factor", cells });
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
  function parse14(element, { document: document2 }) {
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
  function parse15(element, { document: document2 }) {
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
  function parse16(element, { document: document2 }) {
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
  function parse17(element, { document: document2 }) {
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
  function parse18(element, { document: document2 }) {
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
  function parse19(element, { document: document2 }) {
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
    const el = document2.createElement(tag);
    el.textContent = text;
    return el;
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
  function parse20(element, { document: document2 }) {
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
  function parse21(element, { document: document2 }) {
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
  function parse22(element, { document: document2 }) {
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
  function parse23(element, { document: document2 }) {
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

  // tools/importer/transformers/tataaia-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
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
    if (hookName === H.after) {
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
      element.querySelectorAll("[onclick], [data-analytics], [data-track]").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-analytics");
        el.removeAttribute("data-track");
      });
    }
  }

  // tools/importer/transformers/tataaia-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
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

  // tools/importer/import-life-insurance-plans.js
  var parsers = {
    "hero-calculator": parse,
    "cards-pricing": parse2,
    "tabs-illustration": parse3,
    "cards-plan": parse4,
    "cards-icon-list": parse5,
    "carousel-persona": parse6,
    "embed-video": parse7,
    "cards-plan-links": parse8,
    "cards-feature-grid": parse9,
    "columns-calculator": parse10,
    "cards-stats": parse11,
    "accordion-seo": parse12,
    "cards-factor": parse13,
    "table-rounded": parse14,
    "table-comparison": parse15,
    "cards-label-box": parse16,
    "columns-duration": parse17,
    "cards-text-tile": parse18,
    "columns-image-table": parse19,
    "carousel-reviews": parse20,
    "form-callback": parse21,
    "cards-article": parse22,
    "tabs-faq": parse23
  };
  var PAGE_TEMPLATE = {
    "name": "life-insurance-plans",
    "description": "Tata AIA life insurance product landing page (term insurance): calculator hero, long-form SEO content, plan cards, tables, carousels, FAQs",
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
        "name": "tabs-illustration",
        "instances": [
          ".benefits-ills-pure-protection-container .tabs.panelcontainer"
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
        "name": "cards-factor",
        "instances": [
          ".investment-risk-main-wrapper"
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
        "defaultContent": []
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
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "In-page anchor navigation",
        "selector": [
          ".newsecondarynavigation"
        ],
        "style": "anchor-nav",
        "blocks": [],
        "defaultContent": []
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
        "defaultContent": []
      },
      {
        "id": "section-5",
        "name": "Interlinking pill links",
        "selector": [
          ".interlinking-widget"
        ],
        "style": "grey, link-pills",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-6",
        "name": "What is term insurance",
        "selector": [
          "#leadproxytext-5179f9a894"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-7",
        "name": "Benefits illustration (tabbed)",
        "selector": [
          ".benefits-ills-mob-font-20"
        ],
        "style": null,
        "blocks": [
          "tabs-illustration"
        ],
        "defaultContent": []
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
        "defaultContent": []
      },
      {
        "id": "section-9",
        "name": "How a term plan works",
        "selector": [
          "div.container.responsivegrid.mob-pt-20.pt-30"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-10",
        "name": "Why buy term insurance",
        "selector": [
          "#container-d2b88fc833"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-icon-list"
        ],
        "defaultContent": []
      },
      {
        "id": "section-11",
        "name": "Persona examples slider",
        "selector": [
          "#container-916e0a3aec"
        ],
        "style": null,
        "blocks": [
          "carousel-persona"
        ],
        "defaultContent": []
      },
      {
        "id": "section-12",
        "name": "Explainer video",
        "selector": [
          "#container-cd5dfce657"
        ],
        "style": null,
        "blocks": [
          "embed-video"
        ],
        "defaultContent": []
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
        "defaultContent": []
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
        "defaultContent": []
      },
      {
        "id": "section-15",
        "name": "1 Crore premium calculator",
        "selector": [
          ".newpremiumcalc-container"
        ],
        "style": null,
        "blocks": [
          "columns-calculator"
        ],
        "defaultContent": []
      },
      {
        "id": "section-16",
        "name": "Why choose Tata AIA stats",
        "selector": [
          ".whychoose-cards"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-stats"
        ],
        "defaultContent": []
      },
      {
        "id": "section-17",
        "name": "Who should buy slider",
        "selector": [
          "#container-217c32ab0c"
        ],
        "style": null,
        "blocks": [
          "carousel-persona"
        ],
        "defaultContent": []
      },
      {
        "id": "section-18",
        "name": "Life stages accordion",
        "selector": [
          "#container-9d7e57cecd"
        ],
        "style": "light-blue",
        "blocks": [
          "accordion-seo"
        ],
        "defaultContent": []
      },
      {
        "id": "section-19",
        "name": "Premium factors bordered cards",
        "selector": [
          "#container-adaee19218"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-factor"
        ],
        "defaultContent": []
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
        "defaultContent": []
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
        "defaultContent": []
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
        "defaultContent": []
      },
      {
        "id": "section-23",
        "name": "Best plans cards + how to choose accordion",
        "selector": [
          ".rider-bg.faq_acc_with-viewallbtn"
        ],
        "style": null,
        "blocks": [
          "cards-plan",
          "accordion-seo"
        ],
        "defaultContent": []
      },
      {
        "id": "section-24",
        "name": "Choose plan as per needs",
        "selector": [
          "#container-fadf1d54e1"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-25",
        "name": "Claim approval + plan comparison",
        "selector": [
          "#container-4a5dfb47f8"
        ],
        "style": null,
        "blocks": [
          "table-comparison"
        ],
        "defaultContent": []
      },
      {
        "id": "section-26",
        "name": "Family financial future callout",
        "selector": [
          "#container-2c038f2903"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-label-box"
        ],
        "defaultContent": []
      },
      {
        "id": "section-27",
        "name": "When to buy table",
        "selector": [
          "#container-fc5f3371ba"
        ],
        "style": null,
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": []
      },
      {
        "id": "section-28",
        "name": "Factors affecting premiums",
        "selector": [
          "#container-33e50a7826"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-icon-list"
        ],
        "defaultContent": []
      },
      {
        "id": "section-29",
        "name": "NRI + cover needed",
        "selector": [
          "#container-b2c8b612e3"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-30",
        "name": "Infographic image",
        "selector": [
          "#container-8edf4bc779"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-31",
        "name": "Sum assured importance",
        "selector": [
          "#container-9dfa60f0af"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-32",
        "name": "Policy period",
        "selector": [
          "#container-1c542e2ae3"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-33",
        "name": "Right duration promo + age factor",
        "selector": [
          "#container-f4882e2f04"
        ],
        "style": null,
        "blocks": [
          "columns-duration"
        ],
        "defaultContent": []
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
        "defaultContent": []
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
        "defaultContent": []
      },
      {
        "id": "section-36",
        "name": "What is a rider",
        "selector": [
          "#container-8332a7d055"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-37",
        "name": "ULIP note + rider types",
        "selector": [
          '[id="27"]'
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-38",
        "name": "Riders importance",
        "selector": [
          "#container-b2a7b4132b"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-39",
        "name": "Critical illness rider + top riders",
        "selector": [
          ".mob-mb-20.page-container.max-wid550"
        ],
        "style": null,
        "blocks": [
          "cards-label-box"
        ],
        "defaultContent": []
      },
      {
        "id": "section-40",
        "name": "Plan benefits",
        "selector": [
          "#container-d35e3a192d"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-41",
        "name": "Eligibility",
        "selector": [
          "#leadproxytext-ae2ba99d42"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-42",
        "name": "Covered vs not covered",
        "selector": [
          "#container-1618092523"
        ],
        "style": "light-blue",
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": []
      },
      {
        "id": "section-43",
        "name": "Common mistakes",
        "selector": [
          "#leadproxytext-3a445fa119"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-44",
        "name": "Why buy online tiles",
        "selector": [
          "#container-92e8aae3a5"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-text-tile"
        ],
        "defaultContent": []
      },
      {
        "id": "section-45",
        "name": "Documents list + claim process",
        "selector": [
          "#container-b2fe259e25"
        ],
        "style": null,
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": []
      },
      {
        "id": "section-46",
        "name": "Avoid claim rejection",
        "selector": [
          "#container-6f11a5e168"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-feature-grid"
        ],
        "defaultContent": []
      },
      {
        "id": "section-47",
        "name": "Claim documents table",
        "selector": [
          "#leadproxytext-7f29512ee4"
        ],
        "style": null,
        "blocks": [
          "table-rounded"
        ],
        "defaultContent": []
      },
      {
        "id": "section-48",
        "name": "Claim approval time",
        "selector": [
          "#container-6ed3066365"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-49",
        "name": "GST + claim settlement ratio",
        "selector": [
          "#container-e553947e67"
        ],
        "style": null,
        "blocks": [
          "columns-image-table"
        ],
        "defaultContent": []
      },
      {
        "id": "section-50",
        "name": "Key terms",
        "selector": [
          "#container-74e18de16e"
        ],
        "style": "light-blue",
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-51",
        "name": "Takeaways + insights",
        "selector": [
          "#leadproxytext-c876bebae1"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "section-52",
        "name": "Customer reviews carousel",
        "selector": [
          ".voiceof-happy-customer"
        ],
        "style": "light-blue",
        "blocks": [
          "carousel-reviews"
        ],
        "defaultContent": []
      },
      {
        "id": "section-53",
        "name": "Call-back lead form",
        "selector": [
          ".tte-form-redesign"
        ],
        "style": null,
        "blocks": [
          "form-callback"
        ],
        "defaultContent": []
      },
      {
        "id": "section-54",
        "name": "Related articles slider",
        "selector": [
          "#container-0e5e661886"
        ],
        "style": "light-blue",
        "blocks": [
          "cards-article"
        ],
        "defaultContent": []
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
        "defaultContent": []
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
  var import_life_insurance_plans_default = {
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
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "").split("/").pop();
      const path = WebImporter.FileUtils.sanitizePath(`/${rawPath || "index"}`);
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
  return __toCommonJS(import_life_insurance_plans_exports);
})();
