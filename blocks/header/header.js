import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * Reads a header option a page theme sets as a CSS custom property on the header block
 * @param {Element} block The header block element
 * @param {string} name Custom property name
 * @returns {string} The trimmed value ('' when unset)
 */
function headerOption(block, name) {
  return getComputedStyle(block).getPropertyValue(name).trim();
}

/**
 * Replaces an authored search link with a search form: the link URL is the form action, its first
 * query parameter (e.g. ?query=) the input name, its text the label and placeholder.
 * @param {Element} link The search link
 */
function buildSearchForm(link) {
  const url = new URL(link.href);
  const [param = 'q'] = [...url.searchParams.keys()];
  const label = link.textContent.trim() || 'Search';
  const inputId = `nav-search-${Math.random().toString(36).slice(2, 8)}`;
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = `${url.origin}${url.pathname}`;
  form.method = 'get';
  form.innerHTML = `<label class="nav-search-label" for="${inputId}"></label>
    <input class="nav-search-input" id="${inputId}" type="text" autocomplete="off">
    <button class="nav-search-submit" type="submit"></button>`;
  form.querySelector('label').textContent = label;
  const input = form.querySelector('input');
  input.name = param;
  input.placeholder = `${label}...`;
  form.querySelector('button').setAttribute('aria-label', label);
  (link.closest('p') || link).replaceWith(form);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // optional 4th section = utility links, rendered as a bar above the main nav
  const classes = ['brand', 'sections', 'tools', 'utility'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
  const navUtility = nav.querySelector('.nav-utility');
  if (navUtility) {
    navUtility.classList.replace('nav-utility', 'nav-utility-bar');
    navUtility.querySelectorAll('.button').forEach((link) => {
      link.className = '';
      link.closest('.button-container')?.classList.remove('button-container');
    });
    navUtility.remove();
  }

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }
  // a logo image authored next to the brand link (linked images do not survive Universal Editor
  // content) becomes the link's content; the link text is kept as its accessible name
  const brandPicture = navBrand.querySelector('picture');
  const homeLink = navBrand.querySelector('a');
  if (brandPicture && homeLink && !homeLink.contains(brandPicture)) {
    const label = homeLink.textContent.trim();
    if (label) homeLink.setAttribute('aria-label', label);
    const pictureWrapper = brandPicture.closest('p');
    homeLink.replaceChildren(brandPicture);
    if (pictureWrapper && !pictureWrapper.textContent.trim() && !pictureWrapper.querySelector('picture')) {
      pictureWrapper.remove();
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });
    // page themes opt in with --header-mobile-accordion: on - in the mobile menu, the titled
    // groups inside a dropdown (title + link list) open and close like an accordion
    if (headerOption(block, '--header-mobile-accordion') === 'on') {
      navSections.querySelectorAll('.nav-drop > ul > li').forEach((group) => {
        const title = group.querySelector(':scope > p');
        if (!title || !group.querySelector(':scope > ul')) return;
        group.classList.add('nav-group');
        group.setAttribute('aria-expanded', 'false');
        title.setAttribute('role', 'button');
        title.tabIndex = 0;
        const toggle = (e) => {
          if (isDesktop.matches) return;
          e.stopPropagation();
          const expanded = group.getAttribute('aria-expanded') === 'true';
          group.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        };
        title.addEventListener('click', toggle);
        title.addEventListener('keydown', (e) => {
          if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            toggle(e);
          }
        });
      });
    }
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = navTools.querySelector('a[href*="search"]');
    if (search && search.textContent === '') {
      search.setAttribute('aria-label', 'Search');
    }
    // page themes opt in with --header-search: expand
    if (search && headerOption(block, '--header-search') === 'expand') buildSearchForm(search);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  if (navUtility) navWrapper.append(navUtility);
  navWrapper.append(nav);
  block.append(navWrapper);

  // lets page themes restyle the header once the page is scrolled (e.g. transparent over a hero);
  // themes opting in with --header-hide-on-scroll: on also get .header-hidden while scrolling down
  const hideOnScroll = headerOption(block, '--header-hide-on-scroll') === 'on';
  let lastScrollY = window.scrollY;
  const onScroll = () => {
    const { scrollY } = window;
    navWrapper.classList.toggle('header-scrolled', scrollY > 8);
    if (hideOnScroll && Math.abs(scrollY - lastScrollY) > 4) {
      const menuOpen = nav.getAttribute('aria-expanded') === 'true' && !isDesktop.matches;
      const dropOpen = navSections?.querySelector('.nav-drop[aria-expanded="true"]');
      const goingDown = scrollY > lastScrollY && scrollY > navWrapper.offsetHeight;
      navWrapper.classList.toggle('header-hidden', goingDown && !menuOpen && !dropOpen);
      lastScrollY = scrollY;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // a click outside the nav closes an open desktop dropdown
  document.addEventListener('click', (e) => {
    if (!navSections || !isDesktop.matches || nav.contains(e.target)) return;
    toggleAllNavSections(navSections);
  });

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
