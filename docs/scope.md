# gluterepair.com Build Scope

10/31/2026 · Mufaddal Gombera, MD · Approved 10/31/2026

Exported from the "gluterepair.com Build Scope" doc. If the two ever differ, ask Dr. Gombera which is current.

Build gluterepair.com as a sibling of fixmyhips.com: a personal companion that tells each scheduled open glute repair patient what to do today, from booking through one year after surgery. Same code and rules as fixmyhips; new clinical content, a new 3D model, and a light, larger design for patients aged 50 to 70.

## 1. Purpose and audience

The site serves patients already scheduled for an open gluteus tendon repair or a gluteus maximus transfer with Dr. Gombera, from the day surgery is booked through the one-year home program.

**Core promise:** open the site, see what applies to you today.

**Primary users**

- Scheduled patients on their phones, often in pain or on medication: large type, one-thumb use, no login. Most are 50 to 70 years old, not athletes, so the design is calmer, lighter and larger than fixmyhips.
- Family and caregivers helping with the pre-op checklist and the 4 to 6 weeks on crutches.
- Physical therapists checking the protocol a patient was given.

**Who the site is for** (footer only, not the home page): "This site is for patients who are scheduled for gluteus tendon surgery with Dr. Gombera. To learn more or to be evaluated, request a consultation at gomberamd.com." The gomberamd.com mention links to its appointment page. Search engines may index the site.

**Out of scope for launch:** marketing to prospective patients, appointment booking, reminders, accounts, Spanish.

## 2. Brand and visual system

Option A, approved 10/31/2026: a warm light page with gomberamd.com navy and a deep teal accent. Most patients are 50 to 70, not athletes, so the site is light by default, calmer and larger than fixmyhips. Orange stays reserved for the call-now list and mandatory deadlines.

| Token | Light theme (default) | Dark theme (switch) | Use |
| --- | --- | --- | --- |
| bg | #F7F5F0 | #10152A | Page background (warm cream) |
| surface | #FFFFFF | #19213D | Cards, tiles |
| border | #E2DED5 | #2A3458 | Card borders, dividers |
| brand | #313E6B | #313E6B | Header band, big numbers, headings, print headers |
| accent | #0F766E | #3DD6C4 | Progress bars, links, primary buttons, focus ring |
| accent-ink | #FFFFFF | #0B1020 | Text on accent buttons |
| alert | #B54708 | #FF9B57 | Red flags and mandatory deadlines only |
| alert-surface | #FCEFE6 (text #8A3A06) | #2A1A10 | Red-flag tiles |
| text | #1F2937 | #E8ECF1 | Body text |
| muted | #4B5563 | #A3ADC2 | Secondary text, 4.5:1 minimum |

Contrast is checked in the build (axe, both themes).

**Type, sized for 50 to 70 year olds:** Inter throughout, self-hosted. Body 18px on phones (fixmyhips uses 17px), line height 1.6. Headings and big numbers in Inter 700, regular width; no condensed fonts. Labels in plain words ("Weight bearing", "Coming up").

**Logo and photos:** the gomberamd.com logo (copied at build). Reuse the fixmyhips headshot, operating room and Texas Orthopedic Hospital photos.

**Accessibility:** WCAG 2.2 AA, 48px touch targets for this audience (44px minimum), real buttons and links, color never the only signal, reduced motion respected, no autoplay video.

The approved screens are in `docs/design/` (see its README).

## 3. Site map

Same route structure as fixmyhips, with /hip renamed /anatomy. The top bar always shows the gomberamd.com logo, the title "Gluteus Tendon Repair", a Home button, a Call button and a Before / After switch. The site is educational: it does not run an exercise program (11/01/2026). When to call lives only under After surgery, as its last tab; there is no red-flag link in the header or footer (11/01/2026).

After surgery tabs, in order: Dashboard, Home Care, Timeline, Home Program, When to Call.

