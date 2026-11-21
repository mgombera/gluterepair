# Apply Dr. Gombera's wording changes to copies of his three letters
# (docs/source/) as Word tracked changes (author "Claude"), plus a clean copy
# with every change accepted. His originals are never changed. Run by hand
# from the repo root (needs python-docx 1.1.2):
#   python scripts/track-letter-edits.py
# Then run scripts/add-site-to-letters.py, which adds the QR code to the clean
# copies.
#
# Changes he asked for:
#   11/20/2026  protected weight bearing 4 weeks, brace 6 weeks (all three)
#   11/21/2026  outpatient surgery: home the same day, rarely one night
#               (pre-op letter); dressing is not waterproof: bulky dressing
#               off at 2 to 3 days, then waterproof bandages until the first
#               visit (discharge sheet). The dressing-supplies line stays as
#               written, at his request.
#
# Each change is a word-level edit, so Word shows only the words that changed.

import copy
import difflib
import re
import sys

import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

DATE = "2026-11-21"
SRC = "docs/source/2026-10-31-{}.docx"
TRACKED = "docs/launch/" + DATE + "-{}-tracked-changes.docx"
CLEAN = "docs/launch/" + DATE + "-{}-clean.docx"
AUTHOR, WHEN = "Claude", DATE + "T00:00:00Z"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"

EDITS = {
    "preop-letter": [
        ("This typically requires 4 weeks on crutches or a walker.",
         "This requires 4 weeks of protected weight bearing on crutches or a walker."),
        ("a brace for 4 to 6 weeks when walking", "a brace for 6 weeks when walking"),
        ("have the surgery and will typically spend one night in the hospital.",
         "have the surgery and typically go home the same day. On rare occasions, a patient stays one night."),
    ],
    "discharge-instructions": [
        ("remove the outer bulky dressing 48 hours after surgery.",
         "remove the outer bulky dressing 2 to 3 days after surgery."),
        ("Keep the waterproof bandage on until your first postoperative visit.",
         "Then cover the rest of the dressing with waterproof bandages until your first postoperative visit."),
        ("The waterproof dressing may stay on when bathing",
         "Cover the dressing with waterproof bandages when you shower."),
        ("with crutches after surgery for 6 weeks", "with crutches or a walker after surgery for 4 weeks"),
        ("Use the brace when walking and sitting.", "Use the brace when walking."),
        ("when walking for the first 4 weeks after surgery", "when walking for the first 6 weeks after surgery"),
    ],
    "pt-protocol-open-glute": [
        ("Hip brace with ambulation x 4 weeks, 20# weight bearing with foot flat pattern during walking x 6 weeks,",
         "Hip brace with ambulation x 6 weeks, 20# weight bearing with foot flat pattern during walking x 4 weeks, then wean from crutches or walker (some patients need a cane),"),
        ("Wean from crutches, normalize gait pattern, restore", "Normalize gait pattern, restore"),
        ("walking pattern x 6 weeks, then progress to full WB",
         "walking pattern x 4 weeks, then wean from crutches or walker and progress to full WB; some patients need a cane"),
        ("Wear hip brace while ambulating x 4 weeks", "Wear hip brace while ambulating x 6 weeks"),
        ("Hip brace when ambulating for 4 weeks", "Hip brace when ambulating for 6 weeks"),
        ("foot flat gait pattern x 6 weeks, then WBAT", "foot flat gait pattern x 4 weeks, then WBAT"),
        ("Wean from crutches, normalize gait pattern", "Normalize gait pattern"),
    ],
}

_ids = iter(range(9000, 99999))


def runs_of(p):
    return [r for r in p if r.tag == qn("w:r")]


def t_spans(p):
    """(run, t, start, end) for every w:t directly in the paragraph's runs."""
    out, pos = [], 0
    for r in runs_of(p):
        for c in r:
            if c.tag == qn("w:t"):
                n = len(c.text or "")
                out.append((r, c, pos, pos + n))
                pos += n
    return out


