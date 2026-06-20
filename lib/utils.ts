export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatDollars(amount: number | string | null | undefined): string {
  const value = typeof amount === 'string' ? Number(amount) : amount ?? 0

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(value) ? value : 0)
}

export function timeAgo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'Unknown time'

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (!Number.isFinite(seconds)) return 'Unknown time'
  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`

  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'Unknown date'

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatMinutes(minutesInput: number | string | null | undefined): string {
  const minutes = typeof minutesInput === 'string' ? Number(minutesInput) : minutesInput ?? 0

  if (!Number.isFinite(minutes)) return '0 min'

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'}`
  }

  return `${hours} hr${hours === 1 ? '' : 's'} ${remainingMinutes} min`
}

export function safeMoney(value: number) {
  return Math.round(Math.max(0, value) * 100) / 100
}
