import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { Product } from '@/data/products';
export type CartItem = Product & { quantity: number };
type Value = {
  items: CartItem[];
  addItem: (product: Product) => void;
  changeQuantity: (sku: string, amount: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
};
const CartContext = createContext<Value | null>(null);
export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = (product: Product) =>
    setItems((current) => {
      const found = current.find((item) => item.sku === product.sku);
      return found
        ? current.map((item) =>
            item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...current, { ...product, quantity: 1 }];
    });
  const changeQuantity = (sku: string, amount: number) =>
    setItems((current) =>
      current.map((item) =>
        item.sku === sku ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item,
      ),
    );
  const removeItem = (sku: string) =>
    setItems((current) => current.filter((item) => item.sku !== sku));
  return (
    <CartContext.Provider value={{ items, addItem, changeQuantity, removeItem, clearCart: () => setItems([]) }}>
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
