/* eslint-disable */
/* global WebImporter */

/**
 * dept.global component handlers (lists group), merged into HANDLERS in ../components.js.
 * Event speakers become the block "people-cards", the point lists of partner, award, service and
 * web3 pages the block "points-list" (one row per point), the awards / credits table of case pages
 * the block "case-credits". Section titles stay default content before the block.
 * Section layouts: styles/dept-pages-parts/lists.css.
 */
import {
  text, el, image, flatten, field, block,
} from '../utils.js';

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
 * Copy of the inline content of source into a new <tag>: accent words (.is-fancy-serif, em, i)
 * → <em>, bold → <strong> (not in headings), links and line breaks kept, other wrappers unwrapped,
 * aria-hidden decorations ("(  Award  )" brackets) dropped. Unlike the shared heading() helper,
 * accents nested in other spans and <br>s survive.
 */
function inline(document, source, tag) {
  const out = el(document, tag);
  if (!source) return out;
  const isHeading = /^H\d$/i.test(tag);
  const walk = (from, to) => {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(n.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' '));
        return;
      }
      if (n.nodeType !== 1) return;
      if (n.matches('svg, button, script, style, i.icon, [aria-hidden="true"]')) return;
      if (n.tagName === 'BR') {
        to.append(el(document, 'br'));
        return;
      }
      if (n.matches('.is-fancy-serif, em, i')) {
        if (text(n)) to.append(el(document, 'em', text(n)));
        return;
      }
      if (n.matches('strong, b') && !isHeading) {
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
  };
  walk(source, out);
  // neighbouring accent spans form one accent; spaces around <br>s are dropped
  out.innerHTML = out.innerHTML.replace(/<\/em>(\s*)<em>/g, '$1').replace(/\s*<br>\s*/g, '<br>');
  return trimBreaks(out);
}

/** Inline copy as an array (empty when the source has no text). */
function inlineNodes(document, source, tag) {
  const n = inline(document, source, tag);
  return text(n) ? [n] : [];
}

/** Block "points-list (<variant>)": one row per point, cell = h3 title + description paragraphs. */
function pointsList(document, variant, points) {
  const rows = points
    .map(({ title, body }) => [...inlineNodes(document, title, 'h3'), ...body])
    .filter((nodes) => nodes.length)
    .map((nodes) => [field(document, 'text', nodes)]);
  if (!rows.length) return null;
  return block(document, variant ? `points-list (${variant})` : 'points-list', rows);
}

/** Description paragraphs of a point: each source element → <p> (links and <br>s kept). */
function paragraphs(document, elements) {
  return elements.flatMap((e) => inlineNodes(document, e, 'p'));
}

// ---------------------------------------------------------------- event speakers

/** Event people: "MEET THE SPEAKERS" title + speaker cards (photo, name, position, LinkedIn). */
function eventPeople([element], ctx) {
  const { document } = ctx;
  const out = [];
  out.push(...inlineNodes(document, element.querySelector('[class*="__title"]'), 'h2'));
  const rows = [...element.querySelectorAll('[class*="__card-wrap"]')].map((card) => {
    const img = image(document, card.querySelector('img'));
    const name = text(card.querySelector('[class*="__card-name"]'));
    const position = text(card.querySelector('[class*="__card-position"]'));
    const social = card.querySelector('a[class*="__card-social"][href]');
    if (img && !img.alt) img.alt = name;
    const body = [];
    if (name) body.push(el(document, 'h3', name));
    if (position) body.push(el(document, 'p', position));
    if (social) {
      const p = el(document, 'p');
      const a = el(document, 'a', text(social) || 'LinkedIn');
      a.href = social.getAttribute('href');
      p.append(a);
      body.push(p);
    }
    const row = [img ? field(document, 'image', img) : ''];
    if (body.length) row.push(field(document, 'text', body));
    return row;
  }).filter((row) => row[0] || row.length > 1);
  if (rows.length) out.push(block(document, 'people-cards', rows));
  return out.length ? out : flatten(document, element);
}

// ---------------------------------------------------------------- point lists

/** Points table (partner pages): title, subtitle, rows of point title | description. */
function pointsTable([element], ctx) {
  const { document } = ctx;
  const out = [];
  out.push(...inlineNodes(document, element.querySelector('[class*="__title"]:not([class*="__point"])'), 'h2'));
  element.querySelectorAll('[class*="__subtitle"]:not([class*="__point"])').forEach((p) => {
    out.push(...inlineNodes(document, p, 'p'));
  });
  const points = [...element.querySelectorAll('[class*="__point"]:is(li, div)')]
    .filter((li) => /__point(\s|$)/.test(li.className))
    .map((li) => ({
      title: li.querySelector('[class*="__point-title"]'),
      body: paragraphs(document, [...li.querySelectorAll('[class*="__point-subtitle"]')]),
    }));
  const list = pointsList(document, '', points);
  if (list) out.push(list);
  return out.length ? out : flatten(document, element);
}

