/* eslint-disable */
/* global WebImporter */

/**
 * dept.global component handlers (round2 group: components found during the full-site import),
 * merged into HANDLERS in ../components.js.
 * Reuses the DEPT blocks of the earlier groups: page headers → "panel-split" / "Detail Panel",
 * card rows and listings → "cards-related", point rows → "points-list", people → "people-cards".
 * Everything else is default content styled by its section (styles/dept-pages-parts/round2.css).
 */
import { HANDLERS as ALL } from '../components.js';
import {
  text, pick, el, image, backgroundImage, flatten, field, block, linkParagraph,
} from '../utils.js';

const ACCENT = '.is-fancy-serif, em, i';
const BR_RUN = /(?:\s|&nbsp;)*(?:<br\s*\/?>(?:\s|&nbsp;)*){2,}/i;

/** Removes leading / trailing <br>s and whitespace of an element. */
function trimBreaks(node) {
  const edge = (first) => {
    let n = first ? node.firstChild : node.lastChild;
    while (n && ((n.nodeType === 3 && !n.textContent.trim()) || (n.nodeType === 1 && n.tagName === 'BR'))) {
      const next = first ? n.nextSibling : n.previousSibling;
      n.remove();
      n = next;
    }
  };
  edge(true);
  edge(false);
  if (node.firstChild && node.firstChild.nodeType === 3) node.firstChild.textContent = node.firstChild.textContent.replace(/^\s+/, '');
  if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.textContent = node.lastChild.textContent.replace(/\s+$/, '');
  return node;
}

/**
 * Copy of the inline content of source into a new <tag>: accent words → <em>, bold → <strong>
 * (not in headings), links and line breaks kept, decorations (aria-hidden) dropped, every other
 * wrapper unwrapped. In headings <br>s become spaces.
 */
function inline(document, source, tag = 'p') {
  const out = el(document, tag);
  if (!source) return out;
  const isHeading = /^H\d$/i.test(tag);
  const walk = (from, to) => {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(n.textContent.replace(/\s+/g, ' '));
        return;
      }
      if (n.nodeType !== 1 || n.matches('svg, button, script, style, i.icon, [aria-hidden="true"], .is-mobile')) return;
      if (n.tagName === 'BR') {
        to.append(isHeading ? ' ' : el(document, 'br'));
        return;
      }
      if (n.matches(ACCENT)) {
        if (text(n)) to.append(el(document, 'em', text(n)));
        return;
      }
      if (n.matches('strong, b') && !isHeading) {
        const s = el(document, 'strong');
        walk(n, s);
        if (text(s)) to.append(s);
        return;
      }
      if (n.tagName === 'A' && n.getAttribute('href') && !isHeading) {
        const a = el(document, 'a');
        a.href = n.getAttribute('href');
        walk(n, a);
        if (text(a)) to.append(a);
        return;
      }
      walk(n, to);
    });
  };
  walk(source, out);
  out.innerHTML = out.innerHTML.replace(/<\/em>(\s*)<em>/g, '$1').replace(/\s*<br>\s*/g, '<br>');
  if (isHeading) out.innerHTML = out.innerHTML.replace(/\s+/g, ' ');
  return trimBreaks(out);
}

/** Inline copies as an array (empty when the source has no text), split at <br><br> runs. */
function lines(document, source, tag = 'p') {
  if (!source || !text(source)) return [];
  const copy = inline(document, source, tag);
  if (!BR_RUN.test(copy.innerHTML)) return text(copy) ? [copy] : [];
  return copy.innerHTML.split(BR_RUN).map((part) => {
    const p = el(document, tag);
    p.innerHTML = part;
    return trimBreaks(p);
  }).filter((p) => text(p));
}

/** Rich text (flattened), paragraphs split at <br><br> runs. */
function richText(document, source) {
  if (!source) return [];
  return flatten(document, source).flatMap((n) => {
    if (n.tagName !== 'P' || n.querySelector('img')) return [n];
    return lines(document, n);
  });
}

/** Heading with the source text (accents → em, <br>s → spaces). */
function titleOf(document, node, tag = 'h2') {
  if (!node || !text(node)) return null;
  return inline(document, node, tag);
}

/** h1 unless the page already has one (outside the element). */
function pageTitleTag(document, element) {
  const main = document.querySelector('main') || document.body;
  return [...main.querySelectorAll('h1')].some((h) => !element.contains(h)) ? 'h2' : 'h1';
}

/** Image paragraph. */
function imageParagraph(document, img) {
  if (!img) return null;
  const p = el(document, 'p');
  p.append(img);
  return p;
}

/** Image of a wrapper: <img> or a background-image div. */
function imageOf(document, node) {
  if (!node) return null;
  return image(document, node.querySelector('img'))
    || backgroundImage(document, node.matches('[style*="background-image"]') ? node : node.querySelector('[style*="background-image"]'));
}

/** Pardot form URL of a form wrapper (iframe src, lazy data-src / data-initial-src). */
function formUrl(node) {
  const iframe = node && node.querySelector('iframe');
  if (!iframe) return '';
  return (iframe.getAttribute('src') || iframe.getAttribute('data-src') || iframe.getAttribute('data-initial-src') || '').trim();
}

/** Form URL of the flyout drawer a trigger (cta bar / hidden button) opens. */
function drawerForm(document, trigger) {
  const id = trigger && trigger.id;
  if (!id) return '';
  const drawer = [...document.querySelectorAll('.flyout-drawer[data-trigger]')]
    .find((d) => d.getAttribute('data-trigger') === `#${id}`);
  // drawers with a form picker ("Just say hi" / "New business" …) load the first form by default
  const pick = drawer && drawer.querySelector('input[value^="http"]');
  return formUrl(drawer) || (pick ? pick.value : '');
}

/** CTA link paragraph of a source link (no paragraph for buttons and empty links). */
function cta(document, link, label = '', strong = false) {
  const href = link && link.getAttribute('href');
  const name = label || text(link);
  if (!href || href.startsWith('#') || !name) return null;
  return linkParagraph(document, href, name, strong);
}

