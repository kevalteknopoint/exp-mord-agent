/* eslint-disable */
/* global WebImporter */

/**
 * Parser: tabs-products
 * Base block: tabs (blocks/idfc/tabs-products)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .product-tabs .home-tab-content
 * Generated: 2026-10-12
 *
 * UE model (tabs-products-item):
 *   tab_label + tab_icon (grouped "tab_" cell) | icon (+iconAlt collapsed) | text | theme
 * One row per product card; the tab icon is set on the first card of each tab only.
 *
 * Source (block-context/tabs-products/source.html + related.html):
 *   tab labels: .homepage-banner nav .nav-tabs#nav-tab button.nav-link (img + label) - lives in
 *               the hero section, read via ownerDocument; live buttons carry data-tab="<pane id>",
 *               fallback = same index. The nav is removed after reading.
 *   .tab-pane#<id> .tab-card > div > .card.<theme-class>
 *       h2.small-heading            -> title (h2)
 *       .big-heading (p or h3)      -> benefit paragraphs
 *       .bottom-control-sec a[href] -> primary (Apply Now / Book Now) + secondary (Know more);
 *                                      javascript: links and duplicate labels are skipped
 *       figure img                  -> card icon
 *   card colour class -> theme select value
 */
const THEME_MAP = {
  'persian-plum-gradient': 'plum',
  'sea-blue-gradient': 'blue',
  'american-blue': 'blue',
  'rich-black': 'black',
  'dark-chocolate': 'chocolate',
  coffee: 'chocolate',
  charm: 'red',
};

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

export default function parse(element, { document }) {
  const doc = element.ownerDocument || document;

  // --- tab labels + icons (outside the block, in the hero section) ---
  const nav = doc.querySelector('.homepage-banner nav .nav-tabs')
    || doc.querySelector('.homepage-banner #nav-tab')
    || doc.querySelector('#nav-tab');
  const buttons = nav ? [...nav.querySelectorAll('button.nav-link, .nav-link')] : [];
  const tabs = buttons.map((b) => {
    const img = b.querySelector('img');
    return {
      id: (b.getAttribute('data-tab') || '').toLowerCase(),
      label: clean(b.textContent),
      icon: img,
    };
  });
  const tabFor = (pane, i) => tabs.find((t) => t.id && t.id === pane.id.toLowerCase()) || tabs[i] || { label: pane.id, icon: null };

  const panes = [...element.querySelectorAll(':scope > .tab-pane')];
  const cells = [];

  panes.forEach((pane, i) => {
    const tab = tabFor(pane, i);
    const cards = [...pane.querySelectorAll('.tab-card .card')];
    let first = true;
    cards.forEach((card) => {
      const titleEl = card.querySelector('.small-heading, h2');
      const title = clean(titleEl && titleEl.textContent);
      const benefits = [...card.querySelectorAll('.big-heading')].map((el) => clean(el.textContent)).filter(Boolean);
      if (!title && !benefits.length) return;

      // tab cell: label (+ icon on the first card of the tab)
      const tabCell = document.createDocumentFragment();
      tabCell.appendChild(document.createComment(' field:tab_label '));
      const labelP = document.createElement('p');
      labelP.textContent = tab.label;
      tabCell.appendChild(labelP);
      if (first && tab.icon) {
        tabCell.appendChild(document.createComment(' field:tab_icon '));
        tabCell.appendChild(tab.icon.cloneNode(true));
      }
      first = false;

      // card icon
      const icon = card.querySelector('figure img') || card.querySelector(':scope > img');

      // text: title, benefits, CTAs
      const textNodes = [];
      if (title) {
        const h2 = document.createElement('h2');
        h2.textContent = title;
        textNodes.push(h2);
      }
      benefits.forEach((b) => {
        const p = document.createElement('p');
        p.textContent = b;
        textNodes.push(p);
      });
      const seenLabels = new Set();
      const links = [...card.querySelectorAll('.bottom-control-sec a[href], a.btn[href], a.know-more[href]')]
        .filter((a, idx, arr) => arr.indexOf(a) === idx)
        .filter((a) => !/^javascript:/i.test(a.getAttribute('href')))
        .filter((a) => {
          const key = clean(a.textContent).toLowerCase();
          if (!key || seenLabels.has(key)) return false;
          seenLabels.add(key);
          return true;
        });
      links.forEach((a, idx) => {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = clean(a.textContent);
        if (idx === 0) {
          const strong = document.createElement('strong');
          strong.appendChild(link);
          p.appendChild(strong);
        } else {
          p.appendChild(link);
        }
        textNodes.push(p);
      });

      // theme from the card colour class
      const themeKey = Object.keys(THEME_MAP).find((cls) => card.classList.contains(cls));
      const theme = themeKey ? THEME_MAP[themeKey] : '';

      cells.push([
        tabCell,
        hinted(document, 'icon', [icon]),
        hinted(document, 'text', textNodes),
        hinted(document, 'theme', [theme ? document.createTextNode(theme) : null]),
      ]);
    });
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (nav) nav.remove();

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-products', cells });
  element.replaceWith(block);
}