/** Panel with list (award pages): heading on the left, numbered statements on the right. */
function panelWithList([element], ctx) {
  const { document } = ctx;
  const out = [];
  out.push(...inlineNodes(document, element.querySelector('[class*="__column--left"] :is(h1, h2, h3, h4, [class*="__heading"])'), 'h2'));
  const points = [...element.querySelectorAll('[class*="__item"]:not([class*="__item-"])')].map((item) => {
    const content = item.querySelector('.list-with-content__content');
    return {
      title: item.querySelector('.list-with-content__heading, .list-with-content__title'),
      body: content && text(content) ? flatten(document, content) : [],
    };
  });
  const list = pointsList(document, 'numbered', points);
  if (list) out.push(list);
  return out.length ? out : flatten(document, element);
}

/** Two column items list (service pages, dark): title left, 2-column grid of item title + list. */
function twoColumnItemsList([element], ctx) {
  const { document } = ctx;
  const out = [];
  out.push(...inlineNodes(document, element.querySelector('[class*="__title"]:not([class*="__item"])'), 'h2'));
  const points = [...element.querySelectorAll('[class*="__item"]:not([class*="__item-"]):not([class*="__items"])')].map((item) => ({
    title: item.querySelector('[class*="__item-title"]'),
    body: paragraphs(document, [...item.querySelectorAll('[class*="__item-subtitle"]')]),
  }));
  const list = pointsList(document, 'columns', points);
  if (list) out.push(list);
  return out.length ? out : flatten(document, element);
}

/** Two column two row list (web3 results, dark): title left, 2 x 2 figures (value + label). */
function twoColumnTwoRowList([element], ctx) {
  const { document } = ctx;
  const out = [];
  out.push(...inlineNodes(document, element.querySelector('[class*="__title"]:not([class*="__item"])'), 'h2'));
  const points = [];
  for (let i = 1; element.querySelector(`[class*="__item-${i}-"]`); i += 1) {
    points.push({
      title: element.querySelector(`[class*="__item-${i}-title"]`),
      body: paragraphs(document, [...element.querySelectorAll(`[class*="__item-${i}-subtitle"]`)]),
    });
  }
  const list = pointsList(document, 'stats', points);
  if (list) out.push(list);
  return out.length ? out : flatten(document, element);
}

// ---------------------------------------------------------------- case credits

/**
 * Case credits (end of case pages): awards table with localized column headers, and a credits
 * list (role → names). Output: h2 awards label, block "case-credits" (first row = the column
 * headers, then one row per award: award | year | category), h2 credits label, then h3 role +
 * p names per credit (default content). The block keeps no label fields: the page converter
 * pads single-cell rows to the item width, so block-level property rows would turn into items.
 */
function caseCredits([element], ctx) {
  const { document } = ctx;
  // labels without the decorative brackets "(  Award  )" (added again by the CSS)
  const bare = (node) => text(inline(document, node, 'p')).replace(/^\(\s*(.*?)\s*\)$/, '$1');
  const out = [];
  const awards = [...element.querySelectorAll('[class*="__award"]:not([class*="__award-"]):not([class*="__awards"])')];
  if (awards.length) {
    const awardsLabel = bare(element.querySelector('[class*="__awards-label"]'));
    if (awardsLabel) out.push(el(document, 'h2', awardsLabel));
    const row = (values) => ['award', 'year', 'category'].map((name, i) => (values[i] ? field(document, name, values[i]) : ''));
    const headers = [...element.querySelectorAll('[class*="__awards-header"] > *')].map(bare);
    const rows = [row(headers.length ? headers : ['Award', 'Year', 'Category'])];
    awards.forEach((award) => {
      rows.push(row(['__award-name', '__award-year', '__award-description'].map((c) => text(award.querySelector(`[class*="${c}"]`)))));
    });
    out.push(block(document, 'case-credits', rows));
  }
  const credits = [...element.querySelectorAll('[class*="__credit-column"]')].flatMap((col) => {
    const role = bare(col.querySelector('[class*="__credit-label"]'));
    const people = inlineNodes(document, col.querySelector('[class*="__credit-people"]'), 'p');
    return [...(role ? [el(document, 'h3', role)] : []), ...people];
  });
  if (credits.length) {
    const creditsLabel = bare(element.querySelector('[class*="__credits-label"]'));
    if (creditsLabel) out.push(el(document, 'h2', creditsLabel));
    out.push(...credits);
  }
  return out.length ? out : flatten(document, element);
}

/**
 * Section style of the dark two column lists (#121212 on the source, set by data-theme or a
 * __color-- modifier). The importer only sees a theme when a first-level child carries a
 * --richBlack / --onyxGrey modifier (the title colour of some lists); otherwise add it here.
 */
const darkList = (name) => (element) => {
  const themed = [...element.children].some((child) => /--(richBlack|onyxGrey)\b/.test(child.className));
  return themed ? `dept-${name}` : `dept-${name}, dept-bg-richblack, dept-dark`;
};

export const HANDLERS = {
  'event-people': { handler: eventPeople },
  'points-table': { handler: pointsTable },
  'panel-with-list': { handler: panelWithList },
  'two-column-items-list': { handler: twoColumnItemsList, style: darkList('two-column-items-list') },
  'two-column-two-row-list': { handler: twoColumnTwoRowList, style: darkList('two-column-two-row-list') },
  'case-credits': { handler: caseCredits },
};