| Route | Page | What it holds |
| --- | --- | --- |
| / | Home | Surgery date (or "not scheduled yet") and procedure; returning visitors land on their dashboard |
| /start?p= | QR preset | Preselects the procedure only (standard or max-transfer), never a date |
| /before | Before Surgery | Countdown, readiness bar, PreAdmit alert, checklist (Now, 1 week before, Night before) |
| /before/surgery-day | Surgery Day | Arrival call, Operative Permit ("Hip Gluteus Repair"), general anesthesia with possible nerve block, surgery 40 to 80 minutes, one night in the hospital |
| /before/diagnosis | Your Diagnosis | Gluteus medius and minimus tears ("rotator cuff of the hip"), why surgery, alternatives, 85 to 90% success, full risk list |
| /before/add-ons | Add-ons | Biologic options, "Call for pricing" |
| /after | Recovery Dashboard | Day count, phase and week, status tiles, coming-up unlocks, one home program line |
| /after/timeline | Recovery Timeline | All phases for the selected protocol, goals and criteria to move on, no exercise links |
| /after/care | Home Care | Dressing, shower, ice, brace, activity, driving, return to work, standard medications |
| /after/home-program | Home Program | Optional myHealthTrack app: pathway names, tiers, practice link and QR code |
| /after/when-to-call | When to Call | Call now, call the office, usually normal; tap-to-call numbers |
| /anatomy | Your Hip Tendons | 3D model: torn tendon before, double-row repair after |
| /videos | Videos | Dr. Gombera's own videos only (none yet) |
| /faq | FAQ | Searchable, grouped Before and After |
| /about | About Dr. Gombera | Headshot, credentials, link to gomberamd.com |
| /contact | Contact | Office (713) 794-3457, after hours (713) 799-2300, PreAdmit (713) 395-6607, info@gomberamd.com, Athena portal, 7401 Main Street, Houston, TX 77030 |
| /privacy | Privacy | What the site stores and where |
| /print | Print Center | Four sheets per variant |
| /proof | Content proof | Internal: every instruction by source document (not linked) |
| /walkthrough | Checkpoints | Internal until launch, then removed |

Not on the site (11/01/2026): exercise library, weekly exercise ticks, phase exercise links, YouTube exercise videos. Old paths redirect: /after/exercises to /after/timeline, /red-flags to /after/when-to-call.

## 4. Personalization

Two inputs drive the site: surgery date and procedure. Both stay in the browser (localStorage profile `{v, surgeryDate, procedure, checklist}`).

**Procedure picker**

1. Open Gluteus Tendon Repair (standard, default), with or without bursectomy
2. Gluteus Maximus Transfer (variant)
3. "My protocol is different": shows the standard protocol with a banner to follow the paper protocol they were given

Every protocol view: "This is the standard protocol. If you were given a different protocol, follow that one instead."

**What each variant changes**

| Parameter | Open Gluteus Tendon Repair | Gluteus Maximus Transfer |
| --- | --- | --- |
| Protected weight bearing | 4 weeks, 20 lb foot flat, crutches and/or walker | 6 weeks minimum, 20 lb foot flat |
| After protected weight bearing | Wean crutches and/or walker at week 4; some patients need a cane | Weight bearing as tolerated after 6 weeks, with a cane in transition |
| Brace when walking | 6 weeks | 6 to 8 weeks |
| Hip flexion | No sitting with the hip bent past 90° | Same |
| Exact range-of-motion angles | Left to the therapist; not shown to patients | Same |
| Prone lying 2 to 3 hours a day | Yes | Same |
| Phase I | Weeks 1 to 6 | Same |
| Phase II | Weeks 7 to 9 | Same |
| Phase III | Weeks 10 to 16 | Same |
| Phase IV | Months 4 to 6, using the fixmyhips standard Phase IV exercises | Same |
| Aqua therapy | After week 3, incisions healed | Same |
| Running and high impact | At 6 months | Same |
| Home program | Through 1 year | Same |

