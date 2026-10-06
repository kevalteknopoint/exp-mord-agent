/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroWizardParser from './parsers/hero-wizard.js';
import cardsCalloutParser from './parsers/cards-callout.js';
import heroPromoParser from './parsers/hero-promo.js';
import cardsArticleParser from './parsers/cards-article.js';
import cardsProductParser from './parsers/cards-product.js';
import heroMediaParser from './parsers/hero-media.js';
import cardsVideoParser from './parsers/cards-video.js';
import carouselBadgesParser from './parsers/carousel-badges.js';

// TRANSFORMER IMPORTS
import duluxCleanupTransformer from './transformers/dulux-cleanup.js';
import duluxSectionsTransformer from './transformers/dulux-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-wizard': heroWizardParser,
  'cards-callout': cardsCalloutParser,
  'hero-promo': heroPromoParser,
  'cards-article': cardsArticleParser,
  'cards-product': cardsProductParser,
  'hero-media': heroMediaParser,
  'cards-video': cardsVideoParser,
  'carousel-badges': carouselBadgesParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Dulux India homepage with color wizard, callout blocks, hero banners, related content grid, media, and product carousel',
  urls: [
    'https://www.dulux.in/',
  ],
  blocks: [
    {
      name: 'hero-wizard',
      instances: ['div.c32-color-wizard'],
    },
    {
      name: 'cards-callout',
      instances: ['div.cmp-c10-callout-blocks'],
    },
    {
      name: 'hero-promo',
      instances: [
        'div.cmp-c12-hero-banner.style-appearance-primary-brand-3',
        'div.cmp-c12-hero-banner.style-appearance-light',
      ],
    },
    {
      name: 'cards-article',
      instances: [
        'div.cmp-c43-related-content:nth-of-type(6)',
        'div.cmp-c43-related-content:nth-of-type(14)',
      ],
    },
    {
      name: 'cards-product',
      instances: ['div.cmp-c43-related-content:nth-of-type(8)'],
    },
    {
      name: 'hero-media',
      instances: ['div.cmp-c19-media.style-contain'],
    },
    {
      name: 'cards-video',
      instances: ['div.cmp-c43-related-content:nth-of-type(12)'],
    },
    {
      name: 'carousel-badges',
      instances: ['div.cmp-c15-carousel'],
    },
  ],
  sections: [
    { id: 'sec-1', name: 'Color Wizard Hero', selector: 'div.c32-color-wizard', style: null, blocks: ['hero-wizard'], defaultContent: [] },
    { id: 'sec-2', name: 'Callout Tiles', selector: 'div.cmp-c10-callout-blocks', style: null, blocks: ['cards-callout'], defaultContent: [] },
    { id: 'sec-3', name: 'Colour Play Promo Banner', selector: 'div.cmp-c12-hero-banner.style-appearance-primary-brand-3', style: null, blocks: ['hero-promo'], defaultContent: [] },
    { id: 'sec-4', name: 'Inspiring Paint Solutions Intro', selector: 'div.cmp-c23-text-block.style-hero:nth-of-type(5)', style: null, blocks: [], defaultContent: ['div.cmp-c23-text-block.style-hero:nth-of-type(5)'] },
    { id: 'sec-5', name: 'Colour of the Year Cards', selector: 'div.cmp-c43-related-content:nth-of-type(6)', style: null, blocks: ['cards-article'], defaultContent: [] },
    { id: 'sec-6', name: 'Featured Products Intro', selector: 'div.cmp-c23-text-block.style-hero:nth-of-type(7)', style: null, blocks: [], defaultContent: ['div.cmp-c23-text-block.style-hero:nth-of-type(7)'] },
    { id: 'sec-7', name: 'Featured Products Cards', selector: 'div.cmp-c43-related-content:nth-of-type(8)', style: null, blocks: ['cards-product'], defaultContent: [] },
    { id: 'sec-8', name: 'Assurance Media Banner', selector: 'div.cmp-c19-media.style-contain', style: null, blocks: ['hero-media'], defaultContent: [] },
    { id: 'sec-9', name: 'Perfect Your Paint Intro', selector: 'div.cmp-c23-text-block.style-hero:nth-of-type(11)', style: null, blocks: [], defaultContent: ['div.cmp-c23-text-block.style-hero:nth-of-type(11)'] },
    { id: 'sec-10', name: 'YouTube Video Cards', selector: 'div.cmp-c43-related-content:nth-of-type(12)', style: null, blocks: ['cards-video'], defaultContent: [] },
    { id: 'sec-11', name: 'Expert Advice Intro', selector: 'div.cmp-c23-text-block.style-hero:nth-of-type(13)', style: null, blocks: [], defaultContent: ['div.cmp-c23-text-block.style-hero:nth-of-type(13)'] },
    { id: 'sec-12', name: 'Expert Advice Cards', selector: 'div.cmp-c43-related-content:nth-of-type(14)', style: null, blocks: ['cards-article'], defaultContent: [] },
    { id: 'sec-13', name: 'View All Articles Link', selector: 'div.cmp-c23-text-block.style-hero:nth-of-type(15)', style: null, blocks: [], defaultContent: ['div.cmp-c23-text-block.style-hero:nth-of-type(15)'] },
    { id: 'sec-14', name: 'Painting Services Promo Banner', selector: 'div.cmp-c12-hero-banner.style-appearance-light', style: null, blocks: ['hero-promo'], defaultContent: [] },
    { id: 'sec-15', name: 'Rating Badges Carousel', selector: 'div.cmp-c15-carousel', style: null, blocks: ['carousel-badges'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  duluxCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [duluxSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
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
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

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

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
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
