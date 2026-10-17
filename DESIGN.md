---
name: Tuition app
description: A phone-first tool for Indian private tutors, set like the NCERT textbook they teach from.
colors:
  ncert-teal: "#0f6e7a"
  ncert-teal-deep: "#0b4f58"
  teal-wash: "#e3f2f3"
  teal-mist: "#f1f8f8"
  marigold: "#f4b63f"
  marigold-tint: "#fdf0d2"
  marigold-ink: "#5c3d00"
  ink: "#1a1a1a"
  ink-muted: "#4d5b5e"
  ink-placeholder: "#6b7778"
  rule: "#9db8bb"
  rule-soft: "#e3e9ea"
  error-red: "#b3261e"
  error-wash: "#fdf1f0"
  page: "#ffffff"
typography:
  display:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "clamp(5rem, 24vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.78
    letterSpacing: "-0.04em"
    fontFeature: "lnum"
  headline:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 7.4vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
  section-number:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 800
    fontFeature: "tnum"
  label:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  button-large:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
  body:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  input:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
  small:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
rounded:
  page: "6px"
  knockout: "10px"
spacing:
  gutter: "20px"
  section-hang: "40px"
  section-gap: "28px"
  field-gap: "8px"
  row-gap: "14px"
  tap: "48px"
  column: "34rem"
components:
  button-primary:
    backgroundColor: "{colors.ncert-teal}"
    textColor: "{colors.page}"
    typography: "{typography.button-large}"
    rounded: "{rounded.page}"
    height: "56px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.ncert-teal-deep}"
  button-primary-disabled:
    backgroundColor: "{colors.rule-soft}"
    textColor: "{colors.ink-muted}"
  button-secondary:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ncert-teal}"
    typography: "{typography.button-large}"
    rounded: "{rounded.page}"
    height: "56px"
  button-secondary-hover:
    backgroundColor: "{colors.teal-mist}"
  button-secondary-active:
    backgroundColor: "{colors.teal-wash}"
  button-text:
    textColor: "{colors.ncert-teal}"
    typography: "{typography.label}"
    rounded: "{rounded.page}"
    padding: "0 12px 0 8px"
    height: "{spacing.tap}"
  button-text-hover:
    backgroundColor: "{colors.teal-mist}"
  button-danger-text:
    textColor: "{colors.error-red}"
    typography: "{typography.label}"
    rounded: "{rounded.page}"
    padding: "0 12px 0 8px"
    height: "{spacing.tap}"
  button-danger-text-hover:
    backgroundColor: "{colors.error-wash}"
  button-danger:
    backgroundColor: "{colors.error-red}"
    textColor: "{colors.page}"
    typography: "{typography.label}"
    rounded: "{rounded.page}"
    padding: "0 18px"
    height: "{spacing.tap}"
  button-fab:
    backgroundColor: "{colors.ncert-teal}"
    textColor: "{colors.page}"
    rounded: "{rounded.knockout}"
    size: "72px"
  button-fab-hover:
    backgroundColor: "{colors.ncert-teal-deep}"
  button-icon:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.page}"
    size: "{spacing.tap}"
  button-icon-hover:
    backgroundColor: "{colors.teal-mist}"
    textColor: "{colors.ncert-teal}"
  button-icon-danger-hover:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.error-red}"
  button-small:
    typography: "{typography.label}"
    rounded: "{rounded.page}"
    height: "{spacing.tap}"
  input-text:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    typography: "{typography.input}"
    rounded: "{rounded.page}"
    padding: "0 14px"
    height: "52px"
  input-select:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    typography: "{typography.input}"
    rounded: "{rounded.page}"
    padding: "0 44px 0 14px"
    height: "52px"
  input-affix:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    typography: "{typography.input}"
    rounded: "{rounded.page}"
    padding: "0 14px 0 32px"
    height: "52px"
  delete-confirm:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    padding: "14px"
  inline-editor:
    backgroundColor: "{colors.teal-mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    padding: "14px"
  inline-status:
    textColor: "{colors.ncert-teal-deep}"
  manage-batch-open:
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    padding: "6px 8px"
    height: "56px"
  manage-batch-open-hover:
    backgroundColor: "{colors.teal-mist}"
  manage-batch-open-active:
    backgroundColor: "{colors.teal-wash}"
  student-open:
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    padding: "4px 8px"
    height: "{spacing.tap}"
  student-open-hover:
    backgroundColor: "{colors.teal-mist}"
  student-open-active:
    backgroundColor: "{colors.teal-wash}"
  status-badge-pending:
    backgroundColor: "{colors.marigold-tint}"
    textColor: "{colors.marigold-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.page}"
    padding: "3px 8px"
  status-badge-paid:
    backgroundColor: "{colors.teal-wash}"
    textColor: "{colors.ncert-teal-deep}"
    typography: "{typography.caption}"
    rounded: "{rounded.page}"
    padding: "3px 8px"
  row-action-primary:
    backgroundColor: "{colors.ncert-teal}"
    textColor: "{colors.page}"
    typography: "{typography.label}"
    rounded: "{rounded.page}"
    padding: "0 14px"
    height: "{spacing.tap}"
  row-action-primary-hover:
    backgroundColor: "{colors.ncert-teal-deep}"
  row-action-secondary:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ncert-teal}"
    typography: "{typography.label}"
    rounded: "{rounded.page}"
    padding: "0 14px"
    height: "{spacing.tap}"
  row-action-secondary-hover:
    backgroundColor: "{colors.teal-mist}"
  row-action-quiet:
    textColor: "{colors.ncert-teal}"
    typography: "{typography.label}"
    rounded: "{rounded.page}"
    padding: "0 8px"
    height: "{spacing.tap}"
  row-action-quiet-hover:
    backgroundColor: "{colors.teal-mist}"
  row-action-quiet-active:
    backgroundColor: "{colors.teal-wash}"
  month-step:
    textColor: "{colors.page}"
    rounded: "{rounded.page}"
    size: "{spacing.tap}"
  month-label:
    textColor: "{colors.page}"
    typography: "{typography.title}"
    width: "8.5em"
  summary-cell:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "10px 10px 12px"
  filter-tab:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    height: "{spacing.tap}"
  filter-tab-hover:
    backgroundColor: "{colors.teal-mist}"
  filter-tab-selected:
    textColor: "{colors.ncert-teal-deep}"
  filter-count:
    backgroundColor: "{colors.rule-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.page}"
    padding: "0 6px"
  filter-count-selected:
    backgroundColor: "{colors.teal-wash}"
    textColor: "{colors.ncert-teal-deep}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    typography: "{typography.small}"
    rounded: "{rounded.page}"
    padding: "6px 6px 6px 16px"
    height: "56px"
  toast-action:
    textColor: "{colors.teal-wash}"
    rounded: "{rounded.page}"
    padding: "0 14px"
    height: "{spacing.tap}"
  batch-toggle:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.page}"
    padding: "10px 8px"
    height: "60px"
  batch-toggle-hover:
    backgroundColor: "{colors.teal-mist}"
  chapter-band:
    backgroundColor: "{colors.ncert-teal}"
    textColor: "{colors.page}"
    padding: "32px 20px 28px"
  note-box:
    backgroundColor: "{colors.marigold-tint}"
    textColor: "{colors.marigold-ink}"
    typography: "{typography.small}"
    rounded: "{rounded.page}"
    padding: "10px 12px"
