import { OrderStatus, PrinterStatus, AlertType, PriorityLevel } from '@/config/constants'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  shipping_price: number
  images: string[]
  category: string
  stock_status: 'in_stock' | 'out_of_stock' | 'made_to_order'
  is_active: boolean
  is_featured: boolean
  has_customization: boolean
  customization_options: CustomizationOption[]
  estimated_print_minutes: number
  created_at: string
  updated_at: string
}

export interface CustomizationOption {
  id: string
  name: string
  type: 'color' | 'text' | 'select'
  options?: string[]
  required: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  customization?: Record<string, string>
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  status: OrderStatus
  shipping_address: ShippingAddress
  billing_address?: ShippingAddress
  subtotal: number
  shipping_total: number
  total: number
  tracking_number?: string
  carrier?: string
  estimated_delivery?: string
  delay_reason?: string
  payment_status: string
  card_last4?: string
  card_brand?: string
  square_payment_id?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  order_status_history?: OrderStatusHistory[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  shipping_price: number
  customization: Record<string, string>
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  note?: string
  internal_note?: string
  changed_by?: string
  created_at: string
}

export interface ShippingAddress {
  full_name: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export interface Printer {
  id: string
  name: string
  type: string
  connection_type: 'octoprint' | 'bambu' | 'usb' | 'network'
  ip_address?: string
  port?: number
  api_key?: string
  access_code?: string
  serial_number?: string
  status: PrinterStatus
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface PrintJob {
  id: string
  order_id?: string
  printer_id?: string
  product_name: string
  customization: Record<string, string>
  status: string
  queue_position?: number
  started_at?: string
  completed_at?: string
  estimated_minutes: number
  failure_reason?: string
  retry_count: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface AIAlert {
  id: string
  printer_id?: string
  type: AlertType
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  suggestion?: string
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  created_at: string
}

export interface GCodeFile {
  id: string
  original_name: string
  file_size: number
  printer_id?: string
  order_id?: string
  status: 'uploaded' | 'queued' | 'printing' | 'done' | 'failed'
  estimated_time: number
  layer_count: number
  filament_usage: number
  warnings: string[]
  created_at: string
}

export interface BugReport {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  status: 'open' | 'in_progress' | 'fixed' | 'wont_fix'
  reported_by: string
  page_url?: string
  steps_to_reproduce?: string
  expected_behavior?: string
  actual_behavior?: string
  fixed_by?: string
  fixed_at?: string
  fix_notes?: string
  created_at: string
  updated_at: string
}
