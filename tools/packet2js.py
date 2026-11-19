#!/usr/bin/env python3
"""Turn one research packet (Markdown) into a public trip file, trips/<id>.js.

The packets are private (they hold teacher-only notes) and live OUTSIDE this repo.
This script keeps only what may be public:
  - drops every sentence, bullet or table cell that contains the red mark (unverified)
  - drops the teacher-only sections: "Where these came from", Cautions' claim list, Questions for Jason
  - drops editor notes (lines in italics, "(checker ...)", "(Jason ...)")
  - turns the check mark into mark 'ok' and the warning mark into mark 'care'
Hand-tuned pieces (labs, Denver keys for the cushion rows, trip basics) come from labs/<id>.json.

Usage: python3 tools/packet2js.py <packet.md> <id>   (writes trips/<id>.js)
"""
import json, re, sys, os

RED, OK, CARE = '\U0001F534', '✅', '⚠️'
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def clean(t):
    t = re.sub(r'\s*\((?:checker|Jason|confirmed by|the course called)[^)]*\)', '', t)
    t = re.sub(r'["\u201c]([^"\u201d]{1,40})["\u201d]', lambda m: m.group(1) if len(m.group(1).split()) <= 5 else m.group(0), t)
    t = re.sub(r'\*On the student site[^*]*\*', '', t)
    t = t.replace('⚠', '⚠')
    return re.sub(r'\s+', ' ', t).strip()


def sentences(t):
    # split on sentence ends that are followed by a space and a capital/marker
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9*"“—(])', t)
    return [p for p in parts if p.strip()]


def drop_red(t):
    if RED not in t:
        return t
    keep = [s for s in sentences(t) if RED not in s]
    return ' '.join(keep)


def mark_of(t):
    if CARE in t or '⚠' in t:
        return 'care'
    if OK in t:
        return 'ok'
    return ''


def strip_marks(t):
    return re.sub(r'\s*(✅|⚠️|⚠)\s*', ' ', t).strip()


def split_sections(md):
    """Return {key: text} for '## N · Title' sections; key is the number token (1, 2, 2c, 2b, 3...)."""
    out, cur, buf = {}, None, []
    for line in md.split('\n'):
        m = re.match(r'^## (\w+) · (.*)', line)
        if m:
            if cur:
                out[cur] = '\n'.join(buf)
            cur, buf = m.group(1), []
        elif cur:
            buf.append(line)
    if cur:
        out[cur] = '\n'.join(buf)
    return out


def bold_blocks(text):
    """Paragraphs that start with **Label.** -> list of (label, body, bullets)."""
    blocks, cur = [], None
    for line in text.split('\n'):
        m = re.match(r'^\*\*([^*]+?)\.?\*\*\s*(.*)', line)
        if m and not line.startswith('- '):
            cur = {'h': m.group(1).strip().rstrip('.'), 'text': m.group(2).strip(), 'items': []}
            blocks.append(cur)
        elif line.startswith('- ') and cur is not None:
            cur['items'].append(line[2:].strip())
        elif line.strip() and cur is not None and not line.startswith('|') and not line.startswith('---'):
            cur['text'] = (cur['text'] + ' ' + line.strip()).strip()
    return blocks


def number(b):
    """'claim. — Source. mark caveat' -> dict"""
    b = clean(b)
    if RED in b:
        return None
    mk = mark_of(b)
    m = re.search(r'(\u2705|\u26a0\ufe0f|\u26a0)', b)
    pre, note = (b[:m.start()], b[m.end():]) if m else (b, '')
    claim, src = pre, ''
    if ' \u2014 ' in pre:
        claim, src = pre.rsplit(' \u2014 ', 1)
    note = note.strip()
    return {'text': strip_marks(claim), 'src': strip_marks(src).rstrip('.'), 'mark': mk, 'note': strip_marks(note)}