Phase weeks stay as written. Phase I carries the note "At week 4, wean from crutches or walker; you may need a cane for a while." The max transfer variant differs only in the rows marked above.

**Date math**

- Day 0 is surgery day; Before mode counts down, After mode counts up. Week = floor(days / 7) + 1. Guard against -0 on surgery day.
- PreAdmit window: surgery minus 30 days to surgery minus 7 days. Alert states: not open, open, urgent (inside 10 days), overdue.
- Night-before items appear on surgery minus 1, with "No arrival-time call by 3 p.m.? Call (713) 794-3457."
- Dates display as MM/DD/YYYY, local time.
- No date set: labeled example dashboards (Before at 12 days out, After at day 18).

**QR presets:** gluterepair.com/start?p=standard and ?p=max-transfer. Procedure only; no date or name ever goes in a URL.

**Clear my information** wipes everything. Blocked storage still works for the session, with a note that the date will not be remembered.

## 5. Content model

All clinical content lives in typed files under `src/content/`, copied from fixmyhips and rewritten for this procedure. Every clinical item names its source; plain-language inferences are marked `derived: true` and show highlighted on the /proof page.

| File | Holds | Main source |
| --- | --- | --- |
| protocols.ts | Standard and max-transfer protocols: weight bearing, brace, phases, the protocol's exercises (for the therapist and the protocol print sheet only), criteria | PT protocol + decisions |
| exercises.ts | One entry per exercise named in the protocol, for the protocol print sheet and /proof; no videos, not shown as a library | PT protocol |
| before.ts | Pre-op checklist with offsets from surgery date; surgery day steps | Pre-op letter + fixmyhips logistics |
| after.ts | Dressing, shower, ice, brace, activity, driving, work, follow-up | Discharge sheet + decisions |
| learn.ts | Diagnosis, surgery, risks, success, FAQ, anatomy part text | Pre-op letter |
| safety.ts | Red flags and phone numbers | Discharge sheet |
| videos.ts | Video registry; nothing renders without `approvedOn` | Dr. Gombera's approvals |
| print.ts | Print sheets and the PDF slot for his corrected PDFs | All |

**Rules the build enforces**

- No sets, reps, doses or timelines that are not in the source documents or decisions.
- A build check fails if a protocol names an exercise missing from exercises.ts, or a clinical item has no source.
- An unapproved video never renders.

## 6. Feature specs

Features 6.1 to 6.5 and 6.7 to 6.10 reuse the fixmyhips components; only content and styling differ.

**6.1 Setup.** Date or "not scheduled yet," then procedure. Personalized dashboard in under 3 taps.

**6.2 Before dashboard.** Countdown, readiness bar, PreAdmit alert, checklist blocks:

- Now: online pre-registration, PreAdmit at (713) 395-6607 (within 30 days, at least 7 days before). No anesthesia-history item; PreAdmit covers it (11/01/2026).
- 1 week before, in this order: driver, 1 to 2 weeks off desk work, ice machine or ice packs, add-on decision, home set up for crutches, then the optional home program item.
- Night before: same fasting rule, medication holds (GLP-1 and blood-thinner callout) and arrival-call rule as fixmyhips; pack for one night.

**6.3 After dashboard.** Day count, phase and week, phase bar sized by real phase length. Tiles: weight bearing (days left on crutches or walker, then cane as needed), brace (days left), hip bending limit (90° when sitting), driving criteria, running and high impact (6 months). One line linking the optional home program. No weekly exercises. Coming up: off crutches, brace off, aqua therapy, elliptical, resisted bike, running; each labeled "estimate; your therapist decides." Snapshot tests at days 1, 18, 30, 45, 70, 100 and 130 for both variants.

**6.4 Timeline.** All phases, current one highlighted, goals and criteria. "Recovery is not a straight line. You move to the next phase when your therapist confirms you meet its criteria."

