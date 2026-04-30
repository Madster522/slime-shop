export const ADMIN_EMAILS = [
  'zach17732@gmail.com',
  'slimestudio04@gmail.com',
  'charlieslimestudios@gmail.com',
]

export const SUPPORT_EMAILS = {
  primary:   'slimestudio04@gmail.com',
  secondary: 'charlieslimestudios@gmail.com',
}

export const DISCORD_LINKS = {
  joinServer:   'https://discord.gg/slimeshop',
  orderSupport: 'https://discord.gg/slimeshop-support',
  community:    'https://discord.gg/slimeshop-community',
}

export const ORDER_STATUSES = [
  'Pending', 'Processing', 'Printing', 'Packed',
  'Shipped', 'Delayed', 'Delivered', 'Cancelled',
] as const
export type OrderStatus = typeof ORDER_STATUSES[number]

export const PRINTER_STATUSES = ['idle','printing','error','offline','unknown'] as const
export type PrinterStatus = typeof PRINTER_STATUSES[number]

export const PRIORITY_LEVELS = ['Low','Normal','High','Urgent'] as const
export type PriorityLevel = typeof PRIORITY_LEVELS[number]

export const ALERT_TYPES = [
  'spaghetti_failure','timing_overrun','failed_print',
  'idle_too_long','job_overrun','maintenance_needed',
  'temperature_anomaly','queue_backlog',
] as const
export type AlertType = typeof ALERT_TYPES[number]

export const SITE_CONFIG = {
  name:        'Slime Shop',
  tagline:     'Custom 3D Printed Slime Goodies 🟢',
  description: 'Handcrafted 3D printed slime-themed products.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export const SHIPPING_CONFIG = {
  freeShippingThreshold: 30,
  defaultShipping: 4,
  expressShipping: 12,
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:    'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Printing:   'bg-purple-100 text-purple-800',
  Packed:     'bg-indigo-100 text-indigo-800',
  Shipped:    'bg-green-100 text-green-800',
  Delayed:    'bg-orange-100 text-orange-800',
  Delivered:  'bg-emerald-100 text-emerald-800',
  Cancelled:  'bg-red-100 text-red-800',
}
