import { moveInstrumentation } from '../../../scripts/scripts.js';

/**
 * Logo walls of dept.global (client / partner logos, award logos, partner cards).
 * One row per logo: image | text (optional caption, count or link).
 * A text that is only a link makes the logo itself the link (label kept for screen readers);
 * partner cards keep the linked name visible and link the image too.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cards = block.classList.contains('partners');
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const [imageCell, textCell] = [...row.children];
    const picture = imageCell && imageCell.querySelector('picture, img');
    if (picture) {
      const media = document.createElement('div');
      media.className = 'logo-grid-image';
      media.append(picture);
      li.append(media);
    }
    const hasText = textCell && textCell.textContent.trim();
    if (hasText) {
      textCell.className = 'logo-grid-text';
      li.append(textCell);
    }
    const links = textCell ? [...textCell.querySelectorAll('a[href]')] : [];
    const media = li.querySelector('.logo-grid-image');
    if (media && links.length === 1) {
      const [link] = links;
      const onlyLink = textCell.textContent.trim() === link.textContent.trim();
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      if (link.target) a.target = link.target;
      a.append(...media.childNodes);
      media.append(a);
      if (onlyLink && !cards) {
        // logo walls show the logo only: the link label names the image link
        a.setAttribute('aria-label', link.textContent.trim());
        textCell.remove();
      } else {
        // the visible name stays the focusable link; the image link duplicates it
        a.tabIndex = -1;
        a.setAttribute('aria-hidden', 'true');
      }
    }
    // partner cards: the caption (partner level) is shown over the image on hover
    if (cards && media && textCell && li.contains(textCell)) {
      [...textCell.querySelectorAll(':scope > p')].filter((p) => !p.querySelector('a')).forEach((p) => {
        p.classList.add('logo-grid-caption');
        media.append(p);
      });
    }
    // link paragraphs are not buttons here

    li.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
    li.querySelectorAll('a.button').forEach((a) => a.classList.remove('button'));
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
