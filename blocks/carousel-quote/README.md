# carousel-quote

New **carousel**-based block created for the `/loans` page (design: `migration-work/design-loans/spec.md`). Purpose: testimonial.

Testimonial slider: scroll-snap track with one card visible on mobile, two from 700px (three from 1600px). Circular outlined prev/next buttons (aria-controls, disabled at the ends, hidden when everything fits).

## Authoring

Container block - one row per item. Content: each row = testimonial slide: cell1 round avatar image, cell2 rich text (quote paragraph(s), customer name as a bold paragraph, role paragraph).

## Universal Editor model (`carousel-quote-item`)

| Field | Component | Description |
|---|---|---|
| `media_image` | reference | Customer avatar |
| `media_imageAlt` | text | Alt text for the avatar |
| `content_text` | richtext | Quote paragraph(s), customer name (bold paragraph), role paragraph |

## Styling

Fonts and colours come from the page-scoped custom properties defined under `body.loans` in `styles/loans.css`
(page metadata `template: loans`). The block is not themed for other templates.

## Supported variations

No variations.