def split_run(r, t, k):
    """Split run r inside its child t at character k. Returns the second run."""
    kids = list(r)
    i = kids.index(t)
    second = OxmlElement("w:r")
    rpr = r.find(qn("w:rPr"))
    if rpr is not None:
        second.append(copy.deepcopy(rpr))
    t2 = OxmlElement("w:t")
    t2.text = t.text[k:]
    t2.set(XML_SPACE, "preserve")
    second.append(t2)
    for c in kids[i + 1:]:
        second.append(c)  # moves every later child (tabs, breaks, text)
    t.text = t.text[:k]
    t.set(XML_SPACE, "preserve")
    r.addnext(second)
    return second


def isolate(p, start, end):
    """Split runs so [start, end) is exactly a list of whole runs; return them."""
    for edge in (end, start):
        for r, t, a, b in t_spans(p):
            if a < edge < b:
                split_run(r, t, edge - a)
                break
    span = [s for s in t_spans(p) if s[2] >= start and s[3] <= end and s[3] > s[2]]
    rs = []
    for r, *_ in span:
        if r not in rs:
            rs.append(r)
    for r in rs:
        extra = [c for c in r if c.tag not in (qn("w:rPr"), qn("w:t"))]
        if extra:
            raise SystemExit(f"run inside an edit holds {extra[0].tag}; refusing to drop it")
    return rs


def make_run(rpr, text, deleted=False):
    r = OxmlElement("w:r")
    if rpr is not None:
        r.append(copy.deepcopy(rpr))
    t = OxmlElement("w:delText" if deleted else "w:t")
    t.text = text
    t.set(XML_SPACE, "preserve")
    r.append(t)
    return r


def wrap(kind, run):
    w = OxmlElement(kind)
    w.set(qn("w:id"), str(next(_ids)))
    w.set(qn("w:author"), AUTHOR)
    w.set(qn("w:date"), WHEN)
    w.append(run)
    return w


def track_replace(p, old, new):
    full = "".join(t.text or "" for _, t, _, _ in t_spans(p))
    i = full.find(old)
    rs = isolate(p, i, i + len(old))
    rpr = rs[0].find(qn("w:rPr"))
    a, b = re.findall(r"\S+|\s+", old), re.findall(r"\S+|\s+", new)
    pieces = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            pieces.append(make_run(rpr, "".join(a[i1:i2])))
        if op in ("delete", "replace"):
            pieces.append(wrap("w:del", make_run(rpr, "".join(a[i1:i2]), deleted=True)))
        if op in ("insert", "replace"):
            pieces.append(wrap("w:ins", make_run(rpr, "".join(b[j1:j2]))))
    anchor = rs[0]
    for el in pieces:
        anchor.addprevious(el)
    for r in rs:
        r.getparent().remove(r)


def para_text(p):
    return "".join(t.text or "" for _, t, _, _ in t_spans(p))


def accept_all(body):
    for d in list(body.iter(qn("w:del"))):
        d.getparent().remove(d)
    for ins in list(body.iter(qn("w:ins"))):
        if ins.getparent().tag == qn("w:rPr"):
            ins.getparent().remove(ins)
            continue
        for c in list(ins):
            ins.addprevious(c)
        ins.getparent().remove(ins)


for name, edits in EDITS.items():
    d = docx.Document(SRC.format(name))
    body = d.element.body
    for old, new in edits:
        hits = [p for p in body.iter(qn("w:p")) if old in para_text(p)]
        if len(hits) != 1:
            sys.exit(f"{name}: {old!r} is in {len(hits)} paragraphs, expected 1")
        track_replace(hits[0], old, new)
    d.save(TRACKED.format(name))
    c = docx.Document(TRACKED.format(name))
    accept_all(c.element.body)
    c.save(CLEAN.format(name))
    print(f"{name}: {len(edits)} tracked changes")