/**
 * Listing page per locale behind the link-less "All …" buttons of the panels (default slug,
 * locale overrides; from the sitemap).
 */
const LISTINGS = {
  whitepapers: ['all-whitepapers', { 'de-dach': 'alle-whitepaper' }],
  partners: ['partners', { 'de-dach': 'partner' }],
  industries: ['industries', { 'de-dach': 'branchen' }],
  insights: ['all-insights', { 'de-dach': 'alle-insights' }],
};

/** "All …" button of a panel: its link, or (button without link) the locale's listing page. */
function listingButton(document, element, selector, ctx, kind) {
  const button = element.querySelector(selector);
  if (!button) return null;
  const label = text(button.querySelector('.btn__label')) || text(button);
  if (button.tagName === 'A') return cta(document, button, label);
  if (!label || !LISTINGS[kind]) return null;
  const [slug, overrides] = LISTINGS[kind];
  const path = [ctx.locale, overrides[ctx.locale] || slug].filter(Boolean).join('/');
  return linkParagraph(document, `https://www.dept.global/${path}/`, label);
}

/** h3 with the card title, linked to the card URL when there is one. */
function cardTitle(document, title, href) {
  if (!title) return null;
  const h3 = el(document, 'h3');
  if (href) {
    const a = el(document, 'a', title);
    a.href = href;
    h3.append(a);
  } else {
    h3.textContent = title;
  }
  return h3;
}

/** Block "cards-related (<variant>)": one row per card, image | text. */
function cardsRelated(document, variant, cards) {
  const rows = cards.filter((c) => c && (c.img || (c.nodes && c.nodes.filter(Boolean).length)))
    .map(({ img, nodes }) => [field(document, 'image', img), field(document, 'text', (nodes || []).filter(Boolean))]);
  if (!rows.length) return null;
  return block(document, variant ? `cards-related (${variant})` : 'cards-related', rows);
}

/** Block "points-list (<variant>)": one row per point (one rich text cell). */
function pointsList(document, variant, points) {
  const rows = points.map((nodes) => nodes.filter(Boolean)).filter((nodes) => nodes.length)
    .map((nodes) => [field(document, 'text', nodes)]);
  if (!rows.length) return null;
  return block(document, variant ? `points-list (${variant})` : 'points-list', rows);
}

