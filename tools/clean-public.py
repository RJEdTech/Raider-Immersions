#!/usr/bin/env python3
"""Make the public data read as a page for students, not as notes to whoever builds the site.

The research packets were written for a builder. Converted straight to trips/<id>.js they carried
builder notes onto the public site: "confirm before publishing", "See Denver mirror D-HOUSING",
"Peru packet, Barrier 15" given as a source, and remarks drawn from student writing and course pages.
This script removes or rewrites all of that. It is the LAST step of a rebuild:

    packet2js.py / mirror2js.py / make-labs.py  ->  clean-public.py  ->  check-public.py  ->  check-pictures.py

It edits trips/*.js and labs/*.json in place and is safe to run twice.
Usage: python3 tools/clean-public.py [--report]
"""
import json, re, sys, glob

REPORT = '--report' in sys.argv
removed = []          # (file, path, text) of every sentence or parenthetical dropped
manual_hits = set()

# ---------- 1. hand rewrites: passages that came from student writing, course pages or builder notes ----------
# (file id, old text, new text). Each is applied wherever the old text appears in that trip.
MANUAL = [
 ('memphis', "For many, the first time being among the only white people in a room. The discomfort was named honestly and rarely connected to Memphis history or to who lives where in Denver.",
             "For some students this is the first time being among the only white people in a room. Name the discomfort honestly, then connect it to Memphis history and to who lives where in Denver."),
 ('memphis', "Asked what the group did well, most journals (about 15 of 18) talk about the RJ group: bunkroom nights, cards, the talent show, van rides. Many also say the group should have been more serious in nightly reflection and asked more questions (about 8 of 18).",
             "A week like this can become mostly about your own group: bunkroom nights, cards, the talent show, van rides. Those are good. Ask more questions than feels comfortable, and take the nightly reflection seriously."),
 ('memphis', "— several post-trip analyses pasted a chatbot's evaluation of whether the student had encountered people. The noticing is the part only the student can do.",
             "— pasting a chatbot's evaluation of whether you encountered people. The noticing is the part only you can do."),
 ('memphis', "; the packet describes the mechanism, not the number. How many families RJ groups have helped: ask Serve901.", "."),
 ('dc', "Who gets heard at the Colorado Capitol: Denver mirror **D-COMMON** (no mirror key covers voting or representation yet; flag for the Denver mirror agent). **But the mirror is in the room:** most RJ students on this trip are under 18 and cannot vote either. Rep. Neguse and Rep. Crow met them anyway.",
        "Who gets heard at the Colorado Capitol? **The mirror is in the room:** most students on this trip are under 18 and cannot vote either. Members of Congress met them anyway."),
 ('denver', " Five on-site group discussions are built into the course; none was used in 2025–26. ✅.", ""),
 ('denver', "(some students expected the week to be awful)", "(you may expect the week to be awful)"),
 ('denver', "**Turning inward:** in RJ's Denver reflections, a question about the people at the site is most often answered about the student's own stress or loneliness.",
            "**Turning inward:** answering a question about the people at the site with your own stress or loneliness."),
 ('dr', "**The work, as students describe it:**", "**The work:**"),
 ('dr', "**Conditions students describe:**", "**What to expect:**"),
 ('dr', "**How the class prepares (Ortiz's pages):**", "**How the class prepares:**"),
 ('dr', " No paper in 2025 or 2026 mentions a relative abroad (Canvas check), so this barrier is the one students are least prepared to notice.", " This barrier is easy to miss."),
 ('honduras-sps', "students set their own tuition beside a family's yearly income, or remembered a large repair their family paid at once",
                  "setting your own tuition beside a family's yearly income, or remembering a large repair your family paid at once"),
 ('honduras-sps', "a local teen offering to carry an RJ student's water bottle", "someone offering to carry your water bottle"),
 ('honduras-sps', " lasted for some students until late in the trip.", " can last until late in the trip."),
 ('honduras-sps', "A student in 2024 asked, on the dump, whether God is here.", "Standing on the dump, it is natural to ask whether God is here."),
 ('honduras-sps', "Some students made themselves speak Spanish and made friends at the soccer field; others leaned on", "Some students make themselves speak Spanish and make friends at the soccer field; others lean on"),
 ('honduras-teg', "One 2024 draft asked, on the dump, whether God is there.", "It is natural to ask, on the dump, whether God is there."),
 ('honduras-teg', ", which kept some students from listening until late in the week", ", which can keep you from listening until late in the week"),
 ('honduras-teg', "a family's hardest story was sometimes told in front of the group, and students felt they had walked into something that was not theirs to hear (C, site not stated).",
                  "a family's hardest story is sometimes told in front of the group, and you may feel you have walked into something that is not yours to hear."),
 ('honduras-teg', "; north coast, so it belongs more to the San Pedro Sula packet", "; set on the north coast"),
 ('jfarm', "Students who make that turn can be asked the same question about the city:", "If you make that turn, ask the same question about the city:"),
 ('jfarm', "Students describe arriving at the Catholic Worker house seeing unhoused people as statistics, or guessing at addiction, until a guest greeted them.",
           "It is easy to arrive at the Catholic Worker house seeing unhoused people as statistics, or guessing at addiction, until a guest greets you."),
 ('jfarm', "The barriers in this packet are", "The barriers on these pages are"),
 ('panama', "RJ students write that Amigos volunteers met them at the airport, and a final post thanks Regis and Amigos. ✅", "Amigos volunteers meet the group at the airport."),
 ('quito', " From the teacher pages and modules (2023, 2025, 2026) ✅:", ""),
 ('quito', "The course pages present ten founding values", "The Center teaches ten founding values"),
 ('quito', "**What the Center asks of families. Treat as history until confirmed.**", "**What the Center asked of families (2009).**"),
 ('quito', " Students saw a baby carried to work for lack of care (Canvas pattern).", ""),
 ('tijuana-doc', "** **Who the", "**Who the"),
 ('tijuana-doc', "**Prep sequence** (page dated from a January 2024 cycle):", "**Prep sequence:**"),
 ('tijuana-toe', "Some students chose this trip because it was", "Some students choose this trip because it is"),
 ('peru', "Students saw one-room houses; ", "You may see one-room houses; "),
 ('peru', "Students saw a shared kitchen in the town where they stayed; the site does not need to name it.", "You may see a shared kitchen in the town where you stay."),
 ('peru', "Whether the kitchen students saw is", "Whether the kitchen you may see is"),
 ('peru', "students saw the pattern before peak storms", "you will see the pattern before peak storms"),
]
# whole background blocks (by heading) that are builder notes, and list items to drop by their opening words
DROP_BLOCK_H = [r'^Simulation$']
RENAME_H = {r'^Which neighborhoods students actually stand in:?$': 'Where you will be',
            r"^RJ's other Denver immersions.*": "RJ's other Denver immersions",
            r"^What RJ's Canvas shows about this trip$": 'What the course asks of you',
            r'^What the trip is \(confirmed.*': 'What the trip is',
            r'^Chicano Park, San Diego.*': 'Chicano Park, San Diego'}
