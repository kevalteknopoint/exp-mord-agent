/* eslint-disable */
/* global WebImporter */

/**
 * dept.global component handlers (logos group), merged into HANDLERS in ../components.js.
 * Client / partner logo walls, award logos and the partner overview grids become the block
 * "logo-grid" (one row per logo: image | text); section titles stay default content before the
 * block. Section layouts: styles/dept-pages-parts/logos.css.
 */
import {
  text, pick, el, image, flatten, field, block, linkParagraph,
} from '../utils.js';

/** Logo image; a missing alt is taken from the file name ("Paulas-Choice.png" → "Paulas Choice"). */
function logo(document, img, altFromFile = true) {
  const out = image(document, img);
  if (!out || out.alt || !altFromFile) return out;
  const name = decodeURIComponent(out.src.split(/[?#]/)[0].split('/').pop() || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_](\d+|logo|white|size|wit|weiss)(?=[-_]|$)/gi, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  out.alt = name;
  return out;
}

/** Logo images of a wall, without the copies of a marquee (same image twice). */
function uniqueImages(element, selector) {
  const seen = new Set();
  return [...element.querySelectorAll(selector)].filter((img) => {
    const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
    if (!src || seen.has(src)) return false;
    seen.add(src);
    return true;
  });
}

/** Block "logo-grid (<variant>)": rows of [image, text]. */
function logoGrid(document, variant, items) {
  const rows = items.filter((i) => i.img).map(({ img, textNodes }) => {
    const row = [field(document, 'image', img)];
    if (textNodes && textNodes.length) row.push(field(document, 'text', textNodes));
    return row;
  });
  if (!rows.length) return null;
  return block(document, variant ? `logo-grid (${variant})` : 'logo-grid', rows);
}

/**
 * Section title: h2 with accent words (.is-fancy-serif) as <em>, <br>s as spaces. Unlike the
 * shared heading() helper, accents nested in other wrappers (<strong>OUR <span>…</span>) count.
 */
function titleOf(document, node) {
  if (!node || !text(node)) return null;
  const h = el(document, 'h2');
  const walk = (from) => from.childNodes.forEach((n) => {
    if (n.nodeType === 3) h.append(n.textContent.replace(/\s+/g, ' '));
    else if (n.nodeType !== 1) return;
    else if (n.tagName === 'BR') h.append(' ');
    else if (n.matches('.is-fancy-serif, em, i')) {
      if (text(n)) h.append(el(document, 'em', text(n)));
    } else walk(n);
  });
  walk(node);
  h.innerHTML = h.innerHTML.replace(/<\/em>(\s*)<em>/g, '$1').replace(/\s+/g, ' ').trim();
  return h;
}

// ---------------------------------------------------------------- logo walls

/**
 * Highlighted logos (industry / solution / partner pages): title + subtitle on the left, logo
 * grid (--logo-count columns, 4 or 5) on the right. Desktop-only logos are kept: the static
 * grid shows all of them.
 */
function highlightedLogos([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, element.querySelector('[class*="__title"]:not([class*="__title-wrap"])'));
  if (title) out.push(title);
  element.querySelectorAll('[class*="__subtitle"]').forEach((p) => {
    if (text(p)) out.push(el(document, 'p', text(p)));
  });
  const count = ((element.getAttribute('style') || '').match(/--logo-count:\s*(\d+)/) || [])[1];
  const items = uniqueImages(element, 'img').map((img) => ({ img: logo(document, img) }));
  const grid = logoGrid(document, count === '4' ? 'columns-4' : '', items);
  if (grid) out.push(grid);
  return out.length ? out : flatten(document, element);
}

/** Client panel (dark, marquee of white logos) → heading + static logo grid. */
function clientPanel([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="__title"]', 'h2, h3'));
  if (title) out.push(title);
  const items = uniqueImages(element, 'img').map((img) => ({ img: logo(document, img) }));
  const grid = logoGrid(document, '', items);
  if (grid) out.push(grid);
  return out.length ? out : flatten(document, element);
}

/** Awards panel (case pages, dark): award logo + number of awards (or award name) under it. */
function awardsPanel([element], ctx) {
  const { document } = ctx;
  const items = [...element.querySelectorAll('[class*="__item-wrapper"]')].map((item) => {
    const caption = text(item.querySelector('[class*="__heading"]'));
    return {
      // award logo file names are no useful alt text
      img: logo(document, item.querySelector('img'), false),
      textNodes: caption ? [el(document, 'p', caption)] : [],
    };
  });
  const grid = logoGrid(document, 'awards', items);
  return grid ? [grid] : flatten(document, element);
}

// ---------------------------------------------------------------- partner overview

/** Global partners: large cards (image, partner level shown on hover, linked name). */
function globalPartners([element], ctx) {
  const { document } = ctx;
  const items = [...element.querySelectorAll('[class*="__card-wrap"]')].map((card) => {
    const link = card.querySelector('a[href]');
    // first image = the card picture; the second (colour version) only shows on hover
    const img = image(document, card.querySelector('img'));
    const name = text(card.querySelector('[class*="__card-name"]'));
    const caption = text(card.querySelector('[class*="__image-caption"]'));
    if (img && !img.alt) img.alt = name;
    const textNodes = [];
    if (name) textNodes.push(link ? linkParagraph(document, link.getAttribute('href'), name) : el(document, 'p', name));
    if (caption) textNodes.push(el(document, 'p', caption));
    return { img, textNodes };
  });
  const grid = logoGrid(document, 'partners', items);
  return grid ? [grid] : flatten(document, element);
}

/** Partners grid: linked logo tiles (hover logo dropped); the link label is the logo alt. */
function partnersGrid([element], ctx) {
  const { document } = ctx;
  const items = [...element.querySelectorAll('a[class*="__card"]')].map((card) => {
    const img = logo(document, card.querySelector('img'));
    const href = card.getAttribute('href');
    const label = (img && img.alt) || text(card);
    return { img, textNodes: href && label ? [linkParagraph(document, href, label)] : [] };
  });
  const grid = logoGrid(document, 'tiles', items);
  return grid ? [grid] : flatten(document, element);
}

export const HANDLERS = {
  'highlighted-logos': { handler: highlightedLogos },
  // dark on the source (theme set in the component CSS, not as a theme class)
  'client-panel': { handler: clientPanel, style: 'dept-client-panel, dept-bg-richblack, dept-dark' },
  'awards-panel': { handler: awardsPanel, style: 'dept-awards-panel, dept-bg-richblack, dept-dark' },
  'global-partners': { handler: globalPartners },
  'partners-grid': { handler: partnersGrid },
};