---

# Design System: Tuition app

## Overview

**Creative North Star: "The NCERT Textbook"**

Every screen reads like an interior page of the NCERT book the tutor already teaches from: a white offset-print page, a deep teal chapter band across the top, and content set as short numbered sections hanging off a teal gutter number. It is a printed world, not a software one. The page is flat, the ink is near-black, and there are only two inks of colour: NCERT teal for structure and every interactive accent, and marigold as the second ink for the Setup chapter numeral and Note boxes.

Density is calm and finite. One reading column, generous tap targets, sections that tell the reader how much is left. The system explicitly refuses the generic SaaS signup made of floating rounded fields on white: fields here are crisp outlined boxes sitting in the text column like answer blanks in a workbook, not cards.

The world is light-only by intent. It is used indoors, by day and under tube light, and it is meant to look printed.

**Key Characteristics:**
- Full-bleed teal chapter band opens every screen, with a heavy Mukta headline in white.
- A solid marigold display numeral on the band opens the first chapter only (1 on Setup); every other screen's band has no numeral.
- Section numbers (1.1, 1.2... in a chapter, 1 / 2 / 3 in other forms) in teal hang in a 40px gutter left of each section; lists of peers sit on the 20px page edge, unnumbered.
- Marigold-tinted Note boxes with a bold "Note" lead, no side stripe.
- 1.5px teal-grey outlined inputs, 52px tall, small 6px corners.
- Primary action pinned in a bottom dock at thumb height, with a plain-language hint line under it (or, on Home, a knocked-out teal Add block).
- Lucide line icons throughout; motion is print-like: the band prints in on first launch, the chapter turns between screens, rows unroll and roll shut.

## Colors

Two printing inks on white paper: NCERT teal carries structure and interaction, marigold is the second ink, and everything else is ink, rule and paper.

### Primary
- **NCERT Teal** (ncert-teal): the chapter band background, section numbers, the count in the Manage batches heading, the primary button, the floating Add block, the secondary button's outline and label, text buttons, the batch chevron, the confirmation icon, caret, focus outline and the browser theme colour. Teal means "structure" or "you can act here".
- **Deep Chapter Teal** (ncert-teal-deep): hover state of the primary button, the floating Add block and the Mark paid row action; the Home confirmation line and the inline status line; the selected filter tab; text colour on teal-wash selections (selected count chip, Paid badge).
- **Teal Wash** (teal-wash): the 3px focus halo around inputs, pressed state of text, icon and secondary buttons, batch headers and student rows, text selection, and the supporting line inside the chapter band. It also fills the Paid badge and the selected filter count chip, and is the Undo label on the ink toast.
- **Teal Mist** (teal-mist): hover fill for text, icon and secondary buttons, batch headers, student rows, Manage batches rows, filter tabs and the Remind and Mark pending row actions; the fill of the inline name editor panel.

