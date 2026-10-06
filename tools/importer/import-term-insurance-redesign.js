/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCalculatorParser from './parsers/hero-calculator.js';
import cardsPricingParser from './parsers/cards-pricing.js';
import cardsPlanParser from './parsers/cards-plan.js';
import cardsIconListParser from './parsers/cards-icon-list.js';
import carouselPersonaParser from './parsers/carousel-persona.js';
import embedVideoParser from './parsers/embed-video.js';
import cardsPlanLinksParser from './parsers/cards-plan-links.js';
import cardsFeatureGridParser from './parsers/cards-feature-grid.js';
import columnsCalculatorParser from './parsers/columns-calculator.js';
import cardsStatsParser from './parsers/cards-stats.js';
import accordionSeoParser from './parsers/accordion-seo.js';
import tableRoundedParser from './parsers/table-rounded.js';
import tableComparisonParser from './parsers/table-comparison.js';
import cardsLabelBoxParser from './parsers/cards-label-box.js';
import columnsDurationParser from './parsers/columns-duration.js';
import cardsTextTileParser from './parsers/cards-text-tile.js';
import columnsImageTableParser from './parsers/columns-image-table.js';
import carouselReviewsParser from './parsers/carousel-reviews.js';
import formCallbackParser from './parsers/form-callback.js';
import cardsArticleParser from './parsers/cards-article.js';
import tabsFaqParser from './parsers/tabs-faq.js';

// TRANSFORMER IMPORTS
import tataaiaRedesignTransformer from './transformers/tataaia-redesign.js';
import tataaiaCleanupTransformer from './transformers/tataaia-cleanup.js';
import tataaiaSectionsTransformer from './transformers/tataaia-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-calculator': heroCalculatorParser,
  'cards-pricing': cardsPricingParser,
  'cards-plan': cardsPlanParser,
  'cards-icon-list': cardsIconListParser,
  'carousel-persona': carouselPersonaParser,
  'embed-video': embedVideoParser,
  'cards-plan-links': cardsPlanLinksParser,
  'cards-feature-grid': cardsFeatureGridParser,
  'columns-calculator': columnsCalculatorParser,
  'cards-stats': cardsStatsParser,
  'accordion-seo': accordionSeoParser,
  'table-rounded': tableRoundedParser,
  'table-comparison': tableComparisonParser,
  'cards-label-box': cardsLabelBoxParser,
  'columns-duration': columnsDurationParser,
  'cards-text-tile': cardsTextTileParser,
  'columns-image-table': columnsImageTableParser,
  'carousel-reviews': carouselReviewsParser,
  'form-callback': formCallbackParser,
  'cards-article': cardsArticleParser,
  'tabs-faq': tabsFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - derived from page-templates.json (life-insurance-plans), sections
