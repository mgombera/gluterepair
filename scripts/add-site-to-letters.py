# Copy Dr. Gombera's three letters (docs/source/) and add the gluterepair.com
# QR code and address. Nothing else in the text changes. Run by hand from the
# repo root (needs python-docx 1.1.2):
#   python scripts/add-site-to-letters.py
#
# Placement, as he asked on 11/19/2026:
#   - Pre-op letter: centered on the title page, under "A Patient's Guide". The
#     hip diagram is shrunk so the title page still fits on one page.
#   - Discharge sheet: at the end of page 2. The original already fills page 2,
#     so the empty spacer lines on page 2 are made shorter (no words change),
#     which also removes the blank third page Word showed.
#   - PT protocol: at the end, after the last line.
#
# Brace and weight bearing, as he asked on 11/20/2026: protected weight bearing
# for 4 weeks and the brace for 6 weeks, matching scope section 11. EDITS lists
# every wording change; nothing else in the text changes.

import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt

SRC = "docs/source/2026-10-31-{}.docx"
OUT = "docs/launch/2026-11-20-{}-with-site.docx"
QR = "docs/launch/2026-11-19-qr-site.png"
TITLE = "Your recovery guide online"
ADDRESS = "gluterepair.com"
HOW = "Scan the code with your phone camera, or type the address."


EDITS = {
    "preop-letter": [
        ("This typically requires 4 weeks on crutches or a walker.", "This requires 4 weeks of protected weight bearing on crutches or a walker."),
        ("a brace for 4 to 6 weeks when walking", "a brace for 6 weeks when walking"),
    ],
    "discharge-instructions": [
        ("with crutches after surgery for 6 weeks", "with crutches or a walker after surgery for 4 weeks"),
        ("Use the brace when walking and sitting.", "Use the brace when walking."),
        ("when walking for the first 4 weeks after surgery", "when walking for the first 6 weeks after surgery"),
    ],
    "pt-protocol-open-glute": [
        ("Hip brace with ambulation x 4 weeks, 20# weight bearing with foot flat pattern during walking x 6 weeks,",
         "Hip brace with ambulation x 6 weeks, 20# weight bearing with foot flat pattern during walking x 4 weeks, then wean from crutches or walker (some patients need a cane),"),
        ("Wean from crutches, normalize gait pattern, restore", "Normalize gait pattern, restore"),
        ("walking pattern x 6 weeks, then progress to full WB", "walking pattern x 4 weeks, then wean from crutches or walker and progress to full WB; some patients need a cane"),
        ("Wear hip brace while ambulating x 4 weeks", "Wear hip brace while ambulating x 6 weeks"),
        ("Hip brace when ambulating for 4 weeks", "Hip brace when ambulating for 6 weeks"),
        ("foot flat gait pattern x 6 weeks, then WBAT", "foot flat gait pattern x 4 weeks, then WBAT"),
        ("Wean from crutches, normalize gait pattern", "Normalize gait pattern"),
    ],
}


def replace_in_runs(p, old, new):
    """Replace text that may span several runs. The new text takes the first
    run's formatting; the rest of the old text is removed from later runs."""
    runs = [r for r in p.iter(qn("w:t"))]
    full = "".join(t.text or "" for t in runs)
    i = full.find(old)
    if i < 0:
        return False
    end, pos, placed = i + len(old), 0, False
    for t in runs:
        s = t.text or ""
        a, b = pos, pos + len(s)
        pos = b
        if b <= i or a >= end:
            continue
        lo, hi = max(i, a) - a, min(end, b) - a
        t.text = s[:lo] + ("" if placed else new) + s[hi:]
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        placed = True
    return True


def apply_edits(d, name):
    for old, new in EDITS[name]:
        hits = [p for p in d.element.body.iter(qn("w:p")) if replace_in_runs(p, old, new)]
        if len(hits) != 1:
            raise SystemExit(f"{name}: {old!r} matched {len(hits)} paragraphs, expected 1")


def text(el):
    return "".join(t.text or "" for t in el.iter(qn("w:t")))


def run(p, s, bold=False, size=10):
    r = p.add_run(s)
    r.bold, r.font.size, r.font.name = bold, Pt(size), "Arial"


