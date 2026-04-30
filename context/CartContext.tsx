import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { Product, CartItem } from '@/types'

interface CartState { items: CartItem[] }

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number; customization?: Record<string, string> }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; items: CartItem[] }

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  shippingTotal: number
  total: number
  addItem: (product: Product, quantity?: number, customization?: Record<string, string>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items }

    case 'ADD_ITEM': {
      const existing = state.items.findIndex(i => i.product.id === action.product.id)
      if (existing >= 0) {
        const updated = [...state.items]
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + action.quantity,
        }
        return { items: updated }
      }
      return {
        items: [...state.items, {
          product: action.product,
          quantity: action.quantity,
          customization: action.customization || {},
        }],
      }
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.product.id !== action.productId) }

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) return { items: state.items.filter(i => i.product.id !== action.productId) }
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      }
    }

    case 'CLEAR_CART':
      return { items: [] }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slime-cart')
      if (saved) {
        const items = JSON.parse(saved) as CartItem[]
        if (Array.isArray(items) && items.length > 0) {
          dispatch({ type: 'HYDRATE', items })
        }
      }
    } catch { /* ignore */ }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('slime-cart', JSON.stringify(state.items))
    } catch { /* ignore */ }
  }, [state.items])

  const addItem = (product: Product, quantity = 1, customization?: Record<string, string>) => {
    dispatch({ type: 'ADD_ITEM', product, quantity, customization })
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  const removeItem = (productId: string) => dispatch({ type: 'REMOVE_ITEM', productId })

  const updateQuantity = (productId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity })

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const itemCount    = state.items.reduce((s, i) => s + i.quantity, 0)
  const subtotal     = state.items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shippingTotal = state.items.reduce((s, i) => Math.max(s, i.product.shipping_price || 0), 0)
  const total        = subtotal + shippingTotal

  return (
    <CartContext.Provider value={{
      items: state.items, itemCount, subtotal, shippingTotal, total,
      addItem, removeItem, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
