/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form-contact (new block for /broadridge). Base: form.
 * Source: migration-work/design-broadridge/source/broadridge.html (semantic source written from the design image)
 * Instance selector: .contact-form  (.contact-intro, .contact-specialists, form > .field[data-width], button)
 *
 * Block model rows (form-contact), one cell each: intro (richtext) | contact (richtext) | submitLabel | action
 * Item rows (form-contact-field), one per form field: label | kind | options | settings (multiselect: required, full)
 */
function clean(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

function hinted(document, field, ...nodes) {
  const frag = document.createDocumentFragment();
  frag.append(document.createComment(` field:${field} `), ...nodes);
  return frag;
}

function text(document, value) {
  return document.createTextNode(value);
}

export default function parse(element, { document }) {
  const cells = [];

  // intro: heading + paragraphs
  const intro = element.querySelector('.contact-intro');
  const introNodes = [];
  if (intro) {
    [...intro.children].forEach((child) => {
      if (!clean(child.textContent)) return;
      const el = document.createElement(/^H[1-6]$/.test(child.tagName) ? 'h2' : 'p');
      el.textContent = clean(child.textContent);
      introNodes.push(el);
    });
  }
  cells.push([hinted(document, 'intro', ...introNodes)]);

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
    if (!control) return;
    const label = clean((field.querySelector('label') || {}).textContent);
    let kind = 'text';
    if (control.tagName === 'SELECT') kind = 'select';
    else if (control.tagName === 'TEXTAREA') kind = 'textarea';
    else if (['email', 'tel'].includes(control.getAttribute('type'))) kind = control.getAttribute('type');
    const options = control.tagName === 'SELECT'
      ? [...control.querySelectorAll('option')].map((o) => clean(o.textContent)).filter(Boolean).join(', ')
      : '';
    const settings = [];
    if (control.hasAttribute('required')) settings.push('required');
    if (field.getAttribute('data-width') === 'full') settings.push('full');
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