/** Cards of the same link only once (sliders and listings repeat them). */
function unique(cards) {
  const seen = new Set();
  return cards.filter((c) => {
    const key = c.getAttribute('href') || text(c);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Default content of a nested source component, run through its own handler. */
function nested(node, ctx) {
  const classes = [...node.classList];
  const blockClass = classes.find((c) => c.startsWith('block-'));
  const name = (blockClass ? blockClass.replace(/^block-/, '') : (classes[0] || '')).replace(/__.*$/, '');
  const def = ALL[name];
  if (def && def.handler) return def.handler([node], ctx);
  return richText(ctx.document, node);
}

const out = (nodes, document, element) => {
  const list = nodes.filter(Boolean);
  return list.length ? list : flatten(document, element);
};

// ---------------------------------------------------------------- quotes, captions, CTAs

/** Two quotes side by side: per quote the quote text and the attribution (paragraphs). */
function twoQuotes([element], ctx) {
  const { document } = ctx;
  const nodes = [...element.querySelectorAll('[class*="__quote"]:not([class*="__quote-"])')].flatMap((q) => [
    ...lines(document, q.querySelector('[class*="__title"]')),
    ...lines(document, q.querySelector('[class*="__text"]')),
  ]);
  return out(nodes, document, element);
}

/** Loose paragraph (image captions of case pages). */
function paragraph([element], ctx) {
  return out(lines(ctx.document, element), ctx.document, element);
}

/** CTA banner: statement heading + button. */
function ctaBanner([element], ctx) {
  const { document } = ctx;
  return out([
    titleOf(document, pick(element, '[class*="cta-text__content"]', 'h2, h3')),
    cta(document, pick(element, 'a[class*="__cta-button"]', 'a.cta-button')),
  ], document, element);
}

/** TikTok embed → link paragraph to the video (EDS has no TikTok player). */
function tiktokVideo([element], ctx) {
  const { document } = ctx;
  const id = element.getAttribute('data-video-id') || ((element.getAttribute('cite') || '').match(/video\/(\d+)/) || [])[1];
  const url = element.getAttribute('cite') || (id ? `https://www.tiktok.com/embed/v2/${id}` : '');
  return url ? [linkParagraph(document, url, 'Watch on TikTok')] : [];
}

/** Hidden trigger of a flyout form (opened by "Contact us" buttons) → link paragraph to the form. */
function externallyTriggeredForm([element], ctx) {
  const { document } = ctx;
  const form = drawerForm(document, element);
  if (!form) return [];
  const trigger = (element.getAttribute('data-triggers') || '').trim();
  const opener = trigger && [...document.querySelectorAll('main a[href]')].find((a) => a.getAttribute('href') === trigger);
  return [linkParagraph(document, form, text(opener) || 'Contact us')];
}

/** Floating "Download the report" button → link paragraph to the download form of the page. */
function trendsFloatingDownload([element], ctx) {
  const { document } = ctx;
  const link = element.querySelector('a[href]');
  const form = formUrl(document.querySelector('main [class*="__form"]'));
  const href = form || (link && link.getAttribute('href')) || '';
  if (!href || href.startsWith('#') || !text(link)) return [];
  return [linkParagraph(document, href, text(link))];
}

// ---------------------------------------------------------------- page headers

/**
 * Service / industry / partner post header → block "panel-split":
 * left = h1 | right = image, intro, "Get in touch" bar (bold link to the flyout form).
 * The anchor links and the history-back button of the source are dropped.
 */
function postHeader([element], ctx) {
  const { document } = ctx;
  const h1 = pick(element, 'h1', '[class*="__heading"]');
  const left = [titleOf(document, h1, 'h1')];
  const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
  if (img && !img.alt && h1) img.alt = text(h1);
  const right = [imageParagraph(document, img), ...lines(document, element.querySelector('[class*="__intro"]'))];
  const bar = element.querySelector('[class*="__cta-bar"]');
  const form = drawerForm(document, bar);
  const label = text(bar && bar.querySelector('.cta-bar__label'));
  if (form && label) right.push(linkParagraph(document, form, label, true));
  return [block(document, 'panel-split', [
    [field(document, 'left', left.filter(Boolean))],
    [field(document, 'right', right.filter(Boolean))],
  ])];
}

/** Main page header (services overview): h1 + intro line; in-page anchor buttons dropped. */
function mainPageHeader([element], ctx) {
  const { document } = ctx;
  return out([
    titleOf(document, pick(element, '[class*="__heading"]', 'h1'), 'h1'),
    ...lines(document, element.querySelector('[class*="__intro"]')),
  ], document, element);
}

/** Insights header (old insight pages): h1, then the article components nested in the right column. */
function insightsHeader([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, pick(element, '[class*="__heading"]', 'h1'), 'h1')];
  const column = element.querySelector('[class*="__column--right"]');
  if (column) [...column.children].forEach((child) => nodes.push(...nested(child, ctx)));
  return out(nodes, document, element);
}

/**
 * Event header (image, title, location / date) and its intro line (separate child of <main>)
 * → block "Detail Panel (overlay)": image | h1 + meta lines; the intro stays default content.
 */
function eventHeader(elements, ctx) {
  const { document } = ctx;
  const nodes = [];
  elements.forEach((element) => {
    if (element.tagName === 'P') {
      nodes.push(...lines(document, element));
      return;
    }
    const h1 = pick(element, 'h1', '[class*="__title"]');
    const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
    if (img && !img.alt && h1) img.alt = text(h1);
    const textNodes = [titleOf(document, h1, 'h1')];
    element.querySelectorAll('[class*="__meta"] > *').forEach((m) => textNodes.push(...lines(document, m)));
    nodes.push(block(document, 'Detail Panel (overlay)', [
      [img ? field(document, 'image', img) : ''],
      [field(document, 'text', textNodes.filter(Boolean))],
    ]));
  });
  return nodes;
}

/** Image with a large overlay text (team / landing pages) → "Detail Panel (overlay)". */
function imageWithTextAndOverlay([element], ctx) {
  const { document } = ctx;
  const t = element.querySelector('[class*="__text"]');
  const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
  if (img && !img.alt && t) img.alt = text(t);
  return [block(document, 'Detail Panel (overlay)', [
    [img ? field(document, 'image', img) : ''],
    [field(document, 'text', [titleOf(document, t, pageTitleTag(document, element))].filter(Boolean))],
  ])];
}

/** Landing page title (Good Company): image | eyebrow + title → "Detail Panel (overlay)". */
function landingPageTitle([element], ctx) {
  const { document } = ctx;
  const t = element.querySelector('[class*="__title"]');
  const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
  if (img && !img.alt && t) img.alt = text(t);
  return [block(document, 'Detail Panel (overlay)', [
    [img ? field(document, 'image', img) : ''],
    [field(document, 'text', [
      ...lines(document, element.querySelector('[class*="__intro"]')),
      titleOf(document, t, pageTitleTag(document, element)),
    ].filter(Boolean))],
  ])];
}

/** Trends / impact report header: background image | title, subtitle, CTA (decorative images dropped). */
function trendsHeader([element], ctx) {
  const { document } = ctx;
  const t = element.querySelector('[class*="__title"]');
  const img = imageOf(document, element.querySelector('[class*="__background-image-wrap"]'))
    || imageOf(document, element.querySelector('[class*="__image-wrap"]'));
  if (img && !img.alt && t) img.alt = text(t);
  return [block(document, 'Detail Panel (overlay)', [
    [img ? field(document, 'image', img) : ''],
    [field(document, 'text', [
      titleOf(document, t, pageTitleTag(document, element)),
      ...lines(document, element.querySelector('[class*="__subtitle"]')),
      cta(document, element.querySelector('a[class*="__cta"]')),
    ].filter(Boolean))],
  ])];
}

/** Form with header: image | title ("Detail Panel (overlay)"), then intro, text and the form link. */
function formWithHeader([element], ctx) {
  const { document, type } = ctx;
  const t = element.querySelector('[class*="__title"]');
  const img = imageOf(document, element.querySelector('[class*="__image-wrap"]'));
  if (img && !img.alt && t) img.alt = text(t);
  const nodes = [block(document, 'Detail Panel (overlay)', [
    [img ? field(document, 'image', img) : ''],
    [field(document, 'text', [titleOf(document, t, 'h2')].filter(Boolean))],
  ])];
  nodes.push(...lines(document, element.querySelector('[class*="__intro"]')));
  nodes.push(...lines(document, element.querySelector('[class*="__body"]')));
  const form = formUrl(element.querySelector('[class*="__form-container"]') || element);
  if (form) nodes.push(linkParagraph(document, form, type === 'event' ? 'Register' : 'Contact us'));
  return nodes;
}

// ---------------------------------------------------------------- forms

/** Big contact form / newsletter form: title, image, link to the Pardot form. */
function formBlock(fallbackLabel, useTitle = true) {
  return ([element], ctx) => {
    const { document } = ctx;
    const t = element.querySelector('[class*="__title"]');
    const nodes = [titleOf(document, t, pageTitleTag(document, element))];
    nodes.push(imageParagraph(document, imageOf(document, element.querySelector('[class*="__image-wrap"]'))));
    const iframe = element.querySelector('iframe');
    const form = formUrl(element);
    const label = (useTitle && iframe && (iframe.getAttribute('title') || '').trim()) || fallbackLabel;
    if (form) nodes.push(linkParagraph(document, form, label));
    return out(nodes, document, element);
  };
}

// ---------------------------------------------------------------- panels with lists

/**
 * Panels with a heading and a numbered list of links (services, partners, industries):
 * h2, button link (when it is a real link), ordered list of the linked items.
 */
const panelList = (kind) => ([element], ctx) => {
  const { document } = ctx;
  const nodes = [titleOf(document, pick(element, '[class*="__heading"]', 'h2'))];
  nodes.push(listingButton(document, element, '[class*="__column--left"] :is(a[href], button)', ctx, kind));
  const items = [...element.querySelectorAll('a.panel-list-item')]
    .map((a) => [text(a.querySelector('[class*="__title-content"]')) || text(a), a.getAttribute('href')])
    .filter(([label]) => label);
  if (items.length) {
    const ol = el(document, 'ol');
    items.forEach(([label, href]) => {
      const li = el(document, 'li');
      if (href) {
        const a = el(document, 'a', label);
        a.href = href;
        li.append(a);
      } else {
        li.textContent = label;
      }
      ol.append(li);
    });
    nodes.push(ol);
  }
  return out(nodes, document, element);
};

/** Panel work (industry landing pages): client heading + its case teaser card when it links somewhere. */
function panelWork([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, pick(element, '[class*="__heading"]', 'h1, h2'), 'h2')];
  const teaser = element.querySelector('a.case-teaser');
  const href = teaser && teaser.getAttribute('href');
  if (href) {
    const label = text(teaser.querySelector('.btn__label, [class*="__read-more"]'));
    const title = text(teaser.querySelector('[class*="__title"], h2, h3'));
    nodes.push(cardsRelated(document, 'teaser', [{
      img: imageOf(document, teaser),
      nodes: [cardTitle(document, title, href), label ? linkParagraph(document, href, label) : null],
    }]));
  }
  return out(nodes, document, element);
}

/** Panel whitepaper: heading, CTA, whitepaper cards (image, title, link). */
function panelWhitepaper([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, pick(element, '[class*="__heading"]', 'h1, h2'), 'h2')];
  nodes.push(listingButton(document, element, '[class*="__cta"]', ctx, 'whitepapers'));
  const cards = [...element.querySelectorAll('.card-whitepaper')].map((card) => {
    const link = card.closest('a[href]') || card.querySelector('a[href]');
    const title = text(card.querySelector('[class*="__title"], h2, h3'));
    if (!title) return null;
    return { img: imageOf(document, card), nodes: [cardTitle(document, title, link && link.getAttribute('href'))] };
  });
  nodes.push(cardsRelated(document, '', cards));
  return out(nodes, document, element);
}

