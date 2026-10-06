/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NPRPL cleanup.
 * Removes non-authorable content from NPRPL pages.
 * Selectors verified from captured DOM (migration-work/cleaned.html).
 */

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Remove cloned carousel slides (used for infinite loop, not authorable)
    // Found in DOM: <div class="bootstrape-item cloned">
    WebImporter.DOMUtils.remove(element, ['.bootstrape-item.cloned']);

    // Remove carousel navigation buttons (not authorable)
    // Found in DOM: <div class="bootstrape-nav disabled">
    WebImporter.DOMUtils.remove(element, ['.bootstrape-nav']);

    // Remove carousel dot indicators (not authorable)
    // Found in DOM: <div class="bootstrape-dots disabled">
    WebImporter.DOMUtils.remove(element, ['.bootstrape-dots']);
  }

  if (hookName === 'afterTransform') {
    // Remove footer (non-authorable site chrome)
    // Found in DOM: <footer class="py-3 py-lg-4">
    WebImporter.DOMUtils.remove(element, ['footer']);
  }
}
