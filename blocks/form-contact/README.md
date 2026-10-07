# form-contact

Custom **form** block. Purpose: contact form.

## Authoring (Universal Editor)

Container block `form-contact` with `form-contact-field` items.

Rows 1-4 (block fields): intro rich text (+ optional grouped intro image) | contact rich text (specialist phone list) | submit button label | form action URL. Rows 5+ = one per form field: label | type (text, email, tel, date, select, textarea, checkbox, note) | dropdown options (comma separated, first = placeholder) | settings (required, full width, label as placeholder, after the submit button). The submitted field name is derived from the label.

Styling expects the Broadridge page tokens (`body.broadridge`, styles/broadridge.css) and falls back to the design values.

## Supported variations

None.
