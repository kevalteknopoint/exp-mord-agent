/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Dulux India cleanup.
 * Removes non-authorable content and non-content widgets from the page DOM.
 * Selectors from captured DOM of https://www.dulux.in/ (migration-work/cleaned.html).
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove non-content widgets that could interfere with block parsing.
    // Found in captured HTML:
    //   <div id="onetrust-consent-sdk"> (OneTrust cookie consent)
    //   <div id="supportchatwidget">    (support chat widget)
    //   <div class="cloudservice googlerecaptcha"> (Google reCAPTCHA)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#supportchatwidget',
      'div.cloudservice.googlerecaptcha',
    ]);
  }

  if (hookName === H.after) {
    // Remove site chrome that is auto-populated in EDS (non-authorable).
    // Found in captured HTML:
    //   <header class="s1-header ...">
    //   <footer class="s3-secondary-footer ...">
    WebImporter.DOMUtils.remove(element, [
      'header.s1-header',
      'footer.s3-secondary-footer',
    ]);

    // Remove the social feed strip ("Add some colour to your feed").
    // Found in captured HTML: <section class="c18-logo-group ...">
    // containing <div class="m4-icon-list social-icons">
    WebImporter.DOMUtils.remove(element, [
      'section.c18-logo-group',
    ]);

    // Remove safe leftover non-authorable elements.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
      'script',
    ]);
  }
}
