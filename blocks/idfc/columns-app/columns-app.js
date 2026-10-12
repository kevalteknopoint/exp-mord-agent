import { createOptimizedPicture } from '../../../scripts/aem.js';
import { moveInstrumentation } from '../../../scripts/scripts.js';

function optimize(scope, width) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });
}

function decorateText(cell) {
  cell.classList.add('columns-app-text');
  const links = [...cell.querySelectorAll('a')];
  if (!links.length) return;
  const ctas = document.createElement('div');
  ctas.className = 'columns-app-ctas';
  links.forEach((a, i) => {
    a.classList.add(i === 0 ? 'columns-app-cta-primary' : 'columns-app-cta-secondary');
    const holder = a.closest('p') || a;
    // "Install Now" is the button; the plain follow-up link ("View awards") is an arrow text link
    if (i > 0 && !a.closest('strong, em')) {
      a.classList.remove('button', 'primary', 'secondary');
      holder.classList.remove('button-container');
    }
    ctas.append(holder);
  });
  cell.append(ctas);
}

function decorateMedia(cell) {
  cell.classList.add('columns-app-media');
  const pictures = [...cell.querySelectorAll('picture')];
  optimize(cell, '600');
  if (pictures.length > 1) {
    // first picture = phone mock-up, the rest = ratings / award badges beside it
    const badges = document.createElement('div');
    badges.className = 'columns-app-badges';
    [...cell.querySelectorAll('picture')].slice(1).forEach((pic) => badges.append(pic.closest('p') || pic));
    cell.append(badges);
  }
}

function decorateQr(cell) {
  cell.classList.add('columns-app-download');
  const headings = [...cell.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const cardHeading = headings.length > 1 ? headings[headings.length - 1] : headings.find((h) => h.tagName === 'H3');
  optimize(cell, '240');
  const qr = [...cell.querySelectorAll('picture')].pop();
  // copy above the card heading ("Enjoy India's #1 Mobile Banking App") is the caption
  // that sits beside the phone mock-up on the source, not part of the QR card
  const headingIdx = [...cell.children].indexOf(cardHeading);
  if (headingIdx > 0) {
    [...cell.children].slice(0, headingIdx)
      .filter((el) => el.tagName === 'P' && !el.querySelector('picture'))
      .forEach((el) => el.classList.add('columns-app-caption'));
  }
  if (!cardHeading && !qr) return;
  const card = document.createElement('div');
  card.className = 'columns-app-qr-card';
  if (cardHeading) card.append(cardHeading);
  if (qr) {
    const holder = qr.closest('p') || qr;
    holder.classList.add('columns-app-qr');
    card.append(holder);
  }
  cell.append(card);
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-app-row');
    const cells = [...row.children];
    cells.forEach((cell, i) => {
      if (i === 0) decorateText(cell);
      else if (i === cells.length - 1 && cells.length > 2) decorateQr(cell);
      else if (cell.querySelector('picture')) decorateMedia(cell);
      else decorateText(cell);
    });
    block.classList.add(`columns-app-${cells.length}-cols`);
  });
}
