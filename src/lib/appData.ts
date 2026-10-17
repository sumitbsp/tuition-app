// Local persistence and validation for the tutor's data.
// Everything lives in one versioned localStorage record so a future
// migration (or a move to IndexedDB / a backend) has a single seam.

export type Batch = {
  id: string
  name: string
}

export type TutorProfile = {
  name: string
  /** 10-digit Indian mobile number, digits only. */
  phone: string
  upiId: string | null
}

export type Student = {
  id: string
  name: string
  /** Free text such as "8", "10" or "KG"; null when not given. */
  className: string | null
  batchId: string
  guardianName: string | null
  /** 10-digit Indian mobile number, digits only. */
  guardianPhone: string
  /** Whole rupees per month. */
  monthlyFee: number
  /** "YYYY-MM-DD" (local). Fees start in this month. */
  joinedOn: string
  /** Day of the month fees are due, 1–31; shorter months use their last day. */
  feeDueDay: number
  /** "YYYY-MM-DD" (local) when marked as left; null while active. Fees stop after this month. */
  leftOn: string | null
  createdAt: string
  updatedAt: string
}

/** One month's fee marked as paid. No record for a month means pending. */
export type Payment = {
  studentId: string
  /** "YYYY-MM" */
  month: string
  /** Whole rupees actually recorded, so later fee changes don't rewrite history. */
  amount: number
  paidAt: string
}

/** Preferences set on the Settings screen. */
export type AppSettings = {
  /** Fee reminder text with {placeholders}; null means the built-in default. */
  reminderTemplate: string | null
  /** Pre-filled in the Add student form; null leaves the fee empty. */
  defaultFee: number | null
  defaultDueDay: number
  /** ISO time of the last "Export backup"; null if never. */
  lastExportAt: string | null
}

export const DEFAULT_SETTINGS: AppSettings = {
  reminderTemplate: null,
  defaultFee: null,
  defaultDueDay: 1,
  lastExportAt: null,
}

export type AppData = {
  version: 6
  tutor: TutorProfile
  batches: Batch[]
  students: Student[]
  payments: Payment[]
  settings: AppSettings
  setupCompletedAt: string
}

/** The key name predates version 2; the version lives inside the record. */
const STORAGE_KEY = 'tuition-app:v1'

let idCounter = 0

/** crypto.randomUUID is unavailable on plain-http LAN origins (phone testing), so fall back. */
export function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  idCounter += 1
  return `id-${Date.now().toString(36)}-${idCounter}`
}

