/* eslint-disable */
/* global WebImporter */

/**
 * dept.global component handlers for import-dept-site.js.
 * Each handler receives a top-level source component (child of <main>) — or a group of
 * consecutive components of the same kind — and returns the nodes of its section
 * (default content and/or block tables).
 * Components without a handler fall back to flatten() (plain default content).
 */
import heroVideoParser from '../hero-video.js';
import columnsFeatureParser from '../columns-feature.js';
import cardsSolutionsParser from '../cards-solutions.js';
import cardsCasestudyParser from '../cards-casestudy.js';
import cardsSolutionRowsParser from '../cards-solution-rows.js';
import carouselCultureParser from '../carousel-culture.js';
import cardsInsightsParser from '../cards-insights.js';
import { HANDLERS as DETAIL } from './handlers/detail.js';
import { HANDLERS as LOGOS } from './handlers/logos.js';
import { HANDLERS as LISTS } from './handlers/lists.js';
import { HANDLERS as CARDS } from './handlers/cards.js';
import { HANDLERS as INTROS } from './handlers/intros.js';
import { HANDLERS as MEDIA } from './handlers/media.js';
import { HANDLERS as ROUND2 } from './handlers/round2.js';
import {
  text, pick, el, image, backgroundImage, flatten, field, block, linkParagraph,
} from './utils.js';

/** Runs a classic (replace-in-DOM) parser on detached elements and returns the result nodes. */
function runParser(parser, elements, ctx) {
  const holder = ctx.document.createElement('div');
  elements.forEach((e) => holder.append(e));
  elements.forEach((e) => {
    if (e.parentNode) parser(e, ctx);
  });
  return [...holder.childNodes];
}

/**
 * New heading with the source text; accent words (.is-fancy-serif, em, i — also inside other
 * wrappers such as <strong>) become <em>, <br>s become spaces.
 */
function heading(document, source, tag) {
  const h = el(document, tag);
  const walk = (from) => from.childNodes.forEach((n) => {
    if (n.nodeType === 3) h.append(n.textContent.replace(/\s+/g, ' '));
    else if (n.nodeType !== 1 || n.matches('svg, button, script, style')) return;
    else if (n.tagName === 'BR') h.append(' ');
    else if (n.matches('.is-fancy-serif, em, i')) {
      if (text(n)) h.append(el(document, 'em', text(n)));
    } else walk(n);
  });
  walk(source);
  h.innerHTML = h.innerHTML.replace(/<\/em>(\s*)<em>/g, '$1').replace(/\s+/g, ' ').trim();
  return h;
}

/** Section title + CTA of listing components, then the cards block. */
function titleAndCta(ctx, element, titleSel, ctaSel) {
  const out = [];
  const title = pick(element, titleSel);
  if (title && text(title)) out.push(heading(ctx.document, title, 'h2'));
  const cta = pick(element, ctaSel);
  if (cta && cta.href && text(cta)) out.push(linkParagraph(ctx.document, cta.href, text(cta)));
  return out;
}

// ---------------------------------------------------------------- homepage components

function scrollyVideoIntro(elements, ctx) {
  return runParser(heroVideoParser, elements, ctx);
}

const TWO_COLUMN_VARIANTS = ['left-aligned-asset', 'right-aligned-asset', 'fifty-fifty-asset'];
const variantOf = (node) => (node.getAttribute && node.getAttribute('data-variant')) || '';

function assetsAndCopy(elements, ctx) {
  const variant = variantOf(elements[0]);
  if (!variant || TWO_COLUMN_VARIANTS.includes(variant)) return runParser(columnsFeatureParser, elements, ctx);
  // copy-only / full-width / centred / mobile / three-up: media (video embeds) + default content
  return elements.flatMap((e) => mediaAndContent(e, ctx));
}

function talkingPoints(elements, ctx) {
  return runParser(cardsSolutionsParser, elements, ctx);
}