// ---------------------------------------------------------------- card listings

/** Text-only teaser card: eyebrow + linked title (+ text). */
function textCard(document, card, href, { eyebrow, title, body } = {}) {
  const nodes = [];
  const e = eyebrow && text(card.querySelector(eyebrow));
  if (e) nodes.push(el(document, 'p', e));
  nodes.push(cardTitle(document, text(card.querySelector(title)), href));
  if (body) nodes.push(...lines(document, card.querySelector(body)));
  return { img: null, nodes };
}

/** Related posts: heading (+ CTA) left, author + title teasers right → h2 + "cards-related (list)". */
function articleRelatedPosts([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, pick(element, '[class*="__heading"]', 'h2'))];
  nodes.push(listingButton(document, element, '[class*="__left"] [class*="__cta"]', ctx, 'insights'));
  const cards = [...element.querySelectorAll('[class*="__right"] .article-teaser-small')].map((card) => {
    const link = card.closest('a[href]');
    return textCard(document, card, link && link.getAttribute('href'), { eyebrow: '[class*="__author"]', title: '[class*="__title"]' });
  }).filter((c) => c.nodes.some((n) => n && n.tagName === 'H3'));
  nodes.push(cardsRelated(document, 'list', cards));
  return out(nodes, document, element);
}

/** Highlighted insight (one large linked card: meta, title | image); consecutive ones form one block. */
function highlightedInsight(elements, ctx) {
  const { document } = ctx;
  const cards = elements.map((card) => {
    const href = card.getAttribute('href');
    const nodes = [];
    const meta = text(card.querySelector('[class*="__meta"]'));
    if (meta) nodes.push(el(document, 'p', meta));
    nodes.push(cardTitle(document, text(card.querySelector('[class*="__title"]')), href));
    return { img: imageOf(document, card), nodes };
  });
  const b = cardsRelated(document, '', cards);
  return b ? [b] : elements.flatMap((e) => flatten(document, e));
}

/** Service teasers (services pages, consecutive): linked service name, excerpt, "Find out more". */
function serviceTeaser(elements, ctx) {
  const { document } = ctx;
  const cards = elements.map((teaser) => {
    const link = teaser.querySelector('a[href]:not([href=""])');
    const href = link && link.getAttribute('href');
    const name = text(teaser.querySelector('[class*="__heading"]'));
    if (!name) return null;
    const label = text(teaser.querySelector('.btn__label'));
    return {
      img: null,
      nodes: [cardTitle(document, name, href), ...lines(document, teaser.querySelector('[class*="__excerpt"]')),
        href && label ? linkParagraph(document, href, label) : null],
    };
  });
  const b = cardsRelated(document, 'list', cards);
  return b ? [b] : [];
}

