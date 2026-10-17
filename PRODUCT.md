# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Private tutors in India who run their own classes: solo home or online tutors first, growing into small coaching centres (an owner plus a few teachers). They are organising their students, batches and class schedules, and do it mostly on a phone between and around classes.

## Product Purpose

Gives a tutor one place to manage who they teach and when: student rosters, batches and timetables. Success means the tutor can stop keeping this in notebooks, WhatsApp groups and spreadsheets.

## Positioning

Undecided. The difference from a spreadsheet or a generic class-management app has not been chosen yet. Future work must not invent a positioning claim.

## Operating Context

- Mobile-first: used one-handed on a phone, often in the minutes before, between or after classes. Desktop use is secondary.
- Indian tutoring context: school boards, subjects and grades, and fees in ₹.
- Interface language: English.

## Capabilities and Constraints

- First-version scope: students and batches. That covers student rosters, grouping students into batches or classes, and batch timetables.
- Out of scope for v1 unless the user adds it: attendance and progress tracking, online payment collection, and discovery or booking. (Fee tracking and reminders were added to v1 on 2026-10-17; see below.)
- First-launch setup collects the tutor's name, mobile number and optional UPI ID, which reminder messages use.
- Each student record stores a required monthly fee in ₹, along with name, optional class, batch, optional guardian name and guardian mobile. The user brought the fee field into v1 on 2026-10-17.
- Monthly fee tracking is in v1 (added 2026-10-17). Each student is paid or pending per month, from the month they were added. Home has a month switcher, a summary (collected, pending, students pending), All/Pending/Paid tabs (Pending is the default; the last tab used is remembered), Mark paid with Undo, and Mark pending to reverse a mistake.
- Batches can be added, renamed and deleted after setup (added 2026-10-17). Names are unique, case-insensitive. A batch with students can only be deleted after moving its students, and the last batch can't be deleted.
- Reminders are in v1 as a WhatsApp `wa.me` link with a pre-filled message, including a `upi://pay` link when the tutor has a UPI ID. The tutor still sends each message by hand; there's no automatic sending.
- Must work for one solo tutor and grow to a small centre with several teachers. Multi-teacher roles are a later need, not a v1 requirement.
- Stack: React 19, TypeScript and Vite, with data saved on the device (localStorage).
- Undecided: product name, a backend or sync, authentication, offline support beyond local data.

## Brand Commitments

None yet. There is no name, logo or voice.

## Evidence on Hand

None. There are no real users, testimonials, screenshots or data yet. Future work must not make up tutor names, student counts, reviews or usage figures and present them as real.

## Product Principles

1. Phone first: every core task must be quick to finish on a phone between classes.
2. Small scale stays simple: a solo tutor with a few batches should never have to set up anything built for an institute.
3. Fits real Indian tuition: batches, boards, subjects and grades are first-class terms, not generic "courses".
4. Replace the notebook: capturing a student or batch must be faster than writing it down.
