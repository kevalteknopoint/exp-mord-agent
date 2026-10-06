/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-callback. Base: form.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .tte-form-countrycode
 *
 * Model (form-callback): intro | link (+linkText collapsed) | consent | success -> 4 rows x 1 column
 * The NRI toggle, name / mobile inputs and consent checkbox are rendered by the block JS, so only the
 * authorable text is extracted.
 * Validated selectors (source.html):
 *   .ta-needinfo-head h3 (non-empty) + .need-info-cc-title p      -> intro
 *   button.getCallBackTteForm (.Get-a-call-back label)            -> link (label = button text)
 *   .tte-country-consent .info-content > p (desktop copy; the .tte-country-consent-mob copy is a duplicate) -> consent
 *   .tte-popup-wrapper .resultText + .tte-form-popup-Msg          -> success (optional)
 * The source button posts via site JS (no URL in markup): data-* endpoint attributes are used when present,
 * otherwise '#' is authored as a placeholder endpoint to be set by the author.
 */
function clean(t) {
  return (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function hinted(document, field, nodes) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

export default function parse(element, { document }) {
  // Intro
  const intro = [];
  const heading = [...element.querySelectorAll('.ta-needinfo-head h1, .ta-needinfo-head h2, .ta-needinfo-head h3, .ta-needinfo-head h4')]
    .find((h) => clean(h.textContent));
  if (heading) {
    const h = document.createElement('h3');
    h.textContent = clean(heading.textContent);
    intro.push(h);
  }
  element.querySelectorAll('.need-info-cc-title > p, .ta-needinfo-head > p').forEach((p) => {
    if (clean(p.textContent)) intro.push(p);
  });

  // Submit link
  let link = null;
  const btn = element.querySelector('button.getCallBackTteForm, .need-info-cc-button button, .need-info-cc-button a');
  if (btn) {
    const href = btn.getAttribute('href') || btn.getAttribute('data-href') || btn.getAttribute('data-url')
      || btn.getAttribute('data-action') || (btn.closest('form') && btn.closest('form').getAttribute('action')) || '';
    link = document.createElement('a');
    link.href = href && !href.startsWith('javascript') ? href : '#';
    link.textContent = clean(btn.textContent) || 'Get a Call Back';
  }

  // Consent (desktop copy only)
  let consent = [...element.querySelectorAll('.tte-country-consent .info-content > *')].filter((n) => clean(n.textContent));
  if (!consent.length) consent = [...element.querySelectorAll('.info-content-mob > *')].filter((n) => clean(n.textContent));

  // Success message (optional)
  const success = [];
  const resultText = clean((element.querySelector('.tte-popup-wrapper .resultText, .popup-result-text') || {}).textContent);
  const resultMsg = clean((element.querySelector('.tte-form-popup-Msg') || {}).textContent);
  if (resultText) {
    const p = document.createElement('p');
    const s = document.createElement('strong');
    s.textContent = resultText;
    p.append(s);
    success.push(p);
  }
  if (resultMsg) {
    const p = document.createElement('p');
    p.textContent = resultMsg;
    success.push(p);
  }

  if (!intro.length && !link && !consent.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [
    [hinted(document, 'intro', intro)],
    [hinted(document, 'link', link)],
    [hinted(document, 'consent', consent)],
    [hinted(document, 'success', success)],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'form-callback', cells });
  element.replaceWith(block);
}
