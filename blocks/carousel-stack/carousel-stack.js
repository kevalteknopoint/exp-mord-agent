import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Carousel Stack
 * Each row = one offer card: rich text (tag paragraph before the heading, lead-in paragraph,
 * heading - <strong> for the bold amount, follow-up paragraph).
 * Cards are stacked (the next cards peek out behind the front one); a numbered pager
 * ("01 —— 02 03") and gentle autoplay rotate them.
 */

const AUTOPLAY_MS = 5000;

export default function decorate(block) {
  const stack = document.createElement('ul');
  stack.className = 'carousel-stack-cards';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'carousel-stack-card';
    moveInstrumentation(row, li);
    // the rich text cell keeps its own (UE) instrumentation inside the item element
    const cell = row.firstElementChild || document.createElement('div');
    cell.className = 'carousel-stack-content';
    li.append(cell);
    // the first paragraph is a tag ("TERM PLAN") when two paragraphs precede the heading
    const heading = cell.querySelector('h1, h2, h3, h4');
    const children = [...cell.children];
    if (heading && children.indexOf(heading) >= 2 && children[0].tagName === 'P') {
      children[0].className = 'carousel-stack-tag';
    }
    stack.append(li);
  });

  const cards = [...stack.children];
  block.replaceChildren(stack);
  if (!cards.length) return;

  const pager = document.createElement('div');
  pager.className = 'carousel-stack-pager';
  const pad = (n) => String(n).padStart(2, '0');

  let current = 0;
  const render = () => {
    cards.forEach((card, i) => {
      const depth = (i - current + cards.length) % cards.length;
      card.dataset.depth = depth;
      card.setAttribute('aria-hidden', depth !== 0);
    });
    [...pager.children].forEach((button, i) => button.setAttribute('aria-current', i === current));
  };

  cards.forEach((card, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = pad(i + 1);
    button.setAttribute('aria-label', `Show offer ${i + 1} of ${cards.length}`);
    button.addEventListener('click', () => { current = i; render(); });
    pager.append(button);
  });
  if (cards.length > 1) block.append(pager);
  render();

  if (cards.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let timer;
    const start = () => {
      timer = setInterval(() => { current = (current + 1) % cards.length; render(); }, AUTOPLAY_MS);
    };
    block.addEventListener('pointerenter', () => clearInterval(timer));
    block.addEventListener('pointerleave', start);
    start();
  }
}
