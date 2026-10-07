/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the /kotak-life page and its own header/footer fragments
 * (built from desktop + mobile design images - there is no live site).
 * Sources: local semantic HTML representations of the designs, served at
 *   http://localhost:8090/migration-work/design-kotak/source/{kotak-life,kotak-nav,kotak-footer}.html
 *   (repo root served on :8090). Spec: migration-work/design-kotak/spec.md
 * Images are cropped from the designs into the code repo under /images/kotak/ and referenced site-relative.
 * Output paths are top-level (Content Sync only lists top-level pages): /kotak-life, /kotak-nav, /kotak-footer.
 */

// PARSER IMPORTS
import heroStatementParser from './parsers/hero-statement.js';
import cardsShortcutParser from './parsers/cards-shortcut.js';
import searchPromptParser from './parsers/search-prompt.js';
import carouselPromoParser from './parsers/carousel-promo.js';
import tabsPlansParser from './parsers/tabs-plans.js';
import carouselStackParser from './parsers/carousel-stack.js';
import cardsMetricParser from './parsers/cards-metric.js';
import columnsShowcaseParser from './parsers/columns-showcase.js';
import cardsImpactParser from './parsers/cards-impact.js';
import carouselExpandParser from './parsers/carousel-expand.js';
import formContactParser from './parsers/form-contact.js';
import footerLinksParser from './parsers/footer-links.js';

// TRANSFORMER IMPORTS
import kotakSectionsTransformer from './transformers/kotak-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-statement': heroStatementParser,
  'cards-shortcut': cardsShortcutParser,
  'search-prompt': searchPromptParser,
  'carousel-promo': carouselPromoParser,
  'tabs-plans': tabsPlansParser,
  'carousel-stack': carouselStackParser,
  'cards-metric': cardsMetricParser,
  'columns-showcase': columnsShowcaseParser,
  'cards-impact': cardsImpactParser,
  'carousel-expand': carouselExpandParser,
  'form-contact': formContactParser,
  'footer-links': footerLinksParser,
};

