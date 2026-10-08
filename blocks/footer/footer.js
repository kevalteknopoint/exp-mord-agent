import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Reads a footer option a page theme sets as a CSS custom property on a footer section
 * @param {Element} section The footer section
 * @param {string} name Custom property name
 * @returns {string} The trimmed value ('' when unset)
 */
function footerOption(section, name) {
  return getComputedStyle(section).getPropertyValue(name).trim();
}

/**
 * A logo image authored in its own paragraph, followed by a paragraph holding only a link
 * (linked images do not survive Universal Editor content), becomes that link's content;
 * the link text is kept as its accessible name.
 * @param {Element} section The footer section
 */
function linkLogo(section) {
  const picture = section.querySelector('p > picture');
  const pictureWrapper = picture?.parentElement;
  const linkWrapper = pictureWrapper?.nextElementSibling;
  const link = linkWrapper?.querySelector(':scope > a:only-child');
  if (!link || pictureWrapper.textContent.trim()) return;
  const label = link.textContent.trim();
  if (label) link.setAttribute('aria-label', label);
  link.replaceChildren(picture);
  linkWrapper.classList.add('footer-logo');
  pictureWrapper.remove();
}

/**
 * A text-only paragraph directly followed by a list becomes a button that opens the list as a
 * popover (e.g. a location picker); Escape or a click outside closes it.
 * @param {Element} section The footer section
 */
function buildPopoverLists(section) {
  section.querySelectorAll('p + ul').forEach((list) => {
    const title = list.previousElementSibling;
    if (title.querySelector('a, picture')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'footer-popover';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'footer-popover-trigger';
    button.setAttribute('aria-expanded', 'false');
    button.textContent = title.textContent.trim();
    list.id = `footer-popover-${Math.random().toString(36).slice(2, 8)}`;
    list.classList.add('footer-popover-list');
    button.setAttribute('aria-controls', list.id);
    title.replaceWith(wrapper);
    wrapper.append(button, list);
    // the link to the current site section is the active entry
    list.querySelectorAll('a[href]').forEach((a) => {
      if (new URL(a.href).pathname === window.location.pathname) a.setAttribute('aria-current', 'page');
    });
    const setOpen = (open) => button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) setOpen(false);
    });
    wrapper.addEventListener('keydown', (e) => {
      if (e.code !== 'Escape') return;
      setOpen(false);
      button.focus();
    });
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  // optional behaviors page themes switch on per section with CSS custom properties
  footer.querySelectorAll('.section').forEach((section) => {
    if (footerOption(section, '--footer-link-logo') === 'on') linkLogo(section);
    if (footerOption(section, '--footer-popover-lists') === 'on') buildPopoverLists(section);
  });
}
