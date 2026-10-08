#!/usr/bin/env python3
"""
Builds an AEM (FileVault / CRX) content package with the design-image pages' images as DAM assets:

  images/<site>/<file>  ->  /content/dam/exp-mord-agent/<site>/<file>   (dam:Asset)

Install it with CRX Package Manager on the AEM author instance (Tools > Deployment > Packages),
then run "Reprocess Assets" on the folders so renditions and metadata are generated.
Filters use mode="merge": existing assets in those folders are kept.

Layout follows an AEM asset export: the asset .content.xml holds jcr:content + metadata, the
binary is _jcr_content/renditions/original with its node type in original.dir/.content.xml.

Usage: python3 tools/aem-packages/build-dam-package.py
"""
import mimetypes
import os
import zipfile
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
DAM_ROOT = '/content/dam/exp-mord-agent'
SITES = {
    'broadridge': 'Broadridge',
    'kotak': 'Kotak Life',
    'tatacars': 'Tata Cars',
    'loans': 'Loans',
}
GROUP = 'exp-mord-agent'
NAME = 'exp-mord-agent-design-images'
VERSION = '1.0.1'
OUT = os.path.join(HERE, f'{NAME}-{VERSION}.zip')

NS = ('xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" '
      'xmlns:dam="http://www.day.com/dam/1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" '
      'xmlns:sling="http://sling.apache.org/jcr/sling/1.0"')


def folder_xml(title):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n'
            f'    jcr:primaryType="sling:OrderedFolder"\n    jcr:title="{title}">\n'
            f'    <jcr:content jcr:primaryType="nt:unstructured" jcr:title="{title}"/>\n</jcr:root>\n')


def asset_xml(name, mime):
    # renditions/ is not declared here - it comes from the _jcr_content/renditions directory
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n'
            f'    jcr:primaryType="dam:Asset">\n'
            f'    <jcr:content jcr:primaryType="dam:AssetContent">\n'
            f'        <metadata jcr:primaryType="nt:unstructured" dc:format="{mime}" dc:title="{name}"/>\n'
            f'        <related jcr:primaryType="nt:unstructured"/>\n'
            f'    </jcr:content>\n</jcr:root>\n')


def original_xml(mime):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n'
            f'    jcr:primaryType="nt:file">\n'
            f'    <jcr:content jcr:primaryType="nt:resource" jcr:mimeType="{mime}"/>\n</jcr:root>\n')


def main():
    filters = ''.join(f'    <filter root="{DAM_ROOT}/{site}" mode="merge"/>\n' for site in SITES)
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    count = 0
    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('META-INF/vault/filter.xml',
                   f'<?xml version="1.0" encoding="UTF-8"?>\n<workspaceFilter version="1.0">\n{filters}</workspaceFilter>\n')
        z.writestr('META-INF/vault/properties.xml', f"""<?xml version="1.0" encoding="utf-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
<comment>FileVault Package Properties</comment>
<entry key="name">{NAME}</entry>
<entry key="group">{GROUP}</entry>
<entry key="version">{VERSION}</entry>
<entry key="description">DAM assets for the Broadridge, Kotak Life, Tata Cars and Loans design pages (images cropped from the design files).</entry>
<entry key="packageType">content</entry>
<entry key="created">{now}</entry>
<entry key="createdBy">exp-mord-agent</entry>
<entry key="requiresRoot">false</entry>
<entry key="allowIndexDefinitions">false</entry>
</properties>
""")
        z.writestr(f'jcr_root{DAM_ROOT}/.content.xml', folder_xml('Exp Mord Agent'))
        for site, title in SITES.items():
            src_dir = os.path.join(REPO, 'images', site)
            base = f'jcr_root{DAM_ROOT}/{site}'
            z.writestr(f'{base}/.content.xml', folder_xml(title))
            for name in sorted(os.listdir(src_dir)):
                path = os.path.join(src_dir, name)
                if not os.path.isfile(path):
                    continue
                mime = mimetypes.guess_type(name)[0] or 'application/octet-stream'
                z.writestr(f'{base}/{name}/.content.xml', asset_xml(name, mime))
                z.write(path, f'{base}/{name}/_jcr_content/renditions/original')
                z.writestr(f'{base}/{name}/_jcr_content/renditions/original.dir/.content.xml', original_xml(mime))
                count += 1
    print(f'{OUT}: {count} assets, {os.path.getsize(OUT) // 1024} KB')


if __name__ == '__main__':
    main()
