# Fix the remaining conflicts (scope section 11 change list) in the three
# letters Dr. Gombera edited by hand on 11/21/2026 and exported for the print
# center. His edited files are read, never changed; this writes a
# tracked-changes copy (author "Claude") and a clean copy of each. Run by hand
# from the repo root (needs python-docx 1.1.2):
#   python scripts/track-print-edits.py
# Then export each clean copy to PDF in Word, saved in public/print/ under his
# file names (src/content/print.ts).

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx.oxml import OxmlElement  # noqa: E402
from docx.oxml.ns import qn  # noqa: E402
from docx_track import TAB, apply, new_para, tighten  # noqa: E402

OUT = "docs/launch/2026-11-21-{}-{}.docx"

# (his edited file, output name, edits)
DOCS = [
    ("docs/launch/2026-11-21-preop-letter-with-site.docx", "open-glute-repair-faq", [
        ("please call 713-794-3525", "please call 713-395-6607"),  # direct PreAdmit line (src/lib/site.ts)
        ("you may take the pills every 3-4 hours as needed", "you may take the pills every 6 hours as needed"),
        ("elite level of competition/fitness.", "elite level of competition/fitness. Running and high-impact activities begin at 6 months."),
        ("around shopping centres.", "around shopping centers."),
        ("general anaesthesia", "general anesthesia"),
        # 11/21/2026 second pass, his answers: a line for transfer patients
        ("It may be removed when bathing, exercising, sitting, and sleeping.",
         "It may be removed when bathing, exercising, sitting, and sleeping. "+"After a Gluteus Maximus Transfer: at least 6 weeks of protected weight bearing and the brace for 6 to 8 weeks, depending on comfort and function."),
        ("7401 S. Main Street", "7401 Main Street", "every"),
    ]),
    ("docs/launch/2026-11-21-discharge-instructions-with-site.docx", "open-glute-post-op-instructions", [
        ("sedentary work or school 4-7 days after surgery", "sedentary work or school 1-2 weeks after surgery"),
        ("It is best to wait to start driving until you are evaluated in the office after surgery.",
         "Wait to drive until you can actively lift your leg (around 3 weeks) and have full control of it."),
        # 11/21/2026 second pass, his answers
        ("with crutches or a walker after surgery for 4 weeks",
         "with crutches or a walker after surgery for 4 weeks. "+"After a Gluteus Maximus Transfer: at least 6 weeks of protected weight bearing and the brace for 6 to 8 weeks, depending on comfort and function."),
        ("remove the waterproof dressing and apply the new dressings", "remove the remaining dressing and apply the new dressings"),
        ("You may shower 48 hours after surgery.", "You may shower 48 hours after surgery, once the outer bulky dressing is off."),
        # clean-ups: no clinical change
        ("Then cover the rest of the dressing", "After the bulky dressing is off, cover the rest of the dressing"),
        ("The brace can be removed to shower,", "The brace can be removed when sitting, to shower,"),
        ("NORCO 1  TABLETS EVERY", "NORCO 1 TABLET EVERY"),
        ("Etodalac", "Etodolac"),
        ("it is normal to have a low grade following surgery", "it is normal to have a low-grade temperature following surgery"),
        ("7401 S. Main Street", "7401 Main Street", "every"),
    ]),
    ("docs/launch/2026-11-21-pt-protocol-open-glute-clean.docx", "open-glute-repair-pt-protocol", PT_EDITS := [
        ("REHABILIATION", "REHABILITATION"),
        ("Phase III (Weeks 10-15)", "Phase III (Weeks 10-16)"),
        ("Begin return to running program; functional strengthening and agility; return to sport exercises",
         "Functional strengthening from month 4; running, agility and return to sport at 6 months"),
        ("Wait until 3 months before beginning running progression", "Wait until 6 months before beginning running progression"),
        ("Scar massage at portal incisions", "Scar massage at the incision"),
        ("clinical judgement", "clinical judgment"),
        ("7401 S. Main Street", "7401 Main Street", "every"),
    ]),
]


