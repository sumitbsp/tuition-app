// Batch messages: who gets them, quick templates, and the WhatsApp link.
// Nothing here is stored; a message lives only while the compose screen is open.
import type { Student } from './appData'
import { joinList } from './text'

/** One guardian phone. Siblings who share a number get one message, not one each. */
export type Recipient = {
  phone: string
  guardianName: string | null
  studentNames: string[]
}

const VALID_PHONE = /^[6-9]\d{9}$/

/**
 * `students` in display order. Students who left are left out entirely; students without
 * a usable guardian phone are returned as skipped.
 */
export function batchRecipients(students: Student[]): { recipients: Recipient[]; skipped: Student[] } {
  const byPhone = new Map<string, Recipient>()
  const skipped: Student[] = []
  for (const student of students) {
    if (student.leftOn) continue
    if (!VALID_PHONE.test(student.guardianPhone)) {
      skipped.push(student)
      continue
    }
    const existing = byPhone.get(student.guardianPhone)
    if (existing) {
      existing.studentNames.push(student.name)
      existing.guardianName ??= student.guardianName
    } else {
      byPhone.set(student.guardianPhone, {
        phone: student.guardianPhone,
        guardianName: student.guardianName,
        studentNames: [student.name],
      })
    }
  }
  return { recipients: [...byPhone.values()], skipped }
}

/** "Mrs Mehta", or "Aarav's guardian" when no guardian name was given. */
export function guardianLabel(recipient: Recipient): string {
  return recipient.guardianName ?? `${joinList(recipient.studentNames)}'s guardian`
}

/** "+91 98765 43210" */
export function formatPhone(digits: string): string {
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

/** wa.me link to an Indian (+91) number with the text pre-filled. */
export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`
}

/** Text in [brackets] is for the tutor to replace before sending. */
export const PLACEHOLDER = /\[[^\]]+\]/

export type Template = { id: string; label: string; text: string }

export function messageTemplates(batchName: string, tutorName: string): Template[] {
  const signOff = `\n\nThank you,\n${tutorName}`
  return [
    {
      id: 'cancelled',
      label: 'Class cancelled tomorrow',
      text: `Hello,\n\nThe ${batchName} class is cancelled tomorrow. Classes continue at the usual time after that.${signOff}`,
    },
    {
      id: 'holiday',
      label: 'Holiday notice',
      text: `Hello,\n\nThere will be no ${batchName} class from [date] to [date] for the holiday. Classes start again on [date].${signOff}`,
    },
    {
      id: 'test',
      label: 'Test on…',
      text: `Hello,\n\nThere will be a test for ${batchName} on [date], covering [topics]. Please help your child revise.${signOff}`,
    },
  ]
}
