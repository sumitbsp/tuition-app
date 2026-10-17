# Project Flow

How the tuition app is put together, for a developer joining the project. This file is updated as features land. Read it with [decisions.md](decisions.md), which explains why things are built this way, and [PRODUCT.md](PRODUCT.md), which describes who the app is for.

> **Current status (2026-10-17):** what's built so far:
> - First-launch setup, with its opening animation and the Setup → Home "chapter turn".
> - Home: students grouped in collapsible batches.
> - The add/edit/delete student form.
> - Installing the app to the home screen.
>
> - Monthly fee tracking: month switcher, summary, All/Due/Paid tabs, Mark paid with Undo.
> - Per-student joining date and fee due day, with Paid / Due / Upcoming status (D-027).
> - WhatsApp reminders.
> - Bottom navigation (Fees · Students) and a Students screen with search, batch filter and Manage batches (D-030).
> - Students who leave: Active / Left status with a leaving date; fee history kept (D-030).
> - Settings tab: your details with a UPI test link, an editable reminder template, defaults for new students, backup and restore, and delete all data (D-032).
> - Message batch: one message to every guardian in a batch, copied or sent one by one on WhatsApp (D-029).
> - Managing batches after setup: add, rename, and delete with move.

## 1. What the app does

A mobile-first web app for private tutors in India. In v1 a tutor can manage:

- **Students:** the people they teach, each with a class, a batch, a guardian contact, a monthly fee, a joining date and a fee due day. They can be added, edited and deleted.
- **Batches:** groups of students taught together. Batches are created during setup.
- **Timetable:** when each batch meets (not built yet).

Each student has a monthly fee that's tracked per month as paid, due or upcoming (D-027), with WhatsApp reminders (D-019, D-020). Attendance, progress tracking and booking are out of scope for v1. Setup collects the tutor's name, phone and UPI ID for future fee reminders (D-007).

## 2. Running it

```bash
npm install
npm run dev       # Vite dev server with HMR
npm run build     # type-check (tsc -b) and production build into dist/
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

To see setup again, clear the saved data in DevTools by running `localStorage.removeItem('tuition-app:v1')`, then reload.

## 3. Boot sequence

```
index.html                 viewport-fit=cover, theme-color teal, manifest + icons
  └─ src/main.tsx          loads the Mukta font files, index.css (tokens), then <App/>
       └─ src/App.tsx
            ├─ loadAppData()  ── reads localStorage "tuition-app:v1"
            ├─ no data            → <SetupScreen onComplete={completeSetup}/>
            │                         └─ completeSetup(): view transition → Home
            ├─ screen = student   → <StudentScreen …/>   (add, or edit when studentId is set)
            ├─ screen = batches   → <BatchesScreen …/>   (manage batches)
            └─ screen = home      → <HomeScreen …/>
