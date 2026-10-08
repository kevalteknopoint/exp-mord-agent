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

  // tools/importer/import-tatacars.js
  var import_tatacars_exports = {};
  __export(import_tatacars_exports, {
    default: () => import_tatacars_default
  });

  // tools/importer/parsers/carousel-showcase.js
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
  function richNodes(document2, root) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (child.tagName === "IMG" || !clean(child.textContent)) return;
      if (child.tagName === "A") {
        const p = document2.createElement("p");
        p.append(child.cloneNode(true));
        nodes.push(p);
        return;
      }
      nodes.push(child.cloneNode(true));
    });
    return nodes;
  }
  function parse(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(":scope > article")].map((card) => {
      const row = [imageCell(document2, card.querySelector("img")), hinted(document2, "text", ...richNodes(document2, card))];
      return row;
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "carousel-showcase", cells }));
  }

  // tools/importer/parsers/filter-dropdowns.js
  function clean2(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted2(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function richNodes2(document2, root) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (child.tagName === "IMG" || !clean2(child.textContent)) return;
      if (child.tagName === "A") {
        const p = document2.createElement("p");
        p.append(child.cloneNode(true));
        nodes.push(p);
        return;
      }
      nodes.push(child.cloneNode(true));
    });
    return nodes;
  }
  function parse2(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(":scope > .filter")].map((filter) => [
      hinted2(document2, "title", document2.createTextNode(clean2(filter.getAttribute("data-label")))),
      hinted2(document2, "text", ...richNodes2(document2, filter))
    ]);
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "filter-dropdowns", cells }));
  }

  // tools/importer/parsers/cards-car.js
  function clean3(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted3(document2, field, ...nodes) {
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
  function richNodes3(document2, root) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (child.tagName === "IMG" || !clean3(child.textContent)) return;
      if (child.tagName === "A") {
        const p = document2.createElement("p");
        p.append(child.cloneNode(true));
        nodes.push(p);
        return;
      }
      nodes.push(child.cloneNode(true));
    });
    return nodes;
  }
  function parse3(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(":scope > article")].map((card) => {
      const row = [imageCell2(document2, card.querySelector("img")), hinted3(document2, "text", ...richNodes3(document2, card))];
      row.push(hinted3(document2, "offer", document2.createTextNode(clean3(card.getAttribute("data-offer")))));
      return row;
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-car", cells }));
  }

  // tools/importer/parsers/calculator-emi.js
  function clean4(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse4(element, { document: document2 }) {
    const cells = [];
    element.querySelectorAll(":scope > dt").forEach((dt) => {
      const dd = dt.nextElementSibling;
      if (!dd || dd.tagName !== "DD") return;
      const key = clean4(dt.textContent);
      const value = document2.createDocumentFragment();
      const img = dd.querySelector("img");
      if (img) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = img.getAttribute("alt") || "";
        value.append(i);
      } else if (["ctaLink"].includes(key)) {
        const a = document2.createElement("a");
        a.href = clean4(dd.textContent) || "#";
        a.textContent = clean4(dd.textContent) || "#";
        value.append(a);
      } else {
        value.append(document2.createTextNode(clean4(dd.textContent)));
      }
      cells.push([key, value]);
    });
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "calculator-emi", cells }));
  }

  // tools/importer/parsers/dealer-finder.js
  function clean5(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse5(element, { document: document2 }) {
    const cells = [];
    element.querySelectorAll(":scope > dt").forEach((dt) => {
      const dd = dt.nextElementSibling;
      if (!dd || dd.tagName !== "DD") return;
      const key = clean5(dt.textContent);
      const value = document2.createDocumentFragment();
      const img = dd.querySelector("img");
      if (img) {
        const i = document2.createElement("img");
        i.src = img.getAttribute("src");
        i.alt = img.getAttribute("alt") || "";
        value.append(i);
      } else if (["action"].includes(key)) {
        const a = document2.createElement("a");
        a.href = clean5(dd.textContent) || "#";
        a.textContent = clean5(dd.textContent) || "#";
        value.append(a);
      } else {
        value.append(document2.createTextNode(clean5(dd.textContent)));
      }
      cells.push([key, value]);
    });
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "dealer-finder", cells }));
  }

  // tools/importer/parsers/carousel-reels.js
  function clean6(t) {
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
  function parse6(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(":scope > article")].map((card) => {
      const link = card.querySelector(":scope > a");
      const a = document2.createElement("a");
      if (link) {
        a.href = link.getAttribute("href") || "#";
        a.textContent = clean6(link.textContent);
      }
      const paragraphs = [...card.querySelectorAll(":scope > p")].map((p) => p.cloneNode(true));
      return [
        imageCell3(document2, card.querySelector("img")),
        hinted4(document2, "text", ...paragraphs),
        hinted4(document2, "link", ...link ? [a] : []),
        hinted4(document2, "duration", document2.createTextNode(clean6(card.getAttribute("data-duration"))))
      ];
    });
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "carousel-reels", cells }));
  }

  // tools/importer/parsers/cards-action.js
  function clean7(t) {
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
  function richNodes4(document2, root) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (child.tagName === "IMG" || !clean7(child.textContent)) return;
      if (child.tagName === "A") {
        const p = document2.createElement("p");
        p.append(child.cloneNode(true));
        nodes.push(p);
        return;
      }
      nodes.push(child.cloneNode(true));
    });
    return nodes;
  }
  function parse7(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(":scope > li")].map((card) => {
      const row = [imageCell4(document2, card.querySelector("img")), hinted5(document2, "text", ...richNodes4(document2, card))];
      return row;
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-action", cells }));
  }

  // tools/importer/parsers/cards-proof.js
  function clean8(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted6(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function richNodes5(document2, root) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (child.tagName === "IMG" || !clean8(child.textContent)) return;
      if (child.tagName === "A") {
        const p = document2.createElement("p");
        p.append(child.cloneNode(true));
        nodes.push(p);
        return;
      }
      nodes.push(child.cloneNode(true));
    });
    return nodes;
  }
  function parse8(element, { document: document2 }) {
    const cells = [...element.querySelectorAll(":scope > li")].map((card) => {
      const row = [hinted6(document2, "text", ...richNodes5(document2, card))];
      return row;
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-proof", cells }));
  }

  // tools/importer/parsers/cta-sticky.js
  function clean9(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted7(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function richNodes6(document2, root) {
    const nodes = [];
    [...root.children].forEach((child) => {
      if (child.tagName === "IMG" || !clean9(child.textContent)) return;
      if (child.tagName === "A") {
        const p = document2.createElement("p");
        p.append(child.cloneNode(true));
        nodes.push(p);
        return;
      }
      nodes.push(child.cloneNode(true));
    });
    return nodes;
  }
  function parse9(element, { document: document2 }) {
    const cells = [[hinted7(document2, "text", ...richNodes6(document2, element))]];
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cta-sticky", cells }));
  }

  // tools/importer/parsers/form-contact.js
  function clean10(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted8(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    const hasContent = nodes.some((n) => (n.textContent || "").trim() || n.querySelector && n.querySelector("img") || n.nodeName === "IMG");
    if (hasContent) frag.append(document2.createComment(` field:${field} `));
    frag.append(...nodes);
    return frag;
  }
  function text(document2, value) {
    return document2.createTextNode(value);
  }
  function parse10(element, { document: document2 }) {
    const cells = [];
    const intro = element.querySelector(".contact-intro, .lead-intro");
    const introNodes = [];
    let introImage = null;
    if (intro) {
      [...intro.children].forEach((child) => {
        const img = child.tagName === "IMG" ? child : child.querySelector("img");
        if (img && !clean10(child.textContent)) {
          introImage = img;
          return;
        }
        if (!clean10(child.textContent)) return;
        const isHeading = /^H[1-6]$/.test(child.tagName);
        const el = document2.createElement(isHeading ? "h2" : "p");
        if (isHeading) el.innerHTML = child.innerHTML.trim();
        else el.textContent = clean10(child.textContent);
        introNodes.push(el);
      });
    }
    const introCell = hinted8(document2, "intro", ...introNodes);
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
        np.textContent = clean10(p.textContent);
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
            l.textContent = clean10(a.textContent);
            nli.append(l, text(document2, ` ${clean10(li.textContent.replace(a.textContent, ""))}`));
          } else nli.textContent = clean10(li.textContent);
          ul.append(nli);
        });
        contactNodes.push(ul);
      }
    }
    cells.push([hinted8(document2, "contact", ...contactNodes)]);
    const form = element.querySelector("form");
    const submit = form ? form.querySelector('button[type="submit"], button') : null;
    cells.push([hinted8(document2, "submitLabel", text(document2, clean10(submit ? submit.textContent : "Submit")))]);
    const action = form ? form.getAttribute("action") || "" : "";
    cells.push([hinted8(document2, "action", text(document2, action === "#" ? "" : action))]);
    (form ? [...form.querySelectorAll(".field")] : []).forEach((field) => {
      const control = field.querySelector("input, select, textarea");
      const declaredKind = field.getAttribute("data-kind");
      if (!control && !declaredKind) return;
      const label = clean10((field.querySelector("label") || field).textContent);
      let kind = declaredKind || "text";
      let options = "";
      let settings = [];
      if (control) {
        if (control.tagName === "SELECT") kind = "select";
        else if (control.tagName === "TEXTAREA") kind = "textarea";
        else if (["email", "tel", "date", "checkbox"].includes(control.getAttribute("type"))) kind = control.getAttribute("type");
        options = control.tagName === "SELECT" ? [...control.querySelectorAll("option")].map((o) => clean10(o.textContent)).filter(Boolean).join(", ") : "";
        if (control.hasAttribute("required")) settings.push("required");
        if (field.getAttribute("data-width") === "full") settings.push("full");
      }
      if (field.hasAttribute("data-settings")) {
        settings = field.getAttribute("data-settings").split(",").map((v) => v.trim()).filter(Boolean);
      }
      cells.push([
        hinted8(document2, "label", text(document2, label)),
        hinted8(document2, "kind", text(document2, kind)),
        hinted8(document2, "options", text(document2, options)),
        hinted8(document2, "settings", text(document2, settings.join(", ")))
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "form-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/tatacars-sections.js
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

  // tools/importer/import-tatacars.js
  var parsers = {
    "carousel-showcase": parse,
    "filter-dropdowns": parse2,
    "cards-car": parse3,
    "calculator-emi": parse4,
    "dealer-finder": parse5,
    "carousel-reels": parse6,
    "cards-action": parse7,
    "cards-proof": parse8,
    "cta-sticky": parse9,
    "form-contact": parse10
  };
  var TEMPLATES = {
    "tata-cars": {
      name: "tata-cars",
      description: "Tata Cars homepage from a mobile design image: announcement, car hero carousel, filters + bestsellers, EMI calculator, dealer finder, customer reels, quick actions, why-choose proof points, sticky CTA",
      path: "/tata-cars",
      metadata: {
        Title: "TATA.CARS | Skip the waitlist. Secure yours today.",
        template: "tatacars",
        nav: "/tata-cars-nav",
        footer: "/tata-cars-footer"
      },
      blocks: [
        { name: "carousel-showcase", instances: ["#hero .showcase"] },
        { name: "filter-dropdowns", instances: ["#bestsellers .filters"] },
        { name: "cards-car", instances: ["#bestsellers .cars"] },
        { name: "calculator-emi", instances: ["#emi .calculator"] },
        { name: "dealer-finder", instances: ["#dealers .dealer-finder"] },
        { name: "carousel-reels", instances: ["#family .reels"] },
        { name: "cards-action", instances: ["#actions .action-cards"] },
        { name: "cards-proof", instances: ["#proof .proof-cards"] },
        { name: "cta-sticky", instances: ["#sticky .sticky-cta"] }
      ],
      sections: [
        { id: "section-1", name: "Announcement", selector: ["#announce"], style: "tc-announce", blocks: [], defaultContent: ["#announce > p"] },
        { id: "section-2", name: "Hero", selector: ["#hero"], style: null, blocks: ["carousel-showcase"], defaultContent: [] },
        { id: "section-3", name: "Bestsellers", selector: ["#bestsellers"], style: "tc-dark", blocks: ["filter-dropdowns", "cards-car"], defaultContent: ["#bestsellers > h2", "#bestsellers > p"] },
        { id: "section-4", name: "EMI calculator", selector: ["#emi"], style: "tc-center", blocks: ["calculator-emi"], defaultContent: ["#emi > h2", "#emi > p"] },
        { id: "section-5", name: "Dealers", selector: ["#dealers"], style: null, blocks: ["dealer-finder"], defaultContent: ["#dealers > h2", "#dealers > p"] },
        { id: "section-6", name: "Tata family", selector: ["#family"], style: null, blocks: ["carousel-reels"], defaultContent: ["#family > h2"] },
        { id: "section-7", name: "Quick actions", selector: ["#actions"], style: null, blocks: ["cards-action"], defaultContent: [] },
        { id: "section-8", name: "Why choose", selector: ["#why"], style: "tc-why", blocks: [], defaultContent: ["#why > *"] },
        { id: "section-9", name: "Proof points", selector: ["#proof"], style: "tc-black", blocks: ["cards-proof"], defaultContent: [] },
        { id: "section-10", name: "Sticky CTA", selector: ["#sticky"], style: null, blocks: ["cta-sticky"], defaultContent: [] }
      ]
    },
    "tata-cars-nav": {
      name: "tata-cars-nav",
      description: "Tata Cars header fragment: brand | sections | tools",
      path: "/tata-cars-nav",
      metadata: null,
      // fragment - no page metadata block
      blocks: [],
      sections: [
        { id: "section-1", name: "Brand", selector: [".nav-brand"], style: null, blocks: [], defaultContent: [".nav-brand p"] },
        { id: "section-2", name: "Sections", selector: [".nav-sections"], style: null, blocks: [], defaultContent: [".nav-sections > ul"] },
        { id: "section-3", name: "Tools", selector: [".nav-tools"], style: null, blocks: [], defaultContent: [".nav-tools > ul"] }
      ]
    },
    "tata-cars-footer": {
      name: "tata-cars-footer",
      description: "Tata Cars footer fragment: brand, newsletter (form-contact), range + links, contact + social",
      path: "/tata-cars-footer",
      metadata: null,
      // fragment - no page metadata block
      blocks: [
        { name: "form-contact", instances: [".footer-newsletter .lead-form"] }
      ],
      sections: [
        { id: "section-1", name: "Brand", selector: ["section.footer-brand"], style: null, blocks: [], defaultContent: ["section.footer-brand > *"] },
        { id: "section-2", name: "Newsletter", selector: ["section.footer-newsletter"], style: null, blocks: ["form-contact"], defaultContent: [] },
        { id: "section-3", name: "Links", selector: ["section.footer-links"], style: null, blocks: [], defaultContent: ["section.footer-links > *"] },
        { id: "section-4", name: "Contact", selector: ["section.footer-contact"], style: null, blocks: [], defaultContent: ["section.footer-contact > *"] }
      ]
    }
  };
  var transformers = [
    transform
  ];
  function templateFor(url) {
    const file = (new URL(url).pathname.split("/").pop() || "").replace(/\.html?$/, "");
    return TEMPLATES[file] || TEMPLATES["tata-cars"];
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
      const m = img.getAttribute("src").match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/images\/tatacars\/[^?#]+)/i);
      if (m) img.setAttribute("src", m[1]);
    });
    main.querySelectorAll("a[href]").forEach((a) => {
      const m = a.getAttribute("href").match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/[^#]*)?(#.*)?$/i);
      if (m) a.setAttribute("href", (m[1] && m[1] !== "/" ? m[1] : "") + (m[2] || "") || "#");
    });
  }
  var import_tatacars_default = {
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
  return __toCommonJS(import_tatacars_exports);
})();
