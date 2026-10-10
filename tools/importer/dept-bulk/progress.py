#!/usr/bin/env python3
"""Progress of the parallel DEPT bulk imports: python3 tools/importer/dept-bulk/progress.py [name-prefix]"""
import glob, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
prefix = sys.argv[1] if len(sys.argv) > 1 else ''
tot = {'saved': 0, 'reused': 0, '404': 0, 'failed': 0, 'urls': 0, 'low': 0}
for log in sorted(glob.glob(os.path.join(HERE, 'logs', f'{prefix}*.log'))):
    chunk = os.path.join(HERE, 'chunks', os.path.basename(log).replace('.log', '.txt'))
    urls = sum(1 for l in open(chunk) if l.strip()) if os.path.exists(chunk) else 0
    text = open(log, errors='replace').read()
    saved = len(re.findall(r'✅ Saved content', text))
    reused = len(re.findall(r'(?i)♻️|reused existing|reusing cached', text))
    nf = len(re.findall(r'source page is a 404', text))
    failed = len(re.findall(r'❌ Failed for', text)) - nf
    low = len(re.findall(r'below 90\.0%', text))
    done = 'done' if 'Bulk Import] Completed' in text else 'running'
    print(f'{os.path.basename(log):34} {saved + reused + nf + failed:5}/{urls:<5} saved {saved:5} 404 {nf:4} failed {failed:3} <90% {low:4} {done}')
    for k, v in (('saved', saved), ('reused', reused), ('404', nf), ('failed', failed), ('urls', urls), ('low', low)):
        tot[k] += v
print(f"TOTAL {tot['saved'] + tot['reused'] + tot['404'] + tot['failed']}/{tot['urls']} saved {tot['saved']} reused {tot['reused']} 404 {tot['404']} failed {tot['failed']} below-90% {tot['low']}")
