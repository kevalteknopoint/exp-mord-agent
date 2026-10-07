import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Search Prompt
 * Block fields (one row each): prefix (e.g. "I want to"), suggestions (comma separated, rotated in
 * bold inside the empty field, e.g. "make a claim..., pay my premium..."), action (search page URL;
 * the query is sent as ?q=).
 * Pill-shaped prompt bar with a sparkle mark, an optional voice button (only where the browser
 * supports speech recognition) and a red submit arrow.
 */

const cellText = (row) => (row?.textContent || '').trim();

export default function decorate(block) {
  const [prefixRow, suggestionsRow, actionRow] = [...block.children];
  const prefix = cellText(prefixRow) || 'I want to';
  const suggestions = cellText(suggestionsRow).split(',').map((s) => s.trim()).filter(Boolean);
  const action = cellText(actionRow) || '/search';

  const form = document.createElement('form');
  form.className = 'search-prompt-form';
  form.action = action;
  form.method = 'get';
  form.setAttribute('role', 'search');
  moveInstrumentation(block.firstElementChild || block, form);

  const mark = document.createElement('span');
  mark.className = 'search-prompt-mark';
  mark.setAttribute('aria-hidden', 'true');

  const field = document.createElement('div');
  field.className = 'search-prompt-field';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.autocomplete = 'off';
  input.setAttribute('aria-label', `${prefix} ${suggestions[0] || ''}`.trim());
  const hint = document.createElement('span');
  hint.className = 'search-prompt-hint';
  hint.setAttribute('aria-hidden', 'true');
  const hintPrefix = document.createElement('span');
  hintPrefix.textContent = `${prefix} `;
  const hintSuggestion = document.createElement('strong');
  hintSuggestion.textContent = suggestions[0] || '';
  hint.append(hintPrefix, hintSuggestion);
  field.append(input, hint);
  const syncHint = () => field.classList.toggle('search-prompt-filled', input.value !== '');
  input.addEventListener('input', syncHint);

  const actions = document.createElement('div');
  actions.className = 'search-prompt-actions';
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (Recognition) {
    const mic = document.createElement('button');
    mic.type = 'button';
    mic.className = 'search-prompt-mic';
    mic.setAttribute('aria-label', 'Search by voice');
    mic.addEventListener('click', () => {
      const recognition = new Recognition();
      recognition.lang = document.documentElement.lang || 'en-IN';
      recognition.addEventListener('result', (e) => {
        input.value = e.results[0][0].transcript;
        syncHint();
      });
      recognition.start();
    });
    actions.append(mic);
  }
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'search-prompt-submit';
  submit.setAttribute('aria-label', 'Search');
  actions.append(submit);

  form.append(mark, field, actions);
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) {
      e.preventDefault();
      input.value = `${prefix} ${hintSuggestion.textContent}`.replace(/\.+$/, '');
      form.submit();
    }
  });

  // rotate the suggestion while the field is empty
  if (suggestions.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let index = 0;
    setInterval(() => {
      if (input.value || document.activeElement === input) return;
      index = (index + 1) % suggestions.length;
      hintSuggestion.classList.remove('search-prompt-in');
      hintSuggestion.textContent = suggestions[index];
      requestAnimationFrame(() => hintSuggestion.classList.add('search-prompt-in'));
    }, 3000);
  }

  block.replaceChildren(form);
}
