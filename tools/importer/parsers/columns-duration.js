/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-duration. Base: columns.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .life-cover.ta-container
 *
 * Columns block (xwalk): 1 row x 2 columns, no field hints.
 *   col 1: heading + check list + CTA link
 *   col 2: intro heading + comparison tiles (h4 badge "Cover till N years of age", icon, amount, label, price)
 * Validated selectors (source.html):
 *   col 1: .life-cover > .cmp-container > .leadproxyteaser .cmp-teaser__description (h5 + p items with tick img),
 *          a.cmp-teaser__action-link
 *   col 2: .leadproxytext .cmp-text h5 (intro), tile pairs inside nested .container:
 *          .leadproxyteaser .cmp-teaser__description p (badge) + .leadproxyv2teaser (img, h3.cmp-teaser__title,
 *          .cmp-teaser__description p)
 * The trailing .customizecta "Buy Now" repeats the column-1 CTA (same href) and is not duplicated.
 */
function clean(t) {
  return (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function linkPara(document, src) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = src.getAttribute('href');
  a.textContent = clean(src.textContent);
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  const root = element.querySelector(':scope > .cmp-container') || element;
  const introTeaser = root.querySelector(':scope > .leadproxyteaser .cmp-teaser') || element.querySelector('.cmp-teaser');

  // Column 1
  const col1 = [];
  let primaryHref = '';
  if (introTeaser) {
    const desc = introTeaser.querySelector('.cmp-teaser__description');
    if (desc) {
      const ul = document.createElement('ul');
      [...desc.children].forEach((c) => {
        if (/^H[1-6]$/.test(c.tagName)) {
          const h = document.createElement('h3');
          h.textContent = clean(c.textContent);
          col1.push(h);
        } else if (clean(c.textContent)) {
          const li = document.createElement('li');
          [...c.childNodes].forEach((n) => { if (!(n.nodeType === 1 && n.tagName === 'IMG')) li.append(n.cloneNode(true)); });
          ul.append(li);
        }
      });
      if (ul.children.length) col1.push(ul);
    }
    const cta = introTeaser.querySelector('a.cmp-teaser__action-link, .cmp-teaser__action-container a[href]');
    if (cta) { primaryHref = cta.getAttribute('href'); col1.push(linkPara(document, cta)); }
  }

  // Column 2
  const col2 = [];
  const intro = element.querySelector('.leadproxytext .cmp-text h1, .leadproxytext .cmp-text h2, .leadproxytext .cmp-text h3, .leadproxytext .cmp-text h4, .leadproxytext .cmp-text h5');
  if (intro) {
    const h = document.createElement('h3');
    h.textContent = clean(intro.textContent);
    col2.push(h);
  }
  const tiles = [...element.querySelectorAll('.cmp-container')].filter((c) => c.querySelector(':scope > .leadproxyv2teaser'));
  tiles.forEach((tile) => {
    const badgeSrc = tile.querySelector(':scope > .leadproxyteaser .cmp-teaser__description');
    const badge = document.createElement('h4');
    badge.textContent = clean(badgeSrc ? badgeSrc.textContent : '') || 'Cover';
    col2.push(badge);
    const v2 = tile.querySelector(':scope > .leadproxyv2teaser .cmp-teaser');
    if (!v2) return;
    const img = v2.querySelector('.cmp-teaser__image img');
    const src = img && (img.getAttribute('src') || img.getAttribute('data-src'));
    if (src) {
      const p = document.createElement('p');
      const ni = document.createElement('img');
      ni.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
      ni.alt = img.getAttribute('alt') || '';
      p.append(ni);
      col2.push(p);
    }
    const amount = v2.querySelector('.cmp-teaser__title');
    if (amount && clean(amount.textContent)) {
      const p = document.createElement('p');
      const s = document.createElement('strong');
      s.textContent = clean(amount.textContent);
      p.append(s);
      col2.push(p);
    }
    v2.querySelectorAll('.cmp-teaser__description > *').forEach((p) => {
      if (clean(p.textContent)) col2.push(p);
    });
  });
  // any extra CTA that is not a duplicate of the column-1 CTA
  element.querySelectorAll('.customizecta a[href], .get-qoute-btn a[href]').forEach((a) => {
    if (a.getAttribute('href') !== primaryHref) col2.push(linkPara(document, a));
  });

  if (!col1.length && !col2.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[col1, col2]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-duration', cells });
  element.replaceWith(block);
}
