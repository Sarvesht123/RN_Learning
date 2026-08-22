import { createContext, PropsWithChildren, useContext, useState } from 'react';

type WishlistValue = { skus: string[]; toggle: (sku: string) => void; has: (sku: string) => boolean };
const WishlistContext = createContext<WishlistValue | null>(null);
export function WishlistProvider({ children }: PropsWithChildren) {
  const [skus, setSkus] = useState<string[]>([]);
  const toggle = (sku: string) => setSkus((current) => current.includes(sku) ? current.filter((item) => item !== sku) : [...current, sku]);
  return <WishlistContext.Provider value={{ skus, toggle, has: (sku) => skus.includes(sku) }}>{children}</WishlistContext.Provider>;
}
export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) throw new Error('useWishlist must be used inside WishlistProvider');
  return value;
}
