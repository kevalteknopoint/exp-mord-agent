/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-apply-now
 * Base block: cards (blocks/idfc/cards-apply-now)
 * Source: https://www.idfcfirst.bank.in/
 * Selector: .apply-now.aem-GridColumn .apply-now-container
 * Generated: 2026-10-12
 *
 * UE model:
 *   block (cards-apply-now): trigger_image + trigger_label (grouped, one row) | text (row)
 *   item (cards-apply-now-item): image (+imageAlt collapsed) | text (product link, NEW tag as <em>)
 *
 * Source (block-context/cards-apply-now/source.html):
 *   a#apply-now (img + "Select a Product")        -> trigger image + label
 *   .apply-now-content > h2, p                    -> panel heading + paragraph
 *   .apply-now-content ul > li > a                -> one product per li:
 *       first img = icon, strong = name (+ span "NEW"), last img = decorative arrow (dropped)
 */
export default function parse(element, { document }) {
  const trigger = element.querySelector('a#apply-now, a.apply-now');
  const content = element.querySelector('.apply-now-content') || element;
  const heading = content.querySelector(':scope > h2, :scope > h3, :scope > .h2');
  const intro = content.querySelector(':scope > p');

  const cells = [];

  // Row 1: trigger (grouped trigger_image + trigger_label)
  const triggerCell = document.createDocumentFragment();
  if (trigger) {
    const tImg = trigger.querySelector('img');
    const tLabel = trigger.textContent.replace(/\s+/g, ' ').trim();
    if (tImg) {
      triggerCell.appendChild(document.createComment(' field:trigger_image '));
      triggerCell.appendChild(tImg);
    }
    if (tLabel) {
      triggerCell.appendChild(document.createComment(' field:trigger_label '));
      const p = document.createElement('p');
      p.textContent = tLabel;
      triggerCell.appendChild(p);
    }
  }
  cells.push([triggerCell]);

  // Row 2: panel heading + paragraph
  const textCell = document.createDocumentFragment();
  if (heading || intro) {
    textCell.appendChild(document.createComment(' field:text '));
    if (heading) textCell.appendChild(heading);
    if (intro) textCell.appendChild(intro);
  }
  cells.push([textCell]);

  // Product rows: iterate the <li> wrappers (not the anchors)
  const items = [...content.querySelectorAll('ul > li')];
  items.forEach((li) => {
    const a = li.querySelector('a[href]');
    if (!a) return;
    const imgs = [...a.querySelectorAll('img')];
    const icon = imgs.find((img) => !/arrow/i.test(img.getAttribute('alt') || '')) || null;
    const nameEl = a.querySelector('strong') || a;

    // the NEW tag is a class-less span (may already be unwrapped by the pipeline)
    let tag = '';
    const tagSpan = nameEl.querySelector('span');
    if (tagSpan) {
      tag = tagSpan.textContent.trim();
      tagSpan.remove();
    }
    let name = nameEl.textContent.replace(/\s+/g, ' ').trim();
    if (!tag) {
      const m = name.match(/^(.*\S)\s+(NEW)$/);
      if (m) {
        name = m[1];
        tag = m[2];
      }
    }
    if (!name) return;

    const imageCell = document.createDocumentFragment();
    if (icon) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(icon);
    }

    const itemText = document.createDocumentFragment();
    itemText.appendChild(document.createComment(' field:text '));
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = name;
    p.appendChild(link);
    if (tag) {
      p.appendChild(document.createTextNode(' '));
      const em = document.createElement('em');
      em.textContent = tag;
      p.appendChild(em);
    }
    itemText.appendChild(p);

    cells.push([imageCell, itemText]);
  });

  if (!heading && cells.length <= 2) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-apply-now', cells });
  element.replaceWith(block);
}
