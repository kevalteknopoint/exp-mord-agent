export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    const cells = [...row.children];

    // Cell 0: image (hidden on default, shown on hover)
    // Cell 1: text content (h3 title, p description, p with link)
    const textCell = cells[1] || cells[0];
    const imageCell = cells.length > 1 ? cells[0] : null;

    // Extract link URL from the anchor in text cell
    const anchor = textCell.querySelector('a');
    const href = anchor ? anchor.getAttribute('href') : '#';

    // Extract title (h3)
    const h3 = textCell.querySelector('h3');
    const title = h3 ? h3.textContent.trim() : '';

    // Extract description (first p that is not a link container)
    const paragraphs = textCell.querySelectorAll('p');
    let description = '';
    paragraphs.forEach((p) => {
      if (!p.querySelector('a') && p.textContent.trim()) {
        description = p.textContent.trim();
      }
    });

    // Extract image if available
    const picture = imageCell ? imageCell.querySelector('picture') : null;

    // Build the link item
    const a = document.createElement('a');
    a.href = href;
    a.className = 'cards-solutions-item';

    // Number (01, 02, 03, 04)
    const numberSpan = document.createElement('span');
    numberSpan.className = 'cards-solutions-item-number';
    numberSpan.textContent = String(index + 1).padStart(2, '0');

    // Title container
    const titleDiv = document.createElement('div');
    titleDiv.className = 'cards-solutions-item-title';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'cards-solutions-item-text';
    titleSpan.textContent = title;

    const descSpan = document.createElement('span');
    descSpan.className = 'cards-solutions-item-description';
    descSpan.textContent = description;

    titleDiv.append(titleSpan, descSpan);

    // Image container (shown on hover)
    if (picture) {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'cards-solutions-item-image';
      imgContainer.append(picture);
      titleDiv.append(imgContainer);
    }

    // Arrow icon
    const arrow = document.createElement('span');
    arrow.className = 'cards-solutions-item-arrow';
    arrow.innerHTML = '<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation"><path d="M0.276367 9.01565V6.87304H13.6607L10.1546 1.19652L12.1581 0L16.9998 7.95826L12.1303 16L10.1268 14.7757L13.6607 9.01565H0.276367Z" fill="currentColor"></path></svg>';

    a.append(numberSpan, titleDiv, arrow);
    li.append(a);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