function workListing([element], ctx) {
  const out = titleAndCta(ctx, element, '.block-work-listing__title', '.block-work-listing > a.button-v2, a.button-v2');
  // partner / service pages: subtitle under the title (before the CTA)
  const subtitle = text(element.querySelector('.block-work-listing__subtitle'));
  if (subtitle) out.splice(out.length && out[0].tagName === 'H2' ? 1 : 0, 0, el(ctx.document, 'p', subtitle));
  const items = element.querySelector('.block-work-listing__items');
  if (items) out.push(...runParser(cardsCasestudyParser, [items], ctx));
  return out;
}

function imageAndFact(elements, ctx) {
  return runParser(cardsSolutionRowsParser, elements, ctx);
}

function featureTurntable(elements, ctx) {
  return runParser(carouselCultureParser, elements, ctx);
}

function customListing([element], ctx) {
  const out = titleAndCta(ctx, element, '.block-custom-listing__title', '.block-custom-listing > a.button-v2, a.button-v2');
  const items = element.querySelector('.block-custom-listing__items');
  if (items) out.push(...runParser(cardsInsightsParser, [items], ctx));
  return out;
}

function titleWithCta([element], ctx) {
  // "How we invent growth": a big display paragraph (kept as <p>, styled by the section)
  return flatten(ctx.document, element);
}

// ---------------------------------------------------------------- insight / article components

/** Article header → block "article-header": image | text (back link, h1) | portrait | details */
function articlePostHeader([element], ctx) {
  const { document } = ctx;
  const img = image(document, pick(element, '.block-article-post-header__image', '.image-wrap img'));
  const textNodes = [];
  const back = pick(element, '.block-article-post-header__back-button');
  if (back && back.href) textNodes.push(linkParagraph(document, back.href, text(back) || 'Back'));
  const title = pick(element, 'h1');
  if (title) textNodes.push(el(document, 'h1', text(title)));
  if (img && !img.alt && title) img.alt = text(title);

  const portrait = image(document, pick(element, '.author__portrait'));
  const details = [];
  const author = pick(element, '.author__text');
  if (author) {
    const parts = author.innerHTML.split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (parts[0]) {
      const p = el(document, 'p');
      const strong = el(document, 'strong', parts[0]);
      p.append(strong);
      details.push(p);
    }
    if (parts[1]) details.push(el(document, 'p', parts.slice(1).join(' ')));
  }
  element.querySelectorAll('.block-article-post-header__meta > div').forEach((meta) => {
    const label = text(meta.querySelector('[class*="description"]'));
    const value = text(meta.querySelector('[class*="time"], [class*="date"]:not([class*="description"])'));
    if (value) details.push(el(document, 'p', label ? `${label}: ${value}` : value));
  });

  const cells = [
    [field(document, 'image', img)],
    [field(document, 'text', textNodes)],
  ];
  if (portrait || details.length) {
    cells.push([field(document, 'portrait', portrait)]);
    cells.push([field(document, 'details', details)]);
  }
  return [block(document, 'article-header', cells)];
}

/** Title-and-content (article body, rich text) → default content; share links dropped. */
function titleAndContent([element], ctx) {
  const clone = element.cloneNode(true);
  clone.querySelectorAll('[class*="__social-links"]').forEach((n) => n.remove());
  const nodes = flatten(ctx.document, clone);
  // source titles are h2 inside the layout; keep them
  return nodes;
}

