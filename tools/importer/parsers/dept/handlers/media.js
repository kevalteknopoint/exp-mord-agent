/* eslint-disable */
/* global WebImporter */

/**
 * dept.global component handlers (media group), merged into HANDLERS in ../components.js.
 * Everything here becomes default content; the section styles (styles/dept-pages-parts/media.css)
 * give it the layout of the source: inline or full-bleed media, two media side by side,
 * text + media columns and CTA bars.
 */
import { text, pick, el, flatten, linkParagraph } from '../utils.js';
import {
  heading, mediaAndContent, HANDLERS as ALL,
} from '../components.js';

/** Removes leading/trailing <br>s of the paragraphs (the source pads its lines with them). */
function trimBreaks(nodes) {
  nodes.forEach((n) => {
    if (n.nodeType !== 1 || !/^(P|H[1-6])$/.test(n.tagName)) return;
    const edge = (first) => (first ? n.firstChild : n.lastChild);
    let x = edge(true);
    while (x && ((x.nodeType === 1 && x.tagName === 'BR') || (x.nodeType === 3 && !x.textContent.trim()))) {
      x.remove();
      x = edge(true);
    }
    x = edge(false);
    while (x && ((x.nodeType === 1 && x.tagName === 'BR') || (x.nodeType === 3 && !x.textContent.trim()))) {
      x.remove();
      x = edge(false);
    }
  });
  return nodes.filter((n) => n.nodeType !== 1 || text(n) || n.querySelector('img, picture') || n.matches('table, hr'));
}

/** Single image / player → default content (image paragraph or video-embed block). */
function media(elements, ctx) {
  return elements.flatMap((e) => mediaAndContent(e, ctx));
}

/** Two media side by side → two media paragraphs (grid in the section style). */
function panelTwoMedia([element], ctx) {
  const columns = [...element.querySelectorAll('[class*="__column"]')];
  if (!columns.length) return mediaAndContent(element, ctx);
  return columns.flatMap((c) => mediaAndContent(c, ctx));
}

/** Heading (accent words → em), title-case tags of the source kept within h2–h6. */
function titleOf(document, node, fallbackTag = 'h2') {
  if (!node || !text(node)) return null;
  const tag = /^H[2-6]$/.test(node.tagName) ? node.tagName.toLowerCase() : fallbackTag;
  // <br> in source titles → one line of text
  const clone = node.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return heading(document, clone, tag);
}

/** CTA button of a component → link paragraph */
function ctaOf(document, element, selector = 'a.cta-button, a.btn, a[class*="__cta"], a[class*="__btn"]') {
  const a = element.querySelector(selector);
  return a && a.href && text(a) ? linkParagraph(document, a.href, text(a)) : null;
}

/**
 * Text + media components (oversized-image, media-with-text): title, text, CTA and the image,
 * in source order (the image comes first when the source shows it on the left).
 */
function textAndMedia([element], ctx) {
  const { document } = ctx;
  const out = [];
  // eyebrow ("Discover WEB3/DEPT® LABS"; an h2 on the source) → paragraph above the title
  const tag = text(pick(element, '[class*="__tag"]'));
  if (tag) out.push(el(document, 'p', tag));
  const title = titleOf(document, pick(element, '[class*="__title"]', 'h1, h2, h3, h4'));
  if (title) out.push(title);
  element.querySelectorAll('p[class*="__subtitle"], p[class*="__paragraph"], p[class*="__text"]').forEach((p) => {
    out.push(...flatten(document, p));
  });
  const cta = ctaOf(document, element);
  if (cta) out.push(cta);
  const imageWrap = pick(element, '.image-wrap', '.plyr, .video, video');
  if (!imageWrap) return out.length ? out : flatten(document, element);
  const mediaNodes = mediaAndContent(imageWrap, ctx);
  // media-with-text: image on the left unless switched; oversized-image: image below the text
  const imageFirst = element.matches('[class*="media-with-text"]') && !element.classList.contains('is-switched');
  return trimBreaks(imageFirst ? [...mediaNodes, ...out] : [...out, ...mediaNodes]);
}