// re-ordered / re-anchored / restyled for the Figma redesign (designOrder = redesign-spec.md #)
const PAGE_TEMPLATE = {
  "name": "term-insurance-redesign",
  "description": "Tata AIA term insurance page - Figma redesign order (migration-work/figma-ref/redesign-spec.md): reordered live sections, dropped sections removed, new calculator / age cards / how-to-buy / popular-searches sections",
  "urls": [
    "https://www.tataaia.com/life-insurance-plans/term-insurance.html"
  ],
  "blocks": [
    {
      "name": "hero-calculator",
      "instances": [
        ".nolead-calc-banner-wrapper .term-calculator-container"
      ]
    },
    {
      "name": "cards-pricing",
      "instances": [
        ".insurance-coverage-cards.container-category-price"
      ]
    },
    {
      "name": "cards-plan",
      "instances": [
        ".coveragecardcontainer.content-center",
        ".categorypage-fourcards.coveragecardcontainer"
      ]
    },
    {
      "name": "cards-icon-list",
      "instances": [
        "#container-526c3450ed",
        "#container-30eac4a7ea"
      ]
    },
    {
      "name": "carousel-persona",
      "instances": [
        ".who-buy-cards-parent.ta-container .who-buy-cards"
      ]
    },
    {
      "name": "embed-video",
      "instances": [
        ".youtube-center-brush .youtubevideo"
      ]
    },
    {
      "name": "cards-plan-links",
      "instances": [
        ".termplan-cards"
      ]
    },
    {
      "name": "cards-feature-grid",
      "instances": [
        ".investment-plan-cards-redesign"
      ]
    },
    {
      "name": "columns-calculator",
      "instances": [
        ".newpremiumcalc-container .newcalculatepremium"
      ]
    },
    {
      "name": "cards-stats",
      "instances": [
        ".whychoose-cards > .cmp-container > .container"
      ]
    },
    {
      "name": "accordion-seo",
      "instances": [
        ".faq-accordion-investment-plan .ta-fq-content-w",
        ".accordion-first-section > .cmp-accordion > .cmp-accordion__item:nth-of-type(2)"
      ]
    },
    {
      "name": "table-rounded",
      "instances": [
        ".term-insurance-table",
        ".term-table-text.four-column-table",
        ".term-table-text.table-head-red",
        ".term-table-text.document-table-center",
        "[id=\"40\"] > .term-table-text"
      ]
    },
    {
      "name": "table-comparison",
      "instances": [
        ".compare-term-plan-table .compare-table-wrapper"
      ]
    },
    {
      "name": "cards-label-box",
      "instances": [
        ".leadproxyteaser.newlaunch-var-two"
      ]
    },
    {
      "name": "columns-duration",
      "instances": [
        ".life-cover.ta-container"
      ]
    },
    {
      "name": "cards-text-tile",
      "instances": [
        ".who-buy-cards-mob-swiper .who-buy-cards"
      ]
    },
    {
      "name": "columns-image-table",
      "instances": [
        ".claim-image-table"
      ]
    },
    {
      "name": "carousel-reviews",
      "instances": [
        ".testinomial-cards"
      ]
    },
    {
      "name": "form-callback",
      "instances": [
        ".tte-form-countrycode"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        ".blog-corouselstatic"
      ]
    },
    {
      "name": "tabs-faq",
      "instances": [
        ".faq-tabs"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Page title and intro",
      "selector": [
        ".breadcrumb"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 1
    },
    {
      "id": "section-2",
      "name": "Above-the-fold promo + calculator",
      "selector": [
        ".nolead-calc-banner-wrapper"
      ],
      "style": null,
      "blocks": [
        "hero-calculator"
      ],
      "defaultContent": [],
      "designOrder": 2
    },
    {
      "id": "section-3",
      "name": "In-page anchor navigation",
      "selector": [
        ".newsecondarynavigation"
      ],
      "style": "anchor-nav",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 3
    },
    {
      "id": "section-4",
      "name": "Coverage tier price cards + reviewer byline",
      "selector": [
        "#container-f3864d3a26"
      ],
      "style": "light-blue",
      "blocks": [
        "cards-pricing"
      ],
      "defaultContent": [],
      "designOrder": 4
    },
    {
      "id": "section-4b",
      "name": "Author / reviewer byline",
      "selector": [
        "#redesign-byline"
      ],
      "style": "light-blue, byline",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 4
    },
    {
      "id": "section-6",
      "name": "What is term insurance",
      "selector": [
        "#leadproxytext-5179f9a894"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 5
    },
    {
      "id": "section-9",
      "name": "How a term plan works",
      "selector": [
        "div.container.responsivegrid.mob-pt-20.pt-30"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 6
    },
    {
      "id": "section-8",
      "name": "Bestselling plans + example",
      "selector": [
        ".mob-mt-5.mt-40.enhancecoveragecontainer.enhance-container-tab"
      ],
      "style": null,
      "blocks": [
        "cards-plan"
      ],
      "defaultContent": [],
      "designOrder": 7
    },
    {
      "id": "section-13",
      "name": "Term plan quick links slider",
      "selector": [
        "#container-f4164bf945"
      ],
      "style": "light-blue",
      "blocks": [
        "cards-plan-links"
      ],
      "defaultContent": [],
      "designOrder": 8
    },
    {
      "id": "section-10",
      "name": "Why buy term insurance",
      "selector": [
        "#container-d2b88fc833"
      ],
      "style": null,
      "blocks": [
        "cards-icon-list"
      ],
      "defaultContent": [],
      "designOrder": 9
    },
    {
      "id": "section-12",
      "name": "Explainer video",
      "selector": [
        "#container-cd5dfce657"
      ],
      "style": "light-blue",
      "blocks": [
        "embed-video"
      ],
      "defaultContent": [],
      "designOrder": 10
    },
    {
      "id": "section-14",
      "name": "Features of term insurance",
      "selector": [
        "#container-1ba1e4524a"
      ],
      "style": null,
      "blocks": [
        "cards-feature-grid"
      ],
      "defaultContent": [],
      "designOrder": 11
    },
    {
      "id": "section-15",
      "name": "1 Crore premium calculator",
      "selector": [
        ".newpremiumcalc-container"
      ],
      "style": "light-blue",
      "blocks": [
        "columns-calculator"
      ],
      "defaultContent": [],
      "designOrder": 12
    },
    {
      "id": "section-16",
      "name": "Why choose Tata AIA stats",
      "selector": [
        ".whychoose-cards"
      ],
      "style": null,
      "blocks": [
        "cards-stats"
      ],
      "defaultContent": [],
      "designOrder": 13
    },
    {
      "id": "section-17",
      "name": "Who should buy slider",
      "selector": [
        "#container-217c32ab0c"
      ],
      "style": "light-blue",
      "blocks": [
        "carousel-persona"
      ],
      "defaultContent": [],
      "designOrder": 14
    },
    {
      "id": "section-18",
      "name": "Life stages accordion",
      "selector": [
        "#container-9d7e57cecd"
      ],
      "style": null,
      "blocks": [
        "accordion-seo"
      ],
      "defaultContent": [],
      "designOrder": 15
    },
    {
      "id": "section-20",
      "name": "Types of term plans",
      "selector": [
        "#container-f942407c45"
      ],
      "style": "light-blue",
      "blocks": [
        "cards-feature-grid"
      ],
      "defaultContent": [],
      "designOrder": 16
    },
    {
      "id": "section-21",
      "name": "Term vs whole life table",
      "selector": [
        "#leadproxytext-4fac5f6122"
      ],
      "style": null,
      "blocks": [
        "table-rounded"
      ],
      "defaultContent": [],
      "designOrder": 17
    },
    {
      "id": "section-22",
      "name": "Best plans table",
      "selector": [
        "#container-5caf9ff5af"
      ],
      "style": "light-blue",
      "blocks": [
        "table-rounded"
      ],
      "defaultContent": [],
      "designOrder": 18
    },
    {
      "id": "section-23",
      "name": "Best plans cards",
      "selector": [
        ".rider-bg.faq_acc_with-viewallbtn"
      ],
      "style": null,
      "blocks": [
        "cards-plan"
      ],
      "defaultContent": [],
      "designOrder": 19
    },
    {
      "id": "section-23b",
      "name": "How to choose the best term plan accordion",
      "selector": [
        "#container-5030569737"
      ],
      "style": "light-blue",
      "blocks": [
        "accordion-seo"
      ],
      "defaultContent": [],
      "designOrder": "19b"
    },
    {
      "id": "section-24",
      "name": "Choose plan as per needs",
      "selector": [
        "#container-fadf1d54e1"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 20
    },
    {
      "id": "section-25",
      "name": "Plan comparison table + explanation",
      "selector": [
        "#container-4a5dfb47f8"
      ],
      "style": "light-blue",
      "blocks": [
        "table-comparison"
      ],
      "defaultContent": [],
      "designOrder": 21
    },
    {
      "id": "section-26",
      "name": "Family financial future callout",
      "selector": [
        "#container-2c038f2903"
      ],
      "style": null,
      "blocks": [
        "cards-label-box"
      ],
      "defaultContent": [],
      "designOrder": 22
    },
    {
      "id": "section-new-term-calculator",
      "name": "NEW Term Calculator - check premium in 2 steps",
      "selector": [
        "#redesign-term-calculator"
      ],
      "style": "light-blue",
      "blocks": [
        "hero-calculator"
      ],
      "defaultContent": [],
      "designOrder": 23
    },
    {
      "id": "section-28",
      "name": "Factors affecting premiums",
      "selector": [
        "#container-33e50a7826"
      ],
      "style": null,
      "blocks": [
        "cards-icon-list"
      ],
      "defaultContent": [],
      "designOrder": 24
    },
    {
      "id": "section-29",
      "name": "Cover needed",
      "selector": [
        "#container-771a9a44bf"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 25
    },
    {
      "id": "section-30",
      "name": "Infographic image",
      "selector": [
        "#container-8edf4bc779"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 26
    },
    {
      "id": "section-31",
      "name": "Sum assured importance",
      "selector": [
        "#container-9dfa60f0af"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 27
    },
    {
      "id": "section-32",
      "name": "Policy period",
      "selector": [
        "#container-1c542e2ae3"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 28
    },
    {
      "id": "section-33",
      "name": "Right duration promo",
      "selector": [
        "#container-f4882e2f04"
      ],
      "style": "light-blue",
      "blocks": [
        "columns-duration"
      ],
      "defaultContent": [],
      "designOrder": 29
    },
    {
      "id": "section-33b",
      "name": "How delaying term insurance can cost you + NEW age cards",
      "selector": [
        "#leadproxytext-1bfd9816cd"
      ],
      "style": null,
      "blocks": [
        "cards-stats"
      ],
      "defaultContent": [],
      "designOrder": 30
    },
    {
      "id": "section-34",
      "name": "Affordable tips tiles",
      "selector": [
        "#container-defa9db8ad"
      ],
      "style": "light-blue",
      "blocks": [
        "cards-text-tile"
      ],
      "defaultContent": [],
      "designOrder": 31
    },
    {
      "id": "section-35",
      "name": "Payout options table",
      "selector": [
        "#leadproxytext-8e6b531b6b"
      ],
      "style": null,
      "blocks": [
        "table-rounded"
      ],
      "defaultContent": [],
      "designOrder": 32
    },
    {
      "id": "section-36",
      "name": "What is a rider",
      "selector": [
        "#container-8332a7d055"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 33
    },
    {
      "id": "section-37",
      "name": "Rider types",
      "selector": [
        "[id=\"27\"]"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 34
    },
    {
      "id": "section-38",
      "name": "Riders importance",
      "selector": [
        "#container-b2a7b4132b"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 35
    },
    {
      "id": "section-39",
      "name": "Critical illness rider + rising health risks",
      "selector": [
        ".mob-mb-20.page-container.max-wid550"
      ],
      "style": null,
      "blocks": [
        "cards-label-box"
      ],
      "defaultContent": [],
      "designOrder": 36
    },
    {
      "id": "section-39b",
      "name": "Top riders",
      "selector": [
        "#container-16ed44abb5"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 37
    },
    {
      "id": "section-40",
      "name": "Plan benefits",
      "selector": [
        "#container-d35e3a192d"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 38
    },
    {
      "id": "section-41",
      "name": "Eligibility",
      "selector": [
        "#leadproxytext-ae2ba99d42"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 39
    },
    {
      "id": "section-42",
      "name": "Covered vs not covered",
      "selector": [
        "#container-1618092523"
      ],
      "style": null,
      "blocks": [
        "table-rounded"
      ],
      "defaultContent": [],
      "designOrder": 40
    },
    {
      "id": "section-43",
      "name": "Common mistakes",
      "selector": [
        "#leadproxytext-3a445fa119"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 41
    },
    {
      "id": "section-44",
      "name": "Why buy online tiles",
      "selector": [
        "#container-92e8aae3a5"
      ],
      "style": null,
      "blocks": [
        "cards-text-tile"
      ],
      "defaultContent": [],
      "designOrder": 42
    },
    {
      "id": "section-new-how-to-buy",
      "name": "NEW How to buy term insurance",
      "selector": [
        "#redesign-how-to-buy"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 43
    },
    {
      "id": "section-45",
      "name": "Documents list",
      "selector": [
        "#container-b2fe259e25"
      ],
      "style": null,
      "blocks": [
        "table-rounded"
      ],
      "defaultContent": [],
      "designOrder": 44
    },
    {
      "id": "section-45b",
      "name": "Claim process",
      "selector": [
        "#leadproxytext-4cf3e377b6"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 45
    },
    {
      "id": "section-46",
      "name": "Avoid claim rejection",
      "selector": [
        "#container-6f11a5e168"
      ],
      "style": null,
      "blocks": [
        "cards-feature-grid"
      ],
      "defaultContent": [],
      "designOrder": 46
    },
    {
      "id": "section-47",
      "name": "Claim documents table",
      "selector": [
        "#leadproxytext-7f29512ee4"
      ],
      "style": "light-blue",
      "blocks": [
        "table-rounded"
      ],
      "defaultContent": [],
      "designOrder": 47
    },
    {
      "id": "section-48",
      "name": "Claim approval time",
      "selector": [
        "#container-6ed3066365"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 48
    },
    {
      "id": "section-49",
      "name": "Claim settlement ratio",
      "selector": [
        "#leadproxytext-45dbbbfc29"
      ],
      "style": "light-blue",
      "blocks": [
        "columns-image-table"
      ],
      "defaultContent": [],
      "designOrder": 49
    },
    {
      "id": "section-50",
      "name": "Key terms",
      "selector": [
        "#container-74e18de16e"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [],
      "designOrder": 50
    },
    {
      "id": "section-51",
      "name": "Takeaways",
      "selector": [
        "#leadproxytext-c876bebae1"
      ],
      "style": "light-blue",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 51
    },
    {
      "id": "section-52",
      "name": "Customer reviews carousel",
      "selector": [
        ".voiceof-happy-customer"
      ],
      "style": null,
      "blocks": [
        "carousel-reviews"
      ],
      "defaultContent": [],
      "designOrder": 52
    },
    {
      "id": "section-53",
      "name": "Call-back lead form",
      "selector": [
        ".tte-form-redesign"
      ],
      "style": "light-blue",
      "blocks": [
        "form-callback"
      ],
      "defaultContent": [],
      "designOrder": 53
    },
    {
      "id": "section-54",
      "name": "Related articles slider",
      "selector": [
        "#container-0e5e661886"
      ],
      "style": null,
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [],
      "designOrder": 54
    },
    {
      "id": "section-55",
      "name": "FAQs, disclaimer, last updated",
      "selector": [
        "#container-593dd46a6a"
      ],
      "style": null,
      "blocks": [
        "tabs-faq",
        "accordion-seo"
      ],
      "defaultContent": [],
      "designOrder": 55
    },
    {
      "id": "section-new-popular-searches",
      "name": "NEW Popular searches",
      "selector": [
        "#redesign-popular-searches"
      ],
      "style": "link-pills",
      "blocks": [],
      "defaultContent": [],
      "designOrder": 56
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  // redesign MUST run first: its beforeTransform drops/reorders grid children before
  // tataaia-sections inserts the <hr> section breaks
  tataaiaRedesignTransformer,
  tataaiaCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [tataaiaSectionsTransformer] : []),
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

    // 1. beforeTransform (initial cleanup + section break markers)
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

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Output path is fixed: the redesign is imported from the live term-insurance URL into a separate
    //    top-level document (Content Sync only lists top-level pages) so /term-insurance stays untouched
    const path = WebImporter.FileUtils.sanitizePath('/term-insurance-redesign');

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