### Secondary
- **Marigold** (marigold): the second ink. Used solid only as the Setup chapter numeral on the teal band, where it reads as print.
- **Marigold Tint** (marigold-tint): Note box background; the Pending status badge.
- **Marigold Ink** (marigold-ink): Note box and Pending badge text; the dark brown that keeps marigold surfaces legible. On white it sets one figure only: the Pending amount in the summary strip.

### Neutral
- **Page White** (page): the paper; every surface, input fill, dock background, the secondary button fill and the 4px knockout border around the floating Add block. On the teal band it is the month label and month chevrons, with a white-alpha hover (rgb(255 255 255 / 0.12)); the same alpha is the hover on the toast's Undo.
- **Ink** (ink): body text; the flat toast block.
- **Muted Ink** (ink-muted): help text, "(optional)", Setup batch-row labels, CTA hint, icon buttons at rest, disabled CTA text, the select chevron, the ₹ affix, a student's class and fee line, the edit cues at rest (ChevronRight on student rows, Pencil on Manage batches rows), batch counts, the empty-batch line, summary captions and units, and filter tabs at rest.
- **Placeholder Ink** (ink-placeholder): input placeholders, and a select's prompt while nothing is chosen.
- **Teal-Grey Rule** (rule): input outlines at rest; the top and bottom rule of the summary strip; scrollbar thumb.
- **Soft Rule** (rule-soft): hairline dividers (dock top edge, student rows, the empty-batch block, the delete zone, the filter tab baseline, the summary cell dividers), the disabled CTA fill and the filter count chip at rest.
- **Red Ink** (error-red): error text, error icon, invalid input border and its 2px focus outline; the delete text button, the solid Delete and "Move and delete" buttons, and the Manage batches trash icon on hover or while its confirm is open. Never any other action.
- **Error Wash** (error-wash): focus halo on an invalid input; the inline delete-confirm box; hover fill of the delete text button and of the Manage batches trash icon (also its fill while its confirm is open).

### Named Rules
**The Two Inks Rule.** Teal and marigold are the only colours on the page beyond ink, rules and red error ink. New accents are not introduced.

**The Marigold Is Print Rule.** Solid marigold appears only on the teal band (the Setup chapter numeral). On white it is always a tint (marigold-tint) carrying marigold-ink text; never set solid marigold as text or as a control on white, which fails legibility. Marigold-ink is the one marigold text colour: on the tint, or on white for the Pending amount.

**The Teal Means Act Rule.** Every interactive affordance resolves to teal on hover or focus: input borders, text buttons, icon buttons, secondary buttons, batch headers, student rows, filter tabs, row actions, the CTA and the floating Add block. The one exception is delete, which stays in red ink. On a teal or ink ground (the band, the toast) teal cannot read, so controls there go white or teal-wash with a white-alpha hover.

## Typography

**Display Font:** Mukta (with system-ui, sans-serif)
**Body Font:** Mukta (with system-ui, sans-serif)

**Character:** One Indian-made sans in three weights (400, 600, 800, Latin subset via @fontsource). Heavy 800 does the textbook-heading work; 600 labels; 400 reads.

