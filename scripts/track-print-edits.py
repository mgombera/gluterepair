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
from docx_track import apply, tighten  # noqa: E402

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
         "It may be removed when bathing, exercising, sitting, and sleeping. "+"After a Gluteus Maximus Transfer: at least 6 weeks of protected weight bearing and the brace for 6 to 8 weeks."),
        ("7401 S. Main Street", "7401 Main Street", "every"),
    ]),
    ("docs/launch/2026-11-21-discharge-instructions-with-site.docx", "open-glute-post-op-instructions", [
        ("sedentary work or school 4-7 days after surgery", "sedentary work or school 1-2 weeks after surgery"),
        ("It is best to wait to start driving until you are evaluated in the office after surgery.",
         "Wait to drive until you can actively lift your leg (around 3 weeks) and have full control of it."),
        # 11/21/2026 second pass, his answers
        ("with crutches or a walker after surgery for 4 weeks",
         "with crutches or a walker after surgery for 4 weeks. "+"After a Gluteus Maximus Transfer: at least 6 weeks of protected weight bearing and the brace for 6 to 8 weeks."),
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
    ("docs/launch/2026-11-21-pt-protocol-open-glute-clean.docx", "open-glute-repair-pt-protocol", [
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

# Layout only: the added transfer line runs each letter over by a few lines, so
# empty spacer lines are made shorter (no words, fonts or margins change) to
# keep his page counts: FAQ 5 pages, post-op sheet 2 (QR code at the end).
TIGHTEN = {"open-glute-repair-faq": ("After Hip Surgery", 12), "open-glute-post-op-instructions": ("DRESSING", 2)}

for src, name, edits in DOCS:
    apply(src, edits, OUT.format(name, "tracked-changes"), OUT.format(name, "clean"), name)
    if name in TIGHTEN:
        for kind in ("tracked-changes", "clean"):
            tighten(OUT.format(name, kind), *TIGHTEN[name])
