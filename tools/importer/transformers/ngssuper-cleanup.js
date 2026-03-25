/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NGS Super cleanup.
 * Removes non-authorable content from the page DOM.
 * Selectors from captured DOM of https://www.ngssuper.com.au/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove notification banner (blocks parsing area)
    // Found in captured HTML: <section class="s-notification skin-info">
    WebImporter.DOMUtils.remove(element, [
      'section.s-notification',
    ]);

    // Remove hidden empty div at top of page-content
    // Found in captured HTML: <div class="hidden">
    WebImporter.DOMUtils.remove(element, [
      'div.hidden',
    ]);
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome
    // Found in captured HTML: <header class="s-mobile-header">, <header class="s-desktop-header">
    WebImporter.DOMUtils.remove(element, [
      'header.s-mobile-header',
      'header.s-desktop-header',
    ]);

    // Remove footer
    // Found in captured HTML: <section class="s-footer">
    WebImporter.DOMUtils.remove(element, [
      'section.s-footer',
    ]);

    // Remove back-to-top button
    // Found in captured HTML: <a class="c-back-to-top">
    WebImporter.DOMUtils.remove(element, [
      'a.c-back-to-top',
    ]);

    // Remove empty wrapper div (first child of page-content with empty class)
    const emptyDiv = element.querySelector('.page-content > div[class=""]');
    if (emptyDiv && !emptyDiv.textContent.trim()) {
      emptyDiv.remove();
    }

    // Remove iframes, link tags, noscript
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
