/* eslint-disable */
/* global WebImporter */

/**
 * dept.global component handlers (detail group), merged into HANDLERS in ../components.js.
 * Page headers of the detail pages become the block "Detail Panel": (split) for agencies and
 * offices, (overlay) for downloads, events and partners. Everything below the header is default
 * content in the same section, styled by its section (styles/dept-pages-parts/detail.css).
 * Job pages are default content only (the source header has no image of its own).
 */
import {
  text, pick, el, image, flatten, field, block, linkParagraph,
} from '../utils.js';

const BR_RUN = /(?:\s|&nbsp;)*(?:<br\s*\/?>(?:\s|&nbsp;)*){2,}/i;

/**
 * Listing page of each page type per locale (from the source navigation and sitemap); the
 * back buttons of the detail pages lead there. Default slug, then locale overrides.
 */
const LISTINGS = {
  event: ['all-events', { 'de-dach': 'insights', 'en-in': 'insights', latam: 'dept-insights-descargas-y-eventos' }],
  downloads: ['all-whitepapers', { 'de-dach': 'alle-whitepaper', latam: 'dept-insights-descargas-y-eventos' }],
  agency: ['agency-details', { 'de-dach': 'ueber-uns', 'en-in': 'about-us', latam: 'detalles-de-la-agencia' }],
  office: ['contact-us', { 'de-dach': 'kontakt-bueros', latam: 'contacto' }],
};

/* label of the icon-only back buttons (agency / office pages) */
const BACK_LABEL = { 'de-dach': 'Zurück', latam: 'Volver' };
const DOWNLOAD_LABEL = { 'de-dach': 'Whitepaper herunterladen', latam: 'Descargar' };

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
 * Copy of the inline content of source into a new <tag>: bold → <strong> (not in headings),
 * italics → <em>, links and line breaks kept, every other wrapper unwrapped.
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
      if (n.nodeType !== 1 || n.matches('svg, button, script, style, i.icon')) return;
      if (n.tagName === 'BR') {
        to.append(el(document, 'br'));
        return;
      }
      const wrap = (n.matches('strong, b') && !isHeading && 'strong') || (n.matches('em, i') && 'em')
        || (n.tagName === 'A' && n.getAttribute('href') && 'a');
      if (wrap) {
        const w = el(document, wrap);
        if (wrap === 'a') w.href = n.getAttribute('href');
        walk(n, w);
        if (text(w)) to.append(w);
        return;
      }
      walk(n, to);
    });
  };
  walk(source, out);
  out.innerHTML = out.innerHTML.replace(/\s*<br>\s*/g, '<br>');
  return trimBreaks(out);
}

/** Flattened rich text, paragraphs split at runs of <br><br>. */
function richText(document, source) {
  if (!source) return [];
  const out = [];
  flatten(document, source).forEach((n) => {
    if (n.tagName !== 'P' || n.querySelector('img') || !BR_RUN.test(n.innerHTML)) {
      if (n.tagName === 'P') trimBreaks(n);
      if (text(n) || n.querySelector('img')) out.push(n);
      return;
    }
    n.innerHTML.split(BR_RUN).forEach((part) => {
      const p = el(document, 'p');
      p.innerHTML = part;
      if (text(trimBreaks(p))) out.push(p);
    });
  });
  return out;
}

/** "Label value" line → <p><strong>Label</strong> value</p> */
function labelled(document, label, value) {
  const p = el(document, 'p');
  if (label) {
    p.append(el(document, 'strong', label));
    p.append(' ');
  }
  p.append(value);
  return p;
}

/** Pardot form URL of a form wrapper (iframe src, lazy data-src / data-initial-src). */
function formUrl(node) {
  const iframe = node && node.querySelector('iframe');
  if (!iframe) return '';
  return (iframe.getAttribute('src') || iframe.getAttribute('data-src') || iframe.getAttribute('data-initial-src') || '').trim();
}

/**
 * Back link of a detail header: the source label (or a localized "Back"), pointing at the
 * locale's listing page of the page type (the source buttons only call history.back()).
 */
