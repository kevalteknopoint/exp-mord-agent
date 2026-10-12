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
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  var ORIGIN = "https://www.idfcfirst.bank.in";
  var PLACEHOLDER = /loader\.(jpg|png|gif)|^data:|19873fe2a58527d55d1ccd2cddb3ea00/i;
  function absolute(src) {
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    if (src.startsWith("//")) return `https:${src}`;
    if (src.startsWith("/")) return `${ORIGIN}${src}`;
    return src;
  }
  function firstSrc(srcset) {
    return (srcset || "").split(",")[0].trim().split(/\s+/)[0] || "";
  }
  function resolveImage(picture, document2) {
    if (!picture) return null;
    const img = picture.querySelector("img");
    const candidates = [];
    picture.querySelectorAll("source").forEach((s) => {
      const media = s.getAttribute("media") || "";
      const url2 = firstSrc(s.getAttribute("srcset") || s.getAttribute("data-srcset"));
      if (url2) candidates.push({ url: url2, desktop: /min-width/.test(media) });
    });
    const desktop = candidates.find((c) => c.desktop) || candidates[0];
    let url = desktop ? desktop.url : "";
    if (!url && img) url = img.getAttribute("data-src") || "";
    if (!url && img) url = img.getAttribute("src") || "";
    if (!url || PLACEHOLDER.test(url)) {
      const alt = img && (img.getAttribute("data-src") || "");
      url = alt && !PLACEHOLDER.test(alt) ? alt : "";
    }
    if (!url) return null;
    const out = document2.createElement("img");
    out.src = url;
    out.alt = img ? (img.getAttribute("alt") || "").trim() : "";
    return out;
  }
  function parse(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".embla__container > .embla__slide")];
    if (!slides.length) slides = [...element.querySelectorAll(".embla__slide")];
    const cells = [];
    slides.forEach((slide) => {
      const sources = [...slide.querySelectorAll(".nhb-video video source[src], video source[src]")];
      const desktopSource = sources.find((s) => /min-width/.test(s.getAttribute("media") || "")) || sources[0];
      const videoUrl = desktopSource ? absolute(desktopSource.getAttribute("src")) : "";
      const image = videoUrl ? null : resolveImage(slide.querySelector(".nhb-image picture, picture"), document2);
      let descs = [...slide.querySelectorAll(".nhb-desc")];
      if (!descs.length) descs = [slide];
      descs.forEach((desc) => {
        const headingEl = desc.querySelector(".h1, h1, h2");
        const headingText = headingEl ? headingEl.textContent.replace(/\s+/g, " ").trim() : "";
        const textEl = desc.querySelector("p.txt");
        const text = textEl ? textEl.textContent.replace(/\s+/g, " ").trim() : "";
        const ctas = [...desc.querySelectorAll(".btn-group a[href], a.btn-red[href], a.btn-underline[href]")].filter((a, i, arr) => arr.indexOf(a) === i).filter((a) => !/^javascript:/i.test(a.getAttribute("href")));
        if (!headingText && !text && !ctas.length) return;
        const mediaCell = document2.createDocumentFragment();
        if (image) {
          mediaCell.appendChild(document2.createComment(" field:media_image "));
          mediaCell.appendChild(image.cloneNode(true));
        }
        if (videoUrl) {
          mediaCell.appendChild(document2.createComment(" field:media_video "));
          const a = document2.createElement("a");
          a.href = videoUrl;
          a.textContent = videoUrl;
          mediaCell.appendChild(a);
        }
        const contentCell = document2.createDocumentFragment();
        contentCell.appendChild(document2.createComment(" field:content_text "));
        if (headingText) {
          const h = document2.createElement(cells.length === 0 ? "h1" : "h2");
          h.textContent = headingText;
          contentCell.appendChild(h);
        }
        if (text) {
          const p = document2.createElement("p");
          p.textContent = text;
          contentCell.appendChild(p);
        }
        ctas.forEach((cta, i) => {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = cta.getAttribute("href");
          a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
          if (i === 0) {
            const strong = document2.createElement("strong");
            strong.appendChild(a);
            p.appendChild(strong);
          } else {
            p.appendChild(a);
          }
          contentCell.appendChild(p);
        });
        cells.push([mediaCell, contentCell]);
      });
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-products.js
  var THEME_MAP = {
    "persian-plum-gradient": "plum",
    "sea-blue-gradient": "blue",
    "american-blue": "blue",
    "rich-black": "black",
    "dark-chocolate": "chocolate",
    coffee: "chocolate",
    charm: "red"
  };
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function hinted(document2, field, nodes) {
    const list = nodes.filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function parse2(element, { document: document2 }) {
    const doc = element.ownerDocument || document2;
    const nav = doc.querySelector(".homepage-banner nav .nav-tabs") || doc.querySelector(".homepage-banner #nav-tab") || doc.querySelector("#nav-tab");
    const buttons = nav ? [...nav.querySelectorAll("button.nav-link, .nav-link")] : [];
    const tabs = buttons.map((b) => {
      const img = b.querySelector("img");
      return {
        id: (b.getAttribute("data-tab") || "").toLowerCase(),
        label: clean(b.textContent),
        icon: img
      };
    });
    const tabFor = (pane, i) => tabs.find((t) => t.id && t.id === pane.id.toLowerCase()) || tabs[i] || { label: pane.id, icon: null };
    const panes = [...element.querySelectorAll(":scope > .tab-pane")];
    const cells = [];
    panes.forEach((pane, i) => {
      const tab = tabFor(pane, i);
      const cards = [...pane.querySelectorAll(".tab-card .card")];
      let first = true;
      cards.forEach((card) => {
        const titleEl = card.querySelector(".small-heading, h2");
        const title = clean(titleEl && titleEl.textContent);
        const benefits = [...card.querySelectorAll(".big-heading")].map((el) => clean(el.textContent)).filter(Boolean);
        if (!title && !benefits.length) return;
        const tabCell = document2.createDocumentFragment();
        tabCell.appendChild(document2.createComment(" field:tab_label "));
        const labelP = document2.createElement("p");
        labelP.textContent = tab.label;
        tabCell.appendChild(labelP);
        if (first && tab.icon) {
          tabCell.appendChild(document2.createComment(" field:tab_icon "));
          tabCell.appendChild(tab.icon.cloneNode(true));
        }
        first = false;
        const icon = card.querySelector("figure img") || card.querySelector(":scope > img");
        const textNodes = [];
        if (title) {
          const h2 = document2.createElement("h2");
          h2.textContent = title;
          textNodes.push(h2);
        }
        benefits.forEach((b) => {
          const p = document2.createElement("p");
          p.textContent = b;
          textNodes.push(p);
        });
        const seenLabels = /* @__PURE__ */ new Set();
        const links = [...card.querySelectorAll(".bottom-control-sec a[href], a.btn[href], a.know-more[href]")].filter((a, idx, arr) => arr.indexOf(a) === idx).filter((a) => !/^javascript:/i.test(a.getAttribute("href"))).filter((a) => {
          const key = clean(a.textContent).toLowerCase();
          if (!key || seenLabels.has(key)) return false;
          seenLabels.add(key);
          return true;
        });
        links.forEach((a, idx) => {
          const p = document2.createElement("p");
          const link2 = document2.createElement("a");
          link2.href = a.getAttribute("href");
          link2.textContent = clean(a.textContent);
          if (idx === 0) {
            const strong = document2.createElement("strong");
            strong.appendChild(link2);
            p.appendChild(strong);
          } else {
            p.appendChild(link2);
          }
          textNodes.push(p);
        });
        const themeKey = Object.keys(THEME_MAP).find((cls) => card.classList.contains(cls));
        const theme = themeKey ? THEME_MAP[themeKey] : "";
        cells.push([
          tabCell,
          hinted(document2, "icon", [icon]),
          hinted(document2, "text", textNodes),
          hinted(document2, "theme", [theme ? document2.createTextNode(theme) : null])
        ]);
      });
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (nav) nav.remove();
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-products", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-features.js
  function findTooltip(slide, scope, doc) {
    const own = slide.querySelector(".info-tool-tip");
    if (own && own.querySelector("p.info")) return own;
    const id = slide.id;
    if (id) {
      const ext = scope && scope.querySelector(`[id="${id}-info-tool-tip-desktop"]`) || doc.getElementById(`${id}-info-tool-tip-desktop`);
      if (ext) return ext;
    }
    return own || null;
  }
  function parse3(element, { document: document2 }) {
    const doc = element.ownerDocument || document2;
    const scope = element.parentElement;
    let slides = [...element.querySelectorAll(".embla__container > .embla__slide")];
    if (!slides.length) slides = [...element.querySelectorAll(".embla__slide")];
    const consumed = [];
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    slides.forEach((slide, idx) => {
      const card = slide.querySelector(".wmaspecial") || slide;
      const img = card.querySelector(".card img, img");
      const titleEl = card.querySelector("h3.card-title, .card-title, h3, h2");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const key = slide.id || title || `slide-${idx}`;
      if (seen.has(key)) return;
      seen.add(key);
      const tip = findTooltip(slide, scope, doc);
      if (tip && !element.contains(tip)) consumed.push(tip);
      const descEl = tip && tip.querySelector("p.info, p");
      const ctaEl = tip && tip.querySelector("a.btn-red[href]");
      if (!img && !title && !descEl) return;
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        textCell.appendChild(h3);
      }
      if (descEl && descEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.innerHTML = descEl.innerHTML;
        textCell.appendChild(p);
      }
      const ctaHref = ctaEl && ctaEl.getAttribute("href");
      if (ctaHref && !/^javascript:/i.test(ctaHref)) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = ctaHref;
        a.textContent = ctaEl.textContent.replace(/\s+/g, " ").trim();
        p.appendChild(a);
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (scope) {
      scope.querySelectorAll(":scope > .info-tool-tip, :scope > .info-tool-tip-desktop").forEach((t) => consumed.push(t));
      const viewAll = scope.querySelector(":scope > a.view-all, :scope > #viewMore");
      if (viewAll) consumed.push(viewAll);
    }
    consumed.forEach((n) => n.remove());
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-features", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/calculator-finance.js
  var PANEL_TYPES = {
    "saving-account-panel": "savings",
    "personal-loan-panel": "personal-loan",
    "credit-card-panel": "credit-card",
    "home-loan-panel": "home-loan",
    "two-wheeler-loan-panel": "two-wheeler-loan"
  };
  function typeFromLabel(label) {
    const t = (label || "").toLowerCase();
    if (t.includes("saving")) return "savings";
    if (t.includes("personal")) return "personal-loan";
    if (t.includes("credit")) return "credit-card";
    if (t.includes("home")) return "home-loan";
    if (t.includes("wheeler")) return "two-wheeler-loan";
    return "";
  }
  function toNumber(raw) {
    const m = String(raw).replace(/,/g, "").match(/([\d.]+)\s*(K|L|Cr)?/i);
    if (!m) return NaN;
    const mult = { k: 1e3, l: 1e5, cr: 1e7 }[(m[2] || "").toLowerCase()] || 1;
    return Math.round(parseFloat(m[1]) * mult * 100) / 100;
  }
  function readBounds(slide) {
    const help = slide && slide.querySelector(".help-block");
    if (!help) return null;
    let parts = [...help.children].map((c) => c.textContent.trim()).filter(Boolean);
    if (parts.length < 2) {
      parts = [...help.childNodes].map((n) => n.textContent.trim()).filter(Boolean);
    }
    if (parts.length < 2) return null;
    const min = toNumber(parts[0]);
    const max = toNumber(parts[parts.length - 1]);
    if (Number.isNaN(min) || Number.isNaN(max) || min >= max) return null;
    return { min, max };
  }
  function buildRanges(panel, type) {
    if (!panel || !type || type === "credit-card") return "";
    const parts = [];
    const amount = readBounds(panel.querySelector(".calc-amount"));
    if (amount) parts.push(`amount: ${amount.min} - ${amount.max}`);
    const rate = readBounds(panel.querySelector(".calc-intrest"));
    if (rate) parts.push(`rate: ${rate.min} - ${rate.max}`);
    if (type !== "savings") {
      const tenure = readBounds(panel.querySelector(".calc-tenure"));
      if (tenure) {
        if (type === "home-loan") {
          const min = Math.max(1, Math.round(tenure.min / 12));
          const max = Math.round(tenure.max / 12);
          if (max > min) parts.push(`tenure: ${min} - ${max}`);
        } else {
          parts.push(`tenure: ${tenure.min} - ${tenure.max}`);
        }
      }
    }
    return parts.join(", ");
  }
  function hinted2(document2, field, nodes) {
    const list = nodes.filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function para(document2, text) {
    const p = document2.createElement("p");
    p.textContent = text;
    return p;
  }
  function parse4(element, { document: document2 }) {
    const heading = element.querySelector(".calc-description h2, .calc-description h1, .revamp_financial_calc_heading");
    const subheading = element.querySelector(".calc-description p, .revamp_financial_calc_sub-heading");
    const image = element.querySelector(".financial-figure img.d-lg-inline-block") || element.querySelector(".financial-figure img");
    const footnotes = [...element.querySelectorAll(".disclaimer-desktop > div")].map((d) => d.textContent.replace(/\s+/g, " ").trim()).filter(Boolean).filter((t, i, arr) => arr.indexOf(t) === i).map((t) => para(document2, t));
    const labels = [...element.querySelectorAll(".financial-calc-carousal .card-item")].map((item) => item.textContent.replace(/\s+/g, " ").trim());
    const panels = [...element.querySelectorAll('form [id$="-panel"]')];
    const items = [];
    const count = Math.max(labels.length, panels.length);
    for (let i = 0; i < count; i += 1) {
      const panel = panels[i];
      const label = labels[i] || "";
      const type = panel && PANEL_TYPES[panel.id] || typeFromLabel(label);
      if (!type) continue;
      const ranges = buildRanges(panel, type);
      const cta = panel && (panel.querySelector(".bar-desktop-btn a.red-btn") || panel.querySelector("a.red-btn, a.btn-red"));
      let ctaLink = null;
      if (cta && cta.getAttribute("href") && !/^javascript:/i.test(cta.getAttribute("href"))) {
        ctaLink = document2.createElement("a");
        ctaLink.href = cta.getAttribute("href");
        ctaLink.textContent = cta.textContent.trim() || "Apply Now";
      }
      items.push({ label, type, ranges, ctaLink });
    }
    if (!heading && !items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([hinted2(document2, "image", [image])]);
    cells.push([hinted2(document2, "text", [heading, subheading, ...footnotes])]);
    items.forEach(({ label, type, ranges, ctaLink }) => {
      const labelCell = hinted2(document2, "label", [label ? document2.createTextNode(label) : null]);
      const typeCell = document2.createDocumentFragment();
      typeCell.appendChild(document2.createComment(" field:calc_type "));
      typeCell.appendChild(para(document2, type));
      if (ranges) {
        typeCell.appendChild(document2.createComment(" field:calc_ranges "));
        typeCell.appendChild(para(document2, ranges));
      }
      const ctaCell = hinted2(document2, "cta", [ctaLink]);
      cells.push([labelCell, typeCell, ctaCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "calculator-finance", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-spotlight.js
  function parse5(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".embla__container > .embla__slide")];
    if (!slides.length) slides = [...element.querySelectorAll(".spotlight-item, .embla__slide")];
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(":scope > figure img") || slide.querySelector("figure:not(a figure) img");
      const titleEl = slide.querySelector(".spotlight-item-desc-heading, h3, h2");
      const descEl = slide.querySelector(".spotlight-item-desc-sub-heading, .spotlight-item-desc p");
      const ctaEl = slide.querySelector(".spotlight-item-desc > a[href], a[href]");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const key = `${title}|${ctaEl ? ctaEl.getAttribute("href") : ""}`;
      if (!title && !img) return;
      if (seen.has(key)) return;
      seen.add(key);
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        textCell.appendChild(h3);
      }
      if (descEl && descEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descEl.textContent.replace(/\s+/g, " ").trim();
        textCell.appendChild(p);
      }
      const href = ctaEl && ctaEl.getAttribute("href");
      if (href && !/^javascript:/i.test(href)) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = ctaEl.textContent.replace(/\s+/g, " ").trim() || "Know more";
        p.appendChild(a);
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-app.js
  function link(document2, a) {
    const p = document2.createElement("p");
    const out = document2.createElement("a");
    out.href = a.getAttribute("href");
    out.textContent = a.textContent.replace(/\s+/g, " ").trim();
    p.appendChild(out);
    return p;
  }
  function parse6(element, { document: document2 }) {
    const textCell = [];
    const heading = element.querySelector(".heading-sec h2, .heading-sec h1, h2");
    const intro = element.querySelector(".heading-sec p");
    if (heading) textCell.push(heading);
    if (intro) textCell.push(intro);
    element.querySelectorAll(".heading-sec .btn-container a[href], .heading-sec a[href]").forEach((a) => {
      if (!textCell.some((n) => n.querySelector && n.querySelector(`a[href="${a.getAttribute("href")}"]`))) {
        textCell.push(link(document2, a));
      }
    });
    const mediaCell = [];
    const slides = [...element.querySelectorAll(".embla-mobile-app-banner .embla__slide")];
    const taglines = [];
    (slides.length ? slides : [element]).forEach((slide) => {
      const img = slide.querySelector(".car-box img.d-show") || slide.querySelector(".car-box img");
      if (img) mediaCell.push(img);
      slide.querySelectorAll(".grcompmobinri-desc p, .mobile-app-h3").forEach((p) => {
        if (!taglines.includes(p)) taglines.push(p);
      });
    });
    const qrCell = [...taglines];
    const qrHeading = element.querySelector(".grcompmob-qr h3, .grcompmobqr-desc h3, .grcompmob-qr h2");
    const qrImg = element.querySelector(".grcompmobqr-img img, .grcompmob-qr img");
    if (qrHeading) qrCell.push(qrHeading);
    if (qrImg) qrCell.push(qrImg);
    if (!textCell.length && !mediaCell.length && !qrCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell, mediaCell, qrCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-app", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-app-links.js
  function parse7(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .comp-box")];
    if (!items.length) items = [...element.querySelectorAll(".comp-box")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(":scope > img, :scope > picture img");
      const body = item.querySelector(".text-sec") || item;
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textNodes = [];
      body.querySelectorAll(":scope > p").forEach((p) => {
        p.querySelectorAll("span").forEach((span) => {
          const strong = document2.createElement("strong");
          strong.innerHTML = span.innerHTML;
          span.replaceWith(strong);
        });
        if (p.textContent.trim()) textNodes.push(p);
      });
      body.querySelectorAll(":scope > a[href]").forEach((a) => {
        const p = document2.createElement("p");
        const link2 = document2.createElement("a");
        link2.href = a.getAttribute("href");
        link2.textContent = a.textContent.trim();
        p.appendChild(link2);
        textNodes.push(p);
      });
      const textCell = document2.createDocumentFragment();
      if (textNodes.length) {
        textCell.appendChild(document2.createComment(" field:text "));
        textNodes.forEach((n) => textCell.appendChild(n));
      }
      if (img || textNodes.length) cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-app-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-testimonial.js
  var DATE_RE = /^\d{1,2}\s+[A-Za-z]+,?\s+\d{4}$/;
  function parse8(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".embla__slide .card")];
    if (!cards.length) cards = [...element.querySelectorAll(".embla__slide, .item")];
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    cards.forEach((card) => {
      const p = card.querySelector("p") || card;
      const nameEl = p.querySelector("strong, b");
      const smallEl = p.querySelector("small");
      const name = nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "";
      const small = smallEl ? smallEl.textContent.replace(/\s+/g, " ").trim() : "";
      const own = [...p.childNodes].filter((n) => n !== nameEl && n !== smallEl).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
      let date = "";
      let quote = "";
      [own, small].forEach((part) => {
        if (!part) return;
        if (!date && DATE_RE.test(part)) date = part;
        else quote = quote ? `${quote} ${part}` : part;
      });
      if (!name && !quote) return;
      const key = `${name}|${quote}`;
      if (seen.has(key)) return;
      seen.add(key);
      const avatar = card.querySelector("img");
      const imageCell = document2.createDocumentFragment();
      if (avatar) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(avatar);
      }
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (date) {
        const dp = document2.createElement("p");
        dp.textContent = date;
        textCell.appendChild(dp);
      }
      if (name) {
        const np = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = name;
        np.appendChild(strong);
        textCell.appendChild(np);
      }
      if (quote) {
        const qp = document2.createElement("p");
        qp.textContent = quote;
        textCell.appendChild(qp);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-articles.js
  var PLACEHOLDER2 = /loader\.(jpg|png|gif)|^data:|19873fe2a58527d55d1ccd2cddb3ea00/i;
  function clean2(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function hinted3(document2, field, nodes) {
    const list = nodes.filter(Boolean);
    if (!list.length) return "";
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function resolveImage2(img, document2) {
    if (!img) return null;
    const dataSrc = img.getAttribute("data-src") || "";
    const src = img.getAttribute("src") || "";
    const url = dataSrc && !PLACEHOLDER2.test(dataSrc) ? dataSrc : !PLACEHOLDER2.test(src) ? src : "";
    if (!url) return null;
    const out = document2.createElement("img");
    out.src = url;
    out.alt = /loader\.jpg/i.test(img.getAttribute("alt") || "") ? "" : clean2(img.getAttribute("alt"));
    return out;
  }
  function parse9(element, { document: document2 }) {
    const doc = element.ownerDocument || document2;
    let nav = element.previousElementSibling;
    if (!nav || !nav.matches(".home-blog-links")) {
      nav = element.parentElement && element.parentElement.querySelector(".home-blog-links") || doc.querySelector(".manage-your-finance .home-blog-links");
    }
    const buttons = nav ? [...nav.querySelectorAll("button.nav-link, .nav-link")] : [];
    const labelById = /* @__PURE__ */ new Map();
    buttons.forEach((b) => {
      const id = b.getAttribute("data-tab") || (b.getAttribute("data-bs-target") || "").replace(/^#/, "") || b.getAttribute("aria-controls");
      if (id) labelById.set(id, clean2(b.textContent));
    });
    const panes = [...element.querySelectorAll(":scope > .tab-pane")];
    const cells = [];
    panes.forEach((pane, i) => {
      const label = labelById.get(pane.id) || (buttons[i] ? clean2(buttons[i].textContent) : "") || pane.id;
      const tabCell = () => hinted3(document2, "tab", [document2.createTextNode(label)]);
      const seen = /* @__PURE__ */ new Set();
      pane.querySelectorAll(".home-carousel-2-carousel-item").forEach((item) => {
        var _a, _b;
        const titleEl = item.querySelector(".home-carousel-2-item-heading, h3");
        const title = clean2(titleEl && titleEl.textContent);
        const href = ((_a = item.querySelector("a.blog-action[href], a[href]")) == null ? void 0 : _a.getAttribute("href")) || "";
        if (!title || seen.has(`${title}|${href}`)) return;
        seen.add(`${title}|${href}`);
        const img = resolveImage2(item.querySelector("img"), document2);
        const h3 = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.appendChild(a);
        } else {
          h3.textContent = title;
        }
        const dateText = clean2((_b = item.querySelector(".home-carousel-2-item-date")) == null ? void 0 : _b.textContent);
        let dateP = null;
        if (dateText) {
          dateP = document2.createElement("p");
          dateP.textContent = dateText;
        }
        cells.push([tabCell(), hinted3(document2, "image", [img]), hinted3(document2, "text", [h3, dateP])]);
      });
      const more = pane.querySelector(":scope > a.home-carousel-2-knowMore[href], a.home-carousel-2-knowMore[href]");
      if (more) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = more.getAttribute("href");
        a.textContent = clean2(more.textContent) || "Know More";
        p.appendChild(a);
        cells.push([tabCell(), "", hinted3(document2, "text", [p])]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (nav) nav.remove();
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-articles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-awards.js
  function parse10(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".embla__container > .embla__slide")];
    if (!slides.length) slides = [...element.querySelectorAll(".embla__slide, .item")];
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    slides.forEach((slide) => {
      var _a;
      const href = ((_a = slide.querySelector("a.link[href], a[href]")) == null ? void 0 : _a.getAttribute("href")) || "";
      const img = slide.querySelector("figure img") || slide.querySelector("img:not(.white):not(.red)");
      const descEl = slide.querySelector("p.card-info") || slide.querySelector("p:not(.arrow)");
      const desc = descEl ? descEl.textContent.replace(/\s+/g, " ").trim() : "";
      const key = `${href}|${desc}`;
      if (!img && !desc || seen.has(key)) return;
      seen.add(key);
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      if (desc || href) {
        textCell.appendChild(document2.createComment(" field:text "));
        if (desc) {
          const p = document2.createElement("p");
          p.textContent = desc;
          textCell.appendChild(p);
        }
        if (href) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = "Read more";
          p.appendChild(a);
          textCell.appendChild(p);
        }
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-awards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stats.js
  function parse11(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".embla__slide .comm-box")];
    if (!items.length) items = [...element.querySelectorAll(".comm-box, .embla__slide")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      const textPart = item.querySelector(".text-part") || item;
      const titleEl = textPart.querySelector(".item-heading, h2, h3, h4");
      const descs = [...textPart.querySelectorAll(":scope > p")].filter((p) => p !== titleEl && p.textContent.trim());
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      if (titleEl || descs.length) {
        textCell.appendChild(document2.createComment(" field:text "));
        if (titleEl) {
          const h3 = document2.createElement("h3");
          h3.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
          textCell.appendChild(h3);
        }
        descs.forEach((p) => textCell.appendChild(p));
      }
      if (img || titleEl || descs.length) cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-support.js
  function parse12(element, { document: document2 }) {
    const title = element.querySelector(":scope > h2.touch-title, :scope > h2");
    let items = [...element.querySelectorAll("li.getin-list-item")];
    if (!items.length) items = [...element.querySelectorAll("ul > li")];
    const cells = [];
    items.forEach((li) => {
      const a = li.querySelector("a[href]");
      const img = li.querySelector("img");
      const labelEl = li.querySelector("p, figcaption, span");
      const label = (labelEl ? labelEl.textContent : a ? a.textContent : "").replace(/\s+/g, " ").trim();
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      if (label) {
        textCell.appendChild(document2.createComment(" field:text "));
        const p = document2.createElement("p");
        if (a) {
          const link2 = document2.createElement("a");
          link2.href = a.getAttribute("href");
          link2.textContent = label;
          p.appendChild(link2);
        } else {
          p.textContent = label;
        }
        textCell.appendChild(p);
      }
      if (img || label) cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-support", cells });
    if (title && title.textContent.trim()) {
      element.replaceWith(title, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-apply-now.js
  function parse13(element, { document: document2 }) {
    const trigger = element.querySelector("a#apply-now, a.apply-now");
    const content = element.querySelector(".apply-now-content") || element;
    const heading = content.querySelector(":scope > h2, :scope > h3, :scope > .h2");
    const intro = content.querySelector(":scope > p");
    const cells = [];
    const triggerCell = document2.createDocumentFragment();
    if (trigger) {
      const tImg = trigger.querySelector("img");
      const tLabel = trigger.textContent.replace(/\s+/g, " ").trim();
      if (tImg) {
        triggerCell.appendChild(document2.createComment(" field:trigger_image "));
        triggerCell.appendChild(tImg);
      }
      if (tLabel) {
        triggerCell.appendChild(document2.createComment(" field:trigger_label "));
        const p = document2.createElement("p");
        p.textContent = tLabel;
        triggerCell.appendChild(p);
      }
    }
    cells.push([triggerCell]);
    const textCell = document2.createDocumentFragment();
    if (heading || intro) {
      textCell.appendChild(document2.createComment(" field:text "));
      if (heading) textCell.appendChild(heading);
      if (intro) textCell.appendChild(intro);
    }
    cells.push([textCell]);
    const items = [...content.querySelectorAll("ul > li")];
    items.forEach((li) => {
      const a = li.querySelector("a[href]");
      if (!a) return;
      const imgs = [...a.querySelectorAll("img")];
      const icon = imgs.find((img) => !/arrow/i.test(img.getAttribute("alt") || "")) || null;
      const nameEl = a.querySelector("strong") || a;
      let tag = "";
      const tagSpan = nameEl.querySelector("span");
      if (tagSpan) {
        tag = tagSpan.textContent.trim();
        tagSpan.remove();
      }
      let name = nameEl.textContent.replace(/\s+/g, " ").trim();
      if (!tag) {
        const m = name.match(/^(.*\S)\s+(NEW)$/);
        if (m) {
          name = m[1];
          tag = m[2];
        }
      }
      if (!name) return;
      const imageCell = document2.createDocumentFragment();
      if (icon) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(icon);
      }
      const itemText = document2.createDocumentFragment();
      itemText.appendChild(document2.createComment(" field:text "));
      const p = document2.createElement("p");
      const link2 = document2.createElement("a");
      link2.href = a.getAttribute("href");
      link2.textContent = name;
      p.appendChild(link2);
      if (tag) {
        p.appendChild(document2.createTextNode(" "));
        const em = document2.createElement("em");
        em.textContent = tag;
        p.appendChild(em);
      }
      itemText.appendChild(p);
      cells.push([imageCell, itemText]);
    });
    if (!heading && cells.length <= 2) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-apply-now", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/idfc-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "div.modal",
        ".cc-common-apply-popup",
        ".customer-service-modal",
        ".login-modal",
        ".search-modal"
      ]);
      WebImporter.DOMUtils.remove(element, [".helping-communities .mobile-div"]);
      WebImporter.DOMUtils.remove(element, [".compliment picture.desktop-testi-images"]);
      WebImporter.DOMUtils.remove(element, [
        "div[data-analytics-pagetitle]",
        'img[src*="cdn.page-source.com"]',
        "script",
        "noscript"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.grnt-new-header",
        ".header-revamp",
        ".mobile-header",
        "footer.footer",
        ".footer-revamp"
      ]);
      WebImporter.DOMUtils.remove(element, ["link", "iframe", "script", "noscript", "style"]);
      element.querySelectorAll("[onclick]").forEach((el) => el.removeAttribute("onclick"));
    }
  }

  // tools/importer/transformers/idfc-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
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

  // tools/importer/import-home.js
  var parsers = {
    "carousel-hero": parse,
    "tabs-products": parse2,
    "carousel-features": parse3,
    "calculator-finance": parse4,
    "carousel-spotlight": parse5,
    "columns-app": parse6,
    "cards-app-links": parse7,
    "carousel-testimonial": parse8,
    "tabs-articles": parse9,
    "carousel-awards": parse10,
    "cards-stats": parse11,
    "cards-support": parse12,
    "cards-apply-now": parse13
  };
  var PAGE_TEMPLATE = {
    "name": "home",
    "description": "IDFC FIRST Bank homepage: hero slider, product tabs, feature/spotlight/award carousels, calculators, app promo, testimonials, articles, stats, support links, apply-now drawer",
    "urls": [
      "https://www.idfcfirst.bank.in/"
    ],
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          ".homepage-banner .embla-home-static-banner"
        ]
      },
      {
        "name": "tabs-products",
        "instances": [
          ".product-tabs .home-tab-content"
        ]
      },
      {
        "name": "carousel-features",
        "instances": [
          ".what-make-us-spl .special-embla-slider"
        ]
      },
      {
        "name": "calculator-finance",
        "instances": [
          ".calulator .revamp_financial_calc"
        ]
      },
      {
        "name": "carousel-spotlight",
        "instances": [
          ".spotlight .spotlight-carousel"
        ]
      },
      {
        "name": "columns-app",
        "instances": [
          ".adv-mobile-app .advance-mobile-app > .row"
        ]
      },
      {
        "name": "cards-app-links",
        "instances": [
          ".adv-mobile-app .bottom-nav"
        ]
      },
      {
        "name": "carousel-testimonial",
        "instances": [
          ".compliment .embla-testi-slider"
        ]
      },
      {
        "name": "tabs-articles",
        "instances": [
          ".manage-your-finance .home-blog-tab-content"
        ]
      },
      {
        "name": "carousel-awards",
        "instances": [
          ".awards-accordian .embla-awards-banner"
        ]
      },
      {
        "name": "cards-stats",
        "instances": [
          ".helping-communities .custom-div"
        ]
      },
      {
        "name": "cards-support",
        "instances": [
          ".getInTouch .get-intouch-revamp .col-lg-12"
        ]
      },
      {
        "name": "cards-apply-now",
        "instances": [
          ".apply-now.aem-GridColumn .apply-now-container"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc3",
        "name": "hero-carousel",
        "selector": [
          ".homepage-banner.aem-GridColumn",
          ".homepage-banner"
        ],
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "rc4",
        "name": "app-scanner",
        "selector": [
          ".homepage-scanner.aem-GridColumn",
          ".homepage-scanner"
        ],
        "style": "app-scanner",
        "blocks": [],
        "defaultContent": [
          ".homepage-scanner .grnt-qr-new"
        ]
      },
      {
        "id": "rc5",
        "name": "product-tabs",
        "selector": [
          ".product-tabs.aem-GridColumn",
          ".product-tabs"
        ],
        "style": null,
        "blocks": [
          "tabs-products"
        ],
        "defaultContent": []
      },
      {
        "id": "rc6",
        "name": "what-makes-us-special",
        "selector": [
          ".what-make-us-spl.aem-GridColumn",
          ".what-make-us-spl"
        ],
        "style": null,
        "blocks": [
          "carousel-features"
        ],
        "defaultContent": [
          ".what-make-us-spl .what-make-special > .container > h2.title",
          ".what-make-us-spl .what-make-special > .container > p",
          ".what-make-us-spl .what-make-special > .container > a.knowMore"
        ]
      },
      {
        "id": "rc7",
        "name": "financial-calculators",
        "selector": [
          ".calulator.aem-GridColumn",
          ".calulator"
        ],
        "style": "dark-red",
        "blocks": [
          "calculator-finance"
        ],
        "defaultContent": []
      },
      {
        "id": "rc8",
        "name": "spotlight",
        "selector": [
          ".spotlight.aem-GridColumn",
          ".spotlight"
        ],
        "style": "light-grey",
        "blocks": [
          "carousel-spotlight"
        ],
        "defaultContent": [
          ".spotlight .spotlight-heading-container"
        ]
      },
      {
        "id": "rc9",
        "name": "mobile-app",
        "selector": [
          ".adv-mobile-app.aem-GridColumn",
          ".adv-mobile-app"
        ],
        "style": null,
        "blocks": [
          "columns-app",
          "cards-app-links"
        ],
        "defaultContent": []
      },
      {
        "id": "rc10",
        "name": "testimonials",
        "selector": [
          ".compliment.aem-GridColumn",
          ".compliment"
        ],
        "style": "light-grey",
        "blocks": [
          "carousel-testimonial"
        ],
        "defaultContent": [
          ".compliment .testimonial-section figure",
          ".compliment .testimonial-section h2.h2"
        ]
      },
      {
        "id": "rc11",
        "name": "manage-finances",
        "selector": [
          ".manage-your-finance.aem-GridColumn",
          ".manage-your-finance"
        ],
        "style": null,
        "blocks": [
          "tabs-articles"
        ],
        "defaultContent": [
          ".manage-your-finance h2.home-carousel-2-heading"
        ]
      },
      {
        "id": "rc12",
        "name": "awards",
        "selector": [
          ".awards-accordian.aem-GridColumn",
          ".awards-accordian"
        ],
        "style": null,
        "blocks": [
          "carousel-awards"
        ],
        "defaultContent": [
          ".awards-accordian .home-awards-sec > .container > h2.title",
          ".awards-accordian .home-awards-sec > .container > p.sub-title",
          ".awards-accordian .home-awards-sec > .container > a.knowMore"
        ]
      },
      {
        "id": "rc13",
        "name": "communities",
        "selector": [
          ".helping-communities.aem-GridColumn",
          ".helping-communities"
        ],
        "style": null,
        "blocks": [
          "cards-stats"
        ],
        "defaultContent": [
          ".helping-communities .communities-heading"
        ]
      },
      {
        "id": "rc14",
        "name": "get-in-touch",
        "selector": [
          ".getInTouch.aem-GridColumn",
          ".getInTouch"
        ],
        "style": "light-grey",
        "blocks": [
          "cards-support"
        ],
        "defaultContent": []
      },
      {
        "id": "rc15",
        "name": "mission-banner",
        "selector": [
          ".cust-friendly.aem-GridColumn",
          ".cust-friendly"
        ],
        "style": "mission",
        "blocks": [],
        "defaultContent": [
          ".cust-friendly .customer-friendly .col-lg-12"
        ]
      },
      {
        "id": "rc16",
        "name": "apply-now-drawer",
        "selector": [
          ".apply-now.aem-GridColumn"
        ],
        "style": null,
        "blocks": [
          "cards-apply-now"
        ],
        "defaultContent": []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  var SITE_ROOT = "/idfc";
  var NAV_PATH = `${SITE_ROOT}/nav`;
  var FOOTER_PATH = `${SITE_ROOT}/footer`;
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  function rewriteLinks(main) {
    main.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href").trim();
      if (/^javascript:/i.test(href)) {
        a.replaceWith(...a.childNodes);
        return;
      }
      let u;
      try {
        u = new URL(href, "https://www.idfcfirst.bank.in/");
      } catch (e) {
        return;
      }
      if (!/^(www\.)?idfcfirst\.bank\.in$/.test(u.hostname) || href.startsWith("#")) return;
      const isFile = u.pathname.startsWith("/content/") || /\.[a-z0-9]{2,5}$/i.test(u.pathname.replace(/\.html?$/, ""));
      if (isFile) {
        a.setAttribute("href", u.href);
        return;
      }
      const path = u.pathname.replace(/\/+$/, "").replace(/\.html?$/, "");
      a.setAttribute("href", `${SITE_ROOT}${path}${u.search}${u.hash}`);
    });
  }
  function pageMetadata(document2) {
    const head = (sel) => {
      const n = document2.querySelector(sel);
      return n ? (n.getAttribute("content") || "").trim() : "";
    };
    const meta = {};
    const title = (document2.title || head('meta[property="og:title"]')).trim();
    if (title) meta.Title = title;
    const description = head('meta[name="description"]') || head('meta[property="og:description"]');
    if (description) meta.Description = description;
    const keywords = head('meta[name="keywords"]');
    if (keywords) meta.Keywords = keywords;
    const ogImage = head('meta[property="og:image"]');
    if (ogImage) {
      const img = document2.createElement("img");
      img.src = ogImage;
      meta.Image = img;
    }
    meta.nav = NAV_PATH;
    meta.footer = FOOTER_PATH;
    return meta;
  }
  var OVERLAY_LINKS = ".awards-accordian a.link[href], .manage-your-finance a.blog-action[href]";
  var import_home_default = {
    onLoad: (_0) => __async(void 0, [_0], function* ({ document: document2 }) {
      document2.querySelectorAll(OVERLAY_LINKS).forEach((a) => {
        if (!a.textContent.trim()) a.textContent = "Read more";
      });
    }),
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      const meta = pageMetadata(document2);
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
      rewriteLinks(main);
      main.appendChild(document2.createElement("hr"));
      main.appendChild(WebImporter.Blocks.getMetadataBlock(document2, meta));
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(`${SITE_ROOT}${rawPath}`);
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
  return __toCommonJS(import_home_exports);
})();
