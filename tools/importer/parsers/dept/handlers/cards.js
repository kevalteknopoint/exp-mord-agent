/* eslint-disable */
/* global WebImporter */

/**
 * dept.global component handlers (cards group), merged into HANDLERS in ../components.js.
 * Card rows / sliders become the block "cards-related" (image | text), image carousels and
 * slides the block "carousel-culture" (media_image | content_text), each with a variant for the
 * source layout. Section titles, intros and CTAs stay default content before the block.
 * Section layouts: styles/dept-pages-parts/cards.css.
 */
import cardsCasestudyParser from '../../cards-casestudy.js';
import { runParser } from '../components.js';
import {
  text, pick, el, image, flatten, field, block, linkParagraph,
} from '../utils.js';

const ACCENT = '.is-fancy-serif, em, i';
const BR_RUN = /(?:\s|&nbsp;)*(?:<br\s*\/?>(?:\s|&nbsp;)*){2,}/i;
const DARK = ['onyxgrey', 'richblack', 'black', 'darkgrey', 'charcoal'];

/**
 * Heading with the source text: accent words (.is-fancy-serif, em, i) → <em>, <br>s → spaces.
 * Unlike the shared heading() helper, accents nested in other wrappers (<strong>) count.
 */
function titleOf(document, node, tag = 'h2') {
  if (!node || !text(node)) return null;
  const h = el(document, tag);
  const walk = (from) => from.childNodes.forEach((n) => {
    if (n.nodeType === 3) h.append(n.textContent.replace(/\s+/g, ' '));
    else if (n.nodeType !== 1) return;
    else if (n.tagName === 'BR') h.append(' ');
    else if (n.matches(ACCENT)) {
      if (text(n)) h.append(el(document, 'em', text(n)));
    } else walk(n);
  });
  walk(node);
  h.innerHTML = h.innerHTML.replace(/<\/em>(\s*)<em>/g, '$1').replace(/\s+/g, ' ').trim();
  return h;
}

/**
 * Copy of the inline content of source into a new <tag>: bold, accents (→ <em>), links and line
 * breaks kept, every other wrapper (span, div) unwrapped. Leading / trailing <br>s dropped.
 */
function inline(document, source, tag = 'p') {
  const out = el(document, tag);
  const walk = (from, to) => from.childNodes.forEach((n) => {
    if (n.nodeType === 3) {
      to.append(n.textContent.replace(/\s+/g, ' '));
      return;
    }
    if (n.nodeType !== 1 || n.matches('svg, button, script, style')) return;
    if (n.tagName === 'BR') {
      to.append(el(document, 'br'));
      return;
    }
    if (n.matches(ACCENT)) {
      if (text(n)) to.append(el(document, 'em', text(n)));
      return;
    }
    if (n.matches('strong, b') && !/^H\d$/.test(tag.toUpperCase())) {
      const s = el(document, 'strong');
      walk(n, s);
      if (text(s)) to.append(s);
      return;
    }
    if (n.tagName === 'A' && n.getAttribute('href')) {
      const a = el(document, 'a');
      a.href = n.getAttribute('href');
      walk(n, a);
      if (text(a)) to.append(a);
      return;
    }
    walk(n, to);
  });
  walk(source, out);
  out.innerHTML = out.innerHTML.replace(/<\/em>(\s*)<em>/g, '$1')
    .replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').trim();
  return text(out) ? out : null;
}

/** Paragraphs of a source text element whose paragraphs are separated by <br><br>. */
function paragraphs(document, node) {
  if (!node) return [];
  return node.innerHTML.split(BR_RUN).map((part) => {
    const holder = document.createElement('div');
    holder.innerHTML = part;
    return inline(document, holder);
  }).filter(Boolean);
}

/** CTA link paragraph of a source link (label from the link text or a nested button). */
function cta(document, link, fallback = '') {
  if (!link || !link.getAttribute('href')) return null;
  const label = text(link) || fallback;
  return label ? linkParagraph(document, link.getAttribute('href'), label) : null;
}

/** Block "cards-related (<variant>)": one row per card, image | text. */
function cardsRelated(document, variant, cards) {
  const rows = cards.filter((c) => c.img || (c.nodes && c.nodes.length))
    .map(({ img, nodes }) => [field(document, 'image', img), field(document, 'text', nodes)]);
  if (!rows.length) return null;
  return block(document, variant ? `cards-related (${variant})` : 'cards-related', rows);
}

