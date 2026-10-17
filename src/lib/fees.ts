// Monthly fee status, summaries and WhatsApp reminders.
// Months are "YYYY-MM" strings, which sort and compare correctly as text.
import { dateKey, formatRupees, type AppData, type Payment, type Student } from './appData'
import { formatPhone, whatsappLink } from './messages'

/** Paid: marked paid. Due: unpaid and the due date has arrived. Upcoming: unpaid, due date still ahead. */
export type FeeStatus = 'paid' | 'due' | 'upcoming'

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function currentMonth(): string {
  return monthKey(new Date())
}

export function addMonths(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number)
  return monthKey(new Date(year, m - 1 + delta, 1))
}

const longMonth = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })
const shortMonth = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' })

/** "2026-10" → "October 2026" */
export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  return longMonth.format(new Date(year, m - 1, 1))
}

/** "2026-10" → "Oct 2026" (UPI notes have a short length limit). */
export function formatMonthShort(month: string): string {
  const [year, m] = month.split('-').map(Number)
  return shortMonth.format(new Date(year, m - 1, 1))
}

/** A student's first fee month is the month they joined. */
export function startMonth(student: Student): string {
  return student.joinedOn.slice(0, 7)
}

/** The student's due date in a month; a due day past the month's end falls on its last day. */
export function dueDate(student: Student, month: string): Date {
  const [year, m] = month.split('-').map(Number)
  const lastDay = new Date(year, m, 0).getDate()
  return new Date(year, m - 1, Math.min(student.feeDueDay, lastDay))
}

const dueShort = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const dueLong = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long' })

/** "10 Oct" */
export function formatDueShort(date: Date): string {
  return dueShort.format(date)
}

/** "10 October" */
export function formatDueLong(date: Date): string {
  return dueLong.format(date)
}

/** From the joining month through the month they left (inclusive), so a last fee can still be collected. */
export function isEnrolled(student: Student, month: string): boolean {
  return startMonth(student) <= month && (!student.leftOn || month <= student.leftOn.slice(0, 7))
}

/** The month arrows run from the earliest join month up to the current month. */
export function monthRange(data: AppData): { first: string; last: string } {
  const last = currentMonth()
  const starts = data.students.map(startMonth)
  const first = starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : last
  return { first: first < last ? first : last, last }
}

export function paymentFor(payments: Payment[], studentId: string, month: string): Payment | undefined {
  return payments.find((p) => p.studentId === studentId && p.month === month)
}

/** `today` is "YYYY-MM-DD"; a fee due today counts as due. */
export function feeStatus(data: AppData, student: Student, month: string, today = dateKey(new Date())): FeeStatus {
  if (paymentFor(data.payments, student.id, month)) return 'paid'
  return dateKey(dueDate(student, month)) <= today ? 'due' : 'upcoming'
}

export type MonthSummary = {
  collected: number
  due: number
  upcoming: number
  paidCount: number
  dueCount: number
  upcomingCount: number
}

export function summarizeMonth(data: AppData, month: string): MonthSummary {
  const summary: MonthSummary = { collected: 0, due: 0, upcoming: 0, paidCount: 0, dueCount: 0, upcomingCount: 0 }
  const today = dateKey(new Date())
  for (const student of data.students) {
    if (!isEnrolled(student, month)) continue
    const payment = paymentFor(data.payments, student.id, month)
    if (payment) {
      summary.collected += payment.amount
      summary.paidCount += 1
    } else if (feeStatus(data, student, month, today) === 'due') {
      summary.due += student.monthlyFee
      summary.dueCount += 1
    } else {
      summary.upcoming += student.monthlyFee
      summary.upcomingCount += 1
    }
  }
  return summary
}

/** Earliest due date first; same-day ties go by name. */
export function byDueDate(month: string) {
  return (a: Student, b: Student) =>
    dueDate(a, month).getTime() - dueDate(b, month).getTime() ||
    a.name.localeCompare(b.name, 'en-IN', { sensitivity: 'base' })
}

// --- Reminders ---------------------------------------------------------------

/** upi://pay deep link (NPCI spec): payee address, name, amount, currency, note. */
export function upiPayLink(upiId: string, payeeName: string, amount: number, note: string): string {
  const params = [
    ['pa', upiId],
    ['pn', payeeName],
    ['am', String(amount)],
    ['cu', 'INR'],
    ['tn', note],
  ]
  return `upi://pay?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`
}

export const REMINDER_PLACEHOLDERS = [
  'guardianName',
  'studentName',
  'month',
  'amount',
  'dueDate',
  'tutorName',
  'tutorPhone',
] as const

export type ReminderPlaceholder = (typeof REMINDER_PLACEHOLDERS)[number]

/** One sentence that reads right for both due and upcoming fees. */
export const DEFAULT_REMINDER = `Hello {guardianName},

This is a reminder that {studentName}'s tuition fee of {amount} for {month} is due on {dueDate}.

Thank you,
{tutorName}
{tutorPhone}`

/** {name} tokens that aren't placeholders, e.g. a typo like {studentname}. */
export function unknownPlaceholders(template: string): string[] {
  const found = template.match(/\{[^{}\s]+\}/g) ?? []
  const known = new Set<string>(REMINDER_PLACEHOLDERS)
  return [...new Set(found)].filter((token) => !known.has(token.slice(1, -1)))
}

export type UpiPayment = { upiId: string; payeeName: string; amount: number; note: string }

/**
 * Fills a reminder template. A missing guardian name drops the placeholder and the space
 * before it ("Hello {guardianName}," → "Hello,"). With a UPI ID, the payment link is added
 * at the end, so the tutor never has to include it.
 */
export function fillReminder(
  template: string,
  values: Record<ReminderPlaceholder, string | null>,
  upi: UpiPayment | null,
): string {
  let text = template
  for (const key of REMINDER_PLACEHOLDERS) {
    const value = values[key]
    // A function replacement, so a "$&" typed in a name isn't read as a pattern.
    text =
      value === null
        ? text.replace(new RegExp(`[ \\t]?\\{${key}\\}`, 'g'), '')
        : text.replaceAll(`{${key}}`, () => value)
  }
  text = text.trimEnd()
  if (upi) text += `\n\nYou can pay by UPI here:\n${upiPayLink(upi.upiId, upi.payeeName, upi.amount, upi.note)}`
  return text
}

export function reminderMessage(data: AppData, student: Student, month: string): string {
  const { tutor } = data
  const upi = tutor.upiId
    ? {
        upiId: tutor.upiId,
        payeeName: tutor.name,
        amount: student.monthlyFee,
        note: `${student.name} ${formatMonthShort(month)} fee`,
      }
    : null
  return fillReminder(
    data.settings.reminderTemplate ?? DEFAULT_REMINDER,
    {
      guardianName: student.guardianName,
      studentName: student.name,
      month: formatMonth(month),
      amount: formatRupees(student.monthlyFee),
      dueDate: formatDueLong(dueDate(student, month)),
      tutorName: tutor.name,
      tutorPhone: formatPhone(tutor.phone),
    },
    upi,
  )
}

/** wa.me link to the guardian (India, +91) with the reminder pre-filled. */
export function whatsappReminderLink(data: AppData, student: Student, month: string): string {
  return whatsappLink(student.guardianPhone, reminderMessage(data, student, month))
}
