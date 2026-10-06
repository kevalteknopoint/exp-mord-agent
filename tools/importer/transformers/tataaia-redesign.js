/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Tata AIA term-insurance REDESIGN.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Design / section order: migration-work/figma-ref/redesign-spec.md (Figma redesign, slices s-00..s-19).
 *
 * Must run FIRST in the transformer chain (before tataaia-cleanup and tataaia-sections):
 *   beforeTransform
 *     1. fills lazy-loaded values the importer never sees (plan comparison table, ₹1 Cr premium,
 *        calculator CTA) - captured from the live page after lazy-load
 *        (migration-work/figma-ref/live/compare-table.rendered.html, premium-calc.rendered.html)
 *     2. removes the live sections / containers that are not part of the design
 *     3. reorders the kept main-grid children into the design order and inserts placeholders /
 *        default content for the NEW design sections (age cards, how to buy, popular searches)
 *     -> tataaia-sections then inserts the <hr> section breaks before every section anchor of
 *        PAGE_TEMPLATE.sections, so breaks follow the new DOM order.
 *   afterTransform
 *     4. builds the 2nd hero-calculator block instance ("Term Calculator – Check premium in just 2 steps")
 *        from the already-parsed hero block (same image + same CTA link) using the hero-calculator
 *        parser's cell / field-hint structure (image | text | calculator).
 *
 * Main content lives in the children of
 *   body > div.root.responsivegrid > div.aem-Grid > div.responsivegrid.aem-GridColumn > div.aem-Grid
 * (verified in migration-work/cleaned.html). Every grid child is located through a unique selector it
 * contains, never by index.
 */

const H = { before: 'beforeTransform', after: 'afterTransform' };

const TATAAIA = 'https://www.tataaia.com';

// Placeholder ids for the NEW design sections (also used as section anchors in PAGE_TEMPLATE.sections)
const NEW_IDS = {
  calculator: 'redesign-term-calculator',
  ageCards: 'redesign-age-cards',
  howToBuy: 'redesign-how-to-buy',
  popularSearches: 'redesign-popular-searches',
  byline: 'redesign-byline',
};

/* ------------------------------------------------------------------------------------------------
 * 1. Lazy-loaded values (captured from the rendered live page)
 * ---------------------------------------------------------------------------------------------- */

