# Decisions

A log of why things are built the way they are. Newest entries go at the top. Each entry records what was chosen, why, the alternatives considered, and what it costs. Entries are never deleted; a reversed decision gets a new entry that links back to the old one.

**Status:** Accepted · Open · Superseded

---

## D-033: The app mark replaces the Setup chapter numeral

**Status:** Accepted · 2026-10-17

- **Chose:** the Setup band shows the new app icon (`public/icons/appIcons/favicon.svg`, an open book with a rupee coin) where the marigold "1" was. `ChapterBand` takes `mark` instead of `numeral`. On first launch the mark sets in place (fade, 8px rise, 0.9 → 1 scale) instead of printing upward. On the chapter turn to Home it lifts out and fades. Home and every other band carry no mark.
- **Why:** the user supplied a real app icon. The "1" only made sense as the old placeholder icon, and a stranger can't read it as a brand.
- **Alternatives:**
  - The mark on Home too, beside the month switcher: tried and dropped. The user found it odd there, and on 360px phones it had to shrink to about 40px to fit next to the switcher.
  - Keeping the "1" and using the icon only for install and favicon: leaves two competing marks.
- **Trade-off:** the icon's slate tile (`#376170`) sits close in tone to the band teal, so it reads through its coin and white pages rather than its edge. The install icons and favicon in `index.html` and the manifest still use the old "1" set until they are switched over.

## D-032: Settings tab, template reminders, and file backups

**Status:** Accepted · 2026-10-17 · Changes the reminder wording from D-027

- **Chose:**
  - A third bottom-nav tab, **Settings**, with five sections. Sections 1–3 save on their own. Data v6 adds `settings` (reminder template, default fee and due day, last export time).
  - **Reminders:** the fee reminder is a template with `{placeholders}`. The UPI link is always appended by code, so a template can't lose it. The default reads "…for {month} is due on {dueDate}." for both due and upcoming fees, replacing D-027's two wordings: one template can't branch.
  - **Backup:** a JSON download and a file restore. Both go through `parseAppData`, the same validating, upgrading parser used at startup, so an old backup upgrades and a wrong file can't replace good data. Restore asks for confirmation after showing what the file holds.
  - **Delete all data** needs DELETE typed. It offers an export first.
  - **Unsaved changes:** `window.confirm` when switching tabs, and `beforeunload` for reload or close.
- **Why:** the user asked for it. All data lives in one browser's storage, so a file backup is the only protection against a lost or reset phone.
- **Alternatives:**
  - One Save button for the whole screen: the user asked for one per section.
  - An in-app dialog instead of `window.confirm`: more code for a rare prompt. The native dialog is accessible and blocks correctly.
  - Merging a restored backup into existing data: ambiguous with duplicate students. Restore replaces everything, and says so.
- **Trade-off:**
  - A backup file holds guardians' names and phone numbers in plain text.
  - `lastExportAt` records that an export was started; the app can't confirm the file was kept.

## D-031: Pick guardian phone from contacts, Android only

**Status:** Accepted · 2026-10-17

- **Chose:** a **Pick from contacts** button under Guardian phone, shown only when `'contacts' in navigator && 'ContactsManager' in window`. It calls `navigator.contacts.select(['name', 'tel'], { multiple: false })` and uses the contact's first number that cleans to a valid 10-digit mobile (`cleanContactPhone`: strips punctuation and a +91, 0091 or 0 prefix, then checks with `validatePhone`). It fills the guardian name only when that field is empty. Manual entry is unchanged, and saved numbers stay bare 10 digits, so `wa.me/91…` links are unaffected.
- **Why:** the user asked for it. Typing a parent's number is slow and error-prone, and the number is already in the tutor's phone.
- **Alternatives:**
  - A visible "not supported" message on iPhone: noise for a feature the tutor can't use. The button is simply hidden.
  - Using only the contact's first number: it's often a landline or an office number. The first valid mobile is used instead.
- **Trade-off:**
  - The API needs a secure context, so the button is hidden on plain-http LAN testing. Use Chrome's USB port forwarding to `localhost`, or HTTPS.
  - The accessible name is "Pick from contacts for the guardian's phone", which keeps the visible text at its start (label in name).

