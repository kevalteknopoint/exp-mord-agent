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

  // tools/importer/import-dept-fragments.js
  var import_dept_fragments_exports = {};
  __export(import_dept_fragments_exports, {
    default: () => import_dept_fragments_default
  });

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
  function transform(hookName, element, payload) {
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

  // tools/importer/parsers/dept/utils.js
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

  // tools/importer/import-dept-fragments.js
  var TEMPLATES = {
    "dept-nav": {
      name: "dept-nav",
      description: "DEPT header fragment: brand | sections (What we do flyout + links) | tools (search, Contact)",
      path: "/dept-nav",
      blocks: [],
      sections: [
        { id: "section-1", name: "Brand", selector: [".nav-brand"], style: null, blocks: [], defaultContent: [".nav-brand p"] },
        { id: "section-2", name: "Sections", selector: [".nav-sections"], style: null, blocks: [], defaultContent: [".nav-sections > ul"] },
        { id: "section-3", name: "Tools", selector: [".nav-tools"], style: null, blocks: [], defaultContent: [".nav-tools p"] }
      ]
    },
    "dept-footer": {
      name: "dept-footer",
      description: "DEPT footer fragment: brand + locations | studios | pages | contact + social | certifications | apparel band | legal",
      path: "/dept-footer",
      blocks: [],
      sections: [
        { id: "section-1", name: "Brand + locations", selector: ["section.footer-brand"], style: "footer-brand", blocks: [], defaultContent: ["section.footer-brand > *"] },
        { id: "section-2", name: "Studios", selector: ["section.footer-studios"], style: "footer-studios", blocks: [], defaultContent: ["section.footer-studios > ul"] },
        { id: "section-3", name: "Pages", selector: ["section.footer-pages"], style: "footer-pages", blocks: [], defaultContent: ["section.footer-pages > ul"] },
        { id: "section-4", name: "Contact + social", selector: ["section.footer-contact"], style: "footer-contact", blocks: [], defaultContent: ["section.footer-contact > *"] },
        { id: "section-5", name: "Certifications", selector: ["section.footer-certifications"], style: "footer-certifications", blocks: [], defaultContent: ["section.footer-certifications > p"] },
        { id: "section-6", name: "Apparel band", selector: ["section.footer-apparel"], style: "footer-apparel", blocks: [], defaultContent: ["section.footer-apparel > p"] },
        { id: "section-7", name: "Legal", selector: ["section.footer-bottom"], style: "footer-bottom", blocks: [], defaultContent: ["section.footer-bottom > *"] }
      ]
    }
  };
  var transformers = [
    transform
  ];
  function templateFor(url) {
    const file = (new URL(url).pathname.split("/").pop() || "").replace(/\.html?$/, "");
    return TEMPLATES[file];
  }
  function executeTransformers(hookName, element, payload) {
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, payload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function relativizeUrls(main) {
    main.querySelectorAll("a[href]").forEach((a) => {
      const m = a.getAttribute("href").match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/[^#]*)?(#.*)?$/i);
      if (m) a.setAttribute("href", (m[1] && m[1] !== "/" ? m[1] : "") + (m[2] || "") || "#");
    });
  }
  var import_dept_fragments_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const template = templateFor(params.originalURL || url);
      if (!template) throw new Error(`No dept fragment template for ${params.originalURL || url}`);
      const main = document2.querySelector("main") || document2.body;
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { template }));
      executeTransformers("afterTransform", main, __spreadProps(__spreadValues({}, payload), { template }));
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      relativizeUrls(main);
      const images = useDamImages(main);
      const path = WebImporter.FileUtils.sanitizePath(template.path);
      return [{
        element: main,
        path,
        report: {
          title: template.description,
          template: template.name,
          blocks: [],
          images
        }
      }];
    }
  };
  return __toCommonJS(import_dept_fragments_exports);
})();