def side_by_side(d, qr_in, size=10):
    """A borderless one-row table: the QR code, then the three lines beside it."""
    t = d.add_table(rows=1, cols=2)
    t.autofit = False
    left, right = t.rows[0].cells
    left.width, right.width = Inches(qr_in + 0.15), Inches(3.6)
    left.paragraphs[0].add_run().add_picture(QR, width=Inches(qr_in))
    lines = [(TITLE, True, size + 1), (ADDRESS, True, size), (HOW, False, size)]
    for i, (s, b, z) in enumerate(lines):
        p = right.paragraphs[0] if i == 0 else right.add_paragraph()
        p.paragraph_format.space_after = Pt(1)
        run(p, s, b, z)
    left.paragraphs[0].paragraph_format.space_before = Pt(6)
    right.paragraphs[0].paragraph_format.space_before = Pt(6)
    borders = OxmlElement("w:tblBorders")
    for b in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{b}")
        e.set(qn("w:val"), "nil")
        borders.append(e)
    t._tbl.tblPr.append(borders)
    return t._tbl


def preop():
    d = docx.Document(SRC.format("preop-letter"))
    apply_edits(d, "preop-letter")
    body = list(d.element.body)
    # Shrink the hip diagram (the second picture) to 70 percent.
    pics = [el for el in body if list(el.iter(qn("wp:extent")))]
    diagram = pics[1]
    for tag in ("wp:extent", "a:ext"):
        for e in diagram.iter(qn(tag)):
            if e.get("cx") is None:
                continue
            e.set("cx", str(int(int(e.get("cx")) * 0.7)))
            e.set("cy", str(int(int(e.get("cy")) * 0.7)))
    guide = next(el for el in body if text(el).strip().startswith("A Patient"))
    # Centered stack under the heading: the code, then the three lines.
    new = []
    p = d.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.add_run().add_picture(QR, width=Inches(1.1))
    new.append(p)
    for s, b, z in [(TITLE, True, 12), (ADDRESS, True, 12), (HOW, False, 10)]:
        q = d.add_paragraph()
        q.alignment = WD_ALIGN_PARAGRAPH.CENTER
        q.paragraph_format.space_after = Pt(0)
        run(q, s, b, z)
        new.append(q)
    anchor = guide
    for q in new:
        anchor.addnext(q._p)
        anchor = q._p
    d.save(OUT.format("preop-letter"))


def shrink_blank(p, half_points):
    """Make an empty spacer paragraph shorter by setting its mark's font size."""
    # Elements are placed in the order the Word schema requires.
    pPr = p.get_or_add_pPr()
    sp = pPr.get_or_add_spacing()
    sp.set(qn("w:before"), "0")
    sp.set(qn("w:after"), "0")
    rPr = pPr.find(qn("w:rPr"))
    if rPr is None:
        rPr = OxmlElement("w:rPr")
        later = [pPr.find(qn(t)) for t in ("w:sectPr", "w:pPrChange")]
        later = [e for e in later if e is not None]
        later[0].addprevious(rPr) if later else pPr.append(rPr)
    for tag in ("w:sz", "w:szCs"):
        old = rPr.find(qn(tag))
        if old is not None:
            rPr.remove(old)
    after_sz = ("w:highlight", "w:u", "w:effect", "w:bdr", "w:shd", "w:fitText", "w:vertAlign", "w:rtl", "w:cs", "w:em", "w:lang", "w:eastAsianLayout", "w:specVanish", "w:oMath")
    nxt = next((c for c in rPr if c.tag in {qn(t) for t in after_sz}), None)
    for tag in ("w:sz", "w:szCs"):
        e = OxmlElement(tag)
        e.set(qn("w:val"), str(half_points))
        nxt.addprevious(e) if nxt is not None else rPr.append(e)


def at_end(name, qr_in, tighten_from=None):
    d = docx.Document(SRC.format(name))
    apply_edits(d, name)
    paras = [el for el in d.element.body if el.tag == qn("w:p")]
    last = [el for el in paras if text(el).strip()][-1]
    if tighten_from:
        start = next(i for i, el in enumerate(paras) if text(el).strip().startswith(tighten_from))
        for el in paras[start:]:
            if not text(el).strip() and not list(el.iter(qn("w:drawing"))):
                shrink_blank(el, 8)
        # The empty lines after the last sentence: keep only the final one (Word
        # needs a paragraph after a table) and make it 1 point.
        tail = paras[paras.index(last) + 1 :]
        for el in tail[:-1]:
            if not text(el).strip() and el.find(qn("w:pPr") + "/" + qn("w:sectPr")) is None:
                el.getparent().remove(el)
        if tail:
            shrink_blank(tail[-1], 2)
    last.addnext(side_by_side(d, qr_in))
    d.save(OUT.format(name))


preop()
at_end("discharge-instructions", 0.6, tighten_from="It is best to wait")
at_end("pt-protocol-open-glute", 0.8)
print("Wrote the three letters to docs/launch/")
