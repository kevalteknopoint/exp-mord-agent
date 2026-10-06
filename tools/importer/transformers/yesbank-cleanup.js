/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: YES Bank cleanup.
 * Selectors from captured DOM of https://www.yes.bank.in/
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove overlays, modals, cookie/consent, chat widgets (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#overlay',
      '.product-drawer',
      '#selectProductBtn',
      '.select-product-btn',
      '#thover_DCRPD_homepage_web',
      '[class*="at-element-marker"]',
      '.scs-hidden',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable content: header, footer, nav, rates panel sidebar
    WebImporter.DOMUtils.remove(element, [
      'header',
      '[role="banner"]',
      'footer',
      '#cwFooter',
      'nav',
      'iframe',
      'link',
      'noscript',
      '.dummy',
      '.right-content',
      '.slick-dots',
      '.slick-prev',
      '.slick-next',
    ]);

    // Remove data attributes and event handlers
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('onload');
      el.removeAttribute('tabindex');
    });
  }
}
