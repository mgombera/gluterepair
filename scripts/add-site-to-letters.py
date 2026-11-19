# Copy one of the source letters and add only a closing block, right after its
# last line: the QR code for gluterepair.com beside two short lines.
# Run by hand (needs python-docx 1.1.2):
#   python add-site-to-letters.py SOURCE.docx docs/launch/2026-11-19-qr-site.png OUT.docx [qr inches] [after line]
import sys, docx
from docx.shared import Pt, Inches
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
src, qr, out = sys.argv[1:4]
size = float(sys.argv[4]) if len(sys.argv) > 4 else 0.8
after = sys.argv[5] if len(sys.argv) > 5 else None  # put the block after this line instead of the last one
d = docx.Document(src)
last = [p for p in d.paragraphs if p.text.strip() and (after is None or p.text.strip().startswith(after))][-1]

t = d.add_table(rows=1, cols=2)
t.autofit = False
qr_cell, text_cell = t.rows[0].cells
qr_cell.width, text_cell.width = Inches(0.95), Inches(2.6)
qp = qr_cell.paragraphs[0]
qp.add_run().add_picture(qr, width=Inches(size))
def line(p, text, bold=False, size=10):
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(text); r.bold = bold; r.font.size = Pt(size); r.font.name = "Arial"
line(text_cell.paragraphs[0], "Your recovery guide online", bold=True, size=11)
line(text_cell.add_paragraph(), "gluterepair.com", bold=True)
line(text_cell.add_paragraph(), "Scan the code with your phone camera, or type the address.")
# Space above the block, no borders.
tblPr = t._tbl.tblPr
borders = OxmlElement("w:tblBorders")
for b in ("top", "left", "bottom", "right", "insideH", "insideV"):
    e = OxmlElement(f"w:{b}"); e.set(qn("w:val"), "nil"); borders.append(e)
tblPr.append(borders)
last._p.addnext(t._tbl)
t.rows[0].cells[0].paragraphs[0].paragraph_format.space_before = Pt(8)
t.rows[0].cells[1].paragraphs[0].paragraph_format.space_before = Pt(8)
# If the last line closes a section (the pre-op letter's two columns), move that
# section break below the block so the block stays in the same columns and page.
sect = last._p.find(qn("w:pPr") + "/" + qn("w:sectPr")) if last._p.pPr is not None else None
if sect is not None:
    holder = OxmlElement("w:p"); pPr = OxmlElement("w:pPr"); holder.append(pPr)
    pPr.append(sect)  # moves it
    t._tbl.addnext(holder)
d.save(out)
