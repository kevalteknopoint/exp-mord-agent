/* eslint-disable */
/* global WebImporter */

/**
 * Shared helpers for the dept.global site importer (import-dept-site.js).
 */

const BLOCK_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'TABLE', 'BLOCKQUOTE', 'PRE', 'HR']);
const DROP_SELECTOR = 'svg, button, form, input, select, textarea, label, script, style, noscript, template, dialog, iframe:not([src*="youtube"]):not([src*="vimeo"])';

/** Collapsed, trimmed text of an element (nbsp → space). */
export function text(el) {
  return el ? el.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

/** First matching element of a list of selectors. */
export function pick(root, ...selectors) {
  for (const s of selectors) {
    const el = root.querySelector(s);
    if (el) return el;
  }
  return null;
}

/** p > a (button-style link, decorated as button in EDS when it is alone in its paragraph). */
export function linkParagraph(document, href, label, strong = false) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  if (strong) {
    const s = document.createElement('strong');
    s.append(a);
    p.append(s);
  } else {
    p.append(a);
  }
  return p;
}

/** New element with text. */
export function el(document, tag, content) {
  const node = document.createElement(tag);
  if (content !== undefined) node.textContent = content;
  return node;
}

/** Copy of an image as a plain <img> (src + alt only; lazy src resolved). */
export function image(document, img) {
  if (!img) return null;
  const src = img.getAttribute('data-src') || img.currentSrc || img.getAttribute('src');
  if (!src || src.startsWith('data:')) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = (img.getAttribute('alt') || '').trim();
  return out;
}

/** Background image url of an element (inline style or data attributes), as <img>. */
export function backgroundImage(document, node) {
  if (!node) return null;
  const style = node.getAttribute('style') || '';
  const m = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
  const src = (m && m[1]) || node.getAttribute('data-bg') || node.getAttribute('data-background-image');
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = '';
  return out;
}

/**
 * Converts any source markup into flat default content (headings, paragraphs, lists, tables,
 * images, links). Wrapper elements are unwrapped; loose inline content is grouped into <p>.
 * @returns {Element[]} top-level nodes
 */
export function flatten(document, source) {
  const root = source.cloneNode(true);
  root.querySelectorAll(DROP_SELECTOR).forEach((n) => n.remove());
  root.querySelectorAll('[aria-hidden="true"]').forEach((n) => {
    if (!n.querySelector('img')) n.remove();
  });
  const out = [];
  let para = null;
  const flush = () => {
    if (para && (text(para) || para.querySelector('img'))) out.push(para);
    para = null;
  };
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        if (child.textContent.trim()) {
          para = para || document.createElement('p');
          para.append(child.textContent.replace(/\s+/g, ' '));
        }
        return;
      }
      if (child.nodeType !== 1) return;
      const tag = child.tagName;
      // data tables (event schedules): every table would become a block named after its first
      // cell, so one paragraph per row instead (header row bold, cells separated by " · ")
      if (tag === 'TABLE') {
        flush();
        [...child.querySelectorAll('tr')].forEach((tr, i) => {
          const line = [...tr.children].map((c) => text(c)).filter(Boolean).join(' · ');
          if (!line) return;
          const p = document.createElement('p');
          if (i === 0 && tr.querySelector('th')) p.append(el(document, 'strong', line));
          else p.textContent = line;
          out.push(p);
        });
        return;
      }
      if (BLOCK_TAGS.has(tag)) {
        flush();
        if (text(child) || child.querySelector('img') || tag === 'HR') out.push(child);
        return;
      }
      if (tag === 'IMG') {
        const img = image(document, child);
        if (img) {
          flush();
          const p = document.createElement('p');
          p.append(img);
          out.push(p);
        }
        return;
      }
      if (tag === 'PICTURE') {
        const img = image(document, child.querySelector('img'));
        if (img) {
          flush();
          const p = document.createElement('p');
          p.append(img);
          out.push(p);
        }
        return;
      }
      if (tag === 'VIDEO') {
        const src = child.getAttribute('src') || (child.querySelector('source') && child.querySelector('source').getAttribute('src'));
        if (src) {
          flush();
          out.push(linkParagraph(document, src, src));
        }
        return;
      }
      if (tag === 'IFRAME') {
        flush();
        const src = child.getAttribute('src') || child.getAttribute('data-src');
        if (src) out.push(linkParagraph(document, src, src));
        return;
      }
      if (tag === 'A') {
        // a link wrapping block content (cards): keep its content, then the link itself
        if (child.querySelector('h1, h2, h3, h4, h5, h6, p, div, img, picture')) {
          flush();
          walk(child);
          const label = text(child.querySelector('h1, h2, h3, h4, h5, h6')) || text(child);
          if (child.href && label) out.push(linkParagraph(document, child.href, label));
          return;
        }
        if (!text(child)) return;
        para = para || document.createElement('p');
        para.append(child);
        return;
      }
      if (['STRONG', 'B', 'EM', 'I', 'U', 'SUB', 'SUP', 'CODE', 'BR'].includes(tag)) {
        para = para || document.createElement('p');
        para.append(child);
        return;
      }
      // span / div / section / article / figure / etc.
      const bg = backgroundImage(document, child);
      if (bg) {
        flush();
        const p = document.createElement('p');
        p.append(bg);
        out.push(p);
      }
      const isInline = tag === 'SPAN' && !child.querySelector('div, p, h1, h2, h3, h4, h5, h6, ul, ol, img, picture');
      if (isInline) {
        if (!text(child)) return;
        para = para || document.createElement('p');
        para.append(child.textContent.replace(/\s+/g, ' '));
        return;
      }
      flush();
      walk(child);
      flush();
    });
  };
  walk(root);
  flush();
  // strip presentation attributes
  out.forEach((n) => {
    [n, ...n.querySelectorAll('*')].forEach((e) => {
      [...e.attributes].forEach((a) => {
        if (!['href', 'src', 'alt', 'colspan', 'rowspan'].includes(a.name)) e.removeAttribute(a.name);
      });
    });
  });
  return out;
}

