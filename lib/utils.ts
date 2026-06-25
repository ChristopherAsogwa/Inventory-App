import dayjs from 'dayjs'

export const formatCurrency = (value: number, currency = 'NGN'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return value.toFixed(2)
  }
}

export const formatDate = (value?: string | Date): string => {
  if (!value) return 'Not provided'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('MM/DD/YYYY') : 'Not provided'
}

export const formatDateTime = (value?: string | Date): string => {
  if (!value) return 'Not provided'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('MM/DD/YYYY h:mm A') : 'Not provided'
}

export const formatRelativeDate = (value?: string | Date): string => {
  if (!value) return ''
  const parsed = dayjs(value)
  if (!parsed.isValid()) return ''
  const now = dayjs()
  if (parsed.isSame(now, 'day')) return 'Today'
  if (parsed.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday'
  return parsed.format('MMM D, YYYY')
}

export const isLowStock = (quantity: number, threshold: number): boolean =>
  quantity <= threshold

export const isOutOfStock = (quantity: number): boolean => quantity <= 0
