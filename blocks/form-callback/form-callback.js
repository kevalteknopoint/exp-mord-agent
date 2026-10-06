/*
 * Form Callback
 * Inline lead-capture bar. Content (one row per field, any may be omitted):
 *   row 1: optional intro rich text (heading / short text)
 *   row 2: submit link - link text = button label ("Get a Call Back"), href = endpoint the
 *          form data is POSTed to as JSON
 *   row 3: consent rich text (shown next to the consent checkbox, may contain a privacy link)
 *   row 4: optional success message rich text shown after a successful submit
 * The NRI toggle, name and mobile (+91) inputs and consent checkbox are rendered by this script.
 */

let formCount = 0;

function classifyRows(block) {
  const rows = [...block.children];
  const result = {
    intro: null, link: null, consent: null, success: null,
  };
  const linkRow = rows.find((r) => {
    const a = r.querySelector('a');
    return a && a.textContent.trim() === r.textContent.trim();
  });
  if (linkRow) result.link = linkRow.querySelector('a');
  const others = rows.filter((r) => r !== linkRow && r.textContent.trim());
  const linkIdx = linkRow ? rows.indexOf(linkRow) : -1;
  others.forEach((r) => {
    const idx = rows.indexOf(r);
    if (linkIdx >= 0 && idx < linkIdx && !result.intro) result.intro = r;
    else if (!result.consent && (linkIdx < 0 || idx > linkIdx)) result.consent = r;
    else if (!result.success) result.success = r;
  });
  return result;
}

function field(html, cls) {
  const div = document.createElement('div');
  div.className = `form-callback-field ${cls}`;
  div.innerHTML = html;
  return div;
}

export default function decorate(block) {
  formCount += 1;
  const id = `form-callback-${formCount}`;
  const {
    intro, link, consent, success,
  } = classifyRows(block);
  const label = (link && link.textContent.trim()) || 'Get a Call Back';
  const endpoint = link ? link.href : '';

  const form = document.createElement('form');
  form.className = 'form-callback-form';
  form.noValidate = true;

  const fields = document.createElement('div');
  fields.className = 'form-callback-fields';
  fields.append(
    field(`<fieldset><legend>Are you an NRI?</legend>
      <label><input type="radio" name="nri" value="yes"><span>Yes</span></label>
      <label><input type="radio" name="nri" value="no" checked><span>No</span></label></fieldset>`, 'form-callback-nri'),
    field(`<label for="${id}-name">Full name (First and last)</label>
      <input type="text" id="${id}-name" name="name" autocomplete="name" placeholder="E.g. Rakesh Singh" required>`, 'form-callback-name'),
    field(`<label for="${id}-mobile">Mobile number</label>
      <div class="form-callback-mobile-input"><span class="form-callback-prefix">+91</span>
      <input type="tel" id="${id}-mobile" name="mobile" autocomplete="tel-national" inputmode="numeric"
        pattern="[6-9][0-9]{9}" maxlength="10" placeholder="E.g. 9876543210" required></div>`, 'form-callback-mobile'),
  );

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'button form-callback-submit';
  submit.textContent = label;

  const consentWrap = document.createElement('div');
  consentWrap.className = 'form-callback-consent';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `${id}-consent`;
  checkbox.name = 'consent';
  checkbox.checked = true;
  const consentLabel = document.createElement('label');
  consentLabel.htmlFor = checkbox.id;
  if (consent) {
    const cell = consent.querySelector(':scope > div') || consent;
    while (cell.firstChild) consentLabel.append(cell.firstChild);
  } else {
    consentLabel.textContent = 'I agree to be contacted about my enquiry.';
  }
  consentWrap.append(checkbox, consentLabel);

  const status = document.createElement('p');
  status.className = 'form-callback-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  form.append(fields, submit, consentWrap, status);

  const successNode = document.createElement('div');
  successNode.className = 'form-callback-success';
  successNode.hidden = true;
  if (success) {
    const cell = success.querySelector(':scope > div') || success;
    while (cell.firstChild) successNode.append(cell.firstChild);
  } else {
    successNode.innerHTML = '<p>Thank you! Our expert will call you back shortly.</p>';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    const nameInput = form.querySelector('[name=name]');
    const mobileInput = form.querySelector('[name=mobile]');
    let invalid = null;
    if (!nameInput.value.trim()) invalid = nameInput;
    else if (!mobileInput.checkValidity()) invalid = mobileInput;
    if (invalid) {
      invalid.setAttribute('aria-invalid', 'true');
      status.textContent = invalid === nameInput ? 'Please enter your name.' : 'Please enter a valid 10-digit mobile number.';
      invalid.focus();
      return;
    }
    if (!checkbox.checked) {
      status.textContent = 'Please accept the consent to continue.';
      return;
    }
    [nameInput, mobileInput].forEach((i) => i.removeAttribute('aria-invalid'));
    const data = Object.fromEntries(new FormData(form).entries());
    data.consent = checkbox.checked;
    submit.disabled = true;
    try {
      if (endpoint) {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      }
      form.hidden = true;
      successNode.hidden = false;
    } catch {
      status.textContent = 'Something went wrong. Please try again.';
    } finally {
      submit.disabled = false;
    }
  });

  const children = [];
  if (intro) {
    intro.className = 'form-callback-intro';
    // the section usually repeats the intro as its centred title; avoid showing it twice
    const heading = intro.querySelector('h1, h2, h3, h4, h5, h6');
    const sectionHeadings = [...(block.closest('.section')?.querySelectorAll(
      '.default-content-wrapper :is(h1, h2, h3, h4, h5, h6)',
    ) || [])];
    const headingText = heading ? heading.textContent.trim() : '';
    if (headingText && sectionHeadings.some((h) => h.textContent.trim() === headingText)) {
      intro.hidden = true;
    }
    children.push(intro);
  }
  children.push(form, successNode);
  block.replaceChildren(...children);
}
