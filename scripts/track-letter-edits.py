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

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx_track import apply  # noqa: E402

DATE = "2026-11-21"
SRC = "docs/source/2026-10-31-{}.docx"
TRACKED = "docs/launch/" + DATE + "-{}-tracked-changes.docx"
CLEAN = "docs/launch/" + DATE + "-{}-clean.docx"

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

for name, edits in EDITS.items():
    apply(SRC.format(name), edits, TRACKED.format(name), CLEAN.format(name), name)
