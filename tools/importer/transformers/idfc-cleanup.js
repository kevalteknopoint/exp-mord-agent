/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: IDFC FIRST Bank site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (scraped DOM) or, for
 * tracking pixels/scripts stripped by the scraper, in the live page body.
 *
 * Intentionally NOT removed (consumed by parsers, which drop them themselves):
 *   - .homepage-banner nav .nav-tabs           (tabs-products labels)
 *   - .manage-your-finance .home-blog-links    (tabs-articles labels)
 *   - .info-tool-tip                           (carousel-features descriptions)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Modals / popups that overlay or duplicate content and could confuse block matching.
    // Found: div.modal.fade#fixeddeposit/#fix (qr-popup), #incomp12/#incomp-homepage (incomp-popup:
    // interest comparison), #disc12/#sa-popup (disc-popup: disclaimers), #spotlightPopup (redirect
    // notice), #cc-qr (grnt-cc-journey-popup).
    WebImporter.DOMUtils.remove(element, [
      'div.modal',
      '.cc-common-apply-popup',
      '.customer-service-modal',
      '.login-modal',
      '.search-modal',
    ]);

    // Duplicate mobile stats row; .helping-communities .custom-div is the cards-stats block.
    WebImporter.DOMUtils.remove(element, ['.helping-communities .mobile-div']);

    // Decorative desktop testimonial avatars (picture.desktop-testi-images.left/.right).
    WebImporter.DOMUtils.remove(element, ['.compliment picture.desktop-testi-images']);

    // Tracking: hidden analytics data-layer divs, GTM/Akamai noscript pixels, page-source pixel.
    WebImporter.DOMUtils.remove(element, [
      'div[data-analytics-pagetitle]',
      'img[src*="cdn.page-source.com"]',
      'script',
      'noscript',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global header (desktop + mobile) and footer: become /idfc/nav and /idfc/footer fragments.
    // Found: div.header-revamp > div.header-desktop > header.grnt-new-header,
    //        div.mobile-header > div.header-mobile > header.grnt-new-header,
    //        div.footer-revamp > footer.footer
    WebImporter.DOMUtils.remove(element, [
      'header.grnt-new-header',
      '.header-revamp',
      '.mobile-header',
      'footer.footer',
      '.footer-revamp',
    ]);

    // Non-content elements.
    WebImporter.DOMUtils.remove(element, ['link', 'iframe', 'script', 'noscript', 'style']);

    // Inline JS handlers.
    element.querySelectorAll('[onclick]').forEach((el) => el.removeAttribute('onclick'));
  }
}