/** Replace an element with flattened default content. */
export function replaceWithContent(document, element, nodes) {
  const list = nodes || flatten(document, element);
  if (list.length) element.replaceWith(...list);
  else element.remove();
}

/**
 * Cell content with an xwalk field hint: [<!-- field:name -->, ...nodes]
 * (nodes may be Element, string or arrays)
 */
export function field(document, name, ...nodes) {
  const frag = document.createDocumentFragment();
  const flat = nodes.flat().filter(Boolean);
  if (!flat.length) return '';
  frag.append(document.createComment(` field:${name} `));
  flat.forEach((n) => frag.append(typeof n === 'string' ? document.createTextNode(n) : n));
  return frag;
}

/** Create a block table. */
export function block(document, name, cells) {
  return WebImporter.Blocks.createBlock(document, { name, cells });
}

/**
 * Maps a dept.global URL to the migrated site path (/dept/<live path>), or returns the input
 * unchanged for assets, files and external URLs.
 */
export function localHref(href) {
  if (!href || href === '/dept' || href.startsWith('/dept/') || href.startsWith('#')) return href;
  let u;
  try {
    u = new URL(href, 'https://www.dept.global/');
  } catch (e) {
    return href;
  }
  if (!/^(www\.)?dept\.global$/.test(u.hostname)) return href;
  if (u.pathname.startsWith('/wp-content/') || u.pathname.startsWith('/wp-json/')) return u.href;
  if (/\.[a-z0-9]{2,5}$/i.test(u.pathname)) return u.href;
  if (u.search && /[?&](p|post_type|s)=/.test(u.search)) return u.href;
  const path = u.pathname.replace(/\/+$/, '');
  return `/dept${path || '/index'}${u.hash || ''}`;
}

/** AEM Assets folder of the DEPT site images (uploaded with tools/aem-packages/dept/). */
export const DAM_ROOT = '/content/dam/exp-mord-agent/dept';

/**
 * AEM Assets path of a dept.global image: https://www.dept.global/wp-content/<path>
 * → /content/dam/exp-mord-agent/dept/<path> (characters AEM does not allow in names → "-").
 * Returns null for images of other hosts.
 */
export function damPath(src) {
  if (!src) return null;
  if (src.startsWith(`${DAM_ROOT}/`)) return src;
  let u;
  try {
    u = new URL(src, 'https://www.dept.global/');
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
  rel = rel.split('/').filter(Boolean).map((seg) => seg.replace(/[^A-Za-z0-9._-]+/g, '-')).join('/');
  return `${DAM_ROOT}/${rel}`;
}

/**
 * Points every dept.global image below root to its AEM Assets path.
 * @returns {Array<[string, string]>} [source URL, DAM path] pairs (for the upload manifest)
 */
export function useDamImages(root) {
  const pairs = [];
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    const dam = damPath(src);
    if (!dam) return;
    img.setAttribute('src', dam);
    let source = src;
    try {
      source = new URL(src, 'https://www.dept.global/').href.split(/[?#]/)[0];
    } catch (e) { /* keep */ }
    pairs.push([source, dam]);
  });
  root.querySelectorAll('source[srcset]').forEach((s) => s.remove());
  return pairs;
}
