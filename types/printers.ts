export type PrinterConnectionType = 'octoprint' | 'bambu' | 'usb' | 'network'
export type PrinterStatus = 'idle' | 'printing' | 'error' | 'offline' | 'unknown'

export interface Printer {
  id: string
  name: string
  type: string
  connection_type: PrinterConnectionType
  ip_address: string | null
  port: number | null
  api_key: string | null
  access_code: string | null
  serial_number: string | null
  status: PrinterStatus
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PrinterStatusResponse {
  online: boolean
  status: PrinterStatus
  job?: {
    name: string
    progress: number
    time_elapsed: number
    time_remaining: number
  } | null
  temperatures?: {
    bed: number
    hotend: number
  }
  error?: string
}
