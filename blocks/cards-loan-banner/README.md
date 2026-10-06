# cards-loan-banner

New **cards**-based block created for the `/loans` page (design: `migration-work/design-loans/spec.md`). Purpose: promotional banner.

Stacked full-bleed rounded loan banner cards. Text (eyebrow, light-weight heading, white pill CTA) is overlaid at the top of the photo, fine print sits at the bottom centre. One column on mobile, two on desktop (>= 900px).

## Authoring

Container block - one row per item. Content: each row = banner card: cell1 background image, cell2 rich text (eyebrow paragraph, heading, Apply link, fine-print paragraph), cell3 theme (light = white text | dark = dark text).

## Universal Editor model (`cards-loan-banner-item`)

| Field | Component | Description |
|---|---|---|
| `image` | reference | Background photo (full-bleed) |
| `imageAlt` | text | Alt text for the photo |
| `text` | richtext | Eyebrow paragraph, heading (h2), "Apply now" link paragraph, fine-print paragraph |
| `theme` | select | Text colour: light (white text, default) or dark (dark text, for light photos) |

## Styling

Fonts and colours come from the page-scoped custom properties defined under `body.loans` in `styles/loans.css`
(page metadata `template: loans`). The block is not themed for other templates.

## Supported variations

No variations.