export function loadAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseAppData(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const isString = (value: unknown): value is string => typeof value === 'string'

/**
 * Checks and upgrades a stored record (or a restored backup's data) to the current version.
 * Returns null for anything that isn't an app record, so a bad file can't replace good data.
 */
export function parseAppData(input: unknown): AppData | null {
  if (!isObject(input)) return null
  const data = input as { version?: number } & Partial<Omit<AppData, 'version'>>
  const { tutor } = data
  if (!isObject(tutor) || !isString(tutor.name) || !isString(tutor.phone) || !Array.isArray(data.batches)) return null
  if (!data.batches.every((b) => isObject(b) && isString(b.id) && isString(b.name))) return null
  // Upgrade older records in place; the next save writes the current version.
  // v1 → v2 added students; v2 → v3 added payments; v3 → v4 added joinedOn and feeDueDay;
  // v4 → v5 added leftOn; v5 → v6 added settings.
  const students = data.version === 1 ? [] : data.students
  const payments = data.version === 1 || data.version === 2 ? [] : data.payments
  if (![1, 2, 3, 4, 5, 6].includes(data.version ?? 0) || !Array.isArray(students) || !Array.isArray(payments)) return null
  const studentsOk = students.every(
    (s) => isObject(s) && isString(s.id) && isString(s.name) && isString(s.batchId) && isString(s.guardianPhone),
  )
  const paymentsOk = payments.every((p) => isObject(p) && isString(p.studentId) && isString(p.month))
  if (!studentsOk || !paymentsOk) return null
  return {
    ...(data as Omit<AppData, 'version' | 'students' | 'payments' | 'settings'>),
    version: 6,
    students: students.map(upgradeStudent),
    payments,
    settings: { ...DEFAULT_SETTINGS, ...(isObject(data.settings) ? data.settings : {}) },
  }
}

/** Removes the app record from this device (Settings → Delete all data). */
export function clearAppData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

/** Older students joined on the day they were added, with fees due on the 1st, and are active. */
function upgradeStudent(student: Student): Student {
  return {
    ...student,
    joinedOn: student.joinedOn ?? dateKey(new Date(student.createdAt)),
    feeDueDay: student.feeDueDay ?? 1,
    leftOn: student.leftOn ?? null,
  }
}

/** Local calendar date as "YYYY-MM-DD" (not UTC, so late-evening entries keep their day). */
export function dateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Returns false when storage is unavailable (private mode, quota, blocked site data). */
export function saveAppData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

// --- Validation -----------------------------------------------------------
// Each validator returns an error message, or null when the value is valid.

export function validateName(value: string): string | null {
  return value.trim() ? null : 'Enter your name.'
}

/** Accepts spaces, dashes, and a +91 / 0 prefix; returns the bare 10 digits. */
export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

export function validatePhone(value: string, emptyMessage = 'Enter your phone number.'): string | null {
  const digits = normalizePhone(value)
  if (!digits) return emptyMessage
  if (digits.length !== 10) return 'Enter a 10-digit mobile number.'
  if (!/^[6-9]/.test(digits)) return 'Indian mobile numbers start with 6, 7, 8 or 9.'
  return null
}

export function validateUpiId(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const at = trimmed.indexOf('@')
  if (at <= 0 || at === trimmed.length - 1) {
    return 'A UPI ID looks like name@bank, for example ritu@okaxis.'
  }
  return null
}

export function cleanBatchNames(names: string[]): string[] {
  return names.map((name) => name.trim()).filter(Boolean)
}

export function validateBatches(names: string[]): string | null {
  const cleaned = cleanBatchNames(names)
  if (cleaned.length === 0) return 'Add at least one batch.'
  const lower = cleaned.map((name) => name.toLowerCase())
  if (new Set(lower).size !== lower.length) return 'Each batch needs a different name.'
  return null
}

export function validateStudentName(value: string): string | null {
  return value.trim() ? null : "Enter the student's name."
}

export function validateBatchChoice(batchId: string, batches: Batch[]): string | null {
  return batches.some((batch) => batch.id === batchId) ? null : 'Choose a batch.'
}

/** Accepts "1500", "1,500" or "1 500"; returns whole rupees, or null when not a plain number. */
export function parseFee(value: string): number | null {
  const compact = value.replace(/[\s,]/g, '')
  if (!/^\d+$/.test(compact)) return null
  return Number(compact)
}

export function validateFee(value: string): string | null {
  if (!value.trim()) return 'Enter the monthly fee.'
  const fee = parseFee(value)
  if (fee === null) return 'Use numbers only, for example 1500.'
  if (fee > 999999) return 'That fee looks too high. Check the amount.'
  return null
}

/** "YYYY-MM-DD" that names a real calendar day, or null. */
export function parseDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function validateJoinedOn(value: string): string | null {
  if (!value) return 'Enter the date the student joined.'
  const date = parseDateKey(value)
  if (!date || date.getFullYear() < 2000) return 'Enter a real date, for example 10/10/2026.'
  return null
}

/** Not before the joining date, and not in the future. `today` is "YYYY-MM-DD". */
export function validateLeftOn(value: string, joinedOn: string, today: string): string | null {
  if (!value) return 'Enter the date the student left.'
  if (!parseDateKey(value)) return 'Enter a real date, for example 10/10/2026.'
  if (value > today) return "The leaving date can't be in the future."
  if (value < joinedOn) return "The leaving date can't be before they joined."
  return null
}

/** Whole day of the month, or null when not a plain number. */
export function parseDueDay(value: string): number | null {
  const trimmed = value.trim()
  return /^\d{1,2}$/.test(trimmed) ? Number(trimmed) : null
}

export function validateDueDay(value: string): string | null {
  if (!value.trim()) return 'Enter the day of the month fees are due.'
  const day = parseDueDay(value)
  if (day === null || day < 1 || day > 31) return 'Use a day from 1 to 31.'
  return null
}

// --- Display ---------------------------------------------------------------

const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

/** ₹1,500 · ₹1,25,000 (Indian digit grouping). */
export function formatRupees(amount: number): string {
  return rupees.format(amount)
}

const longDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

/** "2026-10-10" → "10 October 2026" */
export function formatDateLong(key: string): string {
  const date = parseDateKey(key)
  return date ? longDate.format(date) : key
}

/** "8" → "Class 8"; anything else ("KG", "11 Science") is shown as typed. */
export function formatClass(className: string | null): string | null {
  if (!className) return null
  return /^\d{1,2}$/.test(className) ? `Class ${className}` : className
}

export function studentsInBatch(students: Student[], batchId: string): Student[] {
  return students
    .filter((student) => student.batchId === batchId)
    .sort((a, b) => a.name.localeCompare(b.name, 'en-IN', { sensitivity: 'base' }))
}

// --- Batches -----------------------------------------------------------------

/** Required and unique (case-insensitive, ignoring outer spaces). `exceptId` skips the batch being renamed. */
export function validateBatchName(value: string, batches: Batch[], exceptId?: string): string | null {
  const name = value.trim()
  if (!name) return 'Enter a batch name.'
  const clash = batches.find((b) => b.id !== exceptId && b.name.trim().toLowerCase() === name.toLowerCase())
  return clash ? `You already have a batch called "${clash.name}".` : null
}