// [row label, [ group (Minimum / Maximum / single) -> [plan 1 html, plan 2 html] ]]
const COMPARE_ROWS = [
  ["Entry Age (years)", [["<p>18</p>","<p>18</p>"],["<p>65</p>","<p>65</p>"]]],
  ["Maturity Age (years)", [["<p>22</p>","<p>28</p>"],["<p>100</p>","<p>100</p>"]]],
  ["Pay premium for (Premium Payment Term in years)", [["<ul> <li><b>Single Pay</b></li> <li><b>Limited Pay</b>: 4 years</li> <li><b>Regular Pay</b>: 4 years</li> </ul>","<ul> <li><b>Single Pay</b></li> <li><b>Limited Pay</b>: 5 years</li> <li><b>Regular Pay</b>: 10 years</li> </ul>"],["<ul> <li><b>Single Pay</b></li> <li><b>Limited Pay</b>: Benefit Option Term minus 1 year (Max. 81 years)</li> <li><b>Regular Pay</b>:Same as Benefit Option Term (Max. 82 years)</li> </ul>","<ul> <li><b>Single Pay</b></li> <li><b>Limited Pay</b>: Benefit Option Term minus 1 year (Max. 81 years)</li> <li><b>Regular Pay</b>:Same as Benefit Option Term (Max. 82 years)</li> </ul>"]]],
  ["Stay covered for (Policy Term in years)", [["<ul> <li><b>Single Pay:</b>5 years</li> <li><b>Limited Pay</b>: 5 years</li> <li><b>Regular Pay</b>: 4 years</li> </ul>","<p>10</p>"],["<p>82 (Subject to max. maturity age of 100 years)</p>","<p>82 (Subject to max. maturity age of 100 years)</p>"]]],
  ["Life cover (Basic Sum Assured in Rs)", [["<p>50 Lakh</p>","<p>2 Crore</p>"],["<p>No limit, subject to Board Approved Underwriting Policy (BAUP)</p>","<p>No limit, subject to Board Approved Underwriting Policy (BAUP)</p>"]]],
  ["Premium payment mode", [["<p>Annual/Semi-annual/Quarterly/Monthly</p>","<p>Annual/Semi-annual/Quarterly/Monthly</p>"]]],
  ["Death benefit", [["<p>Lump sum life cover paid to the claimant on death of the Life Assured</p>","<p>Lump sum life cover paid to the claimant on death of the Life Assured</p>"]]],
  ["Option to cover till age of 100", [["<p>Yes</p>","<p>Yes</p>"]]],
  ["Return of premium", [["<p>No</p>","<p>100% of total base plan premiums paid (excl. loading, taxes &amp; discount) returned on survival</p>"]]],
  ["Terminal illness cover", [["<p>50% Basic Sum Assured paid on terminal Illness and future premiums waived off; remaining amount paid to the nominee on death of the Life Assured</p>","<p>50% Basic Sum Assured paid on terminal Illness and future premiums waived off; remaining amount paid to the nominee on death of the Life Assured</p>"]]],
  ["Early exit feature", [["<p>No</p>","<p>100% Surrender Value anytime after 25 years</p>"]]],
  ["Instant claim payout", [["<p>Instant death benefit of ₹ 3 Lakh from the Sum Assured will be paid upon claim registration and submission of basic documents</p>","<p>Instant death benefit of ₹ 3 Lakh from the Sum Assured will be paid upon claim registration and submission of basic documents</p>"]]],
  ["FlexiPay (Pay later) benefit", [["<p>Flexibility to delay premiums for a block of 12 months without any interest with life cover intact</p>","<p>Flexibility to delay premiums for a block of 12 months without any interest with life cover intact</p>"]]],
  ["Health benefit", [["<p>Option to attach health riders<sup>4</sup></p>","<p>Option to attach health riders<sup>4</sup></p>"]]],
  ["Tax benefit on premiums paid", [["<p>Yes, under section 80C</p>","<p>Yes, under section 80C</p>"]]],
  ["Tax on death benefit", [["<p>Tax-free</p>","<p>Tax-free</p>"]]],
  ["Digital purchase discount", [["<ul> <li><b>Single Pay:</b> 1%</li> <li><b>Limited/Regular Pay</b>: 10% on 1st year premium</li> </ul>","<ul> <li><b>Single Pay:</b> 1%</li> <li><b>Limited/Regular Pay:</b> 10% on 1st year premium</li> </ul>"]]],
  ["Salaried personnel discount", [["<ul> <li><b>Single Pay:</b> 1%</li> <li><b>Limited/Regular Pay:</b> 8.5% On 1st year premium</li> </ul>","<ul> <li><b>Single Pay:</b> 1%</li> <li><b>Limited/Regular Pay:</b> 8.5% On 1st year premium</li> </ul>"]]],
  ["Female premium benefit", [["<p>15% Lower premium for women</p>","<p>15% Lower premium for women</p>"]]],
  ["Milestone discount", [["<ul> <li><b>Single Pay:</b> 0.5%</li> <li><b>Limited/Regular Pay:</b> 2% on 1st year premium for first jobbers, newly-weds, first-time parents and recent homeowners (max. Rs. 500)</li> </ul>","<p>No</p>"]]],
  ["Tata Group staff discount", [["<ul> <li><b>Single Pay:</b> 2%</li> <li><b>Limited/Regular Pay:</b> 12% On 1st year premium</li> </ul>",""]]],
  ["Other discounts", [["<p>Loyalty Program Benefit under Tata Digital: Neu coins<sup>6</sup> credited</p> <ul> <li><b>Single Pay:</b> 0.5%</li> <li><b>Limited/Regular Pay:</b> 5%</li> </ul>","<p>Loyalty Program Benefit under Tata Digital: Neu coins<sup>6</sup> credited </p> <ul> <li> <b>Single Pay:</b> 0.5%</li> <li><b> Limited/Regular Pay:</b> 5%</li> </ul>"]]],
];
const COMPARE_CTAS = [
  "https://sellonline.tataaia.com/wps/PA_TATAAIA_SO/CampaignRedirection?campaign=BO&product=373&camcode=2042&cid=website:link:termcategorypage::sampoornarakshapromise:comparetermplans_srplifepromise:2042",
  "https://sellonline.tataaia.com/wps/PA_TATAAIA_SO/CampaignRedirection?campaign=BO&product=367&camcode=2042&cid=website:link:termcategorypage::maharakshasupremeselect:comparetermplans_mrsslifesecure:2042"
];

