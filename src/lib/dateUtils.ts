export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(str: string): Date {
  const [year, month, day] = str.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

export function getDaysAgo(n: number): Date {
  const d = localMidnight(new Date())
  d.setDate(d.getDate() - n)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getDateRange(start: Date, end: Date): Date[] {
  const result: Date[] = []
  const cur = localMidnight(start)
  const last = localMidnight(end)

  while (cur <= last) {
    result.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

function localMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

export function daysBetween(a: Date, b: Date): number {
  const msA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const msB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.abs(Math.round((msB - msA) / 86_400_000))
}
