/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: DEPT Agency site-wide cleanup.
 * Removes non-authorable content (navigation, footer, tracking, cookie consent, overlays).
 * All selectors verified against captured DOM of https://www.deptagency.com/en-in/
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent (Usercentrics) - found as #usercentrics-root in captured DOM
    // Remove tracking/ad blocker detection - found as .tracking-blockers in captured DOM
    // Remove SVG sprite for video player - found as #sprite-plyr in captured DOM
    // Remove page overlay - found as .page-overlay in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '#usercentrics-root',
      '.tracking-blockers',
      '#sprite-plyr',
      '.page-overlay',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove site navigation - found as .block-navigation in captured DOM
    // Remove skip-to-content link - found as .block-navigation__skip-to-content in captured DOM
    // Remove mobile navigation modal - found as dialog.block-navigation__mobile-modal in captured DOM
    // Remove desktop flyout template - found as template element in captured DOM
    // Remove menu drawer - found as .menu-drawer in captured DOM
    // Remove footer - found as footer.block-footer-v2 in captured DOM
    // Remove tracking iframes and beacons (outside main)
    // Remove misc tracking elements
    WebImporter.DOMUtils.remove(element, [
      '.block-navigation',
      '.block-navigation__skip-to-content',
      'dialog.block-navigation__mobile-modal',
      'template',
      '.menu-drawer',
      'footer.block-footer-v2',
      '#GxsCRdhiJi',
      '#batBeacon586544590297',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