## D-030: Bottom nav, a Students tab, and "left" instead of delete

**Status:** Accepted · 2026-10-17

- **Chose:**
  - **Nav:** a fixed bottom nav with **Fees** and **Students** (`<nav aria-label="Main">`, buttons with `aria-current="page"`, 64px tall). Tabs use `history.replaceState`, so back still closes forms. **Manage batches** moved to the Students tab.
  - **Students tab:** search (student or guardian name), batch filter, a "Show students who left" checkbox and a live result count. Search and filters live in `App`, so they survive editing a student.
  - **Leaving:** `leftOn: string | null` on each student (data v5; existing students are active). A student who left shows on Fees through their leaving month (a last fee can still be collected), then not at all. They're left out of batch messages, have no Remind, and keep all payments.
  - **Delete** stays, but its confirmation says it deletes fee records too and offers **Mark as left instead**.
- **Why:** the user asked for it. Deleting was the only way to clear out former students, and it destroyed their fee history.
- **Alternatives:**
  - Pushing a history entry per tab switch: back would then walk through tabs, not close forms.
  - Hiding students who left from their leaving month too: an unpaid last month would vanish.
  - Saving only `leftOn` when marking as left: it would silently drop other unsaved edits on the form. Instead the whole form saves, and an invalid form shows its errors first.
  - Removing the "+" button from Fees: not asked for. It stays, lifted above the nav.
- **Trade-off:**
  - The nav takes 64px of every tab screen.
  - Payments recorded after a leaving date stay stored but are no longer shown.

## D-029: Message batch through wa.me, one guardian at a time

**Status:** Accepted · 2026-10-17

- **Chose:**
  - A per-batch compose screen with quick templates. The message is copied for the tutor's own WhatsApp group or broadcast list, or sent one by one through `wa.me` links (+91).
  - One recipient per guardian phone, so siblings get one message. Students without a valid phone are listed as skipped.
  - The Send link becomes **Next** / **Skip** as soon as it's tapped, on a 0ms timer so the link's own navigation isn't cancelled.
  - No message history is stored (as requested).
- **Why:** WhatsApp offers no way to send to many people from a web link. Opening one chat at a time is the only option that needs no WhatsApp Business API and no backend.
- **Alternatives:**
  - Showing Next only after detecting a return to the app (`visibilitychange`): unreliable across browsers and desktop tabs, and if detection fails the tutor is stuck. Next is shown at once instead; it's there when she comes back.
  - One `wa.me` link per student: siblings' parents would get duplicates.
- **Trade-off:**
  - The app can't know whether a message was actually sent; **Next** records the tutor's word for it.
  - Progress is lost if she leaves the screen, since nothing is stored.

## D-028: Row transition names only during list reflows; no crossfade on swipe-back

**Status:** Accepted · 2026-10-17 · Amends D-021

- **Bug:** going from Home to the student form and back, the screen jittered for a moment and every batch looked like it collapsed.
- **Root cause:** every student row always had `view-transition-name: row-<id>` (D-021). In a screen transition each named row is drawn as its own layer above the page, and those layers ignore their ancestors' clipping. So the rows of every collapsed batch briefly showed at their layout position, then vanished when the transition ended. A second cause on phones: swiping back plays the browser's own animation, and the app's crossfade then ran on top of it.
- **Chose:**
  - CSS drops the row names (`view-transition-name: none !important`) unless `html.vt-list` is set, and always inside a closed (`inert`) batch panel. The rows still slide on Mark paid / Mark unpaid.
  - `popstate` passes `instant: e.hasUAVisualTransition` to `transition()`, which then applies the screen change without a view transition.
- **Alternatives:** removing the inline name and adding it only for list transitions in JS. That's more code for the same result; the CSS override keeps one switch in one place.
- **Trade-off:** the `!important` in the CSS is there only to beat the inline style.

## D-027: Fees are due on a per-student day, from the joining month

**Status:** Accepted · 2026-10-17 · Extends D-019 and D-026

