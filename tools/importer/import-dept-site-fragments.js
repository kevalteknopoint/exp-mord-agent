/* eslint-disable */
/* global WebImporter */

/**
 * Locale header + footer fragments for the dept.global site migration (import-dept-site.js).
 * Source: each locale homepage, once per fragment (the bulk importer saves one output per URL):
 *   https://www.dept.global/<locale>/?dept-fragment=nav     → /dept/<locale>/nav
 *     brand | sections ("What we do" flyout groups + links) | tools (search, Contact)
 *   https://www.dept.global/<locale>/?dept-fragment=footer  → /dept/<locale>/footer
 *     7 sections (footer-brand … footer-bottom), same structure as /dept-footer
 * The structure matches /dept-nav and /dept-footer, so header.js / footer.js and styles/dept.css apply.
 * Logos are not linked (Content Sync drops linked images; header.js / footer.js wrap them).
 */
import { localHref, useDamImages, text } from './parsers/dept/utils.js';

const LOCALES = ['de-dach', 'en-au', 'en-dk', 'en-in', 'en-nl', 'en-uki', 'latam', 'macedonia'];

// "Change location" list: loaded by script on the source, identical on every locale
const LOCATIONS = [
  ['https://www.dept.global/', 'Global'],
  ['https://www.dept.global/de-dach/', 'German (DE/CH)'],
  ['https://www.dept.global/en-dk/', 'Nordics (EN)'],
  ['https://www.dept.global/en-nl/', 'Dutch (EN)'],
  ['https://www.dept.global/en-uki/', 'English (UK/IE)'],
  ['https://www.dept.global/latam/', 'Latin America (ES)'],
  ['https://www.dept.global/en-in/', 'India'],
  ['https://www.dept.global/en-au/', 'Australia & Oceania'],
];

function el(document, tag, content) {
  const node = document.createElement(tag);
  if (content !== undefined) node.textContent = content;
  return node;
}

function link(document, href, label) {
  const a = el(document, 'a', label);
  a.href = href;
  return a;
}

function para(document, ...children) {
  const p = el(document, 'p');
  children.forEach((c) => p.append(c));
  return p;
}

function image(document, img, alt) {
  const out = el(document, 'img');
  out.src = img.getAttribute('src');
  out.alt = alt !== undefined ? alt : (img.getAttribute('alt') || '');
  return out;
}

function linkList(document, links) {
  const ul = el(document, 'ul');
  links.forEach((a) => {
    const label = text(a);
    if (!label || !a.getAttribute('href')) return;
    const li = el(document, 'li');
    li.append(link(document, a.getAttribute('href'), label));
    ul.append(li);
  });
  return ul;
}

function sectionMetadata(document, style) {
  return WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells: { style } });
}

/** Header fragment from div.block-navigation (+ the desktop flyout <template>) */
function buildNav(document, homeHref) {
  const out = el(document, 'div');
  const nav = document.querySelector('.block-navigation');
  if (!nav) return null;

  // brand
  const logo = nav.querySelector('.block-navigation__logo img');
  if (logo) out.append(para(document, image(document, logo, 'DEPT®')));
  out.append(para(document, link(document, homeHref, 'DEPT®')));
  out.append(el(document, 'hr'));

  // sections
  const ul = el(document, 'ul');
  nav.querySelectorAll('.block-navigation__items > li').forEach((item) => {
    const li = el(document, 'li');
    const a = item.querySelector(':scope > a');
    if (a) {
      li.append(link(document, a.getAttribute('href'), text(a)));
      ul.append(li);
      return;
    }
    const label = text(item.querySelector('button')) || text(item);
    if (!label) return;
    li.append(document.createTextNode(label));
    const groups = el(document, 'ul');
    const tpl = [...document.querySelectorAll('template')].map((t) => t.content || t)
      .find((c) => c.querySelector && c.querySelector('.block-navigation__desktop-flyout-section'));
    (tpl ? [...tpl.querySelectorAll('.block-navigation__desktop-flyout-section')] : []).forEach((section) => {
      const group = el(document, 'li');
      group.append(document.createTextNode(text(section.querySelector('[class*="section-title"]'))));
      const links = [...section.querySelectorAll('[class*="section-links"] a')];
      const more = section.querySelector('[class*="section-more"]');
      if (more) links.push(more);
      group.append(linkList(document, links));
      groups.append(group);
    });
    if (groups.children.length) li.append(groups);
    ul.append(li);
  });
  out.append(ul);
  out.append(el(document, 'hr'));

  // tools: search (only where the source header has one) + Contact
  if (nav.querySelector('.block-navigation__search, input[type="search"], form[action*="search"]')) {
    out.append(para(document, link(document, `${homeHref.replace(/\/$/, '')}/search/?query=`, 'Search')));
  }
  const contact = nav.querySelector('.block-navigation__contact, a[href*="/contact"]');
  if (contact) {
    const strong = el(document, 'strong');
    strong.append(link(document, contact.getAttribute('href'), text(contact)));
    out.append(para(document, strong));
  }
  return out;
}