def text_of(p):
    return "".join(t.text or "" for t in p.iter(qn("w:t")))


def find(d, start, offset=0):
    """The paragraph starting with `start` (unique), or the one `offset` after it."""
    ps = [e for e in d.element.body if e.tag == qn("w:p")]
    hits = [i for i, e in enumerate(ps) if text_of(e).startswith(start)]
    if len(hits) != 1:
        sys.exit(f"template {start!r}: {len(hits)} matches")
    return ps[hits[0] + offset]


def runs(p):
    return p.findall(qn("w:r"))


def new_page(p):
    """Start the paragraph on a new page (w:pageBreakBefore, in schema order)."""
    pPr = p.find(qn("w:pPr"))
    first_after = next((c for c in pPr if c.tag not in {qn("w:pStyle"), qn("w:keepNext"), qn("w:keepLines")}), None)
    pbb = OxmlElement("w:pageBreakBefore")
    first_after.addprevious(pbb) if first_after is not None else pPr.append(pbb)
    return p


# Phase IV for the Open Gluteus Tendon Repair (11/21/2026): fixmyhips Phase IV
# with his decisions: months 4-6, running and agilities (single plane and
# multi-directional) at 6 months. Formats are copied from Phase III.
PHASE_IV_GOALS = [
    "No complaints of pain or weakness",
    "Functional strengthening",
    "Safe return to sport or patient's functional activities",
    "Maintenance of strength, endurance, and proprioception",
    "Patient education with regards to any possible limitations",
]


def add_phase_iv(d):
    heading = find(d, "PHASE III:")
    goals_h = find(d, "PHASE III:", 2)
    bullet = find(d, "Prevent compensation due to fatigue")
    blank = find(d, "Progress lower extremity strength and endurance", 1)
    ex_h = find(d, "Progress lower extremity strength and endurance", 2)
    row = find(d, "WEEKS 10-16")
    item = find(d, "Low-weight unilateral leg press")
    item_blank = find(d, "Resisted biking (advance resistance", 1)
    sub = find(d, "30 reps of each plane of motion")
    anchor = find(d, "TRANSITION TO HEP", -1)  # the empty line before it
    hr, gr, br, er, ir, sr = (runs(x)[0] for x in (heading, goals_h, bullet, ex_h, item, sub))
    label_r, tab_r, text_r = runs(row)[0], runs(row)[5], runs(row)[-1]

    def row_para(label, text):
        return new_para(row, [(label_r, label), (tab_r, TAB), (text_r, text)])

    paras = [
        new_page(new_para(heading, [(hr, "PHASE IV: RETURN TO RUNNING AND ACTIVITY (MONTHS 4-6)")])),
        new_para(find(d, "PHASE III:", 1), []),
        new_para(goals_h, [(gr, "GOALS")]),
        *[new_para(bullet, [(br, g)]) for g in PHASE_IV_GOALS],
        new_para(blank, []),
        new_para(ex_h, [(er, "EXERCISES")]),
        new_para(blank, []),
        row_para("MONTHS 4-6", "Continue all appropriate exercises from phase III"),
        *[new_para(item, [(ir, t)]) for t in ("Balance squats with rotations", "Retro walking with resistance band",
                                              "Lunge with trunk rotations (with sport cord or physioball)")],
        new_para(item_blank, []),
        row_para("MONTH 6", "Begin running progression and single plane agilities"),
        *[new_para(sub, [(sr, t)]) for t in ("Quick feet", "Backpedaling", "Side shuffles",
                                             "Double leg plyometrics (i.e. broad jumps, 4-square hops)")],
        new_para(item, [(ir, "Begin advanced/multi-directional agilities")]),
        *[new_para(sub, [(sr, t)]) for t in ("Z and W cuts", "Cariocas", "Transition to single leg plyometrics")],
        new_para(item, [(ir, "Sport specific exercises")]),
        new_para(item_blank, []),
    ]
    for p in paras:
        anchor.addprevious(p)


