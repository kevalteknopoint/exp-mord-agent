/* eslint-disable */
/* global WebImporter */

/**
 * dept.global component handlers (intros group), merged into HANDLERS in ../components.js.
 * Page intros, statements and event components. The download / event intros become the block
 * "article-header (intro)" (like insight-intro); everything else is default content styled by
 * its section (styles/dept-pages-parts/intros.css).
 */
import {
  text, pick, el, image, flatten, field, block, linkParagraph,
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
  // trailing whitespace of the last / leading whitespace of the first text node
  if (node.firstChild && node.firstChild.nodeType === 3) node.firstChild.textContent = node.firstChild.textContent.replace(/^\s+/, '');
  if (node.lastChild && node.lastChild.nodeType === 3) node.lastChild.textContent = node.lastChild.textContent.replace(/\s+$/, '');
  return node;
}

/**
 * Copy of the inline content of source into a new <tag>: accent words (.is-fancy-serif, em, i)
 * → <em>, bold → <strong> (unless the tag is a heading), links and line breaks kept, every
 * other wrapper (span, div) unwrapped.
 */
function inline(document, source, tag) {
  const out = el(document, tag);
  const isHeading = /^H\d$/i.test(tag);
  const walk = (from, to) => {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(n.textContent.replace(/\s+/g, ' '));
        return;
      }
      if (n.nodeType !== 1) return;
      if (n.matches('svg, button, script, style, i.icon')) return;
      if (n.tagName === 'BR') {
        to.append(el(document, 'br'));
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
        else to.append(...s.childNodes);
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
  // neighbouring accent spans ("una" "mejor atención") form one accent
  out.innerHTML = out.innerHTML.replace(/<\/em>(\s*)<em>/g, '$1');
  return trimBreaks(out);
}

/** Splits paragraphs (and headings) at runs of <br><br> into separate nodes of the same tag. */
function splitBreaks(document, nodes) {
  const out = [];
  nodes.forEach((n) => {
    if (!/^(P|H[1-6])$/.test(n.tagName) || n.querySelector('img') || !BR_RUN.test(n.innerHTML)) {
      if (n.nodeType === 1 && /^(P|H[1-6])$/.test(n.tagName)) trimBreaks(n);
      if (text(n) || n.querySelector('img')) out.push(n);
      return;
    }
    n.innerHTML.split(BR_RUN).forEach((part) => {
      const p = el(document, n.tagName.toLowerCase());
      p.innerHTML = part;
      trimBreaks(p);
      if (text(p)) out.push(p);
    });
  });
  return out;
}

/** Inline copy of a title / text element, keeping its tag (h1–h6 or p), split at <br><br>. */
function keepTag(document, source, fallbackTag = 'p') {
  if (!source || !text(source)) return [];
  const tag = /^H[1-6]$/.test(source.tagName) ? source.tagName.toLowerCase() : fallbackTag;
  return splitBreaks(document, [inline(document, source, tag)]);
}

/** Flattened rich text, paragraphs split at <br><br>. */
function richText(document, source) {
  return source ? splitBreaks(document, flatten(document, source)) : [];
}

/** Pardot form URL of a form wrapper (iframe src, lazy data-src / data-initial-src). */
function formUrl(node) {
  const iframe = node && node.querySelector('iframe');
  if (!iframe) return '';
  return (iframe.getAttribute('src') || iframe.getAttribute('data-src') || iframe.getAttribute('data-initial-src') || '').trim();
}

/** "Label value" line → <p><strong>Label</strong> value</p> (value optionally a link). */
function labelled(document, label, value, href) {
  const p = el(document, 'p');
  if (label) {
    p.append(el(document, 'strong', label));
    p.append(' ');
  }
  if (href) {
    const a = el(document, 'a', value);
    a.href = href;
    p.append(a);
  } else {
    p.append(value);
  }
  return p;
}

// ---------------------------------------------------------------- download / event intros

/**
 * Download and event intro (badge, big title, meta items, featured image) → block
 * "article-header (intro)": image | text (badge, h1) | portrait | details ("Label: value" lines)
 */
function introBlock(element, ctx) {
  const { document } = ctx;
  const img = image(document, pick(element, '[class*="__featured-image"]', 'img'));
  const title = pick(element, '[class*="__title"]:not([class*="banner"])', 'h1');
  const textNodes = [];
  const badge = text(pick(element, '[class*="__badge"]'));
  if (badge) textNodes.push(el(document, 'p', badge));
  if (title) textNodes.push(el(document, 'h1', text(title)));
  if (img && !img.alt && title) img.alt = text(title);
  const details = [];
  // the sticky banner repeats title + meta: only the first meta list counts
  element.querySelectorAll('[class*="__event-meta"] > [class*="__event-meta-item"]').forEach((item) => {
    const labelEl = item.querySelector('[class*="meta-label"]');
    const label = text(labelEl);
    const value = text(item).slice(label.length).trim();
    if (value) details.push(el(document, 'p', label ? `${label}: ${value}` : value));
  });
  const cells = [[field(document, 'image', img)], [field(document, 'text', textNodes)]];
  if (details.length) {
    cells.push(['']);
    cells.push([field(document, 'details', details)]);
  }
  return block(document, 'article-header (intro)', cells);
}

/** Whitepaper intro: header block, then the description and the download form link. */
function whitepaperIntro([element], ctx) {
  const { document } = ctx;
  const out = [introBlock(element, ctx)];
  out.push(...richText(document, element.querySelector('[class*="__content"]')));
  const form = formUrl(element.querySelector('[class*="__form"]'));
  if (form) out.push(linkParagraph(document, form, text(pick(element, '[class*="__badge"]')) || 'Download'));
  return out;
}

function eventIntro([element], ctx) {
  return [introBlock(element, ctx)];
}

/** Event info: intro text, address / date / time lines, registration form link. */
function eventInfo([element], ctx) {
  const { document } = ctx;
  const out = [];
  element.querySelectorAll('[class*="__intro"]').forEach((intro) => out.push(...richText(document, intro)));
  element.querySelectorAll('[class*="__sub-event-item"]').forEach((item) => {
    const label = text(item.querySelector('b, strong'));
    const value = text(item).slice(label.length).trim();
    if (!value) return;
    const href = item.tagName === 'A' ? item.getAttribute('href') : '';
    out.push(labelled(document, label, value, href));
  });
  const form = formUrl(element.querySelector('[class*="__form"]'));
  if (form) {
    // the intro banner button ("Register", localized) opens this form on the source
    const cta = text(document.querySelector('.block-event-intro a[href="#register-form"]'));
    out.push(linkParagraph(document, form, cta || 'Register'));
  }
  return out.length ? out : flatten(document, element);
}

/** Event content v2 (title + text behind "Read more") → title + all content; toggle dropped. */
function eventContent([element], ctx) {
  const { document } = ctx;
  const out = keepTag(document, element.querySelector('[class*="__title"]'));
  out.push(...richText(document, element.querySelector('[class*="__content"]') || element));
  return out;
}

/** Target of a register button: the Pardot URL of the page's registration form (modal on the source). */
function registerHref(document, href) {
  const m = (href || '').match(/^:event-registration-form-(.+):$/);
  if (!m) return href;
  return formUrl(document.querySelector(`.block-event-registration-form[data-form-id="${m[1]}"]`)) || '';
}

/** Event register bar: label + button → paragraph + link paragraph. */
function eventRegister([element], ctx) {
  const { document } = ctx;
  const out = keepTag(document, element.querySelector('[class*="__label"]'));
  const cta = pick(element, 'a[class*="__desktop-button"]', 'a[href]');
  const href = cta && registerHref(document, cta.getAttribute('href'));
  // the button label is its first text; in the import browser the mobile link (repeating the
  // label of the bar) ends up inside the desktop button
  let label = '';
  if (cta) {
    const walker = document.createTreeWalker(cta, 4);
    for (let n = walker.nextNode(); n && !label; n = walker.nextNode()) label = n.textContent.replace(/\s+/g, ' ').trim();
  }
  if (href && label) out.push(linkParagraph(document, href, label));
  return out;
}

/** Event registration form (modal): image, title, venue / date / time, form link. */
function eventRegistrationForm([element], ctx) {
  const { document } = ctx;
  const out = [];
  const img = image(document, element.querySelector('img'));
  const title = element.querySelector('[class*="__title"]');
  if (img) {
    if (!img.alt && title) img.alt = text(title);
    const p = el(document, 'p');
    p.append(img);
    out.push(p);
  }
  out.push(...keepTag(document, title));
  element.querySelectorAll('[class*="__meta"] > *').forEach((item) => {
    const line = text(item);
    const m = line.match(/^([^:\d]{1,30}):\s*(.+)$/);
    if (m) out.push(labelled(document, m[1].trim(), m[2].trim()));
    else if (line) out.push(el(document, 'p', line));
  });
  const form = formUrl(element);
  if (form) out.push(linkParagraph(document, form, 'Register'));
  return out;
}

// ---------------------------------------------------------------- page intros and statements

/** Title (+ subtitle / text) intros: tags kept (h1–h6 or p), accent words → <em>. */
function titleAndText(element, ctx, titleSel, textSel) {
  const { document } = ctx;
  const out = keepTag(document, element.querySelector(titleSel));
  element.querySelectorAll(textSel).forEach((t) => out.push(...keepTag(document, t)));
  return out.length ? out : flatten(document, element);
}

const industryIntro = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__subtitle"]');
const titleBlock = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__text"]');
const awardsIntro = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__subtitle"]');
const caseIntroTitle = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__text"]');
const introText = ([e], ctx) => titleAndText(e, ctx, '[class*="__heading"], h1, h2, h3', '[class*="__paragraph"]');
const statement = ([e], ctx) => titleAndText(e, ctx, '[class*="__title"]', '[class*="__text"]');

/** Highlighted statement: title, text, outline button → link paragraph. */
function highlightedStatement([element], ctx) {
  const out = titleAndText(element, ctx, '[class*="__title"]', '[class*="__text"]');
  const cta = element.querySelector('a[class*="__cta"]');
  if (cta && cta.getAttribute('href') && text(cta)) out.push(linkParagraph(ctx.document, cta.getAttribute('href'), text(cta)));
  return out;
}

/** Post header (dark band with page title): h1; back link kept when it is a real link. */
function postHeader([element], ctx) {
  const { document } = ctx;
  const out = [];
  const back = element.querySelector('a[class*="back"]');
  if (back && back.getAttribute('href')) out.push(linkParagraph(document, back.getAttribute('href'), text(back) || 'Back'));
  const h1 = pick(element, 'h1', '[class*="__heading"]');
  if (h1) out.push(el(document, 'h1', text(h1)));
  return out.length ? out : flatten(document, element);
}

/**
 * Text block hero (awards / service pages): bold first title line → heading (h1 when the page
 * has no other h1; bold inside headings does not survive the import), further title lines
 * (category) and the text → paragraphs.
 */
function textBlockHero([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = element.querySelector('[class*="__title"]');
  if (title && text(title)) {
    const main = document.querySelector('main') || document.body;
    const hasH1 = [...main.querySelectorAll('h1')].some((h) => !element.contains(h));
    inline(document, title, 'p').innerHTML.split(/(?:\s*<br\s*\/?>\s*)+/i).forEach((html) => {
      const p = el(document, 'p');
      p.innerHTML = html;
      if (!text(trimBreaks(p))) return;
      out.push(out.length ? p : el(document, hasH1 ? 'h2' : 'h1', text(p)));
    });
  }
  // the text is set in an h6 on the source, but it is body copy: paragraphs
  element.querySelectorAll('[class*="__text"]').forEach((t) => {
    out.push(...splitBreaks(document, [inline(document, t, 'p')]));
  });
  return out.length ? out : flatten(document, element);
}

/** Typography (loose caption / paragraph between article parts) → paragraph with its links. */
function typography([element], ctx) {
  if (element.querySelector('p, div, h1, h2, h3, h4, h5, h6, ul, ol, img')) return richText(ctx.document, element);
  return keepTag(ctx.document, element);
}

export const HANDLERS = {
  'whitepaper-intro': { handler: whitepaperIntro },
  'event-intro': { handler: eventIntro },
  'event-info': { handler: eventInfo },
  'event-content-v2': { handler: eventContent },
  'event-register': { handler: eventRegister },
  'event-registration-form': { handler: eventRegistrationForm },
  'post-header': { handler: postHeader },
  'post-header-variant-2': { handler: postHeader, style: 'dept-post-header' },
  'text-block-hero': { handler: textBlockHero },
  'awards-intro': { handler: awardsIntro },
  'industry-intro': { handler: industryIntro },
  'title-block': { handler: titleBlock },
  'highlighted-statement': { handler: highlightedStatement },
  // the source "align--center" option does not move the (left-aligned) text: not kept
  statement: { handler: statement, style: 'dept-statement, dept-statement-v1' },
  'intro-text': { handler: introText },
  typography: { handler: typography },
  'case-intro-title': { handler: caseIntroTitle },
};
