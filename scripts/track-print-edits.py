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
from docx_track import apply  # noqa: E402

OUT = "docs/launch/2026-11-21-{}-{}.docx"

# (his edited file, output name, edits)
DOCS = [
    ("docs/launch/2026-11-21-preop-letter-with-site.docx", "open-glute-repair-faq", [
        ("please call 713-794-3525", "please call 713-395-6607"),  # direct PreAdmit line (src/lib/site.ts)
        ("you may take the pills every 3-4 hours as needed", "you may take the pills every 6 hours as needed"),
        ("elite level of competition/fitness.", "elite level of competition/fitness. Running and high-impact activities begin at 6 months."),
        ("around shopping centres.", "around shopping centers."),
        ("general anaesthesia", "general anesthesia"),
    ]),
    ("docs/launch/2026-11-21-discharge-instructions-with-site.docx", "open-glute-post-op-instructions", [
        ("sedentary work or school 4-7 days after surgery", "sedentary work or school 1-2 weeks after surgery"),
        ("It is best to wait to start driving until you are evaluated in the office after surgery.",
         "Wait to drive until you can actively lift your leg (around 3 weeks) and have full control of it."),
    ]),
    ("docs/launch/2026-11-21-pt-protocol-open-glute-clean.docx", "open-glute-repair-pt-protocol", [
        ("REHABILIATION", "REHABILITATION"),
        ("Phase III (Weeks 10-15)", "Phase III (Weeks 10-16)"),
        ("Begin return to running program; functional strengthening and agility; return to sport exercises",
         "Functional strengthening from month 4; running, agility and return to sport at 6 months"),
        ("Wait until 3 months before beginning running progression", "Wait until 6 months before beginning running progression"),
        ("Scar massage at portal incisions", "Scar massage at the incision"),
    ]),
]

for src, name, edits in DOCS:
    apply(src, edits, OUT.format(name, "tracked-changes"), OUT.format(name, "clean"), name)