RETEXT = {'Where you will be': "**Midtown** (the bunkhouse, Crosstown, Manna House) and **downtown and South Main** (the National Civil Rights Museum, Beale Street, the bike route). Possibly Soulsville (the Four Way)."}
DROP_ITEM = [r'^\*\*Other sections:\*\*']
CUT_FROM = [r'\*\*What is \*not\* in this packet.*$']
# sources the converter cut short at an abbreviation: (trip, barrier, number card, cut text, full text taken from the same trip's lab)
SRC_AT = [('memphis', 6, 1, 'Tenn.', 'Tenn. Code § 50-2-112'), ('memphis', 10, 1, 'Tenn.', 'Tenn. Code § 45-17-112 (2010 text)')]

# ---------- 2. builder notes: a sentence or parenthetical that matches is dropped ----------
PROC = re.compile('|'.join([
 r'this session', r'\bnot (yet )?(re-?)?(checked|fetched|opened|reopened|read|verified)\b', r'\bunverified\b', r'\bunconfirmed\b',
 r'\bconfirm\b', r'before (publishing|saying so|teaching it|writing|the site)', r'\b(the|this) site (does not|uses|needs)\b',
 r'for the site\b', r'\bneeds? an? D-', r'\bnew key\b', r'mirror key', r'mirror agent', r'\bflag for\b', r'Propose a D-',
 r'(?-i:Do not (tell students|publish))', r'Treat as history', r'Standard (history|reference|dates)', r'(?:^|[;.] )cite (the|NCRM|Tennessee|it)\b',
 r'Say so if used', r'Not needed for', r'\bpackets?\b', r'\bCanvas\b', r'teacher pages?', r'course (map )?pages?', r'second test',
 r'\bcheck (the (statute|Census|COG)|it against)', r'\bRe-?check\b', r'exact date not', r'not reachable', r'site not stated',
 r'widely cited', r'listing page read', r'label it as ours', r'Not in the mirror', r'No mirror key', r'[Vv]intage to confirm',
 r'purpose unconfirmed', r'Not recent\b(?=\.? *$)']), re.I)

