/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the /broadridge page and its own header/footer fragments
 * (built from a design image - there is no live site).
 * Sources: local semantic HTML representations of the design, served at
 *   http://localhost:8090/migration-work/design-broadridge/source/{broadridge,broadridge-nav,broadridge-footer}.html
 *   (repo root served on :8090). Spec: migration-work/design-broadridge/spec.md
 * Images are cropped from the design into the code repo under /images/broadridge/ and referenced site-relative.
 * Output paths are top-level (Content Sync only lists top-level pages): /broadridge, /broadridge-nav, /broadridge-footer.
 */

// PARSER IMPORTS
import heroSplitParser from './parsers/hero-split.js';
import cardsSolutionParser from './parsers/cards-solution.js';
import tabsFeatureParser from './parsers/tabs-feature.js';
import tabsVerticalParser from './parsers/tabs-vertical.js';
import cardsRecognitionParser from './parsers/cards-recognition.js';
import cardsSpotlightParser from './parsers/cards-spotlight.js';
import formContactParser from './parsers/form-contact.js';
import columnsBroadridgeFooterParser from './parsers/columns-broadridge-footer.js';

// TRANSFORMER IMPORTS
import broadridgeSectionsTransformer from './transformers/broadridge-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-split': heroSplitParser,
  'cards-solution': cardsSolutionParser,
  'tabs-feature': tabsFeatureParser,
  'tabs-vertical': tabsVerticalParser,
  'cards-recognition': cardsRecognitionParser,
  'cards-spotlight': cardsSpotlightParser,
  'form-contact': formContactParser,
  columns: columnsBroadridgeFooterParser,
};

// PAGE TEMPLATE CONFIGURATION, keyed by source file name
const TEMPLATES = {
  broadridge: {
    name: 'broadridge',
    description: 'Broadridge homepage from design image: split hero, solution cards, industry tabs, capability tabs, recognition cards, spotlight cards, contact form',
    path: '/broadridge',
    metadata: {
      Title: 'Broadridge | Be ready for what the market demands next',
      template: 'broadridge',
      nav: '/broadridge-nav',
      footer: '/broadridge-footer',
    },
    blocks: [
      { name: 'hero-split', instances: ['#hero .hero-split'] },
      { name: 'cards-solution', instances: ['#featured-solutions .solution-cards'] },
      { name: 'tabs-feature', instances: ['#industries .industry-tabs'] },
      { name: 'tabs-vertical', instances: ['#capabilities .capability-tabs'] },
      { name: 'cards-recognition', instances: ['#recognition .recognition-cards'] },
      { name: 'cards-spotlight', instances: ['#spotlight .spotlight-cards'] },
      { name: 'form-contact', instances: ['#contact .contact-form'] },
    ],
    sections: [
      { id: 'section-1', name: 'Hero', selector: ['#hero'], style: null, blocks: ['hero-split'], defaultContent: [] },
      { id: 'section-2', name: 'Featured solutions', selector: ['#featured-solutions'], style: null, blocks: ['cards-solution'], defaultContent: ['#featured-solutions > h2'] },
      { id: 'section-3', name: 'Industries', selector: ['#industries'], style: 'br-intro-split', blocks: ['tabs-feature'], defaultContent: ['#industries .section-intro h2', '#industries .section-intro p'] },
      { id: 'section-4', name: 'Capabilities', selector: ['#capabilities'], style: 'br-intro-split', blocks: ['tabs-vertical'], defaultContent: ['#capabilities .section-intro h2', '#capabilities .section-intro p'] },
      { id: 'section-5', name: 'Recognized by the industry', selector: ['#recognition'], style: 'br-panel, br-cta-end', blocks: ['cards-recognition'], defaultContent: ['#recognition > h2', '#recognition .section-cta'] },
      { id: 'section-6', name: 'Spotlight', selector: ['#spotlight'], style: 'br-cta-end', blocks: ['cards-spotlight'], defaultContent: ['#spotlight > h2', '#spotlight .section-cta'] },
      { id: 'section-7', name: 'Contact', selector: ['#contact'], style: 'br-panel', blocks: ['form-contact'], defaultContent: [] },
    ],
  },
  'broadridge-nav': {
    name: 'broadridge-nav',
    description: 'Broadridge header fragment: brand | sections | tools | utility',
    path: '/broadridge-nav',
    metadata: null, // fragment - no page metadata block (it would render as an extra nav section)
    blocks: [],
    sections: [
      { id: 'section-1', name: 'Brand', selector: ['.nav-brand'], style: null, blocks: [], defaultContent: ['.nav-brand p'] },
      { id: 'section-2', name: 'Sections', selector: ['.nav-sections'], style: null, blocks: [], defaultContent: ['.nav-sections > ul'] },
      { id: 'section-3', name: 'Tools', selector: ['.nav-tools'], style: null, blocks: [], defaultContent: ['.nav-tools p'] },
      { id: 'section-4', name: 'Utility', selector: ['.nav-utility'], style: null, blocks: [], defaultContent: ['.nav-utility > ul'] },
    ],
  },
  'broadridge-footer': {
    name: 'broadridge-footer',
    description: 'Broadridge footer fragment: columns block (brand column, link lists column)',
    path: '/broadridge-footer',
    metadata: null, // fragment - no page metadata block
    blocks: [
      { name: 'columns', instances: ['.footer-columns'] },
    ],
    sections: [
      { id: 'section-1', name: 'Footer', selector: ['section.footer'], style: null, blocks: ['columns'], defaultContent: [] },
    ],
  },
};

// TRANSFORMER REGISTRY
const transformers = [
  broadridgeSectionsTransformer,
];

function templateFor(url) {
  const file = (new URL(url).pathname.split('/').pop() || '').replace(/\.html?$/, '');
  return TEMPLATES[file] || TEMPLATES.broadridge;
}

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: payload.template,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Build the page Metadata block: title/description from the template / source <head>.
 * Keys other than Title/Description are lowercase: md2jcr matches non-standard metadata keys
 * case-sensitively against the page-metadata model field names (models/_page.json).
 */
function addMetadata(main, document, template) {
  const meta = {};
  const description = document.querySelector('meta[name="description"]');
  meta.Title = template.metadata.Title || (document.title || '').trim();
  if (description && description.content) meta.Description = description.content.trim();
  Object.entries(template.metadata).forEach(([key, value]) => {
    if (key !== 'Title') meta[key] = value;
  });
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
  return meta;
}

/**
 * adjustImageUrls absolutises image src / link href against the local source URL
 * (http://localhost:8090/images/broadridge/x.jpg) - rewrite back to site-relative paths.
 */
function relativizeUrls(main) {
  main.querySelectorAll('img[src]').forEach((img) => {
    const m = img.getAttribute('src').match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/images\/broadridge\/[^?#]+)/i);
    if (m) img.setAttribute('src', m[1]);
  });
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

    const main = document.querySelector('main') || document.body;

    // 1. beforeTransform (section breaks)
    executeTransformers('beforeTransform', main, { ...payload, template });

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, template);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (section metadata)
    executeTransformers('afterTransform', main, { ...payload, template });

    // 5. Page metadata + WebImporter built-in rules
    if (template.metadata) {
      main.appendChild(document.createElement('hr'));
      addMetadata(main, document, template);
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    relativizeUrls(main);

    // 6. Output path is fixed per template (top-level pages)
    const path = WebImporter.FileUtils.sanitizePath(template.path);

    return [{
      element: main,
      path,
      report: {
        title: template.metadata ? template.metadata.Title : template.description,
        template: template.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