```

There is no router (D-016). The current screen lives in `history.state` as `{ screen }`, where `screen` is `{ name: 'home' }` (Fees), `{ name: 'students' }`, `{ name: 'settings' }`, `{ name: 'batches' }`, `{ name: 'message', batchId }` or `{ name: 'student', studentId?, batchId? }`.
- **Tabs:** the bottom nav (`components/BottomNav.tsx`) switches between Fees, Students and Settings with `history.replaceState` (`App.switchTab`), so back closes forms rather than stepping through tab switches. The nav is rendered by `App` after the tab screen, so it stays mounted (and keeps focus) across tabs. It's hidden on forms.
- Opening a student, Manage batches or Message batch calls `history.pushState` (`App.openScreen`), saving the tab's scroll position and the element to refocus.
- Save, Cancel and the phone's back button all go through `history.back()` and then `popstate`.
- A reload restores whichever screen is open.

Every screen change runs inside `transition()` in `App.tsx`: a view transition with `flushSync`, followed by scroll restore.

**Installed app:** `public/manifest.webmanifest` sets a teal background, so when the app is opened from the home screen the phone shows a teal splash with the icon (D-014). There is no service worker yet.

## 4. Folder map

| Path | What lives there |
|---|---|
| `index.html` | HTML shell, viewport and theme colour |
| `src/main.tsx` | React entry point; imports the fonts and global CSS |
| `src/index.css` | Design tokens (`--teal`, `--marigold`, …), reset, focus ring, `.column` |
| `src/App.tsx` | Screen state and history navigation, view transitions, save and delete (`commit`), returning focus, which batches are open |
| `src/components/ChapterBand.tsx` + `.css` | Shared teal band (heading, subtitle, the app mark on Setup) and **all band motion**: the opening, the chapter turn, and the reduced-motion fallbacks |
| `src/components/Field.tsx` | `TextField` (optional ₹-style prefix), `SelectField`, `FieldError`. Wires label, error and help with `aria-describedby` |
| `src/components/form.css` | Shared form and screen styles: sections, inputs, notes, errors, buttons (primary, secondary, danger), dock |
| `src/lib/appData.ts` | Data types (`AppData` v2, `Student`), load/save and the v1→v2 migration, validators, `formatRupees`, `formatClass`, `studentsInBatch` |
| `src/lib/contacts.ts` | Contact Picker support check, `pickGuardianContact`, `cleanContactPhone` (strips +91 / 0091 / 0 and punctuation) |
| `src/lib/text.ts` | `describedBy`, `joinList` |
| `src/lib/fees.ts` | Month helpers ("YYYY-MM"), due dates (`dueDate`, `byDueDate`), fee status (paid / due / upcoming), `summarizeMonth`, `monthRange`, the reminder template (`DEFAULT_REMINDER`, `REMINDER_PLACEHOLDERS`, `fillReminder`, `unknownPlaceholders`), `reminderMessage`, and the `upi://pay` link |
| `src/lib/messages.ts` | Batch recipients (one per guardian phone; students without one are skipped), `guardianLabel`, `formatPhone`, `whatsappLink`, quick templates |
| `src/lib/viewTransition.ts` | `transition(update, { kind: 'screen' \| 'list', scrollY })`, shared by every animated state change |
| `src/components/MonthSwitcher.tsx` | ‹ Month › inside the band, bounded to the tracked range |
| `src/components/FilterTabs.tsx` | All / Due / Paid tabs (WAI-ARIA, arrow keys) |
| `src/components/Toast.tsx` + `.css` | Single toast with an optional action (Undo); 6s, pauses on hover or focus |
| `src/screens/SetupScreen.tsx` + `.css` | First-launch setup form (the CSS holds only the batch-row styles) |
| `src/screens/HomeScreen.tsx` + `.css` | Home: greeting and month, collapsible batch groups, student rows, empty states, the "+" button |
| `src/screens/StudentScreen.tsx` + `.css` | Add/edit student form: "+ New batch" inline, the inline delete confirmation |
| `src/screens/StudentsScreen.tsx` + `.css` | Students tab: search, batch filter, "Show students who left", the roster, Add student, Manage batches |
| `src/screens/SettingsScreen.tsx` + `.css` | Settings: details, reminder template with placeholder chips and preview, defaults, backup/restore, delete all data |
| `src/components/BottomNav.tsx` + `.css` | Fees · Students · Settings nav (`<nav aria-label="Main">`, `aria-current="page"`); sets `--nav-h` so floating elements clear it |
| `src/screens/BatchesScreen.tsx` + `.css` | Manage batches: list with counts, rename and add inline, delete (move students first), Done |
| `src/screens/MessageScreen.tsx` + `.css` | Message batch: compose with templates, send one by one, summary |
| `src/components/InlineNameEditor.tsx` | Field with its own Save / Cancel (Enter saves, Escape cancels, never submits the enclosing form). Used for new, rename and add batch |
| `public/manifest.webmanifest` | Install metadata: name, teal splash and theme colours, icons |
| `public/icons/` | App icons (192, 512, maskable, Apple touch, favicon). Placeholder mark; provenance embedded in each PNG |
| `PRODUCT.md` | Product truth: users, scope and principles |
| `flow.md` / `decisions.md` | This file / the decision log |
| `.impeccable/surfaces/` | Design brief and direction contract for each screen |
| `.claude/`, `.agents/`, `.codex/`, `.impeccable/` | AI tooling. Not part of the app runtime. |

