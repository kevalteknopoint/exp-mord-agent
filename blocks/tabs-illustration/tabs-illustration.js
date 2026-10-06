import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Tabs Illustration
 * Each row = one tab:
 *   cell 1: tab label
 *   cell 2: persona - avatar image + heading + description + attribute list
 *   cell 3: timeline - step images (in order) + list of steps (label, title, caption) + CTA link
 * Step images are paired with list items by position; a list item may also carry its own image.
 */

let blockCount = 0;

function optimize(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
}

function decoratePersona(cell) {
  cell.className = 'tabs-illustration-persona';
  const pic = cell.querySelector('picture');
  const body = document.createElement('div');
  body.className = 'tabs-illustration-persona-body';
  if (pic) {
    const avatar = document.createElement('div');
    avatar.className = 'tabs-illustration-avatar';
    const holder = pic.closest('p');
    avatar.append(pic);
    if (holder && !holder.textContent.trim() && !holder.children.length) holder.remove();
    [...cell.childNodes].forEach((n) => body.append(n));
    cell.append(avatar, body);
  } else {
    [...cell.childNodes].forEach((n) => body.append(n));
    cell.append(body);
  }
  body.querySelectorAll('ul').forEach((ul) => ul.classList.add('tabs-illustration-attributes'));
}

function decorateTimeline(cell) {
  cell.className = 'tabs-illustration-timeline';
  const list = cell.querySelector('ol, ul');
  const loosePics = [...cell.querySelectorAll('picture')].filter((p) => !list || !list.contains(p));
  if (list) {
    list.classList.add('tabs-illustration-steps');
    [...list.children].forEach((li, i) => {
      li.classList.add('tabs-illustration-step');
      let pic = li.querySelector('picture');
      if (!pic && loosePics[i]) {
        pic = loosePics[i];
        const holder = pic.closest('p');
        li.prepend(pic);
        if (holder && !holder.textContent.trim() && !holder.querySelector('picture')) holder.remove();
      }
      if (pic) {
        const media = document.createElement('div');
        media.className = 'tabs-illustration-step-image';
        pic.replaceWith(media);
        media.append(pic);
      }
    });
  }
  cell.querySelectorAll(':scope > p').forEach((p) => {
    if (p.querySelector('a') && p.textContent.trim() === p.querySelector('a').textContent.trim()) {
      p.classList.add('tabs-illustration-cta');
    } else if (!p.textContent.trim() && !p.querySelector('picture')) {
      p.remove();
    }
  });
}

export default async function decorate(block) {
  blockCount += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-illustration-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tabs-illustration-tablist-${blockCount}`;

  const rows = [...block.children].filter((row) => row.firstElementChild);

  rows.forEach((row, i) => {
    const id = `tabs-illustration-${blockCount}-panel-${i + 1}`;
    const [labelCell, ...contentCells] = [...row.children];

    row.className = 'tabs-illustration-panel';
    row.id = id;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-hidden', i !== 0);
    row.setAttribute('aria-labelledby', `tab-${id}`);

    const button = document.createElement('button');
    button.className = 'tabs-illustration-tab';
    button.id = `tab-${id}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', i === 0);
    button.textContent = labelCell.textContent.trim() || `Tab ${i + 1}`;
    button.addEventListener('click', () => {
      rows.forEach((r) => r.setAttribute('aria-hidden', true));
      tablist.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', false));
      row.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    labelCell.remove();

    const filled = contentCells.filter((c) => c.textContent.trim() || c.querySelector('picture'));
    contentCells.filter((c) => !filled.includes(c)).forEach((c) => c.remove());
    if (filled.length === 1) {
      // single content cell: treat as timeline if it has a list with pictures, else persona
      decorateTimeline(filled[0]);
    } else {
      if (filled[0]) decoratePersona(filled[0]);
      filled.slice(1).forEach((c) => decorateTimeline(c));
    }
    optimize(row);
  });

  block.prepend(tablist);
}
