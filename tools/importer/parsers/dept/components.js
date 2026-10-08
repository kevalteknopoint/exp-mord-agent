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

/** New heading with the source text; accent words (.is-fancy-serif) become <em>. */
function heading(document, source, tag) {
  const h = el(document, tag);
  source.childNodes.forEach((n) => {
    if (n.nodeType === 1 && n.matches('.is-fancy-serif, em, i')) h.append(el(document, 'em', text(n)));
    else h.append(n.textContent.replace(/\s+/g, ' '));
  });
  h.innerHTML = h.innerHTML.trim();
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

function assetsAndCopy(elements, ctx) {
  return runParser(columnsFeatureParser, elements, ctx);
}

function talkingPoints(elements, ctx) {
  return runParser(cardsSolutionsParser, elements, ctx);
}

function workListing([element], ctx) {
  const out = titleAndCta(ctx, element, '.block-work-listing__title', '.block-work-listing > a.button-v2, a.button-v2');
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
function highlightedItemListing([element], ctx) {
  const { document } = ctx;
  const out = titleAndCta(ctx, element, '.block-highlighted-item-listing__title', '.block-highlighted-item-listing__cta-button');
  const cards = [...element.querySelectorAll('.universal-item-card, .block-highlighted-item-listing__cards > a')];
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

/**
 * Handlers keyed by source component name ("block-" prefix and "__…" suffix removed).
 * style: section style; group: consecutive components of this kind form one section.
 */
export const HANDLERS = {
  'scrolly-video-intro': { handler: scrollyVideoIntro, style: 'dept-hero' },
  'statement-v2': { style: 'dept-statement' },
  'assets-and-copy': { handler: assetsAndCopy, style: 'dept-features', group: true },
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
};
