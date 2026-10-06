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

  // tools/importer/import-broadridge.js
  var import_broadridge_exports = {};
  __export(import_broadridge_exports, {
    default: () => import_broadridge_default
  });

  // tools/importer/parsers/hero-split.js
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function link(document2, a) {
    const p = document2.createElement("p");
    const l = document2.createElement("a");
    l.href = a.getAttribute("href") || "#";
    l.textContent = clean(a.textContent);
    p.append(l);
    return p;
  }
  function parse(element, { document: document2 }) {
    const panels = [...element.querySelectorAll(":scope > .hero-main, :scope > .hero-promo")];
    const cells = [];
    panels.forEach((panel, index) => {
      const imageCell = document2.createDocumentFragment();
      const src = panel.querySelector("img");
      if (src && src.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell.append(document2.createComment(" field:image "), img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.append(document2.createComment(" field:text "));
      const tag = panel.querySelector(".tag");
      if (tag) {
        const p = document2.createElement("p");
        p.textContent = clean(tag.textContent);
        textCell.append(p);
      }
      const heading = panel.querySelector("h1, h2, h3");
      if (heading) {
        const h = document2.createElement(index === 0 ? "h1" : "h2");
        h.textContent = clean(heading.textContent);
        textCell.append(h);
      }
      panel.querySelectorAll(":scope > p:not(.tag)").forEach((p) => {
        const a = p.querySelector("a");
        if (a) textCell.append(link(document2, a));
        else if (clean(p.textContent)) {
          const np = document2.createElement("p");
          np.textContent = clean(p.textContent);
          textCell.append(np);
        }
      });
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-solution.js
  function clean2(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse2(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".solution-card")];
    const cells = [];
    cards.forEach((card) => {
      const imageCell = document2.createDocumentFragment();
      const src = card.querySelector("img");
      if (src && src.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell.append(document2.createComment(" field:image "), img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.append(document2.createComment(" field:text "));
      [...card.children].forEach((child) => {
        if (child.tagName === "IMG") return;
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document2.createElement("h3");
          h.innerHTML = child.innerHTML.trim();
          textCell.append(h);
          return;
        }
        const a = child.querySelector("a");
        const p = document2.createElement("p");
        if (a) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean2(a.textContent);
          p.append(l);
        } else {
          if (!clean2(child.textContent)) return;
          p.textContent = clean2(child.textContent);
        }
        textCell.append(p);
      });
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-solution", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-feature.js
  function clean3(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse3(element, { document: document2 }) {
    const panels = [...element.querySelectorAll(".tab-panel")];
    const cells = [];
    panels.forEach((panel, i) => {
      const labelCell = document2.createDocumentFragment();
      labelCell.append(document2.createComment(" field:title "), document2.createTextNode(clean3(panel.getAttribute("data-label")) || `Tab ${i + 1}`));
      const imageCell = document2.createDocumentFragment();
      const src = panel.querySelector("img");
      if (src && src.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell.append(document2.createComment(" field:image "), img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.append(document2.createComment(" field:text "));
      [...panel.children].forEach((child) => {
        if (child.tagName === "IMG") return;
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document2.createElement("h3");
          h.textContent = clean3(child.textContent);
          textCell.append(h);
        } else if (clean3(child.textContent)) {
          const p = document2.createElement("p");
          const a = child.querySelector("a");
          if (a) {
            const l = document2.createElement("a");
            l.href = a.getAttribute("href") || "#";
            l.textContent = clean3(a.textContent);
            p.append(l);
          } else p.textContent = clean3(child.textContent);
          textCell.append(p);
        }
      });
      cells.push([labelCell, imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-vertical.js
  function clean4(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse4(element, { document: document2 }) {
    const panels = [...element.querySelectorAll(".tab-panel")];
    const cells = [];
    panels.forEach((panel, i) => {
      const labelCell = document2.createDocumentFragment();
      labelCell.append(document2.createComment(" field:title "), document2.createTextNode(clean4(panel.getAttribute("data-label")) || `Tab ${i + 1}`));
      const textCell = document2.createDocumentFragment();
      textCell.append(document2.createComment(" field:text "));
      [...panel.children].forEach((child) => {
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document2.createElement("h3");
          h.textContent = clean4(child.textContent);
          textCell.append(h);
        } else if (clean4(child.textContent)) {
          const p = document2.createElement("p");
          const a = child.querySelector("a");
          if (a) {
            const l = document2.createElement("a");
            l.href = a.getAttribute("href") || "#";
            l.textContent = clean4(a.textContent);
            p.append(l);
          } else p.textContent = clean4(child.textContent);
          textCell.append(p);
        }
      });
      cells.push([labelCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-vertical", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-recognition.js
  function clean5(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse5(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".recognition-card")];
    const cells = [];
    cards.forEach((card) => {
      const imageCell = document2.createDocumentFragment();
      const src = card.querySelector("img");
      if (src && src.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell.append(document2.createComment(" field:image "), img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.append(document2.createComment(" field:text "));
      [...card.children].forEach((child) => {
        if (child.tagName === "IMG") return;
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document2.createElement("h3");
          h.innerHTML = child.innerHTML.trim();
          textCell.append(h);
          return;
        }
        const a = child.querySelector("a");
        const p = document2.createElement("p");
        if (a) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean5(a.textContent);
          p.append(l);
        } else {
          if (!clean5(child.textContent)) return;
          p.textContent = clean5(child.textContent);
        }
        textCell.append(p);
      });
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-recognition", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-spotlight.js
  function clean6(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function parse6(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".spotlight-card")];
    const cells = [];
    cards.forEach((card) => {
      const imageCell = document2.createDocumentFragment();
      const src = card.querySelector("img");
      if (src && src.getAttribute("src")) {
        const img = document2.createElement("img");
        img.src = src.getAttribute("src");
        img.alt = src.getAttribute("alt") || "";
        imageCell.append(document2.createComment(" field:image "), img);
      }
      const textCell = document2.createDocumentFragment();
      textCell.append(document2.createComment(" field:text "));
      [...card.children].forEach((child) => {
        if (child.tagName === "IMG") return;
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document2.createElement("h3");
          h.innerHTML = child.innerHTML.trim();
          textCell.append(h);
          return;
        }
        const a = child.querySelector("a");
        const p = document2.createElement("p");
        if (a) {
          const l = document2.createElement("a");
          l.href = a.getAttribute("href") || "#";
          l.textContent = clean6(a.textContent);
          p.append(l);
        } else {
          if (!clean6(child.textContent)) return;
          p.textContent = clean6(child.textContent);
        }
        textCell.append(p);
      });
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form-contact.js
  function clean7(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function hinted(document2, field, ...nodes) {
    const frag = document2.createDocumentFragment();
    frag.append(document2.createComment(` field:${field} `), ...nodes);
    return frag;
  }
  function text(document2, value) {
    return document2.createTextNode(value);
  }
  function parse7(element, { document: document2 }) {
    const cells = [];
    const intro = element.querySelector(".contact-intro");
    const introNodes = [];
    if (intro) {
      [...intro.children].forEach((child) => {
        if (!clean7(child.textContent)) return;
        const el = document2.createElement(/^H[1-6]$/.test(child.tagName) ? "h2" : "p");
        el.textContent = clean7(child.textContent);
        introNodes.push(el);
      });
    }
    cells.push([hinted(document2, "intro", ...introNodes)]);
    const contact = element.querySelector(".contact-specialists");
    const contactNodes = [];
    if (contact) {
      contact.querySelectorAll(":scope > p").forEach((p) => {
        const np = document2.createElement("p");
        np.textContent = clean7(p.textContent);
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
            l.textContent = clean7(a.textContent);
            nli.append(l, text(document2, ` ${clean7(li.textContent.replace(a.textContent, ""))}`));
          } else nli.textContent = clean7(li.textContent);
          ul.append(nli);
        });
        contactNodes.push(ul);
      }
    }
    cells.push([hinted(document2, "contact", ...contactNodes)]);
    const form = element.querySelector("form");
    const submit = form ? form.querySelector('button[type="submit"], button') : null;
    cells.push([hinted(document2, "submitLabel", text(document2, clean7(submit ? submit.textContent : "Submit")))]);
    const action = form ? form.getAttribute("action") || "" : "";
    cells.push([hinted(document2, "action", text(document2, action === "#" ? "" : action))]);
    (form ? [...form.querySelectorAll(".field")] : []).forEach((field) => {
      const control = field.querySelector("input, select, textarea");
      if (!control) return;
      const label = clean7((field.querySelector("label") || {}).textContent);
      let kind = "text";
      if (control.tagName === "SELECT") kind = "select";
      else if (control.tagName === "TEXTAREA") kind = "textarea";
      else if (["email", "tel"].includes(control.getAttribute("type"))) kind = control.getAttribute("type");
      const options = control.tagName === "SELECT" ? [...control.querySelectorAll("option")].map((o) => clean7(o.textContent)).filter(Boolean).join(", ") : "";
      const settings = [];
      if (control.hasAttribute("required")) settings.push("required");
      if (field.getAttribute("data-width") === "full") settings.push("full");
      cells.push([
        hinted(document2, "label", text(document2, label)),
        hinted(document2, "kind", text(document2, kind)),
        hinted(document2, "options", text(document2, options)),
        hinted(document2, "settings", text(document2, settings.join(", ")))
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "form-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-broadridge-footer.js
  function parse8(element, { document: document2 }) {
    const columns = [...element.querySelectorAll(":scope > div")].map((col) => {
      const frag = document2.createDocumentFragment();
      [...col.children].forEach((child) => frag.append(child));
      return frag;
    });
    if (!columns.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells: [columns] });
    element.replaceWith(block);
  }

  // tools/importer/transformers/broadridge-sections.js
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

  // tools/importer/import-broadridge.js
  var parsers = {
    "hero-split": parse,
    "cards-solution": parse2,
    "tabs-feature": parse3,
    "tabs-vertical": parse4,
    "cards-recognition": parse5,
    "cards-spotlight": parse6,
    "form-contact": parse7,
    columns: parse8
  };
  var TEMPLATES = {
    broadridge: {
      name: "broadridge",
      description: "Broadridge homepage from design image: split hero, solution cards, industry tabs, capability tabs, recognition cards, spotlight cards, contact form",
      path: "/broadridge",
      metadata: {
        Title: "Broadridge | Be ready for what the market demands next",
        template: "broadridge",
        nav: "/broadridge-nav",
        footer: "/broadridge-footer"
      },
      blocks: [
        { name: "hero-split", instances: ["#hero .hero-split"] },
        { name: "cards-solution", instances: ["#featured-solutions .solution-cards"] },
        { name: "tabs-feature", instances: ["#industries .industry-tabs"] },
        { name: "tabs-vertical", instances: ["#capabilities .capability-tabs"] },
        { name: "cards-recognition", instances: ["#recognition .recognition-cards"] },
        { name: "cards-spotlight", instances: ["#spotlight .spotlight-cards"] },
        { name: "form-contact", instances: ["#contact .contact-form"] }
      ],
      sections: [
        { id: "section-1", name: "Hero", selector: ["#hero"], style: null, blocks: ["hero-split"], defaultContent: [] },
        { id: "section-2", name: "Featured solutions", selector: ["#featured-solutions"], style: null, blocks: ["cards-solution"], defaultContent: ["#featured-solutions > h2"] },
        { id: "section-3", name: "Industries", selector: ["#industries"], style: "br-intro-split", blocks: ["tabs-feature"], defaultContent: ["#industries .section-intro h2", "#industries .section-intro p"] },
        { id: "section-4", name: "Capabilities", selector: ["#capabilities"], style: "br-intro-split", blocks: ["tabs-vertical"], defaultContent: ["#capabilities .section-intro h2", "#capabilities .section-intro p"] },
        { id: "section-5", name: "Recognized by the industry", selector: ["#recognition"], style: "br-panel, br-cta-end", blocks: ["cards-recognition"], defaultContent: ["#recognition > h2", "#recognition .section-cta"] },
        { id: "section-6", name: "Spotlight", selector: ["#spotlight"], style: "br-cta-end", blocks: ["cards-spotlight"], defaultContent: ["#spotlight > h2", "#spotlight .section-cta"] },
        { id: "section-7", name: "Contact", selector: ["#contact"], style: "br-panel", blocks: ["form-contact"], defaultContent: [] }
      ]
    },
    "broadridge-nav": {
      name: "broadridge-nav",
      description: "Broadridge header fragment: brand | sections | tools | utility",
      path: "/broadridge-nav",
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
    "broadridge-footer": {
      name: "broadridge-footer",
      description: "Broadridge footer fragment: columns block (brand column, link lists column)",
      path: "/broadridge-footer",
      metadata: null,
      // fragment - no page metadata block
      blocks: [
        { name: "columns", instances: [".footer-columns"] }
      ],
      sections: [
        { id: "section-1", name: "Footer", selector: ["section.footer"], style: null, blocks: ["columns"], defaultContent: [] }
      ]
    }
  };
  var transformers = [
    transform
  ];
  function templateFor(url) {
    const file = (new URL(url).pathname.split("/").pop() || "").replace(/\.html?$/, "");
    return TEMPLATES[file] || TEMPLATES.broadridge;
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
      const m = img.getAttribute("src").match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/images\/broadridge\/[^?#]+)/i);
      if (m) img.setAttribute("src", m[1]);
    });
    main.querySelectorAll("a[href]").forEach((a) => {
      const m = a.getAttribute("href").match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/[^#]*)?(#.*)?$/i);
      if (m) a.setAttribute("href", (m[1] && m[1] !== "/" ? m[1] : "") + (m[2] || "") || "#");
    });
  }
  var import_broadridge_default = {
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
  return __toCommonJS(import_broadridge_exports);
})();