/** Block "carousel-culture (<variant>)": one row per slide, media_image | content_text. */
function carousel(document, variant, slides) {
  const rows = slides.filter((s) => s.img || (s.nodes && s.nodes.length))
    .map(({ img, nodes }) => [field(document, 'media_image', img), field(document, 'content_text', nodes || [])]);
  if (!rows.length) return null;
  return block(document, variant ? `carousel-culture (${variant})` : 'carousel-culture', rows);
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

/** Slides of a swiper carousel without its loop copies (.swiper-slide-duplicate). */
function realSlides(element, selector) {
  return [...element.querySelectorAll(selector)].filter((s) => !s.matches('.swiper-slide-duplicate'));
}

/*
 * Light sections get "dept-light": the importer's theme fallback reads --onyxGrey / --richBlack on
 * any first-level child (text and button colour classes too) and wrongly adds dept-dark;
 * cards.css restores the light look for .dept-light.
 */
const light = (name) => `${name}, dept-light`;

/** Section style with the source theme of data-theme (the importer reads class names only). */
const themed = (name) => (node) => {
  const theme = (node.getAttribute('data-theme') || '').toLowerCase();
  if (!theme || theme === 'white') return light(name);
  return `${name}, dept-bg-${theme}${DARK.includes(theme) ? ', dept-dark' : ''}`;
};

// ---------------------------------------------------------------- carousels

/** Title block carousel (case / event pages): title + text, then a row of images. */
function titleBlockCarousel([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="__title"]'));
  if (title) out.push(title);
  out.push(...paragraphs(document, pick(element, '[class*="__text"]')));
  const slides = [...element.querySelectorAll('img')].map((img) => ({ img: image(document, img) }));
  const carouselBlock = carousel(document, 'images', slides);
  if (carouselBlock) out.push(carouselBlock);
  return out.length ? out : flatten(document, element);
}

// ---------------------------------------------------------------- collages

/** Image cards (vacancy pages): eyebrow, title, text, CTA, then a collage of four images. */
function imageCards([element], ctx) {
  const { document } = ctx;
  const out = [];
  const intro = pick(element, '[class*="__intro"]');
  if (intro && inline(document, intro)) out.push(inline(document, intro));
  const title = titleOf(document, pick(element, '[class*="__title"]'));
  if (title) out.push(title);
  const body = pick(element, '[class*="__text"]');
  if (body) out.push(...paragraphs(document, body));
  const link = cta(document, pick(element, 'a[class*="__cta"]'));
  if (link) out.push(link);
  element.querySelectorAll('img').forEach((img) => {
    const copy = image(document, img);
    if (!copy) return;
    const p = el(document, 'p');
    p.append(copy);
    out.push(p);
  });
  return out.length ? out : flatten(document, element);
}

/** Slide of a careers / numbered carousel or a hero: image | tag, title, CTA. */
function slide(document, node, titleTag = 'h2') {
  const nodes = [];
  const tag = text(pick(node, '[class*="__tag"]', '[class*="__intro"]'));
  if (tag) nodes.push(el(document, 'p', tag));
  // <br>s become spaces (the JCR heading text drops them); the CSS width breaks the line instead
  const title = titleOf(document, pick(node, '[class*="__title"]'), titleTag);
  if (title) nodes.push(title);
  // the whole slide is a link (label on a nested button), or the hero has a CTA button link
  const link = node.querySelector('a[class*="__cta"], a[href]');
  const label = link && text(link.querySelector('button, [class*="__btn"], [class*="cta-button"]')) || (link && text(link) !== text(title) ? text(link) : '');
  if (link && link.getAttribute('href')) nodes.push(linkParagraph(document, link.getAttribute('href'), label || 'Read more'));
  return { img: image(document, node.querySelector('img')), nodes };
}

/** Careers carousel / numbered carousel (jumbotron slides) → "carousel-culture (slides)". */
function slidesCarousel([element], ctx) {
  const { document } = ctx;
  const slides = realSlides(element, '[class*="__item"]:not([class*="__item-inner"])').map((s) => slide(document, s));
  const carouselBlock = carousel(document, 'slides', slides);
  return carouselBlock ? [carouselBlock] : flatten(document, element);
}

/** Card hero / hero carousel montage (careers): one full-width slide with eyebrow, title, CTA. */
const hero = (titleTag) => ([element], ctx) => {
  const { document } = ctx;
  const carouselBlock = carousel(document, 'slides', [slide(document, element, titleTag)]);
  return carouselBlock ? [carouselBlock] : flatten(document, element);
};

// ---------------------------------------------------------------- card rows

/** Title, subtitle(s) and CTA of a listing component (default content before its cards). */
function intro(document, element, { eyebrow, title, subtitles = [], button } = {}) {
  const out = [];
  if (eyebrow && text(pick(element, eyebrow))) out.push(el(document, 'p', text(pick(element, eyebrow))));
  const h = title && titleOf(document, pick(element, title));
  if (h) out.push(h);
  subtitles.forEach((sel) => element.querySelectorAll(sel).forEach((p) => {
    const copy = inline(document, p);
    if (copy) out.push(copy);
  }));
  const link = button && cta(document, pick(element, button));
  if (link) out.push(link);
  return out;
}

/** Two cards and content: title / subtitle / CTA left, slider of case cards right. */
function twoCardsAndContent([element], ctx) {
  const { document } = ctx;
  const out = intro(document, element, {
    title: '[class*="__main-title"]', subtitles: ['[class*="__main-subtitle"]'], button: 'a[class*="__main-cta"]',
  });
  const seen = new Set();
  const cards = [...element.querySelectorAll('a[class*="__card"]')].filter((a) => {
    const key = a.getAttribute('href') || text(a);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((card) => {
    const nodes = [cardTitle(document, text(card.querySelector('[class*="__card-title"]')), card.getAttribute('href'))];
    const sub = text(card.querySelector('[class*="__card-subtitle"]'));
    if (sub) nodes.push(el(document, 'p', sub));
    return { img: image(document, card.querySelector('img')), nodes: nodes.filter(Boolean) };
  });
  const cardsBlock = cardsRelated(document, 'slider', cards);
  if (cardsBlock) out.push(cardsBlock);
  return out.length ? out : flatten(document, element);
}

/** Image with content cards / content cards (careers): people cards (tag, name, role, quote). */
function contentCards([element], ctx) {
  const { document } = ctx;
  const out = intro(document, element, {
    eyebrow: '[class*="__overline"]',
    title: '[class*="cards__title"]',
    subtitles: ['[class*="cards__subtitle"]', '[class*="cards__caption"]'],
    button: 'a[class*="cards__cta"]',
  });
  // highlighted opportunities: text-only job cards (department, linked title, countries, contract)
  const jobs = realSlides(element, 'a[class*="cards__job"]').map((job) => {
    const nodes = [];
    const dept = text(job.querySelector('[class*="__job-department"]'));
    if (dept) nodes.push(el(document, 'p', dept));
    const t = cardTitle(document, text(job.querySelector('[class*="__job-title"]')), job.getAttribute('href'));
    if (t) nodes.push(t);
    const meta = [text(job.querySelector('[class*="__job-country"]')), text(job.querySelector('[class*="__job-contract"]'))].filter(Boolean);
    if (meta.length) nodes.push(el(document, 'p', meta.join(' · ')));
    return { img: null, nodes };
  });
  // people / speaker cards (image, tag, name, role, quote)
  const people = realSlides(element, '.content-card, .speaker-content-card').map((card) => {
    const nodes = [];
    const tag = text(card.querySelector('[class*="__tag"]'));
    if (tag) nodes.push(el(document, 'p', tag));
    const name = text(card.querySelector('[class*="__title"]'));
    if (name) nodes.push(el(document, 'h3', name));
    ['__position', '__quote', '__text'].forEach((part) => {
      const p = card.querySelector(`[class*="${part}"]`);
      const copy = p && inline(document, p);
      if (copy) nodes.push(copy);
    });
    const link = cta(document, card.querySelector('a[href]'));
    if (link) nodes.push(link);
    return { img: image(document, card.querySelector('img')), nodes };
  });
  const cardsBlock = cardsRelated(document, 'slider', [...people, ...jobs]);
  if (cardsBlock) out.push(cardsBlock);
  return out.length ? out : flatten(document, element);
}

/** Case teaser v2: one full-bleed case card (client, title, "View Case study"). */
function caseTeaser([element], ctx) {
  const { document } = ctx;
  const href = element.getAttribute('href');
  const nodes = [cardTitle(document, text(element.querySelector('[class*="__client"]')), href)];
  const title = text(element.querySelector('[class*="__title"]'));
  if (title) nodes.push(el(document, 'p', title));
  const label = text(element.querySelector('[class*="__cta"]'));
  if (href && label) nodes.push(linkParagraph(document, href, label));
  const cardsBlock = cardsRelated(document, 'teaser', [{ img: image(document, element.querySelector('img')), nodes: nodes.filter(Boolean) }]);
  return cardsBlock ? [cardsBlock] : flatten(document, element);
}

/** Four card information block: title / text / CTA, then four service cards (image, title, text). */
function fourCardInformation([element], ctx) {
  const { document } = ctx;
  const out = intro(document, element, {
    title: '[class*="block__title"]', subtitles: ['[class*="block__subtitle"]'], button: 'a[class*="__cta"]',
  });
  const cards = realSlides(element, '.four-card-information-block-card').map((card) => {
    const nodes = [];
    const title = text(card.querySelector('[class*="__title"]'));
    if (title) nodes.push(el(document, 'h3', title));
    const body = card.querySelector('[class*="__clients"], [class*="__text"]');
    const copy = body && inline(document, body);
    if (copy) nodes.push(copy);
    return { img: image(document, card.querySelector('img')), nodes };
  });
  const cardsBlock = cardsRelated(document, 'info', cards);
  if (cardsBlock) out.push(cardsBlock);
  return out.length ? out : flatten(document, element);
}

/** Panel with cards: heading left, coloured tiles right (title + the text of its flyout overlay). */
function panelWithCards([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="__column--left"] h2, [class*="__column--left"] h3'));
  if (title) out.push(title);
  const cards = [...element.querySelectorAll('[class*="panel-with-cards__item-inner"]')].map((item) => {
    const nodes = [];
    const name = text(item.querySelector('.card-teaser__title, h2, h3'));
    if (name) nodes.push(el(document, 'h3', name));
    item.querySelectorAll('[class*="overlay__content"] p, [class*="overlay__content"] li').forEach((p) => {
      const copy = inline(document, p);
      if (copy) nodes.push(copy);
    });
    return { img: image(document, item.querySelector('img')), nodes };
  });
  const cardsBlock = cardsRelated(document, 'tiles', cards);
  if (cardsBlock) out.push(cardsBlock);
  return out.length ? out : flatten(document, element);
}

/** Case study showcase (dark): heading + case cards (filters / list-grid toggle dropped). */
function caseStudyShowcase([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="__heading"]'));
  if (title) out.push(title);
  const cards = [...element.querySelectorAll('.universal-item-card')].map((card) => {
    const href = card.getAttribute('href');
    const nodes = [cardTitle(document, text(card.querySelector('[class*="__title"]')), href)];
    const meta = text(card.querySelector('[class*="__meta"]'));
    if (meta) nodes.push(el(document, 'p', meta));
    return { img: image(document, card.querySelector('img')), nodes: nodes.filter(Boolean) };
  }).filter((c) => c.img || c.nodes.length);
  const cardsBlock = cardsRelated(document, '', cards);
  if (cardsBlock) out.push(cardsBlock);
  return out.length ? out : flatten(document, element);
}

/** Work listing v2 (projects overview): h1 + the case cards of the first page (cards-casestudy). */
function workListingV2([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="__title"]'), 'h1');
  if (title) out.push(title);
  const items = element.querySelector('[class*="__items"]');
  if (items && items.querySelector('a.listing-card')) {
    const clone = items.cloneNode(true);
    // the v2 cards carry the client name in an h2 (the parser reads p.listing-card__title)
    clone.querySelectorAll('.listing-card__title:not(p)').forEach((h) => {
      const p = el(document, 'p', text(h));
      p.className = 'listing-card__title';
      h.replaceWith(p);
    });
    out.push(...runParser(cardsCasestudyParser, [clone], ctx));
  }
  return out.length ? out : flatten(document, element);
}

/** Industry listing: big linked industry names (hover images dropped) → list of links. */
function industryListing([element], ctx) {
  const { document } = ctx;
  const items = [...element.querySelectorAll('a[class*="__item"]')];
  if (!items.length) return flatten(document, element);
  const ul = el(document, 'ul');
  items.forEach((a) => {
    const li = el(document, 'li');
    const link = el(document, 'a', text(a.querySelector('[class*="__item-title"]')) || text(a));
    link.href = a.getAttribute('href');
    li.append(link);
    ul.append(li);
  });
  return [ul];
}

/** Job list: title + subtitle, then the rendered job cards (filters dropped). */
function jobList([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="block-job-list__title"]'));
  if (title) out.push(title);
  const sub = text(pick(element, '[class*="block-job-list__subtitle"]'));
  if (sub) out.push(el(document, 'p', sub));
  const cards = [...element.querySelectorAll('a.job-card')].map((card) => {
    const nodes = [];
    const dept = [...card.querySelectorAll('p[class*="__department"]')].map(text).filter(Boolean).join(', ');
    if (dept) nodes.push(el(document, 'p', dept));
    const t = cardTitle(document, text(card.querySelector('[class*="__title"]')), card.getAttribute('href'));
    if (t) nodes.push(t);
    const meta = [text(card.querySelector('[class*="__countries"]')), text(card.querySelector('[class*="__contract-types"]'))].filter(Boolean);
    if (meta.length) nodes.push(el(document, 'p', meta.join(' · ')));
    return { img: image(document, card.querySelector('img')), nodes };
  });
  const cardsBlock = cardsRelated(document, 'list', cards);
  if (cardsBlock) out.push(cardsBlock);
  return out.length ? out : flatten(document, element);
}

/** Six block content: image | title + text (panel-split), then six numbered benefit cards. */
function sixBlockContent([element], ctx) {
  const { document } = ctx;
  const out = [];
  const top = element.querySelector('[class*="__top-content"]') || element;
  const img = image(document, top.querySelector('img'));
  const right = intro(document, top, { title: '[class*="content__title"]', subtitles: ['[class*="content__subtitle"]'] });
  if (img || right.length) {
    const p = el(document, 'p');
    if (img) p.append(img);
    out.push(block(document, 'panel-split', [
      [field(document, 'left', img ? p : null)],
      [field(document, 'right', right)],
    ]));
  }
  const cards = [...element.querySelectorAll('.block-six-block-content-card')].map((card) => {
    const nodes = [];
    const num = text(card.querySelector('[class*="card__title"]'));
    if (num) nodes.push(el(document, 'p', num));
    const name = text(card.querySelector('[class*="card__subtitle"]'));
    if (name) nodes.push(el(document, 'h3', name));
    const desc = card.querySelector('[class*="card__description"]');
    const copy = desc && inline(document, desc);
    if (copy) nodes.push(copy);
    return { img: null, nodes };
  });
  const cardsBlock = cardsRelated(document, 'numbered', cards);
  if (cardsBlock) out.push(cardsBlock);
  return out.length ? out : flatten(document, element);
}

/** Three row block: title, then image | three facts (title + text). */
function threeRowBlock([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="block__title"]'));
  if (title) out.push(title);
  const img = image(document, element.querySelector('img'));
  const right = [];
  element.querySelectorAll('[class*="__item"][data-position]').forEach((item) => {
    const h = text(item.querySelector('[class*="__item-title"]'));
    if (h) right.push(el(document, 'h3', h));
    const p = item.querySelector('[class*="__item-subtitle"]');
    const copy = p && inline(document, p);
    if (copy) right.push(copy);
  });
  if (img || right.length) {
    const p = el(document, 'p');
    if (img) p.append(img);
    out.push(block(document, 'panel-split', [
      [field(document, 'left', img ? p : null)],
      [field(document, 'right', right)],
    ]));
  }
  return out.length ? out : flatten(document, element);
}

export const HANDLERS = {
  'title-block-carousel': { handler: titleBlockCarousel },
  'image-cards': { handler: imageCards },
  carousel: { handler: slidesCarousel, style: 'dept-carousel-slides' },
  'numbered-carousel': { handler: slidesCarousel, style: 'dept-carousel-slides' },
  'card-hero': { handler: hero('h1'), style: 'dept-carousel-slides' },
  'hero-carousel-montage': { handler: hero('h2'), style: 'dept-carousel-slides' },
  'two-cards-and-content': { handler: twoCardsAndContent, style: themed('dept-two-cards-and-content') },
  'image-with-content-cards': { handler: contentCards, style: light('dept-content-cards') },
  'content-cards': { handler: contentCards, style: light('dept-content-cards') },
  'case-teaser-v2': { handler: caseTeaser, style: 'dept-case-teaser' },
  'four-card-information-block': { handler: fourCardInformation, style: themed('dept-four-card-information-block') },
  'panel-with-cards': { handler: panelWithCards },
  // dark on the source (theme set in the component CSS, not as a theme class)
  'case-study-showcase': { handler: caseStudyShowcase, style: 'dept-case-study-showcase, dept-bg-richblack, dept-dark' },
  'work-listing-v2': { handler: workListingV2 },
  'industry-listing': { handler: industryListing },
  'job-list': { handler: jobList, style: light('dept-job-list') },
  'six-block-content': { handler: sixBlockContent },
  'three-row-block': { handler: threeRowBlock, style: light('dept-three-row-block') },
};