def barrier(title, body):
    b = {'title': clean(title), 'numbers': []}
    body = '\n'.join(l for l in body.split('\n') if not re.match(r'^\*[^*].*\*$', l.strip()))
    for blk in bold_blocks(body):
        h, t = blk['h'].lower(), clean(blk['text'])
        if h.startswith('plain'):
            b['plain'] = drop_red(t)
        elif h.startswith('chain'):
            t2 = drop_red(t)
            m = re.split(r'\*\*one day:?\*\*:?', t2, flags=re.I)
            steps = [s.strip(' →') for s in m[0].split('→') if s.strip(' →')]
            b['chain'] = steps
            if len(m) > 1:
                b['oneDay'] = m[1].strip(' :')
        elif h.startswith('numbers'):
            b['numbers'] = [n for n in (number(i) for i in blk['items']) if n and n['text']]
        elif h.startswith('contested'):
            b['contested'] = drop_red(t)
        elif h.startswith('who decided'):
            b['who'] = drop_red(t)
        elif h.startswith('nature'):
            b['nlb'] = drop_red(t)
        elif h.startswith('what people already do'):
            b['doing'] = drop_red(t)
        elif h.startswith('same structure'):
            mq = re.split(r'\*Mirror question:\*', blk['text'])
            b['denver'] = drop_red(clean(mq[0]))
            b['denverKeys'] = sorted(set(re.findall(r'D-[A-Z]+', blk['text'])))
            if len(mq) > 1:
                b['mirrorQ'] = clean(mq[1])
    # mirror question may sit on its own line after the Denver paragraph
    if 'mirrorQ' not in b:
        m = re.search(r'\*Mirror question:\*\s*(.+)', body)
        if m:
            b['mirrorQ'] = clean(m.group(1))
    if 'denverKeys' not in b:
        b['denverKeys'] = sorted(set(re.findall(r'D-[A-Z]+', body)))
    return b


def table_rows(text):
    rows = []
    for line in text.split('\n'):
        if line.startswith('|') and not re.match(r'^\|\s*-', line):
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if len(cells) >= 3 and not cells[0].lower().startswith('when something'):
                rows.append(cells)
    return rows


def cell(t):
    t = clean(t)
    keys = sorted(set(re.findall(r'D-[A-Z]+', t)))
    t = drop_red(t)
    t = re.sub(r'\s*[—-]*\s*\*\*D-[A-Z]+\*\*', '', t)
    t = re.sub(r'(See )?(the )?Denver mirror D-[A-Z]+\.?', '', t).strip()
    return {'text': strip_marks(t), 'mark': mark_of(t), 'keys': keys}


def bullets(text):
    return [clean(l[2:]) for l in text.split('\n') if l.startswith('- ')]


