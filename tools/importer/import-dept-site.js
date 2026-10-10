/* eslint-disable */
/* global WebImporter */

/**
 * Site-wide import script for https://www.dept.global/ (all page types, all locales).
 *
 * - Every top-level component of <main> becomes a section; its handler (parsers/dept/components.js)
 *   turns it into DEPT blocks or default content. Unknown components fall back to plain content.
 * - Output path keeps the live structure under /dept: /en-in/insight/x/ → /dept/en-in/insight/x
 *   (site root → /dept/index).
 * - Internal dept.global links are rewritten to the migrated /dept/… paths.
 * - Page metadata: template "dept" (theme styles/dept.css), theme "dept-<page type>",
 *   locale nav/footer fragments (/dept/<locale>/nav, /dept/<locale>/footer).
 */
import deptCleanupTransformer from './transformers/dept-cleanup.js';
import { HANDLERS } from './parsers/dept/components.js';
import {
  flatten, block, localHref, text, useDamImages,
} from './parsers/dept/utils.js';

const LOCALES = ['en-au-b', 'en-au', 'en-in', 'en-nl', 'en-uki', 'de-dach', 'en-dk', 'latam', 'macedonia', 'en'];
const FRAGMENT_LOCALE = { 'en-au-b': 'en-au', en: '' };
const SKIP = new Set(['flyout-drawer', 'pardot-forms', 'page-overlay', 'tracking-blockers', 'navigation', 'footer-v2']);
const THEME = /(?:__theme|background-color)--([a-zA-Z]+)\b/;
const DARK = ['onyxgrey', 'richblack', 'black', 'darkgrey', 'charcoal'];

/** Locale + page type of a live URL. */
export function classify(url) {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  const locale = LOCALES.includes(parts[0]) ? parts[0] : '';
  const rest = locale ? parts.slice(1) : parts;
  let type = 'page';
  if (!rest.length) type = 'home';
  else if (rest.length > 1) [type] = rest;
  return { locale, type };
}

/** Source component name: "block-work-listing js-…" → "work-listing"; "cta-text …" → "cta-text". */
function componentName(node) {
  const classes = [...node.classList];
  const blockClass = classes.find((c) => c.startsWith('block-'));
  if (blockClass) return blockClass.replace(/^block-/, '').replace(/__.*$/, '');
  return (classes[0] || node.tagName.toLowerCase()).replace(/__.*$/, '');
}

/** Section styles for the source background theme: dept-bg-<color> (+ dept-dark), none for white. */
function themeStyles(node) {
  // the theme sits on the component, in its data-theme, or on its first-level columns
  // (panels: __left--richBlack); text and button colour classes (typography__color--onyxGrey) are not themes
  let m = node.className.match(THEME);
  if (!m && node.getAttribute('data-theme')) m = [null, node.getAttribute('data-theme')];
  if (!m) {
    const COLUMN = /__(left|right|column)--(richBlack|onyxGrey)\b/;
    const column = [...node.children].find((child) => COLUMN.test(child.className));
    m = column && [null, column.className.match(COLUMN)[2]];
  }
  const color = m && m[1].toLowerCase();
  if (!color || color === 'white') return [];
  return DARK.includes(color) ? [`dept-bg-${color}`, 'dept-dark'] : [`dept-bg-${color}`];
}

