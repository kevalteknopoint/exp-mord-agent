#!/usr/bin/env python3
"""
Builds installable AEM (FileVault / CRX) content packages with DEPT images as DAM assets.

Reads a manifest CSV (source,dam_path — see build-manifest.py), downloads each source image from
dept.global and writes it as a dam:Asset at its dam_path. Output is split into parts of at most
--max-mb (default 400 MB) so each part can be uploaded in CRX Package Manager
(Tools > Deployment > Packages > Upload > Install), then "Reprocess Assets" on
/content/dam/exp-mord-agent/dept. Filters use mode="merge": existing assets are kept.

Usage:
  python3 tools/aem-packages/dept/build-dept-package.py --manifest dept-core-images.csv --name exp-mord-agent-dept-core
  python3 tools/aem-packages/dept/build-dept-package.py --manifest dept-images.csv --prefix /content/dam/exp-mord-agent/dept/uploads/2026/ --max-mb 800
"""
import argparse
import csv
import mimetypes
import os
import sys
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
GROUP = 'exp-mord-agent'
DAM_ROOT = '/content/dam/exp-mord-agent/dept'
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}
NS = ('xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" '
      'xmlns:dam="http://www.day.com/dam/1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" '
      'xmlns:sling="http://sling.apache.org/jcr/sling/1.0"')
mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('image/avif', '.avif')


def esc(value):
    return value.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


def folder_xml(title):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n'
            f'    jcr:primaryType="sling:OrderedFolder"\n    jcr:title="{esc(title)}">\n'
            f'    <jcr:content jcr:primaryType="nt:unstructured" jcr:title="{esc(title)}"/>\n</jcr:root>\n')


def asset_xml(name, mime):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n'
            f'    jcr:primaryType="dam:Asset">\n'
            f'    <jcr:content jcr:primaryType="dam:AssetContent">\n'
            f'        <metadata jcr:primaryType="nt:unstructured" dc:format="{mime}" dc:title="{esc(name)}"/>\n'
            f'        <related jcr:primaryType="nt:unstructured"/>\n'
            f'    </jcr:content>\n</jcr:root>\n')


def original_xml(mime):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n'
            f'    jcr:primaryType="nt:file">\n'
            f'    <jcr:content jcr:primaryType="nt:resource" jcr:mimeType="{mime}"/>\n</jcr:root>\n')


def filter_xml(roots):
    lines = ''.join(f'    <filter root="{esc(r)}" mode="merge"/>\n' for r in roots)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<workspaceFilter version="1.0">\n{lines}</workspaceFilter>\n'


def properties_xml(name, version, description):
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    return ('<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
            '<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">\n<properties>\n'
            f'<entry key="name">{name}</entry>\n<entry key="group">{GROUP}</entry>\n'
            f'<entry key="version">{version}</entry>\n<entry key="description">{esc(description)}</entry>\n'
            f'<entry key="created">{now}</entry>\n<entry key="createdBy">exp-mord-agent</entry>\n'
            '<entry key="requiresRoot">false</entry>\n<entry key="allowIndexDefinitions">false</entry>\n'
            '<entry key="packageType">content</entry>\n</properties>\n')


def download(row):
    source, dam = row
    try:
        req = urllib.request.Request(source, headers=UA)
        with urllib.request.urlopen(req, timeout=60) as res:
            return source, dam, res.read(), res.headers.get_content_type()
    except Exception as e:  # noqa: BLE001
        return source, dam, None, str(e)


def write_part(rows, name, version, part, total_parts):
    suffix = f'-part{part:03d}' if total_parts > 1 else ''
    pkg_name = f'{name}{suffix}'
    out = os.path.join(HERE, f'{pkg_name}-{version}.zip')
    roots = [DAM_ROOT]  # mode="merge": only adds/updates the packaged assets
    folders = set()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for _, dam, data, mime in rows:
            parts = dam.strip('/').split('/')
            for i in range(3, len(parts)):  # content/dam/<site>/... folders
                folder = '/'.join(parts[:i])
                if folder not in folders:
                    folders.add(folder)
                    z.writestr(f'jcr_root/{folder}/.content.xml', folder_xml(parts[i - 1]))
            base = f'jcr_root/{dam.strip("/")}'
            asset_mime = mimetypes.guess_type(dam)[0] or mime or 'application/octet-stream'
            z.writestr(f'{base}/.content.xml', asset_xml(parts[-1], asset_mime))
            z.writestr(f'{base}/_jcr_content/renditions/original', data, compress_type=zipfile.ZIP_STORED)
            z.writestr(f'{base}/_jcr_content/renditions/original.dir/.content.xml', original_xml(asset_mime))
        z.writestr('META-INF/vault/filter.xml', filter_xml(roots))
        z.writestr('META-INF/vault/properties.xml', properties_xml(
            pkg_name, version, f'DEPT site images as DAM assets ({len(rows)} assets, part {part} of {total_parts})'))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--manifest', default=os.path.join(HERE, 'dept-images.csv'))
    ap.add_argument('--name', default='exp-mord-agent-dept-images')
    ap.add_argument('--version', default='1.0.0')
    ap.add_argument('--prefix', default='', help='only DAM paths starting with this prefix')
    ap.add_argument('--max-mb', type=int, default=400)
    ap.add_argument('--workers', type=int, default=8)
    args = ap.parse_args()

    manifest = args.manifest if os.path.isabs(args.manifest) else os.path.join(HERE, args.manifest)
    with open(manifest, encoding='utf-8') as fh:
        rows = [(r['source'], r['dam_path']) for r in csv.DictReader(fh) if r['dam_path'].startswith(args.prefix)]
    print(f'{len(rows)} images to download')

    ok, failed = [], []
    with ThreadPoolExecutor(args.workers) as ex:
        for source, dam, data, info in ex.map(download, rows):
            (ok if data else failed).append((source, dam, data, info))
    for source, _, _, err in failed:
        print(f'  failed: {source} ({err})', file=sys.stderr)

    limit = args.max_mb * 1024 * 1024
    parts, current, size = [], [], 0
    for item in ok:
        if current and size + len(item[2]) > limit:
            parts.append(current)
            current, size = [], 0
        current.append(item)
        size += len(item[2])
    if current:
        parts.append(current)
    for i, part in enumerate(parts, 1):
        out = write_part(part, args.name, args.version, i, len(parts))
        print(f'  {os.path.basename(out)}: {len(part)} assets, {os.path.getsize(out) / 1024 / 1024:.1f} MB')
    print(f'done: {len(ok)} packaged, {len(failed)} failed')


if __name__ == '__main__':
    main()