/** Highlighted item listing ("More insights?") → title + CTA + block "cards-related". */
function highlightedItemListing([element], ctx, titleSel = '.block-highlighted-item-listing__title') {
  const { document } = ctx;
  const out = titleAndCta(ctx, element, titleSel, '.block-highlighted-item-listing__cta-button');
  const cards = [...element.querySelectorAll('.universal-item-card, .block-highlighted-item-listing__cards > a, .block-highlighted-cases__projects > a')];
  if (cards.length) {
    const rows = cards.map((card) => {
      const img = image(document, card.querySelector('img'));
      const body = [];
      const meta = text(card.querySelector('[class*="__meta"], [class*="__eyebrow"]'));
      if (meta) body.push(el(document, 'p', meta));
      const titleText = text(card.querySelector('h3, h4, [class*="__title"]'));
      if (titleText) {
        const h3 = el(document, 'h3');
        if (card.href) {
          const a = el(document, 'a', titleText);
          a.href = card.href;
          h3.append(a);
        } else {
          h3.textContent = titleText;
        }
        body.push(h3);
      }
      const desc = text(card.querySelector('[class*="__description"], [class*="__text"]'));
      if (desc) body.push(el(document, 'p', desc));
      // card CTA ("Read Article", localized on the source)
      const ctaLabel = text(card.querySelector('[class*="__btn"], .cta-button'));
      if (ctaLabel && card.href) body.push(linkParagraph(document, card.href, ctaLabel));
      return [field(document, 'image', img), field(document, 'text', body)];
    });
    out.push(block(document, 'cards-related', rows));
  }
  return out;
}

/** Get in touch ("Questions?" + specialist) → block "contact-specialist": image | text */
function getInTouch([element], ctx) {
  const { document } = ctx;
  const img = image(document, element.querySelector('img'))
    || backgroundImage(document, element.querySelector('.block-get-in-touch__image, .image--bg'));
  const body = [];
  const heading = pick(element, '.block-get-in-touch__heading', 'h2');
  if (heading) body.push(el(document, 'h2', text(heading)));
  const role = text(pick(element, '.block-get-in-touch__subtitle'));
  if (role) body.push(el(document, 'p', role));
  const name = text(pick(element, '.block-get-in-touch__person-title', 'h3'));
  if (name) body.push(el(document, 'h3', name));
  const label = text(pick(element, '.cta-bar__label')) || 'Get in touch';
  body.push(linkParagraph(document, `https://www.dept.global/${ctx.locale ? `${ctx.locale}/` : ''}contact/`, label, true));
  return [block(document, 'contact-specialist', [
    [field(document, 'image', img)],
    [field(document, 'text', body)],
  ])];
}

/** cta-text: large statement with a link → default content (styled by the section). */
function ctaText([element], ctx) {
  const heading = element.querySelector('h1, h2, h3, h4, h5, h6, p');
  if (!heading) return flatten(ctx.document, element);
  // the source puts text and link in one heading separated by <br>s: split into p + link p
  const out = [];
  const parts = heading.innerHTML.split(/(?:<br\s*\/?>\s*){1,}/i);
  parts.forEach((part) => {
    const holder = ctx.document.createElement('div');
    holder.innerHTML = part;
    const only = holder.children.length === 1 && holder.firstElementChild.tagName === 'A' && text(holder) === text(holder.firstElementChild);
    if (!text(holder)) return;
    if (only) {
      const a = holder.firstElementChild;
      out.push(linkParagraph(ctx.document, a.href, text(a)));
    } else {
      const p = ctx.document.createElement('p');
      p.innerHTML = holder.innerHTML;
      out.push(...flatten(ctx.document, p));
    }
  });
  return out;
}

// ---------------------------------------------------------------- media, case and landing components

/** Video URL + poster of a source player (YouTube / Vimeo iframe, local <video>). */
function videoSource(document, node) {
  const iframe = node.querySelector('iframe[src], iframe[data-src]');
  let url = '';
  if (iframe) {
    const src = iframe.getAttribute('src') || iframe.getAttribute('data-src') || '';
    const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/]+)/);
    const vimeo = src.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (yt) url = `https://www.youtube.com/watch?v=${yt[1]}`;
    else if (vimeo) url = `https://vimeo.com/${vimeo[1]}`;
    else url = src;
  }
  const videoEl = node.matches('video') ? node : node.querySelector('video');
  if (!url && videoEl) {
    const source = videoEl.querySelector('source[src]');
    url = videoEl.getAttribute('src') || (source && source.getAttribute('src')) || '';
  }
  if (url && url.startsWith('/')) url = `https://www.dept.global${url}`;
  const posterEl = node.querySelector('.plyr__poster');
  let poster = posterEl ? backgroundImage(document, posterEl) : null;
  if (!poster && videoEl && videoEl.getAttribute('poster')) {
    poster = document.createElement('img');
    poster.src = videoEl.getAttribute('poster');
    poster.alt = '';
  }
  return { url, poster };
}

