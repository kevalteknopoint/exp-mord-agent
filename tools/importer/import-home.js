/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the IDFC FIRST Bank template "home" (https://www.idfcfirst.bank.in/).
 * Orchestrates the block parsers and page transformers generated for this template.
 * The IDFC site lives under the /idfc root: the homepage becomes the root page itself and
 * other pages go below it at their live path; every page references the IDFC header and
 * footer fragments (SITE_ROOT/nav, SITE_ROOT/footer).
 */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import tabsProductsParser from './parsers/tabs-products.js';
import carouselFeaturesParser from './parsers/carousel-features.js';
import calculatorFinanceParser from './parsers/calculator-finance.js';
import carouselSpotlightParser from './parsers/carousel-spotlight.js';
import columnsAppParser from './parsers/columns-app.js';
import cardsAppLinksParser from './parsers/cards-app-links.js';
import carouselTestimonialParser from './parsers/carousel-testimonial.js';
import tabsArticlesParser from './parsers/tabs-articles.js';
import carouselAwardsParser from './parsers/carousel-awards.js';
import cardsStatsParser from './parsers/cards-stats.js';
import cardsSupportParser from './parsers/cards-support.js';
import cardsApplyNowParser from './parsers/cards-apply-now.js';

// TRANSFORMER IMPORTS
import idfcCleanupTransformer from './transformers/idfc-cleanup.js';
import idfcSectionsTransformer from './transformers/idfc-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'tabs-products': tabsProductsParser,
  'carousel-features': carouselFeaturesParser,
  'calculator-finance': calculatorFinanceParser,
  'carousel-spotlight': carouselSpotlightParser,
  'columns-app': columnsAppParser,
  'cards-app-links': cardsAppLinksParser,
  'carousel-testimonial': carouselTestimonialParser,
  'tabs-articles': tabsArticlesParser,
  'carousel-awards': carouselAwardsParser,
  'cards-stats': cardsStatsParser,
  'cards-support': cardsSupportParser,
  'cards-apply-now': cardsApplyNowParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "home",
  "description": "IDFC FIRST Bank homepage: hero slider, product tabs, feature/spotlight/award carousels, calculators, app promo, testimonials, articles, stats, support links, apply-now drawer",
  "urls": [
    "https://www.idfcfirst.bank.in/"
  ],
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        ".homepage-banner .embla-home-static-banner"
      ]
    },
    {
      "name": "tabs-products",
      "instances": [
        ".product-tabs .home-tab-content"
      ]
    },
    {
      "name": "carousel-features",
      "instances": [
        ".what-make-us-spl .special-embla-slider"
      ]
    },
    {
      "name": "calculator-finance",
      "instances": [
        ".calulator .revamp_financial_calc"
      ]
    },
    {
      "name": "carousel-spotlight",
      "instances": [
        ".spotlight .spotlight-carousel"
      ]
    },
    {
      "name": "columns-app",
      "instances": [
        ".adv-mobile-app .advance-mobile-app > .row"
      ]
    },
    {
      "name": "cards-app-links",
      "instances": [
        ".adv-mobile-app .bottom-nav"
      ]
    },
    {
      "name": "carousel-testimonial",
      "instances": [
        ".compliment .embla-testi-slider"
      ]
    },
    {
      "name": "tabs-articles",
      "instances": [
        ".manage-your-finance .home-blog-tab-content"
      ]
    },
    {
      "name": "carousel-awards",
      "instances": [
        ".awards-accordian .embla-awards-banner"
      ]
    },
    {
      "name": "cards-stats",
      "instances": [
        ".helping-communities .custom-div"
      ]
    },
    {
      "name": "cards-support",
      "instances": [
        ".getInTouch .get-intouch-revamp .col-lg-12"
      ]
    },
    {
      "name": "cards-apply-now",
      "instances": [
        ".apply-now.aem-GridColumn .apply-now-container"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc3",
      "name": "hero-carousel",
      "selector": [
        ".homepage-banner.aem-GridColumn",
        ".homepage-banner"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "rc4",
      "name": "app-scanner",
      "selector": [
        ".homepage-scanner.aem-GridColumn",
        ".homepage-scanner"
      ],
      "style": "app-scanner",
      "blocks": [],
      "defaultContent": [
        ".homepage-scanner .grnt-qr-new"
      ]
    },
    {
      "id": "rc5",
      "name": "product-tabs",
      "selector": [
        ".product-tabs.aem-GridColumn",
        ".product-tabs"
      ],
      "style": null,
      "blocks": [
        "tabs-products"
      ],
      "defaultContent": []
    },
    {
      "id": "rc6",
      "name": "what-makes-us-special",
      "selector": [
        ".what-make-us-spl.aem-GridColumn",
        ".what-make-us-spl"
      ],
      "style": null,
      "blocks": [
        "carousel-features"
      ],
      "defaultContent": [
        ".what-make-us-spl .what-make-special > .container > h2.title",
        ".what-make-us-spl .what-make-special > .container > p",
        ".what-make-us-spl .what-make-special > .container > a.knowMore"
      ]
    },
    {
      "id": "rc7",
      "name": "financial-calculators",
      "selector": [
        ".calulator.aem-GridColumn",
        ".calulator"
      ],
      "style": "dark-red",
      "blocks": [
        "calculator-finance"
      ],
      "defaultContent": []
    },
    {
      "id": "rc8",
      "name": "spotlight",
      "selector": [
        ".spotlight.aem-GridColumn",
        ".spotlight"
      ],
      "style": "light-grey",
      "blocks": [
        "carousel-spotlight"
      ],
      "defaultContent": [
        ".spotlight .spotlight-heading-container"
      ]
    },
    {
      "id": "rc9",
      "name": "mobile-app",
      "selector": [
        ".adv-mobile-app.aem-GridColumn",
        ".adv-mobile-app"
      ],
      "style": null,
      "blocks": [
        "columns-app",
        "cards-app-links"
      ],
      "defaultContent": []
    },
    {
      "id": "rc10",
      "name": "testimonials",
      "selector": [
        ".compliment.aem-GridColumn",
        ".compliment"
      ],
      "style": "light-grey",
      "blocks": [
        "carousel-testimonial"
      ],
      "defaultContent": [
        ".compliment .testimonial-section figure",
        ".compliment .testimonial-section h2.h2"
      ]
    },
    {
      "id": "rc11",
      "name": "manage-finances",
      "selector": [
        ".manage-your-finance.aem-GridColumn",
        ".manage-your-finance"
      ],
      "style": null,
      "blocks": [
        "tabs-articles"
      ],
      "defaultContent": [
        ".manage-your-finance h2.home-carousel-2-heading"
      ]
    },
    {
      "id": "rc12",
      "name": "awards",
      "selector": [
        ".awards-accordian.aem-GridColumn",
        ".awards-accordian"
      ],
      "style": null,
      "blocks": [
        "carousel-awards"
      ],
      "defaultContent": [
        ".awards-accordian .home-awards-sec > .container > h2.title",
        ".awards-accordian .home-awards-sec > .container > p.sub-title",
        ".awards-accordian .home-awards-sec > .container > a.knowMore"
      ]
    },
    {
      "id": "rc13",
      "name": "communities",
      "selector": [
        ".helping-communities.aem-GridColumn",
        ".helping-communities"
      ],
      "style": null,
      "blocks": [
        "cards-stats"
      ],
      "defaultContent": [
        ".helping-communities .communities-heading"
      ]
    },
    {
      "id": "rc14",
      "name": "get-in-touch",
      "selector": [
        ".getInTouch.aem-GridColumn",
        ".getInTouch"
      ],
      "style": "light-grey",
      "blocks": [
        "cards-support"
      ],
      "defaultContent": []
    },
    {
      "id": "rc15",
      "name": "mission-banner",
      "selector": [
        ".cust-friendly.aem-GridColumn",
        ".cust-friendly"
      ],
      "style": "mission",
      "blocks": [],
      "defaultContent": [
        ".cust-friendly .customer-friendly .col-lg-12"
      ]
    },
    {
      "id": "rc16",
      "name": "apply-now-drawer",
      "selector": [
        ".apply-now.aem-GridColumn"
      ],
      "style": null,
      "blocks": [
        "cards-apply-now"
      ],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY (sections transformer only when the template has 2+ sections)
const transformers = [
  idfcCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [idfcSectionsTransformer] : []),
];

// IDFC site root and its header/footer fragments
const SITE_ROOT = '/idfc';
const NAV_PATH = `${SITE_ROOT}/nav`;
const FOOTER_PATH = `${SITE_ROOT}/footer`;

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  // transformers get the template so the sections transformer can read its sections
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
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
 * @returns {Array} block instances found on the page
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
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Internal links → migrated paths below the IDFC root (/personal-banking/x → SITE_ROOT/personal-banking/x).
 * Files and DAM assets (/content/dam/…, *.pdf, …) keep their live URL; javascript: links become text.
 */
function rewriteLinks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href').trim();
    if (/^javascript:/i.test(href)) {
      a.replaceWith(...a.childNodes);
      return;
    }
    let u;
    try {
      u = new URL(href, 'https://www.idfcfirst.bank.in/');
    } catch (e) {
      return;
    }
    if (!/^(www\.)?idfcfirst\.bank\.in$/.test(u.hostname) || href.startsWith('#')) return;
    const isFile = u.pathname.startsWith('/content/') || /\.[a-z0-9]{2,5}$/i.test(u.pathname.replace(/\.html?$/, ''));
    if (isFile) {
      a.setAttribute('href', u.href);
      return;
    }
    const path = u.pathname.replace(/\/+$/, '').replace(/\.html?$/, '');
    a.setAttribute('href', `${SITE_ROOT}${path}${u.search}${u.hash}`);
  });
}

