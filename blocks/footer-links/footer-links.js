import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Footer Links
 * Each row = one group: cell 1 group title, cell 2 rich text (link list, or sub-headings each
 * followed by a list, or paragraphs).
 * Desktop: groups laid out as columns, always expanded. Mobile: accordion (first group open).
 */

const mobile = window.matchMedia('(width < 900px)');
let footerLinksCount = 0;

function groupSubLists(panel) {
  const headings = panel.querySelectorAll(':scope > :is(h3, h4, h5, h6)');
  if (!headings.length) return;
  headings.forEach((heading) => {
    const group = document.createElement('div');
    group.className = 'footer-links-subgroup';
    heading.before(group);
    group.append(heading);
    while (group.nextElementSibling && !/^H[3-6]$/.test(group.nextElementSibling.tagName)) {
      group.append(group.nextElementSibling);
    }
  });
  panel.classList.add('footer-links-has-subgroups');
}

export default function decorate(block) {
  footerLinksCount += 1;
  const list = document.createElement('div');
  list.className = 'footer-links-groups';

  [...block.children].forEach((row, i) => {
    const [titleCell, textCell] = [...row.children];
    const id = `footer-links-${footerLinksCount}-${i + 1}`;
    const group = document.createElement('div');
    group.className = 'footer-links-group';
    moveInstrumentation(row, group);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'footer-links-toggle';
    toggle.setAttribute('aria-controls', id);
    toggle.textContent = (titleCell?.textContent || '').trim();

    const panel = textCell || document.createElement('div');
    panel.className = 'footer-links-panel';
    panel.id = id;
    panel.querySelectorAll('.button').forEach((a) => {
      a.className = '';
      a.closest('.button-container')?.classList.remove('button-container');
    });
    groupSubLists(panel);

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', open);
      group.classList.toggle('open', open);
    };
    toggle.addEventListener('click', () => {
      if (mobile.matches) setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    setOpen(i === 0 && block.children.length > 1);

    group.append(toggle, panel);
    list.append(group);
  });

  block.replaceChildren(list);
}
