# cards-service-links

New **cards**-based block created for the `/loans` page (design: `migration-work/design-loans/spec.md`). Purpose: link list.

Stacked rounded light-grey link rows with a black circular arrow on the right; the whole row is clickable (stretched link). A row with a graphic is rendered tall. Two columns on desktop with the featured row spanning two rows.

## Authoring

Container block - one row per item. Content: each row = link row: cell1 optional graphic image (row rendered tall with the graphic at the bottom), cell2 rich text with a single link.

## Universal Editor model (`cards-service-links-item`)

| Field | Component | Description |
|---|---|---|
| `image` | reference | Optional decorative graphic (makes the row tall) |
| `imageAlt` | text | Alt text for the graphic (leave empty if decorative) |
| `text` | richtext | A single link (label + URL) |

## Styling

Fonts and colours come from the page-scoped custom properties defined under `body.loans` in `styles/loans.css`
(page metadata `template: loans`). The block is not themed for other templates.

## Supported variations

No variations.