- **Chose:**
  - Each student has a **joining date** (`joinedOn`, a local "YYYY-MM-DD") and a **fee due day** (`feeDueDay`, 1–31). The first fee month is the joining month.
  - Each month's fee falls on the due day. When a month is shorter than the due day, it falls on the month's last day.
  - Status per month is **Paid**, **Due** (unpaid, due date today or earlier) or **Upcoming** (unpaid, due date still ahead).
  - On Home, the **Pending** tab is renamed **Due** and sorted by due date. Upcoming students appear in a **Due later this month** section on All. The summary shows Collected, Due now and Upcoming.
  - Records move to version 4. Existing students get `joinedOn` = the local date of `createdAt` and `feeDueDay` = 1. Payments are left untouched.
- **Why:** the user asked for it. Tutors set different due dates per family, so a fee that isn't due yet shouldn't be chased.
- **Alternatives:**
  - A fourth **Upcoming** tab: four tabs with counts don't fit a 360px phone.
  - Keeping the tab label **Pending**: it would clash with the **Due** badge and the "Due now" total.
  - Due day as a native select of 1–31: fewer errors, but slower to pick on a phone than typing two digits.
- **Trade-off:**
  - In All, a batch's count leaves out its upcoming students.
  - Past months have no upcoming fees, so every unpaid past fee shows as Due.
  - A student whose joining date moves later keeps any payments from earlier months in storage, but those months no longer show.

## D-026: Pending is the default Home tab again

**Status:** Accepted · 2026-10-17 · Partly supersedes D-024

- **Chose:** with no remembered tab, Home opens on **Pending**. The tab order stays **All · Pending · Paid**, and the last tab used is still remembered (D-024).
- **Why:** the user asked for it. Home's daily job is collecting fees, so the students who still owe sit on the first screen.
- **Alternatives:**
  - Restoring the old order (Pending · Paid · All): not requested, so the order wasn't changed.
  - Dropping the remembered tab: also not requested. Keeping it means a tutor who picks All stays on All.
- **Trade-off:** the default tab isn't the first tab. A device that already remembered a tab keeps opening on it until the tutor picks another.

## D-025: Batch delete can't stall on its animation

**Status:** Accepted · 2026-10-17

- **Bug:** "Move and delete" sometimes did nothing, and focus dropped to the page body.
- **Root cause:** the row roll-shut set the row `inert`, which dropped focus, and the delete ran only in `onAnimationEnd`. When that event never arrives (the animation is skipped or cancelled, or the tab is hidden), the batch was never deleted and the row stayed inert.
- **Chose:**
  - The delete runs from whichever comes first: `animationend` or a 400ms fallback timer (the animation is 200ms). A guard makes sure it runs only once.
  - It runs at once under reduced motion or when `document.hidden`.
  - Focus moves to the "Your batches" heading before the row turns inert.
  - `transition()` now handles a rejected `vt.ready` or `vt.finished`. A skipped view transition still runs its update, so the rejection ("Transition was aborted because of invalid state") is expected and is no longer left as an uncaught promise.
  - A history entry that names a batch which no longer exists doesn't preselect it in the student form.
  - The delete toggle sets `aria-controls` to its confirmation panel while the panel is open.
- **Storage is already atomic:** the move and the delete are one new `AppData` object written with a single `localStorage.setItem` (`persist()`), and state updates only after that write succeeds. A failed write leaves the old record, so the batch and its students stay intact; no student is ever left without a batch. The app doesn't use Dexie or IndexedDB, so it doesn't need a Dexie transaction.
- **Why:** an animation should never decide whether data changes. The visual is optional; the save isn't.
- **Trade-off:** in the rare fallback case the row disappears without rolling shut.

## D-024: Home opens on the All tab and remembers the last tab

**Status:** Partly superseded by D-026 (the default tab is Pending again) · 2026-10-17

- **Chose:** the filter tabs are ordered **All · Pending · Paid**, and All is the default. Whichever tab the tutor picks is remembered on this device (localStorage key `tuition-app:home-filter`, separate from the app record) and restored on the next launch.
- **Why:**
  - Home is the tutor's roster as well as a fee tracker. Starting on Pending hid paid students, so the screen looked half-empty, and early in the month it looked like every student owed money.
  - The default tab normally sits first, so All goes first.
  - A tutor who works through pending fees every day still lands on Pending, because their last tab is remembered.
