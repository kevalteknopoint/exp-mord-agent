# form-contact

Custom **form** block. Purpose: contact form.

## Authoring (Universal Editor)

Container block `form-contact` with `form-contact-field` items.

Rows 1-4 (block fields): intro rich text | contact rich text (specialist phone list) | submit button label | form action URL. Rows 5+ = one per form field: label | type (text, email, tel, select, textarea) | dropdown options (comma separated, first = placeholder) | settings (required, full width). The submitted field name is derived from the label.

Styling expects the Broadridge page tokens (`body.broadridge`, styles/broadridge.css) and falls back to the design values.

## Supported variations

None.
