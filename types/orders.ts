export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Printing'
  | 'Packed'
  | 'Shipped'
  | 'Delayed'
  | 'Delivered'
  | 'Cancelled'

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  note: string | null
  internal_note: string | null
  changed_by: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  shipping_price: number
  customization: Record<string, string>
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  status: OrderStatus
  shipping_address: {
    full_name: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  }
  subtotal: number
  shipping_total: number
  total: number
  tracking_number: string | null
  carrier: string | null
  estimated_delivery: string | null
  delay_reason: string | null
  payment_status: string
  card_last4: string | null
  card_brand: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  order_status_history?: OrderStatusHistory[]
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string
  color: string
  bgColor: string
  icon: string
  description: string
}> = {
  Pending:    { label: 'Order Received', color: 'text-yellow-700',  bgColor: 'bg-yellow-100',  icon: '⏳', description: 'We received your order and are reviewing it.' },
  Processing: { label: 'Processing',     color: 'text-blue-700',    bgColor: 'bg-blue-100',    icon: '🔄', description: 'Your order is being prepared for printing.' },
  Printing:   { label: 'Printing',       color: 'text-purple-700',  bgColor: 'bg-purple-100',  icon: '🖨️', description: 'Your item is being 3D printed right now!' },
  Packed:     { label: 'Packed',         color: 'text-indigo-700',  bgColor: 'bg-indigo-100',  icon: '📦', description: 'Your item is packed and ready to ship.' },
  Shipped:    { label: 'Shipped',        color: 'text-green-700',   bgColor: 'bg-green-100',   icon: '🚚', description: 'Your order is on its way!' },
  Delayed:    { label: 'Delayed',        color: 'text-orange-700',  bgColor: 'bg-orange-100',  icon: '⚠️', description: 'There is a delay with your order.' },
  Delivered:  { label: 'Delivered',      color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: '✅', description: 'Your order has been delivered!' },
  Cancelled:  { label: 'Cancelled',      color: 'text-red-700',     bgColor: 'bg-red-100',     icon: '❌', description: 'This order was cancelled.' },
}

export const STATUS_STEPS: OrderStatus[] = [
  'Pending', 'Processing', 'Printing', 'Packed', 'Shipped', 'Delivered',
]