## 5. User flows

### 5.1 First launch: setup

**Files:** `src/screens/SetupScreen.tsx`, `src/lib/appData.ts`

1. The tutor opens the app with nothing saved, so `App` renders `SetupScreen`.
2. They fill in four numbered sections:
   - **1.1 Your name:** required.
   - **1.2 Phone number:** required. `type="tel"`, `inputmode="tel"`. `+91`, `0`, spaces and dashes are accepted.
   - **1.3 UPI ID:** optional. If entered, it needs text on both sides of an `@`.
   - **1.4 Batches:** a list of rows that starts with one empty row. "Add another batch" adds a row and focuses it. The × button removes a row and moves focus to the row next to it. The × is only shown when there are 2 or more rows.
3. Validation runs on every render, using the `validate*` functions in `appData.ts`. A field's error appears only after it loses focus. For batches, that means after focus leaves the whole batch group.
   - The error appears as text directly under the input, with `aria-invalid`.
   - It is linked through `aria-describedby`, together with the field's help text.
4. **Get started** is `disabled` until name, phone and at least one non-empty batch are valid, and the UPI ID is either empty or valid. The line under the button lists what to add (empty fields) or fix (invalid fields) and is announced with `aria-live="polite"`.
5. On submit:
   - An `AppData` record is built: name trimmed, phone reduced to 10 digits, UPI trimmed or `null`, batches trimmed with empty rows dropped.
   - `saveAppData()` writes it to localStorage.
   - If the save fails, an error appears above the button with `role="alert"`.
   - If it succeeds, `onComplete(data)` causes `App` to render Home.

**Motion** (D-013):
- **Opening.** When Setup mounts, `ChapterBand` gets `opening`. The band unrolls (clip-path, 520ms), the heading settles (starting at 140ms), and the "1" prints upward (starting at 300ms). The form is usable throughout.
- **Batch rows.** New rows unroll in place (`grid-template-rows` from 0fr to 1fr, 280ms) and removed rows roll shut (200ms).
- **Chapter turn.** On a successful save, `App.completeSetup` wraps the screen swap in `document.startViewTransition`. The band (`view-transition-name: chapter-band`) holds its place, the heading (`chapter-text`) lifts out and Home's rises in, the Setup app mark (`chapter-mark`) lifts out, and the rest crossfades. Home has no mark. Focus then moves to Home's heading.
- **Reduced motion.** With reduced motion turned on, all of the above become short fades or instant changes. Browsers without View Transitions swap screens instantly.

### 5.2 Home: fees by month

**Files:** `src/screens/HomeScreen.tsx`, `src/lib/fees.ts`, `src/components/{MonthSwitcher,FilterTabs,Toast}.tsx`