**6.5 Home program (myHealthTrack, optional; 11/01/2026).** Page /after/home-program:

- Notice that it is optional and the therapist's program takes precedence.
- Choose your pathway, using the app's names exactly: Open Gluteus Tendon Repair, "Hip Arthroscopy w/Gluteus Medius Repair"; Gluteus Maximus Transfer, "Ask our office which pathway to use". A note that the app's weeks may differ from his protocol, so follow the protocol and the therapist.
- Tier cards from the flyer: free education, free resources, premium with "Ask our office about cost and whether it can replace any in-person therapy visits." The flyer's savings claim ($500 to $1,000) and "eliminate in-person PT" are left out unless he approves them.
- Get started: "Open myHealthTrack" button to https://mht.link/fondren2, a navy QR code to the same link, and the office phone.
- Light links: last item of the week-before checklist, one line on the After dashboard, one line on the Timeline.
- Privacy page: signing up happens in the app under its own privacy terms; the site sends nothing.
- Standing question for him: does the app's pathway match the protocol? Until confirmed, the page carries the note above.

**6.6 Home care** (discharge sheet plus decisions):

- Dressing: outer bulky dressing off at 48 hours; waterproof bandage stays on until the first visit; if dressing supplies were sent, change to the new dressings from day 4; no creams.
- Shower from 48 hours, brace off to shower, no baths.
- Ice 30 to 45 minutes every 2 hours until the first visit; no need to wake at night.
- Brace when walking for 6 weeks (6 to 8 weeks for max transfer); off for showering, exercises and sleep.
- Elevate the leg; avoid prolonged standing or walking; avoid long sitting or long-distance travel for 2 weeks.
- Driving: off narcotic pain medication, able to lift the leg actively (around 3 weeks), and full control for all driving tasks.
- Work: 1 to 2 weeks off for most office jobs, no lifting, pushing, pulling or carrying; 4 to 6 months before heavy lifting.
- First visit 10 to 14 days, with the Physician Assistant; buried sutures, nothing to remove. Formal PT starts 3 to 5 days after surgery.
- Medications under "Standard regimen" (baby aspirin 81 mg twice daily for 2 weeks, Norco every 6 hours as needed, Naprosyn with food, Robaxin for the first week), with the prescriptions-may-differ notice above it.

