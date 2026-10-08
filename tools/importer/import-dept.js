/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the DEPT India homepage (template "dept").
 * Source: https://www.dept.global/en-in/
 * Output path is top-level (Content Sync only lists top-level pages): /dept.
 * Page metadata adds template "dept" (page-scoped theme body.dept) nav /dept-nav and footer /dept-footer (own header/footer fragments).
 */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsSolutionsParser from './parsers/cards-solutions.js';
import cardsCasestudyParser from './parsers/cards-casestudy.js';
import cardsSolutionRowsParser from './parsers/cards-solution-rows.js';
import carouselCultureParser from './parsers/carousel-culture.js';
import cardsInsightsParser from './parsers/cards-insights.js';

// TRANSFORMER IMPORTS (this site's transformers only)
import deptCleanupTransformer from './transformers/dept-cleanup.js';
import deptSectionsTransformer from './transformers/dept-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'columns-feature': columnsFeatureParser,
  'cards-solutions': cardsSolutionsParser,
  'cards-casestudy': cardsCasestudyParser,
  'cards-solution-rows': cardsSolutionRowsParser,
  'carousel-culture': carouselCultureParser,
  'cards-insights': cardsInsightsParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'dept',
  description: 'DEPT India homepage: video hero, statement, feature rows, AI services list, work grid, solution rows, culture carousel, insights',
  urls: [
    'https://www.dept.global/en-in/',
  ],
  path: '/dept',
  metadata: { template: 'dept', nav: '/dept-nav', footer: '/dept-footer' },
  blocks: [
    { name: 'hero-video', instances: ['.block-scrolly-video-intro'] },
    { name: 'columns-feature', instances: ['.block-assets-and-copy'] },
    { name: 'cards-solutions', instances: ['.block-talking-points'] },
    { name: 'cards-casestudy', instances: ['.block-work-listing__items'] },
    { name: 'cards-solution-rows', instances: ['.block-image-and-fact'] },
    { name: 'carousel-culture', instances: ['.block-feature-turntable'] },
    { name: 'cards-insights', instances: ['.block-custom-listing__items'] },
  ],
  sections: [
    { id: 'section-1', name: 'Hero video intro', selector: ['.block-scrolly-video-intro'], style: 'dept-hero', blocks: ['hero-video'], defaultContent: [] },
    { id: 'section-2', name: 'Statement', selector: ['.block-statement-v2'], style: 'dept-statement', blocks: [], defaultContent: ['.block-statement-v2__title'] },
    { id: 'section-3', name: 'Feature rows (DEPTIFY, Adobe partner)', selector: ['.block-statement-v2 + .block-assets-and-copy', '.block-assets-and-copy'], style: 'dept-features', blocks: ['columns-feature'], defaultContent: [] },
    { id: 'section-4', name: 'Services / AI Transformation', selector: ['.block-assets-and-copy + .block-text-divider__text-divider', '#main-content > .block-text-divider__text-divider:nth-of-type(5)'], style: 'dept-services', blocks: ['cards-solutions'], defaultContent: ['.block-text-divider__text-divider', '.block-talking-points__title', '.block-talking-points__subtitle'] },
    { id: 'section-5', name: 'Work listing', selector: ['.block-work-listing'], style: 'dept-work', blocks: ['cards-casestudy'], defaultContent: ['.block-work-listing__title', '.block-work-listing > a.button-v2'] },
    { id: 'section-6', name: 'Solutions / How we invent growth', selector: ['.block-work-listing + .block-text-divider__text-divider', '#main-content > .block-text-divider__text-divider:nth-of-type(8)'], style: 'dept-solutions', blocks: ['cards-solution-rows'], defaultContent: ['.block-text-divider__text-divider', '.block-title-with-cta__title'] },
    { id: 'section-7', name: 'Culture carousel', selector: ['.block-feature-turntable'], style: 'dept-culture', blocks: ['carousel-culture'], defaultContent: [] },
    { id: 'section-8', name: 'On our mind / Insights', selector: ['.block-custom-listing'], style: 'dept-insights', blocks: ['cards-insights'], defaultContent: ['.block-custom-listing__title', '.block-custom-listing > a.button-v2'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks (template has 8 sections)
const transformers = [
  deptCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [deptSectionsTransformer] : []),
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
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Build the page Metadata block: Title/Description from the source <head> plus the template's
 * extra keys. Keys other than Title/Description are lowercase: md2jcr matches non-standard
 * metadata keys case-sensitively against the page-metadata model field names (models/_page.json).
 */
function addMetadata(main, document, template) {
  const meta = {};
  const title = document.querySelector('meta[property="og:title"]');
  const description = document.querySelector('meta[name="description"]')
    || document.querySelector('meta[property="og:description"]');
  meta.Title = (document.title || (title && title.content) || '').trim();
  if (description && description.content) meta.Description = description.content.trim();
  Object.entries(template.metadata || {}).forEach(([key, value]) => {
    meta[key] = value;
  });
  main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
  return meta;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (cleanup + section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by an earlier parser
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

    // 4. afterTransform (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. Page metadata + WebImporter built-in rules
    main.appendChild(document.createElement('hr'));
    const meta = addMetadata(main, document, PAGE_TEMPLATE);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Fixed top-level path (never empty: an empty path breaks the bundled importer)
    const path = WebImporter.FileUtils.sanitizePath(PAGE_TEMPLATE.path);

    return [{
      element: main,
      path,
      report: {
        title: meta.Title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