// PAGE TEMPLATE CONFIGURATION, keyed by source file name
const TEMPLATES = {
  'kotak-life': {
    name: 'kotak-life',
    description: 'Kotak Life homepage from desktop + mobile design images: statement hero, shortcuts + prompt, promo carousel, plan tabs, offer stack, trust metrics, advisor showcase, insights, video stories, lead form, popular searches',
    path: '/kotak-life',
    metadata: {
      Title: 'Life Insurance: Kotak Life | Where promises are kept Always',
      template: 'kotak',
      nav: '/kotak-nav',
      footer: '/kotak-footer',
    },
    blocks: [
      { name: 'hero-statement', instances: ['#hero .hero-statement'] },
      { name: 'cards-shortcut', instances: ['#looking-for .shortcuts'] },
      { name: 'search-prompt', instances: ['#looking-for .search-prompt'] },
      { name: 'carousel-promo', instances: ['#promo .promo-slides'] },
      { name: 'tabs-plans', instances: ['#plans .plan-tabs'] },
      { name: 'carousel-stack', instances: ['#offer .offer-stack'] },
      { name: 'cards-metric', instances: ['#trust .metrics'] },
      { name: 'columns-showcase', instances: ['#advisor .showcase'] },
      { name: 'cards-impact', instances: ['#insights .impact-cards'] },
      { name: 'carousel-expand', instances: ['#stories .story-cards'] },
      { name: 'form-contact', instances: ['#lead .lead-form'] },
    ],
    sections: [
      { id: 'section-1', name: 'Hero', selector: ['#hero'], style: null, blocks: ['hero-statement'], defaultContent: [] },
      { id: 'section-2', name: 'Looking for', selector: ['#looking-for'], style: 'kl-center', blocks: ['cards-shortcut', 'search-prompt'], defaultContent: ['#looking-for > h2'] },
      { id: 'section-3', name: 'Promo', selector: ['#promo'], style: null, blocks: ['carousel-promo'], defaultContent: [] },
      { id: 'section-4', name: 'Find a plan', selector: ['#plans'], style: 'kl-center', blocks: ['tabs-plans'], defaultContent: ['#plans > h2', '#plans > p'] },
      { id: 'section-5', name: 'Offer', selector: ['#offer'], style: 'kl-split', blocks: ['carousel-stack'], defaultContent: ['#offer > h2', '#offer > p'] },
      { id: 'section-6', name: 'Fastest growing', selector: ['#trust'], style: 'kl-intro-split', blocks: ['cards-metric'], defaultContent: ['#trust .section-intro > *'] },
      { id: 'section-7', name: 'Life advisor', selector: ['#advisor'], style: null, blocks: ['columns-showcase'], defaultContent: [] },
      { id: 'section-8', name: 'Insights', selector: ['#insights'], style: 'kl-intro-split', blocks: ['cards-impact'], defaultContent: ['#insights .section-intro > *', '#insights > p'] },
      { id: 'section-9', name: 'Customer stories', selector: ['#stories'], style: 'kl-center', blocks: ['carousel-expand'], defaultContent: ['#stories > h2', '#stories > p'] },
      { id: 'section-10', name: 'Lead form', selector: ['#lead'], style: null, blocks: ['form-contact'], defaultContent: [] },
      { id: 'section-11', name: 'Popular searches', selector: ['#searches'], style: 'kl-searches', blocks: [], defaultContent: ['#searches > *'] },
    ],
  },
  'kotak-nav': {
    name: 'kotak-nav',
    description: 'Kotak Life header fragment: brand (colour + white logo) | sections | tools | utility',
    path: '/kotak-nav',
    metadata: null, // fragment - no page metadata block (it would render as an extra nav section)
    blocks: [],
    sections: [
      { id: 'section-1', name: 'Brand', selector: ['.nav-brand'], style: null, blocks: [], defaultContent: ['.nav-brand p'] },
      { id: 'section-2', name: 'Sections', selector: ['.nav-sections'], style: null, blocks: [], defaultContent: ['.nav-sections > ul'] },
      { id: 'section-3', name: 'Tools', selector: ['.nav-tools'], style: null, blocks: [], defaultContent: ['.nav-tools p'] },
      { id: 'section-4', name: 'Utility', selector: ['.nav-utility'], style: null, blocks: [], defaultContent: ['.nav-utility > ul'] },
    ],
  },
  'kotak-footer': {
    name: 'kotak-footer',
    description: 'Kotak Life footer fragment: link groups, apps + social, disclaimer box, legal links',
    path: '/kotak-footer',
    metadata: null, // fragment - no page metadata block
    blocks: [
      { name: 'footer-links', instances: ['.link-groups', '.disclaimer'] },
    ],
    sections: [
      { id: 'section-1', name: 'Link groups', selector: ['section.footer-groups'], style: null, blocks: ['footer-links'], defaultContent: [] },
      { id: 'section-2', name: 'Apps and social', selector: ['section.footer-apps'], style: null, blocks: [], defaultContent: ['section.footer-apps > *'] },
      { id: 'section-3', name: 'Disclaimer', selector: ['section.footer-disclaimer'], style: 'kl-disclaimer', blocks: ['footer-links'], defaultContent: [] },
      { id: 'section-4', name: 'Legal', selector: ['section.footer-legal'], style: null, blocks: [], defaultContent: ['section.footer-legal > *'] },
    ],
  },
};

// TRANSFORMER REGISTRY
const transformers = [
  kotakSectionsTransformer,
];

function templateFor(url) {
  const file = (new URL(url).pathname.split('/').pop() || '').replace(/\.html?$/, '');
  return TEMPLATES[file] || TEMPLATES['kotak-life'];
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
 * (http://localhost:8090/images/kotak/x.jpg) - rewrite back to site-relative paths.
 */
function relativizeUrls(main) {
  main.querySelectorAll('img[src]').forEach((img) => {
    const m = img.getAttribute('src').match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/images\/kotak\/[^?#]+)/i);
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