/** Footer fragment from footer.block-footer-v2 */
function buildFooter(document, homeHref) {
  const footer = document.querySelector('footer.block-footer-v2, footer');
  if (!footer) return null;
  const out = el(document, 'div');
  const section = (style, nodes, last) => {
    nodes.filter(Boolean).forEach((n) => out.append(n));
    out.append(sectionMetadata(document, style));
    if (!last) out.append(el(document, 'hr'));
  };

  const logo = footer.querySelector('.block-footer-v2__logo img');
  const locations = el(document, 'ul');
  LOCATIONS.forEach(([href, label]) => {
    const li = el(document, 'li');
    li.append(link(document, href, label));
    locations.append(li);
  });
  section('footer-brand', [
    logo && para(document, image(document, logo, 'DEPT®')),
    para(document, link(document, homeHref, 'Go to DEPT® homepage')),
    el(document, 'p', text(footer.querySelector('.block-footer-v2__location-picker-trigger')) || 'Change location'),
    locations,
  ]);
  section('footer-studios', [linkList(document, [...footer.querySelectorAll('.block-footer-v2__studios a')])]);
  section('footer-pages', [linkList(document, [...footer.querySelectorAll('.block-footer-v2__pages a')])]);
  section('footer-contact', [
    ...[...footer.querySelectorAll('.block-footer-v2__contact-button')].map((a) => para(document, link(document, a.getAttribute('href'), text(a)))),
    linkList(document, [...footer.querySelectorAll('.block-footer-v2__social-networks a')]),
  ]);
  const bcorp = footer.querySelector('.block-footer-v2__bcorp-logo');
  const climate = footer.querySelector('.block-footer-v2__climate-neutral-logo');
  section('footer-certifications', [
    bcorp && para(document, image(document, bcorp, 'Certified B Corporation')),
    climate && para(document, image(document, climate, 'The Climate Label - climate neutral')),
  ]);
  const apparel = footer.querySelector('.block-footer-v2__apparel-container');
  const apparelImg = footer.querySelector('.block-footer-v2__apparel-image');
  section('footer-apparel', [
    apparel && para(document, link(document, apparel.getAttribute('href'), 'DEPT® Apparel')),
    apparelImg && para(document, image(document, apparelImg)),
  ]);
  section('footer-bottom', [
    linkList(document, [...footer.querySelectorAll('.block-footer-v2__bottom-links a')]),
    el(document, 'p', text(footer.querySelector('.block-footer-v2__copyright'))),
  ], true);
  return out;
}

function finish(root) {
  root.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', localHref(a.getAttribute('href'))));
  return useDamImages(root);
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const originalURL = params.originalURL || url;
    const [first] = new URL(originalURL).pathname.split('/').filter(Boolean);
    const locale = LOCALES.includes(first) ? first : '';
    const base = locale ? `/dept/${locale}` : '/dept';
    const homeHref = `https://www.dept.global/${locale ? `${locale}/` : ''}`;

    const fragment = new URL(originalURL).searchParams.get('dept-fragment') === 'footer' ? 'footer' : 'nav';
    const element = fragment === 'footer' ? buildFooter(document, homeHref) : buildNav(document, homeHref);
    if (!element) throw new Error(`no source ${fragment} found`);
    const images = finish(element);
    document.body.innerHTML = '';
    document.body.append(...element.childNodes);
    return [{
      element: document.body,
      path: `${base}/${fragment}`,
      report: { title: `DEPT ${fragment} (${locale || 'global'})`, template: `dept-${fragment}`, images },
    }];
  },
};
