import type { FaqItem, InfoSection } from "./types";

// Diagnosis, anatomy and FAQ. Sources: pre-op letter, discharge sheet,
// decisions of 10/31/2026, and fixmyhips logistics. The pre-op letter does
// not describe the Gluteus Maximus Transfer, so its text is derived and
// needs Dr. Gombera's wording.

export const DIAGNOSIS: InfoSection[] = [
  {
    id: "muscles",
    title: "The gluteus medius and minimus",
    points: [
      "Muscles on the outside of the hip that move the leg out to the side (abduction).",
      "They help you stand upright and walk without a limp.",
    ],
    source: ["preop-letter"],
  },
  {
    id: "tear",
    title: "Gluteus medius and minimus tears",
    points: [
      "Sometimes called the rotator cuff tear of the hip.",
      'The tendon tears away from where it attaches to the greater trochanter, often called the "lateral hip bone."',
      "A tear can cause lasting pain that feels like trochanteric bursitis. It can also cause weakness and limping.",
      "A tear should be suspected when physical therapy and injections into the trochanteric bursa do not give lasting relief.",
    ],
    source: ["preop-letter"],
  },
  {
    id: "repair",
    title: "Open Gluteus Tendon Repair",
    points: [
      "In many cases the torn tendon can be sewn back to the bone using tiny suture anchors.",
      "This surgery has a high success rate in treating pain, and may restore strength to the gluteus muscle.",
    ],
    source: ["preop-letter"],
  },
  {
    id: "max-transfer",
    title: "Gluteus Maximus Transfer",
    points: [
      "Used when the gluteus medius and minimus tendons cannot be repaired back to the bone. Part of the gluteus maximus is moved over to do their job.",
      "Recovery follows the same protocol, with longer protection: 20 lb weight bearing for at least 6 weeks and the brace for 6 to 8 weeks.",
    ],
    source: ["decisions"],
    derived: true,
  },
  {
    id: "why-surgery",
    title: "Why surgery, and the alternatives",
    points: [
      "Surgery is recommended for persistent pain that interferes with daily life, work or sport.",
      "Alternatives range from no treatment to physical therapy, medication or injections. These can be arranged if you prefer.",
    ],
    source: ["preop-letter"],
  },
];

// Anatomy model text (scope 6.7). Descriptions the pre-op letter does not
// give are marked derived for Dr. Gombera's review.
export const ANATOMY: InfoSection[] = [
  {
    id: "greater-trochanter",
    title: "Greater trochanter",
    points: ['The bump of bone on the outside of the hip, often called the "lateral hip bone." The gluteus tendons attach here.'],
    source: ["preop-letter"],
  },
  {
    id: "gluteus-medius",
    title: "Gluteus medius",
    points: ["A muscle on the outside of the hip that moves the leg out to the side and helps you walk without a limp. Its tendon can tear away from the bone."],
    source: ["preop-letter"],
  },
  {
    id: "gluteus-minimus",
    title: "Gluteus minimus",
    points: ["A smaller muscle under the gluteus medius. It works with the gluteus medius and can tear with it."],
    source: ["preop-letter"],
    derived: true,
  },
  {
    id: "footprint",
    title: "Footprint",
    points: ["The area of bone where the tendons attach. In a tear, the tendon pulls away and leaves the bone bare. The repair holds the tendon back down on it so it can heal."],
    source: ["preop-letter"],
    derived: true,
  },
  {
    id: "bursa",
    title: "Trochanteric bursa",
    points: ["A small cushion over the greater trochanter. It can become irritated. If it is irritated, it is removed during surgery."],
    source: ["preop-letter"],
    derived: true,
  },
  {
    id: "it-band",
    title: "IT band",
    points: ["A thick band of tissue on the outside of the thigh. A small window (fasciotomy) is made in it during surgery to reach the tendon."],
    source: ["preop-letter"],
    derived: true,
  },
  {
    id: "anchors",
    title: "Anchors and sutures",
    points: [
      "Small anchors in the bone hold sutures that sew the tendon back down.",
      "Two anchors sit higher up (the inner row) and one or two lower down (the outer row). The sutures cross between them and press the tendon flat onto the bone.",
    ],
    source: ["preop-letter", "decisions"],
  },
];