- **Alternatives:**
  - Keeping Pending as the default: good for collecting fees, but bad as the screen you see when you open the app.
  - Saving the tab inside the `AppData` record: it's a per-device view preference, not data, and it shouldn't need a schema version bump.
- **Trade-off:** if storage is blocked, the tab resets to All on each launch. Every read and write is wrapped in try/catch, so nothing breaks.

## D-023: Managing batches after setup

**Status:** Accepted · 2026-10-17

- **Chose:**
  - **Rules:** batch names are required and unique (case-insensitive, ignoring outer spaces) via `validateBatchName`. Setup now applies the same uniqueness rule ("Each batch needs a different name.").
  - **"+ New batch" in the student form:** an inline editor (`InlineNameEditor`) under the Batch picker. Saving creates the batch, selects it, returns focus to the picker and announces it in an inline status line. The form keeps everything already typed; Enter saves the batch and never submits the student form.
  - **Manage batches screen:** a new `history.state` screen (`{ name: 'batches' }`), opened from a text button under Home's batch list (also on the empty Home).
    - **Layout:** a list with a student count per batch. Tapping a row renames it inline; **+ Add batch** adds one inline; **Done** returns to Home.
    - **Delete:**
      - An empty batch gets an inline confirmation (Keep / Delete).
      - A batch with students explains the count and requires choosing a batch to move them to; **Move and delete** then moves the students and deletes the batch in one save. Payments are unaffected, since they're linked to students, not batches.
      - **The last batch can't be deleted** (user confirmed), only renamed, with a note explaining why.
  - **Feedback:** every add, rename and delete is announced in a `role="status"` line. Focus moves to the new or renamed row, or to the "Your batches" heading after a delete.
  - **Home:** batches with no students now show on **every** tab (user confirmed), with "No students yet" and **Add to this batch**. A newly created batch is opened on Home.
- **Why:**
  - Editing names in place keeps the tutor in context instead of opening a dialog or another screen.
  - Moving students before deleting means a student is never left without a batch.
  - Keeping at least one batch keeps setup's rule that every student has one.
- **Alternatives:**
  - Deleting a batch along with its students: destructive and easy to do by accident.
  - A separate rename screen: slower for a one-field change.
- **Trade-off:** the batch order is the order batches were created; there's no reordering yet.

## D-022: Save student uses `aria-disabled` and reveals errors when pressed

**Status:** Accepted · 2026-10-17

- **Chose:** the Save student button stays focusable and pressable (`aria-disabled="true"` while invalid, never `disabled`). Pressing it while invalid marks every field as touched, which shows all the errors, and moves focus to the first invalid field. Styling for `.cta[aria-disabled='true']` matches the disabled look.
- **Why:** user request. A `disabled` button is skipped by keyboard and screen-reader users, and pressing it does nothing, so there's no way to find out what's wrong.
- **Open:** Setup's **Get started** still uses `disabled`. Switch it the same way if the user wants consistency.

## D-021: Undo toast, and the list reflow animation

**Status:** Accepted · 2026-10-17

- **Chose:**
  - **Toast:** a small in-house component (`src/components/Toast.tsx`), not a library. It's a flat ink block, `role="status"`, stays up for 6 seconds, and pauses on hover or focus. On phones it sits left of the "+" button; on wide screens it spans the column.
  - **List reflow:** marking paid or pending runs a view transition of kind `"list"`. Each row has `view-transition-name: row-<id>`, so the rows below slide up while the leaving row fades out. The page itself doesn't crossfade (`html.vt-list`). This is skipped with reduced motion.
  - **Focus:** when a row leaves the current tab, focus moves to the next visible row's main action in an open batch, or the previous row's, or else the tabs.
- **Why:** an Undo toast was requested. Sonner and similar libraries would add a dependency and a second visual language for one message type. Without the reflow animation, rows jump and it's hard to see what changed.
- **Trade-off:** only one toast at a time; a new one replaces the old.

## D-020: Reminders through a WhatsApp `wa.me` link with an optional UPI link

