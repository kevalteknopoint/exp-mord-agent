import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

let articlesId = 0;

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tab';
}

function buildCard(row, cells) {
  const card = document.createElement('li');
  card.className = 'tabs-articles-card';
  moveInstrumentation(row, card);
  const imageCell = cells.find((c) => c.querySelector('picture'));
  if (imageCell) {
    imageCell.className = 'tabs-articles-card-image';
    imageCell.querySelectorAll('picture > img').forEach((img) => {
      const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      moveInstrumentation(img, pic.querySelector('img'));
      img.closest('picture').replaceWith(pic);
    });
    card.append(imageCell);
  }
  const body = document.createElement('div');
  body.className = 'tabs-articles-card-body';
  cells.filter((c) => c !== imageCell).forEach((c) => {
    while (c.firstChild) body.append(c.firstChild);
  });

  const title = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (title) title.classList.add('tabs-articles-card-title');
  // "07 Oct 2026 | 3 mins read": split into date + read time
  const meta = [...body.querySelectorAll('p')].find((p) => !p.querySelector('a') && p.textContent.includes('|'));
  if (meta) {
    meta.classList.add('tabs-articles-card-meta');
    const [date, ...rest] = meta.textContent.split('|').map((s) => s.trim());
    if (date && rest.length) {
      meta.innerHTML = '<span class="tabs-articles-card-date"></span><span class="tabs-articles-card-read"></span>';
      meta.firstElementChild.textContent = date;
      meta.lastElementChild.textContent = rest.join(' | ');
    }
  }

  // the article link (title link, or a link on its own line) makes the whole card clickable
  const link = title?.querySelector('a') || body.querySelector('a');
  if (link) {
    link.classList.remove('button', 'primary', 'secondary');
    link.closest('.button-container')?.classList.remove('button-container');
    link.classList.add('tabs-articles-card-link');
    if (!title?.contains(link) && title && !link.textContent.trim()) {
      // a bare (text-less) link: name it after the article title
      link.setAttribute('aria-label', title.textContent.trim());
    }
    card.classList.add('tabs-articles-card-linked');
  }
  card.append(body);
  return card;
}

function buildSlider(track) {
  const wrap = document.createElement('div');
  wrap.className = 'tabs-articles-slider';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'tabs-articles-prev';
  prev.setAttribute('aria-label', 'Previous articles');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'tabs-articles-next';
  next.setAttribute('aria-label', 'Next articles');
  wrap.append(prev, track, next);

  const step = () => {
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 1;
    prev.hidden = track.scrollLeft <= 0;
    next.hidden = track.scrollLeft >= max;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  wrap.update = update;
  return wrap;
}

export default function decorate(block) {
  articlesId += 1;
  const groups = new Map();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const tabCell = cells.shift();
    const label = tabCell.textContent.trim() || 'Articles';
    if (!groups.has(label)) groups.set(label, { label, cards: [], more: null });
    const group = groups.get(label);
    const hasImage = cells.some((c) => c.querySelector('picture'));
    const hasHeading = cells.some((c) => c.querySelector('h1, h2, h3, h4, h5, h6'));
    const links = cells.flatMap((c) => [...c.querySelectorAll('a')]);
    // a row with only a link (no image, no title) is the tab's "Know More" link
    if (!hasImage && !hasHeading && links.length === 1) {
      const more = links[0];
      more.classList.add('tabs-articles-more-link');
      const holder = document.createElement('p');
      holder.className = 'tabs-articles-more';
      moveInstrumentation(row, holder);
      holder.append(more);
      group.more = holder;
      return;
    }
    group.cards.push(buildCard(row, cells));
  });

  const tablist = document.createElement('div');
  tablist.className = 'tabs-articles-list';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'tabs-articles-panels';
  const sliders = [];

  [...groups.values()].forEach((group, i) => {
    const id = `tabs-articles-${articlesId}-${slug(group.label)}-${i}`;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-articles-tab';
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', id);
    tab.setAttribute('aria-selected', i === 0);
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.textContent = group.label;
    tablist.append(tab);

    const panel = document.createElement('div');
    panel.className = 'tabs-articles-panel';
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.hidden = i !== 0;
    const track = document.createElement('ul');
    track.className = 'tabs-articles-track';
    track.append(...group.cards);
    const slider = buildSlider(track);
    sliders.push(slider);
    panel.append(slider);
    if (group.more) panel.append(group.more);
    panels.append(panel);
  });

  const select = (tab) => {
    tablist.querySelectorAll('[role=tab]').forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    panels.querySelectorAll('[role=tabpanel]').forEach((p) => {
      p.hidden = p.id !== tab.getAttribute('aria-controls');
    });
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    sliders.forEach((s) => s.update());
  };
  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('[role=tab]');
    if (tab) select(tab);
  });
  tablist.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const tabs = [...tablist.querySelectorAll('[role=tab]')];
    const cur = tabs.indexOf(document.activeElement);
    if (cur < 0) return;
    const target = tabs[(cur + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    e.preventDefault();
    target.focus();
    select(target);
  });

  block.textContent = '';
  block.append(tablist, panels);
  requestAnimationFrame(() => sliders.forEach((s) => s.update()));
}
