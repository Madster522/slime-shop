import { useState, useEffect } from 'react'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('slime-wishlist')
      if (saved) setWishlist(JSON.parse(saved))
    } catch { /* */ }
  }, [])

  const save = (list: string[]) => {
    setWishlist(list)
    try { localStorage.setItem('slime-wishlist', JSON.stringify(list)) } catch { /* */ }
  }

  const toggle = (productId: string) => {
    const next = wishlist.includes(productId) ? wishlist.filter(id => id !== productId) : [...wishlist, productId]
    save(next)
    return !wishlist.includes(productId) // returns true if added
  }

  const isWishlisted = (productId: string) => wishlist.includes(productId)

  return { wishlist, toggle, isWishlisted, count: wishlist.length }
}
