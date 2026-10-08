/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-contact (new block for /broadridge, reused by /kotak-life). Base: form.
 * Sources: migration-work/design-broadridge/source/broadridge.html, migration-work/design-kotak/source/kotak-life.html
 *   (semantic sources written from the design images)
 * Instance selectors: .contact-form (.contact-intro, .contact-specialists, form > .field[data-width], button)
 *                     .lead-form    (.lead-intro with an image, form > .field[data-kind][data-settings], button)
 *
 * Block model rows (form-contact), one cell each: intro (richtext + grouped intro_image) | contact (richtext) |
 *   submitLabel | action
 * Item rows (form-contact-field), one per form field: label | kind | options |
 *   settings (multiselect: required, full, placeholder, after)
 * Fields: a control-less .field[data-kind] (note, or a label-only field) takes kind/settings from its data attributes.
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

// field hint + content; empty cells get no hint (xwalk hinting rules)
function hinted(document, field, ...nodes) {
  const frag = document.createDocumentFragment();
  const hasContent = nodes.some((n) => (n.textContent || '').trim() || (n.querySelector && n.querySelector('img')) || n.nodeName === 'IMG');
  if (hasContent) frag.append(document.createComment(` field:${field} `));
  frag.append(...nodes);
  return frag;
}

function text(document, value) {
  return document.createTextNode(value);
}

export default function parse(element, { document }) {
  const cells = [];

  // intro: heading (keeps <strong>/<br>) + paragraphs; an image becomes the grouped intro_image field
  const intro = element.querySelector('.contact-intro, .lead-intro');
  const introNodes = [];
  let introImage = null;
  if (intro) {
    [...intro.children].forEach((child) => {
      const img = child.tagName === 'IMG' ? child : child.querySelector('img');
      if (img && !clean(child.textContent)) {
        introImage = img;
        return;
      }
      if (!clean(child.textContent)) return;
      const isHeading = /^H[1-6]$/.test(child.tagName);
      const el = document.createElement(isHeading ? 'h2' : 'p');
      if (isHeading) el.innerHTML = child.innerHTML.trim();
      else el.textContent = clean(child.textContent);
      introNodes.push(el);
    });
  }
  const introCell = hinted(document, 'intro', ...introNodes);
  if (introImage && introImage.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = introImage.getAttribute('src');
    img.alt = introImage.getAttribute('alt') || '';
    introCell.append(document.createComment(' field:intro_image '), img);
  }
  cells.push([introCell]);

  // contact: lead-in paragraph + phone list (links keep tel: hrefs)
  const contact = element.querySelector('.contact-specialists');
  const contactNodes = [];
  if (contact) {
    contact.querySelectorAll(':scope > p').forEach((p) => {
      const np = document.createElement('p');
      np.textContent = clean(p.textContent);
      contactNodes.push(np);
    });
    const list = contact.querySelector('ul');
    if (list) {
      const ul = document.createElement('ul');
      list.querySelectorAll('li').forEach((li) => {
        const nli = document.createElement('li');
        const a = li.querySelector('a');
        if (a) {
          const l = document.createElement('a');
          l.href = a.getAttribute('href');
          l.textContent = clean(a.textContent);
          nli.append(l, text(document, ` ${clean(li.textContent.replace(a.textContent, ''))}`));
        } else nli.textContent = clean(li.textContent);
        ul.append(nli);
      });
      contactNodes.push(ul);
    }
  }
  cells.push([hinted(document, 'contact', ...contactNodes)]);

  const form = element.querySelector('form');
  const submit = form ? form.querySelector('button[type="submit"], button') : null;
  cells.push([hinted(document, 'submitLabel', text(document, clean(submit ? submit.textContent : 'Submit')))]);
  const action = form ? (form.getAttribute('action') || '') : '';
  cells.push([hinted(document, 'action', text(document, action === '#' ? '' : action))]);

  // one row per form field
  (form ? [...form.querySelectorAll('.field')] : []).forEach((field) => {
    const control = field.querySelector('input, select, textarea');
    const declaredKind = field.getAttribute('data-kind');
    if (!control && !declaredKind) return;
    const label = clean((field.querySelector('label') || field).textContent);
    let kind = declaredKind || 'text';
    let options = '';
    let settings = [];
    if (control) {
      if (control.tagName === 'SELECT') kind = 'select';
      else if (control.tagName === 'TEXTAREA') kind = 'textarea';
      else if (['email', 'tel', 'date', 'checkbox'].includes(control.getAttribute('type'))) kind = control.getAttribute('type');
      options = control.tagName === 'SELECT'
        ? [...control.querySelectorAll('option')].map((o) => clean(o.textContent)).filter(Boolean).join(', ')
        : '';
      if (control.hasAttribute('required')) settings.push('required');
      if (field.getAttribute('data-width') === 'full') settings.push('full');
    }
    if (field.hasAttribute('data-settings')) {
      settings = field.getAttribute('data-settings').split(',').map((v) => v.trim()).filter(Boolean);
    }
    cells.push([
      hinted(document, 'label', text(document, label)),
      hinted(document, 'kind', text(document, kind)),
      hinted(document, 'options', text(document, options)),
      hinted(document, 'settings', text(document, settings.join(', '))),
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'form-contact', cells });
  element.replaceWith(block);
}
