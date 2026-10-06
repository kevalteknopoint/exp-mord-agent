/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-illustration. Base: tabs.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .benefits-ills-pure-protection-container .tabs.panelcontainer
 *
 * Model (tabs-illustration-item): title | persona_image + persona_text | timeline_image1..3 + timeline_text
 *   -> one row per tab, 3 columns (grouped persona_* / timeline_* fields share a cell)
 * Validated selectors (source.html):
 *   ol.cmp-tabs__tablist > li.cmp-tabs__tab, .cmp-tabs__tabpanel,
 *   .benefits-ills-main-image img, .benefits-ills-card-title h4, .benefits-ills-userdetails-section > p,
 *   ul.benefits-ills-user-details li .userdetails-text p,
 *   .benefits-ills-swiper-wrapper .cmp-teaser (.cmp-teaser__image img, .cmp-teaser__pretitle,
 *   .cmp-teaser__description h4/p), .button a.cmp-button
 * Images are lazy-loaded (lozad): src falls back to data-src.
 */
function imgFrom(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
  if (!src) return null;
  const out = document.createElement('img');
  // content SVGs (avatars) must stay images: html2md turns any src ending in .svg into an :icon:
  out.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

export default function parse(element, { document }) {
  const tabs = [...element.querySelectorAll('.cmp-tabs__tablist > .cmp-tabs__tab, [role="tab"]')];
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')];

  const cells = [];
  panels.forEach((panel, i) => {
    const label = tabs[i] ? tabs[i].textContent.trim() : '';
    const titleEl = panel.querySelector('.benefits-ills-card-title h4, .benefits-ills-card-title h3, .benefits-ills-card-title h2');

    // Title cell
    const titleCell = document.createDocumentFragment();
    const titleText = label || (titleEl && titleEl.textContent.trim()) || '';
    if (titleText) {
      titleCell.append(document.createComment(' field:title '), document.createTextNode(titleText));
    }

    // Persona cell
    const personaCell = document.createDocumentFragment();
    const avatar = imgFrom(document, panel.querySelector('.benefits-ills-main-image img'));
    if (avatar) personaCell.append(document.createComment(' field:persona_image '), avatar);
    const personaText = [];
    if (titleEl) {
      const h = document.createElement('h4');
      h.textContent = titleEl.textContent.trim();
      personaText.push(h);
    }
    panel.querySelectorAll('.benefits-ills-userdetails-section > p').forEach((p) => {
      if (p.textContent.trim()) personaText.push(p);
    });
    const details = [...panel.querySelectorAll('.benefits-ills-user-details > li')];
    if (details.length) {
      const ul = document.createElement('ul');
      details.forEach((d) => {
        const li = document.createElement('li');
        const p = d.querySelector('.userdetails-text p') || d;
        [...p.childNodes].forEach((n) => {
          if (n.nodeType === 1 && n.tagName === 'IMG') return;
          if (n.nodeType === 1 && n.classList.contains('defaultSpan')) {
            const s = document.createElement('strong');
            s.textContent = n.textContent.trim();
            li.append(s);
          } else li.append(n.cloneNode(true));
        });
        ul.append(li);
      });
      personaText.push(ul);
    }
    if (personaText.length) {
      personaCell.append(document.createComment(' field:persona_text '));
      personaText.forEach((n) => personaCell.append(n));
    }

    // Timeline cell
    const timelineCell = document.createDocumentFragment();
    const steps = [...panel.querySelectorAll('.benefits-ills-swiper-wrapper .cmp-teaser, .proxyteaser .cmp-teaser')]
      .filter((s, idx, arr) => arr.indexOf(s) === idx);
    const ol = document.createElement('ol');
    steps.forEach((step, idx) => {
      const img = imgFrom(document, step.querySelector('.cmp-teaser__image img'));
      if (img && idx < 3) {
        timelineCell.append(document.createComment(` field:timeline_image${idx + 1} `), img);
      }
      const li = document.createElement('li');
      // steps beyond the 3 model image slots carry their own image inside the list item
      if (img && idx >= 3) {
        const ip = document.createElement('p');
        ip.append(img);
        li.append(ip);
      }
      const pre = step.querySelector('.cmp-teaser__pretitle');
      if (pre && pre.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = pre.textContent.trim();
        li.append(p);
      }
      const desc = step.querySelector('.cmp-teaser__description');
      if (desc) {
        const h = desc.querySelector('h1, h2, h3, h4, h5, h6');
        if (h) {
          const p = document.createElement('p');
          const s = document.createElement('strong');
          s.textContent = h.textContent.trim();
          p.append(s);
          li.append(p);
        }
        desc.querySelectorAll(':scope > p').forEach((p) => { if (p.textContent.trim()) li.append(p); });
      }
      if (li.childNodes.length) ol.append(li);
    });
    const timelineText = [];
    if (ol.children.length) timelineText.push(ol);
    const cta = panel.querySelector('.button a.cmp-button, a.cmp-button');
    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim();
      p.append(a);
      timelineText.push(p);
    }
    if (timelineText.length) {
      timelineCell.append(document.createComment(' field:timeline_text '));
      timelineText.forEach((n) => timelineCell.append(n));
    }

    if (!titleText && !personaText.length && !timelineText.length) return;
    cells.push([
      titleText ? titleCell : '',
      personaCell.childNodes.length ? personaCell : '',
      timelineCell.childNodes.length ? timelineCell : '',
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-illustration', cells });
  element.replaceWith(block);
}
