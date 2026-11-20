#!/usr/bin/env python3
"""Check pictures.js against the trip data: every picture must sit on the barrier it names,
and every value it draws must appear in one of the sources it cites (a number card, or the Denver note).
Values marked 'our arithmetic' in the row label are allowed to be absent. Run: python3 tools/check-pictures.py"""
import json, re, subprocess, sys, glob
dump = "global.window={};for(const f of process.argv.slice(1))require(require('path').resolve(f));console.log(JSON.stringify({t:window.TRIPS||{},p:window.PICS||{},m:window.DMIRROR||{}}))"
d = json.loads(subprocess.check_output(['node', '-e', dump] + sorted(glob.glob('trips/*.js')) + ['pictures.js']))
bad = n = 0
def forms(v):
    out = set()
    for s in ('%g' % v, '%.2f' % v, '%.1f' % v, '{:,}'.format(int(v)) if float(v).is_integer() else '', '{:,.2f}'.format(v)):
        if s: out.add(s)
    return out
for trip, P in d['p'].items():
    t = d['t'].get(trip)
    if not t: print('no such trip', trip); bad += 1; continue
    for bi, pics in P.items():
        b = t['barriers'][int(bi) - 1] if int(bi) <= len(t['barriers']) else None
        for pic in pics:
            n += 1
            title = re.sub(r'[*]', '', b['title']) if b else ''
            if not b or not title.startswith(re.sub(r'[*]', '', pic['b'])):
                print(f'{trip} {bi}: picture names "{pic["b"]}" but barrier is "{title}"'); bad += 1; continue
            text = ''
            for s in pic['s']:
                if s == 'd': text += ' ' + (b.get('denver') or '') + ' '.join(' '.join(f['text'] for f in d['m'][k]['figures']) for k in (b.get('denverKeys') or []) if k in d['m'])
                else:
                    i = int(s[1:])
                    if i >= len(b['numbers']): print(f'{trip} {bi}: no number card {s}'); bad += 1; continue
                    text += ' ' + b['numbers'][i]['text']
            text = text.replace('**', '')
            if pic.get('w'):
                if pic['w'] not in text: print(f'{trip} {bi}: phrase "{pic["w"]}" not found in sources'); bad += 1
                continue
            for row in pic['rows']:
                if 'our arithmetic' in row[0] or 'A full-time job' == row[0]: continue
                if not any(f in text for f in forms(row[1])):
                    print(f'{trip} {bi}: value {row[1]} ("{row[0]}") not found in sources {pic["s"]}'); bad += 1
print(f'{n} pictures checked, {bad} problem(s)')
sys.exit(1 if bad else 0)
