#!/usr/bin/env node
/**
 * Uploads the DEPT site images to AEM Assets (AEM as a Cloud Service direct binary upload).
 *
 * Reads the manifest (dept-images.csv: source,dam_path — see build-manifest.py), downloads each image
 * from dept.global into ./download/<dam path>, then uploads the folder tree to
 * /content/dam/exp-mord-agent/dept with @adobe/aem-upload. Already uploaded assets are skipped on
 * re-runs (state in ./download/.uploaded.txt), so the script can be stopped and restarted.
 *
 * Run it on your own machine with your own AEM access token (never share the token):
 *   cd tools/aem-packages/dept
 *   npm install
 *   AEM_HOST=https://author-pXXXX-eYYYY.adobeaemcloud.com AEM_TOKEN=<token> node upload-dept-images.mjs
 * Options: --manifest <csv>  --prefix <dam path prefix>  --batch <n assets per upload, default 200>
 * The token is a local development token from the AEM Developer Console (Integrations > Local token).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DAM_ROOT = '/content/dam/exp-mord-agent/dept';
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const MANIFEST = path.resolve(HERE, arg('manifest', 'dept-images.csv'));
const PREFIX = arg('prefix', '');
const BATCH = Number(arg('batch', 200));
const DOWNLOAD = path.join(HERE, 'download');
const STATE = path.join(DOWNLOAD, '.uploaded.txt');
const { AEM_HOST, AEM_TOKEN } = process.env;

if (!AEM_HOST || !AEM_TOKEN) {
  console.error('Set AEM_HOST (author URL) and AEM_TOKEN (your access token) in the environment.');
  process.exit(1);
}

function readManifest(file) {
  const [, ...lines] = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  return lines.map((line) => {
    const m = line.match(/^"?([^",]+)"?,"?([^",]+)"?$/);
    return m ? { source: m[1], dam: m[2] } : null;
  }).filter((r) => r && r.dam.startsWith(DAM_ROOT) && r.dam.startsWith(PREFIX));
}

async function download({ source, dam }) {
  const file = path.join(DOWNLOAD, dam.slice(DAM_ROOT.length));
  if (fs.existsSync(file)) return file;
  const res = await fetch(source, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${res.status} ${source}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

async function main() {
  const { FileSystemUploadOptions, FileSystemUpload } = await import('@adobe/aem-upload');
  const rows = readManifest(MANIFEST);
  fs.mkdirSync(DOWNLOAD, { recursive: true });
  const done = new Set(fs.existsSync(STATE) ? fs.readFileSync(STATE, 'utf8').split('\n').filter(Boolean) : []);
  const todo = rows.filter((r) => !done.has(r.dam));
  console.log(`${rows.length} images in manifest, ${todo.length} still to upload`);

  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    const files = [];
    // download with limited parallelism
    for (let j = 0; j < batch.length; j += 8) {
      // eslint-disable-next-line no-await-in-loop
      const results = await Promise.allSettled(batch.slice(j, j + 8).map(download));
      results.forEach((r, k) => {
        if (r.status === 'fulfilled') files.push({ row: batch[j + k], file: r.value });
        else console.warn(`  download failed: ${r.reason.message}`);
      });
    }
    // upload each target folder of the batch
    const byFolder = new Map();
    files.forEach(({ row, file }) => {
      const folder = path.posix.dirname(row.dam);
      if (!byFolder.has(folder)) byFolder.set(folder, []);
      byFolder.get(folder).push({ row, file });
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const [folder, items] of byFolder) {
      const options = new FileSystemUploadOptions()
        .withUrl(`${AEM_HOST.replace(/\/$/, '')}${folder}`)
        .withHttpOptions({ headers: { Authorization: `Bearer ${AEM_TOKEN}` } })
        .withDeepUpload(false);
      const upload = new FileSystemUpload();
      try {
        // eslint-disable-next-line no-await-in-loop
        await upload.upload(options, items.map((x) => x.file));
        items.forEach(({ row }) => fs.appendFileSync(STATE, `${row.dam}\n`));
      } catch (e) {
        console.warn(`  upload to ${folder} failed: ${e.message}`);
      }
    }
    console.log(`  ${Math.min(i + BATCH, todo.length)} / ${todo.length}`);
  }
  console.log('Done. In AEM Assets, run "Reprocess Assets" on the dept folder if renditions are missing.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