/** Page metadata from <head>, plus the IDFC header/footer fragments. */
function pageMetadata(document) {
  const head = (sel) => {
    const n = document.querySelector(sel);
    return n ? (n.getAttribute('content') || '').trim() : '';
  };
  const meta = {};
  const title = (document.title || head('meta[property="og:title"]')).trim();
  if (title) meta.Title = title;
  const description = head('meta[name="description"]') || head('meta[property="og:description"]');
  if (description) meta.Description = description;
  const keywords = head('meta[name="keywords"]');
  if (keywords) meta.Keywords = keywords;
  const ogImage = head('meta[property="og:image"]');
  if (ogImage) {
    const img = document.createElement('img');
    img.src = ogImage;
    meta.Image = img;
  }
  meta.nav = NAV_PATH;
  meta.footer = FOOTER_PATH;
  return meta;
}

// card links that are empty overlays on the source (award and article cards): the importer
// drops empty <a> elements before transform runs, so give them a label while the page is live
const OVERLAY_LINKS = '.awards-accordian a.link[href], .manage-your-finance a.blog-action[href]';

export default {
  onLoad: async ({ document }) => {
    document.querySelectorAll(OVERLAY_LINKS).forEach((a) => {
      if (!a.textContent.trim()) a.textContent = 'Read more';
    });
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    // metadata is read before the transformers clean up the page
    const meta = pageMetadata(document);

    // 1. initial cleanup and section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. find and 3. parse the blocks (skip elements already replaced by an earlier parser)
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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

    // 4. final cleanup and section metadata, then internal links → migrated paths
    executeTransformers('afterTransform', main, payload);
    rewriteLinks(main);

    // 5. page metadata (own block, for the IDFC nav/footer paths) and built-in rules
    main.appendChild(document.createElement('hr'));
    main.appendChild(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. document path below the IDFC root: the homepage is the root page itself, other pages
    //    keep their live path below it (never empty, which would crash the bundled importer)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(`${SITE_ROOT}${rawPath}`);

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