**Status:** Accepted · 2026-10-17

- **Chose:**
  - **Link:** **Remind** is a real link (`<a target="_blank">`) to `https://wa.me/91<guardian phone>?text=…`.
  - **Message:** built in `src/lib/fees.ts → reminderMessage()`:
    - "Hello {guardian name}," (or "Hello,")
    - the student's name, fee and month
    - if a UPI ID is set: "You can pay by UPI here:" followed by `upi://pay?pa=…&pn=…&am=…&cu=INR&tn={student} {Mon YYYY} fee`
    - "Thank you," then the tutor's name and phone (+91 formatted)
  - **Pending rows only:** Remind only appears on pending rows; the user confirmed this. A "fee pending" message to someone who has paid would be wrong.
- **Why:** WhatsApp is how tutors and parents talk in India. `wa.me` works on phones and desktop without an API key or business account, and the tutor still reviews the message and taps Send.
- **Known limitations:**
  - WhatsApp only makes `http(s)` links tappable, so on many phones the `upi://pay` text shows but **isn't clickable**. Parents may need to copy it or pay to the UPI ID directly. If this matters, consider an `https` payment page or putting the UPI ID itself in the message.
  - The app can't tell whether the message was actually sent.

## D-019: Monthly fee status: a payments list, pending by default

**Status:** Accepted · 2026-10-17 · Extends D-015, D-017

- **Chose:**
  - **Payments list:** `AppData.payments: { studentId, month: "YYYY-MM", amount, paidAt }[]`. A month with no payment record is **pending**. The storage record moves to `version: 3`, and v1/v2 records are upgraded on load with `payments: []`.
  - **When fees start:** a student owes fees from the month they were added (`createdAt`), through the current month.
  - **Amounts:** a paid month stores the amount at the time it was paid, so editing the fee later doesn't rewrite history. Pending amounts use the student's current fee.
  - **Reversing:** **Mark pending** removes the record, so mistakes can always be reversed (user confirmed).
  - **Deleting a student** also deletes their payments.
  - **Month range:** the month arrows run from the earliest join month to the current month. Future months aren't allowed (user confirmed).
- **Why:** storing only the paid months keeps the data small and makes "pending" the default with nothing to back-fill. "YYYY-MM" strings sort and compare correctly as plain text.
- **Trade-off:** students added today can't have past months recorded, because their fees start this month. Fixing that would need an editable "joined" month on the student form.

## D-018: Home layout: collapsible numbered batches, cut-out "+" button, inline delete

**Status:** Accepted · 2026-10-17

- **Chose:**
  - **Collapsible batch groups.**
    - Each batch is **unnumbered**, because batches are equals in no particular order and a number would be decoration. It sits on the normal 20px page edge, aligned with the summary and tabs. It was first indented on setup's 40px gutter, but the user rejected that on 2026-10-17 as wasted space on a phone. The 40px hang is now only used where a section number sits in it. Its header is a full-width toggle showing the batch name, "N students" and a chevron.
    - **One batch starts expanded; several start collapsed** (user request).
    - Open and closed state is kept in `App`, so it survives going into a student and back. Saving a student into a closed batch opens that batch.
    - Closed panels are `inert`, so hidden rows can't take focus.
  - **Floating "+" button:** a 72px teal block with a 4px page-white cut-out edge instead of a shadow. On screens 46rem and wider it moves into the right margin.
  - **Delete:** an inline red-tinted confirmation inside the edit form ("Keep" / "Delete"). Focus starts on Keep, and Escape cancels.
  - **Empty home:** the message plus a marigold Note, with the Add button at the bottom for thumb reach. The "+" button is hidden here because the big button does the same job.
- **Why:**
  - Collapsed batches keep a long roster scannable.
  - The cut-out edge keeps the "+" button flat to match the printed look (DESIGN.md has no shadows). Without it, the button looked like it was colliding with the rows.
  - An inline confirmation is easier one-handed than a pop-up dialog and keeps focus in context.
- **Alternatives:**
  - Accordion where only one batch can be open at a time: rejected because tutors may want to compare batches.
  - A shadowed round "+" button: breaks the design system.
  - A `confirm()` dialog: blocks the page and can't be styled.