// premium-calc.rendered.html: span.newpremcalc_termvalue + button[data-calcbtnlink]
const PREMIUM_1CR = '₹ 589';
const PREMIUM_CTA = 'https://sellonline.tataaia.com/app/products?product=SRP&campaign=BO&camcode=2066&cid=website:link:terminsurancecalculatorwidget::sampoornarakshapromise:terminsurance:2066&sourcePage=https://www.tataaia.com/life-insurance-plans/term-insurance.html';

const norm = (t) => (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const normKey = (t) => norm(t).toLowerCase();

function fillComparisonTable(root, doc) {
  const wrapper = root.querySelector('.compare-term-plan-table .compare-table-wrapper');
  if (!wrapper) {
    console.warn('[tataaia-redesign] comparison table not found');
    return;
  }
  const data = new Map(COMPARE_ROWS.map(([label, groups]) => [normKey(label), groups]));
  let filled = 0;
  wrapper.querySelectorAll('.table-rows-data').forEach((row) => {
    const labelEl = row.querySelector('.plan-name');
    const groupsData = labelEl && data.get(normKey(labelEl.textContent));
    if (!groupsData) return;
    const groups = [...row.querySelectorAll(':scope > .parent-table-data > div')];
    groups.forEach((g, gi) => {
      const values = groupsData[gi];
      if (!values) return;
      let inner = g.querySelector(':scope > .inner-column');
      if (!inner) {
        inner = doc.createElement('div');
        inner.className = 'inner-column';
        g.append(inner);
      }
      values.forEach((html, ci) => {
        let col = inner.querySelectorAll(':scope > div')[ci];
        if (!col) {
          col = doc.createElement('div');
          inner.append(col);
        }
        let pd = col.querySelector('.plan-data');
        if (!pd) {
          pd = doc.createElement('div');
          pd.className = 'plan-data';
          col.append(pd);
        }
        if (!norm(pd.textContent) && html) {
          pd.innerHTML = html;
          filled += 1;
        }
      });
    });
  });

  // "Buy Now" CTAs: the importer sees href="#" until the plan data loads
  const ctas = [...wrapper.querySelectorAll('.redirection-button-container a.redirect-btn, .redirection-button-container .btn-container a')]
    .filter((a, i, arr) => arr.indexOf(a) === i);
  ctas.forEach((a, i) => {
    const href = a.getAttribute('href') || '';
    if (COMPARE_CTAS[i] && (!href || href === '#' || href.startsWith('javascript'))) a.setAttribute('href', COMPARE_CTAS[i]);
  });
  console.log(`[tataaia-redesign] comparison table: filled ${filled} empty plan cells`);
}

function fillPremiumCalculator(root) {
  const calc = root.querySelector('.newpremiumcalc-container .newcalculatepremium');
  if (!calc) {
    console.warn('[tataaia-redesign] 1 Cr premium calculator not found');
    return;
  }
  const value = calc.querySelector('.premium-details .newpremcalc_termvalue');
  if (value && !norm(value.textContent)) value.textContent = PREMIUM_1CR;
  // the columns-calculator parser reads data-href; the live button only carries data-calcbtnlink
  const btn = calc.querySelector('button.newprem__calc_button');
  if (btn && !btn.getAttribute('data-href')) {
    btn.setAttribute('data-href', btn.getAttribute('data-calcbtnlink') || PREMIUM_CTA);
  }
}

/* ------------------------------------------------------------------------------------------------
 * 2./3. Drop + reorder
 * ---------------------------------------------------------------------------------------------- */

function findGrid(root) {
  const grid = root.querySelector('div.root.responsivegrid > div.aem-Grid > div.responsivegrid.aem-GridColumn > div.aem-Grid');
  if (grid) return grid;
  const hero = root.querySelector('.nolead-calc-banner-wrapper');
  return hero ? hero.parentElement : null;
}

// grid child containing the first match of selector (or the match itself if it is a grid child)
function gridChild(grid, selector) {
  let el = grid.querySelector(`:scope > ${selector}`) || grid.querySelector(selector);
  while (el && el.parentElement !== grid) el = el.parentElement;
  return el || null;
}

// Live grid children that are NOT in the design (redesign-spec.md "Dropped live sections")
const DROP = [
  '.interlinking-widget', // section-5 grey interlinking pills
  '.benefits-ills-mob-font-20', // section-7 benefits illustration tabs
  '#container-2ff58935c7', // section-7 (empty swiper overlay container)
  '#container-916e0a3aec', // section-11 persona examples slider
  '#container-adaee19218', // section-19 cards-factor "Factors impacting savings plan premium"
  '#container-fc5f3371ba', // section-27 "When should you buy" table
  '#container-b2c8b612e3', // section-29 "Can NRIs buy term insurance in India?"
  '#leadproxytext-1eeff73bd5', // section-33 "Understanding the age factor..."
  '.term-insurance-hightlights', // section-33 age-factor highlights
  '#container-e553947e67', // section-49 "Is GST applicable on term insurance"
  '#leadproxytext-82cd37ae67', // section-51 "Key Term Insurance Insights"
];

// Design order (redesign-spec.md table, # 1..56): each entry = grid children (by contained selector)
// or a NEW placeholder id.
const ORDER = [
  /* 1 */ ['.breadcrumb', '.term-insurance-maininfo-container'],
  /* 2 */ ['.nolead-calc-banner-wrapper'],
  /* 3 */ ['.newsecondarynavigation'],
  /* 4 */ ['#container-f3864d3a26'],
  /* 5 */ ['#leadproxytext-5179f9a894'],
  /* 6 */ ['#container-1bc7d25ffb'], // section-9 How does a term plan work
  /* 7 */ ['.mob-mt-5.mt-40.enhancecoveragecontainer.enhance-container-tab', '#container-fd213a4373', '#container-0d02e02de8'], // section-8
  /* 8 */ ['#container-f4164bf945'], // section-13 Tata AIA Term plans
  /* 9 */ ['#container-d2b88fc833'], // section-10
  /* 10 */ ['#container-cd5dfce657'], // section-12 video
  /* 11 */ ['#container-1ba1e4524a'],
  /* 12 */ ['.newpremiumcalc-container'],
  /* 13 */ ['.whychoose-cards'],
  /* 14 */ ['#container-217c32ab0c'],
  /* 15 */ ['#container-9d7e57cecd'],
  /* 16 */ ['#container-f942407c45'],
  /* 17 */ ['#leadproxytext-4fac5f6122', '.term-insurance-table'],
  /* 18 */ ['#container-5caf9ff5af'],
  /* 19 */ ['.rider-bg.faq_acc_with-viewallbtn', '#container-475bf0458f'],
  /* 20 */ ['#container-fadf1d54e1'],
  /* 21 */ ['#container-4a5dfb47f8'],
  /* 22 */ ['#container-2c038f2903'],
  /* 23 */ [`#${NEW_IDS.calculator}`],
  /* 24 */ ['#container-33e50a7826'],
  /* 25 */ ['#container-771a9a44bf'],
  /* 26 */ ['#container-8edf4bc779'],
  /* 27 */ ['#container-9dfa60f0af'],
  /* 28 */ ['#container-1c542e2ae3', '#container-4c0d0d1c34'],
  /* 29 */ ['#container-f4882e2f04'],
  /* 30 */ ['#leadproxytext-1bfd9816cd'],
  /* 31 */ ['#container-defa9db8ad'],
  /* 32 */ ['#leadproxytext-8e6b531b6b'],
  /* 33 */ ['#container-8332a7d055'],
  /* 34 */ ['[id="27"]'],
  /* 35 */ ['#container-b2a7b4132b'],
  /* 36 */ ['#leadproxytext-a8e8208a95', '#leadproxyteaser-249ae514b8'],
  /* 37 */ ['#container-16ed44abb5'],
  /* 38 */ ['#container-d35e3a192d'],
  /* 39 */ ['#leadproxytext-ae2ba99d42'],
  /* 40 */ ['#container-1618092523'],
  /* 41 */ ['#leadproxytext-3a445fa119'],
  /* 42 */ ['#container-92e8aae3a5'],
  /* 43 */ [`#${NEW_IDS.howToBuy}`],
  /* 44 */ ['#container-b2fe259e25'],
  /* 45 */ ['#leadproxytext-4cf3e377b6'],
  /* 46 */ ['#container-6f11a5e168'],
  /* 47 */ ['#leadproxytext-7f29512ee4'],
  /* 48 */ ['#container-6ed3066365'],
  /* 49 */ ['#leadproxytext-45dbbbfc29'],
  /* 50 */ ['#container-74e18de16e'],
  /* 51 */ ['#leadproxytext-c876bebae1'],
  /* 52 */ ['.voiceof-happy-customer'],
  /* 53 */ ['.tte-form-redesign'],
  /* 54 */ ['#container-0e5e661886'],
  /* 55 */ ['#container-593dd46a6a', '.updatedatelatest'],
  /* 56 */ [`#${NEW_IDS.popularSearches}`],
];

// Containers removed from INSIDE kept grid children
function removePartial(root) {
  // section-25: drop the leading "How long does it take to approve a claim?" block (kept: comparison table)
  const s25 = root.querySelector('#container-4a5dfb47f8');
  if (s25) {
    [...s25.querySelectorAll('h2')].filter((h) => /how long does it take to approve a claim/i.test(h.textContent))
      .forEach((h) => {
        const box = h.closest('.ta-container') || h.closest('.leadproxytext');
        if (box && s25.contains(box) && !box.querySelector('.compare-term-plan-table')) box.remove();
      });
  }
  // section-37: drop "Market-Linked Wealth Creation with Protection" heading + paragraphs
  const s37 = root.querySelector('[id="27"]');
  if (s37) {
    [...s37.querySelectorAll('h2')].filter((h) => /market-linked wealth creation/i.test(h.textContent))
      .forEach((h) => {
        const box = h.closest('.supportpage_styleguide') || h.closest('.leadproxytext');
        if (box && s37.contains(box) && box !== s37) box.remove();
      });
  }
}

/* ------------------------------------------------------------------------------------------------
 * NEW content (copy transcribed from the design, see redesign-spec.md "New content")
 * ---------------------------------------------------------------------------------------------- */

function hinted(doc, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = doc.createDocumentFragment();
  frag.appendChild(doc.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function el(doc, tag, html) {
  const e = doc.createElement(tag);
  if (html !== undefined) e.innerHTML = html;
  return e;
}

// 30. Age cards + "Plan now" under "How delaying Term Insurance can cost you?" -> cards-stats block
// (cards-stats-item model: image (optional icon) | text (bold stat value + label))
function buildAgeCards(doc, ctaHref) {
  const wrap = doc.createElement('div');
  wrap.id = NEW_IDS.ageCards;
  const ages = [
    ['Age 20', 'Premium starts at ₹548/month'],
    ['Age 30', 'Premium starts at ₹732/month'],
    ['Age 40', 'Premium starts at ₹1,308/month'],
  ];
  const cells = ages.map(([age, label]) => ['', hinted(doc, 'text', [el(doc, 'p', `<strong>${age}</strong>`), el(doc, 'p', label)])]);
  wrap.append(WebImporter.Blocks.createBlock(doc, { name: 'cards-stats', cells }));
  const p = doc.createElement('p');
  const a = doc.createElement('a');
  a.href = ctaHref || '#';
  a.textContent = 'Plan now';
  p.append(a);
  wrap.append(p);
  return wrap;
}

// 43. How to buy Term Insurance? -> default content
function buildHowToBuy(doc) {
  const wrap = doc.createElement('div');
  wrap.id = NEW_IDS.howToBuy;
  wrap.append(el(doc, 'h2', 'How to buy Term Insurance?'));
  wrap.append(el(doc, 'p', 'Buying term insurance online is simple with Tata AIA. Here\'s how to buy a plan from Tata AIA Life Insurance:'));
  const steps = [
    'Visit the Tata AIA Life Insurance website and find the term insurance section.',
    'Use the term insurance calculator to estimate your premium based on the sum assured and policy term. This tool can help you pick a plan that fits your budget.',
    'Choose a term plan and consider adding riders like critical illness cover or accidental death benefit. These additions provide extra protection for specific situations.',
    'Fill out the online application with required information such as ID proof, address proof, income proof and upload your documents. Moreover, you might need to provide medical information for underwriting purposes.',
    'Make the payment and read the policy disclaimer carefully. It is important to understand all terms before completing your Tata AIA term insurance purchase.',
  ];
  const ol = doc.createElement('ol');
  steps.forEach((s) => ol.append(el(doc, 'li', s)));
  wrap.append(ol);
  return wrap;
}

// 56. Popular searches -> default content (section style link-pills).
// hrefs: real tataaia.com links found in the live page markup (migration-work/cleaned.html) by
// exact anchor text (or the same-concept anchor text noted below); '#' when no link exists on the page.
const POPULAR_SEARCHES = [
  ['Term Insurance', '/life-insurance-plans/term-insurance.html'],
  ['Health Insurance Plan', '#'],
  ['Term Insurance Calculator', '/calculator/term-insurance-calculator.html'],
  ['ULIP', '/life-insurance-plans/wealth-solutions.html'], // live anchor text "ULIP Plans"
  ['Pension Calculator', '/calculator/retirement-and-pension-calculator.html'],
  ['Life Insurance Policy', '#'],
  ['Long Term Capital Gain', '#'],
  ['Term Insurance With Return of Premium', '/term-plan-with-return-of-premium.html'], // live "Term Plan with Return of Premium"
  ['Pension Plan', '/life-insurance-plans/retirement-and-pension-solutions.html'], // live "Retirement & Pension Plans"
  ['Small Cap Fund', '#'],
  ['Multi Cap Fund', '#'],
  ['ULIP Calculator', '/calculator/ulip-calculator.html'],
  ['Savings Calculator', '/calculator/saving-calculator.html'],
  ['ULIP vs Mutual Fund', '#'],
  ['ULIP Taxation', '#'],
  ['Money Management Tips', '#'],
  ['ULIP Charges', '#'],
  ['1 Crore Term Insurance', '/life-insurance-plans/term-insurance/1-crore-term-insurance-plan.html'],
  ['Dynamic Asset Allocation Fund', '#'],
  ['ULIP vs. ELSS', '#'],
  ['ULIP Advantages', '#'],
  ['ULIP Lock-in Period', '#'],
  ['Term Insurance for Diabetics', '#'],
  ['Wealth Creation Plans', '#'],
  ['Wealth Insurance', '#'],
  ['Term Insurance for Smokers', '#'],
  ['Whole Life Insurance', '/life-insurance-plans/term-insurance/whole-life-insurance.html'],
  ['Partial Withdrawal in ULIP', '#'],
  ['ULIP Surrender', '#'],
];

function buildPopularSearches(doc) {
  const wrap = doc.createElement('div');
  wrap.id = NEW_IDS.popularSearches;
  wrap.append(el(doc, 'h2', 'Popular searches'));
  const ul = doc.createElement('ul');
  POPULAR_SEARCHES.forEach(([text, path]) => {
    const li = doc.createElement('li');
    const a = doc.createElement('a');
    a.href = path === '#' ? '#' : `${TATAAIA}${path}`;
    a.textContent = text;
    li.append(a);
    ul.append(li);
  });
  wrap.append(ul);
  return wrap;
}

// 23. Term Calculator - 2nd hero-calculator instance, built from the parsed hero block
function blockName(table) {
  const first = table.querySelector('tr > th, tr > td');
  return first ? normKey(first.textContent) : '';
}

function buildSecondCalculator(main, doc) {
  const placeholder = main.querySelector(`#${NEW_IDS.calculator}`);
  if (!placeholder) {
    console.warn('[tataaia-redesign] term calculator placeholder missing');
    return;
  }
  const hero = [...main.querySelectorAll('table')].find((t) => blockName(t) === 'hero-calculator' || blockName(t) === 'hero calculator');
  const heroImg = hero && hero.querySelector('img');
  const heroCta = hero && [...hero.querySelectorAll('a[href]')].pop();

  const img = heroImg ? heroImg.cloneNode(true) : null;
  const text = [
    el(doc, 'p', 'Tata AIA Sampoorna Raksha Promise'),
    el(doc, 'ul', [
      '<li>Get <strong>₹1 Crore life cover</strong> at ₹501/month*</li>',
      '<li>Avail up to <strong>18.5% discount</strong> on 1st year premium*</li>',
      '<li>Get <strong>100%</strong> premium back*</li>',
    ].join('')),
  ];
  const cta = doc.createElement('a');
  cta.href = (heroCta && heroCta.getAttribute('href')) || 'https://sellonline.tataaia.com/app/products?product=SRP';
  cta.textContent = 'Calculate premium';
  const ctaP = doc.createElement('p');
  ctaP.append(cta);
  const calc = [el(doc, 'h2', 'Term Calculator – Check premium in just 2 steps'), ctaP];

  const cells = [
    [hinted(doc, 'image', img)],
    [hinted(doc, 'text', text)],
    [hinted(doc, 'calculator', calc)],
  ];
  placeholder.replaceWith(WebImporter.Blocks.createBlock(doc, { name: 'hero-calculator', cells }));
}

/* ------------------------------------------------------------------------------------------------ */

// Author/reviewer byline: keep only the two compact chips (avatar, "Written by"/"Reviewed by", name);
// the hover bio cards (second photo, title, repeated name, bio) are not in the design
function simplifyByline(root, doc) {
  const container = root.querySelector('.term-insurance-information-container');
  if (!container) return;
  const list = doc.createElement('ul');
  container.querySelectorAll('.term-insurance-info-card').forEach((card) => {
    const img = card.querySelector('img');
    const label = norm(card.querySelector('.cmp-teaser__description p')?.textContent);
    const name = norm(card.querySelector('h2, h3')?.textContent);
    if (!name) return;
    const li = doc.createElement('li');
    if (img) {
      const avatar = doc.createElement('img');
      avatar.src = img.getAttribute('src');
      avatar.alt = img.getAttribute('alt') || name;
      li.append(avatar);
    }
    li.append(doc.createTextNode(`${label} `));
    const strong = doc.createElement('strong');
    strong.textContent = name;
    li.append(strong);
    list.append(li);
  });
  const wrap = doc.createElement('div');
  wrap.id = NEW_IDS.byline;
  wrap.append(list);
  container.replaceWith(wrap);
}

// Section titles the live markup renders as styled paragraphs or lower-level headings become H2s
function promoteHeadings(root, doc) {
  const titles = [
    ...root.querySelectorAll('.enhanceheading .cmp-text > p:first-child'),
    ...root.querySelectorAll('.testinomial-heading .cmp-text > p:first-child'),
    ...root.querySelectorAll('.termplan-container .leadproxytext h3'),
    ...root.querySelectorAll('.whychoose-cards > .cmp-container > .leadproxytext h4'),
  ];
  titles.forEach((node) => {
    const text = norm(node.textContent);
    if (!text) return;
    const h2 = doc.createElement('h2');
    h2.textContent = text;
    node.replaceWith(h2);
  });
}

// Slider arrows and byline divider art left behind in default content (not part of any block)
const DECORATIVE_IMAGES = /\/(left-desk\.png|right-desk\.png|Blue-left-Line\.svg|Blue-right-Line\.svg|Prev-arrow\.svg|Next-arrow\.svg)(\?|$)/i;

function removeDecorativeImages(root) {
  [...root.querySelectorAll('img')]
    .filter((img) => DECORATIVE_IMAGES.test(img.getAttribute('src') || '') && !img.closest('table'))
    .forEach((img) => {
      let node = img.closest('picture') || img;
      // climb through wrappers that hold nothing but this image
      while (node.parentElement && node.parentElement !== root
        && node.parentElement.children.length === 1 && !norm(node.parentElement.textContent)) {
        node = node.parentElement;
      }
      node.remove();
    });
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || document;

  if (hookName === H.before) {
    // 1. lazy-loaded values
    fillComparisonTable(element, doc);
    fillPremiumCalculator(element);

    const grid = findGrid(element);
    if (!grid) {
      console.error('[tataaia-redesign] main grid not found - page left in live order');
      return;
    }

    // 2. drop sections / containers that are not in the design
    DROP.forEach((sel) => {
      const child = gridChild(grid, sel);
      if (child) child.remove();
      else console.warn(`[tataaia-redesign] drop target not found: ${sel}`);
    });
    removePartial(element);
    simplifyByline(element, doc);
    promoteHeadings(element, doc);

    // NEW content placeholders / default content
    const durationCta = element.querySelector('#container-f4882e2f04 a.cmp-teaser__action-link[href], .life-cover a.cmp-teaser__action-link[href]');
    const delaying = gridChild(grid, '#leadproxytext-1bfd9816cd');
    if (delaying) delaying.append(buildAgeCards(doc, durationCta && durationCta.getAttribute('href')));
    else console.warn('[tataaia-redesign] "How delaying" container not found - age cards not added');
    [
      [NEW_IDS.calculator, () => { const d = doc.createElement('div'); d.id = NEW_IDS.calculator; return d; }],
      [NEW_IDS.howToBuy, () => buildHowToBuy(doc)],
      [NEW_IDS.popularSearches, () => buildPopularSearches(doc)],
    ].forEach(([, build]) => grid.append(build()));

    // 3. reorder into the design order (appending moves each child to the end in sequence;
    //    untouched utility children - popups, loaders - stay in front and are removed by tataaia-cleanup)
    const placed = new Set();
    ORDER.forEach((sels, i) => {
      sels.forEach((sel) => {
        const child = gridChild(grid, sel);
        if (!child) {
          console.warn(`[tataaia-redesign] design #${i + 1}: not found ${sel}`);
          return;
        }
        if (placed.has(child)) return;
        placed.add(child);
        grid.append(child);
      });
    });
    [...grid.children].forEach((c) => {
      if (!placed.has(c) && norm(c.textContent)) {
        console.log(`[tataaia-redesign] unplaced grid child (left in front): ${c.className}`);
      }
    });
  }

  if (hookName === H.after) {
    buildSecondCalculator(element, doc);
    removeDecorativeImages(element);
  }
}
