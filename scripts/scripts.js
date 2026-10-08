import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

// page templates (page metadata "template") that load templates/<name>/<name>.js
const TEMPLATE_SCRIPTS = ['dept'];

// blocks that live in a site sub-folder: blocks/<folder>/<name>/ instead of blocks/<name>/
const BLOCK_FOLDERS = {
  dept: [
    'cards-casestudy',
    'cards-insights',
    'cards-solution-rows',
    'cards-solutions',
    'carousel-culture',
    'columns-feature',
    'hero-video',
    'article-header',
    'cards-related',
    'contact-specialist',
    'video-embed',
    'cta-banner',
    'stats-grid',
    'next-case',
    'panel-split',
  ],
};
window.hlx = window.hlx || {};
window.hlx.blockFolders = Object.fromEntries(
  Object.entries(BLOCK_FOLDERS).flatMap(([folder, names]) => names.map((name) => [name, folder])),
);

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function a11yLinks(main) {
  const links = main.querySelectorAll('a');
  links.forEach((link) => {
    let label = link.textContent;
    if (!label && link.querySelector('span.icon')) {
      const icon = link.querySelector('span.icon');
      label = icon ? icon.classList[1]?.split('-')[1] : label;
    }
    link.setAttribute('aria-label', label);
  });
}

/**
 * Local preview only: DEPT images are referenced by their AEM Assets path, which the local
 * content server cannot serve — show the original dept.global file instead.
 * @param {Element} main The container element
 */
function previewDeptAssets(main) {
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) return;
  main.querySelectorAll('img[src*="/content/dam/exp-mord-agent/dept/"]').forEach((img) => {
    const path = new URL(img.src).pathname.replace('/content/dam/exp-mord-agent/dept/', '/wp-content/');
    img.closest('picture')?.querySelectorAll('source').forEach((source) => source.remove());
    img.src = `https://www.dept.global${path}`;
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  previewDeptAssets(main);
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  // add aria-label to links
  a11yLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  // templates with their own behavior (e.g. scroll animations) ship templates/<name>/<name>.js
  const template = getMetadata('template');
  if (TEMPLATE_SCRIPTS.includes(template)) {
    try {
      const { codeBasePath } = window.hlx;
      const mod = await import(`${codeBasePath}/templates/${template}/${template}.js`);
      if (mod.default) await mod.default(main);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`failed to load template script ${template}`, e);
    }
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