# Gluteus Maximus Transfer: its own protocol (11/21/2026, he asked for a
# separate protocol rather than an addendum). Built from his open-repair
# protocol with his transfer decisions (scope section 11) written into each
# section: brace 6-8 weeks depending on comfort and disability, 20# weight
# bearing for at least 6 weeks then WBAT with a cane during the transition, no
# Phase IV (after phase III the therapist guides return; no running or high
# impact before 6 months). The same fixes as the open-repair protocol apply.
TRANSFER_EDITS = [
    ("HIP OPEN GLUTEUS TENDON REPAIR with/without BURSECTOMY", "HIP GLUTEUS MAXIMUS TRANSFER"),
    ("REHABILIATION", "REHABILITATION"),
    ("Hip brace with ambulation x 6 weeks, 20# weight bearing with foot flat pattern during walking x 4 weeks, "
     "then wean from crutches or walker (some patients need a cane),",
     "Hip brace with ambulation x 6-8 weeks (depending on comfort and disability), 20# weight bearing with foot "
     "flat pattern during walking for at least 6 weeks,"),
    ("Normalize gait pattern, restore full AROM",
     "Once cleared (after at least 6 weeks), progress to WBAT with a cane during the transition, normalize gait "
     "pattern, restore full AROM"),
    ("Phase III (Weeks 10-15)", "Phase III (Weeks 10-16)"),
    ("Phase IV (Months 4-6):", "After phase III:"),
    ("Begin return to running program; functional strengthening and agility; return to sport exercises",
     "Transition to HEP or further therapy as needed. No running or high-impact activity before 6 months"),
    ("walking pattern x 4 weeks, then wean from crutches or walker and progress to full WB; some patients need a cane",
     "walking pattern for at least 6 weeks, then progress to WBAT, usually with a cane during the transition"),
    ("Wear hip brace while ambulating x 6 weeks", "Wear hip brace while ambulating x 6-8 weeks, depending on comfort and disability"),
    ("Running: Wait until 3 months before beginning running progression",
     "Running: No running or high-impact activity before 6 months"),
    ("clinical judgement", "clinical judgment"),
    ("Hip brace when ambulating for 6 weeks", "Hip brace when ambulating for 6-8 weeks, depending on comfort and disability"),
    ("20lb Weight bearing with foot flat gait pattern x 4 weeks, then WBAT",
     "20lb Weight bearing with foot flat gait pattern for at least 6 weeks, then WBAT with a cane during the transition"),
    ("Scar massage at portal incisions", "Scar massage at the incision"),
    ("7401 S. Main Street", "7401 Main Street", "every"),
]


def transfer_week_7(d):
    """Week 7 row: "Normalize gait pattern" is also a phase II goal, so it is
    edited here, in the WEEK 7 row only."""
    from docx_track import track_replace
    row = find(d, "WEEK 7")
    track_replace(row, "Normalize gait pattern",
                  "Once cleared, WBAT with a cane during the transition; normalize gait pattern")


# Layout only: the added transfer line runs each letter over by a few lines, so
# empty spacer lines are made shorter (no words, fonts or margins change) to
# keep his page counts: FAQ 5 pages, post-op sheet 2 (QR code at the end).
TIGHTEN = {"open-glute-repair-faq": ("After Hip Surgery", 12), "open-glute-post-op-instructions": ("DRESSING", 2),
           # the transfer protocol keeps his 3 pages
           "glute-max-transfer-pt-protocol": ("PHASE I:", 12)}

POST = {"open-glute-repair-pt-protocol": add_phase_iv}
# The transfer: its own protocol, built from his open-repair protocol.
DOCS.append(("docs/launch/2026-11-21-pt-protocol-open-glute-clean.docx", "glute-max-transfer-pt-protocol", TRANSFER_EDITS))
POST["glute-max-transfer-pt-protocol"] = transfer_week_7

for src, name, edits in DOCS:
    apply(src, edits, OUT.format(name, "tracked-changes"), OUT.format(name, "clean"), name, post=POST.get(name))
    if name in TIGHTEN:
        for kind in ("tracked-changes", "clean"):
            tighten(OUT.format(name, kind), *TIGHTEN[name])
