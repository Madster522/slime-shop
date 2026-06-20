export type CustomizationSchema = {
  allow_text?: boolean
  allow_color?: boolean
  allow_size?: boolean
}

export type Product = {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  image_url?: string | null
  category?: string | null
  is_active?: boolean
  is_featured?: boolean
  is_customizable?: boolean
  customization_schema?: CustomizationSchema
  created_at?: string
  updated_at?: string
}

export type CartCustomization = {
  text?: string
  color?: string
  size?: string
}

export type CartItem = {
  product: Product
  quantity: number
  customization?: CartCustomization
}

export type AppliedCoupon = {
  code: string
  type: 'percent' | 'fixed'
  value: number
  discount: number
  total: number
  subtotal: number
}
