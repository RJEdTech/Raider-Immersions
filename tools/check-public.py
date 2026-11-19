#!/usr/bin/env python3
"""Fail if any public data file holds something that must never publish.
Run before every commit: python3 tools/check-public.py"""
import re, sys, glob, json, subprocess
BAD = [('red mark (unverified)', r'\U0001F534'),
       ('teacher-only note', r'(?i)teacher[- ]only|leaders[\' ]*(version|only)|questions for jason|\bJason\b|\bRiemer\b'),
       ('student writing', r'(?i)\b(essays?|unit 2|students? (heard|wrote)|canvas \d{4,})\b'),
       ('quotation', r'["\u201c][^"\u201d]{25,}["\u201d]'),
       ('quoted speech', r'(?i)\b(said|says|told us|wrote)\s*[:,]?\s*["\u201c]')]
dump = "global.window={};for(const f of process.argv.slice(1))require(require('path').resolve(f));console.log(JSON.stringify({t:window.TRIPS||{},m:window.DMIRROR||{}}))"
files = sorted(glob.glob('trips/*.js'))
data = json.loads(subprocess.check_output(['node', '-e', dump] + files))
def strings(o, path=''):
    if isinstance(o, str): yield path, o
    elif isinstance(o, dict):
        for k, v in o.items(): yield from strings(v, path + '.' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from strings(v, path + '[%d]' % i)
bad = 0
for path, s in strings(data):
    for name, pat in BAD:
        m = re.search(pat, s)
        if m:
            bad += 1; print(f'{path}: {name}: ...{s[max(0, m.start()-60):m.end()+20]}')
if bad:
    print(f'\n{bad} problem(s). Fix the packet or labs/*.json, regenerate, and run again.'); sys.exit(1)
print('check-public: clean')
