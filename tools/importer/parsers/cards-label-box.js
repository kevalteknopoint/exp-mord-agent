/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-label-box. Base: cards.
 * Source: https://www.tataaia.com/life-insurance-plans/term-insurance.html
 * Instance selector: .leadproxyteaser.newlaunch-var-two (2 instances)
 *
 * Model (cards-label-box): label | text -> simple block, 2 rows x 1 column
 * Validated selectors (source.html):
 *   .cmp-teaser__description span.tag (label - may come before OR after the body),
 *   .cmp-teaser__description > p / ul (body)
 */
export default function parse(element, { document }) {
  const desc = element.querySelector('.cmp-teaser__description') || element.querySelector('.cmp-teaser__content') || element;
  const tag = desc.querySelector('span.tag, .tag');
  const labelText = tag ? tag.textContent.replace(/ /g, ' ').trim() : '';
  const tagPara = tag ? tag.closest('p') : null;

  const body = [...desc.children].filter((c) => c !== tagPara && c !== tag && c.textContent.replace(/ /g, ' ').trim());

  if (!labelText && !body.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const labelCell = document.createDocumentFragment();
  if (labelText) labelCell.append(document.createComment(' field:label '), document.createTextNode(labelText));
  const bodyCell = document.createDocumentFragment();
  if (body.length) {
    bodyCell.append(document.createComment(' field:text '));
    body.forEach((n) => bodyCell.append(n));
  }

  const cells = [
    [labelText ? labelCell : ''],
    [body.length ? bodyCell : ''],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-label-box', cells });
  element.replaceWith(block);
}