- **Band:** "Hello, {first name}" with a **month switcher** (‹ October 2026 ›). It runs from the earliest month any student joined up to the current month; the arrows are disabled at the ends. `App` keeps the selected month and clamps it if the range shrinks. There is no app mark.
- **Confirmation line:** a `role="status"` line, e.g. "Added Aarav Mehta.", after a student is saved or deleted.
- **No students at all:** shows "Add your first student", a marigold Note, and a full-width **Add student** button at the bottom. The month switcher, summary, tabs and "+" button are hidden in this state.
- **Fee status** (`feeStatus`, D-027): each month's fee is due on the student's due day, or on the month's last day when the month is shorter. **Paid** means a payment is recorded. **Due** means unpaid with the due date today or earlier. **Upcoming** means unpaid with the due date still ahead. Only the current month can have upcoming fees.
- **Summary strip** (`summarizeMonth`): Collected (sum of recorded payments), Due now (current fees of due students) and Upcoming (current fees of upcoming students). It counts only students enrolled that month (joined in or before it).
- **Filter tabs:** All, Due and Paid, each with a count; Due is the default (D-026). A remembered `pending` from before D-027 opens Due. They're WAI-ARIA tabs (arrow keys, Home, End) controlling one tabpanel. `App` keeps the selected tab and saves it to localStorage (`tuition-app:home-filter`, inside try/catch), so the next launch opens on the last tab used (D-024).
- **Batch groups:** every batch appears in setup order, unnumbered and on the normal page edge (no indent; see D-018). The header is a toggle (`aria-expanded`) showing the name, a count for the current tab ("2 due", "1 paid" or "3 students") and a chevron.
  - **Default state:** one batch starts expanded; several start collapsed (D-018). Open state lives in `App`.
  - **Which batches show:** Due and Paid show batches with matching rows, plus batches with **no students at all** (so a new batch is never hidden). All shows every batch. If no student matches, the panel also shows "Everyone has paid for {month}.", "Nothing due yet. N fees are due later this month." or "No fees marked paid for {month} yet."
  - **Row order:** by name, except on Due, which sorts by due date (oldest first, ties by name).
- **Due later this month** (All tab only): upcoming students leave their batch groups and are listed in one section below them, in due-date order, each with its batch name.
- **Student row:**
  - **Details (opens edit):** the name, class, amount (the recorded payment, or the current fee) and due date ("Due 10 Oct").
  - **Status badge:** **Paid** (check icon, teal tint), **Due** (clock icon, marigold tint) or **Upcoming** (calendar icon, outline only). It's always a word plus an icon, never colour alone.
  - **Actions on due and upcoming rows:** **Remind** (a link to WhatsApp, D-020) and **Mark paid**. On phones they sit full-width under the details; on wide screens, inline.
  - **Actions on paid rows:** only **Mark unpaid**.
- **Mark paid / Mark unpaid:**
  1. `App.setPaid` adds or removes the payment and saves synchronously. If the save fails, a toast says so.
  2. The list reflows in a `"list"` view transition (D-021). Rows carry a view-transition name only during that reflow, and never inside a closed batch (D-028).
  3. If the row leaves the current tab, focus moves to the next row's action in an open batch.
  4. A toast ("X marked paid for October 2026." with **Undo**) shows for 6 seconds.
- **Students who left** (D-030) appear only up to their leaving month (`isEnrolled`), so their last fee can still be collected. Their rows show "Left {date}" and have no **Remind**.
- **Message batch** shows only for batches with at least one active student.
- **"+" button:** fixed bottom-right above the bottom nav, with a page-white cut-out edge; in the right margin from 46rem up.
- **Returning to Home:** batch open state lives in `App`, so it survives the student form. A swipe-back skips the app's crossfade, since the browser has already animated it (D-028).
- **Returning focus:** `App` passes `focusKey` (`student:<id>`, `batch-add:<id>`, `add` or `title`); Home's scroll position is restored on back.

### 5.3 Add / edit / delete a student

**Files:** `src/screens/StudentScreen.tsx`, `src/App.tsx`