function backLink(element, ctx, kind) {
  const { document, locale } = ctx;
  const button = element.querySelector('[class*="back-button"], [class*="__btn"][onclick*="history"]');
  // the label span has no class (the import unwraps such spans): the button text is the label
  const label = text(button) || BACK_LABEL[locale] || 'Back';
  // a real source link is kept when it is a clean page path (some are ?page_id= links)
  const href = button && button.tagName === 'A' ? button.getAttribute('href') || '' : '';
  if (href && !href.includes('?')) return linkParagraph(document, href, label);
  const [slug, overrides] = LISTINGS[kind];
  const path = [locale, overrides[locale] || slug].filter(Boolean).join('/');
  return linkParagraph(document, `https://www.dept.global/${path}/`, label);
}

/** Page title as h1 (plain text). */
function title(document, source) {
  return source && text(source) ? el(document, 'h1', text(source)) : null;
}

/** Header image with the page title as alt fallback. */
function headerImage(document, img, h1) {
  const out = image(document, img);
  if (out && !out.alt && h1) out.alt = text(h1);
  return out;
}

function detailPanel(document, variant, img, nodes) {
  return block(document, `Detail Panel (${variant})`, [
    [img ? field(document, 'image', img) : ''],
    [field(document, 'text', nodes.filter(Boolean))],
  ]);
}

