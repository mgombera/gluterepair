import type { InfoSection } from "./types";

// Home care after surgery (scope 6.6). Sources: discharge sheet, pre-op
// letter, decisions of 10/31/2026. Where the discharge sheet and a decision
// differ, the decision wins: 20 lb for 4 weeks with crutches or a walker (not
// 6 weeks), brace when walking for 6 weeks (not "walking and sitting" for 4),
// desk work after 1 to 2 weeks (not 4 to 7 days), and the driving criteria.

export const HOME_CARE: InfoSection[] = [
  {
    id: "dressing",
    title: "Dressing",
    points: [
      "Keep your surgical dressing on. You may remove the outer bulky dressing 48 hours after surgery.",
      "It is normal for the hip to bleed, swell or bruise after surgery.",
      "Keep the waterproof bandage on until your first post-op visit.",
      "If dressing supplies were sent to you, remove the waterproof dressing and apply the new dressings starting on day 4 after surgery.",
      "Do not put ointments or creams on the incision.",
    ],
    source: ["discharge"],
  },
  {
    id: "bathing",
    title: "Showering",
    points: [
      "Keep the incision clean and dry. The waterproof dressing can stay on when you shower.",
      "You may shower 48 hours after surgery.",
      "Do not soak the operated leg, for example in a bath.",
      "Take the brace off to shower.",
    ],
    source: ["discharge"],
  },
  {
    id: "ice",
    title: "Ice",
    points: [
      "Start icing right after surgery.",
      "Use the ice machine, or ice packs if you did not get a machine, for 30 to 45 minutes every 2 hours until your first post-op visit.",
      "Protect your skin to avoid frostbite.",
      "You do not need to wake up at night to change the ice unless you are uncomfortable.",
    ],
    source: ["discharge", "decisions"],
  },
  {
    id: "brace",
    title: "Brace",
    points: [
      "Wear the brace when walking for 6 weeks (6 to 8 weeks after a Gluteus Maximus Transfer).",
      "It can come off to shower, during exercises and at night.",
    ],
    source: ["decisions", "discharge"],
  },
  {
    id: "activity",
    title: "Activity",
    points: [
      "Raise your leg to chest level whenever possible to decrease swelling.",
      "Walk with crutches or a walker, putting only 20 lb on the operated leg, foot flat, for 4 weeks (at least 6 weeks after a Gluteus Maximus Transfer). Then wean off them as your therapist directs. Some patients need a cane after that.",
      "It is safe to bend the hip within the brace limits. Do not bend the hip past 90 degrees.",
      "Do ankle pumps continuously throughout the day.",
      "Avoid activities that increase hip pain, such as long periods of standing or walking.",
      "Avoid long periods of sitting or long-distance travel for 2 weeks after surgery.",
      "Formal physical therapy usually begins 3 to 5 days after surgery. Your prescription and protocol come with your discharge paperwork.",
    ],
    source: ["discharge", "decisions"],
  },
  {
    id: "avoid-8-weeks",
    title: "Take care with these for up to 8 weeks",
    points: [
      "Prolonged standing, especially on hard surfaces",
      "Prolonged walking, such as around shopping centers",
      "Heavy lifting",
      "Squatting or crouching",
    ],
    source: ["preop-letter"],
  },
  {
    id: "driving",
    title: "Driving",
    points: [
      "Do not drive while taking narcotic pain medication.",
      "You can start driving once you are off narcotic pain medication, can actively lift your leg (around 3 weeks), and have full control of the leg for all driving tasks.",
    ],
    source: ["decisions", "pt-protocol", "discharge"],
  },
  {
    id: "work",
    title: "Returning to work",
    points: [
      "For most office jobs, plan 1 to 2 weeks off. Your hip will be sore: do no lifting, pushing, pulling or carrying.",
      "Recovery is generally complete, and heavy lifting possible, at 4 to 6 months.",
      "There are no fixed rules for return to work; these are guidelines for you and your employer.",
    ],
    source: ["preop-letter", "decisions"],
  },
  {
    id: "follow-up",
    title: "First post-op visit",
    points: [
      "Usually 10 to 14 days after surgery, with our Physician Assistant.",
      "She will check your incision, go over the surgery and your recovery, and answer your questions.",
      "The incision is closed with buried sutures, so no stitches need to be removed.",
      "To reschedule, call (713) 794-3457.",
    ],
    source: ["discharge", "preop-letter"],
  },
  {
    id: "expect",
    title: "What to expect",
    points: [
      "Discomfort and stiffness are normal for a few days. Pain may be felt in the hip, lower back, buttock, knee and ankle.",
      "Pain is often worse on day 1 or 2, when swelling peaks.",
      "Swelling in the groin, buttock and thigh, and bruising on the outer leg, are common. They improve over the following days.",
      "Most people walk relatively pain-free 8 to 10 weeks after surgery.",
      "Running and high impact activity wait until 6 months. Returning to an elite level of fitness can take 6 months or more.",
      "Any unexpected increase in pain can be treated with ice packs and anti-inflammatory medication.",
    ],
    source: ["preop-letter", "discharge", "decisions"],
  },
];

export const MEDICATION_NOTICE =
  "Your prescriptions may differ. Always take your medications as directed on your own prescription labels.";

export const STANDARD_MEDICATIONS: InfoSection = {
  id: "standard-regimen",
  title: "Standard regimen",
  points: [
    "Baby aspirin (81 mg), 1 tablet twice a day for 2 weeks, to lower the risk of a blood clot.",
    "Norco, 1 tablet every 6 hours as needed for pain. Do not take more than 4,000 mg of acetaminophen in 24 hours.",
    "Naprosyn, 1 tablet every 12 hours with food (anti-inflammatory). Tell us if you cannot take it or other NSAIDs. It is OK with aspirin. Do not combine it with other NSAIDs such as ibuprofen, Advil, Aleve or etodolac.",
    "Robaxin, 1 tablet every 12 hours as needed, for the first week. Helps with pain and muscle spasm.",
  ],
  source: ["discharge", "decisions"],
};

export const MEDICATION_TIPS: InfoSection = {
  id: "medication-tips",
  title: "Taking pain medication",
  points: [
    "Your pain medication prescription is given to you on the day of surgery. Texas law requires a written copy, so strong pain medication cannot be called in.",
    "Take pain medication with food to reduce nausea. You do not have to take it if rest, repositioning or ice controls the pain.",
    "Common side effects are nausea, drowsiness and constipation. For constipation, an over-the-counter laxative and plenty of water can help.",
    "If you have problems with nausea and vomiting, contact the office.",
    "Do not drive or operate machinery, and avoid alcohol, while taking narcotic pain medication.",
    "For refills, contact your pharmacy and they will call the office. We cannot refill after 5 p.m. or refill narcotic medication on weekends.",
  ],
  source: ["discharge", "preop-letter"],
};
