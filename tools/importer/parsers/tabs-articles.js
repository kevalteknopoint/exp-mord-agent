/* eslint-disable */
/* global WebImporter */

/**
 * Parser: tabs-articles
 * Base block: tabs (blocks/idfc/tabs-articles)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .manage-your-finance .home-blog-tab-content
 * Generated: 2026-10-12
 *
 * UE model (tabs-articles-item): tab | image (+imageAlt collapsed) | text
 * One row per article: tab label | image | h3 title link + "date | read time" paragraph.
 * One row per tab for its Know More link: tab label | (empty) | link.
 *
 * Source (block-context/tabs-articles/source.html + related.html):
 *   tab labels: previous sibling .home-blog-links #blog-tab button.nav-link (outside the
 *               block; live buttons carry data-tab="<pane id>", fallback = same index)
 *   .tab-pane#<id> .embla__slide .home-carousel-2-carousel-item
 *       img.lozad (real URL in data-src)  -> image
 *       h3.home-carousel-2-item-heading   -> title (linked to a.blog-action href)
 *       .home-carousel-2-item-date        -> date | read time
 *   .tab-pane > a.home-carousel-2-knowMore -> tab's Know More link
 * The .home-blog-links nav is consumed and removed.
 */
const PLACEHOLDER = /loader\.(jpg|png|gif)|^data:|19873fe2a58527d55d1ccd2cddb3ea00/i;

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function hinted(document, field, nodes) {
  const list = nodes.filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function resolveImage(img, document) {
  if (!img) return null;
  const dataSrc = img.getAttribute('data-src') || '';
  const src = img.getAttribute('src') || '';
  const url = (dataSrc && !PLACEHOLDER.test(dataSrc)) ? dataSrc : (!PLACEHOLDER.test(src) ? src : '');
  if (!url) return null;
  const out = document.createElement('img');
  out.src = url;
  out.alt = /loader\.jpg/i.test(img.getAttribute('alt') || '') ? '' : clean(img.getAttribute('alt'));
  return out;
}

export default function parse(element, { document }) {
  const doc = element.ownerDocument || document;

  // --- tab labels (outside the block) ---
  let nav = element.previousElementSibling;
  if (!nav || !nav.matches('.home-blog-links')) {
    nav = (element.parentElement && element.parentElement.querySelector('.home-blog-links'))
      || doc.querySelector('.manage-your-finance .home-blog-links');
  }
  const buttons = nav ? [...nav.querySelectorAll('button.nav-link, .nav-link')] : [];
  const labelById = new Map();
  buttons.forEach((b) => {
    const id = b.getAttribute('data-tab') || (b.getAttribute('data-bs-target') || '').replace(/^#/, '')
      || b.getAttribute('aria-controls');
    if (id) labelById.set(id, clean(b.textContent));
  });

  const panes = [...element.querySelectorAll(':scope > .tab-pane')];
  const cells = [];

  panes.forEach((pane, i) => {
    const label = labelById.get(pane.id) || (buttons[i] ? clean(buttons[i].textContent) : '') || pane.id;
    const tabCell = () => hinted(document, 'tab', [document.createTextNode(label)]);

    const seen = new Set();
    pane.querySelectorAll('.home-carousel-2-carousel-item').forEach((item) => {
      const titleEl = item.querySelector('.home-carousel-2-item-heading, h3');
      const title = clean(titleEl && titleEl.textContent);
      const href = item.querySelector('a.blog-action[href], a[href]')?.getAttribute('href') || '';
      if (!title || seen.has(`${title}|${href}`)) return;
      seen.add(`${title}|${href}`);

      const img = resolveImage(item.querySelector('img'), document);
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.appendChild(a);
      } else {
        h3.textContent = title;
      }
      const dateText = clean(item.querySelector('.home-carousel-2-item-date')?.textContent);
      let dateP = null;
      if (dateText) {
        dateP = document.createElement('p');
        dateP.textContent = dateText;
      }
      cells.push([tabCell(), hinted(document, 'image', [img]), hinted(document, 'text', [h3, dateP])]);
    });

    const more = pane.querySelector(':scope > a.home-carousel-2-knowMore[href], a.home-carousel-2-knowMore[href]');
    if (more) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = more.getAttribute('href');
      a.textContent = clean(more.textContent) || 'Know More';
      p.appendChild(a);
      cells.push([tabCell(), '', hinted(document, 'text', [p])]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (nav) nav.remove();

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-articles', cells });
  element.replaceWith(block);
}
