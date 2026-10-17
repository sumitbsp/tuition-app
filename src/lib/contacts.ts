// Contact Picker API (Chrome on Android). Not in TypeScript's DOM types yet, so the
// small slice used here is typed locally. iPhone browsers don't offer it.
import { normalizePhone, validatePhone } from './appData'

type ContactInfo = { name?: string[]; tel?: string[] }

type ContactsManager = {
  select: (properties: ('name' | 'tel')[], options?: { multiple?: boolean }) => Promise<ContactInfo[]>
}

export function contactPickerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window
}

export type PickedContact =
  | { kind: 'cancelled' }
  | { kind: 'invalid' }
  | { kind: 'picked'; phone: string; name: string | null }

/** "+91 98765-43210", "(098765) 43210", "0091 98765 43210" → "9876543210", or null when not a valid mobile. */
export function cleanContactPhone(value: string): string | null {
  let digits = value.replace(/\D/g, '')
  if (digits.length === 14 && digits.startsWith('0091')) digits = digits.slice(4)
  digits = normalizePhone(digits)
  return validatePhone(digits) === null ? digits : null
}

/**
 * Opens the picker for one contact. A cancel, or a picker that fails (no permission,
 * already open), comes back as "cancelled": the form shows no error for either.
 * A contact with several numbers uses the first valid mobile.
 */
export async function pickGuardianContact(): Promise<PickedContact> {
  const contacts = (navigator as Navigator & { contacts?: ContactsManager }).contacts
  if (!contacts) return { kind: 'cancelled' }
  let picked: ContactInfo[]
  try {
    picked = await contacts.select(['name', 'tel'], { multiple: false })
  } catch {
    return { kind: 'cancelled' }
  }
  const contact = picked[0]
  if (!contact) return { kind: 'cancelled' }
  const phone = (contact.tel ?? []).map(cleanContactPhone).find((p): p is string => p !== null)
  if (!phone) return { kind: 'invalid' }
  const name = contact.name?.map((n) => n.trim()).find(Boolean) ?? null
  return { kind: 'picked', phone, name }
}