- **Trade-off:** with several batches, the tutor taps once to see students. The batch headers show counts so the collapsed view is still informative.

## D-017: Student record and storage version 2

**Status:** Accepted · 2026-10-17

- **Chose:**
  - A `Student` has these fields: `{ id, name, className?, batchId, guardianName?, guardianPhone (10 digits), monthlyFee (whole ₹), createdAt, updatedAt }`.
  - Students are stored in the same localStorage record (D-009), now `version: 2`. `loadAppData()` upgrades a v1 record in place by adding `students: []`. The storage key name `tuition-app:v1` is kept.
- **Why:** one record keeps the single migration point. Storing the fee now is cheap, and fee tracking will need it (the user brought it into v1; see PRODUCT.md).
- **Validation:**
  - The guardian phone reuses the setup phone rules (D-012).
  - The fee accepts "1500", "1,500" or "1 500". It must be a whole number from 0 to 9,99,999.
  - Class is free text; "8" displays as "Class 8", and "KG" shows as typed.
- **Trade-off:** the key name no longer matches the version number. The version lives inside the record, so this is cosmetic.

## D-016: Screen navigation through `history.state`, without a router

**Status:** Accepted · 2026-10-17 · Updates D-009

- **Chose:** the current screen (`home` or `student` with an optional `studentId`/`batchId`) is pushed into `history.state`, and the URL doesn't change.
  - `popstate` switches screens inside a view transition, restores Home's scroll position, and returns focus to the element that opened the form.
  - Save and Cancel both call `history.back()`.
- **Why:**
  - The phone's back button closes the form, which is essential on Android.
  - A reload restores the open form.
  - It needs no router dependency and no server rewrite rules for deep URLs.
- **Alternatives:** React Router (about 20 KB, and real URLs need hosting rewrites), or plain state with no history (the back button would leave the app).
- **Trade-off:** screens have no shareable URLs. Add a router when deep links matter, such as a "student profile" link.

## D-015: Monthly fee stored per student; no tracking yet

**Status:** Accepted · 2026-10-17 · Extends D-007

- **Chose:** the add/edit student form requires a monthly fee (user spec). Nothing yet tracks payments, sends reminders or totals fees.
- **Why:** the user's spec. Fee tracking, reminders and a summary strip are the next features.

## D-014: Installable web app, with a teal install splash

**Status:** Accepted · 2026-10-17

- **Chose:**
  - a web app manifest (`public/manifest.webmanifest`) with teal `background_color` and `theme_color`
  - 192/512 icons plus a maskable icon and an Apple touch icon
  - a status bar that sits over the teal band (`black-translucent`)
- **Why:** when a tutor adds the app to their home screen, the phone shows a teal splash with the icon while it opens, at no cost in time. It feels like an installed app without us building a timed splash.
- **Alternatives:** a custom splash screen in the app, rejected (see D-013). Native app wrappers, which are out of scope (D-003).
- **Trade-off:**
  - The icon is a **placeholder**: a marigold "1" on teal, rendered from Mukta. It needs replacing once a name and brand are chosen (D-006).
  - There is no service worker yet, so there's no offline caching of app files. That's still an open decision.
  - iOS doesn't use the manifest for splash screens, so it shows a plain launch until we add Apple startup images.

## D-013: No timed splash screen; motion lives in the chapter band

**Status:** Accepted · 2026-10-17

- **Chose:** three purposeful motion moments, all in `src/components/ChapterBand.css`:
  1. **First-launch opening:** about 780ms. The band unrolls, the heading settles, and the marigold "1" prints in. The form is visible and usable throughout.
  2. **Chapter turn (Setup → Home):** about 600ms, using the View Transitions API. The band holds its place while the "1" lifts away and the "2" rises in.
  3. **Batch rows unroll and roll shut:** this one existed already (D-008).
- **Why:** the user ruled out "too slow". A 1–2 second splash on every launch makes a busy tutor wait several times a day for no reason, since the app loads in well under a second. These moments carry the brand instead, and none of them blocks a tap.
- **Alternatives:**
  - A 1–2s animated splash: rejected because it adds delay on every launch.
  - Staggered entrances on every section: noise on a working screen.
  - A motion library such as Framer Motion or GSAP: CSS and View Transitions cover all three for no extra download.
