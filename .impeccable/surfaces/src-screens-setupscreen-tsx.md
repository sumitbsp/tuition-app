---
version: 1
slug: "src-screens-setupscreen-tsx"
primary_target: "src/screens/SetupScreen.tsx"
related_targets: ["src/App.tsx"]
---

# First-launch setup

Mode: Operate. Shown once, on first launch. The tutor enters name, phone, optional UPI and at least one batch, then lands on Home.

- Audience/job: an Indian private tutor on a phone, finishing setup in about a minute, one-handed.
- Constraints: every input has a visible label; errors are text near the field, linked with aria-describedby; phone uses inputmode="tel"; Get started stays disabled until required fields are valid; empty batch rows are ignored; data is saved locally.
- Must not feel bureaucratic, childish or slow.
- Undecided: reminders themselves (post-v1); Settings screen.

## Direction contract

THESIS: Setup reads like the opening page of the NCERT book the tutor teaches from: a chapter band, then numbered sections. It refuses the generic SaaS signup made of floating rounded fields on white.
OWN-WORLD: White offset-print page, deep NCERT teal (#0F6E7A) as the chapter band and every interactive accent, marigold (#F4B63F) tinted Note boxes, near-black ink. Mukta (an Indian-made sans) at heavy weight for headings and regular for body. Fields are crisp 1.5px teal-grey outlined boxes with small radius, and section numbers are set in teal.
STORY: The tutor sees a short, finite chapter (sections 1.1 to 1.4), trusts that it is quick, fills it in, and taps Get started.
FIRST VIEWPORT: A full-width teal band with the welcome heading and a supporting line. Below it, 1.1 Your name and 1.2 Phone are visible immediately. The Get started button is pinned to the bottom at thumb height, with a line under it saying what is still missing.
FORM: NCERT textbook interior, my top-ranked candidate (#1 of 7, picked by the user over the roll). seed:623c9fbfc2119ac5
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
Signature interaction: adding a batch unrolls a new numbered row in place, focused and ready to type; removing one rolls it shut.
