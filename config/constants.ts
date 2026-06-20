export const SITE_NAME = 'Slime Shop'
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const OrderStatus = {
  Pending: 'Pending',
  Processing: 'Processing',
  Printing: 'Printing',
  Packed: 'Packed',
  Shipped: 'Shipped',
  Delayed: 'Delayed',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
} as const

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]

export const PrinterStatus = {
  Online: 'Online',
  Offline: 'Offline',
  Printing: 'Printing',
  Idle: 'Idle',
  Maintenance: 'Maintenance',
  Error: 'Error',
} as const

export type PrinterStatus = typeof PrinterStatus[keyof typeof PrinterStatus]

export const AlertType = {
  Info: 'info',
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
} as const

export type AlertType = typeof AlertType[keyof typeof AlertType]

export const PriorityLevel = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
} as const

export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel]

// Put your real admin email here. Anyone in this list can access /admin.
export const ADMIN_EMAILS = [
  'jenn33967@gmail.com'
]
