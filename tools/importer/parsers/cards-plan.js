/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-plan. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selectors: .coveragecardcontainer.content-center, .categorypage-fourcards.coveragecardcontainer
 *
 * Model (cards-plan-item): text | disclaimer -> one row per card, 2 columns
 * Validated selectors (source.html):
 *   .coverage-cards (one per card) > .cmp-container > .leadproxyteaser .cmp-teaser + .leadproxytext .cmp-text
 *   .cmp-teaser__description span.pretitle / span.title / ul / span.black_text / p > a (Know More)
 *   a.cmp-teaser__action-link (Buy Now / Know More)
 * Ignored: section.new-hp-tickerinfo-sec (hidden info popup), checklist tick <img> icons.
 */
function hinted(document, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function linkPara(document, src) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = src.getAttribute('href');
  a.textContent = src.textContent.trim();
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.coverage-cards')];
  if (!cards.length) cards = [...element.querySelectorAll('.cmp-teaser')].map((t) => t.closest('.cmp-container') || t);

  const cells = [];
  cards.forEach((card) => {
    const teaser = card.querySelector('.cmp-teaser');
    if (!teaser) return;
    const desc = teaser.querySelector('.cmp-teaser__description');
    const text = [];

    if (desc) {
      [...desc.children].forEach((child) => {
        if (child.tagName === 'UL' || child.tagName === 'OL') {
          const list = document.createElement(child.tagName.toLowerCase());
          child.querySelectorAll(':scope > li').forEach((li) => {
            const nli = document.createElement('li');
            [...li.childNodes].forEach((n) => { if (!(n.nodeType === 1 && n.tagName === 'IMG')) nli.append(n.cloneNode(true)); });
            list.append(nli);
          });
          text.push(list);
          return;
        }
        if (!child.textContent.trim()) return;
        if (child.querySelector('span.title')) {
          const h = document.createElement('h3');
          h.textContent = child.textContent.trim();
          text.push(h);
          return;
        }
        const a = child.querySelector('a[href]');
        if (a && child.textContent.trim() === a.textContent.trim()) {
          text.push(linkPara(document, a));
          return;
        }
        const p = document.createElement('p');
        const inner = child.querySelector('span.pretitle, span.black_text');
        p.append(...[...(inner || child).childNodes].map((n) => n.cloneNode(true)));
        text.push(p);
      });
    }

    teaser.querySelectorAll('.cmp-teaser__action-container a[href]').forEach((a) => text.push(linkPara(document, a)));

    const disclaimer = [...card.querySelectorAll('.leadproxytext .cmp-text > *')].filter((n) => n.textContent.trim());

    if (!text.length && !disclaimer.length) return;
    cells.push([hinted(document, 'text', text), hinted(document, 'disclaimer', disclaimer)]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-plan', cells });
  element.replaceWith(block);
}
