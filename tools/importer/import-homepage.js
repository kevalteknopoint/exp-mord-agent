/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - Import all parsers needed for the homepage template
import heroHomepageParser from './parsers/hero-homepage.js';
import heroFeatureParser from './parsers/hero-feature.js';
import columnsParser from './parsers/columns.js';
import cardsIconLinksParser from './parsers/cards-icon-links.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS - Import all transformers from tools/importer/transformers/
import ngssuperCleanupTransformer from './transformers/ngssuper-cleanup.js';
import ngssuperSectionsTransformer from './transformers/ngssuper-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-homepage': heroHomepageParser,
  'hero-feature': heroFeatureParser,
  'columns': columnsParser,
  'cards-icon-links': cardsIconLinksParser,
  'cards': cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (homepage template)
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Main landing page with hero banner, feature highlights, and promotional content',
  urls: [
    'https://www.ngssuper.com.au/',
  ],
  blocks: [
    {
      name: 'hero-homepage',
      instances: [
        'section.s-page-header.skin-primary',
      ],
    },
    {
      name: 'columns',
      instances: [
        'section.s-block-fluid.no-top-padding',
        'section.s-content-block.bg-theme-3 table',
      ],
    },
    {
      name: 'cards-icon-links',
      instances: [
        'section.s-base-section',
      ],
    },
    {
      name: 'hero-feature',
      instances: [
        'section.s-feature-cta-panel.panel-skin-2',
      ],
    },
    {
      name: 'cards',
      instances: [
        'section.s-block-fluid:not(.no-top-padding)',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Banner',
      selector: 'section.s-page-header.skin-primary',
      style: 'dark',
      blocks: ['hero-homepage'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Disclaimer Text',
      selector: 'section.s-page-header + section.s-content-block.color-primary-1',
      style: 'dark',
      blocks: [],
      defaultContent: ['p'],
    },
    {
      id: 'section-3',
      name: 'Feature Columns',
      selector: 'section.s-block-fluid.no-top-padding',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Quick Links Grid',
      selector: 'section.s-base-section',
      style: null,
      blocks: ['cards-icon-links'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Announcement Banner',
      selector: 'section.s-content-block.bg-theme-3',
      style: 'warm-beige',
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Award Feature',
      selector: 'section.s-feature-cta-panel.panel-skin-2',
      style: null,
      blocks: ['hero-feature'],
      defaultContent: [],
    },
    {
      id: 'section-7',
      name: 'News and Articles',
      selector: 'section.s-block-fluid:not(.no-top-padding)',
      style: null,
      blocks: ['cards'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-8',
      name: 'CTA Banner',
      selector: '.page-content > section.s-content-block.color-primary-1:last-of-type',
      style: 'dark',
      blocks: [],
      defaultContent: ['h2', 'a'],
    },
  ],
};

// TRANSFORMER REGISTRY - Array of transformer functions
// Section transformer runs after cleanup in afterTransform hook
const transformers = [
  ngssuperCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [ngssuperSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
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
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
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
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  /**
   * Main transformation function for homepage template
   */
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
