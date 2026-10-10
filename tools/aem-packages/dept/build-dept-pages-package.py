#!/usr/bin/env python3
"""
Builds an installable AEM (FileVault / CRX) content package with the imported DEPT pages.

Converts every DEPT page in content/ (dept, dept-nav, dept-footer and everything under content/dept/)
to Universal Editor JCR with convert-dept-pages.mjs, then writes each page as a cq:Page under
/content/exp-mord-agent (paths.json maps /content/exp-mord-agent/ -> /). Folders without an imported
page (e.g. /dept/case) get an empty placeholder cq:Page so the tree stays a page hierarchy.
Filters use mode="update": packaged pages are added or updated, nothing else is removed.
Images are separate packages (build-dept-package.py); pages reference them by DAM path.

Usage:
  python3 tools/aem-packages/dept/build-dept-pages-package.py
  python3 tools/aem-packages/dept/build-dept-pages-package.py --version 1.0.1
Install: Tools > Deployment > Packages > Upload > Install (after the image packages).
"""
import argparse
import importlib.util
import os
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SITE_ROOT = 'content/exp-mord-agent'
ROOTS = ['dept', 'dept-nav', 'dept-footer']
DEFAULT_SCRIPTS = os.path.expanduser(
    '~/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts')
MAX_MB = 90
BATCH = 400

_spec = importlib.util.spec_from_file_location('build_dept_package', os.path.join(HERE, 'build-dept-package.py'))
base = importlib.util.module_from_spec(_spec)  # reuse esc() and properties_xml()
_spec.loader.exec_module(base)


def placeholder_xml(title):
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" '
            'xmlns:sling="http://sling.apache.org/jcr/sling/1.0" jcr:primaryType="cq:Page">\n'
            '    <jcr:content cq:template="/libs/core/franklin/templates/page" '
            'sling:resourceType="core/franklin/components/page/v1/page" jcr:primaryType="cq:PageContent" '
            f'jcr:title="{base.esc(title)}">\n'
            '        <root jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/root/v1/root"/>\n'
            '    </jcr:content>\n</jcr:root>\n')


def filter_xml(roots):
    lines = ''.join(f'    <filter root="/{SITE_ROOT}/{r}" mode="update"/>\n' for r in roots)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<workspaceFilter version="1.0">\n{lines}</workspaceFilter>\n'


def stale_pages():
    """Pages whose source is gone: their last import failed (live 404) after an earlier success.
    The importer reports failures under reports/<live path>, successes under reports/dept/<live path>."""
    import glob
    import json
    reports = os.path.join(REPO, 'tools', 'importer', 'reports')
    stale = set()
    for f in glob.glob(os.path.join(reports, '**', '*.report.json'), recursive=True):
        rel = os.path.relpath(f, reports)[:-len('.report.json')]
        if rel.startswith('dept' + os.sep) or rel == 'dept':
            continue
        try:
            failed = json.load(open(f, encoding='utf-8'))
            ok = json.load(open(os.path.join(reports, 'dept', f'{rel}.report.json'), encoding='utf-8'))
        except (OSError, ValueError):
            continue
        if failed.get('status') == 'failed' and failed.get('timestamp', '') > ok.get('timestamp', ''):
            stale.add(f'dept/{rel}'.replace(os.sep, '/'))
    return stale


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--name', default='exp-mord-agent-dept-pages')
    ap.add_argument('--version', default='1.0.0')
    ap.add_argument('--scripts', default=os.environ.get('SCRIPTS', DEFAULT_SCRIPTS),
                    help='folder with node_modules/@adobe/helix-importer and jsdom')
    args = ap.parse_args()

    # the same page list as convert-dept-pages.mjs, converted in batches (one node run each,
    # so memory stays bounded over thousands of pages)
    files = [f'content/{r}.plain.html' for r in ROOTS if os.path.exists(os.path.join(REPO, f'content/{r}.plain.html'))]
    for d, _, names in os.walk(os.path.join(REPO, 'content', 'dept')):
        files += sorted(os.path.relpath(os.path.join(d, n), REPO) for n in names if n.endswith('.plain.html'))
    with tempfile.TemporaryDirectory() as tmp:
        for i in range(0, len(files), BATCH):
            subprocess.run(['node', os.path.join(HERE, 'convert-dept-pages.mjs'), REPO, tmp, *files[i:i + BATCH]],
                           check=True, env={**os.environ, 'SCRIPTS': args.scripts})
        pages = {}
        for d, _, names in os.walk(tmp):
            for n in names:
                if n.endswith('.xml'):
                    f = os.path.join(d, n)
                    ET.parse(f)  # fail on invalid XML rather than at install time
                    pages[os.path.relpath(f, tmp)[:-4]] = open(f, encoding='utf-8').read()

        stale = stale_pages() & set(pages)
        for p in stale:
            del pages[p]
        if stale:
            print(f'skipped {len(stale)} pages that are gone on the live site: {", ".join(sorted(stale))}')
        parents = {'/'.join(p.split('/')[:i]) for p in pages for i in range(1, p.count('/') + 1)}
        placeholders = sorted(parents - set(pages))
        out = os.path.join(HERE, f'{args.name}-{args.version}.zip')
        with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
            for p in sorted(pages):
                z.writestr(f'jcr_root/{SITE_ROOT}/{p}/.content.xml', pages[p])
            for p in placeholders:
                z.writestr(f'jcr_root/{SITE_ROOT}/{p}/.content.xml', placeholder_xml(p.split('/')[-1]))
            z.writestr('META-INF/vault/filter.xml', filter_xml(ROOTS))
            z.writestr('META-INF/vault/properties.xml', base.properties_xml(
                args.name, args.version,
                f'DEPT pages ({len(pages)} pages, {len(placeholders)} placeholder folders) under /{SITE_ROOT}'))

    size = os.path.getsize(out) / 1024 / 1024
    print(f'{os.path.basename(out)}: {len(pages)} pages + {len(placeholders)} placeholders, {size:.1f} MB')
    if size > MAX_MB:
        print(f'warning: over {MAX_MB} MB, too large to commit to GitHub', file=sys.stderr)


if __name__ == '__main__':
    main()