/** Title left, text right → heading + paragraphs (two columns in the section style). */
function titleLeftBodyRight([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="__title"]'));
  if (title) out.push(title);
  element.querySelectorAll('p').forEach((p) => out.push(...flatten(document, p)));
  return trimBreaks(out);
}

/** CTA bar (call-to-action): one centred line of text, links kept. */
function callToAction([element], ctx) {
  return trimBreaks(flatten(ctx.document, element));
}

/** Footer-top / routing-banner: heading, optional text, CTA link. */
function ctaBar([element], ctx) {
  const { document } = ctx;
  const out = [];
  const title = titleOf(document, pick(element, '[class*="__heading"]', '[class*="__title"]', 'h2, h3'));
  if (title) out.push(title);
  element.querySelectorAll('p[class*="__subtitle"], p[class*="__text"]').forEach((p) => out.push(...flatten(document, p)));
  const cta = ctaOf(document, element);
  if (cta) out.push(cta);
  return trimBreaks(out.length ? out : flatten(document, element));
}

/** Routing extras: per column a linked title (h3) and its text. */
function routingExtras([element], ctx) {
  const { document } = ctx;
  const columns = [...element.querySelectorAll('[class*="__left-column"], [class*="__right-column"]')];
  if (!columns.length) return flatten(document, element);
  return columns.flatMap((column) => {
    const out = [];
    const link = column.querySelector('a[href]');
    const title = column.querySelector('[class*="__title"]');
    if (title && text(title)) {
      const h3 = el(document, 'h3');
      const a = el(document, 'a');
      a.href = link ? link.href : '';
      title.childNodes.forEach((n) => {
        if (n.nodeType === 1 && n.matches('strong, b')) a.append(el(document, 'strong', text(n)));
        else a.append(n.textContent.replace(/\s+/g, ' '));
      });
      a.innerHTML = a.innerHTML.trim();
      h3.append(link ? a : a.textContent);
      out.push(h3);
    }
    column.querySelectorAll('p[class*="__text"]').forEach((p) => out.push(...flatten(document, p)));
    return out;
  });
}

/** Heading id as generated by AEM (github-slugger): lowercase, punctuation dropped, spaces → "-". */
const slug = (value) => value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');

/**
 * Careers sub navigation: the in-page anchors as a link list, then the sticky CTA.
 * The source anchors are the ids of the "wrapper" components; EDS sections carry no id, so each
 * link targets the id of the first heading of its wrapper.
 */
function vacancySubnav([element], ctx) {
  const { document } = ctx;
  const anchors = [...document.querySelectorAll('main .wrapper[id][data-anchor-text]')];
  const labels = [...element.querySelectorAll('[class*="__link"]')].map(text).filter(Boolean);
  const out = [];
  if (labels.length) {
    const ul = el(document, 'ul');
    labels.forEach((label) => {
      const target = anchors.find((w) => text({ textContent: w.getAttribute('data-anchor-text') }) === label);
      const li = el(document, 'li');
      if (target) {
        const a = el(document, 'a', label);
        const h = target.querySelector('h1, h2, h3, h4, h5, h6');
        const clone = h && h.cloneNode(true);
        if (clone) clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
        a.href = `#${clone && text(clone) ? slug(text(clone)) : target.id}`;
        li.append(a);
      } else {
        li.textContent = label;
      }
      ul.append(li);
    });
    out.push(ul);
  }
  const cta = ctaOf(document, element);
  if (cta) out.push(cta);
  return out;
}

