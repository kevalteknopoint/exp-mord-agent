/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: DEPT (dept.global) site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html of https://www.dept.global/en-in/
 *
 * Parser dependencies preserved until afterTransform:
 *  - hero-video reads `.plyr__video-embed iframe` (YouTube src) and `.plyr__poster img`
 *  - cards-casestudy reads `video.listing-card__video` and `.listing-card__hover-card-title`
 *  - cards-solutions reads `.block-talking-points__items-hover-container`
 *  - cards-insights reads `.listing-card-v2__hover-card-title`
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Usercentrics cookie consent root: <div id="usercentrics-root">
      '#usercentrics-root',
      // Plyr SVG sprite: <div id="sprite-plyr"> (first child of body)
      '#sprite-plyr',
      // Ad-blocker tracking pixel wrapper: <div class="tracking-blockers js-tracking-blockers">
      '.tracking-blockers',
      // Nav overlay: <div class="page-overlay"> (just before <main>)
      '.page-overlay',
      // Plyr video player controls (play/mute buttons) inside hero: <div class="plyr__controls">
      '.plyr__controls',
      // Decorative empty paragraphs in hero: p.block-scrolly-video-intro__deco-one / __deco-two
      '.block-scrolly-video-intro__deco-one',
      '.block-scrolly-video-intro__deco-two',
      // Carousel nav dots (buttons only): <div class="block-feature-turntable__nav-dots">
      '.block-feature-turntable__nav-dots',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Skip link: <a href="#main-content" class="block-navigation__skip-to-content">
      '.block-navigation__skip-to-content',
      // Header / navigation: <div class="block-navigation js-block-navigation ...">
      'div.block-navigation.js-block-navigation',
      // Desktop flyout <template> and mobile nav <dialog class="block-navigation__mobile-modal">
      'template',
      'dialog.block-navigation__mobile-modal',
      // Footer: <footer class="block-footer-v2 ...">
      'footer.block-footer-v2',
      // Leftover hover-only duplicate containers (if a parser did not consume them)
      '.listing-card__hover-card',
      // Insights card hover overlay: kept until here because cards-insights reads
      // .listing-card-v2__hover-card-title (the real article title on case-study cards)
      '.listing-card-v2__hover-card',
      '.block-talking-points__items-hover-container',
      // Tracking containers: <div id="GxsCRdhiJi">, <div id="batBeacon647787291983">, bing beacon img
      '#GxsCRdhiJi',
      '[id^="batBeacon"]',
      // Tracking iframes (doubleclick, adsrvr #universal_pixel_sk15r8f) and any remaining YouTube iframe
      'iframe',
      // Generic non-content elements
      'script',
      'noscript',
      'style',
      'link',
    ]);

    // Remaining third-party tracking pixels (e.g. s.ml-attr.com getuid)
    element.querySelectorAll('img[src*="ml-attr.com"], img[src*="bat.bing.com"], img[src*="sst.deptagency.com"]')
      .forEach((img) => img.remove());
  }
}