/** Groups the children of <main> into sections: [{ parts: [{ name, elements }], prefix: [] }] */
function buildSections(sourceMain) {
  const sections = [];
  let prefix = [];
  [...sourceMain.children].forEach((node) => {
    const name = componentName(node);
    if (SKIP.has(name)) return;
    if (!text(node) && !node.querySelector('img, picture, video, iframe')) return;
    const def = HANDLERS[name] || {};
    if (def.prefixNext) {
      prefix.push(node);
      return;
    }
    const prev = sections[sections.length - 1];
    const prevPart = prev && prev.parts[prev.parts.length - 1];
    if (prevPart && !prefix.length) {
      const prevDef = HANDLERS[prevPart.name] || {};
      const key = def.groupKey ? def.groupKey(node) : '';
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
  if (prefix.length && sections.length) sections[sections.length - 1].parts.push({ name: 'text-divider', elements: prefix });
  return sections;
}

function addMetadata(container, document, meta) {
  container.append(WebImporter.Blocks.getMetadataBlock(document, meta));
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const originalURL = params.originalURL || url;
    const { locale, type } = classify(originalURL);
    const localePrefix = locale ? `/dept/${locale}` : '/dept';
    const ctx = {
      document, url, params, locale, type, localePrefix,
    };
    const body = document.body;

    // page metadata from <head> (before the body is rebuilt)
    const head = (sel, attr = 'content') => {
      const n = document.querySelector(sel);
      return n ? (n.getAttribute(attr) || '').trim() : '';
    };
    const meta = {
      Title: (document.title || head('meta[property="og:title"]')).trim(),
    };
    const description = head('meta[name="description"]') || head('meta[property="og:description"]');
    if (description) meta.Description = description;
    const ogImage = head('meta[property="og:image"]');
    if (ogImage) {
      const img = document.createElement('img');
      img.src = ogImage;
      meta.Image = img;
    }
    meta.template = 'dept';
    // pages built from the new brand components (text-sans-* type scale) use the homepage design
    const brandDesign = !!document.querySelector('main [class*="text-sans-"]');
    meta.theme = brandDesign ? `dept-${type}, dept-brand` : `dept-${type}`;
    // locales without their own homepage use the header/footer of their parent site
    const fragmentLocale = FRAGMENT_LOCALE[locale] ?? locale;
    const fragmentPrefix = fragmentLocale ? `/dept/${fragmentLocale}` : '/dept';
    meta.nav = `${fragmentPrefix}/nav`;
    meta.footer = `${fragmentPrefix}/footer`;

    try {
      deptCleanupTransformer('beforeTransform', body, payload);
    } catch (e) {
      console.error('cleanup failed', e);
    }

    const sourceMain = document.querySelector('main') || body;
    // pages listed in the sitemap that no longer exist render the 404 component: do not import them
    if (sourceMain.querySelector(':scope > .four-oh-four, .four-oh-four')) {
      throw new Error('source page is a 404 (not found) page');
    }
    const sections = buildSections(sourceMain);
    const out = document.createElement('div');
    const report = [];

    sections.forEach((section) => {
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
        const style = (typeof def.style === 'function' ? def.style(elements[0]) : def.style) || `dept-${name}`;
        style.split(',').map((x) => x.trim()).forEach((x) => {
          if (x && !styles.includes(x)) styles.push(x);
        });
      });
      styles.push(...section.theme);
      // components without content on the source (empty teasers, unfilled listings): no section
      if (!nodes.length) return;
      if (out.childNodes.length) out.append(document.createElement('hr'));
      nodes.forEach((n) => out.append(n));
      out.append(block(document, 'Section Metadata', { style: styles.join(', ') }));
    });

    // internal links → migrated paths
    out.querySelectorAll('a[href]').forEach((a) => {
      const href = localHref(a.getAttribute('href'));
      if (href) a.setAttribute('href', href);
    });

    out.append(document.createElement('hr'));
    addMetadata(out, document, meta);

    body.innerHTML = '';
    body.append(...out.childNodes);

    try {
      deptCleanupTransformer('afterTransform', body, payload);
    } catch (e) {
      console.error('cleanup failed', e);
    }
    WebImporter.rules.transformBackgroundImages(body, document);
    WebImporter.rules.adjustImageUrls(body, url, originalURL);
    // images are delivered from AEM Assets (Content Sync drops externally hosted images)
    const images = useDamImages(body);

    const livePath = new URL(originalURL).pathname.replace(/\/+$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(`/dept${livePath || '/index'}`);

    return [{
      element: body,
      path,
      report: {
        title: meta.Title,
        template: `dept-${type}`,
        locale: locale || 'global',
        components: report,
        // components without an entry (style-only entries such as statement-v2 are intended)
        fallback: report.filter((n) => !HANDLERS[n]),
        images,
      },
    }];
  },
};
