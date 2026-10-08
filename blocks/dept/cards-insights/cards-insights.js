import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

/* 16x16 type icons (from the source listing cards), drawn in currentColor */
const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">';
const TYPE_ICONS = {
  'case-study': `${SVG_OPEN}<path d="M3.541 13.5a1.16 1.16 0 0 1-.855-.35 1.163 1.163 0 0 1-.35-.854V6.372c0-.336.117-.621.35-.855.233-.233.518-.35.855-.35h.923v-1.41H5.49v1.41h5.051v-1.41h1v1.41h.923c.337 0 .622.117.855.35.234.234.35.519.35.855v5.924c0 .336-.116.621-.35.855-.233.233-.518.35-.855.35H3.541Zm0-1h8.923a.196.196 0 0 0 .141-.063.196.196 0 0 0 .064-.141V9.039H3.336v3.257c0 .05.021.098.064.14.043.043.09.065.141.065Zm-.205-4.46h9.333V6.371a.196.196 0 0 0-.064-.14.196.196 0 0 0-.14-.065H3.54a.196.196 0 0 0-.14.064.196.196 0 0 0-.065.141V8.04Z" fill="currentColor" stroke="currentColor" stroke-width="0.25"/><path d="M4.5 3.8V4h1a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5h1v-.2c0-.69-.56-1.25-1.25-1.25h-4.5c-.69 0-1.25.56-1.25 1.25Z" fill="currentColor"/></svg>`,
  insight: `${SVG_OPEN}<path d="M4.166 11.167h4.333v-1H4.166v1Zm6.667 0h1V4.834h-1v6.333ZM4.166 8.501h4.333v-1H4.166v1Zm0-2.667h4.333v-1H4.166v1Zm-1.295 7.833a1.16 1.16 0 0 1-.855-.35 1.163 1.163 0 0 1-.35-.855V3.54c0-.337.117-.622.35-.855.233-.233.518-.35.855-.35h10.256c.337 0 .622.117.856.35.233.233.35.518.35.855v8.923c0 .337-.117.622-.35.855-.234.234-.519.35-.856.35H2.871Zm0-1h10.256a.196.196 0 0 0 .141-.064.196.196 0 0 0 .065-.14V3.538a.196.196 0 0 0-.065-.14.195.195 0 0 0-.14-.065H2.87a.196.196 0 0 0-.14.064.196.196 0 0 0-.065.141v8.923c0 .052.021.098.064.141.043.043.09.064.141.064Z" fill="currentColor" stroke="currentColor" stroke-width="0.25"/></svg>`,
  whitepaper: `${SVG_OPEN}<path d="M5.5 11.833h5v-1h-5v1Zm0-2.667h5v-1h-5v1Zm-1.295 5.167c-.337 0-.622-.117-.855-.35a1.163 1.163 0 0 1-.35-.856V2.871c0-.337.117-.622.35-.855.233-.233.518-.35.855-.35H9.5l3.5 3.5v7.961c0 .337-.117.622-.35.856-.233.233-.518.35-.855.35h-7.59ZM9 5.666v-3H4.205a.196.196 0 0 0-.14.064.196.196 0 0 0-.065.141v10.256c0 .052.021.099.064.141.043.043.09.065.141.065h7.59a.195.195 0 0 0 .14-.065.195.195 0 0 0 .065-.14V5.665H9Z" fill="currentColor" stroke="currentColor" stroke-width="0.25"/></svg>`,
};

/* label of the pill on the hover card (source: "View Work"), decorative like on the source */
const HOVER_TAG_LABEL = 'View Work';

const toSlug = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Turns the rich text body cell into the listing card meta:
 * type tag (with icon), bracketed topic tags, title and an optional hover card.
 * Authored order: type, tags, [title], link. When a plain title precedes the link,
 * the link becomes the hover card shown over the image; otherwise the link is the title.
 * @param {Element} body The card body cell
 */
function decorateBody(body) {
  // the source shows plain text links, not buttons
  body.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  body.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));

  const paragraphs = [...body.children].filter((el) => el.tagName === 'P');
  const plain = paragraphs.filter((p) => !p.querySelector('a'));
  const linked = paragraphs.filter((p) => p.querySelector('a'));
  const [type, tags, title] = plain;

  if (type) {
    type.classList.add('cards-insights-type');
    const slug = toSlug(type.textContent);
    if (slug) type.dataset.type = slug;
    if (TYPE_ICONS[slug]) {
      const icon = document.createElement('span');
      icon.className = 'cards-insights-type-icon';
      icon.innerHTML = TYPE_ICONS[slug];
      type.prepend(icon);
    }
  }

  if (tags) {
    tags.classList.add('cards-insights-tags');
    if (!tags.children.length) {
      const values = tags.textContent.split(',').map((t) => t.trim()).filter(Boolean);
      tags.textContent = '';
      values.forEach((value) => {
        const tag = document.createElement('span');
        tag.className = 'cards-insights-tag';
        tag.textContent = value;
        tags.append(tag);
      });
    }
  }

  if (title) title.classList.add('cards-insights-title');

  linked.forEach((p, i) => {
    if (title || i > 0) {
      p.classList.add('cards-insights-hover');
      const tag = document.createElement('span');
      tag.className = 'cards-insights-hover-tag';
      tag.setAttribute('aria-hidden', 'true');
      tag.textContent = HOVER_TAG_LABEL;
      p.append(tag);
    } else {
      p.classList.add('cards-insights-title', 'cards-insights-title-link');
    }
  });
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-insights-card-image';
      else div.className = 'cards-insights-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  ul.querySelectorAll('.cards-insights-card-body').forEach(decorateBody);
  block.textContent = '';
  block.append(ul);
}
