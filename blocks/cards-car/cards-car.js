import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Cards Car
 * Each row = one car: cell 1 car image, cell 2 rich text (heading - linked model name, social-proof
 * paragraph, fuel list "Petrol · Diesel · CNG · EV", price paragraphs with the amount in <strong>,
 * tenure paragraph, CTA links - an italic link is the outline button), cell 3 offer text.
 * Layout: name + proof, image, details, buttons, offer line.
 */

function decorateBody(cell) {
  cell.className = 'cards-car-body';
  const heading = cell.querySelector('h1, h2, h3, h4');
  const actions = document.createElement('div');
  actions.className = 'cards-car-actions';
  let proof = false;
  [...cell.children].forEach((el) => {
    if (el === heading || el.tagName !== 'P') return;
    const text = el.textContent;
    if (el.classList.contains('button-container')) {
      actions.append(el);
    } else if (!proof) {
      el.classList.add('cards-car-proof');
      proof = true;
    } else if (text.includes('·')) {
      el.classList.add('cards-car-fuels');
      // highlight the EV option
      el.innerHTML = el.innerHTML.replace(/\bEV\b/, '<span class="cards-car-ev">EV</span>');
    } else if (el.querySelector('strong')) {
      el.classList.add('cards-car-price');
    } else {
      el.classList.add('cards-car-note');
    }
  });
  if (heading) {
    heading.classList.add('cards-car-name');
    heading.querySelectorAll('a').forEach((a) => {
      a.className = 'cards-car-name-link';
      a.closest('.button-container')?.classList.remove('button-container');
    });
  }
  return actions;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const [imageCell, textCell, offerCell] = [...row.children];
    const li = document.createElement('li');
    li.className = 'cards-car-card';
    moveInstrumentation(row, li);

    let actions;
    let head;
    if (textCell) {
      actions = decorateBody(textCell);
      // name + social proof sit above the image
      head = document.createElement('div');
      head.className = 'cards-car-head';
      head.append(...textCell.querySelectorAll(':scope > .cards-car-name, :scope > .cards-car-proof'));
    }
    if (head) li.append(head);

    const img = imageCell?.querySelector('picture img');
    if (img) {
      imageCell.className = 'cards-car-image';
      const picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      img.closest('picture').replaceWith(picture);
      li.append(imageCell);
    }
    if (textCell) {
      li.append(textCell);
      if (actions.children.length) textCell.append(actions);
    }
    if (offerCell && offerCell.textContent.trim()) {
      offerCell.className = 'cards-car-offer';
      li.append(offerCell);
    }
    ul.append(li);
  });

  block.replaceChildren(ul);
}
