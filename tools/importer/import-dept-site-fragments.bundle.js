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

  // tools/importer/import-dept-site-fragments.js
  var import_dept_site_fragments_exports = {};
  __export(import_dept_site_fragments_exports, {
    default: () => import_dept_site_fragments_default
  });

  // tools/importer/parsers/dept/utils.js
  function text(el2) {
    return el2 ? el2.textContent.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() : "";
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

  // tools/importer/import-dept-site-fragments.js
  var LOCALES = ["de-dach", "en-au", "en-dk", "en-in", "en-nl", "en-uki", "latam", "macedonia"];
  var LOCATIONS = [
    ["https://www.dept.global/", "Global"],
    ["https://www.dept.global/de-dach/", "German (DE/CH)"],
    ["https://www.dept.global/en-dk/", "Nordics (EN)"],
    ["https://www.dept.global/en-nl/", "Dutch (EN)"],
    ["https://www.dept.global/en-uki/", "English (UK/IE)"],
    ["https://www.dept.global/latam/", "Latin America (ES)"],
    ["https://www.dept.global/en-in/", "India"],
    ["https://www.dept.global/en-au/", "Australia & Oceania"]
  ];
  function el(document, tag, content) {
    const node = document.createElement(tag);
    if (content !== void 0) node.textContent = content;
    return node;
  }
  function link(document, href, label) {
    const a = el(document, "a", label);
    a.href = href;
    return a;
  }
  function para(document, ...children) {
    const p = el(document, "p");
    children.forEach((c) => p.append(c));
    return p;
  }
  function image(document, img, alt) {
    const out = el(document, "img");
    out.src = img.getAttribute("src");
    out.alt = alt !== void 0 ? alt : img.getAttribute("alt") || "";
    return out;
  }
  function linkList(document, links) {
    const ul = el(document, "ul");
    links.forEach((a) => {
      const label = text(a);
      if (!label || !a.getAttribute("href")) return;
      const li = el(document, "li");
      li.append(link(document, a.getAttribute("href"), label));
      ul.append(li);
    });
    return ul;
  }
  function sectionMetadata(document, style) {
    return WebImporter.Blocks.createBlock(document, { name: "Section Metadata", cells: { style } });
  }
  function buildNav(document, homeHref) {
    const out = el(document, "div");
    const nav = document.querySelector(".block-navigation");
    if (!nav) return null;
    const logo = nav.querySelector(".block-navigation__logo img");
    if (logo) out.append(para(document, image(document, logo, "DEPT\xAE")));
    out.append(para(document, link(document, homeHref, "DEPT\xAE")));
    out.append(el(document, "hr"));
    const ul = el(document, "ul");
    nav.querySelectorAll(".block-navigation__items > li").forEach((item) => {
      const li = el(document, "li");
      const a = item.querySelector(":scope > a");
      if (a) {
        li.append(link(document, a.getAttribute("href"), text(a)));
        ul.append(li);
        return;
      }
      const label = text(item.querySelector("button")) || text(item);
      if (!label) return;
      li.append(document.createTextNode(label));
      const groups = el(document, "ul");
      const tpl = [...document.querySelectorAll("template")].map((t) => t.content || t).find((c) => c.querySelector && c.querySelector(".block-navigation__desktop-flyout-section"));
      (tpl ? [...tpl.querySelectorAll(".block-navigation__desktop-flyout-section")] : []).forEach((section) => {
        const group = el(document, "li");
        group.append(document.createTextNode(text(section.querySelector('[class*="section-title"]'))));
        const links = [...section.querySelectorAll('[class*="section-links"] a')];
        const more = section.querySelector('[class*="section-more"]');
        if (more) links.push(more);
        group.append(linkList(document, links));
        groups.append(group);
      });
      if (groups.children.length) li.append(groups);
      ul.append(li);
    });
    out.append(ul);
    out.append(el(document, "hr"));
    if (nav.querySelector('.block-navigation__search, input[type="search"], form[action*="search"]')) {
      out.append(para(document, link(document, `${homeHref.replace(/\/$/, "")}/search/?query=`, "Search")));
    }
    const contact = nav.querySelector('.block-navigation__contact, a[href*="/contact"]');
    if (contact) {
      const strong = el(document, "strong");
      strong.append(link(document, contact.getAttribute("href"), text(contact)));
      out.append(para(document, strong));
    }
    return out;
  }
  function buildFooter(document, homeHref) {
    const footer = document.querySelector("footer.block-footer-v2, footer");
    if (!footer) return null;
    const out = el(document, "div");
    const section = (style, nodes, last) => {
      nodes.filter(Boolean).forEach((n) => out.append(n));
      out.append(sectionMetadata(document, style));
      if (!last) out.append(el(document, "hr"));
    };
    const logo = footer.querySelector(".block-footer-v2__logo img");
    const locations = el(document, "ul");
    LOCATIONS.forEach(([href, label]) => {
      const li = el(document, "li");
      li.append(link(document, href, label));
      locations.append(li);
    });
    section("footer-brand", [
      logo && para(document, image(document, logo, "DEPT\xAE")),
      para(document, link(document, homeHref, "Go to DEPT\xAE homepage")),
      el(document, "p", text(footer.querySelector(".block-footer-v2__location-picker-trigger")) || "Change location"),
      locations
    ]);
    section("footer-studios", [linkList(document, [...footer.querySelectorAll(".block-footer-v2__studios a")])]);
    section("footer-pages", [linkList(document, [...footer.querySelectorAll(".block-footer-v2__pages a")])]);
    section("footer-contact", [
      ...[...footer.querySelectorAll(".block-footer-v2__contact-button")].map((a) => para(document, link(document, a.getAttribute("href"), text(a)))),
      linkList(document, [...footer.querySelectorAll(".block-footer-v2__social-networks a")])
    ]);
    const bcorp = footer.querySelector(".block-footer-v2__bcorp-logo");
    const climate = footer.querySelector(".block-footer-v2__climate-neutral-logo");
    section("footer-certifications", [
      bcorp && para(document, image(document, bcorp, "Certified B Corporation")),
      climate && para(document, image(document, climate, "The Climate Label - climate neutral"))
    ]);
    const apparel = footer.querySelector(".block-footer-v2__apparel-container");
    const apparelImg = footer.querySelector(".block-footer-v2__apparel-image");
    section("footer-apparel", [
      apparel && para(document, link(document, apparel.getAttribute("href"), "DEPT\xAE Apparel")),
      apparelImg && para(document, image(document, apparelImg))
    ]);
    section("footer-bottom", [
      linkList(document, [...footer.querySelectorAll(".block-footer-v2__bottom-links a")]),
      el(document, "p", text(footer.querySelector(".block-footer-v2__copyright")))
    ], true);
    return out;
  }
  function finish(root) {
    root.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", localHref(a.getAttribute("href"))));
    return useDamImages(root);
  }
  var import_dept_site_fragments_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const originalURL = params.originalURL || url;
      const [first] = new URL(originalURL).pathname.split("/").filter(Boolean);
      const locale = LOCALES.includes(first) ? first : "";
      const base = locale ? `/dept/${locale}` : "/dept";
      const homeHref = `https://www.dept.global/${locale ? `${locale}/` : ""}`;
      const fragment = new URL(originalURL).searchParams.get("dept-fragment") === "footer" ? "footer" : "nav";
      const element = fragment === "footer" ? buildFooter(document, homeHref) : buildNav(document, homeHref);
      if (!element) throw new Error(`no source ${fragment} found`);
      const images = finish(element);
      document.body.innerHTML = "";
      document.body.append(...element.childNodes);
      return [{
        element: document.body,
        path: `${base}/${fragment}`,
        report: { title: `DEPT ${fragment} (${locale || "global"})`, template: `dept-${fragment}`, images }
      }];
    }
  };
  return __toCommonJS(import_dept_site_fragments_exports);
})();
