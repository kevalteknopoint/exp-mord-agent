/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the /tata-cars page and its own header/footer fragments
 * (built from a mobile design image - there is no live site).
 * Sources: local semantic HTML representations of the design, served at
 *   http://localhost:8090/migration-work/design-tatacars/source/{tata-cars,tata-cars-nav,tata-cars-footer}.html
 *   (repo root served on :8090). Spec: migration-work/design-tatacars/spec.md
 * Images are cropped from the design into the code repo under /images/tatacars/ and referenced site-relative.
 * Output paths are top-level (Content Sync only lists top-level pages): /tata-cars, /tata-cars-nav, /tata-cars-footer.
 */

// PARSER IMPORTS
import carouselShowcaseParser from './parsers/carousel-showcase.js';
import filterDropdownsParser from './parsers/filter-dropdowns.js';
import cardsCarParser from './parsers/cards-car.js';
import calculatorEmiParser from './parsers/calculator-emi.js';
import dealerFinderParser from './parsers/dealer-finder.js';
import carouselReelsParser from './parsers/carousel-reels.js';
import cardsActionParser from './parsers/cards-action.js';
import cardsProofParser from './parsers/cards-proof.js';
import ctaStickyParser from './parsers/cta-sticky.js';
import formContactParser from './parsers/form-contact.js';

// TRANSFORMER IMPORTS
import tatacarsSectionsTransformer from './transformers/tatacars-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-showcase': carouselShowcaseParser,
  'filter-dropdowns': filterDropdownsParser,
  'cards-car': cardsCarParser,
  'calculator-emi': calculatorEmiParser,
  'dealer-finder': dealerFinderParser,
  'carousel-reels': carouselReelsParser,
  'cards-action': cardsActionParser,
  'cards-proof': cardsProofParser,
  'cta-sticky': ctaStickyParser,
  'form-contact': formContactParser,
};