- **Trade-off:** browsers without View Transitions (older Safari, Firefox before 2025) just swap screens instantly, which is the intended fallback. With reduced motion turned on, users get gentle fades only.

## D-012: Validation rules for setup

**Status:** Accepted · 2026-10-17

- **Chose:**
  - **Phone:** spaces, dashes and a `+91` or `0` prefix are allowed and stripped. What remains must be 10 digits starting with 6, 7, 8 or 9. It is stored as the bare 10 digits.
  - **UPI ID:** optional. If entered, it needs text on both sides of an `@`.
  - **Batches:** names are trimmed and empty rows are dropped on save. At least one batch is required.
  - **Error timing:** errors show after a field loses focus, never while the tutor is still typing.
- **Why:** tutors paste numbers in many formats, so storing one normal form keeps future reminder links reliable. The spec only asked UPI to contain "@", but `ritu@` and `@okaxis` are obviously broken, so both sides are required.
- **Alternatives:** a full UPI handle check against a list of banks. That is brittle and blocks valid new handles.
- **Trade-off:** foreign numbers can't be entered. That's fine for the India-only scope in D-002.
- **Where:** `src/lib/appData.ts`, in the `validate*` and `normalizePhone` functions.

## D-011: Plain CSS with design tokens and Lucide icons; no UI kit

**Status:** Accepted · 2026-10-17

- **Chose:**
  - Plain CSS files next to each screen.
  - Colours, radius and spacing as CSS variables in `src/index.css`.
  - `lucide-react` for icons.
- **Why:** there are two screens so far, so a component library or Tailwind would add weight and a second design language to fight against D-008. Lucide gives one consistent stroke style and is tree-shaken, so only the icons used get bundled.
- **Alternatives:**
  - Tailwind: fine later, but it is a big switch for little gain right now.
  - MUI or Chakra: these impose their own look.
  - Unicode × and + characters: they look different on every phone.
- **Trade-off:** shared components (inputs, buttons) live in screen CSS for now. Pull them into `src/components/` when a third screen needs them.

## D-010: Mukta font, self-hosted via @fontsource

**Status:** Accepted · 2026-10-17

- **Chose:** Mukta, an Indian-designed sans, at weights 400, 600 and 800, Latin subset only. It is bundled from `@fontsource/mukta`.
- **Why:** it fits the NCERT-textbook world (D-008) and reads well at small sizes on cheap phones. Self-hosting means no request to Google Fonts and keeps working offline. The Latin subset is about 21 KB per weight.
- **Alternatives:** the system font, which is generic. Inter, which is overused. Google Fonts CDN, which adds a third-party request and fails offline.
- **Trade-off:** adding Devanagari later means importing the extra subsets, which roughly doubles the font weight.

## D-009: Local storage in one versioned record; no router yet

**Status:** Accepted · 2026-10-17

- **Chose:** everything is saved in one localStorage key, `tuition-app:v1`, with the shape `{ version, tutor, batches, setupCompletedAt }`. `App.tsx` shows Setup when nothing is saved and Home otherwise. There is no router library.
- **Why:** the spec said "save locally". One versioned record gives a single place to migrate from later, whether to IndexedDB or a backend. With only two screens, a router would be dead weight.
- **Alternatives:** IndexedDB, which is overkill for a few KB. A BaaS, which is undecided (D-005). React Router, which is worth adding once there are 3 or more screens with real URLs.
- **Trade-off:** data lives in one browser on one device, and clearing site data wipes it. Moving to sync or backup is a D-005 decision. If storage is blocked, setup shows an error instead of failing silently.

## D-008: Visual direction is "NCERT Textbook"

**Status:** Accepted · 2026-10-17

- **Chose:** the app reads like the inside of the NCERT textbooks tutors teach from:
  - a deep teal chapter band with a large marigold chapter numeral
  - numbered sections (1.1–1.4)
  - marigold "Note" boxes
  - a white page with clean outlined fields