1. Opened from Fees (the "+" button, the empty-state button, **Add to this batch**, a row) or from Students (**Add student**, preselecting the filtered batch, or a row). `App.openScreen` saves the tab's scroll position and the element to refocus later, then pushes the screen into history.
2. The band reads "Add a student" or "Edit student" (with the student's name as subtitle). Focus moves to the heading so screen readers announce the screen, and the keyboard doesn't pop up.
3. Three numbered groups:
   - **1 Student:** name (required), class (optional), batch (required; a native select, pre-selected when there's only one batch or when opened from a batch).
     - **+ New batch** under the picker opens an inline editor. Saving calls `App.createBatch`, selects the new batch, focuses the picker and announces "Added batch X and selected it." Nothing typed in the form is lost.
   - **2 Guardian:** name (optional), phone (required, `type="tel"`, `inputmode="tel"`).
     - **Pick from contacts** (D-031) under the phone, only where the Contact Picker API exists (Chrome on Android, secure origins). It fills the phone with the cleaned 10-digit mobile and, if empty, the guardian name, then announces it in a `role="status"` line. A contact with no valid mobile shows "That contact doesn't have a valid 10-digit mobile number." linked to the button with `aria-describedby`. Cancelling or a failed picker does nothing; focus stays on the button.
   - **3 Fee:**
     - **Monthly fee:** required, with a ₹ prefix and `inputmode="numeric"`.
     - **Joined on:** required `type="date"`, defaults to today. Fees start from this month.
     - **Fee due on:** a day of the month from 1 to 31, defaulting to 1. The help text reads "Fees are due on this day every month." and, for days 29 to 31, explains the last-day rule. **Same as joining day (N)** copies the joining date's day and announces it in a `role="status"` line.
4. Errors appear after a field loses focus, just like setup.
   - **Save** uses `aria-disabled` rather than `disabled` (D-022), so it stays focusable.
   - Pressing it while the form is invalid shows every error and focuses the first invalid field.
   - An add/fix hint sits under the buttons.
   - **Cancel** calls `history.back()`.
5. On save, `App.commit()` does the following:
   - writes the new `AppData` (adding or replacing the student)
   - sets the confirmation line
   - opens the student's batch
   - calls `history.back()`

   Home then focuses the student's row. If the save fails, an error appears in the dock.
6. **Active / Left** (edit only), below the form:
   - **Mark as left** opens an inline confirmation with a **Left on** date (defaults to today; not before joining, not in the future) and what it means. Focus goes to the date; Escape or **Keep active** cancels.
   - Confirming saves the whole form with `leftOn` set (so other edits aren't lost; an invalid form shows its errors first) and returns with "Marked X as left."
   - A student who left shows "Left on {date}" and **Mark as active**, which saves with `leftOn: null`.
7. **Delete** (edit only) sits below that:
   - Tapping it opens an inline confirmation: "Delete X? This also deletes all their fee records, and can't be undone." For an active student it suggests marking them as left, with a **Mark as left instead** button. Focus starts on **Keep**; Escape cancels.
   - **Delete** removes the student and their payments and returns to the tab, with focus on its add button.

### 5.4 Manage batches

**Files:** `src/screens/BatchesScreen.tsx`, `src/App.tsx` (`createBatch`, `renameBatch`, `deleteBatch`)

1. Opened from **Manage batches** at the foot of the Students tab. Focus goes to the heading; **Done** or the back button returns to Students, focusing the Manage batches button.
2. **List:** each batch shows its student count and a pencil cue. Tapping the row opens an inline rename editor.
3. **Add batch:** opens an inline editor at the bottom of the list.
4. **Validation:** names are required and unique, case-insensitive (`validateBatchName`). Errors appear under the field, linked with `aria-describedby`.
5. **Delete** (the trash icon; hidden when only one batch is left, with a note explaining why):
   - **No students:** "Delete batch X? This can't be undone." with focus on **Keep**. Escape cancels.
   - **Has students:** "X has N students. Choose a batch to move them to, then delete." with a **Move students to** picker (focused). **Move and delete** moves the students, deletes the batch and saves once. Pressing it with nothing chosen shows an error.
   - The trash toggle has `aria-expanded`, plus `aria-controls` pointing at the panel while it's open.
   - **Roll-shut, then delete:** focus moves to the "Your batches" heading, the row rolls shut, and the delete runs on `animationend` or after a 400ms fallback, whichever comes first, exactly once. Under reduced motion, or in a hidden tab, it runs at once (D-025).
6. **Feedback:** after every change, a `role="status"` line announces it ("Added batch X.", "Renamed X to Y.", "Deleted batch X." or "Moved N students to Y and deleted batch X.").
   - Focus moves to the new or renamed row, or to the "Your batches" heading after a delete.
   - New batches are opened on Home, and deleted batches are removed from Home's open set.

### 5.5 Message batch

**Files:** `src/screens/MessageScreen.tsx`, `src/lib/messages.ts`, `src/App.tsx` (screen `{ name: 'message', batchId }`)

1. Opened from **Message batch** at the foot of an open batch panel on Home (only for batches with students). Back, **Cancel** and **Back to home** return to Home with focus on that button. Nothing is stored; leaving the screen drops the message and any progress.
2. **Recipients** (`batchRecipients`): one per guardian phone, so siblings who share a number get one message. Students without a valid 10-digit phone are listed under **Will be skipped**.
3. **Compose:**
   - "Goes to N guardians in {batch}." (or a Note when no one has a phone number).
   - **Quick templates** ("Class cancelled tomorrow", "Holiday notice", "Test on…") replace the message with editable text signed with the tutor's name. A `role="status"` line confirms, and mentions any `[bracketed]` parts to replace.
   - **Message:** a labelled textarea. Its help text asks to replace `[brackets]` when any are left. "Write a message first." appears after blur or on either action, linked with `aria-describedby`, and focus moves to the field.
   - **Copy message** uses the Clipboard API, or a hidden textarea with `execCommand('copy')` on plain-http origins. **Send one by one** is `aria-disabled` until there's a message and at least one recipient.
4. **Send one by one:**
   - Shows "3 of 8", a progress bar, the guardian (or "{student}'s guardian"), their students and number, then the full list with **Sent**, **Skipped**, **Now** or **Waiting** for each.
   - **Send on WhatsApp** (dock, primary) is a `wa.me/91…` link with the message. Once tapped it becomes **Next** (marks Sent) beside **Skip**, with an **Open WhatsApp again** link. Skip is also available before sending.
   - Each step is announced in a visually hidden `role="status"` region, and focus returns to the dock's main action.
   - **Stop sending** ends early.
5. **Summary:** "All done" or "Stopped sending" (focused), with Sent, Skipped and Not sent counts, the list and the skipped students. **Copy message** stays available for anyone missed.

### 5.6 Students tab

**Files:** `src/screens/StudentsScreen.tsx`, `src/components/BottomNav.tsx`, `src/App.tsx` (`studentQuery`, `studentBatch`, `showLeft`, kept while a student is open)

1. **Search** (labelled, `type="search"`) matches student or guardian name, case-insensitive. **Batch** is a native select: All batches, then each batch. Both sit in a `role="search"` region.
2. **Show students who left (N)** is a checkbox, shown only when someone has left. Students who left are hidden by default.
3. **Count** (`role="status"`, so changes are announced): "12 students.", "3 students match.", "No students match.", plus "2 who left are hidden." when the search would also match hidden students.
4. **Roster:** sorted by name. Each row is one button opening the edit form, showing the name (with a **Left** badge), class · batch, "₹1,500 a month · Due on the 10th", and the leaving date for students who left.
5. **Add student** sits beside the count; **Manage batches** sits at the foot. With no students at all, the screen shows a short empty state with Add student.

### 5.7 Settings tab

**Files:** `src/screens/SettingsScreen.tsx`, `src/lib/fees.ts` (template), `src/lib/appData.ts` (`parseAppData`, `clearAppData`), `src/App.tsx` (`restoreData`, `deleteAllData`, the unsaved-changes check in `switchTab`)

Five numbered sections. Sections 1–3 are separate forms, each with its own Save button and a `role="status"` line ("Details saved.", or "Not saved yet." while it differs from what's stored). Pressing Save with errors shows them and focuses the first one; after a save, focus stays on the Save button.

1. **Your details:** name, phone and UPI ID, validated as in setup. **Test payment link** (only while the UPI ID field holds a valid ID) is a `upi://pay` link for ₹1 to that ID, so the tutor can check that it opens her payment app.
2. **Reminder message:** a textarea holding the fee reminder template. Placeholder chips (`{guardianName}`, `{studentName}`, `{month}`, `{amount}`, `{dueDate}`, `{tutorName}`, `{tutorPhone}`) insert at the cursor and put it back after the token.
   - A missing guardian name drops `{guardianName}` and the space before it.
   - Unknown `{tokens}` get a warning (they're sent as typed).
   - An empty message can't be saved.
   - The live preview uses a sample student (Mrs Sharma / Aarav, the default fee or ₹1,500, the default due day this month).
   - **Reset to default** refills the default; Save keeps it. A template equal to the default is stored as `null`.
   - The UPI link is always appended by `fillReminder` when a UPI ID is set.
3. **Defaults for new students:** monthly fee (optional) and due day (1–31). The Add student form pre-fills them (`StudentScreen` `defaults` prop); Edit is unaffected.
4. **Backup:**
   - **Export backup** downloads `tuition-backup-YYYY-MM-DD.json` (`{ app, exportedAt, data }`) and stores `lastExportAt`. The section shows the last backup date, plus a Note when there are students and it has been over 30 days or never.
   - **Restore from backup** opens a file picker. The file is size-checked (5MB), parsed and validated with `parseAppData`, so older versions upgrade and anything else is rejected with an error linked to the button.
   - A valid file opens an inline confirmation (file name, export date, student, batch and fee-record counts). Focus goes to **Cancel**, and Escape cancels.
   - **Replace my data** saves it, remounts Settings, focuses the Backup heading and announces "Backup restored: …".
5. **Danger zone:** **Delete all data** opens a confirmation that lists what will go, offers **Export backup first**, and needs **DELETE** typed in the focused field. **Delete everything** stays `aria-disabled` until then, and pressing it early explains why. Confirming clears storage, resets history and the in-memory state, and shows Setup with focus on its heading.

**Leaving with unsaved changes:** switching tabs asks with `window.confirm` (naming the sections). Reloading or closing the page triggers the browser's own prompt (`beforeunload`).

## 6. Data flow

```
SetupScreen ─ submit → AppData ─ saveAppData() → localStorage["tuition-app:v1"]
                                └─ onComplete(data) → App.data
StudentScreen ─ onSave/onDelete → App.commit(next) ─ saveAppData() → localStorage
                                                   └─ App.data → HomeScreen props
BatchesScreen / StudentScreen ─ create / rename / delete → App.createBatch / renameBatch / deleteBatch ─ persist() → localStorage
HomeScreen ─ Mark paid / unpaid → App.setPaid(student, month, paid) ─ saveAppData() → localStorage
                                                                   └─ list view transition → App.data
App on load ─ loadAppData() ← localStorage
              (null if missing or corrupt; v1/v2 records get students: [] / payments: [];
               v3 students get joinedOn = local date of createdAt and feeDueDay = 1; payments kept;
               v4 students get leftOn = null; v5 records get settings = DEFAULT_SETTINGS)
```

The stored record looks like this:

```ts
{
  version: 6,
  tutor: { name: string, phone: string /* 10 digits */, upiId: string | null },
  batches: { id: string, name: string }[],
  students: {
    id: string, name: string, className: string | null, batchId: string,
    guardianName: string | null, guardianPhone: string /* 10 digits */,
    monthlyFee: number /* whole ₹ */, joinedOn: string /* "YYYY-MM-DD", fees start this month */,
    feeDueDay: number /* 1–31; shorter months use their last day */,
    leftOn: string | null /* "YYYY-MM-DD"; shown on Fees through this month, then hidden */,
    createdAt: string, updatedAt: string
  }[],
  payments: { studentId: string, month: string /* "YYYY-MM" */, amount: number, paidAt: string }[],
  // no payment for a student+month = due or upcoming, by the due date
  settings: {
    reminderTemplate: string | null /* null = DEFAULT_REMINDER */, defaultFee: number | null,
    defaultDueDay: number /* 1–31 */, lastExportAt: string | null /* ISO */
  },
  setupCompletedAt: string // ISO date
}
```

When this shape changes, bump `version` and add a migration in `loadAppData()`.
