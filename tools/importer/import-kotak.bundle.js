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

  // tools/importer/import-kotak.js
  var import_kotak_exports = {};
  __export(import_kotak_exports, {
    default: () => import_kotak_default
  });

  // tools/importer/parsers/hero-statement.js
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function imageCell(document2, source, field = "image") {
    const frag = document2.createDocumentFragment();
    if (source && source.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      frag.append(document2.createComment(` field:${field} `), img);
    }
    return frag;
  }
  function richNodes(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes(document2, child));
        return;
      }
      if (!clean(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean(a.textContent) === clean(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse(element, { document: document2 }) {
    const text2 = element.querySelector(".hero-text") || element;
    const nodes = [];
    [...text2.children].forEach((child) => {
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h1");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else nodes.push(...richNodes(document2, { children: [child] }));
    });
    const cells = [
      [imageCell(document2, element.querySelector("img.desktop") || element.querySelector("img"))],
      [imageCell(document2, element.querySelector("img.mobile"), "mobileImage")],
      [hinted(document2, "text", ...nodes)]
    ];
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "hero-statement", cells }));
  }

  // tools/importer/parsers/cards-shortcut.js
  function clean2(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted2(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function imageCell2(document2, source, field = "image") {
    const frag = document2.createDocumentFragment();
    if (source && source.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      frag.append(document2.createComment(` field:${field} `), img);
    }
    return frag;
  }
  function richNodes2(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes2(document2, child));
        return;
      }
      if (!clean2(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean2(a.textContent) === clean2(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean2(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse2(element, { document: document2 }) {
    const cells = [...element.querySelectorAll("li")].map((card) => {
      const row = [
        imageCell2(document2, card.querySelector("img")),
        hinted2(document2, "text", ...richNodes2(document2, card))
      ];
      return row;
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-shortcut", cells }));
  }

  // tools/importer/parsers/search-prompt.js
  function clean3(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted3(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function parse3(element, { document: document2 }) {
    const value = (sel) => clean3((element.querySelector(sel) || {}).textContent);
    const cells = [
      [hinted3(document2, "prefix", document2.createTextNode(value(".prefix") || "I want to"))],
      [hinted3(document2, "suggestions", document2.createTextNode(value(".suggestions")))],
      [hinted3(document2, "action", document2.createTextNode(element.getAttribute("action") || "/search"))]
    ];
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "search-prompt", cells }));
  }

  // tools/importer/parsers/carousel-promo.js
  function clean4(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted4(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function imageCell3(document2, source, field = "image") {
    const frag = document2.createDocumentFragment();
    if (source && source.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      frag.append(document2.createComment(` field:${field} `), img);
    }
    return frag;
  }
  function richNodes3(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes3(document2, child));
        return;
      }
      if (!clean4(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean4(a.textContent) === clean4(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean4(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse4(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(".promo-slide")].map((slide) => {
      const text2 = richNodes3(document2, slide, [".stats"]).map((node) => {
        if (node.tagName === "H3") {
          const h = document2.createElement("h2");
          h.innerHTML = node.innerHTML;
          return h;
        }
        return node;
      });
      const stats = slide.querySelector(".stats");
      return [
        imageCell3(document2, slide.querySelector("img")),
        hinted4(document2, "text", ...text2),
        hinted4(document2, "stats", ...stats ? [stats.cloneNode(true)] : [])
      ];
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "carousel-promo", cells }));
  }

  // tools/importer/parsers/tabs-plans.js
  function clean5(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted5(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function imageCell4(document2, source, field = "image") {
    const frag = document2.createDocumentFragment();
    if (source && source.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      frag.append(document2.createComment(` field:${field} `), img);
    }
    return frag;
  }
  function richNodes4(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes4(document2, child));
        return;
      }
      if (!clean5(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean5(a.textContent) === clean5(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean5(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse5(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(".plan")].map((plan) => [
      hinted5(document2, "tab", document2.createTextNode(clean5(plan.getAttribute("data-tab")) || "Plans")),
      imageCell4(document2, plan.querySelector("img")),
      hinted5(document2, "text", ...richNodes4(document2, plan))
    ]);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "tabs-plans", cells }));
  }

  // tools/importer/parsers/carousel-stack.js
  function clean6(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted6(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function richNodes5(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes5(document2, child));
        return;
      }
      if (!clean6(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean6(a.textContent) === clean6(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean6(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse6(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(":scope > article")].map((card) => [
      hinted6(document2, "text", ...richNodes5(document2, card))
    ]);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "carousel-stack", cells }));
  }

  // tools/importer/parsers/cards-metric.js
  function clean7(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted7(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function imageCell5(document2, source, field = "image") {
    const frag = document2.createDocumentFragment();
    if (source && source.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      frag.append(document2.createComment(` field:${field} `), img);
    }
    return frag;
  }
  function richNodes6(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes6(document2, child));
        return;
      }
      if (!clean7(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean7(a.textContent) === clean7(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean7(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse7(element, { document: document2 }) {
    const cells = [...element.querySelectorAll("article")].map((card) => {
      const row = [
        imageCell5(document2, card.querySelector("img")),
        hinted7(document2, "text", ...richNodes6(document2, card))
      ];
      row.push(hinted7(document2, "style", document2.createTextNode(card.getAttribute("data-style") || "light")));
      return row;
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-metric", cells }));
  }

  // tools/importer/parsers/columns-showcase.js
  function clean8(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted8(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function imageCell6(document2, source, field = "image") {
    const frag = document2.createDocumentFragment();
    if (source && source.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      frag.append(document2.createComment(` field:${field} `), img);
    }
    return frag;
  }
  function richNodes7(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes7(document2, child));
        return;
      }
      if (!clean8(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean8(a.textContent) === clean8(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean8(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse8(element, { document: document2 }) {
    const nodes = richNodes7(document2, element).map((node) => {
      if (node.tagName === "H3") {
        const h = document2.createElement("h2");
        h.innerHTML = node.innerHTML;
        return h;
      }
      return node;
    });
    const cells = [
      [imageCell6(document2, element.querySelector("img"))],
      [hinted8(document2, "text", ...nodes)]
    ];
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "columns-showcase", cells }));
  }

  // tools/importer/parsers/cards-impact.js
  function clean9(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted9(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function imageCell7(document2, source, field = "image") {
    const frag = document2.createDocumentFragment();
    if (source && source.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      frag.append(document2.createComment(` field:${field} `), img);
    }
    return frag;
  }
  function richNodes8(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes8(document2, child));
        return;
      }
      if (!clean9(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean9(a.textContent) === clean9(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean9(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse9(element, { document: document2 }) {
    const cells = [...element.querySelectorAll("article")].map((card) => {
      const row = [
        imageCell7(document2, card.querySelector("img")),
        hinted9(document2, "text", ...richNodes8(document2, card))
      ];
      row.push(hinted9(document2, "theme", document2.createTextNode(card.getAttribute("data-theme") || "light")));
      return row;
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-impact", cells }));
  }

  // tools/importer/parsers/carousel-expand.js
  function clean10(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted10(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function imageCell8(document2, source, field = "image") {
    const frag = document2.createDocumentFragment();
    if (source && source.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = source.getAttribute("src");
      img.alt = source.getAttribute("alt") || "";
      frag.append(document2.createComment(` field:${field} `), img);
    }
    return frag;
  }
  function richNodes9(document2, root, skip = []) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (skip.some((sel) => child.matches(sel)) || child.tagName === "IMG") return;
      if (child.tagName === "BLOCKQUOTE") {
        nodes.push(...richNodes9(document2, child));
        return;
      }
      if (!clean10(child.textContent)) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document2.createElement("h3");
        h.innerHTML = child.innerHTML.trim();
        nodes.push(h);
      } else if (child.tagName === "UL" || child.tagName === "OL") {
        nodes.push(child.cloneNode(true));
      } else {
        const p = document2.createElement("p");
        const a = child.querySelector("a");
        if (a && clean10(a.textContent) === clean10(child.textContent)) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean10(a.textContent);
          p.append(l);
        } else p.innerHTML = child.innerHTML.trim();
        nodes.push(p);
      }
    });
    return nodes;
  }
  function parse10(element, { document: document2 }) {
    const cells = [...element.querySelectorAll("article")].map((card) => {
      const row = [
        imageCell8(document2, card.querySelector("img")),
        hinted10(document2, "text", ...richNodes9(document2, card))
      ];
      return row;
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "carousel-expand", cells }));
  }

  // tools/importer/parsers/form-contact.js
  function clean11(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted11(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function text(document2, value) {
    return document2.createTextNode(value);
  }
  function parse11(element, { document: document2 }) {
    const cells = [];
    const intro = element.querySelector(".contact-intro, .lead-intro");
    const introNodes = [];
    let introImage = null;
    if (intro) {
      [...intro.children].forEach((child) => {
        const img = child.tagName === "IMG" ? child : child.querySelector("img");
        if (img && !clean11(child.textContent)) {
          introImage = img;
          return;
        }
        if (!clean11(child.textContent)) return;
        const isHeading = /^H[1-6]$/.test(child.tagName);
        const el = document2.createElement(isHeading ? "h2" : "p");
        if (isHeading) el.innerHTML = child.innerHTML.trim();
        else el.textContent = clean11(child.textContent);
        introNodes.push(el);
      });
    }
    const introCell = hinted11(document2, "intro", ...introNodes);
    if (introImage && introImage.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = introImage.getAttribute("src");
      img.alt = introImage.getAttribute("alt") || "";
      introCell.append(document2.createComment(" field:intro_image "), img);
    }
    cells.push([introCell]);
    const contact = element.querySelector(".contact-specialists");
    const contactNodes = [];
    if (contact) {
      contact.querySelectorAll(":scope > p").forEach((p) => {
        const np = document2.createElement("p");
        np.textContent = clean11(p.textContent);
        contactNodes.push(np);
      });
      const list = contact.querySelector("ul");
      if (list) {
        const ul = document2.createElement("ul");
        list.querySelectorAll("li").forEach((li) => {
          const nli = document2.createElement("li");
          const a = li.querySelector("a");
          if (a) {
            const l = document2.createElement("a");
            l.href = a.getAttribute("href");
            l.textContent = clean11(a.textContent);
            nli.append(l, text(document2, ` ${clean11(li.textContent.replace(a.textContent, ""))}`));
          } else nli.textContent = clean11(li.textContent);
          ul.append(nli);
        });
        contactNodes.push(ul);
      }
    }
    cells.push([hinted11(document2, "contact", ...contactNodes)]);
    const form = element.querySelector("form");
    const submit = form ? form.querySelector('button[type="submit"], button') : null;
    cells.push([hinted11(document2, "submitLabel", text(document2, clean11(submit ? submit.textContent : "Submit")))]);
    const action = form ? form.getAttribute("action") || "" : "";
    cells.push([hinted11(document2, "action", text(document2, action === "#" ? "" : action))]);
    (form ? [...form.querySelectorAll(".field")] : []).forEach((field) => {
      const control = field.querySelector("input, select, textarea");
      const declaredKind = field.getAttribute("data-kind");
      if (!control && !declaredKind) return;
      const label = clean11((field.querySelector("label") || field).textContent);
      let kind = declaredKind || "text";
      let options = "";
      let settings = [];
      if (control) {
        if (control.tagName === "SELECT") kind = "select";
        else if (control.tagName === "TEXTAREA") kind = "textarea";
        else if (["email", "tel", "date", "checkbox"].includes(control.getAttribute("type"))) kind = control.getAttribute("type");
        options = control.tagName === "SELECT" ? [...control.querySelectorAll("option")].map((o) => clean11(o.textContent)).filter(Boolean).join(", ") : "";
        if (control.hasAttribute("required")) settings.push("required");
        if (field.getAttribute("data-width") === "full") settings.push("full");
      }
      if (field.hasAttribute("data-settings")) {
        settings = field.getAttribute("data-settings").split(",").map((v) => v.trim()).filter(Boolean);
      }
      cells.push([
        hinted11(document2, "label", text(document2, label)),
        hinted11(document2, "kind", text(document2, kind)),
        hinted11(document2, "options", text(document2, options)),
        hinted11(document2, "settings", text(document2, settings.join(", ")))
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "form-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/footer-links.js
  function clean12(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted12(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function parse12(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(":scope > .group")].map((group) => {
      const title = group.querySelector(":scope > h3");
      const nodes = [];
      [...group.children].forEach((child) => {
        if (child === title) return;
        if (/^H[4-6]$/.test(child.tagName)) {
          const h = document2.createElement("h4");
          h.textContent = clean12(child.textContent);
          nodes.push(h);
        } else nodes.push(child.cloneNode(true));
      });
      return [
        hinted12(document2, "title", document2.createTextNode(clean12(title ? title.textContent : ""))),
        hinted12(document2, "text", ...nodes)
      ];
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "footer-links", cells }));
  }

  // tools/importer/transformers/kotak-sections.js
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
      element.querySelectorAll("p.cta-outline > a").forEach((a) => {
        const em = doc.createElement("em");
        a.replaceWith(em);
        em.append(a);
      });
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

  // tools/importer/import-kotak.js
  var parsers = {
    "hero-statement": parse,
    "cards-shortcut": parse2,
    "search-prompt": parse3,
    "carousel-promo": parse4,
    "tabs-plans": parse5,
    "carousel-stack": parse6,
    "cards-metric": parse7,
    "columns-showcase": parse8,
    "cards-impact": parse9,
    "carousel-expand": parse10,
    "form-contact": parse11,
    "footer-links": parse12
  };
  var TEMPLATES = {
    "kotak-life": {
      name: "kotak-life",
      description: "Kotak Life homepage from desktop + mobile design images: statement hero, shortcuts + prompt, promo carousel, plan tabs, offer stack, trust metrics, advisor showcase, insights, video stories, lead form, popular searches",
      path: "/kotak-life",
      metadata: {
        Title: "Life Insurance: Kotak Life | Where promises are kept Always",
        template: "kotak",
        nav: "/kotak-nav",
        footer: "/kotak-footer"
      },
      blocks: [
        { name: "hero-statement", instances: ["#hero .hero-statement"] },
        { name: "cards-shortcut", instances: ["#looking-for .shortcuts"] },
        { name: "search-prompt", instances: ["#looking-for .search-prompt"] },
        { name: "carousel-promo", instances: ["#promo .promo-slides"] },
        { name: "tabs-plans", instances: ["#plans .plan-tabs"] },
        { name: "carousel-stack", instances: ["#offer .offer-stack"] },
        { name: "cards-metric", instances: ["#trust .metrics"] },
        { name: "columns-showcase", instances: ["#advisor .showcase"] },
        { name: "cards-impact", instances: ["#insights .impact-cards"] },
        { name: "carousel-expand", instances: ["#stories .story-cards"] },
        { name: "form-contact", instances: ["#lead .lead-form"] }
      ],
      sections: [
        { id: "section-1", name: "Hero", selector: ["#hero"], style: null, blocks: ["hero-statement"], defaultContent: [] },
        { id: "section-2", name: "Looking for", selector: ["#looking-for"], style: "kl-center", blocks: ["cards-shortcut", "search-prompt"], defaultContent: ["#looking-for > h2"] },
        { id: "section-3", name: "Promo", selector: ["#promo"], style: null, blocks: ["carousel-promo"], defaultContent: [] },
        { id: "section-4", name: "Find a plan", selector: ["#plans"], style: "kl-center", blocks: ["tabs-plans"], defaultContent: ["#plans > h2", "#plans > p"] },
        { id: "section-5", name: "Offer", selector: ["#offer"], style: "kl-split", blocks: ["carousel-stack"], defaultContent: ["#offer > h2", "#offer > p"] },
        { id: "section-6", name: "Fastest growing", selector: ["#trust"], style: "kl-intro-split", blocks: ["cards-metric"], defaultContent: ["#trust .section-intro > *"] },
        { id: "section-7", name: "Life advisor", selector: ["#advisor"], style: null, blocks: ["columns-showcase"], defaultContent: [] },
        { id: "section-8", name: "Insights", selector: ["#insights"], style: "kl-intro-split", blocks: ["cards-impact"], defaultContent: ["#insights .section-intro > *", "#insights > p"] },
        { id: "section-9", name: "Customer stories", selector: ["#stories"], style: "kl-center", blocks: ["carousel-expand"], defaultContent: ["#stories > h2", "#stories > p"] },
        { id: "section-10", name: "Lead form", selector: ["#lead"], style: null, blocks: ["form-contact"], defaultContent: [] },
        { id: "section-11", name: "Popular searches", selector: ["#searches"], style: "kl-searches", blocks: [], defaultContent: ["#searches > *"] }
      ]
    },
    "kotak-nav": {
      name: "kotak-nav",
      description: "Kotak Life header fragment: brand (colour + white logo) | sections | tools | utility",
      path: "/kotak-nav",
      metadata: null,
      // fragment - no page metadata block (it would render as an extra nav section)
      blocks: [],
      sections: [
        { id: "section-1", name: "Brand", selector: [".nav-brand"], style: null, blocks: [], defaultContent: [".nav-brand p"] },
        { id: "section-2", name: "Sections", selector: [".nav-sections"], style: null, blocks: [], defaultContent: [".nav-sections > ul"] },
        { id: "section-3", name: "Tools", selector: [".nav-tools"], style: null, blocks: [], defaultContent: [".nav-tools p"] },
        { id: "section-4", name: "Utility", selector: [".nav-utility"], style: null, blocks: [], defaultContent: [".nav-utility > ul"] }
      ]
    },
    "kotak-footer": {
      name: "kotak-footer",
      description: "Kotak Life footer fragment: link groups, apps + social, disclaimer box, legal links",
      path: "/kotak-footer",
      metadata: null,
      // fragment - no page metadata block
      blocks: [
        { name: "footer-links", instances: [".link-groups", ".disclaimer"] }
      ],
      sections: [
        { id: "section-1", name: "Link groups", selector: ["section.footer-groups"], style: null, blocks: ["footer-links"], defaultContent: [] },
        { id: "section-2", name: "Apps and social", selector: ["section.footer-apps"], style: null, blocks: [], defaultContent: ["section.footer-apps > *"] },
        { id: "section-3", name: "Disclaimer", selector: ["section.footer-disclaimer"], style: "kl-disclaimer", blocks: ["footer-links"], defaultContent: [] },
        { id: "section-4", name: "Legal", selector: ["section.footer-legal"], style: null, blocks: [], defaultContent: ["section.footer-legal > *"] }
      ]
    }
  };
  var transformers = [
    transform
  ];
  function templateFor(url) {
    const file = (new URL(url).pathname.split("/").pop() || "").replace(/\.html?$/, "");
    return TEMPLATES[file] || TEMPLATES["kotak-life"];
  }
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: payload.template
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
    const description = document2.querySelector('meta[name="description"]');
    meta.Title = template.metadata.Title || (document2.title || "").trim();
    if (description && description.content) meta.Description = description.content.trim();
    Object.entries(template.metadata).forEach(([key, value]) => {
      if (key !== "Title") meta[key] = value;
    });
    const block = WebImporter.Blocks.getMetadataBlock(document2, meta);
    main.append(block);
    return meta;
  }
  function relativizeUrls(main) {
    main.querySelectorAll("img[src]").forEach((img) => {
      const m = img.getAttribute("src").match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/images\/kotak\/[^?#]+)/i);
      if (m) img.setAttribute("src", m[1]);
    });
    main.querySelectorAll("a[href]").forEach((a) => {
      const m = a.getAttribute("href").match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/[^#]*)?(#.*)?$/i);
      if (m) a.setAttribute("href", (m[1] && m[1] !== "/" ? m[1] : "") + (m[2] || "") || "#");
    });
  }
  var import_kotak_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const template = templateFor(params.originalURL || url);
      const main = document2.querySelector("main") || document2.body;
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { template }));
      const pageBlocks = findBlocksOnPage(document2, template);
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
      executeTransformers("afterTransform", main, __spreadProps(__spreadValues({}, payload), { template }));
      if (template.metadata) {
        main.appendChild(document2.createElement("hr"));
        addMetadata(main, document2, template);
      }
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      relativizeUrls(main);
      const path = WebImporter.FileUtils.sanitizePath(template.path);
      return [{
        element: main,
        path,
        report: {
          title: template.metadata ? template.metadata.Title : template.description,
          template: template.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_kotak_exports);
})();
