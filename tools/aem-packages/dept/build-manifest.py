#!/usr/bin/env python3
"""
Builds the DEPT image manifest from the import reports.

Every DEPT import (import-dept-site.js, import-dept.js, import-dept-fragments.js) records the images it
pointed to AEM Assets as [source URL, DAM path] pairs in tools/importer/reports/**/*.report.json.
This script merges them into dept-images.csv (source,dam_path), one row per AEM asset.

Usage:
  python3 tools/aem-packages/dept/build-manifest.py              # all DEPT pages imported so far
  python3 tools/aem-packages/dept/build-manifest.py dept-nav dept-footer dept   # only these report paths
"""
import csv
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
REPORTS = os.path.join(REPO, 'tools', 'importer', 'reports')
OUT = os.path.join(HERE, 'dept-images.csv')


def report_files(only):
    if only:
        for path in only:
            f = os.path.join(REPORTS, f'{path}.report.json')
            if os.path.exists(f):
                yield f
        return
    yield from glob.glob(os.path.join(REPORTS, 'dept', '**', '*.report.json'), recursive=True)
    for name in ('dept', 'dept-nav', 'dept-footer'):
        f = os.path.join(REPORTS, f'{name}.report.json')
        if os.path.exists(f):
            yield f


def main():
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else OUT
    only = [a for a in sys.argv[1:] if not a.startswith('--') and a != out]
    assets = {}
    pages = 0
    for f in report_files(only):
        try:
            report = json.load(open(f, encoding='utf-8'))
        except (OSError, ValueError):
            continue
        if report.get('status') not in (None, 'success'):
            continue
        pages += 1
        for pair in report.get('images') or []:
            if isinstance(pair, list) and len(pair) == 2:
                source, dam = pair
                assets.setdefault(dam, source)
    with open(out, 'w', newline='', encoding='utf-8') as fh:
        writer = csv.writer(fh)
        writer.writerow(['source', 'dam_path'])
        for dam in sorted(assets):
            writer.writerow([assets[dam], dam])
    print(f'{len(assets)} images from {pages} pages -> {os.path.relpath(out, REPO)}')


if __name__ == '__main__':
    main()
