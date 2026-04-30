export type StockStatus = 'in_stock' | 'out_of_stock' | 'made_to_order'

export interface CustomizationOption {
  id: string
  name: string
  type: 'color' | 'text' | 'select'
  options?: string[]
  required: boolean
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
  stock_status: StockStatus
  is_active: boolean
  is_featured: boolean
  has_customization: boolean
  customization_options: CustomizationOption[]
  estimated_print_minutes: number
  created_at: string
  updated_at: string
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock:      '✅ In Stock',
  out_of_stock:  '❌ Out of Stock',
  made_to_order: '🖨️ Made to Order',
}

export const PRODUCT_CATEGORIES = [
  'Keychains',
  'Figures',
  'Home Decor',
  'Accessories',
  'Other',
] as const