def main(path, tid):
    md = open(path, encoding='utf-8').read()
    S = split_sections(md)
    trip = {'id': tid}

    # 1 · place and people
    place = []
    for blk in bold_blocks(S.get('1', '')):
        items = [drop_red(clean(i)) for i in blk['items']]
        place.append({'h': blk['h'], 'text': drop_red(clean(blk['text'])), 'items': [i for i in items if i]})
    trip['place'] = place

    # 2 · barriers (skip the teacher-only "where these came from" preamble; keep "The web")
    sec2 = S.get('2', '')
    web = re.search(r'\*\*The web\.\*\*\s*(.+)', sec2)
    trip['web'] = clean(web.group(1)) if web else ''
    parts = re.split(r'^### Barrier \d+ · ', sec2, flags=re.M)
    bars = []
    for p in parts[1:]:
        title, _, body = p.partition('\n')
        bars.append(barrier(title, body))
    trip['barriers'] = bars

    # 2c · cushion table
    cush = []
    for r in table_rows(S.get('2c', '')):
        cush.append({'label': re.sub(r'\*', '', r[0]), 'there': cell(r[1]), 'denver': cell(r[2])})
    trip['cushion'] = cush
    notice = re.search(r'\*\*What to notice\.\*\*\s*(.+)', S.get('2c', ''))
    trip['cushionNotice'] = clean(notice.group(1)) if notice else ''

    # 2b · fences
    fences = []
    for b in bullets(S.get('2b', '')):
        m = re.match(r'\*\*([^*]+?)\.?\*\*\s*(.*)', b)
        if m:
            fences.append({'h': re.sub(r'\s*\(.*\)', '', m.group(1)).rstrip('.'), 'text': drop_red(m.group(2))})
    trip['fences'] = fences

    # 3 · voices (grouped)
    trip['voices'] = [{'h': b['h'], 'items': [drop_red(clean(i)) for i in b['items'] if RED not in i]}
                      for b in bold_blocks(S.get('3', '')) if b['items']]

    # 4 · cautions: only the public "handle with care" and "framings" lists
    care = []
    for b in bold_blocks(S.get('4', '')):
        if b['h'].lower().startswith(('handle with care', 'framings')):
            care.append({'h': b['h'], 'items': [drop_red(clean(i)) for i in b['items'] if RED not in i]})
    trip['carry'] = care

    # 5 · labs (text; config can attach an interactive kind by lab letter)
    labs = []
    for p in re.split(r'^### Lab ', S.get('5', ''), flags=re.M)[1:]:
        head, _, body = p.partition('\n')
        m = re.match(r'(\w+)?\s*·?\s*(.*)', head)
        lab = {'key': (m.group(1) or '').strip(), 'title': clean(m.group(2).replace('(required)', ''))}
        for b in body.split('\n'):
            fm = re.match(r'^- \*\*([^*:]+):?\*\*:?\s*(.*)', b)
            if fm and RED not in fm.group(2):
                k = fm.group(1).strip().lower()
                key = {'question': 'question', 'student changes': 'changes', 'real data': 'data',
                       'notice': 'notice', 'your call': 'yourCall', 'denver run': 'denverRun'}.get(k)
                if key:
                    lab[key] = clean(fm.group(2))
        if lab.get('question'):
            labs.append(lab)
    trip['labs'] = labs

    # 6 · theology
    th = S.get('6', '')
    q = re.search(r'\*\*Encounter question to carry:\*\*\s*(.+)', th)
    trip['theology'] = {'readings': [drop_red(i) for i in bullets(th) if RED not in i],
                        'question': clean(q.group(1)).strip('*') if q else ''}

    # 7 · sources with links
    srcs = []
    for b in bold_blocks(S.get('7', '')):
        items = []
        for i in b['items']:
            urls = re.findall(r'https?://\S+', i)
            label = clean(re.sub(r'\s*[—-]\s*https?://\S+.*', '', i))
            if RED in i:
                continue
            items.append({'t': label, 'url': urls[0].rstrip(').,') if urls else ''})
        srcs.append({'h': b['h'], 'items': items})
    trip['sources'] = srcs

    # merge the hand-tuned config
    cfg_path = os.path.join(ROOT, 'labs', tid + '.json')
    if os.path.exists(cfg_path):
        cfg = json.load(open(cfg_path, encoding='utf-8'))
        trip.update({k: v for k, v in cfg.items() if k not in ('cushionKeys', 'hideBarriers', 'replace', 'barrierKeys')})
        # paraphrase overrides: [regex, replacement] applied to every string (keeps quotes off the site)
        reps = cfg.get('replace', [])
        def walk(o):
            if isinstance(o, str):
                for a, b in reps:
                    o = re.sub(a, b, o)
                return o
            if isinstance(o, list):
                return [walk(x) for x in o]
            if isinstance(o, dict):
                return {k: walk(v) for k, v in o.items()}
            return o
        trip = walk(trip)
        for row, keys in cfg.get('cushionKeys', {}).items():
            for c in trip['cushion']:
                if c['label'].lower().startswith(row.lower()):
                    c['denver']['keys'] = keys
        for n, keys in cfg.get('barrierKeys', {}).items():
            b = trip['barriers'][int(n) - 1]
            b['denverKeys'] = sorted(set(b.get('denverKeys', []) + keys))
        hide = set(cfg.get('hideBarriers', []))
        trip['barriers'] = [b for i, b in enumerate(trip['barriers'], 1) if i not in hide]

    out = os.path.join(ROOT, 'trips', tid + '.js')
    js = ('/* Generated by tools/packet2js.py from the private research packet. Do not edit by hand:\n'
          '   edit the packet or labs/' + tid + '.json and regenerate. */\n'
          'window.TRIPS=window.TRIPS||{};window.TRIPS[' + json.dumps(tid) + ']=' +
          json.dumps(trip, ensure_ascii=False, indent=1) + ';\n')
    open(out, 'w', encoding='utf-8').write(js)
    print('wrote', out, len(trip['barriers']), 'barriers,', len(trip['cushion']), 'cushion rows')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
