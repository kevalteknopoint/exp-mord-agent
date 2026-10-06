/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Tata AIA site-wide cleanup.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * All selectors verified in migration-work/cleaned.html.
 *
 * Section anchors used by tataaia-sections.js (#container-*, #leadproxytext-*,
 * [id="27"], .nolead-calc-banner-wrapper, .breadcrumb, ...) are never removed here
 * before parsing. The breadcrumb (section-1 anchor) is only removed in afterTransform,
 * after the sections transformer has used it in beforeTransform. Section-1 is the first
 * section with no style, so it needs neither an <hr> nor Section Metadata.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Popups / overlays / loaders (each wrapper is a direct aem-GridColumn child in captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '.successfailurepopup', // <div class="successfailurepopup aem-GridColumn ...">
      '.popup-nudge', // <div class="popup-nudge aem-GridColumn ..."> (section.popup-nudge-wrapper.dsp-none)
      '.newcampaignloader', // <div class="newcampaignloader aem-GridColumn ..."> page loader
      '.timerfooterform', // <div class="timerfooterform aem-GridColumn ..."> (empty)
      '.bgcolorcontainer.srp-btn-revmap.dsp-none', // hidden mobile sticky CTA container
      '.api-failure-page.dsp-none', // hidden "Can't decide" fallback (NOT the hero, which lacks .dsp-none)
      '.new-result-page', // hidden result panel inside the hero calculator wrapper
      '.vymo-api-failure-message', // hidden API failure panels (hero + fallback)
    ]);

    // Swiper / carousel chrome: pagination bullets, a11y live region, nav arrows
    WebImporter.DOMUtils.remove(element, [
      'span.swiper-notification',
      'span.swiper-pagination-bullet',
      'div.swiper-pagination', // blog carousel pagination (section#TIRA)
      '.pagination-container', // testimonial pagination wrapper
      '.swiper-button-prev',
      '.swiper-button-next',
      '.arrow-container', // testimonial arrow images
      '.rider-arrow-container', // enhance coverage / rider carousels
      '.risk-cards-arrow-container', // investment risk cards
      '.rider-arrow-mobile-block', // who-buy-cards arrows (.extendedimage.swiper-button-disabled)
    ]);

    // Third-party / tracking widgets and non-content body-level utilities
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_talic_0', // Adobe ID syncing iframe
      'iframe[src*="doubleclick.net"]', // floodlight tracking iframes
      '#vizury-notification-container', // lemnisk onsite notification widget
      '#tSrngBEkWlDy',
      '#loader', // div#loader.ta-loader
      '#ariaAlertRegion',
      '#keyboardWrapper', // virtual keyboard
      '#datepickers-container', // datepicker widget
      '#chatScript',
      '.chatbot', // <div class="chatbot aem-GridColumn ...">
      'link',
      'script',
      'style',
      'noscript',
    ]);
  }

  if (hookName === H.after) {
    // Global header (migrated separately as nav): remove its whole experience fragment wrapper
    const header = element.querySelector('div.container.new-header_sec_revamp');
    if (header) {
      const xf = header.closest('.experiencefragment');
      (xf || header).remove();
    }
    WebImporter.DOMUtils.remove(element, [
      'div.container.new-header_sec_revamp',
      '.new-header',
      '.newheadercontainer',
    ]);

    // Global footer (migrated separately) + its grid wrapper
    const footer = element.querySelector('footer.talic-footer');
    if (footer) {
      const wrap = footer.closest('.footer');
      (wrap || footer).remove();
    }
    WebImporter.DOMUtils.remove(element, ['footer.talic-footer']);

    // Breadcrumb: not authorable (section-1 anchor; sections transformer already ran its beforeTransform)
    WebImporter.DOMUtils.remove(element, ['.breadcrumb']);

    // Leftover hidden popups / form utility elements
    WebImporter.DOMUtils.remove(element, [
      '.testimonial_video_popup', // hidden video popup shell next to .testinomial-cards
      'iframe:not([src*="youtube"])',
      'input',
      'link',
      'noscript',
    ]);

    // Strip tracking/inline-handler attributes
    element.querySelectorAll('[onclick], [data-analytics], [data-track]').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-analytics');
      el.removeAttribute('data-track');
    });
  }
}