/** Content listing (insights / events overview, first page): h1 + "cards-related" of the cards. */
function contentListing([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__title"]'), 'h1')];
  const cards = unique([...element.querySelectorAll('a.listing-card-v2')]).map((card) => {
    const href = card.getAttribute('href');
    const n = [];
    const type = text(card.querySelector('[class*="__type"]'));
    if (type) n.push(el(document, 'p', type));
    n.push(cardTitle(document, text(card.querySelector('[class*="__title"]')), href));
    const tags = [...card.querySelectorAll('[class*="__tag"]:not([class*="__tags"]):not([class*="__type"])')]
      .map((t) => text(t).replace(/^\(\s*|\s*\)$/g, '')).filter(Boolean);
    if (tags.length) n.push(el(document, 'p', tags.join(', ')));
    return { img: image(document, card.querySelector('img')), nodes: n };
  });
  nodes.push(cardsRelated(document, '', cards));
  return out(nodes, document, element);
}

/** Filterable item listing (locale listings): back link, h1, the cards of the first page. */
function filterableItemListing([element], ctx) {
  const { document } = ctx;
  const nodes = [cta(document, element.querySelector('a[class*="__back-button"]'))];
  nodes.push(titleOf(document, element.querySelector('[class*="__title"]'), 'h1'));
  const cards = unique([...element.querySelectorAll('a.universal-item-card')]).map((card) => {
    const href = card.getAttribute('href');
    const n = [];
    const meta = text(card.querySelector('[class*="__meta"]'));
    if (meta) n.push(el(document, 'p', meta));
    n.push(cardTitle(document, text(card.querySelector('[class*="__title"]')), href));
    return { img: image(document, card.querySelector('img')), nodes: n };
  });
  nodes.push(cardsRelated(document, '', cards));
  return out(nodes, document, element);
}

/** Custom listing simple (impact reports): image cards with a button label → "cards-related". */
function customListingSimple([element], ctx) {
  const { document } = ctx;
  const cards = [...element.querySelectorAll('a[class*="__card"]')].map((card) => {
    const label = text(card.querySelector('[class*="__card_btn"]')) || text(card);
    const img = image(document, card.querySelector('img'));
    if (img && !img.alt) img.alt = label;
    return { img, nodes: [cardTitle(document, label, card.getAttribute('href'))] };
  });
  const b = cardsRelated(document, '', cards);
  return b ? [b] : flatten(document, element);
}

/** Featured items: heading, CTA, article cards (background image, linked title). */
function featuredItems([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, pick(element, '[class*="__heading"]', 'h2'))];
  nodes.push(cta(document, element.querySelector('a[class*="__btn"]')));
  const cards = unique([...element.querySelectorAll('a[class*="article-card"]')]).map((card) => ({
    img: imageOf(document, card),
    nodes: [cardTitle(document, text(card.querySelector('[class*="__heading"]')), card.getAttribute('href'))],
  }));
  nodes.push(cardsRelated(document, '', cards));
  return out(nodes, document, element);
}

