# Word tracked-change helpers shared by scripts/track-letter-edits.py and
# scripts/track-print-edits.py. Edits are word-level, author "Claude".

import copy
import difflib
import re
import sys

import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

AUTHOR = "Claude"
WHEN = "2026-11-21T00:00:00Z"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"

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



def apply(src, edits, tracked_out, clean_out, label, overwrite=False):
    """Copy src, make each (old, new) edit a tracked change, save a tracked and a clean copy.
    Existing outputs are never replaced unless overwrite=True: Dr. Gombera edits
    these files by hand (11/21/2026 he edited the clean and with-site copies)."""
    import os
    for out in (tracked_out, clean_out):
        if os.path.exists(out) and not overwrite:
            sys.exit(f"{label}: {out} exists; not overwriting it (it may hold his edits)")
    d = docx.Document(src)
    body = d.element.body
    for old, new in edits:
        hits = [p for p in body.iter(qn("w:p")) if old in para_text(p)]
        if len(hits) != 1:
            sys.exit(f"{label}: {old!r} is in {len(hits)} paragraphs, expected 1")
        track_replace(hits[0], old, new)
    d.save(tracked_out)
    c = docx.Document(tracked_out)
    accept_all(c.element.body)
    c.save(clean_out)
    print(f"{label}: {len(edits)} tracked changes")
