/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: CEAT cleanup.
 * Removes non-authorable site chrome and widgets.
 * All selectors verified against migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove elements that may interfere with block parsing:
    // - Video popups / modals (found as .video-popup and .bs-modal)
    // - WhatsApp popup modal (.whatsappPopup)
    // - Scroll-to-top button (.scroll-to-top wraps section.right-sticky-scroll-to-top)
    WebImporter.DOMUtils.remove(element, [
      '.video-popup',
      '.bs-modal',
      '.whatsappPopup',
      '.scroll-to-top',
      '.right-sticky-scroll-to-top',
    ]);
  }

  if (hookName === H.after) {
    // Remove non-authorable site shell content:
    // - Header experience fragment (.experiencefragment contains .header and <header>)
    // - Footer (.footer wraps <footer>)
    // - Generic element removals: link tags, noscript, iframes
    WebImporter.DOMUtils.remove(element, [
      '.experiencefragment',
      'header',
      '.header',
      'footer',
      '.footer',
      'link',
      'noscript',
      'iframe',
    ]);
  }
}
