/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the /loans page (built from a design image - there is no live site).
 * Source: a local semantic HTML representation of the design,
 *   migration-work/design-loans/source/loans.html, served at
 *   http://localhost:8090/migration-work/design-loans/source/loans.html (repo root served on :8090).
 * Placeholder images live in the code repo under /images/loans/ and are referenced site-relative.
 */

// PARSER IMPORTS
import cardsLoanBannerParser from './parsers/cards-loan-banner.js';
import carouselQuoteParser from './parsers/carousel-quote.js';
import cardsServiceLinksParser from './parsers/cards-service-links.js';

// TRANSFORMER IMPORTS
import loansSectionsTransformer from './transformers/loans-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-loan-banner': cardsLoanBannerParser,
  'carousel-quote': carouselQuoteParser,
  'cards-service-links': cardsServiceLinksParser,
};

// PAGE TEMPLATE CONFIGURATION (design: migration-work/design-loans/spec.md)
const PAGE_TEMPLATE = {
  "name": "loans",
  "description": "Loans landing page from design image: stacked loan banners, testimonials carousel, customer service links",
  "urls": [
    "http://localhost:8090/migration-work/design-loans/source/loans.html"
  ],
  "blocks": [
    {
      "name": "cards-loan-banner",
      "instances": [
        "section.loan-banners"
      ]
    },
    {
      "name": "carousel-quote",
      "instances": [
        "section.testimonials .testimonial-list"
      ]
    },
    {
      "name": "cards-service-links",
      "instances": [
        "section.customer-service ul.service-links"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Loan banners",
      "selector": ["#loan-banners"],
      "style": "loans-banners",
      "blocks": ["cards-loan-banner"],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Testimonials",
      "selector": ["#testimonials"],
      "style": "loans-testimonials",
      "blocks": ["carousel-quote"],
      "defaultContent": ["#testimonials .eyebrow", "#testimonials h2"]
    },
    {
      "id": "section-3",
      "name": "Customer service",
      "selector": ["#customer-service"],
      "style": "loans-service",
      "blocks": ["cards-service-links"],
      "defaultContent": ["#customer-service .eyebrow", "#customer-service h2"]
    }
  ]
};

// PAGE METADATA (Template "loans" adds body.loans, which scopes this page's styling)
// Key is lowercase "template": md2jcr matches non-standard metadata keys case-sensitively against the
// page-metadata model field names (models/_page.json "template"); EDS lowercases meta names anyway.
const PAGE_METADATA = {
  Title: 'Loans',
  template: 'loans',
};

// TRANSFORMER REGISTRY
const transformers = [
  loansSectionsTransformer,
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

/**
 * Build the page Metadata block: title/description from the source <head>, plus Template.
 */
function addMetadata(main, document) {
  const meta = {};
  const description = document.querySelector('meta[name="description"]');
  meta.Title = PAGE_METADATA.Title || (document.title || '').trim();
  if (description && description.content) meta.Description = description.content.trim();
  meta.template = PAGE_METADATA.template;
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
  return meta;
}

/**
 * adjustImageUrls absolutises image src against the local source URL
 * (http://localhost:8090/images/loans/x.jpg) - rewrite back to site-relative /images/loans/x.jpg
 */
function relativizeImages(main) {
  main.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    const m = src.match(/^(?:https?:)?\/\/[^/]+(\/images\/loans\/[^?#]+)/i);
    if (m) img.setAttribute('src', m[1]);
  });
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.querySelector('main') || document.body;

    // 1. beforeTransform (section breaks)
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

    // 4. afterTransform (section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Page metadata + WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    addMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    relativizeImages(main);

    // 6. Output path is fixed: top-level /loans (Content Sync only lists top-level pages)
    const path = WebImporter.FileUtils.sanitizePath('/loans');

    return [{
      element: main,
      path,
      report: {
        title: PAGE_METADATA.Title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