/** Rich text: title (left) + items (right) → default content (two columns in the section style). */
function richText([element], ctx) {
  const { document } = ctx;
  const out = [];
  // eyebrow above the title ("Our approach to …"; an h3 on the source) → paragraph
  const subhead = text(pick(element, '[class*="__left-content"] [class*="__subhead"]'));
  if (subhead) out.push(el(document, 'p', subhead));
  const title = titleOf(document, pick(element, '[class*="__left-content"] [class*="__title"]', '[class*="__left-content"] h2, [class*="__left-content"] h3'));
  if (title) out.push(title);
  const content = pick(element, '[class*="__content"]:not([class*="__left-content"])') || element;
  content.querySelectorAll('[class*="__item-inner"]').forEach((item) => {
    const cta = item.querySelector('a.cta-button');
    if (cta && !text(item).replace(text(cta), '').trim()) {
      if (cta.href) out.push(linkParagraph(document, cta.href, text(cta)));
    } else {
      out.push(...flatten(document, item));
    }
  });
  return out.length ? out : flatten(document, element);
}

/** Inner component of a careers "wrapper" (anchor container). */
const innerOf = (node) => node.firstElementChild || node;
const nameOf = (node) => {
  const classes = [...node.classList];
  const blockClass = classes.find((c) => c.startsWith('block-'));
  if (blockClass) return blockClass.replace(/^block-/, '').replace(/__.*$/, '');
  return (classes[0] || node.tagName.toLowerCase()).replace(/__.*$/, '');
};

/** Wrapper: run the handler of the wrapped component (fallback: default content). */
function wrapper(elements, ctx) {
  return elements.flatMap((element) => {
    const inner = innerOf(element);
    const def = ALL[nameOf(inner)];
    if (inner !== element && def && def.handler) return def.handler([inner], ctx);
    return mediaAndContent(inner, ctx);
  });
}

/** Section style of a wrapper: the style of the wrapped component. */
function wrapperStyle(node) {
  const inner = innerOf(node);
  const name = nameOf(inner);
  const def = ALL[name] || {};
  if (inner === node) return 'dept-wrapper';
  const style = (typeof def.style === 'function' ? def.style(inner) : def.style) || `dept-${name}`;
  // the importer reads the source theme from the wrapper (none): take it from the wrapped component
  const m = inner.className.match(/(?:__theme|background-color|__color)--([a-zA-Z]+)\b/);
  const color = m && m[1].toLowerCase();
  if (!color || color === 'white') return style;
  const dark = ['onyxgrey', 'richblack', 'black', 'darkgrey', 'charcoal'].includes(color);
  return `${style}, dept-bg-${color}${dark ? ', dept-dark' : ''}`;
}

/** Panel variants: square images (is-square), framed (padded) left/right column (is-framed). */
function panelTwoMediaStyle(node) {
  const styles = ['dept-panel-two-media'];
  if (node.classList.contains('is-square')) styles.push('dept-panel-square');
  if (node.querySelector('[class*="__left"].is-framed')) styles.push('dept-panel-framed-left');
  if (node.querySelector('[class*="__right"].is-framed')) styles.push('dept-panel-framed-right');
  return styles.join(', ');
}

/** Rich text: the source theme sits in data-theme (the importer reads class names only). */
function richTextStyle(node) {
  const theme = (node.getAttribute('data-theme') || '').toLowerCase();
  if (!theme || theme === 'white') return 'dept-rich-text';
  const dark = ['onyxgrey', 'richblack', 'black', 'darkgrey', 'charcoal'].includes(theme);
  return `dept-rich-text, dept-bg-${theme}${dark ? ', dept-dark' : ''}`;
}

export const HANDLERS = {
  image: { handler: media },
  'image-wrap': { handler: media, style: 'dept-image' },
  div: { handler: media, style: 'dept-image' },
  'full-width-image': { handler: media },
  'panel-two-media': { handler: panelTwoMedia, style: panelTwoMediaStyle },
  'oversized-image': { handler: textAndMedia },
  'media-with-text': { handler: textAndMedia },
  'title-left-body-right': { handler: titleLeftBodyRight },
  wrapper: { handler: wrapper, style: wrapperStyle },
  'call-to-action': { handler: callToAction },
  'footer-top': { handler: ctaBar },
  'routing-banner': { handler: ctaBar },
  'routing-extras': { handler: routingExtras },
  'vacancy-subnav': { handler: vacancySubnav },
  'rich-text': { handler: richText, style: richTextStyle },
};