// PAGE TEMPLATE CONFIGURATION, keyed by source file name
const TEMPLATES = {
  'tata-cars': {
    name: 'tata-cars',
    description: 'Tata Cars homepage from a mobile design image: announcement, car hero carousel, filters + bestsellers, EMI calculator, dealer finder, customer reels, quick actions, why-choose proof points, sticky CTA',
    path: '/tata-cars',
    metadata: {
      Title: 'TATA.CARS | Skip the waitlist. Secure yours today.',
      template: 'tatacars',
      nav: '/tata-cars-nav',
      footer: '/tata-cars-footer',
    },
    blocks: [
      { name: 'carousel-showcase', instances: ['#hero .showcase'] },
      { name: 'filter-dropdowns', instances: ['#bestsellers .filters'] },
      { name: 'cards-car', instances: ['#bestsellers .cars'] },
      { name: 'calculator-emi', instances: ['#emi .calculator'] },
      { name: 'dealer-finder', instances: ['#dealers .dealer-finder'] },
      { name: 'carousel-reels', instances: ['#family .reels'] },
      { name: 'cards-action', instances: ['#actions .action-cards'] },
      { name: 'cards-proof', instances: ['#proof .proof-cards'] },
      { name: 'cta-sticky', instances: ['#sticky .sticky-cta'] },
    ],
    sections: [
      { id: 'section-1', name: 'Announcement', selector: ['#announce'], style: 'tc-announce', blocks: [], defaultContent: ['#announce > p'] },
      { id: 'section-2', name: 'Hero', selector: ['#hero'], style: null, blocks: ['carousel-showcase'], defaultContent: [] },
      { id: 'section-3', name: 'Bestsellers', selector: ['#bestsellers'], style: 'tc-dark', blocks: ['filter-dropdowns', 'cards-car'], defaultContent: ['#bestsellers > h2', '#bestsellers > p'] },
      { id: 'section-4', name: 'EMI calculator', selector: ['#emi'], style: 'tc-center', blocks: ['calculator-emi'], defaultContent: ['#emi > h2', '#emi > p'] },
      { id: 'section-5', name: 'Dealers', selector: ['#dealers'], style: null, blocks: ['dealer-finder'], defaultContent: ['#dealers > h2', '#dealers > p'] },
      { id: 'section-6', name: 'Tata family', selector: ['#family'], style: null, blocks: ['carousel-reels'], defaultContent: ['#family > h2'] },
      { id: 'section-7', name: 'Quick actions', selector: ['#actions'], style: null, blocks: ['cards-action'], defaultContent: [] },
      { id: 'section-8', name: 'Why choose', selector: ['#why'], style: 'tc-why', blocks: [], defaultContent: ['#why > *'] },
      { id: 'section-9', name: 'Proof points', selector: ['#proof'], style: 'tc-black', blocks: ['cards-proof'], defaultContent: [] },
      { id: 'section-10', name: 'Sticky CTA', selector: ['#sticky'], style: null, blocks: ['cta-sticky'], defaultContent: [] },
    ],
  },
  'tata-cars-nav': {
    name: 'tata-cars-nav',
    description: 'Tata Cars header fragment: brand | sections | tools',
    path: '/tata-cars-nav',
    metadata: null, // fragment - no page metadata block
    blocks: [],
    sections: [
      { id: 'section-1', name: 'Brand', selector: ['.nav-brand'], style: null, blocks: [], defaultContent: ['.nav-brand p'] },
      { id: 'section-2', name: 'Sections', selector: ['.nav-sections'], style: null, blocks: [], defaultContent: ['.nav-sections > ul'] },
      { id: 'section-3', name: 'Tools', selector: ['.nav-tools'], style: null, blocks: [], defaultContent: ['.nav-tools > ul'] },
    ],
  },
  'tata-cars-footer': {
    name: 'tata-cars-footer',
    description: 'Tata Cars footer fragment: brand, newsletter (form-contact), range + links, contact + social',
    path: '/tata-cars-footer',
    metadata: null, // fragment - no page metadata block
    blocks: [
      { name: 'form-contact', instances: ['.footer-newsletter .lead-form'] },
    ],
    sections: [
      { id: 'section-1', name: 'Brand', selector: ['section.footer-brand'], style: null, blocks: [], defaultContent: ['section.footer-brand > *'] },
      { id: 'section-2', name: 'Newsletter', selector: ['section.footer-newsletter'], style: null, blocks: ['form-contact'], defaultContent: [] },
      { id: 'section-3', name: 'Links', selector: ['section.footer-links'], style: null, blocks: [], defaultContent: ['section.footer-links > *'] },
      { id: 'section-4', name: 'Contact', selector: ['section.footer-contact'], style: null, blocks: [], defaultContent: ['section.footer-contact > *'] },
    ],
  },
};

// TRANSFORMER REGISTRY
const transformers = [
  tatacarsSectionsTransformer,
];

function templateFor(url) {
  const file = (new URL(url).pathname.split('/').pop() || '').replace(/\.html?$/, '');
  return TEMPLATES[file] || TEMPLATES['tata-cars'];
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
 * (http://localhost:8090/images/tatacars/x.jpg) - rewrite back to site-relative paths.
 */
// Images live in the code repo (/images/tatacars/). They are referenced by absolute URL on the
// live Edge Delivery host so they also resolve in Universal Editor on AEM author (where the
// site-relative /images/... path does not exist) and can be ingested by Content Sync.
const IMAGE_HOST = 'https://main--exp-mord-agent--kevalteknopoint.aem.live';

function relativizeUrls(main) {
  main.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    const m = src.match(/^(?:https?:)?\/\/localhost(?::\d+)?(\/images\/tatacars\/[^?#]+)/i)
      || src.match(/^(\/images\/tatacars\/[^?#]+)/i);
    if (m) img.setAttribute('src', `${IMAGE_HOST}${m[1]}`);
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