/** block "video-embed": uri | poster | optional text */
function videoBlock(document, node, textNodes = []) {
  const { url, poster } = videoSource(document, node);
  if (!url) return null;
  const cells = [
    [field(document, 'uri', linkParagraph(document, url, url))],
  ];
  if (poster || textNodes.length) cells.push([field(document, 'poster', poster)]);
  if (textNodes.length) cells.push([field(document, 'text', textNodes)]);
  return block(document, 'video-embed', cells);
}

const PLAYER = '.plyr, .video, video, iframe[src*="youtube"], iframe[src*="vimeo"]';

/** Default content of a component, with its video players as video-embed blocks (in source order). */
function mediaAndContent(element, ctx) {
  const { document } = ctx;
  const clone = element.cloneNode(true);
  const players = [...clone.querySelectorAll(PLAYER)].filter((p) => !p.parentElement || !p.parentElement.closest(PLAYER));
  if (!players.length) return flatten(document, clone);
  const blocks = players.map((p) => videoBlock(document, p));
  players.forEach((p, i) => {
    const marker = document.createElement('p');
    marker.textContent = `@@video-${i}@@`;
    p.replaceWith(marker);
  });
  const out = [];
  flatten(document, clone).forEach((n) => {
    const m = n.textContent.trim().match(/^@@video-(\d+)@@$/);
    if (m) {
      if (blocks[Number(m[1])]) out.push(blocks[Number(m[1])]);
    } else {
      out.push(n);
    }
  });
  return out;
}

function video([element], ctx) {
  const vb = videoBlock(ctx.document, element);
  return vb ? [vb] : flatten(ctx.document, element);
}

/** Jumbotron: background video (+ optional heading) → video-embed block */
function jumbotron([element], ctx) {
  const { document } = ctx;
  const title = text(element.querySelector('.jumbotron__title, h1, h2'));
  const heading = title ? [el(document, 'h2', title)] : [];
  const vb = videoBlock(document, element, heading);
  if (vb) return [vb];
  return flatten(document, element);
}