### Hierarchy
- **Display** (800, clamp(5rem, 24vw, 6rem), 0.78, -0.04em, lining numerals): the marigold Setup chapter numeral only.
- **Headline** (800, clamp(1.75rem, 7.4vw, 2.25rem), 1.08, -0.012em, balanced wrap): the white heading inside the chapter band.
- **Title** (800, 1.25rem, 1.25): in-page headings: numbered group legends in forms, batch names on Home, the "Your batches" heading on Manage batches (with its count in teal, tabular), the empty-Home title (line-height 1.2). The same cut sets the white month label in the band and the summary figures (tabular, line-height 1.2).
- **Section number** (800, 0.95rem, tabular numerals, teal): 1.1 to 1.n in a chapter, or 1 / 2 / 3 beside a group legend, hanging in the gutter (dropped 5px to sit on a Title legend's first line).
- **Label** (600, 1rem, 1.3): field and section labels, text buttons, danger buttons, Keep and Delete in the confirm box, row actions, and filter tabs (800 when selected). The toast's Undo uses 1rem at 800.
- **Large button** (600, 1.125rem): the CTA and the full-height (56px) secondary button.
- **Caption** (600, 0.875rem, muted ink): the small label above each Setup batch row and each summary caption (line-height 1.3). Status badges and filter count chips use the same size and weight in their own colours.
- **Body** (400, 17px root, 1.45): running text; inputs at 1.0625rem so iOS never zooms on focus. Student names in rows use 600 at the input size (1.0625rem, 1.3); batch names on Manage batches use the same 600 at 1.0625rem. Batch names, on Home and Manage batches, wrap balanced.
- **Small** (400, 0.9375rem, 1.4): help text, Note boxes, CTA hint, a student's class, and errors (errors at 600). Batch counts on Home ("N students"), the Home confirmation line, the inline status line and the summary unit ("pending") use it at 600; the Manage batches count stays at 400. The toast message uses it at line-height 1.35.

### Named Rules
**The Heavy Heading Rule.** Headings are Mukta 800, never a lighter display cut and never a second family.

**The Numbered Section Rule.** Section numbers are teal, 800, tabular, and hang outside the text column; they are never inline with the label or boxed. A chapter numbers its sections 1.1 to 1.n; a non-chapter form numbers its groups 1 / 2 / 3, the number hanging beside a Title-size group legend. Lists of peers, such as batches and students, are never numbered and never hang: they sit on the 20px page edge. The 40px hang exists only where a number sits in it.

## Layout

A single centred reading column (max 34rem) with a 20px page gutter, mobile-first and one-handed. The chapter band is full-bleed; its content sits in the same column with the 20px gutter applied inside the column, so on wide screens band text lines up exactly with the page text below. Below it, numbered sections (Setup 1.1 to 1.4, the student form's 1 / 2 / 3 groups) are indented 40px with the section number absolutely placed in that hang, and sections are separated by 28px. The hang is reserved for a number: lists (Home's batch groups and student rows, the Manage batches list) sit on the normal 20px page edge, aligned with the summary strip and the filter tabs. This was a user decision. Within a section: label, 8px, field, 8px, help/Note/error. Repeated rows are spaced 14px. All tap targets are at least 48px; inputs are 52px, the CTA 56px.

The primary action lives in a sticky bottom dock: white page, a soft-rule hairline on top, 12px top padding and 14px plus the safe-area inset below. When the task needs a way out, the dock holds two buttons on a 1fr / 2fr grid with a 10px gap: Cancel (outlined secondary) then Save (primary). Safe-area insets are respected top (band) and bottom (dock). On wide screens the column simply centres; there is no multi-column layout.

Home has no dock. Its one primary action (Add student) is the floating Add block at thumb height, fixed 16px plus the safe-area inset from the bottom and aligned to the gutter; the body keeps 112px plus the safe-area inset of bottom room so it never covers the last row. From 46rem up the block moves out into the right margin, 88px beyond the column edge. With no students, the Add button is instead a full-width CTA pushed to the bottom of the body for thumb reach.

With students, Home reads top to bottom: the band (holding the month switcher), the confirmation line, the summary strip (16px below), the filter tabs (8px below), then the tab panel of batch groups. Keyboard scrolling keeps focused rows clear of the toast and the Add block: while the block is on screen the page has a 104px (plus safe-area inset) scroll-padding-bottom. The toast is fixed 20px plus the safe-area inset from the bottom; on phones it runs from the left gutter to 84px short of the right gutter, leaving the Add block clear, and from 46rem it spans the column inside the gutters. The same 46rem breakpoint puts each student row on one line. Below the batch list, 20px down, sits the Manage batches text button.

Manage batches reads top to bottom: the band (no numeral), the body 12px below it with the confirmation line, the "Your batches" heading (8px above the list), the hairline list, the last-batch Note box (12px below, when it applies), the Add batch text button (16px below), then a dock holding the single Done CTA.

**The Thumb Dock Rule.** A screen's one primary action sits full-width in the bottom dock, with a hint line under it that says, in plain words, what is still missing or what will happen. When the task needs a way out, the dock may pair it with Cancel (outlined secondary, 1fr) beside Save (primary, 2fr), hint line still underneath; it is still one primary action.

## Elevation & Depth

Flat, like a printed page. There are no drop shadows anywhere. Depth is expressed by ink: the teal band, the marigold tint, hairline rules. The only box-shadow in the system is the 3px focus halo on inputs (teal-wash, or error-wash when invalid), which is a state ring, not elevation. The floating Add block, the one element that sits over content, is separated by a print knockout (a 4px page-white border), not a shadow. The toast, the other element that floats, is a flat block of ink with no shadow; its contrast with the paper is the separation.

**The Printed Page Rule.** Surfaces never lift. If something needs separation, use a soft-rule hairline or a tint, not a shadow.

## Shapes

One small radius (6px) everywhere a corner exists: inputs, buttons, icon buttons, row actions, Note boxes, the delete-confirm box, batch headers, student rows, status badges, count chips and the toast. Filter tabs round only their top corners (6px 6px 0 0) so they sit square on their baseline. The summary strip has no corners at all: it is ruled, not boxed. The chapter band is square and full-bleed. Borders are 1.5px on inputs and the secondary button, and 1px for hairline dividers.

**The Knockout Exception.** The floating Add block is the one 10px outer radius: a 72px teal block inside a 4px page-white knockout border, so the teal itself still reads as an about-6px corner. It is not licence for larger radii anywhere else. Note boxes have no border and no side stripe; the tint is the container.

## Components

### Buttons
- **Shape:** gently squared corners (6px).
- **Primary:** full-width, 56px, NCERT teal with white large-button text. Hover deepens to deep chapter teal; press scales to 0.985 over 120ms. Disabled turns soft-rule with muted ink and stays visibly disabled until required fields are valid. Save student uses aria-disabled instead of disabled: it looks identical (soft-rule, muted ink, not-allowed cursor, no hover or press), but it stays pressable, and pressing it reveals the errors and focuses the first invalid field. Can carry a leading Lucide Plus (22px) when it adds something.
- **Secondary (outlined):** 56px, page-white fill, 1.5px NCERT teal outline, teal large-button label. Hover teal-mist; press teal-wash and the same 0.985 scale. Used for Cancel in the two-button dock. The small size (48px, label-size 1rem text) sets Keep and Cancel in the delete confirm and Cancel in the inline name editor; the primary takes the same small size as the editor's save.
- **Text button:** teal 600 label with a leading Lucide icon (Plus, 20px; Settings2, 20px, for Manage batches), transparent at rest, 48px tall, nudged -8px so its icon aligns with the column; teal-mist on hover, teal-wash on press.
- **Danger text button:** the text button in red ink (Lucide Trash2, 20px, 8px gap), error-wash on hover and press. Delete only.
- **Danger button (solid):** 48px, red-ink fill, white label text, 18px side padding, 0.985 press scale, red focus outline. Only as the final Delete inside the confirm box.
- **Floating Add block:** 72px NCERT teal square with a 4px page-white knockout border (10px outer radius), white Lucide Plus (28px), no shadow. Hover deep chapter teal; press scales to 0.96 over 120ms. Labelled "Add student" for assistive tech.
- **Icon button:** 48px square, transparent, muted ink Lucide icon (X, 22px); hover teal-mist with teal icon, press teal-wash. The delete variant (Trash2, 20px, Manage batches) turns red ink on error-wash on hover and while its confirm is open (aria-expanded).
- **Focus:** 2px teal outline, 2px offset (global, on :focus-visible). Controls on the teal band use a white outline; the toast's Undo uses a teal-wash one.

### Inputs / Fields
- **Style:** white fill, 1.5px teal-grey rule outline, 6px radius, 52px tall, 14px side padding, teal caret, placeholder ink.
- **Hover / Focus:** border turns teal; focus adds a 3px teal-wash halo instead of an outline. Fields use :focus, not :focus-visible, so a field focused by script (the first invalid field after pressing Save) shows it too, selects included. Transitions run 160ms on the exponential ease-out.
- **Error:** border turns red ink; focus halo becomes error-wash, and on top of it an invalid focused field gets a 2px red-ink outline at 2px offset. The message sits directly under the input in red ink, 600, with a 16px Lucide CircleAlert, and is linked via aria-describedby.
- **Select:** the native select (the phone's own picker) dressed as the text input: same box, no native arrow, 44px right padding and a muted Lucide ChevronDown (20px) drawn 14px from the right. While nothing is chosen its disabled prompt option reads in placeholder ink.
- **Leading affix:** a unit such as ₹ sits inside the input 14px from the left, muted ink, 600, at the input size; the value starts at 32px and uses tabular numerals.

### Chapter Band
One shared component opens every screen; screens never restyle it locally. Full-bleed NCERT teal header: white headline, optional teal-wash supporting line, 32px plus safe-area top and 28px bottom padding. Its content sits in the reading column with the 20px gutter inside the column, so band text aligns with the page column at every width. The marigold display numeral belongs to the first chapter only: Setup passes "1"; Home, the student form and any later screen pass no numeral and the band carries just its text. Where present it sits bottom-right, its baseline tucked to the band edge (-2px). The numeral is decorative and hidden from assistive tech; the headline can take programmatic focus after a screen change, with no visible outline. The band takes optional children, set in its text block under the headline, for controls that belong in the band (Home's month switcher); screens add to the band this way rather than restyling it. The band, its text block and its numeral carry stable view-transition names (chapter-band, chapter-text, chapter-numeral) so they persist across screen changes.

### Numbered Section
A label row with a teal section number hanging in the 40px gutter, then the field, then help text, a Note box or an error. Repeating groups use a fieldset with the number on the legend. In a non-chapter form (the student form) each group is a fieldset whose legend is a Title-size heading with its number 1 / 2 / 3 hanging beside it; the group's fields are unnumbered, 14px below the legend and 20px apart.

### Inline Delete Confirm
One shared style, used by the student form and Manage batches. In the student form, delete lives below the form, away from Save: a delete zone 36px down, with a soft-rule hairline above, 20px top padding, hung on the 40px gutter. It starts as the danger text button. Tapping it replaces the button in place with a confirm box: error-wash fill, 6px radius, 14px padding, the question in ink at 600 ("Delete Name? This can't be undone."), then Keep (secondary) and Delete (solid danger) on two equal columns, 10px gap, 12px below. Focus moves to Keep. The box opens with a 4px drop and fade (200ms, exponential ease-out); under reduced motion it only fades. Manage batches uses the same box inside a row (variants below).

### Note Box
Marigold-tint fill, marigold-ink text at the small size, 10px by 12px padding, 6px radius, a bold "Note" lead word. No border, no stripe.

### Batch Group
Home groups students by batch. Each group sits on the 20px page edge, aligned with the summary strip and tabs, unnumbered and not hung (see the Numbered Section Rule), 8px from the next. The header is a heading wrapping one full-width toggle (at least 60px, 10px by 8px padding, bled 8px either side so its text stays on the column): the batch name in Title with balanced wrapping, the count "N students" in muted ink at small size 600 with tabular numerals, and a teal Lucide ChevronDown (22px) that rotates 180° when open (220ms, exponential ease-out). Hover teal-mist, press teal-wash, focus outline inset 2px. The toggle carries aria-expanded and controls its panel.

The panel unrolls with the world's row motion: grid-template-rows 0fr to 1fr, 280ms exponential ease-out to open and 200ms ease-in to close, with 12px of bottom room when open. Under reduced motion the panel and chevron change instantly. A closed panel is inert, so nothing inside takes focus. With a single batch it starts open; with several, all start closed. Saving a student opens the batch they landed in. The Manage batches text button (Settings2) sits 20px below the last group; on the empty Home it sits centred, 12px below the Add student CTA.

### Month Switcher
Home's band carries the month being tracked, as band children under the headline: a white Lucide ChevronLeft and ChevronRight (24px) in 48px steps either side of the month label ("October 2026"), Title type in white, centred, at least 8.5em wide so the steps don't shift between months. Steps are transparent with a white-alpha hover (rgb(255 255 255 / 0.12)) and a white focus outline; at the ends of the range they are disabled at 0.35 opacity. The range runs from the earliest join month to the current month. The label is aria-live so the new month is announced; each step's label names the month it goes to. The row sits 8px under the headline and is pulled 12px left so the first chevron's glyph lines up with the band text.

### Summary Strip
The month's fees as a small printed table, not dashboard tiles: a three-column description list (Collected / Pending / Students) between a teal-grey rule top and bottom, cells divided by soft-rule hairlines, padded 10px on top and sides and 12px below (the first cell flush to the column). Each cell's caption is Caption (0.875rem 600, muted ink); its figure is 1.25rem 800, tabular, 2px below. The Pending amount is set in marigold ink. The Students cell shows the pending count with a smaller muted unit ("pending", 0.9375rem 600). The strip is labelled "Fees for <month>".

### Filter Tabs
WAI-ARIA tabs (All / Pending / Paid; Pending is the default) on three equal columns over a soft-rule baseline, 48px tall, 8px above the panel. At rest a tab is muted ink at 600 with a teal-mist hover; selected it turns deep chapter teal at 800 with a 3px teal underline bar sitting on the baseline, inset 8px either side. Each tab carries a count chip (0.875rem 600, tabular, 6px radius, at least 24px wide): soft-rule fill with ink text, or teal-wash with deep teal when selected. Only the selected tab is in the tab order; Arrow keys move and select, Home and End jump to the ends, and focus outlines sit inset 2px. With nothing to show, the panel reads a deep teal 600 line with a 20px CircleCheck.

### Status Badge
A month's status is always a word plus an icon, never colour alone: 0.875rem 600, 3px by 8px padding, 4px icon gap, 6px radius, set at the row's end (justify-self end). Pending is marigold tint with marigold ink and a Lucide Clock (16px); Paid is teal wash with deep teal and a Lucide Check (16px).

### Student Row
Plain ruled rows on the 20px page edge (no hang): a soft-rule hairline above the list and under every row. No cards. Each row (10px top, 12px bottom padding, 8px by 12px gaps) holds three parts:

- **Edit button:** the name at 600, 1.0625rem, with an inline muted Lucide ChevronRight (18px) as the edit cue, so the row reads as openable without hover; on hover the cue turns teal and nudges 2px right (160ms). Beneath it the meta line in muted small text, class then fee ("Class 8 · ₹1,500"), the fee at 600 in ink with tabular numerals, formatted in rupees with Indian digit grouping and no decimals (₹1,500, ₹1,25,000). At least 48px, 4px by 8px padding bled 8px out; hover teal-mist, press teal-wash, focus outline inset 2px. Screen readers hear "Edit Name ... per month".
- **Status badge** (above).
- **Row actions:** 48px, 6px radius, 1rem 600, 14px side padding, 6px icon gap, 0.985 press scale. Mark paid is solid teal with white text, deep teal on hover. Remind is an outlined teal link (page-white fill, 1.5px teal border, teal-mist hover) with a Lucide MessageCircle (18px), opening WhatsApp. Mark pending is a quiet teal text button (8px padding, nudged 8px out): teal label, teal-mist hover, teal-wash press, never muted.

On phones the row is a grid of 'open badge' over 'actions actions': a Pending row puts Remind and Mark paid two-up across the full width under the details. A Paid row has only Mark pending, tucked under the badge ('open badge' / 'open actions') so the row stays short. From 46rem everything sits on one line: edit button, badge, then actions. Each row carries the view-transition name row-<id> for the list reflow.

### Manage Batches
A plain chapter for the groups the tutor teaches: the shared band with no numeral ("Manage batches", with a teal-wash supporting line), then a role=status confirmation line (the Home confirmation line's style: "Renamed ...", "Added batch ...", "Moved N students to ... and deleted batch ..."). Under it the heading "Your batches N" in Title 800 with the count in NCERT teal, tabular, 8px above the list; the heading takes programmatic focus after a delete, with no visible outline.

- **List:** hairline-ruled, on the 20px page edge: a soft-rule hairline above the list and under each row, 8px padding inside the row so a roll-shut collapses it too.
- **Rename button:** the whole name area, at least 56px, 6px by 8px padding bled 8px left, 10px gaps: the batch name at 600, 1.0625rem with balanced wrap, then a muted "N students" (small, 400, tabular), then a muted Lucide Pencil (18px) that turns teal on hover. Hover teal-mist, press teal-wash, focus outline inset 2px. It opens the Inline Name Editor in place ("Save name"). Screen readers hear "Rename Name".
- **Delete icon button:** a 48px Trash2 icon button beside it, 4px gap; red ink on error-wash on hover and while its confirm is open. It is not shown when only one batch remains; a marigold Note box then explains that the last batch can be renamed but not deleted.
- **Inline delete confirm:** the shared error-wash box, inside the row (4px above, 6px below). An empty batch asks "Delete batch Name? This can't be undone." with Keep / Delete on equal columns, focus on Keep. A batch with students explains how many it has, then a "Move students to" select (12px below) with a red-ink error if left empty, then Cancel / "Move and delete" on a 1fr 1.6fr grid so the longer label stays on one line; focus goes to the select. Escape cancels and returns focus to the trash button.
- **Add:** an "Add batch" text button (Plus) 16px below the list opens the Inline Name Editor ("Add batch") in its place.
- **Dock:** a single full-width Done CTA, no hint line.

### Inline Name Editor
A name field with its own Save and Cancel, set inside another screen or form: a teal-mist panel (14px padding, 6px radius) holding a label (Label), the 52px text input, an error under it when needed, and a two-up pair 12px below on equal columns with a 10px gap: Cancel (secondary) then the save action (primary), both at the small 48px size. It opens with the input focused and selected. Enter saves and Escape cancels; Enter never submits the enclosing form. Used for "+ New batch" under the batch picker in the student form (saves as "Add batch"), and on Manage batches to rename ("Save name") and add ("Add batch"). It unrolls open with the row motion (see Motion).

### Inline Status Line
A one-line role=status confirmation set next to the control it concerns (for example under "+ New batch" in the student form: "Added batch ..."): deep chapter teal, small size 600, led by a Lucide CircleCheck (16px), 6px gap, 8px above. When empty it stays rendered with no margin, so screen readers keep watching it.

### Toast
A short-lived message with an optional Undo, printed in ink: a flat ink block (no shadow), white small-size text, 6px radius, at least 56px tall, 6px padding with 16px on the left, 8px gap. The Undo action is 48px, transparent, teal-wash at 800 with 14px side padding, a white-alpha hover and press, and a teal-wash focus outline. It stays up 6s, and the timer pauses while the toast is hovered or focused. The toast sits in a polite role=status region; positions are in Layout (left of the Add block on phones, the full column on wide screens). It enters with an 8px rise and fade over 220ms on the exponential ease-out; under reduced motion it only fades.

### Empty States
- **Empty batch:** inside an open batch, a muted "No students yet." line and an "Add to this batch" text button, with soft-rule hairlines top and bottom (12px top, 4px bottom padding).
- **Empty Home (no students):** near the top, a Title "Add your first student", then a marigold Note box 12px below explaining what will appear; the full-width Add student CTA is pushed to the bottom of the body for thumb reach.

### Confirmation Line
A role=status line at the top of Home announces the last change ("Saved Name."): deep chapter teal at small size 600, with a teal Lucide CircleCheck (18px) leading it, 28px tall and 16px above the first group. When empty it collapses to 12px of space.

### Motion
Motion behaves like print: things unroll, ink prints in, pages turn. Nothing bounces, and nothing ever blocks input. Entrances use the exponential ease-out; exits use a plain ease-in and finish faster than the entrance that follows. Other transitions are 120 to 160ms state changes.

- **First-launch opening (chapter band, about 780ms):** the band unrolls downward (clip-path from the top, 520ms); the headline block settles with a 12px rise and fade (520ms, starting at 140ms); then the numeral prints upward like ink (clip-path from the bottom, 480ms, starting at 300ms). All on the exponential ease-out. The form below is visible and usable throughout. Plays only on the first chapter (Setup).
- **Chapter turn (Setup to Home, View Transitions):** the band holds its place (group 420ms, ease-out) while the chapter underneath changes. The old headline lifts away (10px up and fade, 200ms ease-in); the new one rises in (12px, 420ms ease-out, 120ms delay). The Setup numeral turns out upward by 30% of its height (240ms ease-in); Home has no numeral, so nothing turns in (a band that did carry one would turn in from 30% below, 460ms ease-out, 160ms delay). Text snapshots draw at natural size, anchored bottom-left, never stretched. Everything else crossfades: out 180ms, in 300ms after 120ms. The state swap is flushed synchronously inside the transition; browsers without View Transitions swap screens instantly.
- **List reflow (View Transitions, kind "list"):** when a row changes filter (marking paid on the Pending tab), each row, named row-<id>, slides to its new place (group 280ms, exponential ease-out); a row that leaves fades out (160ms ease-in) and a row that arrives fades in (220ms ease-out). html.vt-list turns off the root crossfade for the duration, so the page itself holds still. Skipped entirely under reduced motion: the list just changes.
- **Unroll and roll shut (shared row motion):** one shared utility. A row is a one-row grid; entering, it unrolls (row-unroll: grid-template-rows 0fr to 1fr with fade, 280ms, exponential ease-out); leaving, it rolls shut (row-roll-up: 1fr to 0fr with fade, 200ms ease-in, held at the end). Its child clips only while it moves, so focus rings are never cut off after. Adding a repeated row unrolls it in place and focuses its input; removing rolls it shut. Manage batches rows unroll when a batch is added and roll shut before a delete commits (the delete runs when the roll-up ends). The Inline Name Editor unrolls open the same way (0fr to 1fr, clipping only while moving). Batch panels use the same grammar as a transition, without the fade.

**The Fades Only Rule.** Under prefers-reduced-motion nothing moves through space. The band opening becomes a 240ms fade of the headline and numeral; the chapter turn becomes a 160ms fade-out and 240ms fade-in with no group movement; rows, batch panels, Manage batches rows and the Inline Name Editor appear and disappear instantly (a delete commits at once); the list reflow is skipped; the delete confirm and the toast only fade.

### App Icon and Install Splash
The app installs standalone, portrait, from a web manifest. Background and theme colour are both NCERT teal, so the install splash and status bar read as the chapter band before the first screen paints. The icon (any, maskable, Apple touch and favicon sizes) is a placeholder mark: a solid marigold Mukta numeral 1 on a full teal field, the chapter numeral as the app's mark. It is provisional; a final mark should keep the teal field and marigold-as-print ink.

## Do's and Don'ts

### Do:
- **Do** open every screen with the full-bleed teal chapter band and a Mukta 800 headline in white.
- **Do** number sections in teal hanging in the 40px gutter: 1.1, 1.2... in a chapter, 1 / 2 / 3 beside Title-size group legends in other forms. Set lists of peers on the 20px page edge, unnumbered.
- **Do** use marigold-tint Note boxes with marigold-ink text for asides, led by a bold "Note".
- **Do** put the primary action full-width in the bottom dock with a plain-language hint line under it; when the task needs a way out, pair it with an outlined Cancel at 1fr beside Save at 2fr.
- **Do** place errors directly under their input in red ink with a Lucide icon, linked by aria-describedby.
- **Do** use Lucide line icons and keep tap targets at least 48px.
- **Do** show status as a word plus an icon (Clock for Pending, Check for Paid), never colour alone.
- **Do** give any new motion a prefers-reduced-motion fallback that fades without spatial movement, and keep the exponential ease-out (cubic-bezier(0.16, 1, 0.3, 1)) for entrances.

### Don't:
- **Don't** add drop shadows or floating cards; the page is flat print.
- **Don't** set solid marigold on white or use solid marigold for text; it is the band ink or a tint, and marigold-ink is its only text colour.
- **Don't** add a side stripe or border to Note boxes.
- **Don't** build a dark theme; the world is light-only by intent.
- **Don't** use large or pill radii; corners are 6px. The floating Add block's 10px outer radius is a knockout exception, not a precedent.
- **Don't** put a chapter numeral on any band but Setup's.
- **Don't** use red ink for anything but errors and delete.
- **Don't** introduce a second typeface or a third accent colour.
- **Don't** indent lists on the 40px gutter; it is only for numbered sections.