export const FAQ: FaqItem[] = [
  {
    id: "length",
    group: "before",
    q: "How long does the surgery take?",
    a: "Usually 40 to 80 minutes, sometimes more.",
    source: ["preop-letter"],
  },
  {
    id: "stay",
    group: "before",
    q: "Will I stay in the hospital?",
    a: "Yes. You come in the morning, have surgery, and typically spend one night in the hospital.",
    source: ["preop-letter"],
  },
  {
    id: "anesthesia",
    group: "before",
    q: "Will I be asleep?",
    a: "Yes. The surgery is almost always done under general anesthesia, sometimes with an additional regional anesthetic block. You will meet the anesthesia team at PreAdmit and again on the day of surgery.",
    source: ["preop-letter"],
  },
  {
    id: "eat",
    group: "before",
    q: "Can I eat or drink before surgery?",
    a: "Nothing to eat or drink after midnight. PreAdmit will tell you which medications to stop, especially GLP-1 medications and blood thinners.",
    source: ["fixmyhips", "decisions"],
  },
  {
    id: "brace-crutches-get",
    group: "before",
    q: "When do I get crutches and a brace?",
    a: "Usually on the day of surgery. If insurance does not cover the brace, we will discuss alternatives with you.",
    source: ["fixmyhips", "decisions"],
  },
  {
    id: "shower",
    group: "after",
    q: "When can I shower?",
    a: "48 hours after surgery. The waterproof dressing can stay on in the shower. Take the brace off to shower. No baths or soaking.",
    source: ["discharge"],
  },
  {
    id: "dressings-mail",
    group: "after",
    q: "What if I was sent dressing supplies?",
    a: "Remove the waterproof dressing and apply the new dressings starting on day 4 after surgery. Otherwise, keep the waterproof bandage on until your first post-op visit.",
    source: ["discharge"],
  },
  {
    id: "crutches",
    group: "after",
    q: "How long will I need crutches or a walker?",
    a: "4 weeks, putting only 20 lb on the operated leg with your foot flat. After a Gluteus Maximus Transfer, at least 6 weeks. Then you wean off them; some patients need a cane after that.",
    source: ["decisions"],
  },
  {
    id: "brace",
    group: "after",
    q: "How long will I wear the brace?",
    a: "When walking, for 6 weeks (6 to 8 weeks after a Gluteus Maximus Transfer). It can come off to shower, during exercises and at night.",
    source: ["decisions", "discharge"],
  },
  {
    id: "sitting",
    group: "after",
    q: "How far can I bend my hip?",
    a: "Do not bend the hip past 90 degrees, for example in a low chair. Avoid long periods of sitting for 2 weeks after surgery.",
    source: ["discharge", "decisions"],
  },
  {
    id: "pt",
    group: "after",
    q: "Will I need physical therapy?",
    a: "Yes. Formal physical therapy usually begins 3 to 5 days after surgery. The protocol runs in four phases over about 6 months, and your home exercise program continues through 1 year.",
    source: ["discharge", "pt-protocol"],
  },
  {
    id: "work",
    group: "after",
    q: "When can I go back to work?",
    a: "For most office jobs, after 1 to 2 weeks, with no lifting, pushing, pulling or carrying. Heavy lifting usually takes 4 to 6 months.",
    source: ["preop-letter", "decisions"],
  },
  {
    id: "drive",
    group: "after",
    q: "When can I drive?",
    a: "Once you are off narcotic pain medication, can actively lift your leg (around 3 weeks), and have full control of the leg for all driving tasks.",
    source: ["decisions", "pt-protocol"],
  },
  {
    id: "walking",
    group: "after",
    q: "When will walking stop hurting?",
    a: "In most cases, you should be walking relatively pain-free 8 to 10 weeks after surgery.",
    source: ["preop-letter"],
  },
  {
    id: "running",
    group: "after",
    q: "When can I run or play sports?",
    a: "Running and high impact activity wait until 6 months. Returning to an elite level of fitness can take 6 months or more, and your therapist guides your return.",
    source: ["decisions", "preop-letter"],
  },
  {
    id: "first-visit",
    group: "after",
    q: "When is my first visit after surgery?",
    a: "Usually 10 to 14 days after surgery, with our Physician Assistant. No stitches need removing because the sutures are buried under the skin.",
    source: ["discharge", "preop-letter"],
  },
];
