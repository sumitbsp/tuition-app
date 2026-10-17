// Small text helpers shared by the forms.

/** Joins ids for aria-describedby, skipping empty ones. */
export function describedBy(...ids: (string | false | null | undefined)[]) {
  const value = ids.filter(Boolean).join(' ')
  return value || undefined
}

export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}