/** Author name/role lines of an .author__text element */
function authorLines(document, author) {
  if (!author) return [];
  const parts = author.innerHTML.split(/<br\s*\/?>/i)
    .map((x) => x.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const out = [];
  if (parts[0]) {
    const p = el(document, 'p');
    p.append(el(document, 'strong', parts[0]));
    out.push(p);
  }
  if (parts[1]) out.push(el(document, 'p', parts.slice(1).join(' ')));
  return out;
}

/** Insight intro (newer article header) → block "article-header" */
function insightIntro([element], ctx) {
  const { document } = ctx;
  const img = image(document, pick(element, '[class*="__featured"]', 'img:not(.author__portrait)'));
  const title = pick(element, 'h1');
  const textNodes = [];
  const badge = text(pick(element, '[class*="__badge"]'));
  if (badge) textNodes.push(el(document, 'p', badge));
  if (title) textNodes.push(el(document, 'h1', text(title)));
  if (img && !img.alt && title) img.alt = text(title);
  const portrait = image(document, pick(element, '.author__portrait'));
  const details = authorLines(document, pick(element, '.author__text'));
  element.querySelectorAll('[class*="__insight-meta-item"]').forEach((item) => {
    const label = text(item.querySelector('[class*="meta-label"]'));
    const value = [...item.querySelectorAll('span')]
      .filter((sp) => !sp.matches('[class*="meta-label"]')).map(text).join(' ').trim();
    if (value) details.push(el(document, 'p', label ? `${label}: ${value}` : value));
  });
  const cells = [[field(document, 'image', img)], [field(document, 'text', textNodes)]];
  if (portrait || details.length) {
    cells.push([field(document, 'portrait', portrait)]);
    cells.push([field(document, 'details', details)]);
  }
  return [block(document, 'article-header (intro)', cells)];
}

/** Insight CTA (image + title + text + button) → block "cta-banner": image | text */
function insightCta([element], ctx) {
  const { document } = ctx;
  const img = image(document, element.querySelector('img'));
  const body = [];
  const title = text(pick(element, '[class*="__title"]'));
  if (title) body.push(el(document, 'h2', title));
  const desc = text(pick(element, 'p[class*="__text"]'));
  if (desc) body.push(el(document, 'p', desc));
  const cta = pick(element, 'a[class*="__cta"]', 'a.button-v2', 'a[href]');
  if (cta && cta.href) body.push(linkParagraph(document, cta.href, text(cta), true));
  return [block(document, 'cta-banner', [[field(document, 'image', img)], [field(document, 'text', body)]])];
}

/** Stats panel / stats and copy → [title] + block "stats-grid" (one row per stat: value + label) */
function stats([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = text(pick(element, '[class*="stats-and-copy__title"]', '[class*="stats-panel__title"]'));
  if (title) out.push(el(document, 'h2', title));
  let items = [...element.querySelectorAll('.stats-item')];
  if (!items.length) items = [...element.querySelectorAll('li[class*="__card"]')];
  const rows = items.map((item) => {
    const value = text(item.querySelector('.block-stats-item__stat, .stats-item__stat, [class*="card-title"]'));
    const label = text(item.querySelector('.stats-item__heading, [class*="card-subtitle"]'));
    if (!value && !label) return null;
    const nodes = [];
    if (value) nodes.push(el(document, 'p', value));
    if (label) nodes.push(el(document, 'p', label));
    return [field(document, 'text', nodes)];
  }).filter(Boolean);
  if (rows.length) out.push(block(document, 'stats-grid', rows));
  else out.push(...flatten(document, element));
  return out;
}

/** "Next project" teaser → block "next-case": image | text (label, client, title, tags, link) */
function nextCase([element], ctx) {
  const { document } = ctx;
  const img = image(document, element.querySelector('img'));
  const body = [];
  const label = text(element.querySelector('.next-case__label'));
  if (label) body.push(el(document, 'p', label));
  const client = text(element.querySelector('.next-case__client'));
  if (client) body.push(el(document, 'h2', client));
  const title = text(element.querySelector('.next-case__title'));
  if (title) body.push(el(document, 'p', title));
  const tags = [...element.querySelectorAll('.next-case__tags li')]
    .map((li) => text(li).replace(/[()]/g, '').trim()).filter(Boolean);
  if (tags.length) body.push(el(document, 'p', tags.join(', ')));
  const cta = element.querySelector('a[href]');
  if (cta) body.push(linkParagraph(document, cta.href, text(cta) || 'View Work'));
  return [block(document, 'next-case', [[field(document, 'image', img)], [field(document, 'text', body)]])];
}

/** Two-column panels (image or heading | rich text) → block "panel-split": left | right */
function panelSplit([element], ctx) {
  const { document } = ctx;
  const left = element.querySelector('[class*="__left"]');
  const right = element.querySelector('[class*="__right"]');
  if (!left || !right) return flatten(document, element);
  return [block(document, 'panel-split', [
    [field(document, 'left', flatten(document, left))],
    [field(document, 'right', flatten(document, right))],
  ])];
}

/** Case intro: services label + list | statement + text → block "panel-split (intro)" */
function caseIntro([element], ctx) {
  const { document } = ctx;
  const categories = element.querySelector('[class*="__category-container"]');
  const left = categories ? flatten(document, categories) : [];
  const clone = element.cloneNode(true);
  const cat = clone.querySelector('[class*="__category-container"]');
  if (cat) cat.remove();
  const right = flatten(document, clone);
  if (!left.length) return right;
  return [block(document, 'panel-split (intro)', [
    [field(document, 'left', left)],
    [field(document, 'right', right)],
  ])];
}

/** Highlighted cases ("Discover more") → heading + block "cards-related" */
function highlightedCases([element], ctx) {
  return highlightedItemListing([element], ctx, '.block-highlighted-cases__heading');
}

/** Case post header (back link + h1) → default content */
function casePostHeader([element], ctx) {
  const { document } = ctx;
  const out = [];
  const back = element.querySelector('a[class*="back"]');
  if (back && back.href) out.push(linkParagraph(document, back.href, text(back) || 'Back'));
  const h1 = element.querySelector('h1');
  if (h1) out.push(el(document, 'h1', text(h1)));
  return out.length ? out : flatten(document, element);
}

/** Quotes: quote text + attribution → heading + paragraph (styled by the section) */
function quote([element], ctx) {
  const { document } = ctx;
  const q = text(element.querySelector('.quote__heading, blockquote, [class*="__quote-text"], h2, h3'));
  const by = text(element.querySelector('.quote__paragraph, [class*="__author"], cite'));
  if (!q) return flatten(document, element);
  const out = [el(document, 'h2', q)];
  if (by && by !== q) out.push(el(document, 'p', by));
  return out;
}

/**
 * Handlers keyed by source component name ("block-" prefix and "__…" suffix removed).
 * style: section style; group: consecutive components of this kind form one section.
 */
export {
  heading, titleAndCta, runParser, highlightedItemListing, insightIntro, mediaAndContent, panelSplit, ctaText, videoBlock,
};

export const HANDLERS = {
  'scrolly-video-intro': { handler: scrollyVideoIntro, style: 'dept-hero' },
  'statement-v2': { style: 'dept-statement' },
  'assets-and-copy': {
    handler: assetsAndCopy,
    style: (node) => {
      if (!variantOf(node) || TWO_COLUMN_VARIANTS.includes(variantOf(node))) return 'dept-features';
      // rows that open with text get the large top space of the source, media rows a small one
      const first = node.querySelector('h1, h2, h3, h4, p, img, picture, video, iframe, .plyr');
      const textFirst = first && /^(H\d|P)$/.test(first.tagName) && text(first);
      return `dept-assets-and-copy, dept-variant-${variantOf(node)}${textFirst ? ', dept-text-first' : ''}`;
    },
    // only the two-column rows (homepage feature rows) form one block; every other variant
    // stays its own section, like on the source
    group: true,
    groupKey: (node) => (!variantOf(node) || TWO_COLUMN_VARIANTS.includes(variantOf(node))
      ? `two-column:${variantOf(node)}` : null),
  },
  'talking-points': { handler: talkingPoints, style: 'dept-services' },
  'work-listing': { handler: workListing, style: 'dept-work' },
  'title-with-cta': { handler: titleWithCta, style: 'dept-solutions', joinNext: ['image-and-fact'] },
  'image-and-fact': { handler: imageAndFact, style: 'dept-solutions', group: true },
  'feature-turntable': { handler: featureTurntable, style: 'dept-culture' },
  'custom-listing': { handler: customListing, style: 'dept-insights' },
  'text-divider': { prefixNext: true },
  'article-post-header': { handler: articlePostHeader },
  'title-and-content': { handler: titleAndContent },
  'highlighted-item-listing': { handler: highlightedItemListing },
  'get-in-touch': { handler: getInTouch },
  'cta-text': { handler: ctaText },
  video: { handler: video },
  jumbotron: { handler: jumbotron },
  'insight-intro': { handler: insightIntro, style: 'dept-article-post-header' },
  'insight-cta': { handler: insightCta },
  'stats-panel': { handler: stats },
  'stats-and-copy': { handler: stats },
  'next-case': { handler: nextCase },
  'panel-with-rich-text': { handler: panelSplit },
  'panel-with-image-and-rich-text': { handler: panelSplit },
  'highlighted-cases': { handler: highlightedCases, style: 'dept-highlighted-item-listing' },
  'case-post-header': { handler: casePostHeader },
  'case-intro': { handler: caseIntro },
  quote: { handler: quote },
  'case-quote': { handler: quote, style: 'dept-quote' },
  // page-type components, one file per group (handlers/*.js)
  ...DETAIL,
  ...LOGOS,
  ...LISTS,
  ...CARDS,
  ...INTROS,
  ...MEDIA,
  ...ROUND2,
};