/** Information with two (or three) content cards: title + text, then the cards (image, title, text). */
function informationCards([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__text"] [class*="__title"]'))];
  element.querySelectorAll('[class*="__text"] [class*="__subtitle"]').forEach((p) => nodes.push(...lines(document, p)));
  const cards = ['left', 'right', 'third'].map((side) => {
    const title = element.querySelector(`[class*="__${side}-title"]`);
    const img = image(document, element.querySelector(`[class*="__${side}-image"] img, img[class*="__${side}-image"]`));
    const body = [titleOf(document, title, 'h3'), ...lines(document, element.querySelector(`[class*="__${side}-subtitle"]`))];
    if (img && !img.alt && title) img.alt = text(title);
    return { img, nodes: body };
  });
  nodes.push(cardsRelated(document, 'info', cards));
  return out(nodes, document, element);
}

/** Podcasts: title, featured episode and the episode list → h2 + "cards-related (list)". */
function podcasts([element], ctx) {
  const { document } = ctx;
  const titleEl = element.querySelector('[class*="__title"]');
  const nodes = [titleOf(document, titleEl && (titleEl.querySelector('.is-desktop') || titleEl))];
  const featured = element.querySelector('[class*="__featured"]');
  const cards = [];
  const seen = new Set();
  if (featured) {
    const link = featured.querySelector('a[href]');
    const href = link && link.getAttribute('href');
    seen.add(href);
    cards.push({
      img: image(document, featured.querySelector('img')),
      nodes: [el(document, 'p', text(featured.querySelector('[class*="__featured-meta"]'))),
        cardTitle(document, text(featured.querySelector('[class*="__featured-title"]')), href),
        cta(document, link)].filter((n) => n && text(n)),
    });
  }
  element.querySelectorAll('a[class*="__item"]').forEach((item) => {
    const href = item.getAttribute('href');
    if (seen.has(href)) return;
    seen.add(href);
    const meta = [text(item.querySelector('[class*="__item-meta"]')), text(item.querySelector('[class*="__item-date"]'))].filter(Boolean).join(' • ');
    cards.push({ img: null, nodes: [meta ? el(document, 'p', meta) : null, cardTitle(document, text(item.querySelector('[class*="__item-title"]')), href)] });
  });
  nodes.push(cardsRelated(document, 'list', cards));
  return out(nodes, document, element);
}

/** Team gallery: title, subhead, people tiles (photo, name, role) → "people-cards". */
function teamGallery([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__title"]'))];
  nodes.push(...lines(document, element.querySelector('[class*="__subhead"]')));
  const rows = [...element.querySelectorAll('[class*="__item"]:not([class*="__items"]):not([class*="__item-"])')].map((item) => {
    const name = text(item.querySelector('[class*="__item-name"]'));
    const bio = text(item.querySelector('[class*="__item-bio"]'));
    const img = image(document, item.querySelector('img'));
    // the source alt texts belong to other people (shuffled tiles): use the name
    if (img) img.alt = name;
    const body = [name ? el(document, 'h3', name) : null, bio ? el(document, 'p', bio) : null].filter(Boolean);
    return [img ? field(document, 'image', img) : '', field(document, 'text', body)];
  }).filter((row) => row[0] || row[1]);
  if (rows.length) nodes.push(block(document, 'people-cards', rows));
  return out(nodes, document, element);
}

// ---------------------------------------------------------------- event program

/** "Label value" paragraph: <p><strong>Label</strong><br>value</p> (value lines kept). */
function labelled(document, label, valueEl) {
  const value = inline(document, valueEl, 'p');
  if (!text(value)) return null;
  if (!label) return value;
  const p = el(document, 'p');
  p.append(el(document, 'strong', label), el(document, 'br'), ...value.childNodes);
  return p;
}

/**
 * Event program: title, then per tab (show) its label and the schedule → h2, h3 per tab and a
 * "points-list" with one row per slot (keynote title, time, speakers).
 */
function eventProgram([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__title"]'))];
  const tabs = [...element.querySelectorAll('[class*="__tab"]:not([class*="__tabs"]):not([class*="__tab-"])')].map(text);
  [...element.querySelectorAll('[class*="__schedule-item"]')].forEach((schedule, i) => {
    if (tabs[i] && tabs.length > 1) nodes.push(el(document, 'h3', tabs[i]));
    const points = [...schedule.querySelectorAll('[class*="__item"]:not([class*="__item-"])')].map((item) => {
      // exact element class (__item-time, not __item-time-label)
      const part = (name) => [...item.querySelectorAll('*')].find((n) => [...n.classList].some((c) => c.endsWith(`__item-${name}`)));
      return [
        titleOf(document, part('keynote-title'), 'h3'),
        labelled(document, text(part('time-label')), part('time')),
        labelled(document, text(part('speakers-label')), part('speakers')),
      ];
    });
    nodes.push(pointsList(document, '', points));
  });
  return out(nodes, document, element);
}

/** Event program v2 (table: time | talk | speaker) → h2 + "points-list" (talk, time, speaker). */
function eventProgramV2([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__title"]'))];
  const table = element.querySelector('table');
  if (table) {
    const head = [...table.querySelectorAll('thead th')].map((th) => text(inline(document, th, 'p')));
    const points = [...table.querySelectorAll('tbody tr')].map((tr) => {
      const [time, talk, speaker] = [...tr.children];
      return [titleOf(document, talk, 'h3'), labelled(document, head[0], time), labelled(document, head[2], speaker)];
    });
    nodes.push(pointsList(document, '', points));
  }
  return out(nodes, document, element);
}

/** Event locations: title, date line and a link to the map of each location. */
function eventLocations([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__title"]'), 'h2')];
  element.querySelectorAll('[class*="__location-title"]').forEach((p) => nodes.push(...lines(document, p)));
  element.querySelectorAll('iframe[src*="maps"]').forEach((iframe) => {
    const src = iframe.getAttribute('src');
    let q = '';
    try {
      q = new URL(src, 'https://maps.google.com/').searchParams.get('q') || '';
    } catch (e) { /* keep */ }
    if (q) nodes.push(linkParagraph(document, `https://maps.google.com/maps?q=${encodeURIComponent(q)}`, q));
  });
  return out(nodes, document, element);
}

// ---------------------------------------------------------------- about / culture / contact pages

/** Timeline (about us): one card per year (image | year, description) → "cards-related". */
function timeline([element], ctx) {
  const { document } = ctx;
  const cards = [...element.querySelectorAll('[class*="__item"]:not([class*="__item-"])')].map((item) => {
    const year = text(item.querySelector('[class*="__year"]'));
    const img = image(document, item.querySelector('img'));
    if (img && !img.alt) img.alt = year;
    return { img, nodes: [year ? el(document, 'h3', year) : null, ...lines(document, item.querySelector('[class*="__description"]'))] };
  });
  const b = cardsRelated(document, '', cards);
  return b ? [b] : flatten(document, element);
}

/** Three facts (culture): background image, title, three numbered values → "points-list (numbered)". */
function threeFacts([element], ctx) {
  const { document } = ctx;
  const nodes = [imageParagraph(document, image(document, element.querySelector('[class*="__background-image"] img, img')))];
  nodes.push(titleOf(document, element.querySelector('[class*="__title"]')));
  const points = [...element.querySelectorAll('[class*="__fact"]:not([class*="__fact-"]):not([class*="__facts"])')].map((fact) => {
    const t = fact.querySelector('[class*="__fact-title"]');
    // the leading number (a span, unwrapped by the import) is the list counter
    const h3 = titleOf(document, t, 'h3');
    if (h3) h3.innerHTML = h3.innerHTML.replace(/^\s*\d+\s+/, '');
    return [h3, ...lines(document, fact.querySelector('[class*="__fact-subtitle"]'))];
  });
  nodes.push(pointsList(document, 'numbered', points));
  return out(nodes, document, element);
}

/** Heading, text and image (culture): title, text, then the photo grid images. */
function headingTextImage([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__title"]'))];
  element.querySelectorAll('[class*="__text"]').forEach((p) => nodes.push(...lines(document, p)));
  // the grid cycles through a list of photos (data-items): the first tiles are shown
  let urls = [];
  const grid = element.querySelector('[data-items]');
  try {
    urls = JSON.parse(grid.getAttribute('data-items')).map((i) => i.url).filter(Boolean);
  } catch (e) {
    urls = [...element.querySelectorAll('[class*="__grid-media"] img')].map((img) => img.getAttribute('src'));
  }
  const title = text(element.querySelector('[class*="__title"]'));
  const slides = urls.slice(0, 6).map((src) => {
    const img = el(document, 'img');
    img.src = src;
    img.alt = title;
    return [field(document, 'media_image', img), ''];
  });
  if (slides.length) nodes.push(block(document, 'carousel-culture (images)', slides));
  return out(nodes, document, element);
}

/** Heading with columns (culture, B Corp): title, image, lead text, rich text. */
function headingWithColumns([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__title"]:not([class*="__title-lead"])'))];
  nodes.push(imageParagraph(document, image(document, element.querySelector('[class*="__image-wrap"] img'))));
  nodes.push(...lines(document, element.querySelector('[class*="__title-lead"]')));
  nodes.push(...richText(document, element.querySelector('[class*="__content"]')));
  return out(nodes, document, element);
}

/** Special awards (tabs: award → title, years, image) → title, subtitle + "cards-related". */
function specialAwards([element], ctx) {
  const { document } = ctx;
  const nodes = [titleOf(document, element.querySelector('[class*="__title"]'))];
  nodes.push(...lines(document, element.querySelector('[class*="__subtitle"]')));
  const cards = [...element.querySelectorAll('[class*="__tab"][data-img]')].map((tab) => {
    const data = (name) => (tab.getAttribute(`data-${name}`) || '').replace(/\s+/g, ' ').trim();
    const img = el(document, 'img');
    img.src = data('img');
    img.alt = data('title') || text(tab);
    const n = [el(document, 'p', text(tab)), el(document, 'h3', data('title'))];
    if (data('subtitle')) n.push(el(document, 'p', data('subtitle')));
    return { img, nodes: n.filter((x) => text(x)) };
  });
  nodes.push(cardsRelated(document, '', cards));
  return out(nodes, document, element);
}

/** Office map: per region an h2 and a "points-list (columns)" of offices (city, address, phone, e-mail). */
function officeMap([element], ctx) {
  const { document } = ctx;
  const nodes = [];
  // tab labels ("Europe 19"), in the order of the region containers (the import drops the radio inputs)
  const tabs = [...element.querySelectorAll('[class*="__tab"]:not([class*="__tabs"])')].map((t) => text(t).replace(/\s*\d+$/, ''));
  element.querySelectorAll('[class*="__region-container"]').forEach((region, i) => {
    const name = tabs[i];
    if (name) nodes.push(el(document, 'h2', name));
    const points = [...region.querySelectorAll('[class*="__office-card"]')].map((card) => {
      const [city, ...rest] = [...card.children];
      return [el(document, 'h3', text(city)), ...rest.map((n) => {
        if (n.tagName === 'A' && n.getAttribute('href')) return linkParagraph(document, n.getAttribute('href'), text(n));
        return text(n) ? el(document, 'p', text(n)) : null;
      })];
    });
    nodes.push(pointsList(document, 'columns', points));
  });
  return out(nodes, document, element);
}

// ---------------------------------------------------------------- media

/** Media parallax teaser (service pages): one linked slide (image, tag, title) → "carousel-culture (slides)". */
function mediaParallax([element], ctx) {
  const { document } = ctx;
  const link = element.querySelector('a[href]');
  const label = text(element.querySelector('button, [class*="__btn"]'));
  const content = [
    ...lines(document, element.querySelector('[class*="__tag"]')),
    titleOf(document, element.querySelector('[class*="__title"]')),
    link ? linkParagraph(document, link.getAttribute('href'), label || 'Read more') : null,
  ].filter(Boolean);
  const img = image(document, element.querySelector('img'));
  return [block(document, 'carousel-culture (slides)', [[field(document, 'media_image', img), field(document, 'content_text', content)]])];
}

/** Square media with text: image | title, text, CTA (media-with-text layout). */
function squareMediaWithText([element], ctx) {
  const { document } = ctx;
  const media = [imageParagraph(document, image(document, element.querySelector('[class*="__image-wrap"] img')))];
  const content = [titleOf(document, element.querySelector('[class*="__title"]'))];
  element.querySelectorAll('[class*="__paragraph"]').forEach((p) => content.push(...lines(document, p)));
  content.push(cta(document, element.querySelector('a.cta-button, a[class*="__cta"]')));
  // image on the left unless switched (same order as media-with-text)
  const nodes = element.classList.contains('is-switched') ? [...content, ...media] : [...media, ...content];
  return out(nodes, document, element);
}

/** Two images side by side. */
function fiftyFiftyImages([element], ctx) {
  const { document } = ctx;
  return out([...element.querySelectorAll('img')].map((img) => imageParagraph(document, image(document, img))), document, element);
}

/** Trends intro (dark): text, image caption text, image. */
function trendsIntro([element], ctx) {
  const { document } = ctx;
  return out([
    ...lines(document, element.querySelector('[class*="__text"]')),
    imageParagraph(document, image(document, element.querySelector('[class*="__image-wrap"] img'))),
    ...lines(document, element.querySelector('[class*="__img-text"]')),
  ], document, element);
}

/** Trends content chapter: number, title, text, CTA and the chapter images (hover copies dropped). */
function trendsContent([element], ctx) {
  const { document } = ctx;
  const t = element.querySelector('[class*="__title"]');
  const images = ['[class*="__image-wrap"]:not([class*="hover"]) img', '[class*="__second-image-wrap"] img'].map((sel) => {
    const img = image(document, element.querySelector(sel));
    if (img && !img.alt && t) img.alt = text(t);
    return imageParagraph(document, img);
  });
  return out([
    ...lines(document, element.querySelector('[class*="__overline"]')),
    titleOf(document, t),
    ...[...element.querySelectorAll('[class*="__text"]')].flatMap((p) => lines(document, p)),
    cta(document, element.querySelector('a.cta-button, a[class*="__cta"]')),
    ...images,
  ], document, element);
}

/** Featured event: heading and the linked event teaser (dropped when the teaser is empty). */
function featuredEvent([element], ctx) {
  const { document } = ctx;
  const teaser = element.querySelector('a[class*="event-teaser"]');
  if (!teaser || !text(teaser)) return [];
  return out([
    titleOf(document, element.querySelector('[class*="__heading"]')),
    cardsRelated(document, '', [{
      img: imageOf(document, teaser),
      nodes: [cardTitle(document, text(teaser.querySelector('[class*="__title"], h2, h3')), teaser.getAttribute('href'))],
    }]),
  ], document, element);
}

/** Fast facts (about us): title + figures (value, label) → h2 + "stats-grid". */
function fastFacts([element], ctx) {
  const { document } = ctx;
  const rows = [...element.querySelectorAll('[class*="__item"]:not([class*="__item-"])')].map((item) => {
    const nodes = [...lines(document, item.querySelector('[class*="__item-title"]')), ...lines(document, item.querySelector('[class*="__item-text"]'))];
    return nodes.length ? [field(document, 'text', nodes)] : null;
  }).filter(Boolean);
  return out([
    titleOf(document, element.querySelector('[class*="__title"]')),
    rows.length ? block(document, 'stats-grid', rows) : null,
  ], document, element);
}

/** Single full-bleed image. */
function fullBleedImage([element], ctx) {
  const { document } = ctx;
  return out([imageParagraph(document, image(document, element.querySelector('img')))], document, element);
}

/** Case teaser (old case pages): the linked case card; dropped when it links nowhere (empty on the source). */
function caseTeaser([element], ctx) {
  const { document } = ctx;
  const href = element.getAttribute('href');
  if (!href) return [];
  const label = text(element.querySelector('.btn__label, [class*="__read-more"]'));
  const b = cardsRelated(document, 'teaser', [{
    img: imageOf(document, element),
    nodes: [cardTitle(document, text(element.querySelector('[class*="__title"], h2, h3')) || label, href)],
  }]);
  return b ? [b] : [];
}

/** Lone CTA button → link paragraph. */
function ctaButton([element], ctx) {
  const link = cta(ctx.document, element.matches('a') ? element : element.querySelector('a[href]'));
  return link ? [link] : flatten(ctx.document, element);
}

/** Souvenir shop: title, subtitle, products (image, name, description) → "cards-related". */
function souvenirShop([element], ctx) {
  const { document } = ctx;
  const cards = [...element.querySelectorAll('[data-souvenir-shop-product-name]')].map((item) => {
    const data = (name) => (item.getAttribute(`data-souvenir-shop-${name}`) || '').replace(/\s+/g, ' ').trim();
    let img = null;
    if (data('image-url')) {
      img = el(document, 'img');
      img.src = data('image-url');
      img.alt = data('image-alt') || data('product-name');
    }
    return { img, nodes: [el(document, 'h3', data('product-name')), data('description') ? el(document, 'p', data('description')) : null] };
  });
  return out([
    titleOf(document, element.querySelector('[class*="__title"]')),
    ...lines(document, element.querySelector('[class*="__subtitle"]')),
    cardsRelated(document, '', cards),
  ], document, element);
}

export const HANDLERS = {
  'two-quotes': { handler: twoQuotes },
  // the header and its intro line (block-event-header__cta) are separate children of <main>
  'event-header': { handler: eventHeader, group: true },
  'article-related-posts': { handler: articleRelatedPosts },
  'service-post-header': { handler: postHeader, style: 'dept-post-header-split, dept-service-post-header' },
  'industry-post-header': { handler: postHeader, style: 'dept-post-header-split, dept-industry-post-header' },
  'partner-post-header': { handler: postHeader, style: 'dept-post-header-split, dept-partner-post-header' },
  'panel-services': { handler: panelList(''), style: 'dept-panel-list, dept-panel-services' },
  'panel-partners': { handler: panelList('partners'), style: 'dept-panel-list, dept-panel-partners' },
  'panel-industries': { handler: panelList('industries'), style: 'dept-panel-list, dept-panel-industries' },
  'highlighted-insight': { handler: highlightedInsight, group: true },
  'main-page-header': { handler: mainPageHeader },
  'panel-work': { handler: panelWork },
  'event-program': { handler: eventProgram },
  'event-program-v2': { handler: eventProgramV2, style: 'dept-event-program, dept-event-program-v2' },
  'content-listing': { handler: contentListing },
  'filterable-item-listing': { handler: filterableItemListing, style: 'dept-content-listing, dept-filterable-item-listing' },
  'custom-listing-simple': { handler: customListingSimple },
  'panel-whitepaper': { handler: panelWhitepaper },
  'information-with-two-content-cards': { handler: informationCards },
  'tiktok-video': { handler: tiktokVideo },
  'special-awards': { handler: specialAwards },
  'heading-text-image': { handler: headingTextImage },
  'contact-form-big': { handler: formBlock('Contact us') },
  'form-newsletter': { handler: formBlock('Subscribe', false) },
  paragraph: { handler: paragraph },
  'js-media-parallax': { handler: mediaParallax, style: 'dept-carousel-slides, dept-media-parallax' },
  'trends-floating-download': { handler: trendsFloatingDownload },
  'square-media-with-text': { handler: squareMediaWithText, style: (node) => `dept-media-with-text, dept-square-media-with-text${node.classList.contains('is-switched') ? ', dept-switched' : ''}` },
  'service-teaser': { handler: serviceTeaser, group: true },
  'image-with-text-and-overlay': { handler: imageWithTextAndOverlay },
  podcasts: { handler: podcasts },
  'insights-header': { handler: insightsHeader },
  'externally-triggered-form': { handler: externallyTriggeredForm },
  'cta-banner': { handler: ctaBanner },
  timeline: { handler: timeline },
  'heading-with-columns': { handler: headingWithColumns },
  'three-facts': { handler: threeFacts },
  // dark on the source (theme set in the component CSS, not as a theme class)
  'office-map': { handler: officeMap, style: 'dept-office-map, dept-bg-richblack, dept-dark' },
  'form-with-header': { handler: formWithHeader },
  'fifty-fifty-image-block': { handler: fiftyFiftyImages, style: 'dept-panel-two-media, dept-fifty-fifty-image-block' },
  'trends-header-v2': { handler: trendsHeader },
  'trends-header': { handler: trendsHeader, style: 'dept-trends-header-v2, dept-trends-header' },
  'trends-intro': { handler: trendsIntro },
  'trends-content': { handler: trendsContent, style: (node) => `dept-trends-content${node.classList.contains('is-swapped') ? ', dept-switched' : ''}` },
  'featured-items': { handler: featuredItems },
  'landing-page-title': { handler: landingPageTitle },
  'team-gallery': { handler: teamGallery },
  'event-locations': { handler: eventLocations },
  'featured-event': { handler: featuredEvent },
  // single-page components
  'fast-facts': { handler: fastFacts },
  'full-bleed-image': { handler: fullBleedImage, style: 'dept-full-width-image, dept-full-bleed-image' },
  'case-teaser': { handler: caseTeaser },
  text: { handler: paragraph, style: 'dept-paragraph, dept-text' },
  'cta-button': { handler: ctaButton },
  'souvenir-shop': { handler: souvenirShop },
};