DK = r'\**D-[A-Z]{3,}\**'
DKS = DK + r'(?:\s*(?:,|and|/|;|, and)\s*' + DK + r')*'
XREF = [
 (re.compile(r"\*?\((?:the )?mirror'?s arithmetic[^()]*\)\*?"), '(our arithmetic)'),
 (re.compile(r'What the mirror does cover is '), 'Consider '),
 (re.compile(r'The nearest key is\s*' + DK + r'\s*[:.]\s*'), ''),
 (re.compile(r'\(\s*(?:Figure |figure )?(?:See |see |via |from )?(?:the )?Denver mirror\s+' + DKS + r'\s*(?:✅|⚠️?)?\s*[./]*\s*(?:✅|⚠️?)?\s*\)'), ''),
 (re.compile(r',?\s*(?:See |see |via |from |in )(?:the )?Denver mirror\s+' + DKS + r'(?:\s*\([^()]*\))?\s*(?:✅|⚠️?)?\s*[/]*\s*(?:✅|⚠️?)?\s*[:.]?'), ''),
 (re.compile(r'(?:— )?Denver mirror\s+' + DKS + r'\s*(?:✅|⚠️?)?\s*[:.]?'), ''),
 (re.compile(r'\(\s*(?:See |see )?' + DKS + r'\s*(?:✅|⚠️?)?\s*\.?\s*\)\.?'), ''),
 (re.compile(r'(?:See|see)\s+' + DKS + r'[^.()]*\.'), ''),
 (re.compile(r'→\s*' + DK + r'(?:\s*/\s*2[a-z])?'), ''),
 (re.compile(DK + r'\s*:\s*'), ''),
 (re.compile(r',?\s*' + DKS), ''),
 (re.compile(r'\s*\(?\bSee 2[a-z]\b\.?\)?'), ''),
 (re.compile(r'\s*\(2[a-z]\)'), ''),
]
ABBR = ['U.S.', 'Dr.', 'St.', 'Fr.', 'Sr.', 'Mr.', 'Ms.', 'Rep.', 'Sen.', 'e.g.', 'i.e.', 'vs.', 'No.', 'Art.', 'arts.', 'approx.', 'D.C.', 'Jr.', 'Inc.', 'Co.', 'p.', 'pp.', 'et al.', 'v.']
SPLIT = re.compile(r'(?<=[.!?])(?:\*{0,2})\s+(?=[A-Z*(⚠✅“"¿¡\d—])')

def src_fix(s):
    m = re.match(r'^([\w ]+?) packet(?:, (Barriers? [\d, and]+|2c))?(?: \(checked absence\))?$', s)
    if m:
        w = m.group(2)
        return ('This trip’s Barriers page, ' + w) if w and w != '2c' else ('This trip’s “What catches you” page' if w else 'This trip’s Sources page')
    s = re.sub(r'\s*\((?:cited in |from )?(?:[\w ]+ )?[Pp]acket[^()]*\)', '', s)
    s = re.sub(r'\s+via [\w ]+? packet', '', s)
    s = re.sub(r'\s*\(re-?check[^()]*\)', '', s)
    return s

def tidy(s, was_upper):
    s = re.sub(r'\(\s*\)', '', s)
    s = re.sub(r'\*\s*\*', '', s) if re.search(r'\*\(\s*\)\*', s) else s
    s = re.sub(r'[ \t]{2,}', ' ', s)
    s = re.sub(r'\s+([.,;:])', r'\1', s)
    s = re.sub(r'([.;:,])\s*\.', r'\1', s)
    s = re.sub(r'—\s*$', '', s).strip()
    s = re.sub(r'^[:;,.]\s*', '', s)
    s = re.sub(r'\s*[—;,:]\s*$', '.', s) if re.search(r'[—;,:]\s*$', s) else s
    if was_upper and s[:1].islower(): s = s[:1].upper() + s[1:]
    return s