/** Cloudflare-obfuscated e-mail ("<key><xored bytes>" in hex) → address. */
function decodeEmail(hex) {
  if (!hex || !/^[0-9a-f]+$/i.test(hex)) return '';
  const key = parseInt(hex.slice(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  try {
    return decodeURIComponent(escape(out));
  } catch (e) {
    return out;
  }
}

/** E-mail address of a (possibly Cloudflare-protected) mail link. */
function emailOf(node) {
  if (!node) return '';
  const a = node.matches('a') ? node : node.querySelector('a');
  const href = (a && a.getAttribute('href')) || '';
  if (href.startsWith('mailto:')) return href.slice(7).split('?')[0];
  const cf = node.querySelector('[data-cfemail]') || (node.matches('[data-cfemail]') ? node : null);
  const hex = (cf && cf.getAttribute('data-cfemail')) || (href.match(/email-protection#([0-9a-f]+)/i) || [])[1];
  const decoded = decodeEmail(hex);
  if (decoded) return decoded;
  return /@/.test(text(node)) ? text(node) : '';
}

// ---------------------------------------------------------------- agency / office (split)

/** Agency: back link, name, description, "Visit website" link | image. */
function agencyDetail([element], ctx) {
  const { document } = ctx;
  const h1 = pick(element, 'h1', '[class*="__heading"]');
  const nodes = [backLink(element, ctx, 'agency'), title(document, h1)];
  element.querySelectorAll('[class*="__text"]').forEach((t) => {
    if (text(t)) nodes.push(inline(document, t, 'p'));
  });
  const cta = element.querySelector('a[class*="__btn"][href]');
  if (cta && text(cta)) nodes.push(linkParagraph(document, cta.getAttribute('href'), text(cta)));
  const img = headerImage(document, element.querySelector('[class*="__image-wrap"] img'), h1);
  return [detailPanel(document, 'split', img, nodes)];
}

/** Office: back link, city, e-mail (decoded), phone, address, "Get in touch" bar (bold link) | image. */
function locationDetail([element], ctx) {
  const { document } = ctx;
  const h1 = pick(element, 'h1', '[class*="__heading"]');
  const nodes = [backLink(element, ctx, 'office'), title(document, h1)];
  const mail = emailOf(element.querySelector('[class*="__mail"]'));
  if (mail) nodes.push(linkParagraph(document, `mailto:${mail}`, mail));
  ['[class*="__phone"]', '[class*="__address"]'].forEach((sel) => {
    const n = element.querySelector(sel);
    if (n && text(n)) nodes.push(inline(document, n, 'p'));
  });
  const cta = element.querySelector('a[class*="cta-bar"][href]');
  if (cta && text(cta)) nodes.push(linkParagraph(document, cta.getAttribute('href'), text(cta.querySelector('[class*="__label"]') || cta), true));
  const img = headerImage(document, element.querySelector('[class*="__image-wrap"] img'), h1);
  return [detailPanel(document, 'split', img, nodes)];
}

// ---------------------------------------------------------------- download / event (overlay)

/** Whitepaper: header block, then "Paper Overview" title + text and the download form link. */
function whitepaperDetail([element], ctx) {
  const { document, locale } = ctx;
  const h1 = pick(element, 'h1', '[class*="__whitepaper-title"]');
  const img = headerImage(document, element.querySelector('[class*="__featured-image-wrap"] img, [class*="__header"] img'), h1);
  const out = [detailPanel(document, 'overlay', img, [backLink(element, ctx, 'downloads'), title(document, h1)])];
  const intro = element.querySelector('[class*="__cta-content-title"]');
  if (intro && text(intro)) out.push(el(document, 'p', text(intro)));
  element.querySelectorAll('[class*="__cta-content-text"]').forEach((t) => out.push(...richText(document, t)));
  const form = formUrl(element.querySelector('[class*="__form"]'));
  if (form) out.push(linkParagraph(document, form, DOWNLOAD_LABEL[locale] || 'Download'));
  return out;
}

/**
 * Event: header block (back link, title | image), then the date / time / location bar,
 * the speakers (portrait + name / role, all of them: the "show all" toggle is dropped),
 * the description and, for upcoming events, the registration form link.
 */
function eventDetails(elements, ctx) {
  const { document } = ctx;
  // the registration drawer (block-event-details__flyout-drawer) is grouped with the details
  const element = elements.find((e) => !e.classList.contains('flyout-drawer'));
  const drawer = elements.find((e) => e.classList.contains('flyout-drawer'))
    || document.querySelector('.block-event-details__flyout-drawer');
  if (!element) return [];
  const h1 = pick(element, 'h1', '[class*="__event-title"]');
  const img = headerImage(document, element.querySelector('[class*="__featured-image-wrap"] img'), h1);
  const out = [detailPanel(document, 'overlay', img, [backLink(element, ctx, 'event'), title(document, h1)])];
  // bar: label / value pairs (the desktop bar; the mobile and flyout copies repeat it)
  const bar = pick(element, '[class*="__content-floating-bar-desktop"]', '[class*="__content-floating-bar-mobile"]');
  if (bar) {
    // the source script rewrites the time into the visitor's time zone: use the UTC times
    const utc = (iso) => {
      const d = new Date(iso || '');
      return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(11, 16);
    };
    const start = utc(element.getAttribute('data-event-start'));
    const end = utc(element.getAttribute('data-event-end'));
    [...bar.querySelectorAll('p[class*="-title"]')].forEach((label) => {
      const value = label.nextElementSibling;
      if (!value || !text(value)) return;
      if (/time-title/.test(label.className) && start) {
        const name = text(label).replace(/\s*\(.*\)\s*$/, '');
        out.push(labelled(document, `${name} (UTC)`, end ? `${start} – ${end}` : start));
      } else {
        out.push(labelled(document, text(label), text(value)));
      }
    });
  }
  element.querySelectorAll('.author').forEach((author) => {
    const portrait = image(document, author.querySelector('img'));
    const lines = author.querySelector('.author__text');
    if (portrait) {
      if (!portrait.alt && lines && lines.firstChild) portrait.alt = lines.firstChild.textContent.trim();
      const p = el(document, 'p');
      p.append(portrait);
      out.push(p);
    }
    if (lines && text(lines)) out.push(inline(document, lines, 'p'));
  });
  out.push(...richText(document, element.querySelector('[class*="__content-details"]')));
  // registration: only when the page shows a register button (upcoming events)
  const trigger = drawer && drawer.getAttribute('data-trigger');
  let button = null;
  try {
    button = trigger ? document.querySelector(trigger) : null;
  } catch (e) { /* not a selector */ }
  const form = formUrl(drawer);
  if (button && form) out.push(linkParagraph(document, form, text(button) || 'Register'));
  return out;
}

// ---------------------------------------------------------------- partner header / form page

/** Partner header: background image, partner logo, title, CTA; the intro line below it. */
function partnerHeader(elements, ctx) {
  const { document } = ctx;
  const out = [];
  elements.forEach((element) => {
    if (element.tagName === 'P') {
      if (text(element)) out.push(inline(document, element, 'p'));
      return;
    }
    const h1 = pick(element, 'h1', '[class*="__title"]');
    const nodes = [];
    const logo = image(document, element.querySelector('img[class*="__partner-logo-img"]'));
    if (logo) {
      if (!logo.alt) logo.alt = `${text(h1).split(' ')[0]} logo`;
      const p = el(document, 'p');
      p.append(logo);
      nodes.push(p);
    }
    nodes.push(title(document, h1));
    const cta = element.querySelector('a[class*="__cta-button"][href]');
    if (cta && text(cta)) nodes.push(linkParagraph(document, cta.getAttribute('href'), text(cta)));
    const img = headerImage(document, element.querySelector('[class*="__image-wrap"]:not([class*="logo"]) img'), h1);
    out.push(detailPanel(document, 'overlay', img, nodes));
  });
  return out;
}

/** Form page: title + link to the Pardot form (labelled by the title). */
function formPage([element], ctx) {
  const { document } = ctx;
  const out = [];
  const t = element.querySelector('[class*="__title"]');
  if (t && text(t)) out.push(el(document, 'h2', text(t)));
  const form = formUrl(element);
  if (form) out.push(linkParagraph(document, form, text(t) || 'Register'));
  return out.length ? out : flatten(document, element);
}

// ---------------------------------------------------------------- job (vacancy) pages

/**
 * Job details (intro, meta and content parts, grouped): overline, title, "Roles open in"
 * cities, department / employment type, the job ad and the apply link. Share icons,
 * breadcrumbs, scroll teaser and the random stock photos of the theme are dropped.
 */
function jobDetails(elements, ctx) {
  const { document } = ctx;
  const out = [];
  elements.forEach((element) => {
    const part = [...element.classList].find((c) => c.startsWith('block-job-details__')) || '';
    if (part.endsWith('__intro')) {
      const overline = element.querySelector('[class*="__overline"]');
      if (overline && text(overline)) out.push(inline(document, overline, 'p'));
      const h1 = title(document, element.querySelector('[class*="__job-name"], h1'));
      if (h1) out.push(h1);
      const cities = element.querySelector('[class*="__cities"]');
      if (cities && text(cities)) {
        const faded = text(cities.querySelector('.is-faded'));
        const label = faded ? text(cities).slice(0, text(cities).length - faded.length).trim() : '';
        out.push(label ? labelled(document, label, faded) : el(document, 'p', text(cities)));
      }
    } else if (part.endsWith('__meta')) {
      element.querySelectorAll('p').forEach((p) => {
        const label = text(p.querySelector('b, strong'));
        const value = text(p).slice(label.length).trim();
        if (value) out.push(labelled(document, label, value));
      });
    } else if (part.endsWith('__content')) {
      const teaser = element.querySelector('[class*="__teaser-headline"]');
      if (teaser && text(teaser)) out.push(el(document, 'h2', text(teaser)));
      const apply = element.querySelector('a[class*="__apply-button"][href]');
      if (apply && text(apply)) out.push(linkParagraph(document, apply.getAttribute('href'), text(apply), true));
      out.push(...richText(document, element.querySelector('[class*="__job-ad"]')));
    } else {
      out.push(...flatten(document, element));
    }
  });
  return out;
}

export const HANDLERS = {
  'panel-agency-detail': { handler: agencyDetail },
  'panel-location-detail': { handler: locationDetail },
  'whitepaper-detail-panel': { handler: whitepaperDetail },
  'event-details': { handler: eventDetails, group: true },
  // intro, meta and content are separate children of <main>: one section
  'job-details': { handler: jobDetails, group: true },
  // the header and its intro line (block-partner-header__cta) are separate children of <main>
  'partner-header': { handler: partnerHeader, group: true },
  'form-page': { handler: formPage },
};
