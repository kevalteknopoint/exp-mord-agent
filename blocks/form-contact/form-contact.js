import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Form Contact
 * Block fields (single-cell rows, in order): intro (rich text), contact (rich text,
 * e.g. specialist phone list), submit label, form action URL.
 * Item rows (one per form field): label | type (text, email, tel, select, textarea) |
 * options (comma separated, first one is the placeholder for selects) |
 * settings (comma separated: "required", "full" = full width).
 * The submitted field name is derived from the label.
 * Left column: intro + contact (pinned to the bottom); right column: white form card.
 */

const TYPES = ['text', 'email', 'tel', 'select', 'textarea'];
let formContactCount = 0;

const cellText = (cell) => (cell?.textContent || '').trim();

function toName(label, index) {
  const name = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return name || `field-${index + 1}`;
}

function buildField(cells, index) {
  const [labelCell, typeCell, optionsCell, settingsCell] = cells;
  const label = cellText(labelCell);
  const kind = cellText(typeCell).toLowerCase();
  const type = TYPES.includes(kind) ? kind : 'text';
  const name = toName(label, index);
  const settings = cellText(settingsCell).toLowerCase().split(',').map((v) => v.trim());
  const required = settings.includes('required');
  const width = settings.includes('full') ? 'full' : 'half';
  const id = `form-contact-${formContactCount}-${name}`;

  const wrapper = document.createElement('div');
  wrapper.className = `form-contact-field form-contact-${width}`;

  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  if (required) {
    const mark = document.createElement('span');
    mark.className = 'form-contact-required';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = ' *';
    labelEl.append(mark);
  }
  wrapper.append(labelEl);

  let control;
  if (type === 'select') {
    control = document.createElement('select');
    const options = cellText(optionsCell).split(',').map((o) => o.trim()).filter(Boolean);
    const [placeholder, ...choices] = options.length > 1 ? options : ['Select option', ...options];
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = placeholder;
    control.append(empty);
    choices.forEach((choice) => {
      const option = document.createElement('option');
      option.value = choice;
      option.textContent = choice;
      control.append(option);
    });
  } else if (type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 4;
  } else {
    control = document.createElement('input');
    control.type = type;
    if (type === 'email') control.autocomplete = 'email';
    if (type === 'tel') control.autocomplete = 'tel';
  }
  control.id = id;
  control.name = name;
  control.required = required;
  wrapper.append(control);
  return wrapper;
}

async function submit(form, action) {
  const status = form.querySelector('.form-contact-status');
  const button = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());
  button.disabled = true;
  try {
    if (action && action !== '#') {
      const resp = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      if (!resp.ok) throw new Error(`${resp.status}`);
    }
    form.reset();
    status.textContent = 'Thank you. A Broadridge specialist will be in touch soon.';
    status.className = 'form-contact-status form-contact-success';
  } catch (e) {
    status.textContent = 'Sorry, something went wrong. Please try again.';
    status.className = 'form-contact-status form-contact-error';
  } finally {
    button.disabled = false;
  }
}

export default function decorate(block) {
  formContactCount += 1;
  const rows = [...block.children];
  const configRows = rows.filter((row) => row.children.length <= 1);
  const fieldRows = rows.filter((row) => row.children.length > 1);
  const [introRow, contactRow, submitRow, actionRow] = configRows;

  const aside = document.createElement('div');
  aside.className = 'form-contact-aside';
  [[introRow, 'form-contact-intro'], [contactRow, 'form-contact-contact']].forEach(([row, cls]) => {
    if (!row) return;
    const cell = row.firstElementChild || row;
    const part = document.createElement('div');
    part.className = cls;
    moveInstrumentation(cell, part);
    while (cell.firstChild) part.append(cell.firstChild);
    part.querySelectorAll('.button').forEach((a) => {
      a.classList.remove('button', 'primary', 'secondary');
      a.closest('.button-container')?.classList.remove('button-container');
    });
    if (part.textContent.trim()) aside.append(part);
  });

  const form = document.createElement('form');
  form.className = 'form-contact-form';
  form.noValidate = false;
  const fields = document.createElement('div');
  fields.className = 'form-contact-fields';
  fieldRows.forEach((row, i) => {
    const field = buildField([...row.children], i);
    moveInstrumentation(row, field);
    fields.append(field);
  });
  form.append(fields);

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'form-contact-submit';
  button.textContent = cellText(submitRow) || 'Submit';
  form.append(button);

  const status = document.createElement('p');
  status.className = 'form-contact-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.append(status);

  const action = cellText(actionRow);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.reportValidity()) submit(form, action);
  });

  block.replaceChildren(aside, form);
}
