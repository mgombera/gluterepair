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



def roots(d):
    """The body, then every header and footer part (each part once)."""
    out, seen = [d.element.body], set()
    for rel in d.part.rels.values():
        if rel.reltype.endswith(("/header", "/footer")) and rel.target_part not in seen:
            seen.add(rel.target_part)
            out.append(rel.target_part.element)
    return out


def apply(src, edits, tracked_out, clean_out, label, overwrite=False):
    """Copy src, make each edit a tracked change, save a tracked and a clean copy.
    An edit is (old, new), or (old, new, "every") for text repeated in several
    places, such as a footer used by more than one section. Headers and footers
    are searched too. Existing outputs are never replaced unless overwrite=True:
    Dr. Gombera edits these files by hand (11/21/2026 he edited the clean and
    with-site copies)."""
    import os
    for out in (tracked_out, clean_out):
        if os.path.exists(out) and not overwrite:
            sys.exit(f"{label}: {out} exists; not overwriting it (it may hold his edits)")
    d = docx.Document(src)
    for edit in edits:
        old, new, every = edit[0], edit[1], len(edit) > 2
        hits = [p for r in roots(d) for p in r.iter(qn("w:p")) if old in para_text(p)]
        if not hits or (len(hits) != 1 and not every):
            sys.exit(f"{label}: {old!r} is in {len(hits)} paragraphs, expected {'at least ' if every else ''}1")
        for p in hits:
            track_replace(p, old, new)
    d.save(tracked_out)
    c = docx.Document(tracked_out)
    for r in roots(c):
        accept_all(r)
    c.save(clean_out)
    print(f"{label}: {len(edits)} edits")


def shrink_blank(p, half_points):
    """Make an empty spacer paragraph shorter by setting its mark's font size
    (no words, fonts or margins change). Elements keep the Word schema order."""
    pPr = p.get_or_add_pPr()
    sp = pPr.get_or_add_spacing()
    sp.set(qn("w:before"), "0")
    sp.set(qn("w:after"), "0")
    rPr = pPr.find(qn("w:rPr"))
    if rPr is None:
        rPr = OxmlElement("w:rPr")
        later = [e for e in (pPr.find(qn("w:sectPr")), pPr.find(qn("w:pPrChange"))) if e is not None]
        later[0].addprevious(rPr) if later else pPr.append(rPr)
    for tag in ("w:sz", "w:szCs"):
        old = rPr.find(qn(tag))
        if old is not None:
            rPr.remove(old)
    after_sz = {qn(t) for t in ("w:highlight", "w:u", "w:effect", "w:bdr", "w:shd", "w:fitText", "w:vertAlign",
                                "w:rtl", "w:cs", "w:em", "w:lang", "w:eastAsianLayout", "w:specVanish", "w:oMath")}
    nxt = next((c for c in rPr if c.tag in after_sz), None)
    for tag in ("w:sz", "w:szCs"):
        e = OxmlElement(tag)
        e.set(qn("w:val"), str(half_points))
        nxt.addprevious(e) if nxt is not None else rPr.append(e)


def tighten(path, from_text, half_points):
    """Shorten every empty spacer paragraph from the paragraph starting with
    from_text to the end of the body, in place."""
    d = docx.Document(path)
    paras = [el for el in d.element.body if el.tag == qn("w:p")]
    txt = lambda el: "".join(t.text or "" for t in el.iter(qn("w:t")))
    start = next(i for i, el in enumerate(paras) if txt(el).strip().startswith(from_text))
    n = 0
    for el in paras[start:]:
        if not txt(el).strip() and not list(el.iter(qn("w:drawing"))) and el.find(f"{qn('w:pPr')}/{qn('w:sectPr')}") is None:
            shrink_blank(el, half_points)
            n += 1
    d.save(path)
    return n