**6.7 Anatomy model** (gate: Dr. Gombera's approval on a preview link)

- CT-derived bones from the HuBMAP Human Reference Atlas (Visible Human, CC BY 4.0, credited under the model): pelvis, proximal femur and greater trochanter. One meshopt GLB of 3 MB or less, loaded only on /anatomy. The fixmyhips mesh scripts in `docs/3d/scripts/` are the starting point.
- Landmarks derived into landmarks.json: the trochanter's lateral facet (gluteus medius footprint), superoposterior facet, and anterior facet (gluteus minimus footprint).
- Soft tissue fitted to those landmarks: gluteus medius and minimus muscle bellies and tendons, trochanteric bursa, IT band.
- Before: medius and minimus tendons torn off the trochanter and retracted proximally, with the bare footprint visible; inflamed bursa. Sized large enough to see clearly.
- After: bursa removed, IT band window (fasciotomy) shown, transosseous-equivalent double-row repair: 2 proximal (medial row) anchors, 1 to 2 distal (lateral row) anchors, crossing sutures compressing the tendon onto the footprint.
- No separate model for the gluteus maximus transfer; the anatomy page shows the standard repair only.
- Controls: before/after toggle, camera views (side, back, front), "hide IT band" checkbox to see the tendons, a tappable parts list with explanations, text for each stage, 2D fallback without WebGL. Renders checked in Playwright and sent to Dr. Gombera.

**6.8 Videos, FAQ, When to call, contact, privacy.** As fixmyhips. When to call is a calm After tab of plain cards (call now, call the office, usually normal). "Call now" list from the discharge sheet: painful swelling or numbness, unrelenting pain, fever over 101° or chills, continuous drainage or bleeding, difficulty breathing, excessive nausea or vomiting, calf pain.

**6.9 Add-ons.** Same biologic add-ons page as fixmyhips, "Call for pricing" with tap-to-call.

**6.10 Print center.** Four sheets per variant (before-surgery checklist, PT protocol, home care sheet, when-to-call card), light theme, US letter, 0.5 in margins, logo, address, phones, "Content reviewed by Dr. Gombera." His corrected PDFs replace them through the `pdf` slot.

## 7. Videos and home program

Changed 11/01/2026: the site is educational and does not run an exercise program. The YouTube exercise picks reused from fixmyhips are removed. The Videos page shows only Dr. Gombera's own videos; he has none for gluteus repair yet, so it says they are coming. Exercises belong to the patient's therapist and, when the patient chooses it, the myHealthTrack home program (section 6.5).

Video notice, one sentence, shown once at the top and once under each video: "These videos are only a suggestion and are not formal medical advice."

## 8. Safety and legal

The site collects no patient information, and every clinical statement traces to a document Dr. Gombera approved. He is the sole content approver.

| Notice (exact wording) | Where |
| --- | --- |
| "This is the standard protocol. If you were given a different protocol, follow that one instead." | Dashboard, timeline, protocol print |
| "Your physical therapist has the final say. These are general suggestions from the standard protocol. If your therapist gives you different exercises, limits or timing, follow your therapist's plan. Stop any exercise that causes sharp pain." | Wherever protocol content appears: timeline, home program, protocol print |
| "Your prescriptions may differ. Always take your medications as directed on your own prescription labels." | Above the standard medication regimen |
| "Dates are estimates. You move on when your therapist confirms you meet the phase criteria." | Coming-up unlocks, timeline |
| Video notice (section 7), one sentence | Top of the videos page and under each video |
| "Content reviewed by Dr. Gombera." (no date) | Footer only; no reviewed-by line on pages |

**Privacy**

- No forms, accounts, cookies or third-party trackers. Date, procedure and ticks live only in localStorage; never in a URL.
- Cookieless page-view counts (Vercel Web Analytics): paths only, query strings stripped, no custom events, visible only in Dr. Gombera's Vercel dashboard.
- YouTube loads only on tap, through youtube-nocookie.com.
- Links out to myHealthTrack are allowed; patients sign up in that app under its own terms, never through the site.
- A plain-language /privacy page states all of this.

**Images:** Dr. Gombera has no glute images of his own, so the site uses the 3D model only. No third-party images.

## 9. Tech stack and hosting

A fresh repo (`mgombera/gluterepair`), seeded from a copy of fixmyhips at its current main (commit in `docs/reference-fixmyhips/FIXMYHIPS_COMMIT`), not a fork. Fixes move between the two by hand.

| Layer | Choice |
| --- | --- |
| Framework | Next.js App Router, TypeScript strict, all pages prerendered |
| Styling | Tailwind v4, tokens in globals.css under `@theme inline` |
| 3D | React Three Fiber and drei, one meshopt GLB loaded with `useGLTF(url, false, true)` on /anatomy only |
| Tests | Vitest (date math, protocols), Playwright plus axe in both themes, Lighthouse 90+ on phones |
| Hosting | New Vercel project; preview per pull request, production from main |
| Domain | gluterepair.com (registered at Squarespace): apex A record and www CNAME in Squarespace DNS pointed to Vercel at launch; www redirects to apex |
| Search | Indexed: per-page titles, sitemap.xml, robots.txt, canonical gluterepair.com, MedicalWebPage and Physician markup linking to gomberamd.com |

## 10. Build plan

Eight milestones, each its own branch and pull request with a preview link, then a stop for Dr. Gombera's review. Three gates: nothing passes them without his explicit approval.

1. **Shell.** Strip fixmyhips hip content down to placeholders, option A tokens and Inter type, header and footer, routes (/hip becomes /anatomy), sitemap, robots, metadata for gluterepair.com.
2. **Content.** Both protocols, checklist, home program, home care, medications, FAQ, red flags as typed data with sources; /proof page exported to PDF for him. **Gate 1: clinical sign-off.**
3. **Personalization.** Setup flow, localStorage profile, date math, QR presets, clear-my-information; unit tests at every phase boundary for both variants.
4. **Before mode.** Countdown, readiness bar, PreAdmit alert, checklist; Surgery Day, Your Diagnosis, Add-ons; labeled example at 12 days out.
5. **After mode.** Dashboard, home care, timeline, home program, when to call; labeled example at day 18.
6. **Supporting pages.** 3D glute model (**anatomy gate**: renders sent to him), videos (his own), FAQ search, About, Contact with Athena portal, privacy.
7. **Print and polish.** Print center, light/dark theme switch, axe and keyboard pass, Lighthouse, page-view analytics, hidden /walkthrough with checkpoint states for both variants. **Gate 2: his walkthrough.**
8. **Launch.** Squarespace DNS to Vercel, remove /walkthrough, QR codes per variant (PNG and print PDF), swap in his corrected PDFs, add the site address and QR code to his printed letters.

## 11. Decisions, change list and sources

**Decisions from Dr. Gombera (10/31/2026)**

| Question | Decision |
| --- | --- |
| Domain and repo | gluterepair.com (Squarespace); fresh repo `mgombera/gluterepair` copied from fixmyhips, not a fork |
| Color scheme | Option A: warm light page, navy, deep teal accent; light by default for 50 to 70 year olds |
| Variants | Open Gluteus Tendon Repair (standard) and Gluteus Maximus Transfer |
| Standard weight bearing | 4 weeks protected, 20 lb foot flat; wean crutches and/or walker at week 4; some patients need a cane |
| Standard brace | When walking, 6 weeks |
| Max transfer | Protected weight bearing 6 weeks minimum, 20 lb foot flat; shares the standard pre-op letter and discharge sheet; brace 6 to 8 weeks; cane in transition after 6 weeks when weight bearing as tolerated; otherwise the standard protocol |
| Phase weeks | Unchanged; Phase III weeks 10 to 16; Phase IV from fixmyhips |
| Running and high impact | 6 months |
| Return to desk work | 1 to 2 weeks |
| Driving | PT protocol criteria: off narcotics, active leg lift (around 3 weeks), full limb control |
| Scar massage | "At the incision" |
| Range-of-motion angles | Left to the therapist; patients see only the 90° sitting rule |
| Ice | 30 to 45 minutes every 2 hours until the first visit |
| Norco | Every 6 hours as needed |
| Pre-op logistics | Same as fixmyhips; PreAdmit (713) 395-6607 |
| Add-ons | Call for pricing |
| Images and 3D | None of his own; 3D model of the tear and the transosseous-equivalent double-row repair (2 proximal anchors, 1 to 2 distal); no model for the max transfer |
| Videos | Reuse the fixmyhips picks (replaced 11/01/2026, below) |
| Out of scope | Reminders, Spanish, accounts, booking |

**Decisions from Dr. Gombera (11/01/2026)**

| Question | Decision |
| --- | --- |
| Phase IV split | Correct: strengthening from month 4; running, agility and jumping at 6 months |
| Gluteus Maximus Transfer description | Approved as written |
| Max transfer cane | Correct: after at least 6 weeks, weight bearing as tolerated with a cane during the transition |
| Derived anatomy descriptions (4) | Approved as written |
| Gluteus repair overview video | None yet |
| Exercise program | None: the site is educational only. No exercise library, weekly ticks, exercise links or YouTube exercise videos |
| Home program | myHealthTrack, optional, on an After tab; practice link https://mht.link/fondren2 |
| myHealthTrack pathways | Open Gluteus Tendon Repair: "Hip Arthroscopy w/Gluteus Medius Repair"; Gluteus Maximus Transfer: "Ask our office which pathway to use" |
| Pathway match | Not confirmed; the page notes the app's weeks may differ and to follow the protocol and therapist |
| When to call | Only under After surgery, last tab; footer Red flags link removed; /red-flags redirects |
| Prehab | No gluteus prehab protocol; no prehab page |
| Checklist | Week before: driver, time off, cold therapy, biologics, then the optional home program; anesthesia-history item removed |
| Header | Visible Home button |

**Still open:** does the myHealthTrack pathway match the protocol (weight bearing and brace weeks)? Approve or drop the flyer's savings claim.

**Change list for his printed documents** (so patients never see two answers)

| Document | Current text | Change to |
| --- | --- | --- |
| Pre-op letter | PreAdmit 713-794-3525 | (713) 395-6607 |
| Pre-op letter | "4 weeks on crutches or a walker" | Keep; add "some patients need a cane after that" |
| Pre-op letter | Brace "for 4 to 6 weeks when walking" | 6 weeks when walking |
| Pre-op letter | Pain pills "every 3-4 hours as needed" | Every 6 hours as needed |
| Pre-op letter | "6 months (or more) to return to an elite level" | Add: running and high impact at 6 months |
| Pre-op letter | "Hip Joint Diagram, Front View" heading with no diagram | Remove, or add a diagram |
| Discharge sheet | 20 lb with crutches "for 6 weeks" | 4 weeks, crutches and/or walker |
| Discharge sheet | "Use the brace when walking and sitting" and "for the first 4 weeks" | When walking, for 6 weeks |
| Discharge sheet | Sedentary work "4-7 days after surgery" | 1 to 2 weeks |
| Discharge sheet | Driving "after you are evaluated in the office" | Off narcotics, able to lift the leg actively (around 3 weeks), full control |
| Discharge sheet | NORCO "every 6 hours as needed" | Keep (matches decision) |
| PT protocol | Overview and progression: brace 4 weeks, 20 lb for 6 weeks | Brace 6 weeks, 20 lb for 4 weeks |
| PT protocol | Phase I goals: brace 4 weeks, 20 lb for 6 weeks | Same change |
| PT protocol | Week 7 "Wean from crutches" | Week 4, crutches and/or walker; cane as needed |
| PT protocol | Overview Phase III "Weeks 10-15" | Weeks 10 to 16 |
| PT protocol | "Scar massage at portal incisions" | "Scar massage at the incision" |
| PT protocol | Running "3 months" and Phase IV "Months 4-6" | Running and high impact at 6 months |
| PT protocol | No Phase IV exercises listed | Add the standard Phase IV exercises |
| PT protocol | Title "REHABILIATION" | REHABILITATION |
| New | No max transfer protocol | One-page max transfer addendum: 6 weeks protected at 20 lb, brace 6 to 8 weeks, cane in transition |
| All three | No site address | Add gluterepair.com and the QR code at launch |

**Source documents (supplied 10/31/2026, in `docs/source/`)**

- `2026-10-31-preop-letter.docx`: What to Expect from your Surgery for Hip Gluteus Tendon Repair
- `2026-10-31-discharge-instructions.docx`: Hip Gluteus Tendon Repair (Open), Post-Operative Instruction Checklist
- `2026-10-31-pt-protocol-open-glute.docx`: Postoperative Rehabilitation Protocol, Hip Open Gluteus Tendon Repair with/without Bursectomy
- `2026-11-01-myhealthtrack-flyer.pdf`: myHealthTrack flyer for Dr. Gombera (tiers, pathways, practice link), supplied 11/01/2026.
- Each document has a `.txt` extraction beside it for searching.
- fixmyhips scope and source documents (logistics, Phase IV, shared content) are in `docs/reference-fixmyhips/`.
