import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

let drawerId = 0;

function optimize(scope, width) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
}

function buildItem(row) {
  const li = document.createElement('li');
  li.className = 'cards-apply-now-item';
  moveInstrumentation(row, li);
  while (row.firstElementChild) li.append(row.firstElementChild);
  [...li.children].forEach((div) => {
    if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-apply-now-icon';
    else div.className = 'cards-apply-now-body';
  });
  const link = li.querySelector('.cards-apply-now-body a');
  if (link) {
    // product names are list links, not buttons
    link.classList.remove('button', 'primary', 'secondary');
    link.closest('.button-container')?.classList.remove('button-container');
    link.classList.add('cards-apply-now-link');
    li.classList.add('cards-apply-now-item-linked');
  }
  // an emphasised short word (e.g. "NEW") is rendered as a tag
  li.querySelectorAll('.cards-apply-now-body em, .cards-apply-now-body strong').forEach((el) => {
    if (el.textContent.trim().length <= 12 && el.textContent.trim() !== link?.textContent.trim()) {
      el.classList.add('cards-apply-now-tag');
    }
  });
  return li;
}

export default function decorate(block) {
  drawerId += 1;
  const id = `cards-apply-now-${drawerId}`;
  const inEditor = block.hasAttribute('data-aue-resource') || !!document.querySelector('[data-aue-resource]');

  const header = document.createElement('div');
  header.className = 'cards-apply-now-header';
  const list = document.createElement('ul');
  list.className = 'cards-apply-now-list';
  let triggerIcon = null;
  let triggerLabel = '';

  [...block.children].forEach((row) => {
    // product items are icon + link rows (two cells); the block's own fields are one cell each,
    // so a freshly added product without its link yet still lands in the list
    if (row.children.length > 1 || row.querySelector('a')) {
      list.append(buildItem(row));
      return;
    }
    // rows without links are the trigger / panel intro
    moveInstrumentation(row, header);
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !triggerIcon) {
        triggerIcon = pic;
        const p = pic.closest('p');
        if (p && p !== cell) p.replaceWith(...p.childNodes);
        pic.remove();
        const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
        if (!heading) {
          // the cell holding the tab image carries the trigger label
          triggerLabel = triggerLabel || cell.textContent.trim();
          return;
        }
        // single-cell intro: whatever precedes the heading is the trigger label
        const before = [];
        let node = cell.firstChild;
        while (node && node !== heading && !node.contains?.(heading)) {
          before.push(node);
          node = node.nextSibling;
        }
        triggerLabel = triggerLabel || before.map((n) => n.textContent).join(' ').trim();
        before.forEach((n) => n.remove());
      }
      while (cell.firstChild) header.append(cell.firstChild);
    });
  });
  header.querySelectorAll('p:empty').forEach((p) => p.remove());

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'cards-apply-now-trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', `${id}-panel`);
  if (triggerIcon) {
    const icon = document.createElement('span');
    icon.className = 'cards-apply-now-trigger-icon';
    icon.append(triggerIcon);
    optimize(icon, '48');
    // the label already names the button; the tab image is decorative
    icon.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    icon.setAttribute('aria-hidden', 'true');
    trigger.append(icon);
  }
  const label = document.createElement('span');
  label.className = 'cards-apply-now-trigger-label';
  label.textContent = triggerLabel || 'Select a Product';
  trigger.append(label);

  const panel = document.createElement('div');
  panel.className = 'cards-apply-now-panel';
  panel.id = `${id}-panel`;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', header.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim() || label.textContent);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'cards-apply-now-close';
  close.setAttribute('aria-label', 'Close');
  optimize(list, '64');
  panel.append(close, header, list);

  const setOpen = (open) => {
    block.classList.toggle('cards-apply-now-open', open);
    trigger.setAttribute('aria-expanded', open);
    panel.hidden = !open;
    if (open) close.focus();
  };
  trigger.addEventListener('click', () => setOpen(trigger.getAttribute('aria-expanded') !== 'true'));
  close.addEventListener('click', () => {
    setOpen(false);
    trigger.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      trigger.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (trigger.getAttribute('aria-expanded') === 'true' && !block.contains(e.target)) setOpen(false);
  });

  block.textContent = '';
  block.append(trigger, panel);
  if (inEditor) {
    // authoring: render the panel inline and open so it can be edited in place
    block.classList.add('cards-apply-now-inline');
    panel.hidden = false;
  } else {
    panel.hidden = true;
  }
}
