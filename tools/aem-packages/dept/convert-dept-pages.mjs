// Converts imported DEPT .plain.html pages to xwalk JCR XML via @adobe/helix-importer md2jcr,
// using the project's component-models/definition/filters. Run by build-dept-pages-package.py.
// Usage: SCRIPTS=<dir with @adobe/helix-importer + jsdom> node convert-dept-pages.mjs <repo> <outDir> [files...]
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const SCRIPTS = process.env.SCRIPTS;
const require = createRequire(`${SCRIPTS}/package.json`);
const { JSDOM } = require('jsdom');
const { md2jcr } = await import(`${SCRIPTS}/node_modules/@adobe/helix-importer/src/index.js`);

const [repo, outDir, ...only] = process.argv.slice(2);
const read = (f) => JSON.parse(fs.readFileSync(path.join(repo, f), 'utf8'));
const components = {
  models: read('component-models.json'),
  definition: read('component-definition.json'),
  filters: read('component-filters.json'),
};
const titles = {};
components.definition.groups.forEach((g) => g.components.forEach((c) => { titles[c.id] = c.title; }));

const files = only.length ? only : (() => {
  const list = ['content/dept.plain.html', 'content/dept-nav.plain.html', 'content/dept-footer.plain.html'];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (p.endsWith('.plain.html')) list.push(path.relative(repo, p));
  });
  walk(path.join(repo, 'content/dept'));
  return list;
})();

const toTitle = (id) => titles[id] || id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

// EDS div markup -> importer markup: sections separated by <hr>, blocks as tables
// (runs inside transform: the importer strips <hr> and comments before transform)
function toImporterDom(document, html) {
  const main = document.querySelector('main');
  main.innerHTML = html;
  main.querySelectorAll('div[class]').forEach((block) => {
    if (block.parentElement.closest('div[class]')) return; // nested divs inside blocks
    const [name, ...variants] = block.classList;
    const table = document.createElement('table');
    const head = table.insertRow();
    const th = document.createElement('th');
    th.colSpan = Math.max(1, ...[...block.children].map((r) => r.children.length));
    th.textContent = toTitle(name) + (variants.length ? ` (${variants.join(', ')})` : '');
    head.append(th);
    [...block.children].forEach((row) => {
      const tr = table.insertRow();
      [...row.children].forEach((cell) => {
        const td = tr.insertCell();
        while (cell.firstChild) td.append(cell.firstChild);
      });
    });
    block.replaceWith(table);
  });
  const sections = [...main.children];
  sections.forEach((s, i) => {
    if (i > 0) s.before(document.createElement('hr'));
    s.replaceWith(...s.childNodes);
  });
  return main;
}

fs.mkdirSync(outDir, { recursive: true });
let ok = 0;
const failed = [];
for (const f of files) {
  const docPath = `/${f.replace(/^content\//, '').replace(/\.plain\.html$/, '')}`;
  try {
    const html = fs.readFileSync(path.join(repo, f), 'utf8');
    const { document } = new JSDOM('<html><body><main></main></body></html>').window;
    const res = await md2jcr(`https://localhost${docPath}`, document, {
      transform: ({ document: d }) => ({ element: toImporterDom(d, html), path: docPath }),
    }, { createDocumentFromString: (s) => new JSDOM(s).window.document }, { components });
    const out = path.join(outDir, `${docPath}.xml`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    // md2jcr leaves '&' unescaped in some attribute values (e.g. video URLs with query strings)
    fs.writeFileSync(out, res.jcr.replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;'));
    if (process.env.KEEP_MD) fs.writeFileSync(path.join(outDir, `${docPath}.md`), res.md);
    ok += 1;
  } catch (e) {
    failed.push([f, e.message]);
  }
}
console.log(`converted ${ok}/${files.length}`);
failed.forEach(([f, m]) => console.log(`  failed ${f}: ${m}`));