def clean(s, where):
    if not s or s.startswith('http'): return s
    orig = s
    was_upper = s.lstrip('*( ')[:1].isupper()
    # parentheticals that are builder notes
    def par(m):
        if PROC.search(m.group(0)): removed.append(where + (m.group(0),)); return ''
        return m.group(0)
    s = re.sub(r'\*?\([^()]*\)\*?', par, s)
    for rx, to in XREF: s = rx.sub(to, s)
    # sentences that are builder notes
    if PROC.search(s):
        t = s
        for i, a in enumerate(ABBR): t = t.replace(a, a.replace('.', '\x00'))
        parts = SPLIT.split(t); keep = []
        for p in parts:
            if PROC.search(p): removed.append(where + (p.replace('\x00', '.'),))
            else: keep.append(p)
        s = ' '.join(keep).replace('\x00', '.')
    s = re.sub(r'(✅|⚠️?)\s*vintage\b\.?', r'\1', s)
    s = re.sub(r'\s*\bSee\s*[,.]+(?:\s*\([^()]*\))?\.?', '', s)          # 'See.' left where a key was already stripped
    s = re.sub(r'\s+vintage\.', '', s)
    s = re.sub(r'(?<=\S)  +', ' ', s)
    if re.fullmatch(r'[\s:;.,⚠️✅—-]+', s): s = ''
    return tidy(s, was_upper) if s != orig else s

def walk(o, fid, path=''):
    if isinstance(o, dict):
        for k in list(o.keys()):
            v = o[k]
            if isinstance(v, str):
                if k in ('url', 'id', 'key', 'kind', 'level', 'mark', 'status', 'asOf'): continue
                o[k] = src_fix(v) if k == 'src' else v
                o[k] = clean(o[k], (fid, path + '.' + k))
            else: walk(v, fid, path + '.' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            if isinstance(v, str):
                if re.fullmatch(r'D-[A-Z]+', v): continue          # denverKeys stay
                o[i] = clean(v, (fid, path + '[%d]' % i))
            else: walk(v, fid, path + '[%d]' % i)

def manual(o, fid):
    def sub(s):
        for f, a, b in MANUAL:
            if f == fid and a in s: s = s.replace(a, b); manual_hits.add((f, a))
        for rx in CUT_FROM: s = re.sub(rx, '', s, flags=re.S).rstrip()
        return s
    def rec(x):
        if isinstance(x, dict):
            for k, v in x.items():
                if isinstance(v, str): x[k] = sub(v)
                else: rec(v)
        elif isinstance(x, list):
            for i, v in enumerate(x):
                if isinstance(v, str): x[i] = sub(v)
                else: rec(v)
    rec(o)
    if isinstance(o.get('place'), list):
        out = []
        for b in o['place']:
            if any(re.search(rx, b['h']) for rx in DROP_BLOCK_H): continue
            for rx, to in RENAME_H.items():
                if re.search(rx, b['h']): b['h'] = to
            if b['h'] in RETEXT: b['text'] = RETEXT[b['h']]
            b['items'] = [i for i in b['items'] if not any(re.search(rx, i) for rx in DROP_ITEM)]
            out.append(b)
        o['place'] = out

def run():
    n = 0
    for f in sorted(glob.glob('trips/*.js')):
        raw = open(f, encoding='utf-8').read()
        m = re.match(r'^(.*?=\s*)(\{.*\})\s*;?\s*$', raw, re.S)
        head, body = m.group(1), m.group(2)
        # the header's last '=' must be the assignment: find it by parsing from the first '{' after it
        i = raw.index('window.TRIPS[') if 'window.TRIPS[' in raw else raw.index('window.DMIRROR')
        j = raw.index('=', i) + 1
        head, body = raw[:j], raw[j:].strip().rstrip(';')
        data = json.loads(body); fid = f[6:-3]
        manual(data, fid); walk(data, fid)
        for tr, bi, ni, old, full in SRC_AT:
            if tr == fid and data['barriers'][bi - 1]['numbers'][ni]['src'] == old: data['barriers'][bi - 1]['numbers'][ni]['src'] = full
        new = head + json.dumps(data, indent=1, ensure_ascii=False) + ';\n'
        if new != raw: open(f, 'w', encoding='utf-8').write(new); n += 1
    for f in sorted(glob.glob('labs/*.json')):
        raw = open(f, encoding='utf-8').read(); data = json.loads(raw); fid = f[5:-5]
        manual(data, fid); walk(data, fid)
        new = json.dumps(data, indent=1, ensure_ascii=False) + '\n'
        if json.loads(new) != json.loads(raw): open(f, 'w', encoding='utf-8').write(new); n += 1
    print(f'clean-public: {n} file(s) changed, {len(removed)} builder note(s) removed, {len(manual_hits)} hand rewrite(s) applied')
    if REPORT:
        for fid, path, text in removed: print(f'  {fid}{path}: {text[:150]}')

if __name__ == '__main__': run()
