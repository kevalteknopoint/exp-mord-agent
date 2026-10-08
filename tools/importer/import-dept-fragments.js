/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the /dept page's own header (and footer) fragments.
 * Sources: semantic HTML transcriptions of the live https://www.dept.global/en-in/ header/footer,
 *   served at http://localhost:8090/migration-work/design-dept/source/{dept-nav,dept-footer}.html
 *   (repo root served on :8090).
 * Output paths are top-level (Content Sync only lists top-level pages): /dept-nav, /dept-footer.
 * Fragments carry no page metadata block.
 */

// TRANSFORMER IMPORTS
import deptSectionsTransformer from './transformers/dept-sections.js';
import { useDamImages } from './parsers/dept/utils.js';

// PAGE TEMPLATE CONFIGURATION, keyed by source file name
const TEMPLATES = {
  'dept-nav': {
    name: 'dept-nav',
    description: 'DEPT header fragment: brand | sections (What we do flyout + links) | tools (search, Contact)',
    path: '/dept-nav',
    blocks: [],
    sections: [
      { id: 'section-1', name: 'Brand', selector: ['.nav-brand'], style: null, blocks: [], defaultContent: ['.nav-brand p'] },
      { id: 'section-2', name: 'Sections', selector: ['.nav-sections'], style: null, blocks: [], defaultContent: ['.nav-sections > ul'] },
      { id: 'section-3', name: 'Tools', selector: ['.nav-tools'], style: null, blocks: [], defaultContent: ['.nav-tools p'] },
    ],
  },
  'dept-footer': {
    name: 'dept-footer',
    description: 'DEPT footer fragment: brand + locations | studios | pages | contact + social | certifications | apparel band | legal',
    path: '/dept-footer',
    blocks: [],
    sections: [
      { id: 'section-1', name: 'Brand + locations', selector: ['section.footer-brand'], style: 'footer-brand', blocks: [], defaultContent: ['section.footer-brand > *'] },
      { id: 'section-2', name: 'Studios', selector: ['section.footer-studios'], style: 'footer-studios', blocks: [], defaultContent: ['section.footer-studios > ul'] },
      { id: 'section-3', name: 'Pages', selector: ['section.footer-pages'], style: 'footer-pages', blocks: [], defaultContent: ['section.footer-pages > ul'] },
      { id: 'section-4', name: 'Contact + social', selector: ['section.footer-contact'], style: 'footer-contact', blocks: [], defaultContent: ['section.footer-contact > *'] },
      { id: 'section-5', name: 'Certifications', selector: ['section.footer-certifications'], style: 'footer-certifications', blocks: [], defaultContent: ['section.footer-certifications > p'] },
      { id: 'section-6', name: 'Apparel band', selector: ['section.footer-apparel'], style: 'footer-apparel', blocks: [], defaultContent: ['section.footer-apparel > p'] },
      { id: 'section-7', name: 'Legal', selector: ['section.footer-bottom'], style: 'footer-bottom', blocks: [], defaultContent: ['section.footer-bottom > *'] },
    ],
  },
};

// TRANSFORMER REGISTRY
const transformers = [
  deptSectionsTransformer,
];

function templateFor(url) {
  const file = (new URL(url).pathname.split('/').pop() || '').replace(/\.html?$/, '');
  return TEMPLATES[file];
}

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, payload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

// adjustImageUrls absolutises link hrefs against the local source URL (http://localhost:8090/...):
// links back to site-relative paths. Images are absolute dept.global URLs and stay as they are.
function relativizeUrls(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const m = a.getAttribute('href').match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/[^#]*)?(#.*)?$/i);
    if (m) a.setAttribute('href', (m[1] && m[1] !== '/' ? m[1] : '') + (m[2] || '') || '#');
  });
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const template = templateFor(params.originalURL || url);
    if (!template) throw new Error(`No dept fragment template for ${params.originalURL || url}`);

    const main = document.querySelector('main') || document.body;

    // 1. beforeTransform (section breaks)
    executeTransformers('beforeTransform', main, { ...payload, template });

    // 2. afterTransform (section metadata - none for fragments)
    executeTransformers('afterTransform', main, { ...payload, template });

    // 3. WebImporter built-in rules
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    relativizeUrls(main);
    // images are delivered from AEM Assets (Content Sync drops externally hosted images)
    const images = useDamImages(main);

    // 4. Output path is fixed per template (top-level pages)
    const path = WebImporter.FileUtils.sanitizePath(template.path);

    return [{
      element: main,
      path,
      report: {
        title: template.description,
        template: template.name,
        blocks: [],
        images,
      },
    }];
  },
};
