/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Wipro site-wide cleanup
 * Removes non-authorable content from the DOM before and after block parsing.
 * All selectors verified against migration-work/cleaned.html captured DOM.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent banner (line 2467: <div id="onetrust-consent-sdk">)
    // Remove modal overlays (line 1004+: <div class="micrositeModal" id="micrositeModal">)
    // Remove social/video popups (line 1042+: <div class="popup2">)
    // Remove gated popup form modal (line 2428: <div id="gated-popup-form" class="modal fade show-more-popup">)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.micrositeModal',
      '.popup2',
      '#gated-popup-form',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove header/navigation container (line 4: <div id="header-container">)
    // Remove global navigation (line 5: <div class="globalnavigation ...">)
    // Remove mobile dropdown menus (line 223+: <div class="cmp-topnavmenuitem__dropdown-mob">)
    // Remove geo-location dropdown (line 588: <div id="geoMenu" class="cmp-globalnavigation__geo-dropdown">)
    // Remove footer containers (line 2290: <footer>, line 2301: <div id="footer-container">)
    // Remove iframes, link elements, noscript tags
    WebImporter.DOMUtils.remove(element, [
      '#header-container',
      '.globalnavigation',
      '.cmp-topnavmenuitem__dropdown-mob',
      '.cmp-globalnavigation__geo-dropdown',
      '#footer-container',
      'footer',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
