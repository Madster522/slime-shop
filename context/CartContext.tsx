import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AppliedCoupon, CartCustomization, CartItem, Product } from '@/types/shop'
import { safeMoney } from '@/lib/utils'

type CartContextValue = {
  items: CartItem[]
  coupon: AppliedCoupon | null
  subtotal: number
  discount: number
  total: number
  count: number
  addItem: (product: Product, quantity?: number, customization?: CartCustomization) => void
  updateQuantity: (id: string, quantity: number, customizationKey?: string) => void
  removeItem: (id: string, customizationKey?: string) => void
  clearCart: () => void
  setCoupon: (coupon: AppliedCoupon | null) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function customizationKey(customization?: CartCustomization) {
  return JSON.stringify(customization || {})
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [coupon, setCouponState] = useState<AppliedCoupon | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('slime-cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('slime-cart', JSON.stringify(items))
  }, [items])

  const subtotal = useMemo(() => safeMoney(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)), [items])
  const discount = useMemo(() => safeMoney(Math.min(coupon?.discount || 0, subtotal)), [coupon, subtotal])
  const total = useMemo(() => safeMoney(subtotal - discount), [subtotal, discount])
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  function addItem(product: Product, quantity = 1, customization?: CartCustomization) {
    setItems(current => {
      const key = customizationKey(customization)
      const existingIndex = current.findIndex(item => item.product.id === product.id && customizationKey(item.customization) === key)
      if (existingIndex >= 0) {
        return current.map((item, index) => index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item)
      }
      return [...current, { product, quantity, customization }]
    })
    setCouponState(null)
  }

  function updateQuantity(id: string, quantity: number, key?: string) {
    if (quantity <= 0) return removeItem(id, key)
    setItems(current => current.map(item => {
      const itemKey = customizationKey(item.customization)
      return item.product.id === id && (!key || key === itemKey) ? { ...item, quantity } : item
    }))
    setCouponState(null)
  }

  function removeItem(id: string, key?: string) {
    setItems(current => current.filter(item => !(item.product.id === id && (!key || customizationKey(item.customization) === key))))
    setCouponState(null)
  }

  function clearCart() {
    setItems([])
    setCouponState(null)
  }

  return (
    <CartContext.Provider value={{ items, coupon, subtotal, discount, total, count, addItem, updateQuantity, removeItem, clearCart, setCoupon: setCouponState }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}

export function getCustomizationKey(customization?: CartCustomization) {
  return customizationKey(customization)
}