- **Why:** tutors know this page by heart. It feels serious and structured, avoiding the "bureaucratic", "childish" and "slow" feelings the user ruled out. It signals a short, finite task.
- **Alternatives:** the user saw four on the Impeccable decision page:
  - Inland Letter (India Post blue), the randomly assigned direction
  - Boarding Pass
  - a generic SaaS form
  - four declined catalog worlds
- **Trade-off:** the closest of the options to a standard form. Its character rests on the band, the numerals and the marigold, so keep them consistent. The direction contract is in `.impeccable/surfaces/src-screens-setupscreen-tsx.md`.

## D-007: Setup collects reminder details now; reminders are built later

**Status:** Accepted · 2026-10-17

- **Chose:** setup asks for the tutor's name, phone and optional UPI ID, which reminder messages will use. Sending fee reminders stays out of v1 (D-004 still holds).
- **Why:** asking once at first launch is cheaper than a second onboarding later. The data costs nothing to store.
- **Trade-off:** setup mentions reminders before the feature exists, so the help text promises a little ahead of the product.

## D-006: Open decisions (still undecided)

**Status:** Open · 2026-10-17 · Replaces D-005

- **Positioning:** what makes the app better than a spreadsheet or a generic class app.
- **Product name and brand.** The app icon is a placeholder until this is decided (D-014).
- **Backend, sync and backup:** local-only today (D-009).
- **Authentication.**
- **Offline support:** the app already works offline (local data, bundled font), but there is no PWA install or service worker yet.
- **Dark mode:** light-only for now, by design.
- **Settings screen:** the UPI help text refers to it, but it doesn't exist yet.

## D-005: Open decisions (not yet made)

**Status:** Superseded by D-006 (routing and styling were decided in D-009 and D-011) · 2026-10-17

- **Positioning:** what makes the app better than a spreadsheet or a generic class app.
- **Product name and brand.**
- **Backend and data storage:** local-only, a BaaS such as Supabase or Firebase, or a custom API.
- **Authentication.**
- **Offline support.** This matters if tutors use the app with poor connectivity.
- **Routing, state and styling libraries.** These will be picked when the first screen is built.

## D-004: v1 scope is students, batches and timetables only

**Status:** Accepted · 2026-10-17

- **Chose:** student rosters, batches and batch timetables.
- **Why:** this is the core every other feature depends on, since fees, attendance and progress all hang off a student in a batch. Shipping it first gives tutors something useful sooner.
- **Alternatives:** also including fees, attendance or booking. All three were deferred, not rejected.
- **Trade-off:** tutors still track fees elsewhere for now.

## D-003: Mobile-first web, not native

**Status:** Accepted · 2026-10-17

- **Chose:** a responsive web app, designed for the phone first.
- **Why:** tutors manage classes on their phones between sessions. The web needs no app-store release and gives one codebase for phone and laptop.
- **Alternatives:** desktop-first web was rejected because it doesn't match how tutors work. A native iOS or Android app is not ruled out for later.
- **Trade-off:** no push notifications or deep OS integration without extra work, such as a PWA.

## D-002: Users are tutors (solo first, scaling to small centres), in India, with an English UI

**Status:** Accepted · 2026-10-17

- **Chose:** the tutor who runs the classes is the primary user, not parents, students or a marketplace.
- **Why:** this gives one clear user and job. Indian context means boards, grades and ₹ are first-class concepts.
- **Alternatives:** a parent-facing app, a two-sided marketplace, or an institute admin tool.
- **Trade-off:** there are no parent or student logins in v1. Multi-teacher roles come later.

## D-001: React 19 + TypeScript + Vite

**Status:** Accepted · 2026-10-17

- **Chose:** the existing Vite React-TS starter the project began with.
- **Why kept:** fast dev server and HMR, type safety for the data model (students, batches and timetables), and a large ecosystem. Nothing about the product needs server rendering yet.
- **Alternatives:** Next.js would be worth revisiting if SEO or server rendering becomes necessary, for example for a public tutor page. Plain HTML would not scale to an app with state.
- **Trade-off:** routing, data fetching and auth must be added ourselves (see D-005).
